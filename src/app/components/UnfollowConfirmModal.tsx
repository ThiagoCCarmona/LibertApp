import React from "react";
import { UserMinus } from "lucide-react";
import { useTranslation } from "../../i18n";

interface UnfollowConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userAvatar?: string;
}

export function UnfollowConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userAvatar,
}: UnfollowConfirmModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(45, 58, 46, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          background: "#FDFBF7",
          borderRadius: 24,
          padding: "24px 20px 20px",
          width: "100%",
          maxWidth: 320,
          boxShadow: "0 16px 40px rgba(45, 58, 46, 0.25)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Avatar or Icon */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #D68C70",
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(224, 109, 83, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserMinus size={28} color="#E06D53" />
            </div>
          )}
        </div>

        <h3
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 18,
            fontWeight: 500,
            color: "#2D3A2E",
            margin: "0 0 6px 0",
            lineHeight: 1.3,
          }}
        >
          {t("unfollow_btn")} {userName}?
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "#7A8A7B",
            lineHeight: 1.4,
            margin: "0 0 20px 0",
          }}
        >
          {t("unfollow_confirm_text")}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              width: "100%",
              background: "#E06D53",
              color: "#FDFBF7",
              border: "none",
              borderRadius: 14,
              padding: "12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            {t("unfollow_btn")}
          </button>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              background: "#F5EFE3",
              color: "#2D3A2E",
              border: "1px solid rgba(45, 58, 46, 0.08)",
              borderRadius: 14,
              padding: "12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("unfollow_cancel_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}
