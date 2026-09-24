import React, { useState, useEffect } from "react";
import { X, Check, Target, Award } from "lucide-react";
import { useTranslation } from "../../i18n";

export interface MetaItem {
  id?: number;
  title: string;
  category: "daily" | "weekly" | "monthly";
  points?: number;
  completed?: boolean;
}

interface MetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meta: MetaItem) => void;
  initialMeta?: MetaItem | null;
  defaultCategory?: "daily" | "weekly" | "monthly";
}

const POINTS_PRESETS = [30, 50, 75, 100, 150];

export function MetaModal({
  isOpen,
  onClose,
  onSave,
  initialMeta,
  defaultCategory = "daily",
}: MetaModalProps) {
  const { t } = useTranslation();

  const categories = [
    { id: "daily" as const, label: t("meta_period_daily") },
    { id: "weekly" as const, label: t("meta_period_weekly") },
    { id: "monthly" as const, label: t("meta_period_monthly") },
  ];

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"daily" | "weekly" | "monthly">(defaultCategory);
  const [points, setPoints] = useState(50);

  useEffect(() => {
    if (initialMeta) {
      setTitle(initialMeta.title);
      setCategory(initialMeta.category);
      setPoints(initialMeta.points || 50);
    } else {
      setTitle("");
      setCategory(defaultCategory);
      setPoints(50);
    }
  }, [initialMeta, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialMeta?.id,
      title: title.trim(),
      category,
      points,
      completed: initialMeta?.completed ?? false,
    });

    onClose();
  };

  const isEditing = !!initialMeta?.id;

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
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
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
              <Target size={20} color="#D68C70" />
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
                {isEditing ? t("meta_modal_edit_title") : t("meta_modal_new_title")}
              </h2>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                {t("meta_modal_sub")}
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
            aria-label={t("common_close")}
          >
            <X size={18} color="#2D3A2E" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Título */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("meta_title_label")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("meta_title_placeholder")}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                color: "#2D3A2E",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Categoria */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              {t("meta_period_label")}
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: category === cat.id ? "#2D3A2E" : "#F5EFE3",
                    color: category === cat.id ? "#FDFBF7" : "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pontos de Recompensa */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "flex", alignItems: "center", gap: 4 }}>
                <Award size={14} color="#D68C70" />
                {t("meta_points_label")}
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#D68C70" }}>
                +{points} pts
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {POINTS_PRESETS.map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setPoints(pts)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: points === pts ? "#D68C70" : "#F5EFE3",
                    color: points === pts ? "#FDFBF7" : "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  +{pts}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{ paddingTop: 10 }}>
            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                width: "100%",
                padding: "14px",
                background: title.trim()
                  ? "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)"
                  : "#E5DCCE",
                color: "#FDFBF7",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: title.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: title.trim() ? "0 4px 14px rgba(214, 140, 112, 0.3)" : "none",
                transition: "all 0.2s",
              }}
            >
              <Check size={18} />
              {isEditing ? t("meta_save_btn") : t("meta_create_btn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
