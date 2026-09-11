import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Screen } from "../App";
import { libertAppLogo } from "../../assets/logo";

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
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [curso, setCurso] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format");
  const [aceitaTermos, setAceitaTermos] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const AVATAR_OPTIONS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&auto=format",
  ];

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !curso.trim()) {
      setErrorMessage("Por favor, preencha Nome, E-mail, Curso e Senha.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmSenha) {
      setErrorMessage("A confirmação de senha não confere.");
      return;
    }

    if (!aceitaTermos) {
      setErrorMessage("É necessário aceitar os termos de convivência da feira.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
        curso: curso.trim(),
        telefone: telefone.trim(),
        fotoUrl: selectedAvatar,
        bio: `Estudante de ${curso.trim()} focado(a) em bem-estar e presença.`,
      };

      // Tenta chamar a API central na VPS primeiro
      const { apiService } = await import("../../services/apiService");
      let user: any = null;

      try {
        user = await apiService.register(payload);
      } catch (apiErr) {
        console.log("API central não respondeu, usando bridge nativa/local:", apiErr);
        const { sendNativeMessage } = await import("../../services/nativeBridge");
        user = await sendNativeMessage("REGISTER_USER", payload);
      }

      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
        onNavigate("home");
      } else {
        onNavigate("home");
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
          Cadastro Acadêmico
        </h1>
        <p style={{ color: "#7A8A7B", fontSize: 13, marginTop: 4, textAlign: "center", lineHeight: 1.4 }}>
          Crie seu perfil oficial para a Feira Acadêmica Carmelita.
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

      {/* Seletor de Foto de Perfil */}
      <div className="px-6 pb-3 flex flex-col items-center">
        <p style={{ fontSize: 12, fontWeight: 600, color: "#7A8A7B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Escolha sua foto de perfil
        </p>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, maxWidth: "100%" }}>
          {AVATAR_OPTIONS.map((imgUrl, i) => (
            <div
              key={i}
              onClick={() => setSelectedAvatar(imgUrl)}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                overflow: "hidden",
                border: selectedAvatar === imgUrl ? "3px solid #D68C70" : "2px solid transparent",
                cursor: "pointer",
                flexShrink: 0,
                transform: selectedAvatar === imgUrl ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.15s ease, border 0.15s ease",
              }}
            >
              <img src={imgUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-6 pb-4">
        {/* Nome */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Nome completo *</label>
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
            aria-label="Nome completo"
          />
        </div>

        {/* E-mail */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>E-mail acadêmico ou pessoal *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos@aluno.carmelita.edu.br"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="E-mail"
          />
        </div>

        {/* Curso / Departamento */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Curso / Departamento *</label>
          <input
            type="text"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            placeholder="Ex: Engenharia de Software, Direito, Medicina..."
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="Curso ou Departamento"
          />
        </div>

        {/* Telefone / WhatsApp */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>WhatsApp / Celular</label>
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
            aria-label="Telefone"
          />
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Senha *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
                background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 44px 12px 16px",
                fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
                fontFamily: "'DM Sans', sans-serif",
              }}
              aria-label="Senha"
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
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Confirmar Senha *</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            placeholder="Digite a senha novamente"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="Confirmar Senha"
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
            Concordo com os termos de convivência respeitosa e bem-estar digital da Feira Acadêmica Carmelita.
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
          aria-label="Concluir Cadastro"
        >
          {isLoading ? "Criando perfil..." : "Criar Meu Perfil Oficial"}
        </button>

        <p style={{ textAlign: "center", color: "#7A8A7B", fontSize: 14, marginTop: 14 }}>
          Já possui conta?{" "}
          <button
            onClick={() => onNavigate("login")}
            style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
