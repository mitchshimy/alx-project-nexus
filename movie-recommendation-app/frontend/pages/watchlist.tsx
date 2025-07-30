import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import MovieCard from '@/components/MovieCard';
import { movieAPI, getAuthToken } from '@/utils/api';
import { TMDBMovie } from '@/types/tmdb';
import Layout from '@/components/Layout';

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.8rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #666;
  
  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const AuthPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  
  h2 {
    color: #333;
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.3rem;
    }
  }
  
  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
  
  button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
    min-height: 44px; // Better touch target
    
    &:hover {
      transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
      padding: 10px 20px;
      font-size: 0.9rem;
    }
    
    @media (max-width: 480px) {
      padding: 8px 16px;
      font-size: 0.8rem;
    }
  }
`;

export default function Watchlist() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

    const loadWatchlist = async () => {
      try {
        const data = await movieAPI.getWatchlist();
      // Handle nested movie data structure from backend
      const watchlist = data.results || data || [];
      const movies = watchlist.map((item: any) => {
        // If the item has a nested 'movie' property, extract it
        if (item.movie) {
          return {
            ...item.movie,
            // Add the watchlist ID for removal functionality
            watchlist_id: item.id
          };
        }
        // If it's already a flat movie object, return as is
        return item;
      });
      setWatchlist(movies);
    } catch (err: any) {
        console.error('Error loading watchlist:', err);
      if (err.message.includes('401')) {
        setError('Authentication required');
      } else {
        setError('Failed to load watchlist. Please try again.');
      }
      } finally {
        setLoading(false);
      }
    };

  const handleWatchlistToggle = () => {
    // Refresh the watchlist when an item is toggled
    loadWatchlist();
  };

  useEffect(() => {
    // Check authentication status
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    loadWatchlist();
  }, []);

  const handleSignIn = () => {
    router.push('/signin');
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <h1>📋 Your Watchlist</h1>
        <AuthPrompt>
          <h2>Sign in to view your watchlist</h2>
          <p>You need to be signed in to access your watchlist of movies and TV shows.</p>
          <button onClick={handleSignIn}>Sign In</button>
        </AuthPrompt>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <h1>📋 Your Watchlist</h1>
        <div>Loading your watchlist...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <h1>📋 Your Watchlist</h1>
        <ErrorMessage>
          {error}
        </ErrorMessage>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>📋 Your Watchlist</h1>
      {watchlist.length === 0 ? (
        <EmptyState>
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies and TV shows to see them here</p>
        </EmptyState>
      ) : (
        <MovieGrid>
          {watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} onWatchlistToggle={handleWatchlistToggle} />
          ))}
        </MovieGrid>
      )}
    </Layout>
  );
} 