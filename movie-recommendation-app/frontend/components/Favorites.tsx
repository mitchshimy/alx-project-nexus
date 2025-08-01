import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { getFavorites } from '@/utils/favorites';
import MovieCard from './MovieCard';
import { SkeletonBase } from '@/components/Skeleton';
import { TMDBMovie } from '@/types/tmdb';
import useWindowSize from '@/hooks/useWindowSize';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Layout components
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 16px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 16px;
`;

const SkeletonCard = styled(SkeletonBase)`
  width: 100%;
  height: 320px;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    height: 280px;
  }
`;

function useFavoritesSync() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);
  return version;
}

export default function Favorites() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const version = useFavoritesSync();
  const windowSize = useWindowSize();

  // Calculate skeleton count based on window width
  const skeletonCount = windowSize.width ? Math.max(4, Math.floor(windowSize.width / 200)) : 4;

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const favorites = await getFavorites();
        if (favorites.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        // The API returns movie objects directly, so we can use them as is
        setMovies(favorites);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [version]);

  if (loading) {
    return (
      <div aria-live="polite" aria-busy="true">
        <h2>Your Favorites</h2>
        <SkeletonGrid>
          {[...Array(skeletonCount)].map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </SkeletonGrid>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;
  if (movies.length === 0) return <p>No favorite movies yet. Add some!</p>;

  return (
    <div aria-live="polite">
      <h2>Your Favorites</h2>
      <Grid>
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={{
              tmdb_id: movie.tmdb_id || movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              release_date: movie.release_date
            }}
          />
        ))}
      </Grid>
    </div>
  );
}