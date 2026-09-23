import * as React from "react";
import { Bell, Moon, Smartphone, LogOut, Shield, Trash2, Image as ImageIcon, Award, Users } from "lucide-react";
import { sendNativeMessage } from "../../services/nativeBridge";
import { apiService } from "../../services/apiService";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";
import { AdminUsersModal } from "./AdminUsersModal";
import { AchievementsModal } from "./AchievementsModal";
import { restartBreathingSchedule } from "../../services/notificationScheduler";

const BREATHING_INTERVAL_OPTIONS = [
  { value: 30, label: "A cada 30 min" },
  { value: 60, label: "A cada 1 hora" },
  { value: 120, label: "A cada 2 horas" },
  { value: 180, label: "A cada 3 horas" },
  { value: 240, label: "A cada 4 horas" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const value = `${String(h).padStart(2, "0")}:00`;
  return { value, label: value };
});

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

const Slider = ({
  value,
  min = 1,
  max = 10,
  step = 0.5,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div style={{ position: "relative", width: "100%", height: 32, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, right: 0, height: 8, background: "#EDE7DA", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #D68C70, #C4785A)",
            borderRadius: 4,
            transition: "width 0.1s ease-out",
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 2,
          margin: 0,
        }}
        aria-label="Limite de tela diário"
      />
      <div
        style={{
          position: "absolute",
          left: `${pct}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#D68C70",
          border: "3px solid #FDFBF7",
          boxShadow: "0 2px 8px rgba(214,140,112,0.4)",
          pointerEvents: "none",
          transition: "left 0.1s ease-out",
        }}
      />
    </div>
  );
};

export function ProfileScreen({
  onEditProfile,
  onShowBenefits,
  onOpenCard,
  onLogout,
}: {
  onEditProfile?: () => void;
  onShowBenefits?: () => void;
  onOpenCard?: () => void;
  onLogout?: () => void;
}) {
  const [currentUser, setCurrentUser] = React.useState<any>(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [breathingReminders, setBreathingReminders] = React.useState(() => {
    return localStorage.getItem("pref_breathing") !== "false";
  });
  const [breathingIntervalMin, setBreathingIntervalMin] = React.useState(() => {
    const v = localStorage.getItem("pref_breathing_interval");
    return v ? parseInt(v, 10) : 120;
  });
  const [nightMode, setNightMode] = React.useState(() => {
    return localStorage.getItem("pref_nightmode") === "true";
  });
  const [nightModeStart, setNightModeStart] = React.useState(() => {
    return localStorage.getItem("pref_nightmode_start") || "22:00";
  });
  const [nightModeEnd, setNightModeEnd] = React.useState(() => {
    return localStorage.getItem("pref_nightmode_end") || "07:00";
  });
  const [screenTimeLimit, setScreenTimeLimit] = React.useState(() => {
    return localStorage.getItem("pref_screenlimit") !== "false";
  });
  const [dailyLimit, setDailyLimit] = React.useState(() => {
    const v = localStorage.getItem("pref_dailylimit");
    return v ? parseInt(v, 10) : 5;
  });
  const [prioritizeFollowing, setPrioritizeFollowing] = React.useState(() => {
    return localStorage.getItem("pref_feed_following_first") !== "false";
  });
  const [isAchievementsOpen, setIsAchievementsOpen] = React.useState(false);

  const handleToggleBreathing = (val: boolean) => {
    setBreathingReminders(val);
    localStorage.setItem("pref_breathing", String(val));
    restartBreathingSchedule();
  };

  const handleChangeBreathingInterval = (val: number) => {
    setBreathingIntervalMin(val);
    localStorage.setItem("pref_breathing_interval", String(val));
    restartBreathingSchedule();
  };

  const handleToggleNightMode = async (val: boolean) => {
    setNightMode(val);
    localStorage.setItem("pref_nightmode", String(val));

    // Ativa/desativa o "Não Perturbar" do sistema (somente Android, requer permissão especial
    // concedida manualmente pelo usuário; em outras plataformas é apenas uma preferência local).
    try {
      if (val) {
        const hasAccess = await sendNativeMessage<boolean>("CHECK_DND_ACCESS");
        if (!hasAccess) {
          await sendNativeMessage("REQUEST_DND_ACCESS");
          return; // usuário precisa conceder o acesso e ligar novamente
        }
      }
      await sendNativeMessage("SET_DND_MODE", { enabled: val });
    } catch {
      // Fora do app nativo (web) ou recurso indisponível na plataforma
    }
  };

  const handleChangeNightModeStart = (val: string) => {
    setNightModeStart(val);
    localStorage.setItem("pref_nightmode_start", val);
  };

  const handleChangeNightModeEnd = (val: string) => {
    setNightModeEnd(val);
    localStorage.setItem("pref_nightmode_end", val);
  };

  const handleToggleScreenLimit = (val: boolean) => {
    setScreenTimeLimit(val);
    localStorage.setItem("pref_screenlimit", String(val));
  };

  const handleChangeDailyLimit = (val: number) => {
    setDailyLimit(val);
    localStorage.setItem("pref_dailylimit", String(val));
  };

  const handleTogglePrioritizeFollowing = (val: boolean) => {
    setPrioritizeFollowing(val);
    localStorage.setItem("pref_feed_following_first", String(val));
    window.dispatchEvent(new CustomEvent("feed_preference_updated"));
  };

  const [isAdminUsersOpen, setIsAdminUsersOpen] = React.useState(false);
  const [myPosts, setMyPosts] = React.useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = React.useState(false);
  const [wellness, setWellness] = React.useState<{
    pomodoroMinutosSemana: number;
    atividadesSemana: number;
    sequenciaDias: number;
    bemEstarScore: number;
  } | null>(null);
  const [screenTimeMinutesToday, setScreenTimeMinutesToday] = React.useState<number | null>(null);

  const loadWellness = React.useCallback(async (userId: number) => {
    if (!userId) return;
    try {
      const summary = await apiService.getWellnessSummary(userId);
      setWellness(summary);
    } catch (err) {
      console.warn("Erro ao carregar relatório de bem-estar:", err);
    }

    try {
      const minutos = await sendNativeMessage<number>("GET_SCREEN_TIME_TODAY");
      if (typeof minutos === "number") setScreenTimeMinutesToday(minutos);
    } catch {
      // Indisponível fora do app nativo (ou sem permissão de acesso a uso concedida)
    }
  }, []);

  const loadMyPosts = React.useCallback(async (userId: number) => {
    if (!userId) return;
    setLoadingPosts(true);
    try {
      const posts = await apiService.getUserPosts(userId);
      if (posts && Array.isArray(posts)) {
        setMyPosts(posts);
      }
    } catch (err) {
      console.warn("Erro ao buscar posts do perfil:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          if (parsed?.id) {
            loadMyPosts(parsed.id);
            loadWellness(parsed.id);
          }
        }

        const u = await sendNativeMessage<any>("GET_CURRENT_USER");
        if (isMounted && u) {
          setCurrentUser(u);
          if (u?.id) {
            loadMyPosts(u.id);
            loadWellness(u.id);
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar usuário em ProfileScreen:", err);
      }
    };
    loadUser();

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          if (parsed?.id) loadMyPosts(parsed.id);
        }
      } catch {}
    };
    window.addEventListener("user_profile_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("user_profile_updated", handleUpdate);
    };
  }, [loadMyPosts, loadWellness]);

  const handleDeleteMyPost = async (postId: number) => {
    if (!window.confirm("Deseja realmente apagar esta publicação?")) return;
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await apiService.deletePost(postId, currentUser?.id || 1);
    } catch (err) {
      console.warn("Erro ao excluir post:", err);
    }
  };

  const displayName = currentUser?.nome || "Estudante Carmelita";
  const displayAvatar = currentUser?.fotoUrl || DEFAULT_AVATAR_URL;
  const displayEmailOrDate = currentUser?.curso
    ? `${currentUser.curso} • ${currentUser.email}`
    : (currentUser?.email || "Membro da Comunidade Carmelita");

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
                src={displayAvatar}
                alt={`Foto de ${displayName}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", margin: 0 }}>
                  {displayName}
                </h1>
                {currentUser?.isAdmin && (
                  <span
                    style={{
                      background: "#2D3A2E",
                      color: "#FDFBF7",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 8,
                      letterSpacing: "0.06em",
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 2 }}>{displayEmailOrDate}</p>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500, margin: 0 }}>Tela Hoje</p>
                <span style={{ fontSize: 10, color: "#D68C70", fontWeight: 600 }}>Meta: {dailyLimit}h</span>
              </div>
              {screenTimeMinutesToday === null ? (
                <>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#7A8A7B", fontWeight: 400, marginTop: 4, margin: 0 }}>
                    Indisponível
                  </p>
                  <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>
                    Disponível no app Android com acesso de uso liberado
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#D68C70", fontWeight: 400, marginTop: 4, margin: 0 }}>
                    {Math.floor(screenTimeMinutesToday / 60)}h {screenTimeMinutesToday % 60}m
                  </p>
                  <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "#EDE7DA", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round((screenTimeMinutesToday / 60 / dailyLimit) * 100))}%`,
                      background: (screenTimeMinutesToday / 60 / dailyLimit) > 0.9 ? "#E06D53" : "#6B8F6D",
                      borderRadius: 2,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: (screenTimeMinutesToday / 60 / dailyLimit) > 0.9 ? "#C44F35" : "#6B8F6D", fontWeight: 500, marginTop: 4, margin: "4px 0 0 0" }}>
                    {Math.round((screenTimeMinutesToday / 60 / dailyLimit) * 100)}% do limite diário
                  </p>
                </>
              )}
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Atividades</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#6B8F6D", fontWeight: 400, marginTop: 4 }}>
                {wellness ? wellness.atividadesSemana : "—"}
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
                {wellness ? `${wellness.sequenciaDias} ${wellness.sequenciaDias === 1 ? "dia" : "dias"}` : "—"}
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
                {wellness ? `${wellness.bemEstarScore}%` : "—"}
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
          <button
            onClick={onOpenCard}
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
            🪪 Ver Carteirinha
          </button>
          <button
            onClick={() => setIsAchievementsOpen(true)}
            style={{
              gridColumn: "1 / -1",
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
            }}
          >
            <Award size={16} />
            Conquistas
          </button>
        </div>

        {/* Botão Especial do Painel Administrativo (Exclusivo para Admins) */}
        {currentUser?.isAdmin && (
          <div className="px-6 pb-6">
            <button
              onClick={() => setIsAdminUsersOpen(true)}
              style={{
                width: "100%",
                background: "#2D3A2E",
                border: "none",
                borderRadius: 14,
                padding: "14px 18px",
                color: "#FDFBF7",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(45,58,46,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Shield size={20} color="#D68C70" />
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Painel de Gestão de Usuários</p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(253,251,247,0.7)", fontWeight: 400 }}>
                    Controlar, apagar, desativar e redefinir senhas
                  </p>
                </div>
              </div>
              <span style={{ fontSize: 18 }}>➔</span>
            </button>
          </div>
        )}

        {/* Seção Minhas Publicações */}
        <div className="px-6 pb-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", margin: 0 }}>
              📸 Minhas Publicações ({myPosts.length})
            </h2>
            <button
              onClick={() => currentUser?.id && loadMyPosts(currentUser.id)}
              style={{
                background: "none",
                border: "none",
                color: "#D68C70",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Atualizar
            </button>
          </div>

          {loadingPosts ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 12, color: "#7A8A7B" }}>Carregando suas publicações...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div
              style={{
                background: "#F5EFE3",
                borderRadius: 14,
                padding: "20px",
                textAlign: "center",
                border: "1px dashed rgba(214,140,112,0.4)",
              }}
            >
              <p style={{ fontSize: 13, color: "#2D3A2E", fontWeight: 600, margin: "0 0 4px 0" }}>
                Você ainda não publicou no mural
              </p>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                Compartilhe fotos e conquistas na tela de Início para registrar seus momentos!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myPosts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "#F5EFE3",
                    borderRadius: 14,
                    padding: "12px 14px",
                    border: "1px solid rgba(45,58,46,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#D68C70" }}>
                      {p.icon || "🌱"} {p.type || "Publicação"} • {p.time}
                    </span>
                    <button
                      onClick={() => handleDeleteMyPost(p.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#C4785A",
                        padding: "4px",
                      }}
                      title="Excluir minha publicação"
                      aria-label="Excluir publicação"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {p.image && (
                    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", background: "#EDE7DA" }}>
                      <img src={p.image} alt="Minha foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: "#2D3A2E", margin: 0, lineHeight: 1.4 }}>{p.content}</p>

                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#7A8A7B", marginTop: 2 }}>
                    <span>❤️ {p.likes || 0} curtidas</span>
                    <span>💬 {p.comments || 0} comentários</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Configuration Section */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            Configuração de Alertas e Pausas
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Prioritize Following in Feed */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                    <Users size={18} color="#C4A882" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>Priorizar Quem Você Segue</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>Mostrar primeiro no Feed</p>
                  </div>
                </div>
                <ToggleSwitch enabled={prioritizeFollowing} onChange={handleTogglePrioritizeFollowing} />
              </div>
            </div>

            {/* Breathing Reminders */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: breathingReminders ? 10 : 0 }}>
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
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>
                      {BREATHING_INTERVAL_OPTIONS.find((o) => o.value === breathingIntervalMin)?.label || "A cada 2 horas"}
                    </p>
                  </div>
                </div>
                <ToggleSwitch enabled={breathingReminders} onChange={handleToggleBreathing} />
              </div>
              {breathingReminders && (
                <select
                  value={breathingIntervalMin}
                  onChange={(e) => handleChangeBreathingInterval(parseInt(e.target.value, 10))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(45,58,46,0.12)",
                    background: "#FAF7F0",
                    fontSize: 12,
                    color: "#2D3A2E",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  aria-label="Frequência dos lembretes de respiro"
                >
                  {BREATHING_INTERVAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Night Mode */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: nightMode ? 10 : 0 }}>
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
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>{nightModeStart} - {nightModeEnd}</p>
                  </div>
                </div>
                <ToggleSwitch enabled={nightMode} onChange={handleToggleNightMode} />
              </div>
              {nightMode && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={nightModeStart}
                    onChange={(e) => handleChangeNightModeStart(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(45,58,46,0.12)", background: "#FAF7F0", fontSize: 12, color: "#2D3A2E", fontFamily: "'DM Sans', sans-serif" }}
                    aria-label="Horário de início do modo noturno"
                  >
                    {HOUR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span style={{ fontSize: 11, color: "#7A8A7B" }}>até</span>
                  <select
                    value={nightModeEnd}
                    onChange={(e) => handleChangeNightModeEnd(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(45,58,46,0.12)", background: "#FAF7F0", fontSize: 12, color: "#2D3A2E", fontFamily: "'DM Sans', sans-serif" }}
                    aria-label="Horário de término do modo noturno"
                  >
                    {HOUR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
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
                <ToggleSwitch enabled={screenTimeLimit} onChange={handleToggleScreenLimit} />
              </div>

              {screenTimeLimit && (
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>1h</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#D68C70" }}>{dailyLimit} horas</span>
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>10h</span>
                  </div>
                  <Slider value={dailyLimit} min={1} max={10} step={0.5} onChange={handleChangeDailyLimit} />
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

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                marginTop: 20,
                marginBottom: 20,
                background: "#FAF7F0",
                border: "1.5px solid rgba(224, 109, 83, 0.3)",
                borderRadius: 14,
                padding: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                color: "#E06D53",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={16} />
              <span>Sair da conta</span>
            </button>
          )}
        </div>
      </div>

      {currentUser?.isAdmin && (
        <AdminUsersModal
          isOpen={isAdminUsersOpen}
          onClose={() => setIsAdminUsersOpen(false)}
          callerId={currentUser?.id || 1}
        />
      )}

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        usuarioId={currentUser?.id || 1}
        isAdmin={!!currentUser?.isAdmin}
      />
    </div>
  );
}
