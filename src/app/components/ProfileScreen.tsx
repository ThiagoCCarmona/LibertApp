import * as React from "react";
import { Bell, Moon, Smartphone, LogOut, Shield, Trash2, Image as ImageIcon, Award, Users, MapPin, Camera, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Clock, ChevronDown, X, Globe } from "lucide-react";
import {
  sendNativeMessage,
  isMauiHybrid,
  checkUsageAccess,
  requestUsageAccess,
  checkNotificationPermission,
  requestNotificationPermission,
  showLocalNotification,
  checkLocationPermission,
  requestLocationPermission,
  checkMediaPermission,
  requestMediaPermission,
  pickNativeImage,
} from "../../services/nativeBridge";
import { apiService, type ConquistaDto } from "../../services/apiService";
import { DEFAULT_AVATAR_URL } from "../../assets/defaultAvatars";
import { AdminUsersModal } from "./AdminUsersModal";
import { AchievementsModal } from "./AchievementsModal";
import { restartBreathingSchedule, notify } from "../../services/notificationScheduler";
import { useTranslation } from "../../i18n";

const BREATHING_INTERVAL_OPTIONS = [
  { value: 30, label: "A cada 30 min" },
  { value: 60, label: "A cada 1 hora" },
  { value: 120, label: "A cada 2 horas" },
  { value: 180, label: "A cada 3 horas" },
  { value: 240, label: "A cada 4 horas" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const value = `${String(h).padStart(2, "0")}:00`;
  return { value, label: value };
});

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    style={{
      width: 48,
      height: 28,
      borderRadius: 14,
      background: enabled ? "#D68C70" : "#C4B89A",
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.2s",
    }}
    aria-label={enabled ? "Ativado" : "Desativado"}
  >
    <div style={{
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "#FDFBF7",
      position: "absolute",
      top: 3,
      left: enabled ? 23 : 3,
      transition: "left 0.2s",
      boxShadow: "0 2px 4px rgba(45,58,46,0.2)",
    }} />
  </button>
);

