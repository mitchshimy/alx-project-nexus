// API base URL for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Increased timeout for preloading (30 seconds)
const API_TIMEOUT = 30000;

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { isAuthenticated: true } }));
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// Create a timeout promise
const createTimeoutPromise = (timeout: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

// Cache helper functions
const getCacheKey = (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${endpoint}:${body}`;
};

const getCachedResponse = (cacheKey: string) => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (cacheKey: string, data: any) => {
  cache.set(cacheKey, { data, timestamp: Date.now() });
};

// API request helper with authentication, timeout, and caching
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const cacheKey = getCacheKey(endpoint, options);
  
  // Return cached response for GET requests
  if (method === 'GET') {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Create the fetch request
    const fetchPromise = fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Race between fetch and timeout
    const response = await Promise.race([
      fetchPromise,
      createTimeoutPromise(API_TIMEOUT)
    ]) as Response;

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

    // Handle empty responses (common with DELETE requests)
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // For non-JSON responses or empty responses, return success status
      data = { success: true };
    }

    // Cache successful GET responses
    if (method === 'GET') {
      setCachedResponse(cacheKey, data);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    if (error instanceof Error && error.message === 'Request timeout') {
      throw new Error('The server is taking too long to respond. Please try again in a moment.');
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

  removeFromFavoritesByMovie: async (movieId: number) => {
    return apiRequest(`/movies/favorites/movie/${movieId}/`, {
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

  removeFromWatchlistByMovie: async (movieId: number) => {
    return apiRequest(`/movies/watchlist/movie/${movieId}/`, {
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

// Preloading functions for splash screen
export const fetchTrendingMovies = async () => {
  return movieAPI.getMovies({ type: 'trending', page: 1 });
};

export const fetchTopRatedMovies = async () => {
  return movieAPI.getMovies({ type: 'top_rated', page: 1 });
};

export const fetchPopularMovies = async () => {
  return movieAPI.getMovies({ type: 'movies', page: 1 });
};