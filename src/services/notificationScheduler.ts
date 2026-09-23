import { sendNativeMessage, isMauiHybrid } from "./nativeBridge";
import { apiService } from "./apiService";

/**
 * Agenda lembretes locais (respiro, limite de tela, incentivo de perfil) e verifica
 * periodicamente novas curtidas/comentários nas publicações do usuário, disparando
 * notificações nativas via a ponte HybridBridge (ver LibertApp.Mobile/Services/NotificationService.cs).
 *
 * Só roda dentro do app nativo (isMauiHybrid()) e apenas enquanto o app está aberto/em
 * primeiro ou segundo plano recente — não é um push real, então não chega com o app fechado.
 */

let breathingTimer: number | null = null;
let screenTimeTimer: number | null = null;
let interactionsTimer: number | null = null;
let profileIncentiveTimer: number | null = null;
const lastKnownByPostId = new Map<number, { likes: number; comments: number }>();

function isWithinNightMode(): boolean {
  if (localStorage.getItem("pref_nightmode") !== "true") return false;

  const start = localStorage.getItem("pref_nightmode_start") || "22:00";
  const end = localStorage.getItem("pref_nightmode_end") || "07:00";
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = start.split(":").map((n) => parseInt(n, 10));
  const [eh, em] = end.split(":").map((n) => parseInt(n, 10));
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  // Intervalo que cruza a meia-noite (ex: 22h às 7h)
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

export function notify(titleOrObj: string | { title: string; message: string }, message?: string) {
  let title = "";
  let msg = "";
  if (typeof titleOrObj === "object" && titleOrObj !== null) {
    title = titleOrObj.title;
    msg = titleOrObj.message;
  } else {
    title = titleOrObj;
    msg = message || "";
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("libertapp_inapp_notification", {
        detail: { title, message: msg },
      })
    );
  }

  if (isMauiHybrid()) {
    sendNativeMessage("SHOW_LOCAL_NOTIFICATION", { title, message: msg }).catch(() => {});
  } else {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body: msg });
      } catch {}
    }
  }
}

function scheduleBreathingReminders() {
  if (breathingTimer) window.clearInterval(breathingTimer);
  if (localStorage.getItem("pref_breathing") === "false") return;

  const intervalMin = parseInt(localStorage.getItem("pref_breathing_interval") || "120", 10);
  breathingTimer = window.setInterval(() => {
    if (isWithinNightMode()) return;
    notify(
      "Hora de respirar 🌿",
      "Faça uma pausa de 1 minuto para respirar fundo e se reconectar com o momento presente."
    );
  }, Math.max(1, intervalMin) * 60 * 1000);
}

function checkScreenTimeLimit() {
  if (localStorage.getItem("pref_screenlimit") === "false") return;
  const dailyLimitHours = parseFloat(localStorage.getItem("pref_dailylimit") || "5");

  sendNativeMessage<number>("GET_SCREEN_TIME_TODAY")
    .then((minutes) => {
      if (typeof minutes !== "number") return;
      const key = `libertapp_screentime_alert_${new Date().toDateString()}`;
      if (minutes / 60 >= dailyLimitHours && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        notify(
          "Limite de tela atingido ⏳",
          `Você já usou ${h}h${m}m de tela hoje. Que tal uma pausa consciente?`
        );
      }
    })
    .catch(() => {});
}

async function checkNewInteractions(usuarioId: number) {
  if (!usuarioId) return;

  // 1. Notificações diretas da API Central (novos seguidores, incentivos de presença recebidos)
  try {
    const unread = await apiService.getUnreadNotifications(usuarioId);
    if (unread && Array.isArray(unread)) {
      for (const n of unread) {
        notify(
          n.titulo || (n.tipo === "follow" ? "Novo Seguidor! 🌱" : "Incentivo Recebido! 🌟"),
          n.mensagem
        );
      }
    }
  } catch {}

  // 2. Fila local de notificações (para testes instantâneos ou suporte offline)
  try {
    const localKey = `libertapp_notifications_${usuarioId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const list: any[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        localStorage.removeItem(localKey);
        for (const item of list) {
          notify(item.titulo, item.mensagem);
        }
      }
    }
  } catch {}

  // 3. Novas curtidas e comentários em publicações
  try {
    const posts = await apiService.getUserPosts(usuarioId);
    const isFirstCheck = lastKnownByPostId.size === 0;

    for (const p of posts) {
      const prev = lastKnownByPostId.get(p.id);
      if (prev && !isFirstCheck) {
        if (p.likes > prev.likes) {
          notify("Nova curtida ❤️", "Alguém curtiu sua publicação no LibertApp.");
        }
        if ((p.comments ?? 0) > prev.comments) {
          notify("Novo comentário 💬", "Alguém comentou na sua publicação no LibertApp.");
        }
      }
      lastKnownByPostId.set(p.id, { likes: p.likes, comments: p.comments ?? 0 });
    }
  } catch {
    // API indisponível: tenta novamente no próximo ciclo
  }
}

function scheduleProfileIncentive(usuarioId: number) {
  if (profileIncentiveTimer) window.clearInterval(profileIncentiveTimer);

  const checkAndNotify = () => {
    try {
      const stored = localStorage.getItem("currentUser");
      const user = stored ? JSON.parse(stored) : null;
      if (!user) return;

      const missing: string[] = [];
      if (!user.bio || user.bio.trim().length < 10) missing.push("uma biografia");
      if (!user.fotoUrl) missing.push("uma foto de perfil");
      if (!user.localizacao) missing.push("sua localização");

      if (missing.length > 0) {
        const key = `libertapp_profile_incentive_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          notify(
            "Complete seu perfil ✨",
            `Adicione ${missing[0]} para deixar seu perfil mais completo na comunidade.`
          );
        }
      }
    } catch {}
  };

  checkAndNotify();
  profileIncentiveTimer = window.setInterval(checkAndNotify, 6 * 60 * 60 * 1000); // a cada 6h
  void usuarioId;
}

/** Deve ser chamado uma vez quando o usuário loga/abre o app principal. Retorna uma função de limpeza. */
export function startNotificationScheduler(usuarioId: number): () => void {
  if (!usuarioId) return () => {};

  // Solicita permissão de notificação no início
  if (isMauiHybrid()) {
    sendNativeMessage("REQUEST_NOTIFICATION_PERMISSION").catch(() => {});
  } else if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }

  scheduleBreathingReminders();

  checkScreenTimeLimit();
  screenTimeTimer = window.setInterval(checkScreenTimeLimit, 15 * 60 * 1000);

  checkNewInteractions(usuarioId);
  interactionsTimer = window.setInterval(() => checkNewInteractions(usuarioId), 25 * 1000); // a cada 25 segundos

  const handleNotificationEvent = (e: any) => {
    if (!e.detail?.targetUserId || Number(e.detail.targetUserId) === Number(usuarioId)) {
      checkNewInteractions(usuarioId);
    }
  };
  window.addEventListener("libertapp_notification_received", handleNotificationEvent);

  scheduleProfileIncentive(usuarioId);

  return () => {
    if (breathingTimer) window.clearInterval(breathingTimer);
    if (screenTimeTimer) window.clearInterval(screenTimeTimer);
    if (interactionsTimer) window.clearInterval(interactionsTimer);
    if (profileIncentiveTimer) window.clearInterval(profileIncentiveTimer);
    window.removeEventListener("libertapp_notification_received", handleNotificationEvent);
    lastKnownByPostId.clear();
  };
}

/** Chame após o usuário alterar a preferência de lembretes de respiro (toggle ou intervalo). */
export function restartBreathingSchedule() {
  scheduleBreathingReminders();
}
