// utils/avatar.ts (Função pura)
export function getAvatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;

  const baseUrl = import.meta.env.VITE_API_AUTH_BASE_URL as string;
  return `${baseUrl}/uploads/${avatar}`;
}
