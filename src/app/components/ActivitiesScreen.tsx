import * as React from "react";
import { Play, Pause, Settings, CheckCircle2, Circle, Plus, Pencil, Trash2, Sparkles, Award } from "lucide-react";
import { sendNativeMessage } from "../../services/nativeBridge";
import { apiService } from "../../services/apiService";
import { PomodoroSettingsModal, type PomodoroConfig } from "./PomodoroSettingsModal";
import { MetaModal, type MetaItem } from "./MetaModal";

type PomodoroMode = "focus" | "short-break" | "long-break";
type ChallengeTab = "daily" | "weekly" | "monthly";

interface Challenge {
  id: number;
  title: string;
  category: ChallengeTab;
  points?: number;
  completed: boolean;
}

const DEFAULT_CHALLENGES: Record<ChallengeTab, Challenge[]> = {
  daily: [
    { id: 1, title: "Ficar 30 min offline no almoço", category: "daily", points: 50, completed: true },
    { id: 2, title: "Completar 2 Pomodoros de estudo", category: "daily", points: 75, completed: false },
    { id: 3, title: "Fazer 1 pausa ativa sem telas", category: "daily", points: 40, completed: false },
  ],
  weekly: [
    { id: 4, title: "Fazer uma caminhada na natureza", category: "weekly", points: 150, completed: false },
    { id: 5, title: "Meditar ou respirar 3x na semana", category: "weekly", points: 120, completed: true },
    { id: 6, title: "Conectar com alguém presencialmente", category: "weekly", points: 100, completed: false },
  ],
  monthly: [
    { id: 7, title: "Participar de 1 gincana presencial", category: "monthly", points: 300, completed: false },
    { id: 8, title: "Ler 1 livro completo sem notificações", category: "monthly", points: 250, completed: false },
    { id: 9, title: "Fazer 1 atividade em grupo ao ar livre", category: "monthly", points: 200, completed: false },
  ],
};

const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  dailyGoal: 4,
};

