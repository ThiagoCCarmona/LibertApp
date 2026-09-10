import { useState } from "react";
import { Home, Activity, CreditCard, User, ChevronRight } from "lucide-react";
import type { Screen } from "../App";

const StatusBar = () => (
  <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ color: "#7A8A7B", fontSize: 12, fontWeight: 500 }}>
    <span>9:41</span>
    <div className="flex items-center gap-[5px]">
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="4" width="3" height="7" rx="0.8" opacity="0.4" /><rect x="4.5" y="3" width="3" height="8" rx="0.8" opacity="0.6" /><rect x="9" y="1" width="3" height="10" rx="0.8" opacity="0.8" /><rect x="13.5" y="0" width="2.5" height="11" rx="0.8" /></svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 2.5 C4.5 2.5 1.8 3.8 0 5.9 L1.5 7.4 C2.9 5.7 5.1 4.6 7.5 4.6 C9.9 4.6 12.1 5.7 13.5 7.4 L15 5.9 C13.2 3.8 10.5 2.5 7.5 2.5Z" /><path d="M7.5 6.5 C6 6.5 4.6 7.1 3.6 8.1 L5.1 9.6 C5.7 9 6.5 8.6 7.5 8.6 C8.5 8.6 9.3 9 9.9 9.6 L11.4 8.1 C10.4 7.1 9 6.5 7.5 6.5Z" /><circle cx="7.5" cy="11" r="1.4" /></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><path d="M23 4.5 C24 5 24 7 23 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    </div>
  </div>
);

