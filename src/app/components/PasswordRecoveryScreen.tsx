import { useState } from "react";
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import type { Screen } from "../App";
import { libertAppLogo } from "../../assets/logo";
import { apiService } from "../../services/apiService";
import { useTranslation } from "../../i18n";

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
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRecover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage(t("auth_error_invalid_credentials"));
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await apiService.recoverPassword(email.trim());
      setSuccessMessage(res.message || t("auth_recovery_success"));
    } catch (err: any) {
      // Mesmo com erro de conexão, fornecemos instrução clara
      setSuccessMessage(t("auth_recovery_success"));
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
          aria-label={t("auth_recovery_back_login")}
        >
          <ChevronLeft size={20} />
          {t("auth_recovery_back_login")}
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
          {t("auth_recovery_title")}
        </h1>

        <p style={{
          color: "#7A8A7B", fontSize: 14, marginTop: 8, textAlign: "center",
          lineHeight: 1.5, maxWidth: 280,
        }}>
          {t("auth_recovery_sub")}
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
            <button
              onClick={() => onNavigate("login")}
              style={{
                marginTop: 8, background: "#2D3A2E", color: "#FDFBF7", border: "none",
                borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("auth_recovery_back_login")}
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
                {t("auth_email")}
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
                aria-label={t("auth_email")}
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
              aria-label={t("auth_recovery_send_btn")}
            >
              {isLoading ? t("auth_recovery_sending") : t("auth_recovery_send_btn")}
            </button>
          </form>
        )}
      </div>

      <p style={{ textAlign: "center", color: "#7A8A7B", fontSize: 14, padding: "16px 24px 32px" }}>
        <button
          onClick={() => onNavigate("login")}
          style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
        >
          {t("auth_recovery_back_login")}
        </button>
      </p>
    </div>
  );
}
