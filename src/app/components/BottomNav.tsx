import { Home, Activity, User } from "lucide-react";

type Tab = "home" | "activities" | "profile";

export function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const tabs = [
    { id: "home" as Tab, icon: Home, label: "Início" },
    { id: "activities" as Tab, icon: Activity, label: "Atividades" },
    { id: "profile" as Tab, icon: User, label: "Perfil" },
  ];

  return (
    <div style={{
      display: "flex",
      borderTop: "1px solid rgba(45,58,46,0.08)",
      background: "#FDFBF7",
      paddingBottom: 8,
      paddingTop: 4,
    }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 0",
            }}
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
          >
            <tab.icon size={22} color={active ? "#D68C70" : "#7A8A7B"} strokeWidth={active ? 2 : 1.5} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? "#D68C70" : "#7A8A7B",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
