// Avatares padrão em vetor/ícones estilizados (sem fotos de pessoas reais)
// Inspirados no design system LibertApp: natureza, estudo, foco e tranquilidade

function createSvgAvatar(bg: string, emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="64" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface DefaultAvatarOption {
  id: string;
  name: string;
  url: string;
}

export const DEFAULT_AVATARS: DefaultAvatarOption[] = [
  { id: "plant", name: "Broto / Renovo", url: createSvgAvatar("#E8F0E8", "🌱") },
  { id: "leaf", name: "Folha / Natureza", url: createSvgAvatar("#E8D7C8", "🌿") },
  { id: "sun", name: "Sol / Energia", url: createSvgAvatar("#FBF2D8", "☀️") },
  { id: "owl", name: "Coruja / Sabedoria", url: createSvgAvatar("#E0E8F0", "🦉") },
  { id: "fox", name: "Raposa / Astúcia", url: createSvgAvatar("#FBE6D8", "🦊") },
  { id: "brain", name: "Mente / Foco", url: createSvgAvatar("#F0E6F6", "🧠") },
  { id: "book", name: "Livro / Conhecimento", url: createSvgAvatar("#FCE4EC", "📖") },
  { id: "coffee", name: "Café / Pausa", url: createSvgAvatar("#EDE7DA", "☕") },
];

export const DEFAULT_AVATAR_URL = DEFAULT_AVATARS[0].url;
