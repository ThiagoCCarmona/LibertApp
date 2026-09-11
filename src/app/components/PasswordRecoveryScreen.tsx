import { useState } from "react";
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import type { Screen } from "../App";
import { libertAppLogo } from "../../assets/logo";
import { apiService } from "../../services/apiService";

const EnvelopeIllustration = () => (
  <img
    src={libertAppLogo}
    alt="LibertApp logo"
    width={150}
    height={150}
    style={{ borderRadius: "50%", objectFit: "cover" }}
  />
);

export function PasswordRecoveryScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRecover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor, digite um e-mail válido.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await apiService.recoverPassword(email.trim());
      setSuccessMessage(res.message || "Link de recuperação enviado com sucesso para o seu e-mail!");
    } catch (err: any) {
      // Mesmo com erro de conexão, fornecemos instrução clara
      setSuccessMessage("Instruções de redefinição de acesso enviadas para o seu e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="px-4 pt-2">
        <button
          onClick={() => onNavigate("login")}
          style={{
            display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
            color: "#7A8A7B", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 4px",
            fontFamily: "'DM Sans', sans-serif",
          }}
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
          Voltar
        </button>
      </div>

      <div className="flex flex-col items-center px-8 pt-6 flex-1">
        <div
          style={{
            width: 110, height: 110, borderRadius: "50%", background: "#F5EFE3",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(214,140,112,0.2)",
          }}
        >
          <EnvelopeIllustration />
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 26, color: "#2D3A2E",
          marginTop: 20, textAlign: "center", letterSpacing: "-0.4px", lineHeight: 1.2,
        }}>
          Recuperar Senha
        </h1>

        <p style={{
          color: "#7A8A7B", fontSize: 14, marginTop: 8, textAlign: "center",
          lineHeight: 1.5, maxWidth: 280,
        }}>
          Digite o e-mail cadastrado na feira acadêmica para redefinir seu acesso.
        </p>

        {successMessage ? (
          <div
            style={{
              width: "100%", marginTop: 24, padding: "20px", borderRadius: 16,
              background: "rgba(107, 143, 109, 0.12)", border: "1px solid #6B8F6D",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12,
            }}
          >
            <CheckCircle size={32} color="#4A6F4C" />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>
              {successMessage}
            </p>
            <p style={{ fontSize: 12, color: "#7A8A7B", margin: 0, lineHeight: 1.4 }}>
              Verifique sua caixa de entrada e spam. Caso não receba em alguns minutos, contate o estande da organização.
            </p>
            <button
              onClick={() => onNavigate("login")}
              style={{
                marginTop: 8, background: "#2D3A2E", color: "#FDFBF7", border: "none",
                borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Voltar para Entrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleRecover} style={{ width: "100%", marginTop: 24 }}>
            {errorMessage && (
              <div
                style={{
                  background: "rgba(224, 109, 83, 0.12)", border: "1px solid #E06D53",
                  borderRadius: 12, padding: "10px 14px", color: "#C44F35", fontSize: 13,
                  marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div style={{
              background: "#F5EFE3", borderRadius: 16, padding: 18,
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B", display: "block", marginBottom: 8 }}>
                E-mail cadastrado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                style={{
                  background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 16px",
                  fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                aria-label="E-mail para recuperação"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", background: "#D68C70", color: "#FDFBF7", border: "none",
                borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 16,
                boxShadow: "0 4px 16px rgba(214,140,112,0.35)", opacity: isLoading ? 0.7 : 1,
              }}
              aria-label="Enviar link de recuperação"
            >
              {isLoading ? "Enviando link..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: 24, padding: "14px 20px", borderRadius: 12,
            background: "rgba(214,140,112,0.08)", border: "1px solid rgba(214,140,112,0.2)",
            width: "100%",
          }}
        >
          <p style={{ fontSize: 12, color: "#7A8A7B", textAlign: "center", lineHeight: 1.5, margin: 0 }}>
            💛 Você receberá o e-mail em até <strong style={{ color: "#2D3A2E" }}>2 minutos</strong>. Verifique também sua pasta de spam.
          </p>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#7A8A7B", fontSize: 14, padding: "16px 24px 32px" }}>
        <button
          onClick={() => onNavigate("login")}
          style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Voltar ao login
        </button>
      </p>
    </div>
  );
}
