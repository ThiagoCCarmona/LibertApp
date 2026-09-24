import React, { useState, useEffect } from "react";
import { X, Award, Settings2, Plus, Trash2, Edit2, CheckCircle } from "lucide-react";
import { apiService, type ConquistaDto, type ConquistaAdminDto } from "../../services/apiService";
import { useTranslation } from "../../i18n";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
  isAdmin: boolean;
}

const TIPOS = [
  { value: "pontos", label: "Pontos acumulados" },
  { value: "pomodoros", label: "Sessões de foco (Pomodoro)" },
  { value: "desafios", label: "Desafios concluídos" },
  { value: "posts", label: "Publicações no mural" },
  { value: "seguidores", label: "Seguidores" },
];

const emptyForm = { titulo: "", descricao: "", icone: "🏅", tipo: "pontos", meta: 10, pontosRecompensa: 20 };

export function AchievementsModal({ isOpen, onClose, usuarioId, isAdmin }: AchievementsModalProps) {
  const { t } = useTranslation();
  const [conquistas, setConquistas] = useState<ConquistaDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [adminList, setAdminList] = useState<ConquistaAdminDto[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadConquistas = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getMinhasConquistas(usuarioId);
      setConquistas(data || []);
    } catch (err) {
      console.warn("Erro ao carregar conquistas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminList = async () => {
    setIsAdminLoading(true);
    try {
      const data = await apiService.getConquistasAdmin(usuarioId);
      setAdminList(data || []);
    } catch (err) {
      console.warn("Erro ao carregar conquistas (admin):", err);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConquistas();
      setShowAdmin(false);
    }
  }, [isOpen, usuarioId]);

  if (!isOpen) return null;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleToggleAdmin = () => {
    const next = !showAdmin;
    setShowAdmin(next);
    if (next) loadAdminList();
  };

  const handleEdit = (c: ConquistaAdminDto) => {
    setEditingId(c.id);
    setForm({
      titulo: c.titulo,
      descricao: c.descricao,
      icone: c.icone,
      tipo: c.tipo,
      meta: c.meta,
      pontosRecompensa: c.pontosRecompensa,
    });
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      alert("O título da conquista é obrigatório.");
      return;
    }
    try {
      if (editingId) {
        const res = await apiService.updateConquista(editingId, usuarioId, form);
        setActionMessage(res.message);
      } else {
        const res = await apiService.createConquista(usuarioId, form);
        setActionMessage(res.message);
      }
      resetForm();
      await loadAdminList();
      await loadConquistas();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert("Erro ao salvar conquista: " + (err.message || "Tente novamente."));
    }
  };

  const handleToggleActive = async (c: ConquistaAdminDto) => {
    try {
      await apiService.updateConquista(c.id, usuarioId, { ativo: !c.ativo });
      await loadAdminList();
      await loadConquistas();
    } catch (err: any) {
      alert("Erro ao alterar status: " + (err.message || "Tente novamente."));
    }
  };

  const handleDelete = async (c: ConquistaAdminDto) => {
    if (!window.confirm(`Excluir a conquista "${c.titulo}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const res = await apiService.deleteConquista(c.id, usuarioId);
      setActionMessage(res.message);
      await loadAdminList();
      await loadConquistas();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert("Erro ao excluir conquista: " + (err.message || "Tente novamente."));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid rgba(45,58,46,0.12)",
    borderRadius: 10,
    background: "#FAF7F0",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        backgroundColor: "rgba(45, 58, 46, 0.55)",
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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 20px 24px 20px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 30px rgba(45, 58, 46, 0.2)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid rgba(45,58,46,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#D68C70", color: "#FDFBF7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>
                {t("achievements_modal_title")}
              </h2>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                {conquistas.filter((c) => c.desbloqueada).length}/{conquistas.length} {t("achievements_unlocked_count")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isAdmin && (
              <button
                onClick={handleToggleAdmin}
                title={t("achievements_manage_btn")}
                aria-label={t("achievements_manage_btn")}
                style={{
                  background: showAdmin ? "#2D3A2E" : "#F5EFE3",
                  border: "none",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Settings2 size={16} color={showAdmin ? "#FDFBF7" : "#2D3A2E"} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: "#F5EFE3", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              aria-label={t("common_close")}
            >
              <X size={18} color="#2D3A2E" />
            </button>
          </div>
        </div>

        {actionMessage && (
          <div style={{ margin: "10px 0", background: "#E8F5E9", border: "1px solid #A5D6A7", color: "#2E7D32", padding: "10px 14px", borderRadius: 12, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} />
            <span>{actionMessage}</span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", paddingTop: 12 }}>
          {/* Painel administrativo */}
          {isAdmin && showAdmin && (
            <div style={{ marginBottom: 16, background: "#F5EFE3", borderRadius: 16, padding: 14, border: "1px solid rgba(45,58,46,0.08)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2D3A2E", margin: "0 0 10px 0" }}>
                {editingId ? t("achievements_admin_edit") : t("achievements_admin_new")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input style={inputStyle} placeholder="Título" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
                <input style={inputStyle} placeholder="Descrição" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...inputStyle, width: 60, flex: "none" }} placeholder="🏅" value={form.icone} onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value }))} />
                  <select style={inputStyle} value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: "#7A8A7B" }}>Meta</label>
                    <input type="number" min={1} style={inputStyle} value={form.meta} onChange={(e) => setForm((f) => ({ ...f, meta: parseInt(e.target.value) || 1 }))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: "#7A8A7B" }}>Pontos de recompensa</label>
                    <input type="number" min={0} style={inputStyle} value={form.pontosRecompensa} onChange={(e) => setForm((f) => ({ ...f, pontosRecompensa: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                  {editingId && (
                    <button onClick={resetForm} style={{ background: "#EDE7DA", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#2D3A2E" }}>
                      {t("common_cancel")}
                    </button>
                  )}
                  <button onClick={handleSubmit} style={{ background: "#2D3A2E", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#FDFBF7", display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={14} />
                    {editingId ? t("common_save") : "+"}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 14, borderTop: "1px solid rgba(45,58,46,0.1)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {isAdminLoading ? (
                  <p style={{ fontSize: 12, color: "#7A8A7B" }}>{t("common_loading")}</p>
                ) : (
                  adminList.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAF7F0", borderRadius: 10, padding: "8px 10px", opacity: c.ativo ? 1 : 0.55 }}>
                      <span style={{ fontSize: 18 }}>{c.icone}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>{c.titulo}</p>
                        <p style={{ fontSize: 10, color: "#7A8A7B", margin: 0 }}>Meta: {c.meta} • +{c.pontosRecompensa}pts</p>
                      </div>
                      <button onClick={() => handleToggleActive(c)} title={c.ativo ? "Desativar" : "Ativar"} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        {c.ativo ? <CheckCircle size={15} color="#2E7D32" /> : <CheckCircle size={15} color="#C4B89A" />}
                      </button>
                      <button onClick={() => handleEdit(c)} title="Editar" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <Edit2 size={14} color="#D68C70" />
                      </button>
                      <button onClick={() => handleDelete(c)} title="Excluir" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <Trash2 size={14} color="#C44F35" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Lista de conquistas com progresso */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "#7A8A7B" }}>{t("achievements_loading")}</p>
            </div>
          ) : conquistas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "#7A8A7B" }}>{t("achievements_none")}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conquistas.map((c) => {
                const pct = Math.min(100, Math.round((c.progresso / c.meta) * 100));
                return (
                  <div
                    key={c.id}
                    style={{
                      background: c.desbloqueada ? "rgba(107,143,109,0.1)" : "#F5EFE3",
                      border: c.desbloqueada ? "1.5px solid #6B8F6D" : "1px solid rgba(45,58,46,0.08)",
                      borderRadius: 16,
                      padding: "12px 14px",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      opacity: c.desbloqueada ? 1 : 0.9,
                    }}
                  >
                    <div style={{ fontSize: 26, filter: c.desbloqueada ? "none" : "grayscale(70%)", opacity: c.desbloqueada ? 1 : 0.6 }}>{c.icone}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{c.titulo}</p>
                        {c.desbloqueada && <CheckCircle size={13} color="#2E7D32" />}
                      </div>
                      <p style={{ fontSize: 11, color: "#7A8A7B", margin: "2px 0 6px 0" }}>{c.descricao}</p>
                      <div style={{ height: 6, borderRadius: 3, background: "#EDE7DA", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: c.desbloqueada ? "#6B8F6D" : "linear-gradient(90deg, #D68C70, #C4785A)", borderRadius: 3, transition: "width 0.4s ease" }} />
                      </div>
                      <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>
                        {c.progresso}/{c.meta} {c.pontosRecompensa > 0 && `• +${c.pontosRecompensa} pts`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
