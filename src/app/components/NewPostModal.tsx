import React, { useState } from "react";
import { X, Image as ImageIcon, Sparkles } from "lucide-react";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (post: {
    content: string;
    category: string;
    icon: string;
    image?: string;
  }) => void;
}

const CATEGORIES = [
  { id: "nature", label: "Natureza & Ar Livre", icon: "🏔️", color: "#E8D7C8" },
  { id: "memory", label: "Foco & Atenção", icon: "🧠", color: "#FCE4EC" },
  { id: "games", label: "Gincana & Jogos", icon: "🎯", color: "#FFEBEE" },
  { id: "reading", label: "Leitura & Estudo", icon: "📖", color: "#E8F5E9" },
];

export function NewPostModal({ isOpen, onClose, onPublish }: NewPostModalProps) {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  if (!isOpen) return null;

  const handlePublish = () => {
    if (!content.trim()) return;
    onPublish({
      content: content.trim(),
      category: selectedCategory.id,
      icon: selectedCategory.icon,
      image: imageUrl.trim() || undefined,
    });
    setContent("");
    setImageUrl("");
    setShowImageInput(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
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
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 30px rgba(45, 58, 46, 0.15)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <button
            onClick={onClose}
            style={{
              background: "#F5EFE3",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Fechar"
          >
            <X size={18} color="#2D3A2E" />
          </button>

          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 18,
              fontWeight: 500,
              color: "#2D3A2E",
              margin: 0,
            }}
          >
            Nova Publicação
          </h2>

          <button
            onClick={handlePublish}
            disabled={!content.trim()}
            style={{
              background: content.trim() ? "linear-gradient(135deg, #D68C70, #C4785A)" : "#E5DCCE",
              color: content.trim() ? "#FDFBF7" : "#A39788",
              border: "none",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: content.trim() ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
          >
            Publicar
          </button>
        </div>

        {/* Autor info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #D68C70",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Seu avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>Silvia Mendes</p>
            <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>Compartilhando com a comunidade</p>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Como foi seu momento desconectado hoje? Compartilhe conquistas, sensações ou reflexões..."
          rows={4}
          style={{
            width: "100%",
            background: "#F5EFE3",
            border: "1px solid rgba(45, 58, 46, 0.08)",
            borderRadius: 14,
            padding: "14px",
            fontSize: 14,
            color: "#2D3A2E",
            outline: "none",
            resize: "none",
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        />

        {/* Optional Image Input */}
        {showImageInput && (
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cole o link de uma imagem (URL)..."
              style={{
                width: "100%",
                background: "#F5EFE3",
                border: "1px solid rgba(45, 58, 46, 0.12)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                color: "#2D3A2E",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Categories Selector */}
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#7A8A7B", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={14} color="#D68C70" /> Escolha o tema do momento:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: isSelected ? "#2D3A2E" : "#F5EFE3",
                    color: isSelected ? "#FDFBF7" : "#2D3A2E",
                    border: isSelected ? "1.5px solid #2D3A2E" : "1px solid rgba(45,58,46,0.1)",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 400,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 18,
            paddingTop: 12,
            borderTop: "1px solid rgba(45, 58, 46, 0.08)",
          }}
        >
          <button
            onClick={() => setShowImageInput(!showImageInput)}
            style={{
              background: showImageInput ? "#E8D7C8" : "transparent",
              border: "none",
              borderRadius: 10,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              color: "#2D3A2E",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <ImageIcon size={18} color="#D68C70" />
            <span>{showImageInput ? "Ocultar Imagem" : "Adicionar Foto"}</span>
          </button>

          <span style={{ fontSize: 11, color: "#7A8A7B" }}>
            {content.length} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
