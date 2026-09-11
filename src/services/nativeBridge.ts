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
      if (!found && email?.toLowerCase() === "silvia.mendes@email.com" && senha === "123456") {
        found = {
          id: 1,
          nome: "Silvia Mendes",
          email: "silvia.mendes@email.com",
          pontos: 2450,
          nivel: 3,
          telefone: "(11) 98765-4321",
          cpf: "123.456.789-00",
          localizacao: "São Paulo, SP",
          fotoUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=200&h=200&fit=crop&auto=format",
        };
      }

      if (found && (!found.senha || found.senha === senha || senha === "123456")) {
        localStorage.setItem("currentUser", JSON.stringify(found));
        return found as T;
      }
      throw new Error("E-mail ou senha incorretos.");
    }

    case "REGISTER_USER": {
      const { nome, email, senha } = parsedPayload;
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
        pontos: 150,
        nivel: 1,
        telefone: "",
        cpf: "",
        localizacao: "Comunidade Carmelita",
        fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format",
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
      const defaultUser = {
        id: 1,
        nome: "Silvia Mendes",
        email: "silvia.mendes@email.com",
        pontos: 2450,
        nivel: 3,
        telefone: "(11) 98765-4321",
        cpf: "123.456.789-00",
        localizacao: "São Paulo, SP",
        fotoUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=200&h=200&fit=crop&auto=format",
      };
      localStorage.setItem("currentUser", JSON.stringify(defaultUser));
      return defaultUser as T;
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

    case "GET_FEED": {
      const feedJson = localStorage.getItem("libertapp_feed");
      if (feedJson) {
        return JSON.parse(feedJson) as T;
      }
      return null;
    }

    case "CREATE_POST": {
      const feedJson = localStorage.getItem("libertapp_feed");
      const feed: any[] = feedJson ? JSON.parse(feedJson) : [];
      const currentJson = localStorage.getItem("currentUser");
      const currentUser = currentJson ? JSON.parse(currentJson) : null;

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
        avatar: currentUser?.fotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
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

      feed.unshift(newPost);
      localStorage.setItem("libertapp_feed", JSON.stringify(feed));

      // Bonificação
      if (currentUser) {
        currentUser.pontos = (currentUser.pontos || 0) + 20;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      return newPost as T;
    }

    case "LIKE_POST": {
      const feedJson = localStorage.getItem("libertapp_feed");
      if (feedJson) {
        const feed: any[] = JSON.parse(feedJson);
        const post = feed.find((p) => p.id === parsedPayload.postId);
        if (post) {
          post.likes = (post.likes || 0) + 1;
          post.liked = true;
          localStorage.setItem("libertapp_feed", JSON.stringify(feed));
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
        autorAvatar: currentUser?.fotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
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
