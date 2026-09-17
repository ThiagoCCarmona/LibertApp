import React, { useState } from "react";
import { X, Check, RotateCcw, Clock, Coffee, Sparkles } from "lucide-react";

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  dailyGoal: number;
}

interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: PomodoroConfig;
  onSave: (config: PomodoroConfig) => void;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  dailyGoal: 4,
};

const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 50];
const SHORT_BREAK_OPTIONS = [3, 5, 10];
const LONG_BREAK_OPTIONS = [10, 15, 20, 30];
const GOAL_OPTIONS = [2, 4, 6, 8];

export function PomodoroSettingsModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: PomodoroSettingsModalProps) {
  const [config, setConfig] = useState<PomodoroConfig>(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 115,
        backgroundColor: "rgba(45, 58, 46, 0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#FDFBF7",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "20px 24px 28px 24px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 30px rgba(45, 58, 46, 0.15)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(45, 58, 46, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(214, 140, 112, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={20} color="#D68C70" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: "#2D3A2E",
                  margin: 0,
                }}
              >
                Ajustar Pomodoro
              </h2>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                Personalize seus ciclos de concentração
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#F5EFE3",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Fechar"
          >
            <X size={18} color="#2D3A2E" />
          </button>
        </div>

        {/* Form Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Foco Total */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D68C70" }} />
                Foco Total
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#D68C70" }}>
                {config.focusMinutes} min
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {FOCUS_OPTIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, focusMinutes: min }))}
                  style={{
                    flex: 1,
                    minWidth: 46,
                    padding: "8px 0",
                    background: config.focusMinutes === min ? "#D68C70" : "#F5EFE3",
                    color: config.focusMinutes === min ? "#FDFBF7" : "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Pausa Curta */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", display: "flex", alignItems: "center", gap: 6 }}>
                <Coffee size={15} color="#6B8F6D" />
                Pausa Curta
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6B8F6D" }}>
                {config.shortBreakMinutes} min
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {SHORT_BREAK_OPTIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, shortBreakMinutes: min }))}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: config.shortBreakMinutes === min ? "#6B8F6D" : "#F5EFE3",
                    color: config.shortBreakMinutes === min ? "#FDFBF7" : "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Pausa Longa */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4A882" }} />
                Pausa Longa
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#C4A882" }}>
                {config.longBreakMinutes} min
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {LONG_BREAK_OPTIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, longBreakMinutes: min }))}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: config.longBreakMinutes === min ? "#C4A882" : "#F5EFE3",
                    color: config.longBreakMinutes === min ? "#FDFBF7" : "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Meta Diária de Sessões */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={15} color="#D68C70" />
                Meta Diária de Sessões
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2D3A2E" }}>
                {config.dailyGoal} sessões
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, dailyGoal: goal }))}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: config.dailyGoal === goal ? "#2D3A2E" : "#F5EFE3",
                    color: config.dailyGoal === goal ? "#FDFBF7" : "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons Action */}
        <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 14, borderTop: "1px solid rgba(45, 58, 46, 0.08)" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "12px 14px",
              background: "#F5EFE3",
              color: "#7A8A7B",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RotateCcw size={16} />
            Padrão
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
              color: "#FDFBF7",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(214, 140, 112, 0.3)",
            }}
          >
            <Check size={18} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
