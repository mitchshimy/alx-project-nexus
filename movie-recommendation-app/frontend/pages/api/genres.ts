import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const url = `${API_BASE_URL}/genre/movie/list`;
  const tmdbToken = process.env.TMDB_READ_TOKEN;

  if (!tmdbToken) {
    return res.status(500).json({ error: 'TMDB_READ_TOKEN not set' });
  }

  const apiRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tmdbToken}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  const data = await apiRes.json();
  res.status(apiRes.status).json(data);
} 