// API base URL for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Authentication token management
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// API request helper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeAuthToken();
        window.location.href = '/signin';
      }
      
      // Try to get error details from response
      let errorMessage = `API request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: async (userData: {
    email: string;
    username: string;
    password: string;
    confirm_password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    return apiRequest('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/users/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.tokens?.access) {
      setAuthToken(response.tokens.access);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiRequest('/users/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.access) {
      setAuthToken(response.access);
    }
    
    return response;
  },

  getProfile: async () => {
    return apiRequest('/users/profile/');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/users/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getUserStats: async () => {
    return apiRequest('/users/stats/');
  },
};

// Movie APIs
export const movieAPI = {
  // Get movies with filtering
  getMovies: async (params: {
    type?: 'trending' | 'top_rated' | 'movies' | 'tv';
    page?: number;
    search?: string;
    media_type?: 'movie' | 'tv';
    genre_ids?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.type) searchParams.append('type', params.type);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.media_type) searchParams.append('media_type', params.media_type);
    if (params.genre_ids) searchParams.append('genre_ids', params.genre_ids);

    const queryString = searchParams.toString();
    return apiRequest(`/movies/${queryString ? `?${queryString}` : ''}`);
  },

  // Search movies and TV shows
  searchMovies: async (query: string, page: number = 1) => {
    return apiRequest(`/movies/search/?q=${encodeURIComponent(query)}&page=${page}`);
  },

  // Get movie details
  getMovieDetails: async (tmdbId: number) => {
    return apiRequest(`/movies/${tmdbId}/`);
  },

  // Get genres
  getGenres: async () => {
    return apiRequest('/movies/genres/');
  },

  // Favorites
  getFavorites: async () => {
    return apiRequest('/movies/favorites/');
  },

  addToFavorites: async (movieId: number) => {
    return apiRequest('/movies/favorites/', {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieId }),
    });
  },

  removeFromFavorites: async (favoriteId: number) => {
    return apiRequest(`/movies/favorites/${favoriteId}/`, {
      method: 'DELETE',
    });
  },

  // Watchlist
  getWatchlist: async () => {
    return apiRequest('/movies/watchlist/');
  },

  addToWatchlist: async (movieId: number) => {
    return apiRequest('/movies/watchlist/', {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieId }),
    });
  },

  removeFromWatchlist: async (watchlistId: number) => {
    return apiRequest(`/movies/watchlist/${watchlistId}/`, {
      method: 'DELETE',
    });
  },

  // Ratings
  rateMovie: async (movieId: number, rating: number, review?: string) => {
    return apiRequest(`/movies/${movieId}/rate/`, {
      method: 'POST',
      body: JSON.stringify({ 
        movie_id: movieId,
        rating,
        review: review || '',
      }),
    });
  },

  updateMovieRating: async (movieId: number, rating: number, review?: string) => {
    return apiRequest(`/movies/${movieId}/rate/`, {
      method: 'PUT',
      body: JSON.stringify({ 
        movie_id: movieId,
        rating,
        review: review || '',
      }),
    });
  },
};

// Legacy TMDB functions for backward compatibility
export const getTrendingMovies = async (page: number = 1) => {
  return movieAPI.getMovies({ type: 'trending', page });
};

export const getMovies = async (page: number = 1) => {
  return movieAPI.getMovies({ type: 'movies', page });
};

export const getTVShows = async (page: number = 1) => {
  return movieAPI.getMovies({ type: 'tv', page });
};

export const getTopRatedMovies = async (page: number = 1) => {
  return movieAPI.getMovies({ type: 'top_rated', page });
};

export const searchMulti = async (query: string, page: number = 1) => {
  return movieAPI.searchMovies(query, page);
};