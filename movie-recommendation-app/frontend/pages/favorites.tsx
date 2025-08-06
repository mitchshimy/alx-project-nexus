import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { movieAPI, getAuthToken, clearApiCache, clearFavoritesCache } from '@/utils/api';
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

export default function Favorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Array<{
    tmdb_id?: number;
    title?: string;
    poster_path?: string | null;
    vote_average?: number;
    release_date?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadFavorites = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Clear favorites cache to ensure fresh data
      clearFavoritesCache();
      
      const data = await movieAPI.getFavorites();
      
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
        setFavorites(movies);
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
        setFavorites(movies);
      } else {
        setFavorites([]);
      }
    } catch (err: unknown) {
      console.error('Error loading favorites:', err);
      setFavorites([]);
      // Only clear cache on error
      clearFavoritesCache();
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check authentication status
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    loadFavorites(true);
    
    // Add focus event listener to refresh data when user returns to the page
    // Use a debounced approach to prevent excessive API calls
    let focusTimeout: NodeJS.Timeout;
    const handleFocus = () => {
      if (isAuthenticated) {
        // Debounce the focus event to prevent multiple rapid calls
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          loadFavorites(false);
        }, 1000); // Wait 1 second before making the API call
      }
    };
    
    // Listen for global favorites update events
    const handleFavoritesUpdated = (event: Event) => {
      console.log('Favorites updated globally, refreshing favorites page');
      // Update immediately without showing loading state
      setTimeout(() => {
        loadFavorites(false);
      }, 500); // Small delay to let the API call complete
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
      clearTimeout(focusTimeout);
    };
  }, [isAuthenticated]);



  const handleFavoriteToggle = () => {
    // Refresh the favorites list when an item is toggled
    // Use a longer delay for better user experience
    setTimeout(() => {
      loadFavorites(false);
    }, 1000); // Increased delay to avoid jarring updates
  };

  const handleManualRefresh = () => {
    loadFavorites(true);
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  if (!isAuthenticated) {
    return (
      <>
        <h1>Your Favorites</h1>
        <AuthPrompt>
          <h2>Sign in to view your favorites</h2>
          <p>You need to be signed in to access your favorite movies and TV shows.</p>
          <button onClick={handleSignIn}>Sign In</button>
        </AuthPrompt>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <h1>Your Favorites</h1>
        <div>Loading your favorites...</div>
      </>
    );
  }



  return (
    <>
      <HeaderContainer>
        <h1>Your Favorites</h1>
        <RefreshButton onClick={handleManualRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Favorites'}
        </RefreshButton>
      </HeaderContainer>
      {favorites.length === 0 ? (
        <EmptyState>
          <h3>No favorites yet</h3>
          <p>Start adding movies to see them here</p>
        </EmptyState>
      ) : (
        <MovieGrid>
          {favorites.map(movie => (
            <MovieCard 
              key={movie.tmdb_id || 'unknown'} 
              movie={{
                tmdb_id: movie.tmdb_id || 0,
                title: movie.title,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date
              }} 
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </MovieGrid>
      )}
    </>
  );
}