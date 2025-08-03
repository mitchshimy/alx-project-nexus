import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { movieAPI, getAuthToken, clearApiCache } from '@/utils/api';
import MovieCard from '@/components/MovieCard';

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

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-left: 1rem;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export default function Watchlist() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      // Clear any cached data first
      await clearApiCache();
      
      const data = await movieAPI.getWatchlist();
      
      // Handle paginated response from Django REST Framework
      if (data && data.results && Array.isArray(data.results)) {
        const movies = data.results.map((item: any) => {
          const movie = item.movie || item;
          return {
            tmdb_id: movie.tmdb_id || movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date
          };
        });
        setWatchlist(movies);
      } else if (data && Array.isArray(data)) {
        // Fallback for non-paginated response
        const movies = data.map((item: any) => {
          const movie = item.movie || item;
          return {
            tmdb_id: movie.tmdb_id || movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date
          };
        });
        setWatchlist(movies);
      } else {
        setWatchlist([]);
      }
    } catch (err: unknown) {
      console.error('Error loading watchlist:', err);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    // Immediately refresh the watchlist when an item is toggled
    setTimeout(() => {
      loadWatchlist();
    }, 500); // Increased delay to ensure the API call completes
  };

  const handleManualRefresh = () => {
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

  // Refresh watchlist when the page becomes visible or when user navigates to it
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        loadWatchlist();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        loadWatchlist();
      }
    };

    const handleRouteChange = (url: string) => {
      if (url === '/watchlist' && isAuthenticated) {
        // Force a complete refresh when navigating to watchlist page
        setTimeout(() => {
          loadWatchlist();
        }, 100);
      }
    };

    // Listen for visibility changes and focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Initial load with a slight delay to ensure everything is ready
    if (isAuthenticated) {
      setTimeout(() => {
        loadWatchlist();
      }, 100);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isAuthenticated, router]);

  

  const handleSignIn = () => {
    router.push('/signin');
  };

  if (!isAuthenticated) {
    return (
      <>
        <h1>📋 Your Watchlist</h1>
        <AuthPrompt>
          <h2>Sign in to view your watchlist</h2>
          <p>You need to be signed in to access your watchlist of movies and TV shows.</p>
          <button onClick={handleSignIn}>Sign In</button>
        </AuthPrompt>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <h1>📋 Your Watchlist</h1>
        <div>Loading your watchlist...</div>
      </>
    );
  }



  return (
    <>
      <HeaderContainer>
        <h1>📋 Your Watchlist</h1>
        <RefreshButton onClick={handleManualRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Watchlist'}
        </RefreshButton>
      </HeaderContainer>
      {watchlist.length === 0 ? (
        <EmptyState>
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies and TV shows to see them here</p>
        </EmptyState>
      ) : (
        <MovieGrid>
          {watchlist.map(movie => (
            <MovieCard key={movie.tmdb_id || movie.id} movie={movie} onWatchlistToggle={handleWatchlistToggle} />
          ))}
        </MovieGrid>
      )}
    </>
  );
} 