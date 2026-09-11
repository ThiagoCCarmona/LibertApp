import React, { useState } from "react";
import { X, Send, Heart } from "lucide-react";

export interface CommentItem {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

interface PostCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postAuthor: string;
  postContent: string;
  initialComments?: CommentItem[];
  onAddComment?: (text: string) => void;
}

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 1,
    author: "Lucas Silveira",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    text: "Muito inspirador! Também fiz 30 minutos de caminhada sem celular hoje.",
    time: "45m atrás",
    likes: 3,
  },
  {
    id: 2,
    author: "Beatriz Santos",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    text: "Parabéns pela constância! Isso realmente faz a diferença na semana.",
    time: "20m atrás",
    likes: 1,
  },
];

export function PostCommentsModal({
  isOpen,
  onClose,
  postAuthor,
  postContent,
  initialComments = DEFAULT_COMMENTS,
  onAddComment,
}: PostCommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now(),
      author: "Silvia Mendes",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      text: newCommentText.trim(),
      time: "Agora",
      likes: 0,
    };

    setComments((prev) => [...prev, newComment]);
    if (onAddComment) {
      onAddComment(newCommentText.trim());
    }
    setNewCommentText("");
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
            gap: 14,
            paddingRight: 4,
          }}
        >
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <img
                src={c.avatar}
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
                  <span style={{ fontSize: 10, color: "#7A8A7B" }}>{c.time}</span>
                </div>
                <p style={{ fontSize: 12, color: "#2D3A2E", lineHeight: 1.4, margin: 0 }}>{c.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Heart size={13} color="#7A8A7B" />
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>{c.likes > 0 ? c.likes : "Curtir"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Deixe uma palavra de incentivo..."
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
            disabled={!newCommentText.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: newCommentText.trim()
                ? "linear-gradient(135deg, #D68C70, #C4785A)"
                : "#E5DCCE",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: newCommentText.trim() ? "pointer" : "default",
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
