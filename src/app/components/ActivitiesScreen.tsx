import * as React from "react";
import { Play, Pause, Settings, CheckCircle2, Circle } from "lucide-react";

type PomodoroMode = "focus" | "short-break" | "long-break";
type ChallengeTab = "daily" | "weekly" | "monthly";

const modeConfig = {
  focus: { label: "Foco Total", minutes: 25, color: "#D68C70" },
  "short-break": { label: "Pausa Curta", minutes: 5, color: "#6B8F6D" },
  "long-break": { label: "Pausa Longa", minutes: 15, color: "#C4A882" },
};

const challengeData = {
  daily: [
    { id: 1, title: "Ficar 30 min offline", completed: true },
    { id: 2, title: "Completar 2 Pomodoros", completed: false },
    { id: 3, title: "Fazer 1 pausa ativa", completed: false },
  ],
  weekly: [
    { id: 1, title: "Fazer uma caminhada na natureza", completed: false },
    { id: 2, title: "Meditar 3x", completed: true },
    { id: 3, title: "Conectar com alguém presencialmente", completed: false },
  ],
  monthly: [
    { id: 1, title: "Participar de 1 gincana presencial", completed: false },
    { id: 2, title: "Ler 1 livro completo", completed: false },
    { id: 3, title: "Fazer 1 atividade em grupo", completed: false },
  ],
};

export function ActivitiesScreen() {
  const [mode, setMode] = React.useState<PomodoroMode>("focus");
  const [isRunning, setIsRunning] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [challengeTab, setChallengeTab] = React.useState<ChallengeTab>("daily");
  const [challenges, setChallenges] = React.useState(challengeData);

  // Timer interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = modeConfig[mode].minutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const todayGoal = 4;
  const todayCompleted = 2;

  const handleChallengeToggle = (id: number) => {
    setChallenges(prev => ({
      ...prev,
      [challengeTab]: prev[challengeTab].map(c => 
        c.id === id ? { ...c, completed: !c.completed } : c
      ),
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-4 pb-3">
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E" }}>
            Pomodoro
          </h1>
          <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 2 }}>Tempo de Foco</p>
        </div>

        {/* Mode Selector */}
        <div className="px-6 pb-4">
          <div style={{
            display: "flex",
            background: "#F5EFE3",
            borderRadius: 12,
            padding: 4,
            gap: 4,
          }}>
            {(Object.keys(modeConfig) as PomodoroMode[]).map(m => (
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
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? "#2D3A2E" : "#7A8A7B",
                  transition: "all 0.2s",
                  boxShadow: mode === m ? "0 2px 8px rgba(45,58,46,0.08)" : "none",
                }}
              >
                {modeConfig[m].label}
              </button>
            ))}
          </div>
        </div>

        {/* Pomodoro Timer Circle */}
        <div className="px-6 pt-6 pb-8" style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 260, height: 260 }}>
            <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)" }}>
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
                fontSize: 56,
                fontWeight: 400,
                color: "#2D3A2E",
                lineHeight: 1,
                letterSpacing: "-1px",
              }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 8 }}>
                {modeConfig[mode].label}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 pb-6" style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
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
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#F5EFE3",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Ajustar Tempo"
          >
            <Settings size={22} color="#7A8A7B" />
          </button>
        </div>

        {/* Progress Cards */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 17, color: "#2D3A2E", marginBottom: 12 }}>
            Progresso de Hoje
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
              borderRadius: 16,
              padding: "16px 14px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(214,140,112,0.12)" }} />
              <p style={{ fontSize: 11, color: "rgba(253,251,247,0.6)", fontWeight: 500, position: "relative" }}>Meta Diária</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "#FDFBF7", fontWeight: 400, marginTop: 4, position: "relative" }}>
                {todayGoal}
              </p>
              <p style={{ fontSize: 11, color: "rgba(253,251,247,0.5)", marginTop: 2, position: "relative" }}>sessões</p>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "16px 14px",
              border: "1px solid rgba(214,140,112,0.2)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Completadas</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "#D68C70", fontWeight: 400, marginTop: 4 }}>
                {todayCompleted}
              </p>
              <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 2 }}>de {todayGoal}</p>
            </div>
          </div>

          <div style={{
            marginTop: 10,
            background: "rgba(107,143,109,0.08)",
            border: "1px solid rgba(107,143,109,0.2)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <p style={{ fontSize: 12, color: "#7A8A7B", lineHeight: 1.4 }}>
              Mantenha o foco! Você está {Math.round((todayCompleted / todayGoal) * 100)}% do caminho.
            </p>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 17, color: "#2D3A2E", marginBottom: 12 }}>
            🎯 Desafios
          </h2>

          {/* Challenge Tabs */}
          <div style={{
            display: "flex",
            background: "#F5EFE3",
            borderRadius: 12,
            padding: 4,
            gap: 4,
            marginBottom: 12,
          }}>
            {(['daily', 'weekly', 'monthly'] as ChallengeTab[]).map(tab => (
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
                {tab === 'daily' && 'Diários'}
                {tab === 'weekly' && 'Semanais'}
                {tab === 'monthly' && 'Mensais'}
              </button>
            ))}
          </div>

          {/* Challenge list */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            {challenges[challengeTab].map(challenge => (
              <button
                key={challenge.id}
                onClick={() => handleChallengeToggle(challenge.id)}
                style={{
                  background: challenge.completed ? "rgba(214,140,112,0.1)" : "#F5EFE3",
                  border: challenge.completed ? "1px solid #D68C70" : "1px solid rgba(45,58,46,0.08)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {challenge.completed ? (
                    <CheckCircle2 size={20} color="#D68C70" fill="#D68C70" />
                  ) : (
                    <Circle size={20} color="#C4B89A" strokeWidth={1.5} />
                  )}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 500,
                  color: challenge.completed ? "#D68C70" : "#2D3A2E",
                  textDecoration: challenge.completed ? "line-through" : "none",
                  textDecorationColor: "#D68C70",
                }}>
                  {challenge.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
