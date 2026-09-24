import { useState, useRef } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import type { Screen } from "../App";
import { libertAppLogo } from "../../assets/logo";
import { DEFAULT_AVATARS, DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";
import { useTranslation } from "../../i18n";

const LibertLogo = () => (
  <img
    src={libertAppLogo}
    alt="LibertApp logo"
    width={96}
    height={96}
    style={{ objectFit: "contain" }}
  />
);

// StatusBar is rendered centrally in App.tsx to avoid duplication

const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
  <label className="flex items-start justify-between gap-3 cursor-pointer group">
    <div className="flex-1 min-w-0">
      <p style={{ color: "#2D3A2E", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{label}</p>
      <p style={{ color: "#7A8A7B", fontSize: 12, fontWeight: 400, lineHeight: 1.4, marginTop: 2 }}>{description}</p>
    </div>
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={e => { if (e.key === " " || e.key === "Enter") onChange(!checked); }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? "#D68C70" : "#C4B89A",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s ease",
        cursor: "pointer",
        outline: "none",
        marginTop: 2,
      }}
      aria-label={label}
    >
      <div style={{
        position: "absolute",
        top: 3,
        left: checked ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#FDFBF7",
        boxShadow: "0 1px 4px rgba(45,58,46,0.18)",
        transition: "left 0.2s ease",
      }} />
    </div>
  </label>
);

export function SignUpScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { t } = useTranslation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR_URL);
  const [customAvatarUploaded, setCustomAvatarUploaded] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    // Limite de 3MB
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("A imagem deve ter no máximo 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedAvatar(dataUrl);
        setCustomAvatarUploaded(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErrorMessage(t("auth_error_fill_fields"));
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage(t("auth_error_invalid_credentials"));
      return;
    }

    if (senha.length < 6) {
      setErrorMessage(t("auth_error_password_length"));
      return;
    }

    if (senha !== confirmSenha) {
      setErrorMessage(t("auth_error_passwords_mismatch"));
      return;
    }

    if (!aceitaTermos) {
      setErrorMessage(t("auth_terms_label"));
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
        curso: "Estudante Carmelita",
        telefone: telefone.trim(),
        fotoUrl: selectedAvatar,
        bio: "Membro da comunidade focado(a) em bem-estar e presença.",
      };

      // Tenta chamar a API central na VPS primeiro
      const { apiService, isServerRespondedError } = await import("../../services/apiService");
      let user: any = null;

      try {
        user = await apiService.register(payload);
      } catch (apiErr: any) {
        if (isServerRespondedError(apiErr)) {
          // O servidor respondeu (ex.: e-mail já cadastrado) — não mascara com fallback local
          throw apiErr;
        }
        console.log("API central não respondeu, usando bridge nativa/local:", apiErr);
        const { sendNativeMessage } = await import("../../services/nativeBridge");
        user = await sendNativeMessage("REGISTER_USER", payload);
      }

      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
        onNavigate("home");
      } else {
        setErrorMessage("Não foi possível criar sua conta. Tente novamente.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col items-center pt-6 pb-2 px-6">
        <LibertLogo />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 26, color: "#2D3A2E", marginTop: 12, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
          {t("auth_signup_title")}
        </h1>
        <p style={{ color: "#7A8A7B", fontSize: 13, marginTop: 4, textAlign: "center", lineHeight: 1.4 }}>
          {t("auth_signup_sub")}
        </p>
      </div>

      {errorMessage && (
        <div className="px-6 mb-3">
          <div
            style={{
              background: "rgba(224, 109, 83, 0.12)",
              border: "1px solid #E06D53",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#C44F35",
              fontSize: 13,
            }}
          >
            {errorMessage}
          </div>
        </div>
      )}

      {/* Seletor de Foto de Perfil & Upload */}
      <div className="px-6 pb-3 flex flex-col items-center">
        <p style={{ fontSize: 12, fontWeight: 600, color: "#7A8A7B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {t("auth_choose_avatar")}
        </p>
        
        {/* Preview do avatar selecionado */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #D68C70",
              boxShadow: "0 4px 12px rgba(214,140,112,0.25)",
              background: "#F5EFE3",
            }}
          >
            <img src={selectedAvatar} alt="Avatar Escolhido" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Fazer upload de foto"
            aria-label="Fazer upload de foto de perfil"
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 28,
              height: 28,
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
              onClick={() => {
                setSelectedAvatar(av.url);
                setCustomAvatarUploaded(false);
              }}
              title={av.name}
              aria-label={av.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                border: !customAvatarUploaded && selectedAvatar === av.url ? "3px solid #D68C70" : "2px solid transparent",
                cursor: "pointer",
                flexShrink: 0,
                transform: !customAvatarUploaded && selectedAvatar === av.url ? "scale(1.1)" : "scale(1)",
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

      <div className="flex flex-col gap-3.5 px-6 pb-4">
        {/* Nome */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>{t("auth_fullname")} *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Carlos Eduardo"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label={t("auth_fullname")}
          />
        </div>

        {/* E-mail */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>{t("auth_email")} *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label={t("auth_email")}
          />
        </div>

        {/* Telefone / WhatsApp */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>{t("auth_phone")}</label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(formatPhone(e.target.value))}
            placeholder="(11) 98765-4321"
            maxLength={15}
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label={t("auth_phone")}
          />
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>{t("auth_password")} *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              style={{
                background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 44px 12px 16px",
                fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
                fontFamily: "'DM Sans', sans-serif",
              }}
              aria-label={t("auth_password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7A8A7B", padding: 4 }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirmar Senha */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>{t("auth_confirm_password")} *</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            placeholder="••••••••"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label={t("auth_confirm_password")}
          />
        </div>

        {/* Termos de Uso */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={aceitaTermos}
            onChange={(e) => setAceitaTermos(e.target.checked)}
            style={{ marginTop: 2, accentColor: "#D68C70", width: 16, height: 16 }}
          />
          <span style={{ fontSize: 12, color: "#7A8A7B", lineHeight: 1.4 }}>
            {t("auth_terms_desc")}
          </span>
        </label>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={handleRegister}
          disabled={isLoading}
          style={{
            width: "100%", background: isLoading ? "#C4B89A" : "linear-gradient(135deg, #D68C70, #C4785A)", color: "#FDFBF7", border: "none",
            borderRadius: 14, padding: "15px", fontSize: 16, fontWeight: 600,
            cursor: isLoading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 16px rgba(214,140,112,0.35)",
            transition: "opacity 0.15s",
          }}
          aria-label={t("auth_register_btn")}
        >
          {isLoading ? t("auth_registering") : t("auth_register_btn")}
        </button>

        <p style={{ textAlign: "center", color: "#7A8A7B", fontSize: 14, marginTop: 14 }}>
          {t("auth_have_account")}{" "}
          <button
            onClick={() => onNavigate("login")}
            style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
          >
            {t("auth_enter_link")}
          </button>
        </p>
      </div>
    </div>
  );
}
