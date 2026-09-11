import { useState } from "react";
import { Heart, MessageCircle, Share2, Plus, Trophy, UserPlus } from "lucide-react";
import { NewPostModal } from "./NewPostModal";
import { PostCommentsModal } from "./PostCommentsModal";
import { UserProfileModal, type UserProfileData } from "./UserProfileModal";

const LibertLogoSmall = () => (
  <svg width="24" height="24" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22 36 L22 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 26 Q16 24 14 18" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M22 21 Q28 19 30 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="22" cy="10" rx="3" ry="4" fill="rgba(253,251,247,0.4)" />
  </svg>
);

const INITIAL_FEED_POSTS = [
  {
    id: 1,
    type: "memory",
    author: "Marcela Costa",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format",
    time: "2h atrás",
    content: "Completei os exercícios de memória e atenção durante minha pausa digital! Sinto a mente muito mais clara agora.",
    bgColor: "#FCE4EC",
    borderColor: "#F8BBD0",
    likes: 24,
    comments: 5,
    liked: false,
    icon: "🧠",
  },
  {
    id: 2,
    type: "nature",
    author: "Rafael Mendes",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format",
    time: "5h atrás",
    content: "Fiz uma trilha incrível na Serra do Mar! 2 horas de desconexão completa, natureza pura e foco visual renovado.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&auto=format",
    bgColor: "#E8D7C8",
    borderColor: "#D7C4B3",
    likes: 42,
    comments: 12,
    liked: true,
    icon: "🏔️",
  },
  {
    id: 3,
    type: "games",
    author: "Ana Oliveira",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format",
    time: "1d atrás",
    content: "Que gincana incrível! Charadas, jogos de raciocínio rápido e muita socialização ao vivo. Voltei para casa com energia!",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&auto=format",
    bgColor: "#FFEBEE",
    borderColor: "#FFCDD2",
    likes: 38,
    comments: 8,
    liked: false,
    icon: "🎯",
  },
];

