type FavoriteMovieIds = number[];

const FAVORITES_KEY = 'favoriteMovies';

// Get all favorite movie IDs from localStorage
export function getFavorites(): FavoriteMovieIds {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

// Toggle a movie's favorite status
export function toggleFavorite(movieId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    const newFavorites = favorites.includes(movieId)
      ? favorites.filter(id => id !== movieId)
      : [...favorites, movieId];

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    window.dispatchEvent(new Event('favorites-changed'));
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

// Check if a movie is favorited
export function isFavorite(movieId: number): boolean {
  if (typeof window === 'undefined') return false;
  return getFavorites().includes(movieId);
}

// Add a movie to favorites
export function addFavorite(movieId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    if (!favorites.includes(movieId)) {
      const newFavorites = [...favorites, movieId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      window.dispatchEvent(new Event('favorites-changed'));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
}

// Remove a movie from favorites
export function removeFavorite(movieId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    if (favorites.includes(movieId)) {
      const newFavorites = favorites.filter(id => id !== movieId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      window.dispatchEvent(new Event('favorites-changed'));
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}