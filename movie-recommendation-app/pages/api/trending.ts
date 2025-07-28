import type { NextApiRequest, NextApiResponse } from 'next';
import { getTrendingMovies } from '@/utils/tmdbClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { page = '1' } = req.query;
    const data = await getTrendingMovies(Number(page));
    
    // Cache response for 1 hour
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch trending movies',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}