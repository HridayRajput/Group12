import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "group12_favorites";
const FAVORITES_CHANGED_EVENT = "group12-favorites-changed";

function readStoredFavorites(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => readStoredFavorites());

  useEffect(() => {
    const handleChange = () => setFavoriteIds(readStoredFavorites());
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const isFavorite = useCallback((productId: number) => favoriteIds.includes(productId), [favoriteIds]);

  const toggleFavorite = useCallback((productId: number) => {
    const current = readStoredFavorites();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavoriteIds(next);
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT));
  }, []);

  return { favoriteIds, isFavorite, toggleFavorite };
}
