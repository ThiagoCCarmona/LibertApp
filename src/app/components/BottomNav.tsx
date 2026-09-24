import { Home, Activity, User } from "lucide-react";
import { useTranslation } from "../../i18n";

type Tab = "home" | "activities" | "profile";

export function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const { t } = useTranslation();

  const tabs = [
    { id: "home" as Tab, icon: Home, label: t("nav_home", "Início") },
    { id: "activities" as Tab, icon: Activity, label: t("nav_activities", "Atividades") },
    { id: "profile" as Tab, icon: User, label: t("nav_profile", "Perfil") },
  ];

  return (
    <div style={{
      display: "flex",
      borderTop: "1px solid rgba(45,58,46,0.08)",
      background: "#FDFBF7",
      paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
      paddingTop: 6,
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
