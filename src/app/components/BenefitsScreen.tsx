import { useState, useEffect } from "react";
import { ChevronLeft, Unlock, Lock } from "lucide-react";
import { apiService } from "../../services/apiService";
import { sendNativeMessage } from "../../services/nativeBridge";
import { useTranslation } from "../../i18n";

interface BenefitPartner {
  id: number;
  nome: string;
  icone: string;
  nivelRequerido: number;
  descontoPercentual: number;
  descricao: string;
  unlocked: boolean;
}

const DEFAULT_PARTNERS: BenefitPartner[] = [
  { id: 1, nome: "Verde Brasil", icone: "🥗", nivelRequerido: 1, descontoPercentual: 10, descricao: "Opções orgânicas e saudáveis", unlocked: true },
  { id: 2, nome: "Café do Bem", icone: "☕", nivelRequerido: 2, descontoPercentual: 12, descricao: "Cafés especiais e grãos selecionados", unlocked: true },
  { id: 3, nome: "Raízes Restaurante", icone: "🌾", nivelRequerido: 3, descontoPercentual: 15, descricao: "Comida caseira e pratos executivos", unlocked: false },
  { id: 4, nome: "Horta & Mesa", icone: "🥕", nivelRequerido: 4, descontoPercentual: 15, descricao: "Saladas e refeições veganas", unlocked: false },
  { id: 5, nome: "Natural Fit", icone: "🥑", nivelRequerido: 5, descontoPercentual: 20, descricao: "Bowls e shakes proteicos", unlocked: false },
];

export function BenefitsScreen({ onBack, onOpenCard }: { onBack: () => void; onOpenCard: () => void }) {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [partners, setPartners] = useState<BenefitPartner[]>(DEFAULT_PARTNERS);
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        setUserLevel(u.nivel || 1);
        setUserPoints(u.pontos || 0);
      }
    } catch {}

    sendNativeMessage("GET_CURRENT_USER")
      .then((u) => {
        if (u) {
          setCurrentUser(u);
          setUserLevel(u.nivel || u.Nivel || 1);
          setUserPoints(u.pontos || u.Pontos || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBenefits() {
      try {
        const data = await apiService.getBenefits(currentUser?.id);
        if (isMounted && data && data.parceiros && Array.isArray(data.parceiros)) {
          setPartners(data.parceiros.map((p: any) => ({
            id: p.id || p.Id,
            nome: p.nome || p.Nome,
            icone: p.icone || p.Icone || "🥗",
            nivelRequerido: p.nivelRequerido || p.NivelRequerido,
            descontoPercentual: p.descontoPercentual || p.DescontoPercentual || 10,
            descricao: p.descricao || p.Descricao || "",
            unlocked: Boolean(p.unlocked),
          })));
          if (data.userLevel) setUserLevel(data.userLevel);
          if (data.userPoints !== undefined) setUserPoints(data.userPoints);
          return;
        }
      } catch (err) {
        console.warn("API de benefícios indisponível, usando fallback por nível:", err);
      }

      // Fallback local por nível
      setPartners((prev) =>
        prev.map((p) => ({
          ...p,
          unlocked: userLevel >= p.nivelRequerido,
        }))
      );
    }

    loadBenefits();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, userLevel]);

  const unlockedCount = partners.filter((p) => p.unlocked).length;
  const totalCount = partners.length;
  const nextLocked = partners.find((p) => !p.unlocked);
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
            {t("benefits_screen_title")}
          </h1>
        </div>

        {/* Digital Card button */}
        <div className="px-6 pb-6">
          <button
            onClick={onOpenCard}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
              border: "none",
              borderRadius: 16,
              color: "#FDFBF7",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 24px rgba(214,140,112,0.3)",
            }}
          >
            {t("benefits_open_card_btn")}
          </button>
        </div>

        {/* Partners section */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            {t("benefits_partners_title")}
          </h2>
          <p style={{ fontSize: 12, color: "#7A8A7B", marginBottom: 16 }}>
            {t("benefits_summary")
              .replace("{unlocked}", String(unlockedCount))
              .replace("{total}", String(totalCount))
              .replace("{level}", String(userLevel))
              .replace("{points}", String(userPoints))}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {partners.map((partner) => (
              <div
                key={partner.id}
                style={{
                  background: partner.unlocked ? "#FDFBF7" : "#F5EFE3",
                  border: `1px solid ${partner.unlocked ? "#D68C70" : "rgba(45,58,46,0.08)"}`,
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: partner.unlocked ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: 28 }}>{partner.icone}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#2D3A2E" }}>
                    {partner.nome} ({partner.descontoPercentual}% {t("benefits_off")})
                  </p>
                  <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: "#7A8A7B" }}>
                    {t("benefits_level")} {partner.nivelRequerido} • {partner.unlocked ? t("benefits_unlocked") : t("benefits_unlock_hint")}
                  </p>
                  {partner.descricao && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#7A8A7B" }}>
                      {partner.descricao}
                    </p>
                  )}
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: partner.unlocked ? "rgba(214,140,112,0.1)" : "rgba(45,58,46,0.08)",
                }}>
                  {partner.unlocked ? (
                    <Unlock size={16} color="#D68C70" />
                  ) : (
                    <Lock size={16} color="#7A8A7B" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress info */}
        <div className="px-6 pb-6">
          <div style={{
            background: "linear-gradient(135deg, rgba(214,140,112,0.1), rgba(45,58,46,0.05))",
            border: "1px solid rgba(214,140,112,0.2)",
            borderRadius: 16,
            padding: "16px 14px",
          }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#2D3A2E", marginBottom: 8 }}>
              {t("benefits_next_goal_title")}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "#7A8A7B", lineHeight: 1.5 }}>
              {nextLocked
                ? t("benefits_next_goal_desc")
                    .replace("{level}", String(nextLocked.nivelRequerido))
                    .replace("{partner}", nextLocked.nome)
                    .replace("{discount}", String(nextLocked.descontoPercentual))
                : t("benefits_all_partners_unlocked")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
