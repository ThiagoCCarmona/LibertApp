import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Upload } from "lucide-react";
import { sendNativeMessage } from "../../services/nativeBridge";
import { DEFAULT_AVATARS, DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";

export function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    location: "",
  });

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR_URL);
  const [saved, setSaved] = useState(false);
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
          setFormData({
            fullName: u.nome || u.Nome || "",
            email: u.email || u.Email || "",
            phone: u.telefone || u.Telefone || "",
            cpf: u.cpf || u.Cpf || "",
            location: u.localizacao || u.Localizacao || "Comunidade Carmelita",
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await sendNativeMessage("UPDATE_PROFILE", {
        nome: formData.fullName,
        email: formData.email,
        telefone: formData.phone,
        cpf: formData.cpf,
        localizacao: formData.location,
        fotoUrl: avatarUrl,
      });

      // Atualiza também o cache local
      const cur = localStorage.getItem("currentUser");
      if (cur) {
        const u = JSON.parse(cur);
        u.nome = formData.fullName;
        u.email = formData.email;
        u.telefone = formData.phone;
        u.cpf = formData.cpf;
        u.localizacao = formData.location;
        u.fotoUrl = avatarUrl;
        localStorage.setItem("currentUser", JSON.stringify(u));
      }
    } catch (err) {
      console.warn("Erro ao atualizar perfil no backend:", err);
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
            aria-label="Voltar"
          >
            <ChevronLeft size={24} color="#2D3A2E" />
          </button>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", margin: 0 }}>
            Editar Perfil
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
              onClick={() => fileInputRef.current?.click()}
              title="Fazer upload de foto"
              aria-label="Fazer upload de foto de perfil"
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
            Escolha um ícone acima ou toque no botão preto para enviar foto
          </p>
        </div>

        {/* Form fields */}
        <div className="px-6 pb-6 space-y-4">
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              Nome Completo
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
              placeholder="Nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              E-mail
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
              placeholder="E-mail"
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              Telefone
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
              CPF
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
              Localização Padrão
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
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
              placeholder="Cidade, Estado"
            />
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
          {saved ? "✓ Salvo com sucesso!" : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}
