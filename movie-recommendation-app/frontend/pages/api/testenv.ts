import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    TMDB_READ_TOKEN: process.env.TMDB_READ_TOKEN,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  });
}