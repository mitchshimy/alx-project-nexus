import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getFavorites } from '../utils/favorites';
import MovieCard from './MovieCard';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 16px;
`;

export default function Favorites() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const favIds = getFavorites();
    if (favIds.length === 0) {
      setMovies([]);
      setLoading(false);
      return;
    }
    Promise.all(
      favIds.map((id) =>
        fetch(`/api/movie?id=${id}`)
          .then((res) => res.json())
          .catch(() => null)
      )
    ).then((results) => {
      setMovies(results.filter(Boolean));
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading favorites...</p>;
  if (movies.length === 0) return <p>No favorite movies yet.</p>;

  return (
    <div>
      <h2>Your Favorites</h2>
      <Grid>
        {movies.map((movie) => (
          <MovieCard key={movie.id} id={movie.id} title={movie.title} posterPath={movie.poster_path} />
        ))}
      </Grid>
    </div>
  );
} 