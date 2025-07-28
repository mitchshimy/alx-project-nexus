import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTMDB } from '@/utils/tmdbClient';
import { TMDBMovie, TMDBResponse } from '@/types/tmdb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    const data = await fetchTMDB<TMDBResponse<TMDBMovie>>(`/movie/${id}/similar`, {
      params: {
        language: 'en-US',
        page: 1,
      },
    });

    res.status(200).json(data.results);
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
