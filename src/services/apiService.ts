/**
 * Cliente de comunicacao com o backend central na VPS (ou localhost para testes).
 * Gerencia autenticacao, feed, interacoes, colegas e gamificacao.
 */

// Permite configurar a URL da VPS dinamicamente via localStorage, variavel global ou host atual
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = (window as any).__LIBERTAPP_API_URL || localStorage.getItem("libertapp_api_url");
    if (customUrl) return customUrl.replace(/\/$/, "");

    // Se estiver rodando no navegador (VPS web ou localhost na porta diferente de 8080)
    // Se a porta for 80 (ou padrão HTTP/HTTPS), o Nginx faz proxy reverso de /api diretamente no mesmo origin
    if (window.location && window.location.origin && window.location.port !== "5173" && !window.location.protocol.startsWith("file") && !window.location.protocol.startsWith("app")) {
      // No Nginx container web, a API está em /api no mesmo host
      return window.location.origin.replace(/\/$/, "");
    }
  }
  // URL padrao: se estiver em produção externa, usa a VPS com SSL no domínio oficial
  return "https://libertapp.tccodes.com.br";
}

export function setApiBaseUrl(url: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("libertapp_api_url", url);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Timeout de 5s para permitir envio seguro de imagens mesmo em conexões lentas
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      let errMsg = `Erro ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[ApiService Error] Falha na chamada ${endpoint}:`, err);
    throw err;
  }
}

export interface UserDto {
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
  isAdmin?: boolean;
}

export interface PostDto {
  id: number;
  usuarioId: number;
  author: string;
  avatar: string;
  curso?: string;
  type: string;
  content: string;
  image?: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  likes: number;
  comments: number;
  liked: boolean;
  time: string;
}

export interface CommentDto {
  id: number;
  author: string;
  avatar: string;
  curso?: string;
  text: string;
  time: string;
  likes: number;
}

export interface SearchUserDto {
  id: number;
  name: string;
  avatar: string;
  department: string;
  bio: string;
  level: number;
  levelName: string;
  points: number;
  streakDays: number;
  focusMinutes: number;
  isFollowing: boolean;
}

export const apiService = {
  // Autenticação & Usuários
  async register(data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cpf?: string;
    curso?: string;
    bio?: string;
    fotoUrl?: string;
  }): Promise<UserDto> {
    return request<UserDto>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(email: string, senha: string): Promise<UserDto> {
    return request<UserDto>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  },

  async getUser(id: number): Promise<UserDto> {
    return request<UserDto>(`/api/auth/user/${id}`);
  },

  async updateProfile(data: {
    id: number;
    nome?: string;
    telefone?: string;
    cpf?: string;
    curso?: string;
    bio?: string;
    localizacao?: string;
    fotoUrl?: string;
  }): Promise<UserDto> {
    return request<UserDto>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async recoverPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>("/api/auth/recover", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Feed da Comunidade
  async getFeed(callerId?: number): Promise<PostDto[]> {
    const query = callerId ? `?callerId=${callerId}` : "";
    return request<PostDto[]>(`/api/feed${query}`);
  },

  async createPost(data: {
    usuarioId: number;
    content: string;
    category?: string;
    icon?: string;
    image?: string;
  }): Promise<PostDto> {
    return request<PostDto>("/api/feed", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async toggleLike(postId: number, usuarioId: number): Promise<{ postId: number; likes: number; liked: boolean }> {
    return request<{ postId: number; likes: number; liked: boolean }>(`/api/feed/${postId}/like`, {
      method: "POST",
      body: JSON.stringify({ usuarioId }),
    });
  },

  async getComments(postId: number): Promise<CommentDto[]> {
    return request<CommentDto[]>(`/api/feed/${postId}/comments`);
  },

  async addComment(postId: number, usuarioId: number, texto: string): Promise<CommentDto> {
    return request<CommentDto>(`/api/feed/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify({ usuarioId, texto }),
    });
  },

  async deletePost(postId: number, callerId: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/feed/${postId}?callerId=${callerId}`, {
      method: "DELETE",
    });
  },

  async deleteComment(commentId: number, callerId: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/feed/comments/${commentId}?callerId=${callerId}`, {
      method: "DELETE",
    });
  },

  // Busca e Colegas
  async searchUsers(termo: string, callerId: number, apenasSeguindo: boolean = false): Promise<SearchUserDto[]> {
    const params = new URLSearchParams({
      termo,
      callerId: callerId.toString(),
      apenasSeguindo: apenasSeguindo.toString(),
    });
    return request<SearchUserDto[]>(`/api/users/search?${params.toString()}`);
  },

  async getUserProfile(id: number, callerId: number): Promise<any> {
    return request<any>(`/api/users/${id}/profile?callerId=${callerId}`);
  },

  async toggleFollow(id: number, callerId: number): Promise<{ seguidoId: number; isFollowing: boolean }> {
    return request<{ seguidoId: number; isFollowing: boolean }>(`/api/users/${id}/follow`, {
      method: "POST",
      body: JSON.stringify({ callerId }),
    });
  },

  // Gamificação & Pomodoro
  async recordPomodoro(usuarioId: number, tipo: string, minutos: number): Promise<any> {
    return request<any>("/api/pomodoro/session", {
      method: "POST",
      body: JSON.stringify({ usuarioId, tipo, minutos }),
    });
  },

  async getDesafios(usuarioId: number): Promise<any[]> {
    return request<any[]>(`/api/pomodoro/desafios?usuarioId=${usuarioId}`);
  },

  async toggleDesafio(id: number, usuarioId: number): Promise<any> {
    return request<any>(`/api/pomodoro/desafios/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ usuarioId }),
    });
  },

  async createDesafio(data: { titulo: string; categoria: string; pontosRecompensa: number }): Promise<any> {
    return request<any>("/api/pomodoro/desafios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateDesafio(id: number, data: { titulo?: string; categoria?: string; pontosRecompensa?: number }): Promise<any> {
    return request<any>(`/api/pomodoro/desafios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteDesafio(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/pomodoro/desafios/${id}`, {
      method: "DELETE",
    });
  },

  // Ranking
  async getLeaderboard(): Promise<any[]> {
    return request<any[]>("/api/leaderboard");
  },

  // Benefícios
  async getBenefits(usuarioId?: number): Promise<any> {
    const query = usuarioId ? `?usuarioId=${usuarioId}` : "";
    return request<any>(`/api/benefits${query}`);
  },
};
