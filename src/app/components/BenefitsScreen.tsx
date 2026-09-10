import { ChevronLeft, Unlock, Lock } from "lucide-react";

const partners = [
  { id: 1, name: "Verde Brasil", icon: "🥗", level: 1, unlocked: true },
  { id: 2, name: "Café do Bem", icon: "☕", level: 2, unlocked: true },
  { id: 3, name: "Raízes", icon: "🌾", level: 3, unlocked: true },
  { id: 4, name: "Horta & Mesa", icon: "🥕", level: 4, unlocked: false },
  { id: 5, name: "Natural Fit", icon: "🥑", level: 5, unlocked: false },
];

export function BenefitsScreen({ onBack, onOpenCard }: { onBack: () => void; onOpenCard: () => void }) {
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
            Meus Benefícios
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
            📱 Abrir Carteirinha Digital
          </button>
        </div>

        {/* Partners section */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            Restaurantes Parceiros
          </h2>
          <p style={{ fontSize: 12, color: "#7A8A7B", marginBottom: 16 }}>
            Desbloqueados: 3 de 5 • Nível atual: 3
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
                <div style={{ fontSize: 28 }}>{partner.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#2D3A2E" }}>
                    {partner.name}
                  </p>
                  <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: "#7A8A7B" }}>
                    Nível {partner.level} • {partner.unlocked ? "Desbloqueado" : "Desbloqueie com mais pontos"}
                  </p>
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
              Próxima meta 🎯
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "#7A8A7B", lineHeight: 1.5 }}>
              Acumule 2 pontos para desbloquear "Horta & Mesa" e aproveite 15% de desconto em refeições veganas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