const CircularProgress = ({ value, max, size = 100 }: { value: number; max: number; size?: number }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const progress = (value / max) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" aria-hidden="true">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(214,140,112,0.2)" strokeWidth="8" />
      <circle
        cx="44" cy="44" r={r} fill="none" stroke="#D68C70" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${progress} ${circ}`}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

const activities = [
  {
    id: "trilhas",
    label: "Trilhas",
    emoji: "🌿",
    description: "Caminhos ao ar livre",
    color: "#6B8F6D",
    bg: "#EBF3EB",
    img: "https://images.unsplash.com/photo-1581285402076-74c8bb8f5c66?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "gincanas",
    label: "Gincanas",
    emoji: "🎲",
    description: "Brincadeiras em grupo",
    color: "#C4A882",
    bg: "#F5EEE3",
    img: "https://images.unsplash.com/photo-1730804518415-75297e8d2a41?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "cerebro",
    label: "Cérebro em Ação",
    emoji: "🧠",
    description: "Exercícios cognitivos",
    color: "#7A8A7B",
    bg: "#EDE7DA",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop&auto=format",
  },
];

export function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState<"home" | "activities" | "card" | "profile">("home");

  const screenTimeHours = 3;
  const screenTimeMins = 20;
  const dailyGoalHours = 5;
  const totalMinutes = screenTimeHours * 60 + screenTimeMins;
  const goalMinutes = dailyGoalHours * 60;

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <StatusBar />

      <div className="flex-1 overflow-y-auto pb-2">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <p style={{ fontSize: 13, color: "#7A8A7B", fontWeight: 400 }}>Boa manhã,</p>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", lineHeight: 1.2, marginTop: 1 }}>
              Silvia 👋
            </h1>
          </div>
          <button
            style={{
              width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid #D68C70",
              padding: 0, cursor: "pointer", background: "none",
            }}
            aria-label="Perfil"
            onClick={() => setActiveTab("profile")}
          >
            <img
              src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=100&h=100&fit=crop&auto=format"
              alt="Silvia Mendes"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        </div>

        {/* Consciência Digital Card */}
        <div className="px-6 pt-2 pb-4">
          <div style={{
            background: "linear-gradient(135deg, #2D3A2E 0%, #3D4E3F 100%)",
            borderRadius: 20, padding: "20px", overflow: "hidden", position: "relative",
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(214,140,112,0.12)" }} />
            <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: "50%", background: "rgba(214,140,112,0.07)" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(253,251,247,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Consciência Digital
                </p>
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 400, color: "#FDFBF7", lineHeight: 1 }}>
                      {screenTimeHours}h {screenTimeMins}min
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(253,251,247,0.65)", marginTop: 6, lineHeight: 1.4 }}>
                    de tela hoje
                  </p>
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ background: "rgba(107,143,109,0.25)", borderRadius: 20, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9 L6 3 L10 9" stroke="#6B8F6D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span style={{ fontSize: 12, color: "#A8CBA9", fontWeight: 500 }}>↓ 45min a menos que ontem</span>
                  </div>
                </div>
              </div>

              <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                <CircularProgress value={totalMinutes} max={goalMinutes} size={90} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#FDFBF7" }}>
                    {Math.round((totalMinutes / goalMinutes) * 100)}%
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(253,251,247,0.5)", marginTop: 1 }}>da meta</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, height: 4, background: "rgba(253,251,247,0.12)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(totalMinutes / goalMinutes) * 100}%`, background: "#D68C70", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 11, color: "rgba(253,251,247,0.45)", marginTop: 6 }}>
              Meta: até {dailyGoalHours}h por dia
            </p>
          </div>
        </div>

        {/* Atividades Offline */}
        <div className="px-6 pb-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E" }}>
              Atividades Offline
            </h2>
            <button style={{ background: "none", border: "none", color: "#D68C70", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Ver todas
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {activities.map(act => (
              <button
                key={act.id}
                style={{
                  background: act.bg, border: "none", borderRadius: 16, overflow: "hidden",
                  cursor: "pointer", textAlign: "left", padding: 0, display: "flex", flexDirection: "column",
                  transition: "transform 0.15s",
                }}
                aria-label={act.label}
              >
                <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", position: "relative" }}>
                  <img
                    src={act.img}
                    alt={act.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${act.bg}CC)` }} />
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 18 }}>{act.emoji}</span>
                </div>
                <div style={{ padding: "8px 10px 10px" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", lineHeight: 1.3 }}>{act.label}</p>
                  <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 2, lineHeight: 1.3 }}>{act.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carteirinha Shortcut */}
        <div className="px-6 pb-4">
          <button
            onClick={() => onNavigate("carteirinha")}
            style={{
              width: "100%", background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
              border: "none", borderRadius: 16, padding: "18px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 6px 20px rgba(214,140,112,0.3)",
            }}
            aria-label="Acessar Carteirinha Digital de Benefícios"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: "rgba(253,251,247,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <CreditCard size={22} color="#FDFBF7" />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 11, color: "rgba(253,251,247,0.7)", fontWeight: 500, letterSpacing: "0.04em" }}>
                  Seu acesso
                </p>
                <p style={{ fontSize: 15, color: "#FDFBF7", fontWeight: 600, marginTop: 2 }}>
                  Carteirinha Digital de Benefícios
                </p>
              </div>
            </div>
            <ChevronRight size={20} color="rgba(253,251,247,0.8)" />
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        display: "flex", borderTop: "1px solid rgba(45,58,46,0.08)",
        background: "#FDFBF7", paddingBottom: 8, paddingTop: 4,
      }}>
        {[
          { id: "home", icon: Home, label: "Início" },
          { id: "activities", icon: Activity, label: "Atividades" },
          { id: "card", icon: CreditCard, label: "Benefícios" },
          { id: "profile", icon: User, label: "Perfil" },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "card") { onNavigate("carteirinha"); return; }
                setActiveTab(tab.id as typeof activeTab);
              }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, background: "none", border: "none", cursor: "pointer",
                padding: "8px 0",
              }}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <tab.icon size={22} color={active ? "#D68C70" : "#7A8A7B"} strokeWidth={active ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "#D68C70" : "#7A8A7B", fontFamily: "'DM Sans', sans-serif" }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
