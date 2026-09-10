import * as React from "react";
import { Bell, Moon, Smartphone } from "lucide-react";

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    style={{
      width: 48,
      height: 28,
      borderRadius: 14,
      background: enabled ? "#D68C70" : "#C4B89A",
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.2s",
    }}
    aria-label={enabled ? "Ativado" : "Desativado"}
  >
    <div style={{
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "#FDFBF7",
      position: "absolute",
      top: 3,
      left: enabled ? 23 : 3,
      transition: "left 0.2s",
      boxShadow: "0 2px 4px rgba(45,58,46,0.2)",
    }} />
  </button>
);

const Slider = ({ value, max, onChange }: { value: number; max: number; onChange: (val: number) => void }) => (
  <div style={{ position: "relative", width: "100%", height: 6, background: "#EDE7DA", borderRadius: 3 }}>
    <div style={{
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      width: `${(value / max) * 100}%`,
      background: "linear-gradient(90deg, #D68C70, #C4785A)",
      borderRadius: 3,
    }} />
    <div style={{
      position: "absolute",
      left: `${(value / max) * 100}%`,
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#D68C70",
      border: "3px solid #FDFBF7",
      boxShadow: "0 2px 6px rgba(214,140,112,0.3)",
      cursor: "pointer",
    }} />
  </div>
);

export function ProfileScreen({
  onEditProfile,
  onShowBenefits,
  onLogout,
}: {
  onEditProfile?: () => void;
  onShowBenefits?: () => void;
  onLogout?: () => void;
}) {
  const [breathingReminders, setBreathingReminders] = React.useState(true);
  const [nightMode, setNightMode] = React.useState(false);
  const [screenTimeLimit, setScreenTimeLimit] = React.useState(true);
  const [dailyLimit, setDailyLimit] = React.useState(5);

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="px-6 pt-4 pb-4">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #D68C70",
              flexShrink: 0,
            }}>
              <img
                src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=200&h=200&fit=crop&auto=format"
                alt="Foto de Silvia Mendes"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E" }}>
                Silvia Mendes
              </h1>
              <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 2 }}>12/04/1992</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="px-6 pb-4">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            Relatórios de Bem-estar
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Tela Hoje</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#D68C70", fontWeight: 400, marginTop: 4 }}>
                3h 20m
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 7 L5 3 L8 7" stroke="#6B8F6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p style={{ fontSize: 10, color: "#6B8F6D", fontWeight: 500 }}>↓ 45min</p>
              </div>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Atividades</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#6B8F6D", fontWeight: 400, marginTop: 4 }}>
                12
              </p>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>esta semana</p>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Sequência</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#C4A882", fontWeight: 400, marginTop: 4 }}>
                7 dias
              </p>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>consecutivos</p>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Bem-estar</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#7A8A7B", fontWeight: 400, marginTop: 4 }}>
                85%
              </p>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>pontuação</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={onEditProfile}
            style={{
              background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(214,140,112,0.2)",
              transition: "all 0.2s",
            }}
          >
            ✏️ Editar Perfil
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(45,58,46,0.2)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: onLogout ? 1 : 0.6,
            }}
            aria-label="Logout"
            disabled={!onLogout}
          >
            🚪 Sair
          </button>
          <button
            onClick={onShowBenefits}
            style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
              border: "none",

              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(45,58,46,0.2)",
              transition: "all 0.2s",
            }}
          >
            🎁 Benefícios
          </button>
        </div>

        {/* Alert Configuration Section */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            Configuração de Alertas e Pausas
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Breathing Reminders */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(214,140,112,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Bell size={18} color="#D68C70" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>Lembretes de Respiro</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>A cada 2 horas</p>
                  </div>
                </div>
                <ToggleSwitch enabled={breathingReminders} onChange={setBreathingReminders} />
              </div>
            </div>

            {/* Night Mode */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(107,143,109,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Moon size={18} color="#6B8F6D" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>Modo Noturno Digital</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>22h - 7h</p>
                  </div>
                </div>
                <ToggleSwitch enabled={nightMode} onChange={setNightMode} />
              </div>
            </div>

            {/* Screen Time Limit */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(196,168,130,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Smartphone size={18} color="#C4A882" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>Limite de Tela Diário</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>Meta: {dailyLimit}h por dia</p>
                  </div>
                </div>
                <ToggleSwitch enabled={screenTimeLimit} onChange={setScreenTimeLimit} />
              </div>

              {screenTimeLimit && (
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>1h</span>
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>8h</span>
                  </div>
                  <Slider value={dailyLimit} max={8} onChange={setDailyLimit} />
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: 12,
            background: "rgba(214,140,112,0.08)",
            border: "1px solid rgba(214,140,112,0.2)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <p style={{ fontSize: 12, color: "#7A8A7B", lineHeight: 1.4 }}>
              Pausas regulares ajudam a reduzir ansiedade e melhorar seu bem-estar digital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
