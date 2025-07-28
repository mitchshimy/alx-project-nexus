import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTMDB } from '@/utils/tmdbClient';
import { getFavorites } from '@/utils/favorites';
import { TMDBMovie, TMDBResponse, RecommendationsError } from '@/types/tmdb';
import { withRateLimit } from '@/lib/rateLimit';

// Cache control configuration
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per IP
};

// Main handler function
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TMDBMovie[] | RecommendationsError>
) {
  try {
    // Validate HTTP method
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      });
    }

    const favIds = getFavorites();
    
    // Validate favorite IDs
    if (!favIds.every(id => typeof id === 'number' && id > 0)) {
      return res.status(400).json({ 
        error: 'Invalid favorite IDs',
        message: 'All favorite IDs must be positive numbers'
      });
    }

    if (favIds.length === 0) {
      res.setHeader('Cache-Control', CACHE_HEADERS['Cache-Control']);
      return res.status(200).json([]);
    }

    // Get favorite movies with genre data
    const favoriteMovies = await fetchFavoriteMovies(favIds);
    const validMovies = favoriteMovies.filter(Boolean) as TMDBMovie[];

    // Get top genres from valid movies
    const topGenres = getTopGenres(validMovies);
    if (topGenres.length === 0) {
      res.setHeader('Cache-Control', CACHE_HEADERS['Cache-Control']);
      return res.status(200).json([]);
    }

    // Get and filter recommendations
    const recommendations = await fetchRecommendations(topGenres);
    const validRecommendations = filterRecommendations(recommendations.results);

    res.setHeader('Cache-Control', CACHE_HEADERS['Cache-Control']);
    res.status(200).json(validRecommendations);
  } catch (error) {
    handleError(error, res);
  }
}

// Helper function to fetch favorite movies
async function fetchFavoriteMovies(ids: number[]): Promise<(TMDBMovie | null)[]> {
  return Promise.all(
    ids.map(id => 
      fetchTMDB<TMDBMovie>(`/movie/${id}`, {
        params: {
          append_to_response: 'genres'
        }
      }).catch(e => {
        console.error(`Failed to fetch movie ${id}:`, e);
        return null;
      })
    )
  );
}

// Helper function to extract top genres
function getTopGenres(movies: TMDBMovie[], count = 3): number[] {
  const genreCounts = movies
    .flatMap(movie => movie.genres?.map(g => g.id) || [])
    .reduce((acc: Record<number, number>, genreId: number) => {
      acc[genreId] = (acc[genreId] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([id]) => Number(id));
}

// Helper function to fetch recommendations
async function fetchRecommendations(genres: number[]): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>(
    '/discover/movie',
    {
      params: {
        with_genres: genres.join(','),
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        language: 'en-US'
      }
    }
  );
}

// Helper function to filter recommendations
function filterRecommendations(movies: TMDBMovie[]): TMDBMovie[] {
  return movies.filter(
    movie => movie.poster_path && movie.vote_count && movie.vote_count > 50
  );
}

// Helper function to handle errors
function handleError(error: unknown, res: NextApiResponse<RecommendationsError>) {
  console.error('Recommendations error:', error);
  
  const errorResponse: RecommendationsError = {
    error: 'Failed to get recommendations',
    message: error instanceof Error ? error.message : 'Unknown error'
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = error;
  }

  res.status(500).json(errorResponse);
}

// Apply rate limiting to the handler
export default withRateLimit(handler, RATE_LIMIT_CONFIG);