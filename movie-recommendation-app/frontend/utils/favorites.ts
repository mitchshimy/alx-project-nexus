import { movieAPI } from './api';

// Favorites management using backend
export const getFavorites = async () => {
  try {
    const response = await movieAPI.getFavorites();
    return response || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const addToFavorites = async (movieId: number) => {
  try {
    const response = await movieAPI.addToFavorites(movieId);
    return response;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (favoriteId: number) => {
  try {
    await movieAPI.removeFromFavorites(favoriteId);
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const isFavorite = (movie: any, favorites: any[]) => {
  return favorites.some(fav => fav.movie.tmdb_id === movie.tmdb_id);
};

// Watchlist management using backend
export const getWatchlist = async () => {
  try {
    const response = await movieAPI.getWatchlist();
    return response.results || [];
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

export const addToWatchlist = async (movieId: number) => {
  try {
    const response = await movieAPI.addToWatchlist(movieId);
    return response;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (watchlistId: number) => {
  try {
    await movieAPI.removeFromWatchlist(watchlistId);
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const isInWatchlist = (movie: any, watchlist: any[]) => {
  return watchlist.some(item => item.movie.tmdb_id === movie.tmdb_id);
};