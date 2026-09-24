import React, { useState, useEffect } from "react";
import { X, Search, Shield, Trash2, Key, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { apiService } from "../../services/apiService";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";
import { useTranslation } from "../../i18n";

interface AdminUserItem {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  curso?: string;
  bio?: string;
  localizacao?: string;
  numeroCarteira?: string;
  fotoUrl?: string;
  pontos: number;
  nivel: number;
  isAdmin: boolean;
  ativo: boolean;
  dataCriacao?: string;
}

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerId: number;
}

export function AdminUsersModal({ isOpen, onClose, callerId }: AdminUsersModalProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal para redefinir senha
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAdminUsers(callerId);
      if (data && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      console.warn("Erro ao buscar usuários admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setActionMessage(null);
    }
  }, [isOpen, callerId]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.nome.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.curso && u.curso.toLowerCase().includes(term))
    );
  });

  const handleToggleStatus = async (user: AdminUserItem) => {
    if (user.id === callerId) {
      alert("Você não pode desativar sua própria conta de administrador.");
      return;
    }

    const actionText = user.ativo ? "desativar" : "ativar";
    if (!window.confirm(`Tem certeza que deseja ${actionText} a conta de "${user.nome}"?`)) return;

    try {
      const res = await apiService.toggleUserStatus(user.id, callerId);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ativo: res.ativo } : u))
      );
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert("Erro ao alterar status do usuário: " + (err.message || "Tente novamente."));
    }
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    if (user.id === callerId) {
      alert("Você não pode excluir sua própria conta de administrador.");
      return;
    }

    const confirmName = window.prompt(
      `ATENÇÃO: A exclusão é irreversível e apagará todos os posts, comentários e atividades deste usuário.\n\nPara confirmar, digite o nome do usuário exatamente como abaixo:\n${user.nome}`
    );

    if (confirmName !== user.nome) {
      if (confirmName !== null) alert("Nome incorreto. Operação cancelada.");
      return;
    }

    try {
      const res = await apiService.deleteUser(user.id, callerId);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert("Erro ao excluir usuário: " + (err.message || "Tente novamente."));
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUserForPassword) return;
    if (!newPassword || newPassword.trim().length < 4) {
      alert("A senha precisa conter no mínimo 4 caracteres.");
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await apiService.resetUserPassword(selectedUserForPassword.id, callerId, newPassword.trim());
      setActionMessage(res.message);
      setSelectedUserForPassword(null);
      setNewPassword("");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert("Erro ao redefinir senha: " + (err.message || "Tente novamente."));
    } finally {
      setIsResettingPassword(false);
    }
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 12,
            borderBottom: "1px solid rgba(45,58,46,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#2D3A2E",
                color: "#FDFBF7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#2D3A2E",
                  margin: 0,
                }}
              >
                Controle de Usuários
              </h2>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                {t("admin_users_title")} • {users.length} {t("admin_users_count")}
              </p>
            </div>
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
            aria-label={t("common_close")}
          >
            <X size={18} color="#2D3A2E" />
          </button>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div
            style={{
              margin: "10px 0",
              background: "#E8F5E9",
              border: "1px solid #A5D6A7",
              color: "#2E7D32",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={16} />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "0 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}
          >
            <Search size={16} color="#7A8A7B" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("admin_search_placeholder")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                padding: "10px 8px",
                fontSize: 13,
                color: "#2D3A2E",
                outline: "none",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{ background: "none", border: "none", color: "#7A8A7B", cursor: "pointer", padding: "4px" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Users List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingRight: 4,
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "#7A8A7B" }}>{t("admin_loading_users")}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "#7A8A7B" }}>{t("admin_no_users_found")}</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isCurrentAdmin = u.id === callerId;
              return (
                <div
                  key={u.id}
                  style={{
                    background: "#FAF7F0",
                    border: u.isAdmin ? "1.5px solid #2D3A2E" : "1px solid rgba(45,58,46,0.08)",
                    borderRadius: 16,
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    opacity: u.ativo ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <img
                        src={u.fotoUrl || DEFAULT_AVATAR_URL}
                        alt={u.nome}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: u.isAdmin ? "2px solid #2D3A2E" : "2px solid #D68C70",
                        }}
                      />
                      {u.isAdmin && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            background: "#2D3A2E",
                            color: "#FDFBF7",
                            fontSize: 8,
                            fontWeight: 700,
                            padding: "1px 4px",
                            borderRadius: 6,
                          }}
                        >
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#2D3A2E",
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {u.nome} {isCurrentAdmin && `(${t("user_you")})`}
                        </p>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: u.ativo ? "#E8F5E9" : "#FFEBEE",
                            color: u.ativo ? "#2E7D32" : "#C62828",
                          }}
                        >
                          {u.ativo ? t("admin_status_active") : t("admin_status_inactive")}
                        </span>
                      </div>

                      <p style={{ fontSize: 11, color: "#7A8A7B", margin: "2px 0 0 0" }}>
                        {u.email}
                      </p>

                      <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11, color: "#2D3A2E" }}>
                        <span>🎓 {u.curso || "Estudante Carmelita"}</span>
                        <span>•</span>
                        <span>⭐ {u.pontos} pts</span>
                        <span>•</span>
                        <span>🆔 #{u.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for this user */}
                  {!isCurrentAdmin && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 8,
                        paddingTop: 8,
                        borderTop: "1px solid rgba(45,58,46,0.06)",
                      }}
                    >
                      {/* Redefinir Senha */}
                      <button
                        onClick={() => {
                          setSelectedUserForPassword(u);
                          setNewPassword("");
                        }}
                        style={{
                          background: "#F5EFE3",
                          border: "1px solid rgba(45,58,46,0.1)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#2D3A2E",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Key size={13} color="#D68C70" />
                        <span>{t("admin_change_password")}</span>
                      </button>

                      {/* Desativar / Ativar */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{
                          background: u.ativo ? "rgba(224, 109, 83, 0.12)" : "rgba(107, 143, 109, 0.15)",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: u.ativo ? "#C44F35" : "#2E7D32",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {u.ativo ? <XCircle size={13} /> : <CheckCircle size={13} />}
                        <span>{u.ativo ? t("admin_deactivate") : t("admin_activate")}</span>
                      </button>

                      {/* Excluir */}
                      <button
                        onClick={() => handleDeleteUser(u)}
                        style={{
                          background: "none",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#C44F35",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title={t("admin_delete_user")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal interno para redefinir senha */}
        {selectedUserForPassword && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 140,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              style={{
                background: "#FDFBF7",
                borderRadius: 20,
                padding: "20px",
                width: "100%",
                maxWidth: 340,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, margin: "0 0 8px 0", color: "#2D3A2E" }}>
                {t("admin_reset_password")}
              </h3>
              <p style={{ fontSize: 12, color: "#7A8A7B", margin: "0 0 14px 0" }}>
                Defina a nova senha de acesso para <strong>{selectedUserForPassword.nome}</strong>:
              </p>

              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #D68C70",
                  fontSize: 13,
                  background: "#FAF7F0",
                  marginBottom: 16,
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedUserForPassword(null)}
                  style={{
                    background: "#EDE7DA",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#2D3A2E",
                  }}
                >
                  {t("common_cancel")}
                </button>
                <button
                  onClick={handleConfirmResetPassword}
                  disabled={isResettingPassword}
                  style={{
                    background: "#2D3A2E",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#FDFBF7",
                  }}
                >
                  {isResettingPassword ? t("common_loading") : t("common_save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
