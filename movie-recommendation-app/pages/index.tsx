import { useEffect, useState } from 'react';
import styled from 'styled-components';
import MovieCard from '../components/MovieCard';
import Favorites from '../components/Favorites';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
};

async function fetchTrendingMovies() {
  const res = await fetch('/api/trending');
  if (!res.ok) {
    throw new Error('Failed to fetch trending movies');
  }
  return res.json();
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingMovies()
      .then((data) => {
        setMovies(data.results);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading trending movies...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <Favorites />
      <h1>Trending Movies</h1>
      <Grid>
        {movies.map((movie) => (
          <MovieCard key={movie.id} id={movie.id} title={movie.title} posterPath={movie.poster_path} />
        ))}
      </Grid>
    </div>
  );
}