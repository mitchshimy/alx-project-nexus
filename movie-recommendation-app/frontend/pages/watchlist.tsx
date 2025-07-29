import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MovieCard from '@/components/MovieCard';
import { getMovieDetails } from '@/utils/tmdbClient';
import { TMDBMovie } from '@/types/tmdb';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f0f0f0;
  text-align: center;
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #666;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = async () => {
      // Simulate watchlist data - in a real app, this would come from user's account
      const watchlistIds = [550, 299536, 299534, 299537]; // Example movie IDs
      
      try {
        const watchlistMovies = await Promise.all(
          watchlistIds.map(id => 
            getMovieDetails(id)
              .catch(e => {
                console.error(`Failed to load movie ${id}:`, e);
                return null;
              })
          )
        );
        setWatchlist(watchlistMovies.filter((movie): movie is TMDBMovie => movie !== null));
      } catch (error) {
        console.error('Error loading watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  if (loading) {
    return (
      <Container>
        <Title>📋 Watchlist</Title>
        <Loading>Loading your watchlist...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📋 Watchlist</Title>
      
      {watchlist.length === 0 ? (
        <EmptyState>
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies and TV shows to see them here</p>
        </EmptyState>
      ) : (
        <MovieGrid>
          {watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </MovieGrid>
      )}
    </Container>
  );
} 