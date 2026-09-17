import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Sparkles, Trash2, Upload } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1080;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(e.target?.result as string);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch (err) {
      console.warn("Erro ao processar imagem:", err);
      alert("Não foi possível carregar a imagem selecionada.");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePublish = () => {
    if (!content.trim()) return;
    onPublish({
      content: content.trim(),
      category: selectedCategory.id,
      icon: selectedCategory.icon,
      image: imagePreview || undefined,
    });
    setContent("");
    setImagePreview(null);
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
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#FDFBF7",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 24px 28px 24px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 30px rgba(45, 58, 46, 0.15)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
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
            disabled={!content.trim() || isCompressing}
            style={{
              background: content.trim() && !isCompressing
                ? "linear-gradient(135deg, #D68C70, #C4785A)"
                : "#E5DCCE",
              color: content.trim() && !isCompressing ? "#FDFBF7" : "#A39788",
              border: "none",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: content.trim() && !isCompressing ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
          >
            Publicar
          </button>
        </div>

        {/* Autor info */}
        {(() => {
          let cur: any = null;
          try {
            const s = localStorage.getItem("currentUser");
            if (s) cur = JSON.parse(s);
          } catch {}
          const name = cur?.nome || "Você";
          const avatar = cur?.fotoUrl || DEFAULT_AVATAR_URL;
          return (
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
                  src={avatar}
                  alt="Seu avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>{name}</p>
                <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>Compartilhando com a comunidade</p>
              </div>
            </div>
          );
        })()}

        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Como foi seu momento desconectado hoje? Compartilhe conquistas, sensações ou reflexões..."
          rows={3}
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

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        {/* Image Preview - Instagram Aspect Ratio */}
        {imagePreview && (
          <div style={{ marginTop: 12, position: "relative" }}>
            <div
              style={{
                width: "100%",
                paddingTop: "100%", // 1:1 Aspect ratio (Instagram Square)
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                border: "1.5px solid rgba(45, 58, 46, 0.1)",
                backgroundColor: "#2D3A2E",
              }}
            >
              <img
                src={imagePreview}
                alt="Preview do post"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <button
              onClick={() => setImagePreview(null)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(45, 58, 46, 0.8)",
                color: "#FDFBF7",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
              title="Remover foto"
              aria-label="Remover foto"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {isCompressing && (
          <p style={{ fontSize: 12, color: "#D68C70", marginTop: 8, textAlign: "center" }}>
            Otimizando imagem para o padrão Instagram...
          </p>
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
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(45, 58, 46, 0.08)",
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: imagePreview ? "#E8D7C8" : "#F5EFE3",
              border: "1px solid rgba(45, 58, 46, 0.12)",
              borderRadius: 12,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              color: "#2D3A2E",
              fontSize: 12.5,
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
          >
            {imagePreview ? <Upload size={16} color="#D68C70" /> : <ImageIcon size={16} color="#D68C70" />}
            <span>{imagePreview ? "Trocar Foto" : "Fazer Upload de Foto"}</span>
          </button>

          <span style={{ fontSize: 11, color: "#7A8A7B" }}>
            {content.length} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
