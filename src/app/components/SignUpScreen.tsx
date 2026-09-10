import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Screen } from "../App";

const LibertLogo = () => (
  <img
    src={new URL("../../../telas/icone libertapp.jpeg", import.meta.url).href}
    alt="LibertApp logo"
  width={96}
  height={96}
    style={{ objectFit: "contain" }}
  />
);

// StatusBar is rendered centrally in App.tsx to avoid duplication

const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
  <label className="flex items-start justify-between gap-3 cursor-pointer group">
    <div className="flex-1 min-w-0">
      <p style={{ color: "#2D3A2E", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{label}</p>
      <p style={{ color: "#7A8A7B", fontSize: 12, fontWeight: 400, lineHeight: 1.4, marginTop: 2 }}>{description}</p>
    </div>
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={e => { if (e.key === " " || e.key === "Enter") onChange(!checked); }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? "#D68C70" : "#C4B89A",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s ease",
        cursor: "pointer",
        outline: "none",
        marginTop: 2,
      }}
      aria-label={label}
    >
      <div style={{
        position: "absolute",
        top: 3,
        left: checked ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#FDFBF7",
        boxShadow: "0 1px 4px rgba(45,58,46,0.18)",
        transition: "left 0.2s ease",
      }} />
    </div>
  </label>
);

export function SignUpScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [gentleNotifs, setGentleNotifs] = useState(true);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col items-center pt-6 pb-3 px-6">
        <LibertLogo />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 26, color: "#2D3A2E", marginTop: 12, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
          Crie sua conta
        </h1>
        <p style={{ color: "#7A8A7B", fontSize: 14, marginTop: 6, textAlign: "center", lineHeight: 1.5 }}>
          Sua jornada de liberdade começa aqui.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-4">
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Nome completo</label>
          <input
            type="text"
            placeholder="Silvia Mendes"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 16px",
              fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="Nome completo"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>E-mail</label>
          <input
            type="email"
            placeholder="silvia@exemplo.com.br"
            style={{
              background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 16px",
              fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="E-mail"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 13, fontWeight: 500, color: "#7A8A7B" }}>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              style={{
                background: "#EDE7DA", border: "none", borderRadius: 12, padding: "14px 48px 14px 16px",
                fontSize: 15, color: "#2D3A2E", outline: "none", width: "100%",
                fontFamily: "'DM Sans', sans-serif",
              }}
              aria-label="Senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7A8A7B", padding: 4 }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <div style={{ background: "#F5EFE3", borderRadius: 16, padding: "16px", border: "1px solid rgba(45,58,46,0.08)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#7A8A7B", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
            Opções de Acessibilidade
          </p>
          <div className="flex flex-col gap-4">
            <Toggle
              checked={simpleMode}
              onChange={setSimpleMode}
              label="Modo de Leitura Simples"
              description="Interface com menos elementos visuais"
            />
            <Toggle
              checked={gentleNotifs}
              onChange={setGentleNotifs}
              label="Notificações Gentis"
              description="Lembretes suaves, sem pressão"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-4 mt-auto">
        <button
          onClick={() => onNavigate("home")}
          style={{
            width: "100%", background: "#D68C70", color: "#FDFBF7", border: "none",
            borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 16px rgba(214,140,112,0.35)",
            transition: "opacity 0.15s",
          }}
          aria-label="Criar conta"
        >
          Criar conta
        </button>

        <p style={{ textAlign: "center", color: "#7A8A7B", fontSize: 14, marginTop: 16 }}>
          Já tem conta?{" "}
          <button
            onClick={() => onNavigate("login")}
            style={{ background: "none", border: "none", color: "#D68C70", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
