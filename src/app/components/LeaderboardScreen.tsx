import { ChevronLeft } from "lucide-react";

const leaderboard = [
  { position: 1, name: "João Silva", points: 2850, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { position: 2, name: "Maria Costa", points: 2720, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { position: 3, name: "Pedro Oliveira", points: 2580, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  { position: 4, name: "Silvia Mendes", points: 2450, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { position: 5, name: "Ana Ferreira", points: 2320, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  { position: 6, name: "Carlos Mendes", points: 2180, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  { position: 7, name: "Beatriz Santos", points: 2050, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { position: 8, name: "Ricardo Lima", points: 1920, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { position: 9, name: "Fernanda Dias", points: 1780, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { position: 10, name: "Gustavo Santos", points: 1640, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
];

const topThree = leaderboard.slice(0, 3);
const restRanking = leaderboard.slice(3);

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex-1 overflow-y-auto flex flex-col">
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
            🏆 Pódio
          </h1>
        </div>

        {/* Podium section */}
        <div className="px-6 pb-6 flex-shrink-0">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            alignItems: "flex-end",
            justifyItems: "center",
          }}>
            {/* 2nd place - left */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "3px solid #C0C0C0",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(192,192,192,0.3)",
                }}
              >
                <img
                  src={topThree[1].avatar}
                  alt={topThree[1].name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{
                background: "linear-gradient(135deg, #C0C0C0, #A9A9A9)",
                borderRadius: 12,
                padding: "12px 8px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(192,192,192,0.2)",
              }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FDFBF7" }}>2º</p>
                <p style={{ margin: 0, marginTop: 4, fontSize: 10, color: "#FDFBF7", fontWeight: 600 }}>
                  {topThree[1].points}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#2D3A2E", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                {topThree[1].name.split(" ")[0]}
              </p>
            </div>

            {/* 1st place - center */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", transform: "translateY(0)" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  border: "4px solid #FFD700",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(255,215,0,0.4)",
                }}
              >
                <img
                  src={topThree[0].avatar}
                  alt={topThree[0].name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                borderRadius: 12,
                padding: "14px 10px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 6px 16px rgba(255,215,0,0.3)",
              }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#2D3A2E" }}>1º 🎖️</p>
                <p style={{ margin: 0, marginTop: 4, fontSize: 11, color: "#2D3A2E", fontWeight: 600 }}>
                  {topThree[0].points}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#D68C70", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
                {topThree[0].name.split(" ")[0]}
              </p>
            </div>

            {/* 3rd place - right */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "3px solid #CD7F32",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(205,127,50,0.3)",
                }}
              >
                <img
                  src={topThree[2].avatar}
                  alt={topThree[2].name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{
                background: "linear-gradient(135deg, #CD7F32, #B87333)",
                borderRadius: 12,
                padding: "12px 8px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(205,127,50,0.2)",
              }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FDFBF7" }}>3º</p>
                <p style={{ margin: 0, marginTop: 4, fontSize: 10, color: "#FDFBF7", fontWeight: 600 }}>
                  {topThree[2].points}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#2D3A2E", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                {topThree[2].name.split(" ")[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Ranking list */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          <p style={{ fontSize: 12, fontWeight: 600, color: "#7A8A7B", marginBottom: 12 }}>
            Ranking Completo
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            {restRanking.map((user) => {
              const isSilvia = user.position === 4;
              return (
                <div
                  key={user.position}
                  style={{
                    background: isSilvia
                      ? "linear-gradient(135deg, rgba(214,140,112,0.15), rgba(214,140,112,0.05))"
                      : "#F5EFE3",
                    border: isSilvia ? "2px solid #D68C70" : "1px solid rgba(45,58,46,0.08)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#2D3A2E",
                      color: "#FDFBF7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {user.position}
                  </div>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #D68C70",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSilvia ? "#D68C70" : "#2D3A2E",
                    }}>
                      {user.name} {isSilvia && "👤"}
                    </p>
                    <p style={{ margin: 0, marginTop: 2, fontSize: 11, color: "#7A8A7B" }}>
                      {user.points} pontos
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Silvia footer - fixed */}
      <div
        style={{
          background: "linear-gradient(180deg, transparent, rgba(45,58,46,0.02))",
          borderTop: "1px solid rgba(45,58,46,0.08)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #D68C70",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Silvia"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#2D3A2E" }}>
            Sua posição
          </p>
          <p style={{ margin: 0, marginTop: 1, fontSize: 11, color: "#7A8A7B" }}>
            🌟 4º lugar • 2.450 pontos
          </p>
        </div>
      </div>
    </div>
  );
}
