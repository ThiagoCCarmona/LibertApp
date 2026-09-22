import { DEFAULT_AVATAR_URL } from "../assets/defaultAvatars";

/**
 * Ponte de comunicacao bidirecional com o backend C# (.NET MAUI HybridWebView).
 * Se o app estiver rodando fora do MAUI (navegador comum), opera com fallback seguro.
 */

export interface BridgeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  callbackId?: string;
}

type CallbackFn = (response: BridgeResponse) => void;
const pendingCallbacks = new Map<string, CallbackFn>();

// Listener global para respostas vindas do C# via HybridWebView
if (typeof window !== 'undefined') {
  (window as any).__onNativeBridgeResponse = (response: BridgeResponse) => {
    if (response.callbackId && pendingCallbacks.has(response.callbackId)) {
      const callback = pendingCallbacks.get(response.callbackId);
      pendingCallbacks.delete(response.callbackId);
      callback?.(response);
    }
  };
}

/**
 * Verifica se a aplicacao esta rodando dentro da casca .NET MAUI
 */
export function isMauiHybrid(): boolean {
  return typeof window !== 'undefined' && !!(window as any).HybridWebView;
}

// Fallback de desenvolvimento e execução no navegador comum (Web / Vite)
function handleWebFallback<T = any>(action: string, payload?: any): T | null {
  console.log(`[NativeBridge WebFallback] Executing Action: ${action}`, payload);

  const parsedPayload = typeof payload === "string" ? JSON.parse(payload || "{}") : (payload ?? {});

  switch (action.toUpperCase()) {
    case "LOGIN_USER": {
      const { email, senha } = parsedPayload;
      const usersJson = localStorage.getItem("libertapp_users");
      const users: any[] = usersJson ? JSON.parse(usersJson) : [];

      let found = users.find((u) => u.email?.toLowerCase() === email?.toLowerCase());

      if (found && found.senha === senha) {
        localStorage.setItem("currentUser", JSON.stringify(found));
        return found as T;
      }
      throw new Error("E-mail ou senha incorretos.");
    }

    case "REGISTER_USER": {
      const { nome, email, senha, curso, telefone, fotoUrl, bio } = parsedPayload;
      const usersJson = localStorage.getItem("libertapp_users");
      const users: any[] = usersJson ? JSON.parse(usersJson) : [];

      if (users.some((u) => u.email?.toLowerCase() === email?.toLowerCase())) {
        throw new Error("Este e-mail já está cadastrado.");
      }

      const newUser = {
        id: Date.now(),
        nome,
        email,
        senha,
        curso: curso || "",
        pontos: 150,
        nivel: 1,
        telefone: telefone || "",
        cpf: "",
        localizacao: "Comunidade Carmelita",
        fotoUrl: fotoUrl || DEFAULT_AVATAR_URL,
        bio: bio || "Comprometido(a) com a saúde mental e momentos de foco.",
        numeroCarteira: `LBT-2026-${1000 + (users.length + 1)}`,
      };

      users.push(newUser);
      localStorage.setItem("libertapp_users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      return newUser as T;
    }

    case "GET_CURRENT_USER": {
      const currentJson = localStorage.getItem("currentUser");
      if (currentJson) {
        return JSON.parse(currentJson) as T;
      }
      return null;
    }

    case "UPDATE_PROFILE": {
      const currentJson = localStorage.getItem("currentUser");
      const user = currentJson ? JSON.parse(currentJson) : {};
      const updated = {
        ...user,
        nome: parsedPayload.nome || user.nome,
        email: parsedPayload.email || user.email,
        telefone: parsedPayload.telefone || user.telefone,
        cpf: parsedPayload.cpf || user.cpf,
        localizacao: parsedPayload.localizacao || user.localizacao,
      };
      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated as T;
    }

    case "GET_RANKING": {
      const usersJson = localStorage.getItem("libertapp_users");
      const users: any[] = usersJson ? JSON.parse(usersJson) : [];
      const currentJson = localStorage.getItem("currentUser");
      if (currentJson) {
        const cur = JSON.parse(currentJson);
        if (!users.some((u) => u.id === cur.id || u.email === cur.email)) {
          users.push(cur);
        }
      }
      const nonAdminUsers = users.filter((u) => !u.isAdmin && !u.IsAdmin && (u.pontos || u.points || 0) > 0);
      nonAdminUsers.sort((a, b) => (b.pontos || b.points || 0) - (a.pontos || a.points || 0));
      return nonAdminUsers.map((u, i) => ({
        id: u.id,
        position: i + 1,
        nome: u.nome,
        name: u.nome,
        pontos: u.pontos || 0,
        points: u.pontos || 0,
        fotoUrl: u.fotoUrl || DEFAULT_AVATAR_URL,
        avatar: u.fotoUrl || DEFAULT_AVATAR_URL,
        curso: u.curso || "",
        department: u.curso || "",
        level: u.nivel || 1,
      })) as T;
    }

    case "GET_POSTS": {
      const postsJson = localStorage.getItem("libertapp_posts");
      return (postsJson ? JSON.parse(postsJson) : []) as T;
    }

    case "CREATE_POST": {
      const currentJson = localStorage.getItem("currentUser");
      const currentUser = currentJson ? JSON.parse(currentJson) : null;
      const postsJson = localStorage.getItem("libertapp_posts");
      const posts: any[] = postsJson ? JSON.parse(postsJson) : [];

      const bgColors: Record<string, { bg: string; border: string }> = {
        nature: { bg: "#E8D7C8", border: "#D7C4B3" },
        memory: { bg: "#FCE4EC", border: "#F8BBD0" },
        games: { bg: "#FFEBEE", border: "#FFCDD2" },
        reading: { bg: "#E8F5E9", border: "#C8E6C9" },
      };
      const scheme = bgColors[parsedPayload.category] || { bg: "#F5EFE3", border: "#EDE7DA" };

      const newPost = {
        id: Date.now(),
        type: parsedPayload.category,
        author: currentUser?.nome || "Você",
        avatar: currentUser?.fotoUrl || DEFAULT_AVATAR_URL,
        time: "Agora",
        content: parsedPayload.content,
        image: parsedPayload.image,
        bgColor: scheme.bg,
        borderColor: scheme.border,
        likes: 0,
        comments: 0,
        liked: false,
        icon: parsedPayload.icon || "🏔️",
      };

      posts.unshift(newPost);
      localStorage.setItem("libertapp_posts", JSON.stringify(posts));

      // Bonificação
      if (currentUser) {
        currentUser.pontos = (currentUser.pontos || 0) + 20;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      return newPost as T;
    }

    case "LIKE_POST": {
      const postsJson = localStorage.getItem("libertapp_posts");
      if (postsJson) {
        const posts: any[] = JSON.parse(postsJson);
        const post = posts.find((p) => p.id === parsedPayload.postId);
        if (post) {
          post.likes = (post.likes || 0) + 1;
          post.liked = true;
          localStorage.setItem("libertapp_posts", JSON.stringify(posts));
          return { postId: post.id, likes: post.likes } as T;
        }
      }
      return null;
    }

    case "GET_COMMENTS": {
      const commentsJson = localStorage.getItem(`libertapp_comments_${parsedPayload.postId}`);
      return (commentsJson ? JSON.parse(commentsJson) : []) as T;
    }

    case "ADD_COMMENT": {
      const key = `libertapp_comments_${parsedPayload.postId}`;
      const commentsJson = localStorage.getItem(key);
      const comments: any[] = commentsJson ? JSON.parse(commentsJson) : [];
      const currentJson = localStorage.getItem("currentUser");
      const currentUser = currentJson ? JSON.parse(currentJson) : null;

      const newComment = {
        id: Date.now(),
        postId: parsedPayload.postId,
        autorNome: currentUser?.nome || "Você",
        autorAvatar: currentUser?.fotoUrl || DEFAULT_AVATAR_URL,
        texto: parsedPayload.texto,
        likes: 0,
      };

      comments.push(newComment);
      localStorage.setItem(key, JSON.stringify(comments));
      return newComment as T;
    }

    case "TOGGLE_FOLLOW": {
      const followsJson = localStorage.getItem("libertapp_follows");
      const follows: number[] = followsJson ? JSON.parse(followsJson) : [2, 4];
      const targetId = parsedPayload.seguidoId;
      const index = follows.indexOf(targetId);
      let isFollowing = false;
      if (index >= 0) {
        follows.splice(index, 1);
        isFollowing = false;
      } else {
        follows.push(targetId);
        isFollowing = true;
      }
      localStorage.setItem("libertapp_follows", JSON.stringify(follows));
      return { seguidoId: targetId, isFollowing } as T;
    }

    case "SEARCH_USERS": {
      const usersJson = localStorage.getItem("libertapp_users");
      const users: any[] = usersJson ? JSON.parse(usersJson) : [];
      const followsJson = localStorage.getItem("libertapp_follows");
      const follows: number[] = followsJson ? JSON.parse(followsJson) : [];
      const currentJson = localStorage.getItem("currentUser");
      const cur = currentJson ? JSON.parse(currentJson) : null;

      const termo = (parsedPayload.termo || "").toLowerCase();
      const apenasSeguindo = !!parsedPayload.apenasSeguindo;

      return users
        .filter((u) => {
          if (cur && u.id === cur.id) return false;
          const matchTerm = !termo || u.nome?.toLowerCase().includes(termo) || u.curso?.toLowerCase().includes(termo);
          const isFollowing = follows.includes(u.id);
          if (apenasSeguindo) return matchTerm && isFollowing;
          return matchTerm;
        })
        .map((u) => ({
          id: u.id,
          name: u.nome,
          avatar: u.fotoUrl || DEFAULT_AVATAR_URL,
          department: u.curso || "Comunidade Carmelita",
          points: u.pontos || 0,
          level: u.nivel || 1,
          streakDays: Math.min(14, Math.floor((u.pontos || 0) / 200)),
          focusMinutes: Math.floor((u.pontos || 0) * 0.15),
          isFollowing: follows.includes(u.id),
          bio: u.bio || "Membro da Comunidade Carmelita.",
        })) as T;
    }

    case "GET_DESAFIOS": {
      const saved = localStorage.getItem("libertapp_challenges_v2");
      const grouped = saved ? JSON.parse(saved) : null;
      if (!grouped) return [] as T;

      const flat: any[] = [];
      Object.keys(grouped).forEach((cat) => {
        (grouped[cat] || []).forEach((c: any) => {
          flat.push({ id: c.id, titulo: c.title, categoria: cat, pontosRecompensa: c.points, completed: c.completed });
        });
      });
      return flat as T;
    }

    case "TOGGLE_DESAFIO": {
      const id = Number(typeof parsedPayload === "object" ? parsedPayload?.id : parsedPayload);
      const saved = localStorage.getItem("libertapp_challenges_v2");
      const grouped = saved ? JSON.parse(saved) : null;
      if (grouped) {
        Object.keys(grouped).forEach((cat) => {
          grouped[cat] = (grouped[cat] || []).map((c: any) =>
            c.id === id ? { ...c, completed: !c.completed } : c
          );
        });
        localStorage.setItem("libertapp_challenges_v2", JSON.stringify(grouped));
      }
      return { success: true } as T;
    }

    case "RECORD_POMODORO": {
      const currentJson = localStorage.getItem("currentUser");
      if (currentJson) {
        const u = JSON.parse(currentJson);
        const mins = parsedPayload.minutos || 25;
        u.pontos = (u.pontos || 0) + mins * 2;
        localStorage.setItem("currentUser", JSON.stringify(u));
        return { success: true, pontos: u.pontos } as T;
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Envia uma mensagem com acao e payload tipado para o backend C# (ou executa fallback na Web)
 */
export async function sendNativeMessage<T = any>(action: string, payload?: any): Promise<T | null> {
  const callbackId = `cb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (isMauiHybrid()) {
    return new Promise((resolve, reject) => {
      pendingCallbacks.set(callbackId, (response) => {
        if (response.success) {
          resolve(response.data as T);
        } else {
          console.warn(`[NativeBridge Error] ${response.error}`);
          reject(new Error(response.error || 'Erro nativo'));
        }
      });

      const message = JSON.stringify({
        action,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload ?? {}),
        callbackId,
      });

      try {
        (window as any).HybridWebView.SendRawMessage(message);
      } catch (err) {
        pendingCallbacks.delete(callbackId);
        reject(err);
      }
    });
  }

  // Fallback transparente para o navegador Web
  return handleWebFallback<T>(action, payload);
}
