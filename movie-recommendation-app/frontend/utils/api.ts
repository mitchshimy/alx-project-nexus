// API base URL for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Increased timeout for preloading (30 seconds)
const API_TIMEOUT = 15000; // Reduced from 30000ms to 15000ms for faster loading

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
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);
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
    const requestOptions = {
      ...options,
      headers,
    };
    
    const fetchPromise = fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

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
      let errorTitle = 'Request Failed';
      
      try {
        const errorData = await response.json();
        
        // Handle Django REST Framework validation errors
        if (errorData.current_password) {
          const fieldError = Array.isArray(errorData.current_password) ? errorData.current_password[0] : errorData.current_password;
          errorMessage = fieldError;
          errorTitle = 'Password Error';
        } else if (errorData.new_password) {
          const fieldError = Array.isArray(errorData.new_password) ? errorData.new_password[0] : errorData.new_password;
          errorMessage = fieldError;
          errorTitle = 'Password Error';
        } else if (errorData.confirm_password) {
          const fieldError = Array.isArray(errorData.confirm_password) ? errorData.confirm_password[0] : errorData.confirm_password;
          errorMessage = fieldError;
          errorTitle = 'Password Error';
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
          errorTitle = 'Validation Error';
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
          errorTitle = 'Error';
        } else if (errorData.message) {
          errorMessage = errorData.message;
          errorTitle = 'Error';
        } else if (errorData.error) {
          errorMessage = errorData.error;
          errorTitle = 'Error';
        } else if (typeof errorData === 'object') {
          // Handle nested validation errors
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = String(firstError);
          }
          errorTitle = 'Validation Error';
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        console.error('Error parsing error response:', e);
      }
      
      // For validation errors (400), don't show global modal - let component handle it
      if (response.status === 400) {
        return { error: errorMessage, errorTitle };
      }
      
      // For other errors (401, 500, etc.), show global modal and reject
      showError(errorTitle, errorMessage, 'error');
      return Promise.reject(new Error(errorMessage));
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
    // Handle timeout and network errors gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const timeoutMessage = 'Network error. Please check your connection and try again.';
      showError('Connection Error', timeoutMessage, 'error');
      return Promise.reject(new Error(timeoutMessage));
    }
    if (error instanceof Error && error.message === 'Request timeout') {
      const timeoutMessage = 'The server is taking too long to respond. Please try again in a moment.';
      showError('Timeout Error', timeoutMessage, 'warning');
      return Promise.reject(new Error(timeoutMessage));
    }
    // For any other unexpected errors, show a generic message
    const genericMessage = 'An unexpected error occurred. Please try again.';
    showError('Error', genericMessage, 'error');
    return Promise.reject(new Error(genericMessage));
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
    try {
      return await apiRequest('/users/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      // Handle timeout gracefully for registration
      if (error instanceof Error && error.message.includes('timeout')) {
        return { error: 'Registration request timed out. Please try again.', errorTitle: 'Timeout Error' };
      }
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiRequest('/users/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // If response has error property, it means there was a validation error
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      if (response.tokens?.access) {
        setAuthToken(response.tokens.access);
      }
      
      return response;
    } catch (error) {
      // Handle timeout gracefully for login
      if (error instanceof Error && error.message.includes('timeout')) {
        return { error: 'Login request timed out. Please try again.', errorTitle: 'Timeout Error' };
      }
      throw error;
    }
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
    try {
      return await apiRequest('/users/profile/');
    } catch (error) {
      // Handle timeout gracefully for profile
      if (error instanceof Error && error.message.includes('timeout')) {
        return null;
      }
      throw error;
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      return await apiRequest('/users/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      // Handle timeout gracefully for profile update
      if (error instanceof Error && error.message.includes('timeout')) {
        return { error: 'Profile update request timed out. Please try again.', errorTitle: 'Timeout Error' };
      }
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      return await apiRequest('/users/stats/');
    } catch (error) {
      // Handle timeout gracefully for stats
      if (error instanceof Error && error.message.includes('timeout')) {
        return { favorites_count: 0, watchlist_count: 0, ratings_count: 0, member_since: 'N/A' };
      }
      throw error;
    }
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      return await apiRequest('/users/change-password/', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });
    } catch (error) {
      // Handle timeout gracefully for password change
      if (error instanceof Error && error.message.includes('timeout')) {
        return { error: 'Password change request timed out. Please try again.', errorTitle: 'Timeout Error' };
      }
      throw error;
    }
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
    try {
      const searchParams = new URLSearchParams();
      
      if (params.type) searchParams.append('type', params.type);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.media_type) searchParams.append('media_type', params.media_type);
      if (params.genre_ids) searchParams.append('genre_ids', params.genre_ids);

      const queryString = searchParams.toString();
      return await apiRequest(`/movies/${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      // Handle timeout gracefully for movies
      if (error instanceof Error && error.message.includes('timeout')) {
        return { results: [], total_pages: 0, total_results: 0 };
      }
      throw error;
    }
  },

  // Search movies and TV shows
  searchMovies: async (query: string, page: number = 1) => {
    try {
      return await apiRequest(`/movies/search/?q=${encodeURIComponent(query)}&page=${page}`);
    } catch (error) {
      // Handle timeout gracefully for search
      if (error instanceof Error && error.message.includes('timeout')) {
        return { results: [], total_pages: 0, total_results: 0 };
      }
      throw error;
    }
  },

  // Get movie details
  getMovieDetails: async (tmdbId: number) => {
    try {
      return await apiRequest(`/movies/${tmdbId}/`);
    } catch (error) {
      // Handle timeout gracefully for movie details
      if (error instanceof Error && error.message.includes('timeout')) {
        return null;
      }
      throw error;
    }
  },

  // Get genres
  getGenres: async () => {
    try {
      return await apiRequest('/movies/genres/');
    } catch (error) {
      // Handle timeout gracefully for genres
      if (error instanceof Error && error.message.includes('timeout')) {
        return [];
      }
      throw error;
    }
  },

  // Get favorites
  getFavorites: async () => {
    try {
      return await apiRequest('/movies/favorites/');
    } catch (error) {
      // Handle timeout gracefully for favorites
      if (error instanceof Error && error.message.includes('timeout')) {
        return [];
      }
      throw error;
    }
  },

  // Add to favorites
  addToFavorites: async (movieData: any) => {
    try {
      return await apiRequest('/movies/favorites/', {
        method: 'POST',
        body: JSON.stringify(movieData),
      });
    } catch (error) {
      // Handle timeout gracefully for adding favorites
      if (error instanceof Error && error.message.includes('timeout')) {
        return { error: 'Failed to add to favorites. Please try again.', errorTitle: 'Timeout Error' };
      }
      throw error;
    }
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

// Global error handler
let globalErrorHandler: ((title: string, message: string, type?: 'error' | 'warning' | 'info') => void) | null = null;

export const setGlobalErrorHandler = (handler: (title: string, message: string, type?: 'error' | 'warning' | 'info') => void) => {
  globalErrorHandler = handler;
};

export const showError = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
  if (globalErrorHandler) {
    globalErrorHandler(title, message, type);
  } else {
    // Fallback to console error if no handler is set
    console.error(`${title}: ${message}`);
  }
};