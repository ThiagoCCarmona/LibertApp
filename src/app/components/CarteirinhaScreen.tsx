import { useState } from "react";
import { ChevronLeft, Home, Activity, CreditCard, User, CheckCircle, Lock } from "lucide-react";
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

const LibertLogoSmall = () => (
  <svg width="24" height="24" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22 36 L22 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 26 Q16 24 14 18" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M22 21 Q28 19 30 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="22" cy="10" rx="3" ry="4" fill="rgba(253,251,247,0.4)" />
  </svg>
);

const restaurants = [
  { id: 1, name: "Verde Brasil", cuisine: "Culinária saudável · Centro", unlocked: true, emoji: "🥗" },
  { id: 2, name: "Café do Bem", cuisine: "Café orgânico · Vila Madalena", unlocked: true, emoji: "☕" },
  { id: 3, name: "Raízes", cuisine: "Comida vegetariana · Pinheiros", unlocked: true, emoji: "🌱" },
  { id: 4, name: "Horta & Mesa", cuisine: "Farm to table · Itaim", unlocked: false, emoji: "🥬" },
  { id: 5, name: "Bio Burguer", cuisine: "Lanches saudáveis · Moema", unlocked: false, emoji: "🍔" },
];

export function CarteirinhaScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const unlockedCount = restaurants.filter(r => r.unlocked).length;
  const totalCount = restaurants.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-1 pb-2">
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex", alignItems: "center", background: "none", border: "none",
            color: "#7A8A7B", cursor: "pointer", padding: "8px 4px",
          }}
          aria-label="Voltar"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E" }}>
          Carteirinha Digital
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* The Card */}
        <div className="px-5 pb-4">
          <div style={{
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 12px 40px rgba(45,58,46,0.18), 0 2px 8px rgba(45,58,46,0.08)",
            position: "relative",
          }}>
            {/* Card front */}
            <div style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 40%, #4A6050 100%)",
              padding: "24px 22px 20px",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(214,140,112,0.12)" }} />
              <div style={{ position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(214,140,112,0.07)" }} />
              <div style={{ position: "absolute", top: 60, right: 40, width: 50, height: 50, borderRadius: "50%", background: "rgba(214,140,112,0.06)" }} />

              {/* Top row: logo + member badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <LibertLogoSmall />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(253,251,247,0.9)", letterSpacing: "0.02em" }}>LibertApp</span>
                </div>
                <div style={{
                  background: "rgba(214,140,112,0.25)", borderRadius: 20,
                  padding: "4px 12px", border: "1px solid rgba(214,140,112,0.4)",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#D68C70", letterSpacing: "0.05em" }}>MEMBRO ATIVO</span>
                </div>
              </div>

              {/* Profile section */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, position: "relative" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                  border: "3px solid rgba(214,140,112,0.6)", flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=200&h=200&fit=crop&auto=format"
                    alt="Foto de Silvia Mendes"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <h2 style={{
                    fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 22,
                    color: "#FDFBF7", lineHeight: 1.1, letterSpacing: "-0.3px",
                  }}>
                    Silvia
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(253,251,247,0.55)", marginTop: 3, fontWeight: 400 }}>
                    Silvia Mendes
                  </p>
                </div>
              </div>

              {/* Info row */}
              <div style={{ display: "flex", gap: 24, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(253,251,247,0.1)", position: "relative" }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(253,251,247,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Data de Nascimento</p>
                  <p style={{ fontSize: 14, color: "rgba(253,251,247,0.85)", fontWeight: 500, marginTop: 3 }}>12/04/1992</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(253,251,247,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Nº do Cartão</p>
                  <p style={{ fontSize: 14, color: "rgba(253,251,247,0.85)", fontWeight: 500, marginTop: 3, letterSpacing: "0.05em" }}>LB-2024-4892</p>
                </div>
              </div>
            </div>

            {/* Progress bar section (card bottom) */}
            <div style={{ background: "#F5EFE3", padding: "16px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E" }}>Benefícios Desbloqueados</p>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D68C70" }}>{unlockedCount}/{totalCount}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "#EDE7DA", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progress}%`, borderRadius: 4,
                  background: "linear-gradient(90deg, #D68C70, #C4785A)",
                  transition: "width 0.8s ease",
                }} />
              </div>
              <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 6 }}>
                {totalCount - unlockedCount} restaurante{totalCount - unlockedCount !== 1 ? "s" : ""} para desbloquear
              </p>
            </div>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="px-5 pb-4">
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 17, color: "#2D3A2E", marginBottom: 12 }}>
            Restaurantes Parceiros
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {restaurants.map(r => (
              <div
                key={r.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: r.unlocked ? "#F5EFE3" : "#FDFBF7",
                  border: r.unlocked ? "1px solid rgba(107,143,109,0.2)" : "1px solid rgba(45,58,46,0.08)",
                  borderRadius: 14, padding: "14px 16px",
                  opacity: r.unlocked ? 1 : 0.65,
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: r.unlocked ? "#EBF3EB" : "#EDE7DA",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>
                  {r.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#2D3A2E", lineHeight: 1.3 }}>{r.name}</p>
                  <p style={{ fontSize: 12, color: "#7A8A7B", marginTop: 2 }}>{r.cuisine}</p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {r.unlocked
                    ? <CheckCircle size={20} color="#6B8F6D" strokeWidth={2} aria-label="Desbloqueado" />
                    : <Lock size={18} color="#C4B89A" strokeWidth={1.5} aria-label="Bloqueado" />
                  }
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, background: "rgba(214,140,112,0.08)",
            border: "1px solid rgba(214,140,112,0.2)", borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <p style={{ fontSize: 12, color: "#7A8A7B", lineHeight: 1.5 }}>
              Continue suas atividades offline para desbloquear mais restaurantes!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        display: "flex", borderTop: "1px solid rgba(45,58,46,0.08)",
        background: "#FDFBF7", paddingBottom: 8, paddingTop: 4,
      }}>
        {[
          { id: "home", icon: Home, label: "Início", screen: "home" as Screen },
          { id: "activities", icon: Activity, label: "Atividades", screen: "home" as Screen },
          { id: "card", icon: CreditCard, label: "Benefícios", screen: "carteirinha" as Screen },
          { id: "profile", icon: User, label: "Perfil", screen: "home" as Screen },
        ].map(tab => {
          const active = tab.id === "card";
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.screen)}
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
