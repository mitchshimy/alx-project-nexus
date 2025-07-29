import { TMDBRequestOptions, TMDBResponse, TMDBMovie, Genre, TMDBSearchResult } from '@/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_TIMEOUT = 8000;
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_REGION = 'US';
const RETRY_DELAY = 1000;
const MAX_RETRIES = 2;

export async function fetchTMDB<T>(
  endpoint: string,
  options?: TMDBRequestOptions,
  retryCount = 0
): Promise<T> {
  // Validate configuration
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY environment variable is not set');
  }

  // Construct URL with API key
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY);

  // Add language/region defaults if not specified
  if (options?.params) {
    const params = {
      language: DEFAULT_LANGUAGE,
      region: DEFAULT_REGION,
      ...options.params
    };

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.status_message || response.statusText;
      throw new Error(`TMDB API error ${response.status}: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry for timeouts or server errors
    if (retryCount < MAX_RETRIES) {
      if (error instanceof Error && 
          (error.name === 'AbortError' || error.message.includes('50'))) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchTMDB<T>(endpoint, options, retryCount + 1);
      }
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request to TMDB API timed out after ${API_TIMEOUT}ms`);
      }
      throw error;
    }
    throw new Error('Unknown error occurred while fetching from TMDB');
  }
}

// Specific API functions
export async function getMovieDetails(
  id: number,
  appendToResponse?: string
): Promise<TMDBMovie> {
  return fetchTMDB<TMDBMovie>(`/movie/${id}`, {
    params: {
      append_to_response: appendToResponse,
      language: DEFAULT_LANGUAGE
    }
  });
}

export async function getGenres(): Promise<{ genres: Genre[] }> {
  return fetchTMDB('/genre/movie/list', {
    params: {
      language: 'en-US'
    }
  });
}

export async function getTrendingMovies(
  page = 1,
  language = DEFAULT_LANGUAGE,
  region = DEFAULT_REGION
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB('/trending/movie/week', {
    params: {
      page,
      language,
      region,
    },
  });
}

export async function getSimilarMovies(
  id: number,
  page = 1
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB(`/movie/${id}/similar`, {
    params: {
      page,
      language: DEFAULT_LANGUAGE,
      region: DEFAULT_REGION,
    },
  });
}

export async function getMovies(
  page = 1,
  language = DEFAULT_LANGUAGE,
  region = DEFAULT_REGION
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB('/discover/movie', {
    params: {
      page,
      language,
      region,
      sort_by: 'popularity.desc',
    },
  });
}

export async function getTVShows(
  page = 1,
  language = DEFAULT_LANGUAGE,
  region = DEFAULT_REGION
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB('/discover/tv', {
    params: {
      page,
      language,
      region,
      sort_by: 'popularity.desc',
    },
  });
}

export async function searchMulti(
  query: string,
  page = 1,
  language = DEFAULT_LANGUAGE,
  region = DEFAULT_REGION
): Promise<TMDBResponse<TMDBSearchResult>> {
  return fetchTMDB('/search/multi', {
    params: {
      query,
      page,
      language,
      region,
    },
  });
}

export async function searchMovies(
  query: string,
  page = 1,
  language = DEFAULT_LANGUAGE,
  region = DEFAULT_REGION
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB('/search/movie', {
    params: {
      query,
      page,
      language,
      region,
    },
  });
}

export async function searchTVShows(
  query: string,
  page = 1,
  language = DEFAULT_LANGUAGE,
  region = DEFAULT_REGION
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB('/search/tv', {
    params: {
      query,
      page,
      language,
      region,
    },
  });
}