const Slider = ({
  value,
  min = 1,
  max = 10,
  step = 0.5,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div style={{ position: "relative", width: "100%", height: 32, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, right: 0, height: 8, background: "#EDE7DA", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #D68C70, #C4785A)",
            borderRadius: 4,
            transition: "width 0.1s ease-out",
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 2,
          margin: 0,
        }}
        aria-label="Limite de tela diário"
      />
      <div
        style={{
          position: "absolute",
          left: `${pct}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#D68C70",
          border: "3px solid #FDFBF7",
          boxShadow: "0 2px 8px rgba(214,140,112,0.4)",
          pointerEvents: "none",
          transition: "left 0.1s ease-out",
        }}
      />
    </div>
  );
};

export function ProfileScreen({
  onEditProfile,
  onShowBenefits,
  onOpenCard,
  onLogout,
}: {
  onEditProfile?: () => void;
  onShowBenefits?: () => void;
  onOpenCard?: () => void;
  onLogout?: () => void;
}) {
  const [currentUser, setCurrentUser] = React.useState<any>(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [breathingReminders, setBreathingReminders] = React.useState(() => {
    return localStorage.getItem("pref_breathing") !== "false";
  });
  const [breathingIntervalMin, setBreathingIntervalMin] = React.useState(() => {
    const v = localStorage.getItem("pref_breathing_interval");
    return v ? parseInt(v, 10) : 120;
  });
  const [nightMode, setNightMode] = React.useState(() => {
    return localStorage.getItem("pref_nightmode") === "true";
  });
  const [nightModeStart, setNightModeStart] = React.useState(() => {
    return localStorage.getItem("pref_nightmode_start") || "22:00";
  });
  const [nightModeEnd, setNightModeEnd] = React.useState(() => {
    return localStorage.getItem("pref_nightmode_end") || "07:00";
  });
  const [screenTimeLimit, setScreenTimeLimit] = React.useState(() => {
    return localStorage.getItem("pref_screenlimit") !== "false";
  });
  const [dailyLimit, setDailyLimit] = React.useState(() => {
    const v = localStorage.getItem("pref_dailylimit");
    return v ? parseInt(v, 10) : 5;
  });
  const [prioritizeFollowing, setPrioritizeFollowing] = React.useState(() => {
    return localStorage.getItem("pref_feed_following_first") !== "false";
  });
  const { t, language, setLanguage } = useTranslation();
  const [isAchievementsOpen, setIsAchievementsOpen] = React.useState(false);

  const syncBackgroundSettings = React.useCallback((overrides?: any) => {
    const payload = {
      userId: currentUser?.id || 0,
      breathingEnabled: overrides?.breathingReminders ?? breathingReminders,
      breathingIntervalMin: overrides?.breathingIntervalMin ?? breathingIntervalMin,
      nightMode: overrides?.nightMode ?? nightMode,
      nightModeStart: overrides?.nightModeStart ?? nightModeStart,
      nightModeEnd: overrides?.nightModeEnd ?? nightModeEnd,
    };
    sendNativeMessage("SCHEDULE_BACKGROUND_REMINDERS", payload).catch(() => {});
  }, [currentUser, breathingReminders, breathingIntervalMin, nightMode, nightModeStart, nightModeEnd]);

  React.useEffect(() => {
    syncBackgroundSettings();
  }, [currentUser]);

  const [hasUsageAccess, setHasUsageAccess] = React.useState<boolean>(() => localStorage.getItem("perm_usage") === "true");
  const [hasNotificationPermission, setHasNotificationPermission] = React.useState<boolean>(() => localStorage.getItem("perm_notification") === "true");
  const [hasLocationPermission, setHasLocationPermission] = React.useState<boolean>(() => localStorage.getItem("perm_location") === "true");
  const [hasMediaPermission, setHasMediaPermission] = React.useState<boolean>(false);
  const [isTestingNotification, setIsTestingNotification] = React.useState(false);
  const [isRefreshingPermissions, setIsRefreshingPermissions] = React.useState(false);

  const [photoModalOpen, setPhotoModalOpen] = React.useState(false);
  const [conquistas, setConquistas] = React.useState<ConquistaDto[]>([]);

  const checkPermissions = React.useCallback(async () => {
    setIsRefreshingPermissions(true);
    try {
      const [usageRes, notifRes, locRes, mediaRes] = await Promise.allSettled([
        checkUsageAccess(),
        checkNotificationPermission(),
        checkLocationPermission(),
        checkMediaPermission(),
      ]);

      if (usageRes.status === "fulfilled") {
        setHasUsageAccess(usageRes.value);
        if (usageRes.value) localStorage.setItem("perm_usage", "true");
        else localStorage.removeItem("perm_usage");
      }
      if (notifRes.status === "fulfilled") {
        setHasNotificationPermission(notifRes.value);
        if (notifRes.value) localStorage.setItem("perm_notification", "true");
        else localStorage.removeItem("perm_notification");
      }
      if (locRes.status === "fulfilled") {
        setHasLocationPermission(locRes.value);
        if (locRes.value) localStorage.setItem("perm_location", "true");
        else localStorage.removeItem("perm_location");
      }
      if (mediaRes.status === "fulfilled") {
        setHasMediaPermission(mediaRes.value);
        if (mediaRes.value) localStorage.setItem("perm_media", "true");
        else localStorage.removeItem("perm_media");
      }

      // Atualiza também tempo de tela em tempo real
      try {
        const mins = await sendNativeMessage<number>("GET_SCREEN_TIME_TODAY");
        if (typeof mins === "number") {
          setScreenTimeMinutesToday(mins);
          setHasUsageAccess(true);
          localStorage.setItem("perm_usage", "true");
        }
      } catch {}
    } finally {
      setTimeout(() => setIsRefreshingPermissions(false), 500);
    }
  }, []);

  const handleRequestUsageAccess = async () => {
    await requestUsageAccess();
    localStorage.setItem("perm_usage", "true");
    setHasUsageAccess(true);
    setTimeout(() => {
      checkPermissions();
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.id) loadWellness(parsed.id);
        } catch {}
      }
    }, 1500);
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasNotificationPermission(granted);
    if (granted) {
      localStorage.setItem("perm_notification", "true");
      await showLocalNotification("Notificações Ativadas 🌿", "Lembretes e avisos do LibertApp estão prontos!");
    }
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await showLocalNotification("Teste do LibertApp 🌿", "Sua notificação de teste foi enviada com sucesso!");
    } finally {
      setTimeout(() => setIsTestingNotification(false), 800);
    }
  };

  const handleRequestLocationPermission = async () => {
    const granted = await requestLocationPermission();
    setHasLocationPermission(granted);
    if (granted) localStorage.setItem("perm_location", "true");
  };

  const handleRequestMediaPermission = async () => {
    const granted = await requestMediaPermission(true);
    setHasMediaPermission(granted);
    if (granted) {
      localStorage.setItem("perm_media", "true");
    } else {
      localStorage.removeItem("perm_media");
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const size = 360;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(e.target?.result as string);

          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const saveAvatar = async (newAvatarUrl: string) => {
    // 1. Atualiza no cache do navegador
    const cur = localStorage.getItem("currentUser");
    const userObj = cur ? JSON.parse(cur) : {};
    const updatedUser = { ...userObj, fotoUrl: newAvatarUrl };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    // 2. Dispara evento para sincronizar telas abertas (Home, Feed, etc.)
    window.dispatchEvent(new CustomEvent("user_profile_updated", { detail: updatedUser }));
    window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedUser }));
    window.dispatchEvent(new Event("storage"));

    // 3. Salva no backend central
    if (updatedUser.id) {
      try {
        await apiService.updateProfile({
          id: updatedUser.id,
          nome: updatedUser.nome,
          fotoUrl: newAvatarUrl,
        });
      } catch {}
    }

    // 4. Salva no banco nativo MAUI
    try {
      await sendNativeMessage("UPDATE_PROFILE", {
        nome: updatedUser.nome,
        email: updatedUser.email,
        telefone: updatedUser.telefone,
        cpf: updatedUser.cpf,
        localizacao: updatedUser.localizacao,
        fotoUrl: newAvatarUrl,
      });
    } catch {}

    notify({
      title: "Foto Atualizada! 📸",
      message: "Sua foto de perfil foi atualizada com sucesso no feed e na comunidade.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }
    try {
      const compressed = await compressAvatar(file);
      await saveAvatar(compressed);
    } catch (err) {
      console.warn("Erro ao processar imagem:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePickProfilePhoto = async (fromCamera: boolean) => {
    setPhotoModalOpen(false);
    if (isMauiHybrid()) {
      try {
        const img = await pickNativeImage(fromCamera);
        if (img && img.dataUrl) {
          await saveAvatar(img.dataUrl);
          return;
        }
      } catch (err) {
        console.warn("Erro ao selecionar foto via MAUI bridge:", err);
      }
    }
    fileInputRef.current?.click();
  };

  const handleToggleBreathing = async (val: boolean) => {
    setBreathingReminders(val);
    localStorage.setItem("pref_breathing", String(val));
    if (val) {
      const granted = await requestNotificationPermission();
      setHasNotificationPermission(granted);
      if (granted) localStorage.setItem("perm_notification", "true");
    }
    restartBreathingSchedule();
    syncBackgroundSettings({ breathingReminders: val });
  };

  const handleChangeBreathingInterval = (val: number) => {
    setBreathingIntervalMin(val);
    localStorage.setItem("pref_breathing_interval", String(val));
    restartBreathingSchedule();
    syncBackgroundSettings({ breathingIntervalMin: val });
  };

  const handleToggleNightMode = async (val: boolean) => {
    setNightMode(val);
    localStorage.setItem("pref_nightmode", String(val));
    syncBackgroundSettings({ nightMode: val });

    // Ativa/desativa o "Não Perturbar" do sistema (somente Android, requer permissão especial)
    try {
      if (val) {
        const hasAccess = await sendNativeMessage<boolean>("CHECK_DND_ACCESS");
        if (!hasAccess) {
          const confirmDnd = window.confirm(
            "Para ativar o Modo Não Perturbe durante a noite, o LibertApp precisa da autorização do sistema. Deseja abrir as configurações agora?"
          );
          if (confirmDnd) {
            await sendNativeMessage("REQUEST_DND_ACCESS");
          }
          return;
        }
      }
      await sendNativeMessage("SET_DND_MODE", { enabled: val });
      if (val) {
        notify({
          title: "Modo Noturno & Não Perturbe 🌙",
          message: "Filtro de não perturbe ativado para o seu período de descanso.",
        });
      }
    } catch {
      // Fora do app nativo (web) ou recurso indisponível na plataforma
    }
  };

  const handleChangeNightModeStart = (val: string) => {
    setNightModeStart(val);
    localStorage.setItem("pref_nightmode_start", val);
    syncBackgroundSettings({ nightModeStart: val });
  };

  const handleChangeNightModeEnd = (val: string) => {
    setNightModeEnd(val);
    localStorage.setItem("pref_nightmode_end", val);
    syncBackgroundSettings({ nightModeEnd: val });
  };

  const handleToggleScreenLimit = async (val: boolean) => {
    setScreenTimeLimit(val);
    localStorage.setItem("pref_screenlimit", String(val));
    if (val && hasUsageAccess === false && isMauiHybrid()) {
      const confirmAccess = window.confirm(
        "Para monitorar o limite de tempo de tela e alertá-lo, o LibertApp precisa de acesso de uso no Android. Deseja abrir as configurações agora?"
      );
      if (confirmAccess) {
        await handleRequestUsageAccess();
      }
    }
  };

  const handleChangeDailyLimit = (val: number) => {
    setDailyLimit(val);
    localStorage.setItem("pref_dailylimit", String(val));
  };

  const handleTogglePrioritizeFollowing = (val: boolean) => {
    setPrioritizeFollowing(val);
    localStorage.setItem("pref_feed_following_first", String(val));
    window.dispatchEvent(new CustomEvent("feed_preference_updated"));
  };

  const [isAdminUsersOpen, setIsAdminUsersOpen] = React.useState(false);
  const [myPosts, setMyPosts] = React.useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = React.useState(false);
  const [wellness, setWellness] = React.useState<{
    pomodoroMinutosSemana: number;
    atividadesSemana: number;
    sequenciaDias: number;
    bemEstarScore: number;
  } | null>(null);
  const [screenTimeMinutesToday, setScreenTimeMinutesToday] = React.useState<number | null>(null);

  const loadAchievements = React.useCallback(async (userId: number) => {
    if (!userId) return;
    try {
      const data = await apiService.getMinhasConquistas(userId);
      if (data && Array.isArray(data) && data.length > 0) {
        setConquistas(data);
        return;
      }
    } catch {}

    // Fallback padrão se API offline
    setConquistas([
      { id: 1, titulo: "Primeira Raiz", descricao: "Iniciou os primeiros blocos de foco offline", icone: "🌱", meta: 1, pontosRecompensa: 50, progresso: 1, desbloqueada: true, tipo: "pomodoro" },
      { id: 2, titulo: "Escudo Digital", descricao: "3 dias seguidos atingindo a meta de desconexão", icone: "🛡️", meta: 3, pontosRecompensa: 100, progresso: 3, desbloqueada: true, tipo: "streak" },
      { id: 3, titulo: "Trilha Verde", descricao: "Completou um desafio presencial na natureza", icone: "🏔️", meta: 1, pontosRecompensa: 75, progresso: 1, desbloqueada: true, tipo: "desafio" },
      { id: 4, titulo: "Mente Serena", descricao: "Realizou 10 pausas de respiro consciente", icone: "🧘", meta: 10, pontosRecompensa: 120, progresso: 6, desbloqueada: false, tipo: "respiro" },
    ]);
  }, []);

  const loadWellness = React.useCallback(async (userId: number) => {
    if (!userId) return;
    try {
      const summary = await apiService.getWellnessSummary(userId);
      if (summary) {
        setWellness(summary);
      }
    } catch (err) {
      console.warn("API de bem-estar indisponível, usando cálculo local:", err);
    }

    // Se o summary ainda estiver nulo, calcula baseline saudável local
    setWellness((prev) => {
      if (prev) return prev;
      try {
        const storedUser = localStorage.getItem("currentUser");
        const userObj = storedUser ? JSON.parse(storedUser) : null;
        const pts = userObj?.pontos || 0;
        const streak = Math.min(14, Math.max(1, Math.floor(pts / 200)));
        const foco = Math.max(30, Math.floor(pts * 0.15));
        const score = Math.min(100, Math.max(70, Math.round(70 + (pts / 100))));
        return {
          pomodoroMinutosSemana: foco,
          atividadesSemana: Math.max(2, Math.floor(pts / 80)),
          sequenciaDias: streak,
          bemEstarScore: score,
        };
      } catch {
        return {
          pomodoroMinutosSemana: 60,
          atividadesSemana: 4,
          sequenciaDias: 3,
          bemEstarScore: 78,
        };
      }
    });

    try {
      const minutos = await sendNativeMessage<number>("GET_SCREEN_TIME_TODAY");
      if (typeof minutos === "number") {
        setScreenTimeMinutesToday(minutos);
        setHasUsageAccess(true);
        localStorage.setItem("perm_usage", "true");
      } else {
        const usage = await checkUsageAccess();
        setHasUsageAccess(usage);
        if (usage) localStorage.setItem("perm_usage", "true");
      }
    } catch {
      // Indisponível fora do app nativo (ou sem permissão de acesso a uso concedida)
    }
  }, []);

  const loadMyPosts = React.useCallback(async (userId: number) => {
    if (!userId) return;
    setLoadingPosts(true);
    try {
      const posts = await apiService.getUserPosts(userId);
      if (posts && Array.isArray(posts)) {
        setMyPosts(posts);
      }
    } catch (err) {
      console.warn("Erro ao buscar posts do perfil:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem("currentUser");
        let activeUserId: number | undefined;
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          if (parsed?.id) {
            activeUserId = parsed.id;
            loadMyPosts(parsed.id);
            loadWellness(parsed.id);
            loadAchievements(parsed.id);
          }
        }

        const u = await sendNativeMessage<any>("GET_CURRENT_USER");
        if (isMounted && u) {
          const merged = { ...u, ...(stored ? JSON.parse(stored) : {}) };
          setCurrentUser(merged);
          if (merged?.id) {
            activeUserId = merged.id;
            loadMyPosts(merged.id);
            loadWellness(merged.id);
            loadAchievements(merged.id);
          }
        }

        if (activeUserId) {
          loadAchievements(activeUserId);
        }
      } catch (err) {
        console.warn("Erro ao carregar usuário em ProfileScreen:", err);
      }
    };
    loadUser();

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          if (parsed?.id) {
            loadMyPosts(parsed.id);
            loadWellness(parsed.id);
            loadAchievements(parsed.id);
          }
        }
      } catch {}
    };
    window.addEventListener("user_profile_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("user_profile_updated", handleUpdate);
    };
  }, [loadMyPosts, loadWellness, loadAchievements]);

  const handleDeleteMyPost = async (postId: number) => {
    if (!window.confirm("Deseja realmente apagar esta publicação?")) return;
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await apiService.deletePost(postId, currentUser?.id || 1);
    } catch (err) {
      console.warn("Erro ao excluir post:", err);
    }
  };

  const displayName = currentUser?.nome || "Estudante Carmelita";
  const displayAvatar = currentUser?.fotoUrl || DEFAULT_AVATAR_URL;
  const displayEmailOrDate = currentUser?.curso
    ? `${currentUser.curso} • ${currentUser.email}`
    : (currentUser?.email || "Membro da Comunidade Carmelita");

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="px-6 pt-4 pb-4">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              onClick={() => setPhotoModalOpen(true)}
              style={{
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Toque para alterar sua foto de perfil"
            >
              <div style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #D68C70",
                boxShadow: "0 4px 12px rgba(214,140,112,0.25)",
              }}>
                <img
                  src={displayAvatar}
                  alt={`Foto de ${displayName}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#D68C70",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FDFBF7",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <Camera size={13} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", margin: 0 }}>
                  {displayName}
                </h1>
                {currentUser?.isAdmin && (
                  <span
                    style={{
                      background: "#2D3A2E",
                      color: "#FDFBF7",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 8,
                      letterSpacing: "0.06em",
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "#7A8A7B", marginTop: 2 }}>{displayEmailOrDate}</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="px-6 pb-4">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            Relatórios de Bem-estar
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500, margin: 0 }}>Tela Hoje</p>
                <span style={{ fontSize: 10, color: "#D68C70", fontWeight: 600 }}>Meta: {dailyLimit}h</span>
              </div>
              {screenTimeMinutesToday === null ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: "#7A8A7B", fontWeight: 400, margin: 0 }}>
                    {hasUsageAccess ? "Sem dados" : "Acesso de Uso"}
                  </p>
                  <p style={{ fontSize: 9.5, color: "#7A8A7B", margin: 0, lineHeight: 1.25 }}>
                    {hasUsageAccess
                      ? "Aguardando sincronização de tela..."
                      : "Libere o acesso de uso nas configurações para ver horas reais."}
                  </p>
                  {!hasUsageAccess && (
                    <button
                      onClick={handleRequestUsageAccess}
                      style={{
                        background: "#D68C70",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 8px",
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        marginTop: 4,
                      }}
                    >
                      <ExternalLink size={10} /> Liberar Acesso
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#D68C70", fontWeight: 400, marginTop: 4, margin: 0 }}>
                    {Math.floor(screenTimeMinutesToday / 60)}h {screenTimeMinutesToday % 60}m
                  </p>
                  <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "#EDE7DA", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round((screenTimeMinutesToday / 60 / dailyLimit) * 100))}%`,
                      background: (screenTimeMinutesToday / 60 / dailyLimit) > 0.9 ? "#E06D53" : "#6B8F6D",
                      borderRadius: 2,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: (screenTimeMinutesToday / 60 / dailyLimit) > 0.9 ? "#C44F35" : "#6B8F6D", fontWeight: 500, marginTop: 4, margin: "4px 0 0 0" }}>
                    {Math.round((screenTimeMinutesToday / 60 / dailyLimit) * 100)}% do limite diário
                  </p>
                </>
              )}
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Atividades</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#6B8F6D", fontWeight: 400, marginTop: 4 }}>
                {wellness ? wellness.atividadesSemana : "—"}
              </p>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>esta semana</p>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Sequência</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#C4A882", fontWeight: 400, marginTop: 4 }}>
                {wellness ? `${wellness.sequenciaDias} ${wellness.sequenciaDias === 1 ? "dia" : "dias"}` : "—"}
              </p>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>consecutivos</p>
            </div>

            <div style={{
              background: "#F5EFE3",
              borderRadius: 16,
              padding: "14px 12px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <p style={{ fontSize: 11, color: "#7A8A7B", fontWeight: 500 }}>Bem-estar</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#7A8A7B", fontWeight: 400, marginTop: 4 }}>
                {wellness ? `${wellness.bemEstarScore}%` : "—"}
              </p>
              <p style={{ fontSize: 10, color: "#7A8A7B", marginTop: 4 }}>pontuação</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={onEditProfile}
            style={{
              background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(214,140,112,0.2)",
              transition: "all 0.2s",
            }}
          >
            ✏️ {t("profile_edit")}
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(45,58,46,0.2)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: onLogout ? 1 : 0.6,
            }}
            aria-label="Logout"
            disabled={!onLogout}
          >
            🚪 {t("profile_logout")}
          </button>
          <button
            onClick={onShowBenefits}
            style={{
              background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(45,58,46,0.2)",
              transition: "all 0.2s",
            }}
          >
            🎁 {t("nav_benefits")}
          </button>
          <button
            onClick={onOpenCard}
            style={{
              background: "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#FDFBF7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(214,140,112,0.2)",
              transition: "all 0.2s",
            }}
          >
            🪪 {t("card_view_digital")}
          </button>
        </div>

        {/* Seção Minhas Conquistas */}
        <div className="px-6 pb-6">
          <div style={{
            background: "#F5EFE3",
            borderRadius: 16,
            padding: "16px",
            border: "1px solid rgba(45,58,46,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(214,140,112,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Award size={18} color="#D68C70" />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2D3A2E", margin: 0 }}>{t("profile_achievements_title")}</h3>
                  <p style={{ fontSize: 11, color: "#7A8A7B", margin: "2px 0 0 0" }}>
                    {conquistas.filter((c) => c.desbloqueada).length} de {conquistas.length} desbloqueadas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAchievementsOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#D68C70",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                {t("profile_view_all")} →
              </button>
            </div>

            {/* Badges / Conquistas em destaque */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {conquistas.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setIsAchievementsOpen(true)}
                  style={{
                    background: c.desbloqueada ? "#FAF7F0" : "rgba(237,231,218,0.5)",
                    border: c.desbloqueada ? "1.5px solid #D68C70" : "1px dashed rgba(45,58,46,0.15)",
                    borderRadius: 12,
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    opacity: c.desbloqueada ? 1 : 0.65,
                    transition: "transform 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 22, filter: c.desbloqueada ? "none" : "grayscale(80%)" }}>
                    {c.icone || "🌱"}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "#2D3A2E", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.titulo}
                    </p>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: c.desbloqueada ? "#3E5C43" : "#7A8A7B",
                      display: "inline-block",
                      marginTop: 2,
                    }}>
                      {c.desbloqueada ? "✓ Conquistada" : `${c.progresso}/${c.meta}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botão Especial do Painel Administrativo (Exclusivo para Admins) */}
        {currentUser?.isAdmin && (
          <div className="px-6 pb-6">
            <button
              onClick={() => setIsAdminUsersOpen(true)}
              style={{
                width: "100%",
                background: "#2D3A2E",
                border: "none",
                borderRadius: 14,
                padding: "14px 18px",
                color: "#FDFBF7",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(45,58,46,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Shield size={20} color="#D68C70" />
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Painel de Gestão de Usuários</p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(253,251,247,0.7)", fontWeight: 400 }}>
                    Controlar, apagar, desativar e redefinir senhas
                  </p>
                </div>
              </div>
              <span style={{ fontSize: 18 }}>➔</span>
            </button>
          </div>
        )}

        {/* Seção Minhas Publicações */}
        <div className="px-6 pb-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", margin: 0 }}>
              📸 Minhas Publicações ({myPosts.length})
            </h2>
            <button
              onClick={() => currentUser?.id && loadMyPosts(currentUser.id)}
              style={{
                background: "none",
                border: "none",
                color: "#D68C70",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Atualizar
            </button>
          </div>

          {loadingPosts ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 12, color: "#7A8A7B" }}>Carregando suas publicações...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div
              style={{
                background: "#F5EFE3",
                borderRadius: 14,
                padding: "20px",
                textAlign: "center",
                border: "1px dashed rgba(214,140,112,0.4)",
              }}
            >
              <p style={{ fontSize: 13, color: "#2D3A2E", fontWeight: 600, margin: "0 0 4px 0" }}>
                Você ainda não publicou no mural
              </p>
              <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>
                Compartilhe fotos e conquistas na tela de Início para registrar seus momentos!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myPosts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "#F5EFE3",
                    borderRadius: 14,
                    padding: "12px 14px",
                    border: "1px solid rgba(45,58,46,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#D68C70" }}>
                      {p.icon || "🌱"} {p.type || "Publicação"} • {p.time}
                    </span>
                    <button
                      onClick={() => handleDeleteMyPost(p.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#C4785A",
                        padding: "4px",
                      }}
                      title="Excluir minha publicação"
                      aria-label="Excluir publicação"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {p.image && (
                    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", background: "#EDE7DA" }}>
                      <img src={p.image} alt="Minha foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: "#2D3A2E", margin: 0, lineHeight: 1.4 }}>{p.content}</p>

                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#7A8A7B", marginTop: 2 }}>
                    <span>❤️ {p.likes || 0} curtidas</span>
                    <span>💬 {p.comments || 0} comentários</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Configuration Section */}
        <div className="px-6 pb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, color: "#2D3A2E", marginBottom: 12 }}>
            {t("profile_settings_title")}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Language Switcher */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(91,123,107,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Globe size={18} color="#5B7B6B" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>{t("profile_language_title")}</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", margin: "2px 0 0 0" }}>{t("profile_language_sub")}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { code: "pt", label: "Português", flag: "🇧🇷" },
                  { code: "en", label: "English", flag: "🇺🇸" },
                  { code: "es", label: "Español", flag: "🇪🇸" },
                ].map((item) => {
                  const isActive = language === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLanguage(item.code as any)}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 10,
                        border: isActive ? "2px solid #5B7B6B" : "1px solid rgba(45,58,46,0.12)",
                        background: isActive ? "rgba(91,123,107,0.15)" : "#FDFBF7",
                        color: isActive ? "#2D3A2E" : "#7A8A7B",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{item.flag}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prioritize Following in Feed */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(196,168,130,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Users size={18} color="#C4A882" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>Priorizar Quem Você Segue</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>Mostrar primeiro no Feed</p>
                  </div>
                </div>
                <ToggleSwitch enabled={prioritizeFollowing} onChange={handleTogglePrioritizeFollowing} />
              </div>
            </div>

            {/* Permissões do Dispositivo */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(107,143,109,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Shield size={18} color="#6B8F6D" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E", margin: 0 }}>{t("profile_permissions_title")}</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", margin: 0 }}>{t("profile_permissions_sub")}</p>
                  </div>
                </div>
                <button
                  onClick={checkPermissions}
                  disabled={isRefreshingPermissions}
                  title="Atualizar status"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: isRefreshingPermissions ? "default" : "pointer",
                    color: isRefreshingPermissions ? "#D68C70" : "#7A8A7B",
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    transition: "color 0.2s",
                  }}
                >
                  <RefreshCw size={15} className={isRefreshingPermissions ? "animate-spin" : ""} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {/* 1. Notificações */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Bell size={15} color="#D68C70" />
                    <div>
                      <span style={{ fontWeight: 600, color: "#2D3A2E" }}>{t("profile_perm_notifications")}</span>
                      <p style={{ fontSize: 10.5, color: "#7A8A7B", margin: 0 }}>{t("profile_perm_notifications_desc")}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {hasNotificationPermission ? (
                      <>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#6B8F6D", fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> {t("profile_active")}
                        </span>
                        <button
                          onClick={handleTestNotification}
                          disabled={isTestingNotification}
                          style={{
                            background: "#FAF7F0",
                            border: "1px solid rgba(45,58,46,0.12)",
                            borderRadius: 6,
                            padding: "3px 7px",
                            fontSize: 10,
                            color: "#2D3A2E",
                            cursor: "pointer",
                          }}
                        >
                          {isTestingNotification ? "..." : t("profile_test")}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleRequestNotificationPermission}
                        style={{
                          background: "#D68C70",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 10.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("profile_authorize")}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Tempo de Tela */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid rgba(45,58,46,0.06)", paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Smartphone size={15} color="#6B8F6D" />
                    <div>
                      <span style={{ fontWeight: 600, color: "#2D3A2E" }}>{t("profile_perm_usage")}</span>
                      <p style={{ fontSize: 10.5, color: "#7A8A7B", margin: 0 }}>{t("profile_perm_usage_desc")}</p>
                    </div>
                  </div>
                  <div>
                    {hasUsageAccess ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#6B8F6D", fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> {t("profile_granted")}
                      </span>
                    ) : (
                      <button
                        onClick={handleRequestUsageAccess}
                        style={{
                          background: "#D68C70",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 10.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("profile_authorize")}
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Localização */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid rgba(45,58,46,0.06)", paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="#D68C70" />
                    <div>
                      <span style={{ fontWeight: 600, color: "#2D3A2E" }}>{t("profile_perm_location")}</span>
                      <p style={{ fontSize: 10.5, color: "#7A8A7B", margin: 0 }}>{t("profile_perm_location_desc")}</p>
                    </div>
                  </div>
                  <div>
                    {hasLocationPermission ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#6B8F6D", fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> {t("profile_active")}
                      </span>
                    ) : (
                      <button
                        onClick={handleRequestLocationPermission}
                        style={{
                          background: "#D68C70",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 10.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("profile_authorize")}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Mídia & Câmera */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid rgba(45,58,46,0.06)", paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Camera size={15} color="#6B8F6D" />
                    <div>
                      <span style={{ fontWeight: 600, color: "#2D3A2E" }}>{t("profile_perm_media")}</span>
                      <p style={{ fontSize: 10.5, color: "#7A8A7B", margin: 0 }}>{t("profile_perm_media_desc")}</p>
                    </div>
                  </div>
                  <div>
                    {hasMediaPermission ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#6B8F6D", fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> {t("profile_granted")}
                      </span>
                    ) : (
                      <button
                        onClick={handleRequestMediaPermission}
                        style={{
                          background: "#D68C70",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 10.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("profile_authorize")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Breathing Reminders */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: breathingReminders ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(214,140,112,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Bell size={18} color="#D68C70" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>{t("profile_breathing_title")}</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>
                      {BREATHING_INTERVAL_OPTIONS.find((o) => o.value === breathingIntervalMin)?.label || `${breathingIntervalMin} min`}
                    </p>
                  </div>
                </div>
                <ToggleSwitch enabled={breathingReminders} onChange={handleToggleBreathing} />
              </div>
              {breathingReminders && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#7A8A7B", margin: 0 }}>
                    {t("profile_breathing_freq")}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {BREATHING_INTERVAL_OPTIONS.map((o) => {
                      const isSelected = o.value === breathingIntervalMin;
                      return (
                        <button
                          key={o.value}
                          onClick={() => handleChangeBreathingInterval(o.value)}
                          style={{
                            padding: "8px 6px",
                            borderRadius: 10,
                            border: isSelected ? "1.5px solid #D68C70" : "1px solid rgba(45,58,46,0.1)",
                            background: isSelected ? "#D68C70" : "#FAF7F0",
                            color: isSelected ? "#FDFBF7" : "#2D3A2E",
                            fontSize: 11.5,
                            fontWeight: isSelected ? 700 : 500,
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "all 0.15s ease",
                            textAlign: "center",
                            boxShadow: isSelected ? "0 2px 8px rgba(214,140,112,0.25)" : "none",
                          }}
                        >
                          {o.label.replace("A cada ", "")}
                        </button>
                      );
                    })}
                  </div>

                  {/* Personalização livre do tempo em minutos */}
                  <div style={{
                    marginTop: 2,
                    background: "#FAF7F0",
                    borderRadius: 10,
                    padding: "8px 12px",
                    border: "1px solid rgba(45,58,46,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 11.5, color: "#2D3A2E", fontWeight: 500 }}>
                      {t("profile_breathing_custom")}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleChangeBreathingInterval(Math.max(5, breathingIntervalMin - 5))}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "1px solid rgba(45,58,46,0.15)",
                          background: "#FFFFFF",
                          color: "#2D3A2E",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={breathingIntervalMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) handleChangeBreathingInterval(val);
                        }}
                        style={{
                          width: 52,
                          textAlign: "center",
                          padding: "4px 2px",
                          borderRadius: 6,
                          border: "1px solid rgba(45,58,46,0.2)",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#D68C70",
                          background: "#FFFFFF",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleChangeBreathingInterval(breathingIntervalMin + 5)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "1px solid rgba(45,58,46,0.15)",
                          background: "#FFFFFF",
                          color: "#2D3A2E",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Night Mode */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: nightMode ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(107,143,109,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Moon size={18} color="#6B8F6D" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>{t("profile_night_title")}</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>{nightModeStart} - {nightModeEnd}</p>
                  </div>
                </div>
                <ToggleSwitch enabled={nightMode} onChange={handleToggleNightMode} />
              </div>
              {nightMode && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#FAF7F0",
                      border: "1px solid rgba(45,58,46,0.12)",
                      borderRadius: 10,
                      padding: "8px 10px",
                    }}>
                      <Clock size={13} color="#6B8F6D" />
                      <select
                        value={nightModeStart}
                        onChange={(e) => handleChangeNightModeStart(e.target.value)}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#2D3A2E",
                          fontFamily: "'DM Sans', sans-serif",
                          cursor: "pointer",
                          appearance: "none",
                          WebkitAppearance: "none",
                        }}
                        aria-label="Horário de início do modo noturno"
                      >
                        {HOUR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <ChevronDown size={14} color="#7A8A7B" style={{ pointerEvents: "none", flexShrink: 0 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#7A8A7B" }}>-</span>
                  <div style={{ flex: 1, position: "relative" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#FAF7F0",
                      border: "1px solid rgba(45,58,46,0.12)",
                      borderRadius: 10,
                      padding: "8px 10px",
                    }}>
                      <Clock size={13} color="#6B8F6D" />
                      <select
                        value={nightModeEnd}
                        onChange={(e) => handleChangeNightModeEnd(e.target.value)}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#2D3A2E",
                          fontFamily: "'DM Sans', sans-serif",
                          cursor: "pointer",
                          appearance: "none",
                          WebkitAppearance: "none",
                        }}
                        aria-label="Horário de término do modo noturno"
                      >
                        {HOUR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <ChevronDown size={14} color="#7A8A7B" style={{ pointerEvents: "none", flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Screen Time Limit */}
            <div style={{
              background: "#F5EFE3",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid rgba(45,58,46,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(196,168,130,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Smartphone size={18} color="#C4A882" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2D3A2E" }}>{t("profile_screenlimit_title")}</p>
                    <p style={{ fontSize: 11, color: "#7A8A7B", marginTop: 1 }}>Meta: {dailyLimit}h</p>
                  </div>
                </div>
                <ToggleSwitch enabled={screenTimeLimit} onChange={handleToggleScreenLimit} />
              </div>

              {screenTimeLimit && (
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>1h</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#D68C70" }}>{dailyLimit} horas</span>
                    <span style={{ fontSize: 11, color: "#7A8A7B" }}>10h</span>
                  </div>
                  <Slider value={dailyLimit} min={1} max={10} step={0.5} onChange={handleChangeDailyLimit} />
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: 12,
            background: "rgba(214,140,112,0.08)",
            border: "1px solid rgba(214,140,112,0.2)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <p style={{ fontSize: 12, color: "#7A8A7B", lineHeight: 1.4 }}>
              Pausas regulares ajudam a reduzir ansiedade e melhorar seu bem-estar digital.
            </p>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                marginTop: 20,
                marginBottom: 20,
                background: "#FAF7F0",
                border: "1.5px solid rgba(224, 109, 83, 0.3)",
                borderRadius: 14,
                padding: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                color: "#E06D53",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={16} />
              <span>Sair da conta</span>
            </button>
          )}
        </div>
      </div>

      {currentUser?.isAdmin && (
        <AdminUsersModal
          isOpen={isAdminUsersOpen}
          onClose={() => setIsAdminUsersOpen(false)}
          callerId={currentUser?.id || 1}
        />
      )}

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        usuarioId={currentUser?.id || 1}
        isAdmin={!!currentUser?.isAdmin}
      />

      {/* Hidden File Input for Web Photo Fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {/* Photo Selection Bottom Sheet */}
      {photoModalOpen && (
        <div
          onClick={() => setPhotoModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#FDFBF7",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "20px 20px 32px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow: "0 -8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#2D3A2E", margin: 0 }}>
                  {t("profile_photo_modal_title")}
                </h3>
                <p style={{ fontSize: 12, color: "#7A8A7B", margin: "2px 0 0 0" }}>
                  {t("profile_photo_modal_sub")}
                </p>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  color: "#7A8A7B",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => handlePickProfilePhoto(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(45,58,46,0.08)",
                background: "#F5EFE3",
                color: "#2D3A2E",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(214,140,112,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={18} color="#D68C70" />
              </div>
              <span>{t("profile_photo_camera")}</span>
            </button>

            <button
              onClick={() => handlePickProfilePhoto(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(45,58,46,0.08)",
                background: "#F5EFE3",
                color: "#2D3A2E",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(107,143,109,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={18} color="#6B8F6D" />
              </div>
              <span>{t("profile_photo_gallery")}</span>
            </button>

            <button
              onClick={() => setPhotoModalOpen(false)}
              style={{
                marginTop: 4,
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "#7A8A7B",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t("profile_photo_cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
