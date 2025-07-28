import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const url = `${API_BASE_URL}/trending/movie/week`;

  const tmdbToken = process.env.TMDB_READ_TOKEN;
  console.log('TMDB_READ_TOKEN:', tmdbToken); // Debug log

  if (!tmdbToken) {
    console.error('TMDB_READ_TOKEN not set');
    return res.status(500).json({ error: 'TMDB_READ_TOKEN not set' });
  }

  try {
    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tmdbToken}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      console.error('TMDB API error:', data);
      return res.status(apiRes.status).json(data);
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected error', details: String(err) });
  }
} 