import React, { useState, useEffect } from "react";
import { X, Send, Heart, Trash2, MessageCircle } from "lucide-react";
import { sendNativeMessage } from "../../services/nativeBridge";
import { apiService } from "../../services/apiService";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";

export interface CommentItem {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked?: boolean;
  userId?: number;
}

interface PostCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: number;
  postAuthor: string;
  postContent: string;
  onAddComment?: (text: string) => void;
  onDeleteComment?: (commentId?: number) => void;
}

export function PostCommentsModal({
  isOpen,
  onClose,
  postId,
  postAuthor,
  postContent,
  onAddComment,
  onDeleteComment,
}: PostCommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const currentUser = (() => {
    try {
      const s = localStorage.getItem("currentUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!isOpen || !postId) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadComments() {
      try {
        // 1. Busca da API central
        try {
          const apiComments = await apiService.getComments(postId!, currentUser?.id);
          if (isMounted && apiComments && Array.isArray(apiComments)) {
            const mapped: CommentItem[] = apiComments.map((c: any) => ({
              id: c.id,
              author: c.author || "Membro da Comunidade",
              avatar: c.avatar || DEFAULT_AVATAR_URL,
              text: c.text || "",
              time: c.time || "Recente",
              likes: c.likes || 0,
              liked: !!c.liked,
              userId: c.usuarioId,
            }));
            setComments(mapped);
            setIsLoading(false);
            try {
              localStorage.setItem(`libertapp_comments_${postId}`, JSON.stringify(mapped));
            } catch {}
            return;
          }
        } catch (apiErr) {
          console.warn("API VPS indisponível para comentários, buscando fallback:", apiErr);
        }

        // 2. Fallback bridge nativo
        try {
          const data = await sendNativeMessage<any[]>("GET_COMMENTS", { postId });
          if (isMounted && data && Array.isArray(data)) {
            const mapped: CommentItem[] = data.map((c) => ({
              id: c.id || c.Id,
              author: c.autorNome || c.AutorNome || c.author || "Membro da Comunidade",
              avatar: c.autorAvatar || c.AutorAvatar || c.avatar || DEFAULT_AVATAR_URL,
              text: c.texto || c.Texto || c.text || "",
              time: "Recente",
              likes: c.likes || c.Likes || 0,
            }));
            setComments(mapped);
            setIsLoading(false);
            return;
          }
        } catch (bridgeErr) {
          console.warn("Erro ao carregar comentários nativos:", bridgeErr);
        }

        // 3. Fallback cache local
        try {
          const cached = localStorage.getItem(`libertapp_comments_${postId}`);
          if (cached && isMounted) {
            setComments(JSON.parse(cached));
          } else if (isMounted) {
            setComments([]);
          }
        } catch {}
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const text = newCommentText.trim();
    if (!text || isSending || !postId) return;

    setIsSending(true);

    const userId = currentUser?.id || 1;
    const tempId = Date.now();
    const newComment: CommentItem = {
      id: tempId,
      author: currentUser?.nome || "Você",
      avatar: currentUser?.fotoUrl || DEFAULT_AVATAR_URL,
      text,
      time: "Agora",
      likes: 0,
      userId,
    };

    setComments((prev) => {
      const updated = [...prev, newComment];
      try {
        localStorage.setItem(`libertapp_comments_${postId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (onAddComment) {
      onAddComment(text);
    }
    setNewCommentText("");

    try {
      // 1. Salva na API Central
      const added = await apiService.addComment(postId, userId, text);
      if (added && added.id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === tempId ? { ...c, id: added.id } : c));
          try {
            localStorage.setItem(`libertapp_comments_${postId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (apiErr) {
      console.warn("API indisponível ao salvar comentário, tentando bridge nativo:", apiErr);
      try {
        const nativeAdded = await sendNativeMessage("ADD_COMMENT", { postId, texto: text, usuarioId: userId });
        if (nativeAdded && (nativeAdded as any).id) {
          setComments((prev) =>
            prev.map((c) => (c.id === tempId ? { ...c, id: (nativeAdded as any).id } : c))
          );
        }
      } catch (err) {
        console.warn("Erro no fallback bridge:", err);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const isAdmin = !!currentUser?.isAdmin;
    const confirmDelete = window.confirm(
      isAdmin
        ? "Deseja excluir este comentário como Administrador?"
        : "Deseja realmente apagar seu comentário?"
    );
    if (!confirmDelete) return;

    setComments((prev) => {
      const updated = prev.filter((c) => c.id !== commentId);
      if (postId) {
        try {
          localStorage.setItem(`libertapp_comments_${postId}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    if (onDeleteComment) {
      onDeleteComment(commentId);
    }

    try {
      await apiService.deleteComment(commentId, currentUser?.id || 1);
    } catch (err) {
      console.warn("Erro ao deletar comentário na API:", err);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    const userId = currentUser?.id || 1;
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const wasLiked = !!c.liked;
          return {
            ...c,
            liked: !wasLiked,
            likes: wasLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
          };
        }
        return c;
      })
    );

    try {
      await apiService.toggleCommentLike(commentId, userId);
    } catch (err) {
      console.warn("Erro ao curtir comentário na API:", err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 20px 24px 20px",
          height: "82vh",
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
            paddingBottom: 14,
            borderBottom: "1px solid rgba(45,58,46,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 18,
                fontWeight: 500,
                color: "#2D3A2E",
                margin: 0,
              }}
            >
              Comentários
            </h2>
            <span
              style={{
                background: "#F5EFE3",
                borderRadius: 12,
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 600,
                color: "#7A8A7B",
              }}
            >
              {comments.length}
            </span>
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

        {/* Post Resumo */}
        <div
          style={{
            background: "#F5EFE3",
            borderRadius: 12,
            padding: "10px 14px",
            margin: "12px 0",
            borderLeft: "3px solid #D68C70",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "#D68C70", margin: "0 0 2px 0" }}>
            Post de {postAuthor}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#2D3A2E",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            "{postContent}"
          </p>
        </div>

        {/* Comments List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingRight: 4,
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ fontSize: 13, color: "#7A8A7B" }}>Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "#F5EFE3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D68C70",
                }}
              >
                <MessageCircle size={24} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>
                Nenhum comentário ainda
              </p>
              <p style={{ fontSize: 12, color: "#7A8A7B", margin: 0, maxWidth: 260 }}>
                Seja a primeira pessoa a deixar uma palavra de incentivo e presença para este momento!
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const isAuthor =
                (c.userId && currentUser?.id && c.userId === currentUser.id) ||
                c.author === currentUser?.nome ||
                c.author === "Você";
              const canDelete = isAuthor || !!currentUser?.isAdmin;

              return (
                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <img
                    src={c.avatar || DEFAULT_AVATAR_URL}
                    alt={c.author}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      background: "#FAF7F0",
                      borderRadius: 14,
                      padding: "10px 14px",
                      border: "1px solid rgba(45,58,46,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>{c.author}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#7A8A7B" }}>{c.time}</span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px",
                              color: "#C4785A",
                              display: "flex",
                              alignItems: "center",
                            }}
                            title={currentUser?.isAdmin && !isAuthor ? "Excluir comentário (Admin)" : "Excluir meu comentário"}
                            aria-label="Excluir comentário"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#2D3A2E", lineHeight: 1.4, margin: 0 }}>{c.text}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                      <button
                        onClick={() => handleLikeComment(c.id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "2px 6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          borderRadius: 8,
                          backgroundColor: c.liked ? "rgba(224, 109, 83, 0.1)" : "transparent",
                          transition: "all 0.15s ease",
                        }}
                        aria-label={c.liked ? "Descurtir comentário" : "Curtir comentário"}
                      >
                        <Heart
                          size={13}
                          color={c.liked ? "#E06D53" : "#7A8A7B"}
                          fill={c.liked ? "#E06D53" : "none"}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: c.liked ? 600 : 400,
                            color: c.liked ? "#E06D53" : "#7A8A7B",
                          }}
                        >
                          {c.likes > 0 ? `${c.likes} ${c.likes === 1 ? "curtida" : "curtidas"}` : "Curtir"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingTop: 12,
            borderTop: "1px solid rgba(45, 58, 46, 0.08)",
          }}
        >
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Deixe uma palavra de incentivo..."
            disabled={isSending}
            style={{
              flex: 1,
              background: "#F5EFE3",
              border: "1px solid rgba(45, 58, 46, 0.12)",
              borderRadius: 20,
              padding: "10px 16px",
              fontSize: 13,
              color: "#2D3A2E",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newCommentText.trim() || isSending}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: newCommentText.trim() && !isSending
                ? "linear-gradient(135deg, #D68C70, #C4785A)"
                : "#E5DCCE",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: newCommentText.trim() && !isSending ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
            aria-label="Enviar comentário"
          >
            <Send size={16} color="#FDFBF7" />
          </button>
        </div>
      </div>
    </div>
  );
}
