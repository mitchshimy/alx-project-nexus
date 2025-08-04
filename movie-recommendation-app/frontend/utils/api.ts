// API base URL for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shimy.pythonanywhere.com/api/v1/';

// Increased timeout for preloading (30 seconds)
const API_TIMEOUT = 25000; // Increased from 15000ms to 25000ms for more patience

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
    // Clear any existing user data before setting new token
    clearApiCache();
    sessionStorage.clear();
    
    localStorage.setItem('access_token', token);
    
    // Reset error count on successful login
    resetErrorCount();
    
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { isAuthenticated: true } }));
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// Automatic logout function for expired tokens
export const handleTokenExpiration = () => {
  console.log('Token expired, performing automatic logout...');
  
  // Clear all auth data
  removeAuthToken();
  clearApiCache();
  
  if (typeof window !== 'undefined') {
    // Clear all storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    
    // Dispatch logout event to notify all components
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { 
        isAuthenticated: false,
        reason: 'token_expired'
      } 
    }));
    
    // Show a user-friendly notification
    showError(
      'Session Expired', 
      'Your session has expired. Please log in again to continue.',
      'warning'
    );
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

// Function to clear the in-memory cache
export const clearApiCache = () => {
  cache.clear();
};

// Comprehensive logout function that clears all user data and cache
export const performComprehensiveLogout = () => {
  // Clear authentication
  authAPI.logout();
  
  // Clear API cache
  cache.clear();
  
  // Clear all auth-related tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('access_token');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear any cached images by reloading them
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        img.src = img.src + '?t=' + Date.now();
      }
    });
  }
  
  // Dispatch custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('authStateChanged'));
  }
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
        // Token expired or invalid - automatically logout the user
        handleTokenExpiration();
        return { error: 'Your session has expired. Please log in again.', errorTitle: 'Session Expired' };
      }
      
      // Try to get error details from response
      let errorMessage = `API request failed: ${response.statusText}`;
      let errorTitle = 'Request Failed';
      
      try {
        const contentType = response.headers.get('content-type');
        
        // Check if response is JSON before trying to parse it
        if (contentType && contentType.includes('application/json')) {
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
        } else {
          // Handle HTML responses (like 404 pages)
          if (response.status === 404) {
            errorMessage = 'Movie not found. Please check the URL and try again.';
            errorTitle = 'Not Found';
          } else {
            errorMessage = `Server returned an invalid response (${response.status}). Please try again.`;
            errorTitle = 'Server Error';
          }
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        console.error('Error parsing error response:', e);
        if (response.status === 404) {
          errorMessage = 'Movie not found. Please check the URL and try again.';
          errorTitle = 'Not Found';
        }
      }
      
      // For validation errors (400), don't show global modal - let component handle it
      if (response.status === 400) {
        return { error: errorMessage, errorTitle };
      }
      
      // For 401 errors, handle token expiration
      if (response.status === 401) {
        handleTokenExpiration();
        return { error: errorMessage, errorTitle };
      }
      
      // For other errors (500, etc.), only show for critical operations
      const isCriticalOperation = endpoint.includes('/users/') || 
                                 endpoint.includes('/movies/favorites/') || 
                                 endpoint.includes('/movies/watchlist/') ||
                                 endpoint.includes('/movies/rate/') ||
                                 endpoint.includes('/movies/search/');
      
      if (isCriticalOperation) {
        showError(errorTitle, errorMessage, 'error');
        return { error: errorMessage, errorTitle };
      } else {
        // For non-critical operations, just return empty data silently
        console.log(`Server error for non-critical operation: ${errorMessage}`);
        return { results: [], total_pages: 0, total_results: 0 };
      }
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
      // Network errors - just log and return empty data silently
      console.log('Network error, returning empty data silently');
      return { results: [], total_pages: 0, total_results: 0 };
    }
    if (error instanceof Error && error.message === 'Request timeout') {
      // Only show timeout errors for critical operations (not for movie listings)
      const isCriticalOperation = endpoint.includes('/users/') || 
                                 endpoint.includes('/movies/favorites/') || 
                                 endpoint.includes('/movies/watchlist/') ||
                                 endpoint.includes('/movies/rate/') ||
                                 endpoint.includes('/movies/search/');
      
      if (isCriticalOperation) {
        const timeoutMessage = 'The server is taking longer than expected. Please try again in a moment.';
        showError('Slow Response', timeoutMessage, 'warning');
        return { error: timeoutMessage, errorTitle: 'Slow Response' };
      } else {
        // For non-critical operations (like movie listings), just return empty data silently
        console.log('Timeout for non-critical operation, returning empty data silently');
        return { results: [], total_pages: 0, total_results: 0 };
      }
    }
    // For any other unexpected errors, just log and return empty data
    console.error('Unexpected API error:', error);
    return { results: [], total_pages: 0, total_results: 0 };
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
    const response = await apiRequest('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Check if response has error property
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/users/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // If response has error property, it means there was a validation error or timeout
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
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
    const response = await apiRequest('/users/profile/');
    
    // Return null if there was an error
    if (response && response.error) {
      return null;
    }
    
    return response;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiRequest('/users/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    // Check if response has error property
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
    return response;
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const response = await apiRequest('/users/change-password/', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    
    // Check if response has error property
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
    return response;
  },

  deleteAccount: async (password: string) => {
    const response = await apiRequest('/users/delete-account/', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    
    // Check if response has error property
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
    return response;
  },

  getUserStats: async () => {
    const response = await apiRequest('/users/stats/');
    
    // Check if response has error property
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
    return response;
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
      // Handle timeout gracefully for movies - return empty data instead of throwing
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('Movie API timeout, returning empty results');
        return { results: [], total_pages: 0, total_results: 0 };
      }
      throw error;
    }
  },

  // Search movies and TV shows
  searchMovies: async (query: string, page: number = 1) => {
    try {
      // Add cache-busting parameter to ensure fresh data
      const timestamp = Date.now();
      return await apiRequest(`/movies/search/?q=${encodeURIComponent(query)}&page=${page}&_t=${timestamp}`);
    } catch (error) {
      // Handle timeout gracefully for search - return empty data instead of throwing
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('Search API timeout, returning empty results');
        return { results: [], total_pages: 0, total_results: 0 };
      }
      throw error;
    }
  },

  // Get movie details
  getMovieDetails: async (tmdbId: number) => {
    const response = await apiRequest(`/movies/${tmdbId}/`);
    
    // Check if response has error property
    if (response && response.error) {
      return { error: response.error, errorTitle: response.errorTitle };
    }
    
    return response;
  },

  // Get genres
  getGenres: async () => {
    const response = await apiRequest('/movies/genres/');
    
    // Return empty array if there was an error
    if (response && response.error) {
      return [];
    }
    
    return response;
  },

  // Get favorites
  getFavorites: async () => {
    try {
      const response = await apiRequest('/movies/favorites/');
      
      // Return empty array if there was an error
      if (response && response.error) {
        return [];
      }
      
      return response;
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Add to favorites
  addToFavorites: async (movieId: number) => {
    try {
      const response = await apiRequest('/movies/favorites/', {
        method: 'POST',
        body: JSON.stringify({ movie_id: movieId }),
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      // Handle any thrown errors and return them as error objects
      console.error('Error adding to favorites:', error);
      return { 
        error: 'Failed to add to favorites. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  removeFromFavorites: async (favoriteId: number) => {
    try {
      const response = await apiRequest(`/movies/favorites/${favoriteId}/`, {
        method: 'DELETE',
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      // Handle any thrown errors and return them as error objects
      console.error('Error removing from favorites:', error);
      return { 
        error: 'Failed to remove from favorites. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  removeFromFavoritesByMovie: async (movieId: number) => {
    try {
      const response = await apiRequest(`/movies/favorites/movie/${movieId}/`, {
        method: 'DELETE',
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      // Handle any thrown errors and return them as error objects
      console.error('Error removing from favorites by movie:', error);
      return { 
        error: 'Failed to remove from favorites. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  // Watchlist
  getWatchlist: async () => {
    try {
      const response = await apiRequest('/movies/watchlist/');
      
      // Return empty array if there was an error
      if (response && response.error) {
        return [];
      }
      
      return response;
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  },

  addToWatchlist: async (movieId: number) => {
    try {
      const response = await apiRequest('/movies/watchlist/', {
        method: 'POST',
        body: JSON.stringify({ movie_id: movieId }),
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      // Handle any thrown errors and return them as error objects
      console.error('Error adding to watchlist:', error);
      return { 
        error: 'Failed to add to watchlist. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  removeFromWatchlist: async (watchlistId: number) => {
    try {
      const response = await apiRequest(`/movies/watchlist/${watchlistId}/`, {
        method: 'DELETE',
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      // Handle any thrown errors and return them as error objects
      console.error('Error removing from watchlist:', error);
      return { 
        error: 'Failed to remove from watchlist. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  removeFromWatchlistByMovie: async (movieId: number) => {
    try {
      const response = await apiRequest(`/movies/watchlist/movie/${movieId}/`, {
        method: 'DELETE',
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      // Handle any thrown errors and return them as error objects
      console.error('Error removing from watchlist by movie:', error);
      return { 
        error: 'Failed to remove from watchlist. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  // Ratings
  rateMovie: async (movieId: number, rating: number, review?: string) => {
    try {
      const response = await apiRequest(`/movies/${movieId}/rate/`, {
        method: 'POST',
        body: JSON.stringify({ 
          movie_id: movieId,
          rating,
          review: review || '',
        }),
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      console.error('Error rating movie:', error);
      return { 
        error: 'Failed to rate movie. Please try again.', 
        errorTitle: 'Error' 
      };
    }
  },

  updateMovieRating: async (movieId: number, rating: number, review?: string) => {
    try {
      const response = await apiRequest(`/movies/${movieId}/rate/`, {
        method: 'PUT',
        body: JSON.stringify({ 
          movie_id: movieId,
          rating,
          review: review || '',
        }),
      });
      
      // Check if response has error property
      if (response && response.error) {
        return { error: response.error, errorTitle: response.errorTitle };
      }
      
      return response;
    } catch (error) {
      console.error('Error updating movie rating:', error);
      return { 
        error: 'Failed to update movie rating. Please try again.', 
        errorTitle: 'Error' 
      };
    }
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
  try {
    return await movieAPI.getMovies({ type: 'trending', page: 1 });
  } catch (error) {
    console.log('Trending movies preload timeout, returning empty results');
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchTopRatedMovies = async () => {
  try {
    return await movieAPI.getMovies({ type: 'top_rated', page: 1 });
  } catch (error) {
    console.log('Top rated movies preload timeout, returning empty results');
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchPopularMovies = async () => {
  try {
    return await movieAPI.getMovies({ type: 'movies', page: 1 });
  } catch (error) {
    console.log('Popular movies preload timeout, returning empty results');
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// Global error handler
let globalErrorHandler: ((title: string, message: string, type?: 'error' | 'warning' | 'info') => void) | null = null;

// Debounce mechanism for all error types
let lastErrorTime = 0;
const ERROR_DEBOUNCE = 10000; // 10 seconds between any error messages
let errorCount = 0;
const MAX_ERRORS_PER_SESSION = 5; // Maximum errors to show per session

export const setGlobalErrorHandler = (handler: (title: string, message: string, type?: 'error' | 'warning' | 'info') => void) => {
  globalErrorHandler = handler;
};

export const resetErrorCount = () => {
  errorCount = 0;
  lastErrorTime = 0;
};

export const showError = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
  const now = Date.now();
  
  // Debounce all errors to prevent spam
  if (now - lastErrorTime < ERROR_DEBOUNCE) {
    console.log(`Suppressing error "${title}" due to debounce`);
    return;
  }
  
  // Limit total errors shown per session
  if (errorCount >= MAX_ERRORS_PER_SESSION) {
    console.log(`Suppressing error "${title}" - max errors per session reached`);
    return;
  }
  
  // Don't show errors for common network issues that users can't fix
  const silentErrors = [
    'Connection Error',
    'Network error',
    'Slow Response',
    'Timeout Error'
  ];
  
  if (silentErrors.some(silent => title.includes(silent) || message.includes(silent))) {
    console.log(`Suppressing common error: ${title} - ${message}`);
    return;
  }
  
  lastErrorTime = now;
  errorCount++;
  
  if (globalErrorHandler) {
    globalErrorHandler(title, message, type);
  } else {
    // Fallback to console error if no handler is set
    console.error(`${title}: ${message}`);
  }
};

// Check if token is expired (JWT tokens have expiration)
export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return true;
    
    // Decode the payload
    const decodedPayload = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, assume expired
  }
};

// Check and handle expired tokens proactively
export const checkTokenExpiration = () => {
  const token = getAuthToken();
  if (token && isTokenExpired(token)) {
    console.log('Token is expired, performing automatic logout...');
    handleTokenExpiration();
    return true;
  }
  return false;
};