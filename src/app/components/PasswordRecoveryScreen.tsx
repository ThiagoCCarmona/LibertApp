import { ChevronLeft } from "lucide-react";
import type { Screen } from "../App";
import { libertAppLogo } from "../../assets/logo";

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
  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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

      <div className="flex flex-col items-center px-8 pt-10 flex-1">
        <div
          style={{
            width: 120, height: 120, borderRadius: "50%", background: "#F5EFE3",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(214,140,112,0.2)",
          }}
        >
          <EnvelopeIllustration />
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 28, color: "#2D3A2E",
          marginTop: 28, textAlign: "center", letterSpacing: "-0.4px", lineHeight: 1.2,
        }}>
          Sem problema.
        </h1>

        <p style={{
          color: "#7A8A7B", fontSize: 15, marginTop: 10, textAlign: "center",
          lineHeight: 1.6, maxWidth: 280,
        }}>
          Enviaremos um link seguro para o seu e-mail cadastrado. Verifique sua caixa de entrada.
        </p>

        <div style={{
          width: "100%", marginTop: 36,
          background: "#F5EFE3", borderRadius: 16, padding: 20,
          border: "1px solid rgba(45,58,46,0.08)",
        }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B", display: "block", marginBottom: 8 }}>
            Seu e-mail
          </label>
          <input
            type="email"
            placeholder="silvia@exemplo.com.br"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 16px",
              fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="E-mail para recuperação"
          />
        </div>

        <button
          style={{
            width: "100%", background: "#D68C70", color: "#FDFBF7", border: "none",
            borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 16,
            boxShadow: "0 4px 16px rgba(214,140,112,0.35)",
          }}
          aria-label="Enviar link de recuperação"
        >
          Enviar link
        </button>

        <div
          style={{
            marginTop: 24, padding: "14px 20px", borderRadius: 12,
            background: "rgba(214,140,112,0.08)", border: "1px solid rgba(214,140,112,0.2)",
            width: "100%",
          }}
        >
          <p style={{ fontSize: 13, color: "#7A8A7B", textAlign: "center", lineHeight: 1.5 }}>
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
