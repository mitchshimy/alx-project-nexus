function dispatchFavoritesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('favorites-changed'));
  }
}

export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  const favs = localStorage.getItem('favorites');
  return favs ? JSON.parse(favs) : [];
}

export function addFavorite(id: number) {
  const favs = getFavorites();
  if (!favs.includes(id)) {
    favs.push(id);
    localStorage.setItem('favorites', JSON.stringify(favs));
    dispatchFavoritesChanged();
  }
}

export function removeFavorite(id: number) {
  const favs = getFavorites().filter((favId) => favId !== id);
  localStorage.setItem('favorites', JSON.stringify(favs));
  dispatchFavoritesChanged();
}

export function isFavorite(id: number): boolean {
  return getFavorites().includes(id);
} 