export function ActivitiesScreen() {
  // Configuração do Pomodoro
  const [pomodoroConfig, setPomodoroConfig] = React.useState<PomodoroConfig>(() => {
    try {
      const saved = localStorage.getItem("libertapp_pomodoro_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_POMODORO_CONFIG;
  });

  const [mode, setMode] = React.useState<PomodoroMode>("focus");
  const [isRunning, setIsRunning] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(pomodoroConfig.focusMinutes * 60);
  const [completedSessionsToday, setCompletedSessionsToday] = React.useState(() => {
    try {
      const todayKey = `pomodoro_sessions_${new Date().toISOString().slice(0, 10)}`;
      const saved = localStorage.getItem(todayKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Modais de Pomodoro e Metas
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = React.useState(false);
  const [editingMeta, setEditingMeta] = React.useState<MetaItem | null>(null);

  // Metas / Desafios
  const [challengeTab, setChallengeTab] = React.useState<ChallengeTab>("daily");
  const [challenges, setChallenges] = React.useState<Record<ChallengeTab, Challenge[]>>(() => {
    try {
      const saved = localStorage.getItem("libertapp_challenges_v2");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CHALLENGES;
  });

  const currentUser = (() => {
    try {
      const s = localStorage.getItem("currentUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const modeConfig = React.useMemo(() => ({
    focus: { label: "Foco Total", minutes: pomodoroConfig.focusMinutes, color: "#D68C70" },
    "short-break": { label: "Pausa Curta", minutes: pomodoroConfig.shortBreakMinutes, color: "#6B8F6D" },
    "long-break": { label: "Pausa Longa", minutes: pomodoroConfig.longBreakMinutes, color: "#C4A882" },
  }), [pomodoroConfig]);

  // Carrega desafios persistidos do backend (API / SQLite)
  React.useEffect(() => {
    let isMounted = true;
    async function loadDesafios() {
      const userId = currentUser?.id || 1;
      try {
        // 1. Tenta API central
        const apiData = await apiService.getDesafios(userId);
        if (isMounted && apiData && Array.isArray(apiData) && apiData.length > 0) {
          const categorized: Record<ChallengeTab, Challenge[]> = {
            daily: [],
            weekly: [],
            monthly: [],
          };

          apiData.forEach((d: any) => {
            const cat = ((d.category || d.categoria || "daily").toLowerCase()) as ChallengeTab;
            const targetCat = categorized[cat] ? cat : "daily";
            categorized[targetCat].push({
              id: d.id,
              title: d.title || d.titulo,
              category: targetCat,
              points: d.points || d.pontosRecompensa || 50,
              completed: !!d.completed,
            });
          });

          // Se a API retornou categorias populadas, atualiza
          if (categorized.daily.length > 0 || categorized.weekly.length > 0) {
            setChallenges(categorized);
            localStorage.setItem("libertapp_challenges_v2", JSON.stringify(categorized));
            return;
          }
        }
      } catch (err) {
        console.warn("API de desafios indisponível, usando fallback local:", err);
      }

      // 2. Fallback bridge
      try {
        const nativeDesafios = await sendNativeMessage<any[]>("GET_DESAFIOS");
        if (isMounted && nativeDesafios && Array.isArray(nativeDesafios) && nativeDesafios.length > 0) {
          const daily = nativeDesafios
            .filter((d) => (d.categoria || d.Categoria || "daily").toLowerCase() === "daily")
            .map((d) => ({
              id: d.id || d.Id,
              title: d.titulo || d.Titulo,
              category: "daily" as ChallengeTab,
              points: d.pontosRecompensa || 50,
              completed: !!(d.completed || d.Completed),
            }));

          if (daily.length > 0) {
            setChallenges((prev) => ({
              ...prev,
              daily,
            }));
          }
        }
      } catch {}
    }

    loadDesafios();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Salva desafios no localStorage sempre que alterados
  React.useEffect(() => {
    try {
      localStorage.setItem("libertapp_challenges_v2", JSON.stringify(challenges));
    } catch {}
  }, [challenges]);

  // Timer interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);

      // Registra sessão de foco concluída
      if (mode === "focus") {
        setCompletedSessionsToday((prev) => {
          const next = prev + 1;
          try {
            const todayKey = `pomodoro_sessions_${new Date().toISOString().slice(0, 10)}`;
            localStorage.setItem(todayKey, String(next));
          } catch {}
          return next;
        });
      }

      // Registra no backend
      const userId = currentUser?.id || 1;
      apiService.recordPomodoro(userId, mode, modeConfig[mode].minutes).catch(() => {
        sendNativeMessage("RECORD_POMODORO", {
          tipo: mode,
          minutos: modeConfig[mode].minutes,
        }).catch((err) => console.warn("Erro ao registrar pomodoro:", err));
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, modeConfig, currentUser?.id]);

  const handleSavePomodoroConfig = (newConfig: PomodoroConfig) => {
    setPomodoroConfig(newConfig);
    localStorage.setItem("libertapp_pomodoro_config", JSON.stringify(newConfig));
    if (!isRunning) {
      setTimeLeft(newConfig[mode === "focus" ? "focusMinutes" : mode === "short-break" ? "shortBreakMinutes" : "longBreakMinutes"] * 60);
    }
  };

  // Toggle Concluir Meta
  const handleChallengeToggle = async (id: number) => {
    const currentList = challenges[challengeTab];
    const target = currentList.find((c) => c.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;

    setChallenges((prev) => ({
      ...prev,
      [challengeTab]: prev[challengeTab].map((c) =>
        c.id === id ? { ...c, completed: nextCompleted } : c
      ),
    }));

    const userId = currentUser?.id || 1;
    try {
      await apiService.toggleDesafio(id, userId);
    } catch {
      try {
        await sendNativeMessage("TOGGLE_DESAFIO", id.toString());
      } catch (err) {
        console.warn("Erro ao alternar desafio:", err);
      }
    }
  };

  // Criar / Editar Meta
  const handleSaveMeta = async (metaItem: MetaItem) => {
    const targetCat = metaItem.category;

    if (metaItem.id) {
      // Edição
      setChallenges((prev) => {
        const next = { ...prev };
        // Remove de outras categorias se mudou
        (['daily', 'weekly', 'monthly'] as ChallengeTab[]).forEach((cat) => {
          next[cat] = next[cat].filter((c) => c.id !== metaItem.id);
        });
        // Adiciona atualizado na categoria correta
        next[targetCat] = [
          ...next[targetCat],
          {
            id: metaItem.id!,
            title: metaItem.title,
            category: targetCat,
            points: metaItem.points || 50,
            completed: metaItem.completed || false,
          },
        ];
        return next;
      });

      try {
        await apiService.updateDesafio(metaItem.id, {
          titulo: metaItem.title,
          categoria: targetCat,
          pontosRecompensa: metaItem.points || 50,
        });
      } catch (err) {
        console.warn("Erro ao atualizar meta na API:", err);
      }
    } else {
      // Criação de nova meta
      const tempId = Date.now();
      const newChallenge: Challenge = {
        id: tempId,
        title: metaItem.title,
        category: targetCat,
        points: metaItem.points || 50,
        completed: false,
      };

      setChallenges((prev) => ({
        ...prev,
        [targetCat]: [...prev[targetCat], newChallenge],
      }));

      try {
        const created = await apiService.createDesafio({
          titulo: metaItem.title,
          categoria: targetCat,
          pontosRecompensa: metaItem.points || 50,
        });
        if (created && created.id) {
          setChallenges((prev) => ({
            ...prev,
            [targetCat]: prev[targetCat].map((c) =>
              c.id === tempId ? { ...c, id: created.id } : c
            ),
          }));
        }
      } catch (err) {
        console.warn("Erro ao criar meta na API:", err);
      }
    }
  };

  // Remover Meta
  const handleDeleteMeta = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDel = window.confirm("Deseja realmente remover esta meta?");
    if (!confirmDel) return;

    setChallenges((prev) => ({
      ...prev,
      [challengeTab]: prev[challengeTab].filter((c) => c.id !== id),
    }));

    try {
      await apiService.deleteDesafio(id);
    } catch (err) {
      console.warn("Erro ao excluir meta na API:", err);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = modeConfig[mode].minutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Contabilização dinâmica em tempo real para as metas
  const activeChallenges = challenges[challengeTab] || [];
  const totalGoals = activeChallenges.length;
  const completedGoals = activeChallenges.filter((c) => c.completed).length;
  const goalPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", margin: 0 }}>
              Pomodoro
            </h1>
            <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 2 }}>Tempo de Foco & Hábitos Conscientes</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "#F5EFE3",
              border: "1px solid rgba(45,58,46,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2D3A2E",
              boxShadow: "0 2px 8px rgba(45,58,46,0.06)",
              transition: "transform 0.15s ease",
            }}
            title="Ajustar Tempos do Pomodoro"
            aria-label="Ajustar Tempos do Pomodoro"
          >
            <Settings size={20} color="#2D3A2E" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 pb-4">
          <div style={{
            display: "flex",
            background: "#F5EFE3",
            borderRadius: 14,
            padding: 4,
            gap: 4,
          }}>
            {(Object.keys(modeConfig) as PomodoroMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setTimeLeft(modeConfig[m].minutes * 60);
                  setIsRunning(false);
                }}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  background: mode === m ? "#FDFBF7" : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? "#2D3A2E" : "#7A8A7B",
                  transition: "all 0.2s",
                  boxShadow: mode === m ? "0 2px 8px rgba(45,58,46,0.08)" : "none",
                }}
              >
                {modeConfig[m].label} ({modeConfig[m].minutes}m)
              </button>
            ))}
          </div>
        </div>

        {/* Pomodoro Timer Circle */}
        <div className="px-6 pt-4 pb-6" style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            <svg width="250" height="250" viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke="#EDE7DA"
                strokeWidth="12"
              />
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke={modeConfig[mode].color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 115}`}
                strokeDashoffset={`${2 * Math.PI * 115 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.3s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 54,
                fontWeight: 400,
                color: "#2D3A2E",
                lineHeight: 1,
                letterSpacing: "-1px",
              }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 8, fontWeight: 500 }}>
                {modeConfig[mode].label}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 pb-6" style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${modeConfig[mode].color} 0%, ${modeConfig[mode].color}DD 100%)`,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${modeConfig[mode].color}40, 0 2px 8px rgba(45,58,46,0.12)`,
            }}
            aria-label={isRunning ? "Pausar" : "Iniciar Foco"}
          >
            {isRunning ? (
              <Pause size={32} color="#FDFBF7" fill="#FDFBF7" />
            ) : (
              <Play size={32} color="#FDFBF7" fill="#FDFBF7" style={{ marginLeft: 3 }} />
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "#F5EFE3",
              border: "1px solid rgba(45,58,46,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(45,58,46,0.06)",
            }}
            title="Configurar Pomodoro"
            aria-label="Ajustar Tempo"
          >
            <Settings size={22} color="#7A8A7B" />
          </button>
        </div>

        {/* Progress Cards - Contabilização Funcional */}
        <div className="px-6 pb-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 17, color: "#2D3A2E", margin: 0 }}>
              Progresso de Metas
            </h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#D68C70" }}>
              {challengeTab === "daily" ? "Diárias" : challengeTab === "weekly" ? "Semanais" : "Mensais"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
              borderRadius: 16,
              padding: "16px 14px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(214,140,112,0.12)" }} />
              <p style={{ fontSize: 11, color: "rgba(253,251,247,0.6)", fontWeight: 500, margin: 0 }}>Total de Metas</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "#FDFBF7", fontWeight: 400, marginTop: 4, margin: 0 }}>
                {totalGoals}
              </p>
              <p style={{ fontSize: 11, color: "rgba(253,251,247,0.5)", marginTop: 2, margin: 0 }}>
                {totalGoals === 1 ? "meta ativa" : "metas ativas"}
              </p>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "16px 14px",
              border: "1px solid rgba(214,140,112,0.2)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500, margin: 0 }}>Concluídas</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "#D68C70", fontWeight: 400, marginTop: 4, margin: 0 }}>
                {completedGoals}
              </p>
              <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 2, margin: 0 }}>
                de {totalGoals} ({goalPercentage}%)
              </p>
            </div>
          </div>

          {/* Barra de Progresso Real */}
          <div style={{ marginTop: 10, background: "#F5EFE3", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(45,58,46,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#2D3A2E" }}>Aproveitamento das Metas</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#D68C70" }}>{goalPercentage}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#EDE7DA", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${goalPercentage}%`,
                borderRadius: 3,
                background: "linear-gradient(90deg, #D68C70, #6B8F6D)",
                transition: "width 0.5s ease",
              }} />
            </div>
            <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 6, margin: "6px 0 0 0" }}>
              {goalPercentage === 100 && totalGoals > 0
                ? "Parabéns! Todas as metas desta seção foram concluídas! 🎉"
                : `Você completou ${completedGoals} de ${totalGoals} metas. Continue firme!`}
            </p>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="px-6 pb-12">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 17, color: "#2D3A2E", margin: 0 }}>
              🎯 Suas Metas
            </h2>
            <button
              onClick={() => {
                setEditingMeta(null);
                setIsMetaModalOpen(true);
              }}
              style={{
                background: "#D68C70",
                color: "#FDFBF7",
                border: "none",
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 2px 8px rgba(214,140,112,0.25)",
              }}
            >
              <Plus size={15} />
              Nova Meta
            </button>
          </div>

          {/* Challenge Tabs */}
          <div style={{
            display: "flex",
            background: "#F5EFE3",
            borderRadius: 12,
            padding: 4,
            gap: 4,
            marginBottom: 12,
          }}>
            {(['daily', 'weekly', 'monthly'] as ChallengeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setChallengeTab(tab)}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  background: challengeTab === tab ? "#FDFBF7" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: challengeTab === tab ? 600 : 400,
                  color: challengeTab === tab ? "#2D3A2E" : "#7A8A7B",
                  transition: "all 0.2s",
                }}
              >
                {tab === 'daily' && 'Diárias'}
                {tab === 'weekly' && 'Semanais'}
                {tab === 'monthly' && 'Mensais'}
              </button>
            ))}
          </div>

          {/* Challenge list */}
          {activeChallenges.length === 0 ? (
            <div
              style={{
                background: "#F5EFE3",
                borderRadius: 14,
                padding: "24px 16px",
                textAlign: "center",
                border: "1px dashed rgba(214,140,112,0.4)",
              }}
            >
              <p style={{ fontSize: 13, color: "#7A8A7B", margin: 0 }}>
                Nenhuma meta cadastrada para esta seção.
              </p>
              <button
                onClick={() => {
                  setEditingMeta(null);
                  setIsMetaModalOpen(true);
                }}
                style={{
                  marginTop: 8,
                  background: "none",
                  border: "none",
                  color: "#D68C70",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                + Adicionar primeira meta
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {activeChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => handleChallengeToggle(challenge.id)}
                  style={{
                    background: challenge.completed ? "rgba(214,140,112,0.1)" : "#F5EFE3",
                    border: challenge.completed ? "1.5px solid #D68C70" : "1px solid rgba(45,58,46,0.08)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ flexShrink: 0 }}>
                      {challenge.completed ? (
                        <CheckCircle2 size={22} color="#D68C70" fill="#D68C70" />
                      ) : (
                        <Circle size={22} color="#C4B89A" strokeWidth={1.5} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: challenge.completed ? "#D68C70" : "#2D3A2E",
                        textDecoration: challenge.completed ? "line-through" : "none",
                        textDecorationColor: "#D68C70",
                        lineHeight: 1.35,
                      }}>
                        {challenge.title}
                      </p>
                      {challenge.points && (
                        <span style={{ fontSize: 10, color: "#7A8A7B", marginTop: 2, display: "inline-block" }}>
                          +{challenge.points} pts ao concluir
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Editar e Excluir */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingMeta({
                          id: challenge.id,
                          title: challenge.title,
                          category: challenge.category,
                          points: challenge.points,
                          completed: challenge.completed,
                        });
                        setIsMetaModalOpen(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        color: "#7A8A7B",
                        borderRadius: 6,
                      }}
                      title="Editar meta"
                      aria-label="Editar meta"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteMeta(challenge.id, e)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        color: "#C4785A",
                        borderRadius: 6,
                      }}
                      title="Excluir meta"
                      aria-label="Excluir meta"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <PomodoroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={pomodoroConfig}
        onSave={handleSavePomodoroConfig}
      />

      <MetaModal
        isOpen={isMetaModalOpen}
        onClose={() => {
          setIsMetaModalOpen(false);
          setEditingMeta(null);
        }}
        onSave={handleSaveMeta}
        initialMeta={editingMeta}
        defaultCategory={challengeTab}
      />
    </div>
  );
}
