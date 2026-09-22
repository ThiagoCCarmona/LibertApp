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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2a10.34 10.34 0 00-.164-1.84H9v3.48h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908C16.658 14.252 17.64 11.92 17.64 9.2z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.712H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M14.05 9.6c-.02-2.04 1.67-3.02 1.74-3.07C14.76 5.12 13.1 4.9 12.5 4.88c-1.42-.15-2.79.84-3.51.84-.73 0-1.84-.82-3.03-.8C4.43 4.94 3 5.82 2.2 7.2c-1.61 2.82-.42 7 1.15 9.28.77 1.12 1.68 2.38 2.88 2.33 1.16-.05 1.6-.75 3-.75 1.4 0 1.8.75 3.02.72 1.24-.02 2.04-1.14 2.8-2.26.88-1.3 1.24-2.56 1.26-2.62-.03-.01-2.43-.93-2.46-3.3zM11.6 3.24c.64-.78 1.07-1.86.95-2.94-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.02.08 2.07-.52 2.71-1.26z" fill="#2D3A2E" />
  </svg>
);

export function LoginScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setErrorMessage("Por favor, preencha e-mail e senha.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { apiService, isServerRespondedError } = await import("../../services/apiService");
      let user: any = null;

      try {
        user = await apiService.login(email.trim(), senha.trim());
      } catch (apiErr: any) {
        if (isServerRespondedError(apiErr)) {
          // O servidor respondeu (ex.: senha incorreta, conta desativada) — não mascara com fallback local
          throw apiErr;
        }
        console.log("API central não respondeu, tentando bridge local:", apiErr);
        const { sendNativeMessage } = await import("../../services/nativeBridge");
        user = await sendNativeMessage("LOGIN_USER", {
          email: email.trim(),
          senha: senha.trim(),
        });
      }

      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
        onNavigate("home");
      } else {
        setErrorMessage("E-mail ou senha incorretos.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "E-mail ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col items-center pt-8 pb-6 px-6">
        <LibertLogo />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 26, color: "#2D3A2E", marginTop: 14, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
          Bem-vinda de volta
        </h1>
        <p style={{ color: "#7A8A7B", fontSize: 14, marginTop: 6, textAlign: "center", lineHeight: 1.5 }}>
          Continue sua jornada de liberdade.
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

      <div className="flex flex-col gap-4 px-6">
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 16px",
              fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="E-mail"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              style={{
                background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 48px 14px 16px",
                fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
                fontFamily: "'DM Sans', sans-serif",
              }}
              aria-label="Senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7A8A7B", padding: 4 }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: -8 }}>
          <button
            onClick={() => onNavigate("forgot")}
            style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%", background: isLoading ? "#C4B89A" : "#D68C70", color: "#FDFBF7", border: "none",
            borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 600,
            cursor: isLoading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 16px rgba(214,140,112,0.35)",
            marginTop: 4,
          }}
          aria-label="Entrar"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </div>

      <div className="px-6 mt-6">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(45,58,46,0.1)" }} />
          <span style={{ color: "#7A8A7B", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>ou continue com</span>
          <div style={{ flex: 1, height: 1, background: "rgba(45,58,46,0.1)" }} />
        </div>

        <div className="flex flex-col gap-3">
          <button
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", background: "#F5EFE3", border: "1px solid rgba(45,58,46,0.12)",
              borderRadius: 12, padding: "13px 16px", fontSize: 14, fontWeight: 500,
              color: "#2D3A2E", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="Continuar com Google"
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          <button
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", background: "#F5EFE3", border: "1px solid rgba(45,58,46,0.12)",
              borderRadius: 12, padding: "13px 16px", fontSize: 14, fontWeight: 500,
              color: "#2D3A2E", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="Continuar com Apple"
          >
            <AppleIcon />
            Continuar com Apple
          </button>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#7A8A7B", fontSize: 14, marginTop: "auto", padding: "24px 24px 32px" }}>
        Não tem conta?{" "}
        <button
          onClick={() => onNavigate("signup")}
          style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
        >
          Criar conta
        </button>
      </p>
    </div>
  );
}
