import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, RotateCcw, Sparkles } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useTranslation } from "../../i18n";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  userName?: string;
}

const SUGGESTED_QUESTIONS_MAP: Record<string, string[]> = {
  pt: [
    "Como reduzir meu tempo de tela sem perder o foco?",
    "Dicas para organizar pausas ativas nos estudos",
    "Como a respiração consciente ajuda na ansiedade digital?",
    "O que fazer quando sinto vontade incontrolável de checar o celular?",
  ],
  en: [
    "How to reduce screen time without losing focus?",
    "Tips for active study breaks",
    "How does mindful breathing help digital anxiety?",
    "What to do when feeling the urge to check my phone?",
  ],
  es: [
    "¿Cómo reducir el tiempo de pantalla sin perder el enfoque?",
    "Consejos para pausas activas durante el estudio",
    "¿Cómo ayuda la respiración consciente con la ansiedad digital?",
    "¿Qué hacer ante el impulso incontrolable de revisar el móvil?",
  ],
};

export function ChatbotModal({ isOpen, onClose, userId = 1, userName }: ChatbotModalProps) {
  const { t, language } = useTranslation();
  const suggestedQuestions = SUGGESTED_QUESTIONS_MAP[language] || SUGGESTED_QUESTIONS_MAP.pt;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`libertapp_chat_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "welcome",
        sender: "bot",
        text: `Olá${userName ? `, ${userName.split(" ")[0]}` : ""}! Sou o Conselheiro Virtual do LibertApp 🌱. Estou aqui para te ajudar a cultivar uma relação equilibrada com a tecnologia, desacelerar a mente e manter o foco nos momentos que realmente importam. Como posso te apoiar hoje?`,
        time: "Agora",
      },
    ];
  });

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Recarrega conversa isolada do usuário sempre que userId mudar ou o modal abrir
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(`libertapp_chat_${userId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
        return;
      }
    } catch {}

    setMessages([
      {
        id: `welcome_${userId}`,
        sender: "bot",
        text: `Olá${userName ? `, ${userName.split(" ")[0]}` : ""}! Sou o Conselheiro Virtual do LibertApp 🌱. Estou aqui para te ajudar a cultivar uma relação equilibrada com a tecnologia, desacelerar a mente e manter o foco nos momentos que realmente importam. Como posso te apoiar hoje?`,
        time: "Agora",
      },
    ]);
  }, [userId, isOpen, userName]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    try {
      localStorage.setItem(`libertapp_chat_${userId}`, JSON.stringify(messages));
    } catch {}
    scrollToBottom();
  }, [messages, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    setStatusNote(null);

    // Render pode demorar alguns segundos caso esteja em cold start
    const coldStartTimer = setTimeout(() => {
      setStatusNote(t("chatbot_connecting"));
    }, 3500);

    try {
      const res = await fetch("https://libertapp-chatbot.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId > 0 ? userId : 1,
          message: text,
        }),
      });

      clearTimeout(coldStartTimer);
      setStatusNote(null);

      if (!res.ok) {
        throw new Error(`Servidor respondeu com status ${res.status}`);
      }

      const botReply = await res.text();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: botReply || "...",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      clearTimeout(coldStartTimer);
      console.warn("Erro ao comunicar com Chatbot API:", err);

      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        text: t("chatbot_error_retry"),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setStatusNote(null);
    }
  };

  const handleResetChat = async () => {
    const confirmReset = window.confirm(t("chatbot_clear") + "?");
    if (!confirmReset) return;

    try {
      await fetch(`https://libertapp-chatbot.onrender.com/chat/${userId > 0 ? userId : 1}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Erro limpando memória remota:", e);
    }

    const resetMsg: ChatMessage[] = [
      {
        id: `welcome_${Date.now()}`,
        sender: "bot",
        text: t("chatbot_welcome"),
        time: t("time_now"),
      },
    ];

    setMessages(resetMsg);
    localStorage.setItem(`libertapp_chat_${userId}`, JSON.stringify(resetMsg));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        backgroundColor: "rgba(45, 58, 46, 0.5)",
        backdropFilter: "blur(4px)",
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
          height: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -10px 40px rgba(45, 58, 46, 0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "#F5EFE3",
            borderBottom: "1px solid rgba(45, 58, 46, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 4px 12px rgba(45, 58, 46, 0.2)",
              }}
            >
              <Bot size={22} color="#FDFBF7" />
              <div
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#6B8F6D",
                  border: "2px solid #F5EFE3",
                }}
                title="Online"
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h2
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 500,
                    fontSize: 17,
                    color: "#2D3A2E",
                    margin: 0,
                  }}
                >
                  {t("chatbot_title")}
                </h2>
                <span
                  style={{
                    background: "rgba(214, 140, 112, 0.2)",
                    color: "#D68C70",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  IA
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: "1px 0 0 0" }}>
                {t("chatbot_assistant_tag")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleResetChat}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#7A8A7B",
              }}
              title={t("chatbot_clear")}
              aria-label={t("chatbot_clear")}
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(45,58,46,0.06)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#2D3A2E",
              }}
              aria-label={t("common_close")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div
            style={{
              padding: "10px 16px",
              background: "#FAF7F0",
              borderBottom: "1px solid rgba(45, 58, 46, 0.05)",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                style={{
                  background: "#F5EFE3",
                  border: "1px solid rgba(214, 140, 112, 0.3)",
                  borderRadius: 16,
                  padding: "6px 12px",
                  fontSize: 12,
                  color: "#2D3A2E",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  transition: "background 0.15s ease",
                }}
              >
                <Sparkles size={12} color="#D68C70" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: 18,
                    borderTopRightRadius: isUser ? 4 : 18,
                    borderTopLeftRadius: isUser ? 18 : 4,
                    background: isUser
                      ? "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)"
                      : "#F5EFE3",
                    color: isUser ? "#FDFBF7" : "#2D3A2E",
                    border: isUser ? "none" : "1px solid rgba(45, 58, 46, 0.08)",
                    boxShadow: isUser
                      ? "0 3px 12px rgba(214, 140, 112, 0.25)"
                      : "0 2px 6px rgba(45, 58, 46, 0.04)",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    wordBreak: "break-word",
                  }}
                >
                  <MarkdownRenderer content={m.text} isUser={isUser} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "#7A8A7B",
                    marginTop: 4,
                    padding: "0 4px",
                  }}
                >
                  {m.time}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div
                style={{
                  background: "#F5EFE3",
                  border: "1px solid rgba(45, 58, 46, 0.08)",
                  borderRadius: 18,
                  borderTopLeftRadius: 4,
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#D68C70",
                    animation: "pulse 1s infinite alternate",
                  }}
                />
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#D68C70",
                    animation: "pulse 1s infinite alternate 0.2s",
                  }}
                />
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#D68C70",
                    animation: "pulse 1s infinite alternate 0.4s",
                  }}
                />
              </div>
              {statusNote && (
                <span style={{ fontSize: 11, color: "#7A8A7B", fontStyle: "italic", paddingLeft: 4 }}>
                  {statusNote}
                </span>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: "12px 18px 20px 18px",
            background: "#FDFBF7",
            borderTop: "1px solid rgba(45, 58, 46, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t("chatbot_placeholder")}
            disabled={isLoading}
            style={{
              flex: 1,
              background: "#F5EFE3",
              border: "1px solid rgba(45, 58, 46, 0.12)",
              borderRadius: 22,
              padding: "12px 18px",
              fontSize: 13.5,
              color: "#2D3A2E",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: inputText.trim() && !isLoading
                ? "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)"
                : "#E5DCCE",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: inputText.trim() && !isLoading ? "pointer" : "default",
              boxShadow: inputText.trim() && !isLoading
                ? "0 4px 12px rgba(214, 140, 112, 0.35)"
                : "none",
              transition: "all 0.15s ease",
            }}
            aria-label={t("comments_send_btn")}
          >
            <Send size={18} color="#FDFBF7" />
          </button>
        </div>
      </div>
    </div>
  );
}