export function HomeNewScreen({
  onShowLeaderboard,
  onSearchUsers,
}: {
  onShowLeaderboard?: () => void;
  onSearchUsers?: () => void;
}) {
  const [posts, setPosts] = useState(INITIAL_FEED_POSTS);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<(typeof INITIAL_FEED_POSTS)[0] | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);

  const unlockedCount = 3;
  const totalCount = 5;
  const progress = (unlockedCount / totalCount) * 100;

  const handleToggleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.liked;
          return {
            ...p,
            liked: newLiked,
            likes: newLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handlePublishPost = (newPostData: {
    content: string;
    category: string;
    icon: string;
    image?: string;
  }) => {
    const bgColors: Record<string, { bg: string; border: string }> = {
      nature: { bg: "#E8D7C8", border: "#D7C4B3" },
      memory: { bg: "#FCE4EC", border: "#F8BBD0" },
      games: { bg: "#FFEBEE", border: "#FFCDD2" },
      reading: { bg: "#E8F5E9", border: "#C8E6C9" },
    };

    const scheme = bgColors[newPostData.category] || { bg: "#F5EFE3", border: "#EDE7DA" };

    const createdPost = {
      id: Date.now(),
      type: newPostData.category,
      author: "Silvia Mendes",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      time: "Agora",
      content: newPostData.content,
      image: newPostData.image,
      bgColor: scheme.bg,
      borderColor: scheme.border,
      likes: 0,
      comments: 0,
      liked: false,
      icon: newPostData.icon,
    };

    setPosts([createdPost, ...posts]);
  };

  const handleOpenUserProfile = (author: string, avatar: string) => {
    setSelectedUser({
      name: author,
      avatar: avatar,
      level: 3,
      levelName: "Nível 3 - Foco Consciente",
      points: 2450,
      streakDays: 7,
      focusMinutes: 180,
      bio: "Adoro caminhar sem fones e praticar momentos de presença plena durante a semana.",
      department: "Membro da Comunidade Carmelita",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div>
            <p style={{ fontSize: 13, color: "#7A8A7B", fontWeight: 400 }}>Bem-vinda,</p>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", lineHeight: 1.2, marginTop: 1 }}>
              Silvia 👋
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onSearchUsers}
              style={{
                background: "#F5EFE3",
                border: "1px solid rgba(45,58,46,0.08)",
                borderRadius: 12,
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(45,58,46,0.06)",
              }}
              title="Buscar Colegas para Seguir"
              aria-label="Buscar Colegas"
            >
              <UserPlus size={20} color="#2D3A2E" strokeWidth={2} />
            </button>

            <button
              onClick={onShowLeaderboard}
              style={{
                background: "linear-gradient(135deg, #D68C70, #C4785A)",
                border: "none",
                borderRadius: 12,
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(214,140,112,0.3)",
              }}
              title="Ver Pódio"
              aria-label="Ver Pódio"
            >
              <Trophy size={22} color="#FDFBF7" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Carteirinha Digital Card */}
        <div className="px-5 pb-4">
          <div style={{
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 12px 40px rgba(45,58,46,0.18), 0 2px 8px rgba(45,58,46,0.08)",
            position: "relative",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 40%, #4A6050 100%)",
              padding: "20px 18px 18px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(214,140,112,0.12)" }} />
              <div style={{ position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(214,140,112,0.07)" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
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

              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, position: "relative" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
                  border: "3px solid rgba(214,140,112,0.6)", flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=200&h=200&fit=crop&auto=format"
                    alt="Foto de Silvia Mendes"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, paddingBottom: 2 }}>
                  <h2 style={{
                    fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 20,
                    color: "#FDFBF7", lineHeight: 1.1, letterSpacing: "-0.3px",
                  }}>
                    Silvia Mendes
                  </h2>
                  <p style={{ fontSize: 12, color: "rgba(253,251,247,0.55)", marginTop: 3, fontWeight: 400 }}>
                    LB-2024-4892
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: "#F5EFE3", padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E" }}>Benefícios Progressivos</p>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D68C70" }}>{unlockedCount}/{totalCount}</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: "#EDE7DA", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progress}%`, borderRadius: 4,
                  background: "linear-gradient(90deg, #D68C70, #C4785A)",
                  transition: "width 0.8s ease",
                }} />
              </div>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 5 }}>
                {totalCount - unlockedCount} restaurantes para desbloquear
              </p>
            </div>
          </div>
        </div>

        {/* Feed Header */}
        <div className="px-6 pt-2 pb-3">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E" }}>
            Feed da Comunidade
          </h2>
        </div>

        {/* Feed Posts */}
        <div className="px-5 pb-24" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map(post => (
            <div
              key={post.id}
              style={{
                background: post.bgColor,
                borderRadius: 16,
                padding: "14px 16px",
                border: `1.5px solid ${post.borderColor}`,
              }}
            >
              <div
                onClick={() => handleOpenUserProfile(post.author, post.avatar)}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(214,140,112,0.3)",
                  }}
                >
                  <img
                    src={post.avatar}
                    alt={post.author}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>
                    {post.icon} {post.author}
                  </p>
                  <p style={{ fontSize: 11, color: "#7A8A7B" }}>{post.time}</p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#2D3A2E", lineHeight: 1.5, marginBottom: "image" in post && post.image ? 10 : 0 }}>
                {post.content}
              </p>

              {"image" in post && post.image && (
                <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                  <img
                    src={post.image}
                    alt=""
                    style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 20, paddingTop: 8, borderTop: `1px solid ${post.borderColor}` }}>
                <button
                  onClick={() => handleToggleLike(post.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Heart size={18} color={post.liked ? "#D68C70" : "#7A8A7B"} fill={post.liked ? "#D68C70" : "none"} strokeWidth={1.5} />
                  <span style={{ fontSize: 12, color: post.liked ? "#D68C70" : "#7A8A7B", fontWeight: post.liked ? 600 : 400 }}>
                    {post.likes}
                  </span>
                </button>
                <button
                  onClick={() => setActiveCommentsPost(post)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <MessageCircle size={18} color="#7A8A7B" strokeWidth={1.5} />
                  <span style={{ fontSize: 12, color: "#7A8A7B" }}>{post.comments}</span>
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: "LibertApp", text: post.content });
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Share2 size={18} color="#7A8A7B" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsNewPostOpen(true)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(214,140,112,0.4), 0 2px 8px rgba(45,58,46,0.12)",
          zIndex: 40,
        }}
        aria-label="Criar novo post"
      >
        <Plus size={28} color="#FDFBF7" strokeWidth={2.5} />
      </button>

      {/* Modais */}
      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onPublish={handlePublishPost}
      />

      <PostCommentsModal
        isOpen={activeCommentsPost !== null}
        onClose={() => setActiveCommentsPost(null)}
        postAuthor={activeCommentsPost?.author || ""}
        postContent={activeCommentsPost?.content || ""}
        onAddComment={() => {
          if (activeCommentsPost) {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === activeCommentsPost.id ? { ...p, comments: p.comments + 1 } : p
              )
            );
          }
        }}
      />

      <UserProfileModal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
}
