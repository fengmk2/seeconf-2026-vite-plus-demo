export const MAX_FAVORITES: number = 3;

export type FavoriteChange = {
  ids: string[];
  status: "added" | "removed" | "limit" | "unknown";
};

export function restoreFavorites(raw: string | null, knownIds: readonly string[]): string[] {
  if (raw === null) return [];

  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const known = new Set(knownIds);
    const valid = value.filter((id): id is string => typeof id === "string" && known.has(id));
    return [...new Set(valid)].slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

export function toggleFavorite(
  favorites: readonly string[],
  id: string,
  knownIds: readonly string[],
): FavoriteChange {
  if (!knownIds.includes(id)) return { ids: [...favorites], status: "unknown" };
  if (favorites.includes(id)) {
    return { ids: favorites.filter((favorite) => favorite !== id), status: "removed" };
  }
  if (favorites.length >= MAX_FAVORITES) {
    return { ids: [...favorites], status: "limit" };
  }
  return { ids: [...favorites, id], status: "added" };
}
