import React, { useState } from "react";
import { X, Trophy, Flame, Clock, Award, ThumbsUp, Check, UserPlus, UserCheck } from "lucide-react";

export interface UserProfileData {
  id?: number;
  name: string;
  avatar: string;
  level: number;
  levelName: string;
  points: number;
  streakDays: number;
  focusMinutes: number;
  bio?: string;
  department?: string;
  isFollowing?: boolean;
  achievements?: {
    icon: string;
    title: string;
    description: string;
  }[];
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData | null;
  onToggleFollow?: (userId: number | string, following: boolean) => void;
}

export function UserProfileModal({ isOpen, onClose, user, onToggleFollow }: UserProfileModalProps) {
  const [incentiveSent, setIncentiveSent] = useState(false);
  const [following, setFollowing] = useState(user?.isFollowing ?? false);

  React.useEffect(() => {
    if (user) {
      setFollowing(user.isFollowing ?? false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleToggleFollow = () => {
    const nextState = !following;
    setFollowing(nextState);
    if (onToggleFollow && user.id) {
      onToggleFollow(user.id, nextState);
    }
  };

  const handleSendIncentive = () => {
    setIncentiveSent(true);
    setTimeout(() => setIncentiveSent(false), 3000);
  };

  const defaultAchievements = [
    { icon: "🌱", title: "Primeira Raiz", description: "Iniciou os primeiros blocos de foco offline" },
    { icon: "🛡️", title: "Escudo Digital", description: "3 dias seguidos atingindo a meta de desconexão" },
    { icon: "🏔️", title: "Trilha Verde", description: "Completou um desafio presencial na natureza" },
  ];

  const achievements = user.achievements || defaultAchievements;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        backgroundColor: "rgba(45, 58, 46, 0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          background: "#FDFBF7",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 24px 28px 24px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 30px rgba(45, 58, 46, 0.15)",
          overflowY: "auto",
        }}
      >
        {/* Header Close */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
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

        {/* Profile Card Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #D68C70",
                boxShadow: "0 4px 12px rgba(214,140,112,0.3)",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                background: "#2D3A2E",
                color: "#FDFBF7",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 10,
                padding: "2px 7px",
                border: "2px solid #FDFBF7",
              }}
            >
              Nv {user.level}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 500,
              color: "#2D3A2E",
              margin: "0 0 2px 0",
            }}
          >
            {user.name}
          </h2>

          <p style={{ fontSize: 12, color: "#D68C70", fontWeight: 600, margin: "0 0 4px 0" }}>
            {user.levelName || `Nível ${user.level} - Foco Consciente`}
          </p>

          <p style={{ fontSize: 12, color: "#7A8A7B", margin: "0 0 14px 0" }}>
            {user.department || "Membro da Comunidade Carmelita"}
          </p>

          {user.bio && (
            <p
              style={{
                fontSize: 13,
                color: "#2D3A2E",
                background: "#F5EFE3",
                borderRadius: 12,
                padding: "8px 14px",
                margin: "0 0 16px 0",
                lineHeight: 1.4,
              }}
            >
              "{user.bio}"
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "#FAF7F0",
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              border: "1px solid rgba(45,58,46,0.06)",
            }}
          >
            <Trophy size={18} color="#D68C70" style={{ margin: "0 auto 4px auto" }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{user.points}</p>
            <p style={{ fontSize: 10, color: "#7A8A7B", margin: 0 }}>Pontos</p>
          </div>

          <div
            style={{
              background: "#FAF7F0",
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              border: "1px solid rgba(45,58,46,0.06)",
            }}
          >
            <Clock size={18} color="#C4A882" style={{ margin: "0 auto 4px auto" }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{user.focusMinutes}m</p>
            <p style={{ fontSize: 10, color: "#7A8A7B", margin: 0 }}>Foco Off</p>
          </div>

          <div
            style={{
              background: "#FAF7F0",
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              border: "1px solid rgba(45,58,46,0.06)",
            }}
          >
            <Flame size={18} color="#E06D53" style={{ margin: "0 auto 4px auto" }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{user.streakDays}d</p>
            <p style={{ fontSize: 10, color: "#7A8A7B", margin: 0 }}>Sequência</p>
          </div>
        </div>

        {/* Conquistas Recentes */}
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2D3A2E",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Award size={15} color="#D68C70" /> Conquistas em Destaque
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#F5EFE3",
                  borderRadius: 12,
                  padding: "10px 14px",
                }}
              >
                <span style={{ fontSize: 20 }}>{ach.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>{ach.title}</p>
                  <p style={{ fontSize: 10, color: "#7A8A7B", margin: "2px 0 0 0" }}>{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Seguir e Parabenizar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleToggleFollow}
            style={{
              background: following ? "#FAF7F0" : "linear-gradient(135deg, #D68C70, #C4785A)",
              color: following ? "#2D3A2E" : "#FDFBF7",
              border: following ? "1.5px solid rgba(45, 58, 46, 0.15)" : "none",
              borderRadius: 14,
              padding: "12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: following ? "none" : "0 4px 14px rgba(214,140,112,0.25)",
              transition: "all 0.2s ease",
            }}
          >
            {following ? (
              <>
                <UserCheck size={16} color="#3E5C43" /> Seguindo
              </>
            ) : (
              <>
                <UserPlus size={16} color="#FDFBF7" /> Seguir Colega
              </>
            )}
          </button>

          <button
            onClick={handleSendIncentive}
            style={{
              background: incentiveSent ? "#3E5C43" : "#F5EFE3",
              color: incentiveSent ? "#FDFBF7" : "#2D3A2E",
              border: "1px solid rgba(45, 58, 46, 0.08)",
              borderRadius: 14,
              padding: "12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
            }}
          >
            {incentiveSent ? (
              <>
                <Check size={16} /> Incentivo enviado! 🎉
              </>
            ) : (
              <>
                <ThumbsUp size={16} color="#D68C70" /> Incentivar Colega
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
