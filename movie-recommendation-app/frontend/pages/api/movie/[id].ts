import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTMDB } from '@/utils/tmdbClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    // Fetch movie details with additional data
    const movie = await fetchTMDB(`/movie/${id}`, {
      append_to_response: 'credits' 
    });
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch movie details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}