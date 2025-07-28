const API_BASE_URL = 'https://api.themoviedb.org/3';

const getHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
  'Content-Type': 'application/json;charset=utf-8',
});

export async function fetchTrendingMovies() {
  console.log('TMDB_READ_TOKEN:', process.env.TMDB_READ_TOKEN); // Add this line
  const res = await fetch(`${API_BASE_URL}/trending/movie/week`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('TMDB API error:', errorText); // Add this line
    throw new Error('Failed to fetch trending movies');
  }
  return res.json();
}

// You can add more API functions here, e.g., fetchMovieDetails, fetchRecommendations, etc.
