import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MovieCard from '@/components/MovieCard';
import { movieAPI } from '@/utils/api';
import { TMDBMovie } from '@/types/tmdb';
import Layout from '@/components/Layout';

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 2rem;
  text-align: center;
`;

export default function Favorites() {
  const [favorites, setFavorites] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await movieAPI.getFavorites();
        setFavorites(data.results || []);
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <Layout>
        <h1>Your Favorites</h1>
        <div>Loading your favorites...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <h1>Your Favorites</h1>
        <ErrorMessage>
          Error loading favorites: {error}
        </ErrorMessage>
      </Layout>
    );
  }

  return (
    <>
      <h1>Your Favorites</h1>
      {favorites.length === 0 ? (
        <EmptyState>
          <h3>No favorites yet</h3>
          <p>Start adding movies to see them here</p>
        </EmptyState>
      ) : (
        <MovieGrid>
          {favorites.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
            />
          ))}
        </MovieGrid>
      )}
    </>
  );
}