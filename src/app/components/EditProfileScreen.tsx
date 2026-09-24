import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Upload, MapPin, Loader2, Camera, Image as ImageIcon } from "lucide-react";
import { sendNativeMessage, isMauiHybrid, getCurrentLocation, requestLocationPermission, pickNativeImage } from "../../services/nativeBridge";
import { apiService } from "../../services/apiService";
import { DEFAULT_AVATARS, DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";
import { useTranslation } from "../../i18n";

export function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    location: "",
  });

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR_URL);
  const [userId, setUserId] = useState<number>(0);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        let u: any = null;
        try {
          const stored = localStorage.getItem("currentUser");
          if (stored) u = JSON.parse(stored);
        } catch {}

        if (!u) {
          u = await sendNativeMessage<any>("GET_CURRENT_USER");
        }

        if (isMounted && u) {
          if (u.id) setUserId(u.id);
          setFormData({
            fullName: u.nome || u.Nome || "",
            email: u.email || u.Email || "",
            phone: u.telefone || u.Telefone || "",
            cpf: u.cpf || u.Cpf || "",
            location: u.localizacao || u.Localizacao || "",
          });
          if (u.fotoUrl || u.FotoUrl) {
            setAvatarUrl(u.fotoUrl || u.FotoUrl);
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar usuário em EditProfileScreen:", err);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) => {
          if (p3) return `(${p1}) ${p2}-${p3}`;
          if (p2) return `(${p1}) ${p2}`;
          if (p1) return `(${p1}`;
          return match;
        });
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, (match, p1, p2, p3, p4) => {
          if (p4) return `${p1}.${p2}.${p3}-${p4}`;
          if (p3) return `${p1}.${p2}.${p3}`;
          if (p2) return `${p1}.${p2}`;
          if (p1) return `${p1}`;
          return match;
        });
    }
    return value;
  };

  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const size = 360;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(e.target?.result as string);

          // Recorte quadrado centralizado
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUseCurrentLocation = async () => {
    setLocationError(null);
    setIsLocating(true);

    try {
      let coords: { latitude: number; longitude: number } | null = null;

      // 1. Tenta obter coordenadas diretamente pelo bridge nativo do MAUI
      if (isMauiHybrid()) {
        try {
          coords = await getCurrentLocation();
        } catch (e: any) {
          console.warn("Bridge nativo de localização falhou, tentando fallback web:", e);
        }
      }

      // 2. Se não estiver no MAUI ou falhou, tenta HTML5 Geolocation padrão
      if (!coords) {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          setLocationError("Geolocalização não é suportada neste dispositivo.");
          setIsLocating(false);
          return;
        }

        coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
          );
        });
      }

      // 3. Consulta reversa de cidade/estado com múltiplos provedores
      let partes: string[] = [];

      // Provedor 1: BigDataCloud
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=pt`
        );
        if (res.ok) {
          const data = await res.json();
          const cidade = data.city || data.locality || data.principalSubdivision || "";
          const estado = data.principalSubdivision || "";
          const pais = data.countryName || "";
          partes = [cidade, estado, pais].filter(Boolean);
        }
      } catch {}

      // Provedor 2: OpenStreetMap Nominatim
      if (partes.length === 0) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=pt`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cidade = addr.city || addr.town || addr.municipality || addr.village || "";
            const estado = addr.state || "";
            const pais = addr.country || "";
            partes = [cidade, estado, pais].filter(Boolean);
          }
        } catch {}
      }

      if (partes.length === 0) {
        handleChange("location", `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        return;
      }

      handleChange("location", partes.join(", "));
    } catch (err: any) {
      console.warn("Erro ao obter localização:", err);
      if (err?.code === 1 || err?.message?.includes("negada") || err?.message?.includes("denied")) {
        setLocationError("Permissão de localização negada pelo dispositivo. Digite sua cidade manualmente.");
      } else {
        setLocationError("Não foi possível obter sua localização agora. Digite manualmente.");
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handlePhotoClick = () => {
    setPhotoModalOpen(true);
  };

  const handlePickFromCamera = async () => {
    setPhotoModalOpen(false);
    if (isMauiHybrid()) {
      try {
        const nativePhoto = await pickNativeImage(true);
        if (nativePhoto?.dataUrl) {
          setAvatarUrl(nativePhoto.dataUrl);
          return;
        }
      } catch (err) {
        console.warn("Captura da câmera cancelada ou erro:", err);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handlePickFromGallery = async () => {
    setPhotoModalOpen(false);
    if (isMauiHybrid()) {
      try {
        const nativePhoto = await pickNativeImage(false);
        if (nativePhoto?.dataUrl) {
          setAvatarUrl(nativePhoto.dataUrl);
          return;
        }
      } catch (err) {
        console.warn("Seleção de galeria cancelada ou erro:", err);
      }
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    try {
      setIsUploading(true);
      const compressed = await compressAvatar(file);
      setAvatarUrl(compressed);
    } catch (err) {
      console.warn("Erro ao processar foto de perfil:", err);
      alert("Não foi possível carregar a imagem.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!userId) {
      console.warn("EditProfileScreen: usuário ainda não carregado, cancelando salvamento.");
      return;
    }
    try {
      // 1. Salva na API Central
      try {
        await apiService.updateProfile({
          id: userId,
          nome: formData.fullName,
          telefone: formData.phone,
          cpf: formData.cpf,
          localizacao: formData.location,
          fotoUrl: avatarUrl,
        });
      } catch (apiErr) {
        console.warn("API indisponível para updateProfile, tentando bridge nativo:", apiErr);
      }

      // 2. Tenta Bridge nativo
      try {
        await sendNativeMessage("UPDATE_PROFILE", {
          nome: formData.fullName,
          email: formData.email,
          telefone: formData.phone,
          cpf: formData.cpf,
          localizacao: formData.location,
          fotoUrl: avatarUrl,
        });
      } catch {}

      // 3. Atualiza cache local
      const cur = localStorage.getItem("currentUser");
      let u: any = {};
      if (cur) u = JSON.parse(cur);
      u.nome = formData.fullName;
      u.email = formData.email;
      u.telefone = formData.phone;
      u.cpf = formData.cpf;
      u.localizacao = formData.location;
      u.fotoUrl = avatarUrl;
      localStorage.setItem("currentUser", JSON.stringify(u));

      // 4. Notifica todas as telas abertas em tempo real
      window.dispatchEvent(new CustomEvent("user_profile_updated", { detail: u }));
    } catch (err) {
      console.warn("Erro ao atualizar perfil:", err);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header with back button */}
        <div className="px-6 pt-4 pb-4 flex items-center gap-4">
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={t("profile_refresh")}
          >
            <ChevronLeft size={24} color="#2D3A2E" />
          </button>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", margin: 0 }}>
            {t("edit_screen_title")}
          </h1>
        </div>

        {/* Avatar section */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#F5EFE3",
                overflow: "hidden",
                border: "3px solid #D68C70",
                boxShadow: "0 4px 12px rgba(214,140,112,0.25)",
              }}
            >
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <button
              type="button"
              onClick={handlePhotoClick}
              title={t("edit_change_photo")}
              aria-label={t("edit_change_photo")}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#2D3A2E",
                color: "#FDFBF7",
                border: "2px solid #FDFBF7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Upload size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: "none" }}
              aria-hidden="true"
            />
          </div>

          {/* Lista de ícones padrão */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, maxWidth: "100%", alignItems: "center" }}>
            {DEFAULT_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setAvatarUrl(av.url)}
                title={av.name}
                aria-label={av.name}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: avatarUrl === av.url ? "3px solid #D68C70" : "2px solid transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  transform: avatarUrl === av.url ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s ease, border 0.15s ease",
                  padding: 0,
                  background: "transparent",
                }}
              >
                <img src={av.url} alt={av.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 4 }}>
            {t("auth_upload_custom_photo")}
          </p>
        </div>

        {/* Form fields */}
        <div className="px-6 pb-6 space-y-4">
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("edit_fullname")}
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder={t("edit_fullname")}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("edit_email")}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder={t("edit_email")}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("edit_phone")}
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          {/* CPF */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("edit_cpf")}
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="XXX.XXX.XXX-XX"
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("edit_city")}
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => {
                  setLocationError(null);
                  handleChange("location", e.target.value);
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "12px 14px",
                  border: "1px solid rgba(45,58,46,0.12)",
                  borderRadius: 12,
                  background: "#F5EFE3",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                }}
                placeholder={t("edit_city")}
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                title={t("edit_detect_location")}
                aria-label={t("edit_detect_location")}
                style={{
                  flexShrink: 0,
                  width: 44,
                  border: "1px solid rgba(45,58,46,0.12)",
                  borderRadius: 12,
                  background: "#2D3A2E",
                  color: "#FDFBF7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isLocating ? "default" : "pointer",
                  opacity: isLocating ? 0.7 : 1,
                }}
              >
                {isLocating ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <MapPin size={17} />
                )}
              </button>
            </div>
            <p style={{ fontSize: 11, color: locationError ? "#C44F35" : "#7A8A7B", marginTop: 6 }}>
              {locationError || t("edit_detect_location")}
            </p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "14px",
            background: saved
              ? "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)"
              : "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
            border: "none",
            borderRadius: 12,
            color: "#FDFBF7",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.3s",
            boxShadow: saved
              ? "0 8px 24px rgba(45,58,46,0.25)"
              : "0 8px 24px rgba(214,140,112,0.3)",
          }}
        >
          {saved ? t("edit_success") : t("edit_save_btn")}
        </button>
      </div>
      {/* Modal de Escolha da Foto (Câmera ou Galeria) */}
      {photoModalOpen && (
        <div
          onClick={() => setPhotoModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(45, 58, 46, 0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FDFBF7",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px)) 20px",
              boxShadow: "0 -8px 32px rgba(45, 58, 46, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(45,58,46,0.2)", margin: "0 auto 12px" }} />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#2D3A2E", margin: 0 }}>
                {t("profile_photo_modal_title")}
              </h3>
              <p style={{ fontSize: 12, color: "#7A8A7B", marginTop: 4, margin: 0 }}>
                {t("profile_photo_modal_sub")}
              </p>
            </div>

            <button
              onClick={handlePickFromCamera}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(45,58,46,0.08)",
                background: "#F5EFE3",
                color: "#2D3A2E",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(214,140,112,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={18} color="#D68C70" />
              </div>
              <span>{t("profile_photo_camera")}</span>
            </button>

            <button
              onClick={handlePickFromGallery}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(45,58,46,0.08)",
                background: "#F5EFE3",
                color: "#2D3A2E",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(107,143,109,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={18} color="#6B8F6D" />
              </div>
              <span>{t("profile_photo_gallery")}</span>
            </button>

            <button
              onClick={() => setPhotoModalOpen(false)}
              style={{
                marginTop: 4,
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "#7A8A7B",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t("profile_photo_cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
