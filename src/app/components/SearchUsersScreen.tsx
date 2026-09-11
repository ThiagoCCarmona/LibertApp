import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, Search, UserPlus, UserCheck, Trophy, Sparkles, Filter } from "lucide-react";
import { UserProfileModal, type UserProfileData } from "./UserProfileModal";
import { UnfollowConfirmModal } from "./UnfollowConfirmModal";
import { sendNativeMessage } from "../../services/nativeBridge";
import { apiService, type SearchUserDto } from "../../services/apiService";

export interface SearchableUser {
  id: number;
  name: string;
  avatar: string;
  level: number;
  levelName: string;
  points: number;
  streakDays: number;
  focusMinutes: number;
  department: string;
  bio: string;
  isFollowing: boolean;
}

export function SearchUsersScreen({ onBack }: { onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<SearchableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterFollowingOnly, setFilterFollowingOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [userToUnfollow, setUserToUnfollow] = useState<SearchableUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchUsers() {
      const callerId = currentUser?.id || 1;

      // 1. Tenta carregar imediatamente dados locais em cache para resposta instantânea
      try {
        const local = await sendNativeMessage<SearchableUser[]>("SEARCH_USERS", {
          termo: searchTerm,
          apenasSeguindo: filterFollowingOnly,
        });
        if (isMounted && local && Array.isArray(local)) {
          setUsers(local);
          setIsLoading(false);
        }
      } catch {}

      // 2. Consulta API central na VPS para obter base completa e atualizada
      try {
        const apiUsers = await apiService.searchUsers(searchTerm, callerId, filterFollowingOnly);
        if (isMounted && apiUsers) {
          setUsers(apiUsers);
        }
      } catch (apiErr) {
        console.warn("API VPS indisponível para busca:", apiErr);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [searchTerm, filterFollowingOnly, currentUser?.id]);

  const handleFollowClick = async (user: SearchableUser) => {
    if (user.isFollowing) {
      // Solicita confirmação antes de deixar de seguir
      setUserToUnfollow(user);
    } else {
      // Seguir diretamente
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isFollowing: true } : u))
      );
      try {
        await apiService.toggleFollow(user.id, currentUser?.id || 1);
      } catch {
        try {
          await sendNativeMessage("TOGGLE_FOLLOW", { seguidoId: user.id });
        } catch (err) {
          console.warn("Erro ao seguir usuário:", err);
        }
      }
    }
  };

  const handleConfirmUnfollow = async () => {
    if (userToUnfollow) {
      const userId = userToUnfollow.id;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: false } : u))
      );
      setUserToUnfollow(null);
      try {
        await apiService.toggleFollow(userId, currentUser?.id || 1);
      } catch {
        try {
          await sendNativeMessage("TOGGLE_FOLLOW", { seguidoId: userId });
        } catch (err) {
          console.warn("Erro ao deixar de seguir usuário:", err);
        }
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesText =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterFollowingOnly ? u.isFollowing : true;
      return matchesText && matchesFilter;
    });
  }, [users, searchTerm, filterFollowingOnly]);

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onBack}
            style={{
              background: "#F5EFE3",
              border: "none",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Voltar"
          >
            <ChevronLeft size={20} color="#2D3A2E" />
          </button>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 500,
              color: "#2D3A2E",
              margin: 0,
            }}
          >
            Encontrar Colegas
          </h1>
        </div>

        <button
          onClick={() => setFilterFollowingOnly(!filterFollowingOnly)}
          style={{
            background: filterFollowingOnly ? "#2D3A2E" : "#F5EFE3",
            color: filterFollowingOnly ? "#FDFBF7" : "#2D3A2E",
            border: "none",
            borderRadius: 14,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Filter size={14} />
          <span>{filterFollowingOnly ? "Seguindo" : "Todos"}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-5 pb-3">
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "#F5EFE3",
            borderRadius: 16,
            padding: "0 14px",
            border: "1.5px solid rgba(45, 58, 46, 0.08)",
          }}
        >
          <Search size={18} color="#7A8A7B" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou curso..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              padding: "12px 10px",
              fontSize: 13,
              color: "#2D3A2E",
              outline: "none",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                color: "#7A8A7B",
                fontSize: 12,
                cursor: "pointer",
                padding: "4px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Suggested Banner */}
      <div className="px-5 mb-2">
        <div
          style={{
            background: "rgba(214, 140, 112, 0.08)",
            border: "1px solid rgba(214, 140, 112, 0.2)",
            borderRadius: 14,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} color="#D68C70" />
            <p style={{ fontSize: 12, color: "#2D3A2E", margin: 0 }}>
              Siga colegas para acompanhar o foco mútuo no feed
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#D68C70" }}>
            {filteredUsers.length} encontrados
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 32, margin: "0 0 10px 0" }}>🔍</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>
              Nenhum colega encontrado
            </p>
            <p style={{ fontSize: 12, color: "#7A8A7B", marginTop: 4 }}>
              Tente outro nome ou curso acadêmico.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              style={{
                background: "#FAF7F0",
                borderRadius: 16,
                padding: "12px 14px",
                border: "1px solid rgba(45, 58, 46, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                transition: "all 0.15s ease",
              }}
            >
              {/* Profile clickable info */}
              <div
                onClick={() => setSelectedUser(user)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  cursor: "pointer",
                  minWidth: 0,
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #D68C70",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: -3,
                      right: -3,
                      background: "#2D3A2E",
                      color: "#FDFBF7",
                      fontSize: 9,
                      fontWeight: 700,
                      borderRadius: 8,
                      padding: "1px 5px",
                    }}
                  >
                    Nv{user.level}
                  </span>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#2D3A2E",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#7A8A7B",
                      margin: "2px 0 0 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.department}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "#D68C70", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                      <Trophy size={11} /> {user.points} pts
                    </span>
                    <span style={{ fontSize: 10, color: "#7A8A7B" }}>
                      • {user.streakDays}d streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => handleFollowClick(user)}
                style={{
                  background: user.isFollowing ? "#EDE7DA" : "linear-gradient(135deg, #D68C70, #C4785A)",
                  color: user.isFollowing ? "#2D3A2E" : "#FDFBF7",
                  border: user.isFollowing ? "1px solid rgba(45,58,46,0.1)" : "none",
                  borderRadius: 14,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  flexShrink: 0,
                  boxShadow: user.isFollowing ? "none" : "0 3px 8px rgba(214,140,112,0.25)",
                  transition: "all 0.15s ease",
                }}
              >
                {user.isFollowing ? (
                  <>
                    <UserCheck size={14} color="#3E5C43" />
                    <span>Seguindo</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} color="#FDFBF7" />
                    <span>Seguir</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      <UserProfileModal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={
          selectedUser
            ? {
                ...selectedUser,
                isFollowing: users.find((u) => u.id === selectedUser.id)?.isFollowing ?? selectedUser.isFollowing,
              }
            : null
        }
        onToggleFollow={async (userId, nextState) => {
          if (typeof userId === "number") {
            setUsers((prev) =>
              prev.map((u) => (u.id === userId ? { ...u, isFollowing: nextState } : u))
            );
            try {
              await apiService.toggleFollow(userId, currentUser?.id || 1);
            } catch {
              sendNativeMessage("TOGGLE_FOLLOW", { seguidoId: userId }).catch(console.warn);
            }
          }
        }}
      />

      <UnfollowConfirmModal
        isOpen={userToUnfollow !== null}
        onClose={() => setUserToUnfollow(null)}
        onConfirm={handleConfirmUnfollow}
        userName={userToUnfollow?.name || ""}
        userAvatar={userToUnfollow?.avatar}
      />
    </div>
  );
}
