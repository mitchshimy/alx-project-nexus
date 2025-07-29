import { TMDBMovie, TMDBResponse } from '@/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDB<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.statusText}`);
  }

  return res.json();
}

// Cached version of trending movies
export async function getTrendingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB('/trending/movie/week', { page: page.toString() });
}