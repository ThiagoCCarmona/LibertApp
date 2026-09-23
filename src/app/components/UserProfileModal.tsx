import React, { useState, useEffect } from "react";
import { X, Trophy, Flame, Clock, Award, ThumbsUp, Check, UserPlus, UserCheck, MessageSquare, Image as ImageIcon } from "lucide-react";
import { UnfollowConfirmModal } from "./UnfollowConfirmModal";
import { apiService } from "../../services/apiService";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";
import { notify } from "../../services/notificationScheduler";
import { sendNativeMessage, sendNativeIncentive } from "../../services/nativeBridge";

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
  posts?: any[];
  achievements?: {
    icon: string;
    title: string;
    description: string;
  }[];
}

const INCENTIVE_STORAGE_KEY = "libertapp_incentives_sent";
const MAX_INCENTIVES_PER_HOUR = 3;
const ONE_HOUR_MS = 60 * 60 * 1000;

function getRecentIncentives(): number[] {
  try {
    const raw = localStorage.getItem(INCENTIVE_STORAGE_KEY);
    const list: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    return list.filter((t) => now - t < ONE_HOUR_MS);
  } catch {
    return [];
  }
}

function recordIncentive(): number[] {
  const recent = getRecentIncentives();
  recent.push(Date.now());
  localStorage.setItem(INCENTIVE_STORAGE_KEY, JSON.stringify(recent));
  return recent;
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
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>(user?.posts || []);
  const [profileDetails, setProfileDetails] = useState<UserProfileData | null>(user);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [recentIncentives, setRecentIncentives] = useState<number[]>(getRecentIncentives);

  const remainingIncentives = Math.max(0, MAX_INCENTIVES_PER_HOUR - recentIncentives.length);

  useEffect(() => {
    if (!isOpen || !user) return;
    setFollowing(user.isFollowing ?? false);
    setProfileDetails(user);

    // Se temos o ID do usuário, busca dados enriquecidos e posts reais da API
    if (user.id) {
      let isMounted = true;
      setLoadingPosts(true);
      const callerId = (() => {
        try {
          const s = localStorage.getItem("currentUser");
          return s ? JSON.parse(s)?.id || 1 : 1;
        } catch { return 1; }
      })();

      apiService.getUserProfile(user.id, callerId)
        .then((fullProfile) => {
          if (isMounted && fullProfile) {
            setProfileDetails((prev) => ({
              ...prev!,
              name: fullProfile.name || prev?.name || "Participante",
              avatar: fullProfile.avatar || prev?.avatar || DEFAULT_AVATAR_URL,
              level: fullProfile.level || prev?.level || 1,
              levelName: fullProfile.levelName || prev?.levelName || "Foco Consciente",
              points: fullProfile.points ?? prev?.points ?? 0,
              streakDays: fullProfile.streakDays ?? prev?.streakDays ?? 1,
              focusMinutes: fullProfile.focusMinutes ?? prev?.focusMinutes ?? 30,
              bio: fullProfile.bio || prev?.bio,
              department: fullProfile.department || prev?.department,
              isFollowing: fullProfile.isFollowing ?? prev?.isFollowing,
            }));
            if (fullProfile.posts && Array.isArray(fullProfile.posts)) {
              setUserPosts(fullProfile.posts);
            }
            if (typeof fullProfile.isFollowing === "boolean") {
              setFollowing(fullProfile.isFollowing);
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingPosts(false);
        });

      // Também busca os posts diretamente caso a rota profile retorne parcial
      apiService.getUserPosts(user.id)
        .then((posts) => {
          if (isMounted && posts && Array.isArray(posts) && posts.length > 0) {
            setUserPosts(posts);
          }
        })
        .catch(() => {});

      return () => { isMounted = false; };
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleToggleFollow = async () => {
    if (following) {
      // Solicita confirmação antes de deixar de seguir
      setShowUnfollowConfirm(true);
    } else {
      // Seguir diretamente
      setFollowing(true);
      if (onToggleFollow && user.id) {
        onToggleFollow(user.id, true);
      }
      const callerId = (() => {
        try {
          const s = localStorage.getItem("currentUser");
          return s ? JSON.parse(s)?.id || 1 : 1;
        } catch { return 1; }
      })();
      if (user.id) {
        try {
          await apiService.toggleFollow(user.id, callerId);
        } catch {
          try {
            await sendNativeMessage("TOGGLE_FOLLOW", { seguidoId: user.id });
          } catch {}
        }
      }
      notify({
        title: "Nova Conexão 🌱",
        message: `Você começou a seguir ${user.name}!`,
      });
    }
  };

  const handleConfirmUnfollow = async () => {
    setFollowing(false);
    setShowUnfollowConfirm(false);
    if (onToggleFollow && user.id) {
      onToggleFollow(user.id, false);
    }
    const callerId = (() => {
      try {
        const s = localStorage.getItem("currentUser");
        return s ? JSON.parse(s)?.id || 1 : 1;
      } catch { return 1; }
    })();
    if (user.id) {
      try {
        await apiService.toggleFollow(user.id, callerId);
      } catch {
        try {
          await sendNativeMessage("TOGGLE_FOLLOW", { seguidoId: user.id });
        } catch {}
      }
    }
    notify({
      title: "Conexão Atualizada",
      message: `Você deixou de seguir ${user.name}.`,
    });
  };

  const handleSendIncentive = async () => {
    const freshRecent = getRecentIncentives();
    if (freshRecent.length >= MAX_INCENTIVES_PER_HOUR) {
      const oldest = Math.min(...freshRecent);
      const minutesToWait = Math.max(1, Math.ceil((ONE_HOUR_MS - (Date.now() - oldest)) / 60000));
      notify({
        title: "Limite de Incentivos Atingido",
        message: `Você já enviou ${MAX_INCENTIVES_PER_HOUR} incentivos nesta hora. Aguarde ${minutesToWait} min para enviar novamente.`,
      });
      return;
    }

    const updated = recordIncentive();
    setRecentIncentives(updated);
    const newRemaining = Math.max(0, MAX_INCENTIVES_PER_HOUR - updated.length);

    setIncentiveSent(true);

    const callerId = (() => {
      try {
        const s = localStorage.getItem("currentUser");
        return s ? JSON.parse(s)?.id || 1 : 1;
      } catch { return 1; }
    })();

    if (user.id) {
      try {
        await apiService.sendIncentive(user.id, callerId);
      } catch {
        try {
          await sendNativeIncentive(user.id);
        } catch {}
      }
    }

    notify({
      title: "Incentivo Enviado! 🎉",
      message: `Você enviou um incentivo de presença para ${user.name}! (+5 pontos) • Restam ${newRemaining} nesta hora.`,
    });

    setTimeout(() => setIncentiveSent(false), 3500);
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
              src={profileDetails?.avatar || user.avatar}
              alt={profileDetails?.name || user.name}
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
              Nv {profileDetails?.level || user.level}
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
            {profileDetails?.name || user.name}
          </h2>

          <p style={{ fontSize: 12, color: "#D68C70", fontWeight: 600, margin: "0 0 4px 0" }}>
            {profileDetails?.levelName || user.levelName || `Nível ${profileDetails?.level || user.level} - Foco Consciente`}
          </p>

          <p style={{ fontSize: 12, color: "#7A8A7B", margin: "0 0 14px 0" }}>
            {profileDetails?.department || user.department || "Membro da Comunidade Carmelita"}
          </p>

          {(profileDetails?.bio || user.bio) && (
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
              "{profileDetails?.bio || user.bio}"
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
            <p style={{ fontSize: 16, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{profileDetails?.points ?? user.points}</p>
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
            <p style={{ fontSize: 16, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{profileDetails?.focusMinutes ?? user.focusMinutes}m</p>
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
            <p style={{ fontSize: 16, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{profileDetails?.streakDays ?? user.streakDays}d</p>
            <p style={{ fontSize: 10, color: "#7A8A7B", margin: 0 }}>Sequência</p>
          </div>
        </div>

        {/* Publicações do Usuário */}
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
            <ImageIcon size={15} color="#D68C70" /> Publicações no Mural ({userPosts.length})
          </h3>

          {loadingPosts ? (
            <p style={{ fontSize: 12, color: "#7A8A7B", textAlign: "center", padding: "10px 0" }}>Carregando publicações...</p>
          ) : userPosts.length === 0 ? (
            <div style={{ background: "#F5EFE3", borderRadius: 12, padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#7A8A7B", margin: 0 }}>Nenhuma publicação feita ainda por este colega.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {userPosts.map((p: any) => (
                <div
                  key={p.id}
                  style={{
                    background: "#FAF7F0",
                    borderRadius: 12,
                    padding: "12px",
                    border: "1px solid rgba(45,58,46,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#D68C70" }}>{p.icon || "🌱"} {p.type || "Momento"}</span>
                    <span style={{ fontSize: 10, color: "#7A8A7B" }}>{p.time || "Recentemente"}</span>
                  </div>

                  {p.image && (
                    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", background: "#EDE7DA" }}>
                      <img src={p.image} alt="Foto da publicação" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: "#2D3A2E", margin: 0, lineHeight: 1.4 }}>{p.content}</p>

                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#7A8A7B", marginTop: 2 }}>
                    <span>❤️ {p.likes || 0} curtidas</span>
                    <span>💬 {p.comments || 0} comentários</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            disabled={remainingIncentives === 0 && !incentiveSent}
            style={{
              background: incentiveSent ? "#3E5C43" : remainingIncentives === 0 ? "#EDE7DA" : "#F5EFE3",
              color: incentiveSent ? "#FDFBF7" : remainingIncentives === 0 ? "#7A8A7B" : "#2D3A2E",
              border: "1px solid rgba(45, 58, 46, 0.08)",
              borderRadius: 14,
              padding: "12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: remainingIncentives === 0 && !incentiveSent ? "not-allowed" : "pointer",
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
            ) : remainingIncentives === 0 ? (
              <>
                <Clock size={16} color="#7A8A7B" /> Limite atingido (0/3 na hora)
              </>
            ) : (
              <>
                <ThumbsUp size={16} color="#D68C70" /> Incentivar Colega ({remainingIncentives}/3)
              </>
            )}
          </button>
        </div>
      </div>

      <UnfollowConfirmModal
        isOpen={showUnfollowConfirm}
        onClose={() => setShowUnfollowConfirm(false)}
        onConfirm={handleConfirmUnfollow}
        userName={user.name}
        userAvatar={user.avatar}
      />
    </div>
  );
}
