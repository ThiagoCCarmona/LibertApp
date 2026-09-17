import { useState, useEffect, useMemo } from "react";
import { Heart, MessageCircle, Share2, Plus, Trophy, UserPlus, Trash2, Sparkles, Bot } from "lucide-react";
import { NewPostModal } from "./NewPostModal";
import { PostCommentsModal } from "./PostCommentsModal";
import { UserProfileModal, type UserProfileData } from "./UserProfileModal";
import { ChatbotModal } from "./ChatbotModal";
import { sendNativeMessage } from "../../services/nativeBridge";
import { apiService, type PostDto } from "../../services/apiService";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";

const LibertLogoSmall = () => (
  <svg width="24" height="24" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22 36 L22 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 26 Q16 24 14 18" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M22 21 Q28 19 30 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="22" cy="10" rx="3" ry="4" fill="rgba(253,251,247,0.4)" />
  </svg>
);

export function HomeNewScreen({
  onShowLeaderboard,
  onSearchUsers,
}: {
  onShowLeaderboard?: () => void;
  onSearchUsers?: () => void;
}) {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<PostDto | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);

  // Carrega usuário atual (do localStorage ou da bridge)
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Erro lendo currentUser:", e);
      }
    };
    loadStoredUser();

    window.addEventListener("user_profile_updated", loadStoredUser);
    return () => {
      window.removeEventListener("user_profile_updated", loadStoredUser);
    };
  }, []);

  // Carrega feed da API central da VPS (com fallback para bridge nativa)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        let user = currentUser;
        if (!user) {
          try {
            const nativeUser = await sendNativeMessage<any>("GET_CURRENT_USER");
            if (nativeUser) {
              user = nativeUser;
              if (isMounted) setCurrentUser(nativeUser);
            }
          } catch {}
        }

        const callerId = user?.id || 1;

        // 1. Tenta buscar da API REST central na VPS
        try {
          const apiFeed = await apiService.getFeed(callerId);
          if (isMounted) {
            setPosts(apiFeed || []);
            setIsLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn("API central VPS indisponível, buscando feed local:", apiErr);
        }

        // 2. Fallback: bridge local nativa
        try {
          const nativeFeed = await sendNativeMessage<any[]>("GET_FEED");
          if (isMounted && nativeFeed && Array.isArray(nativeFeed)) {
            setPosts(nativeFeed);
          }
        } catch (bridgeErr) {
          console.warn("Erro buscando feed nativo:", bridgeErr);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const handleToggleLike = async (postId: number) => {
    const userId = currentUser?.id || 1;

    // Atualização otimista na interface
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.liked;
          return {
            ...p,
            liked: newLiked,
            likes: newLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    try {
      // 1. Tenta API central
      await apiService.toggleLike(postId, userId);
    } catch {
      // 2. Fallback bridge nativa
      try {
        await sendNativeMessage("LIKE_POST", { postId, usuarioId: userId });
      } catch (err) {
        console.warn("Erro ao curtir post:", err);
      }
    }
  };

  const handlePublishPost = async (newPostData: {
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

    const fallbackPost = {
      id: Date.now(),
      type: newPostData.category,
      author: currentUser?.nome || "Você",
      avatar: currentUser?.fotoUrl || DEFAULT_AVATAR_URL,
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

    try {
      // 1. Tenta API central na VPS
      const created = await apiService.createPost({
        usuarioId: currentUser?.id || 1,
        content: newPostData.content,
        category: newPostData.category,
        icon: newPostData.icon,
        image: newPostData.image,
      });

      if (created) {
        setPosts((prev) => [created, ...prev]);
        return;
      }
    } catch (apiErr) {
      console.warn("API VPS indisponível ao criar post, tentando bridge local:", apiErr);
    }

    try {
      const nativePost = await sendNativeMessage("CREATE_POST", {
        content: newPostData.content,
        category: newPostData.category,
        icon: newPostData.icon,
        image: newPostData.image,
      });

      if (nativePost) {
        setPosts((prev) => [nativePost, ...prev]);
        return;
      }
    } catch (err) {
      console.warn("Erro ao criar post via bridge nativa:", err);
    }

    // Fallback se ambos falharem
    setPosts((prev) => [fallbackPost, ...prev]);
  };

  const handleDeletePost = async (postId: number) => {
    const isAdmin = !!currentUser?.isAdmin;
    const confirmDelete = window.confirm(
      isAdmin
        ? "Deseja excluir esta publicação? (Ação com privilégios de Administrador)"
        : "Deseja realmente apagar esta publicação?"
    );
    if (!confirmDelete) return;

    // Atualização otimista
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await apiService.deletePost(postId, currentUser?.id || 1);
    } catch {
      try {
        await sendNativeMessage("DELETE_POST", { postId, callerId: currentUser?.id || 1 });
      } catch (err) {
        console.warn("Erro ao apagar post nativo:", err);
      }
    }
  };

  const handleOpenUserProfile = (author: string, avatar: string, postObj?: any) => {
    setSelectedUser({
      id: postObj?.usuarioId,
      name: author,
      avatar: avatar,
      level: 3,
      levelName: "Nível 3 - Foco Consciente",
      points: 2450,
      streakDays: 7,
      focusMinutes: 180,
      bio: postObj?.curso ? `Estudante de ${postObj.curso}` : "Participante da Comunidade Carmelita",
      department: postObj?.curso || "Comunidade Carmelita",
      isFollowing: false,
    });
  };

  const displayName = currentUser?.nome?.split(" ")[0] || "Estudante";
  const displayFullName = currentUser?.nome || "Estudante Carmelita";
  const displayAvatar = currentUser?.fotoUrl || DEFAULT_AVATAR_URL;
  const displayPoints = currentUser?.pontos ?? 0;
  const userCardCode = currentUser?.numeroCarteira || (currentUser?.id ? `LBT-2026-${String(currentUser.id).padStart(4, "0")}` : "LBT-2026-0001");

  // Cálculo dinâmico dos benefícios desbloqueados por pontos
  const unlockedCount = Math.min(5, Math.max(1, Math.floor(displayPoints / 500) + 1));
  const totalCount = 5;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div>
            <p style={{ fontSize: 13, color: "#7A8A7B", fontWeight: 400 }}>Bem-vindo(a),</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", lineHeight: 1.2, marginTop: 1 }}>
                {displayName} 👋
              </h1>
              {currentUser?.isAdmin && (
                <span
                  style={{
                    background: "#2D3A2E",
                    color: "#FDFBF7",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 10,
                    letterSpacing: "0.06em",
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>
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
                    src={displayAvatar}
                    alt={`Foto de ${displayFullName}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, paddingBottom: 2 }}>
                  <h2 style={{
                    fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 20,
                    color: "#FDFBF7", lineHeight: 1.1, letterSpacing: "-0.3px",
                  }}>
                    {displayFullName}
                  </h2>
                  <p style={{ fontSize: 12, color: "rgba(253,251,247,0.55)", marginTop: 3, fontWeight: 400 }}>
                    {userCardCode}
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
                {totalCount - unlockedCount > 0
                  ? `${totalCount - unlockedCount} restaurante(s) para desbloquear`
                  : "Todos os restaurantes parceiros desbloqueados!"}
              </p>
            </div>
          </div>
        </div>

        {/* Feed Header */}
        <div className="px-6 pt-2 pb-3 flex items-center justify-between">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E" }}>
            Feed da Comunidade
          </h2>
          <span style={{ fontSize: 12, color: "#7A8A7B" }}>
            {posts.length} {posts.length === 1 ? "publicação" : "publicações"}
          </span>
        </div>

        {/* Feed Posts / Empty State */}
        <div className="px-5 pb-24" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 24, marginBottom: 8, animation: "pulse 1.5s infinite" }}>⏳</div>
              <p style={{ fontSize: 14, color: "#7A8A7B" }}>Carregando publicações...</p>
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                background: "#F5EFE3",
                borderRadius: 20,
                padding: "32px 24px",
                border: "1.5px dashed rgba(214,140,112,0.5)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(214,140,112,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={28} color="#D68C70" />
              </div>
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#2D3A2E",
                  margin: 0,
                }}
              >
                O mural da feira está aberto!
              </h3>
              <p style={{ fontSize: 13, color: "#7A8A7B", lineHeight: 1.5, margin: 0, maxWidth: 280 }}>
                Nenhuma publicação ainda. Seja o primeiro a compartilhar uma conquista, foto ou momento de desconexão!
              </p>
              <button
                onClick={() => setIsNewPostOpen(true)}
                style={{
                  marginTop: 6,
                  background: "#D68C70",
                  color: "#FDFBF7",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 12px rgba(214,140,112,0.3)",
                }}
              >
                <Plus size={16} />
                Publicar Agora
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const isOwner = currentUser?.id && post.usuarioId === currentUser.id;
              return (
                <div
                  key={post.id}
                  style={{
                    background: post.bgColor || "#F5EFE3",
                    borderRadius: 16,
                    padding: "14px 16px",
                    border: `1.5px solid ${post.borderColor || "#EDE7DA"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div
                      onClick={() => handleOpenUserProfile(post.author, post.avatar, post)}
                      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid rgba(214,140,112,0.3)",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={post.avatar}
                          alt={post.author}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>
                          {post.icon || "🌱"} {post.author}
                        </p>
                        <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                          {post.curso ? `${post.curso} • ` : ""}{post.time}
                        </p>
                      </div>
                    </div>

                    {(isOwner || currentUser?.isAdmin) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        style={{
                          background: currentUser?.isAdmin && !isOwner ? "rgba(214,140,112,0.15)" : "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          color: "#C4785A",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={currentUser?.isAdmin && !isOwner ? "Excluir como Administrador" : "Excluir minha publicação"}
                        aria-label="Excluir publicação"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: "#2D3A2E", lineHeight: 1.5, marginBottom: post.image ? 10 : 0 }}>
                    {post.content}
                  </p>

                  {post.image && (
                    <div
                      style={{
                        width: "100%",
                        paddingTop: "100%", // Proporção padrão 1:1 estilo Instagram
                        position: "relative",
                        borderRadius: 14,
                        overflow: "hidden",
                        marginBottom: 10,
                        backgroundColor: "#2D3A2E",
                        boxShadow: "0 2px 8px rgba(45,58,46,0.08)",
                      }}
                    >
                      <img
                        src={post.image}
                        alt="Foto da publicação"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 20, paddingTop: 8, borderTop: `1px solid ${post.borderColor || "rgba(45,58,46,0.08)"}` }}>
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
              );
            })
          )}
        </div>
      </div>

      {/* Botão FAB Chatbot IA (Conselheiro Virtual) posicionado logo acima do botão de post */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        style={{
          position: "fixed",
          bottom: 148,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
          border: "2px solid rgba(214,140,112,0.45)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(45,58,46,0.35), 0 2px 8px rgba(0,0,0,0.12)",
          zIndex: 40,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        title="Conversar com Conselheiro Virtual (IA)"
        aria-label="Conversar com Conselheiro Virtual"
      >
        <Bot size={26} color="#FDFBF7" strokeWidth={2} />
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            background: "#D68C70",
            color: "#FDFBF7",
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 8,
            padding: "1px 5px",
            border: "1.5px solid #FDFBF7",
          }}
        >
          IA
        </span>
      </button>

      {/* FAB Novo Post */}
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

      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        userId={currentUser?.id || 1}
        userName={currentUser?.nome}
      />

      <PostCommentsModal
        isOpen={activeCommentsPost !== null}
        onClose={() => setActiveCommentsPost(null)}
        postId={activeCommentsPost?.id}
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
        onDeleteComment={() => {
          if (activeCommentsPost) {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === activeCommentsPost.id ? { ...p, comments: Math.max(0, p.comments - 1) } : p
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
