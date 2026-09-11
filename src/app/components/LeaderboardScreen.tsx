import { useState, useEffect } from "react";
import { ChevronLeft, Trophy, Sparkles } from "lucide-react";
import { UserProfileModal, type UserProfileData } from "./UserProfileModal";
import { sendNativeMessage } from "../../services/nativeBridge";
import { apiService } from "../../services/apiService";

import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";

export interface RankingUser {
  id?: number;
  position: number;
  name: string;
  points: number;
  avatar: string;
  curso?: string;
}

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadRanking() {
      // 1. Tenta carregar imediatamente dados locais em cache para não deixar a tela travada
      try {
        const local = await sendNativeMessage<any[]>("GET_RANKING");
        if (isMounted && local && Array.isArray(local) && local.length > 0) {
          const mapped: RankingUser[] = local.map((u, index) => ({
            id: u.id ?? u.Id,
            position: index + 1,
            name: u.name || u.nome || u.Nome || "Participante",
            points: u.points ?? u.pontos ?? u.Pontos ?? 0,
            avatar: u.avatar || u.fotoUrl || u.FotoUrl || DEFAULT_AVATAR_URL,
            curso: u.curso || u.Curso || u.department || "",
          }));
          setRanking(mapped);
          setIsLoading(false);
        }
      } catch {}

      // 2. Busca da API central na VPS para atualizar ranking global
      try {
        const apiRank = await apiService.getLeaderboard();
        if (isMounted && apiRank && Array.isArray(apiRank) && apiRank.length > 0) {
          const mapped: RankingUser[] = apiRank.map((u: any, index: number) => ({
            id: u.id ?? u.Id,
            position: index + 1,
            name: u.name || u.nome || u.Nome || "Participante",
            points: u.points ?? u.pontos ?? u.Pontos ?? 0,
            avatar: u.avatar || u.fotoUrl || u.FotoUrl || DEFAULT_AVATAR_URL,
            curso: u.curso || u.Curso || u.department || "",
          }));
          setRanking(mapped);
        }
      } catch (apiErr) {
        console.warn("API VPS indisponível para ranking:", apiErr);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRanking();
    return () => {
      isMounted = false;
    };
  }, []);

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];
  const restRanking = ranking.slice(3);

  const handleOpenProfile = (user: RankingUser) => {
    setSelectedUser({
      name: user.name,
      avatar: user.avatar,
      level: Math.max(1, Math.floor(user.points / 600)),
      levelName: `Nível ${Math.max(1, Math.floor(user.points / 600))} - Foco Ativo`,
      points: user.points,
      streakDays: Math.min(14, Math.floor(user.points / 200)),
      focusMinutes: Math.floor(user.points * 0.15),
      bio: user.curso ? `Estudante de ${user.curso}` : "Comprometido(a) com a saúde mental e momentos sem tela.",
      department: user.curso || "Comunidade Carmelita",
    });
  };

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
            🏆 Pódio da Feira
          </h1>
        </div>

        {/* Loading or Empty State */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 14, color: "#7A8A7B" }}>Carregando ranking oficial...</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="px-6 py-8">
            <div
              style={{
                background: "#F5EFE3",
                borderRadius: 20,
                padding: "32px 20px",
                border: "1.5px dashed rgba(214,140,112,0.4)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(214,140,112,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trophy size={28} color="#D68C70" />
              </div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: "#2D3A2E", margin: 0 }}>
                O pódio está à sua espera!
              </h2>
              <p style={{ fontSize: 13, color: "#7A8A7B", lineHeight: 1.5, margin: 0, maxWidth: 280 }}>
                Nenhum participante acumulou pontos ainda. Complete sessões de foco no Pomodoro ou realize desafios para inaugurar o 1º lugar!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Podium section */}
            <div className="px-6 pb-6 flex-shrink-0">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  alignItems: "flex-end",
                  justifyItems: "center",
                }}
              >
                {/* 2nd place - left */}
                {second ? (
                  <div
                    onClick={() => handleOpenProfile(second)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", cursor: "pointer" }}
                  >
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
                        src={second.avatar}
                        alt={second.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #C0C0C0, #A9A9A9)",
                        borderRadius: 12,
                        padding: "12px 8px",
                        width: "100%",
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(192,192,192,0.2)",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FDFBF7" }}>2º</p>
                      <p style={{ margin: 0, marginTop: 4, fontSize: 10, color: "#FDFBF7", fontWeight: 600 }}>
                        {second.points} pts
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: "#2D3A2E", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                      {second.name.split(" ")[0]}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", opacity: 0.4 }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", border: "2px dashed #C0C0C0" }} />
                    <div style={{ background: "#EDE7DA", borderRadius: 12, padding: "10px 6px", width: "100%", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#7A8A7B" }}>2º</p>
                    </div>
                  </div>
                )}

                {/* 1st place - center */}
                {first ? (
                  <div
                    onClick={() => handleOpenProfile(first)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", transform: "translateY(0)", cursor: "pointer" }}
                  >
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
                        src={first.avatar}
                        alt={first.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #FFD700, #FFA500)",
                        borderRadius: 12,
                        padding: "14px 10px",
                        width: "100%",
                        textAlign: "center",
                        boxShadow: "0 6px 16px rgba(255,215,0,0.3)",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#2D3A2E" }}>1º 🎖️</p>
                      <p style={{ margin: 0, marginTop: 4, fontSize: 11, color: "#2D3A2E", fontWeight: 600 }}>
                        {first.points} pts
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#D68C70", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
                      {first.name.split(" ")[0]}
                    </p>
                  </div>
                ) : null}

                {/* 3rd place - right */}
                {third ? (
                  <div
                    onClick={() => handleOpenProfile(third)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", cursor: "pointer" }}
                  >
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
                        src={third.avatar}
                        alt={third.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #CD7F32, #B87333)",
                        borderRadius: 12,
                        padding: "12px 8px",
                        width: "100%",
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(205,127,50,0.2)",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FDFBF7" }}>3º</p>
                      <p style={{ margin: 0, marginTop: 4, fontSize: 10, color: "#FDFBF7", fontWeight: 600 }}>
                        {third.points} pts
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: "#2D3A2E", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                      {third.name.split(" ")[0]}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", opacity: 0.4 }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", border: "2px dashed #CD7F32" }} />
                    <div style={{ background: "#EDE7DA", borderRadius: 12, padding: "10px 6px", width: "100%", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#7A8A7B" }}>3º</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ranking list */}
            {restRanking.length > 0 && (
              <div className="px-6 pb-6 flex-1 overflow-y-auto">
                <p style={{ fontSize: 12, fontWeight: 600, color: "#7A8A7B", marginBottom: 12 }}>
                  Demais Participantes
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                  {restRanking.map((user) => {
                    const isCurrentUser = currentUser?.id && user.id === currentUser.id;
                    return (
                      <div
                        key={user.position}
                        onClick={() => handleOpenProfile(user)}
                        style={{
                          background: isCurrentUser
                            ? "linear-gradient(135deg, rgba(214,140,112,0.15), rgba(214,140,112,0.05))"
                            : "#F5EFE3",
                          border: isCurrentUser ? "2px solid #D68C70" : "1px solid rgba(45,58,46,0.08)",
                          borderRadius: 12,
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700, color: isCurrentUser ? "#D68C70" : "#7A8A7B", width: 24, textAlign: "center" }}>
                          {user.position}º
                        </span>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #D68C70" }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#2D3A2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user.name} {isCurrentUser && "(Você)"}
                          </p>
                          {user.curso && (
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#7A8A7B" }}>
                              {user.curso}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#D68C70" }}>
                          {user.points} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <UserProfileModal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
}
