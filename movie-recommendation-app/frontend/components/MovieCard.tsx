import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { movieAPI, getAuthToken, clearApiCache, debugCache } from '@/utils/api';
import { shouldAutoPlayTrailer } from '@/utils/videoPlayer';
import { getMobileAutoPlayTrailers } from '@/utils/settings';
import TrailerPreview from './TrailerPreview';
import LazyImage from './LazyImage';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa';

interface MovieCardProps {
  movie: {
    tmdb_id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
  };
  onFavoriteToggle?: () => void;
  onWatchlistToggle?: () => void;
}

const Card = styled.div<{ isLongPressing?: boolean; isTouching?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
  transform: ${props => props.isLongPressing ? 'scale(0.98)' : props.isTouching ? 'scale(0.99)' : 'scale(1)'};
  opacity: ${props => props.isLongPressing ? '0.8' : props.isTouching ? '0.9' : '1'};

  &:hover {
    transform: ${props => props.isLongPressing ? 'scale(0.98)' : props.isTouching ? 'scale(0.99)' : 'translateY(-8px)'};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const PosterContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
`;



const Skeleton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite; // Reduced from 4s to 2s for better performance
  opacity: 0.05; // Further reduced for better performance
  pointer-events: none;
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(10, 10, 10, 0.3) 50%,
    rgba(10, 10, 10, 0.95) 100%
  );
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem;
  }

  ${Card}:hover & {
    opacity: 1;
  }
`;

const Title = styled.h3`
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Rating = styled.div`
  color: #FFFFFF;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;





const Year = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;

  &:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 1.2rem;
  }
`;



const MovieCard = ({ movie, onFavoriteToggle, onWatchlistToggle }: MovieCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  
  // Mobile touch handling
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only check favorites/watchlist if user is authenticated
    const token = getAuthToken();
    if (!token) {
      setIsFavorite(false);
      setIsInWatchlist(false);
      return;
    }

    // Check if movie is in favorites
    const checkFavorites = async () => {
      try {
        const favorites = await movieAPI.getFavorites();
        
        // Handle paginated response from Django REST Framework
        let favoritesArray: any[] = [];
        if (favorites && favorites.results && Array.isArray(favorites.results)) {
          favoritesArray = favorites.results;
        } else if (Array.isArray(favorites)) {
          favoritesArray = favorites;
        }
        
        // Check if movie is in favorites by looking at the nested movie object
        const isInFavorites = favoritesArray.some((fav: any) => {
          const favMovie = fav.movie || fav;
          return favMovie.tmdb_id === movie.tmdb_id;
        });
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error('Error checking favorites:', error);
        setIsFavorite(false);
      }
    };

    // Check if movie is in watchlist
    const checkWatchlist = async () => {
      try {
        const watchlist = await movieAPI.getWatchlist();
        
        // Handle paginated response from Django REST Framework
        let watchlistArray: any[] = [];
        if (watchlist && watchlist.results && Array.isArray(watchlist.results)) {
          watchlistArray = watchlist.results;
        } else if (Array.isArray(watchlist)) {
          watchlistArray = watchlist;
        }
        
        // Check if movie is in watchlist by looking at the nested movie object
        const isInWatchlist = watchlistArray.some((item: any) => {
          const watchlistMovie = item.movie || item;
          return watchlistMovie.tmdb_id === movie.tmdb_id;
        });
        setIsInWatchlist(isInWatchlist);
      } catch (error) {
        console.error('Error checking watchlist:', error);
        setIsInWatchlist(false);
      }
    };

    checkFavorites();
    checkWatchlist();
  }, [movie.tmdb_id]);

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set scrolling to false after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150); // 150ms delay to detect when scrolling stops
    };

    // Add scroll listener to window
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    router.push(`/movies/${movie.tmdb_id}`);
  };

  const handleMouseEnter = () => {
    // Only work on desktop devices (not mobile)
    if (isMobileRef.current) return;
    
    isHoveringRef.current = true;
    
    // Only start hover timer if auto-play is enabled and user is authenticated
    if (shouldAutoPlayTrailer() && getAuthToken()) {
      hoverTimeoutRef.current = setTimeout(async () => {
        // Check if still hovering after 1.5 seconds
        if (isHoveringRef.current && !trailerKey) {
          try {
            const movieDetails = await movieAPI.getMovieDetails(movie.tmdb_id);
            
            // Check if the response has an error
            if (movieDetails && movieDetails.error) {
              console.warn('Error fetching trailer:', movieDetails.error);
              return; // Don't show trailer if there's an error
            }
            
            if (movieDetails && movieDetails.videos?.results) {
              const trailer = movieDetails.videos.results.find((video: any) => video.type === 'Trailer');
              if (trailer) {
                setTrailerKey(trailer.key);
                setShowTrailerPreview(true);
              }
            }
          } catch (error) {
            console.error('Error fetching trailer:', error);
            // Don't show error modal for trailer fetch failures
            // Just log the error and continue
          }
        }
      }, 1500);
    }
  };

  const handleMouseLeave = () => {
    // Only work on desktop devices (not mobile)
    if (isMobileRef.current) return;
    
    isHoveringRef.current = false;
    
    // Clear the hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Close trailer preview when mouse leaves (only if auto-play is enabled)
    if (showTrailerPreview && shouldAutoPlayTrailer()) {
      setShowTrailerPreview(false);
      setTimeout(() => {
        setTrailerKey(null);
      }, 300);
    }
  };

  // Mobile touch handlers with improved sensitivity
  // Features:
  // - Scroll detection to prevent accidental clicks during scrolling
  // - Distance tracking to ensure minimal movement (max 15px)
  // - Touch duration validation (50-500ms for intentional taps)
  // - Visual feedback for touch interactions
  // - Delayed execution to distinguish between scroll and tap gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    // Detect if it's a mobile device
    isMobileRef.current = true;
    touchStartTimeRef.current = Date.now();
    
    // Set touching state for visual feedback
    setIsTouching(true);
    
    // Store initial touch position for distance calculation
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    
    // Start long press timer for mobile
    if (getMobileAutoPlayTrailers() && getAuthToken()) {
      longPressTimeoutRef.current = setTimeout(async () => {
        setIsLongPressing(true);
        
        // Only trigger if still pressing and no trailer is showing
        if (!trailerKey) {
          try {
            const movieDetails = await movieAPI.getMovieDetails(movie.tmdb_id);
            
            if (movieDetails && movieDetails.error) {
              console.warn('Error fetching trailer:', movieDetails.error);
              return;
            }
            
            if (movieDetails && movieDetails.videos?.results) {
              const trailer = movieDetails.videos.results.find((video: any) => video.type === 'Trailer');
              if (trailer) {
                setTrailerKey(trailer.key);
                setShowTrailerPreview(true);
              }
            }
          } catch (error) {
            console.error('Error fetching trailer:', error);
          }
        }
      }, 800); // 800ms for mobile long press (faster than desktop hover)
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    
    // Calculate touch distance
    const touch = e.changedTouches[0];
    const distanceX = Math.abs(touch.clientX - touchStartXRef.current);
    const distanceY = Math.abs(touch.clientY - touchStartYRef.current);
    const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // Enhanced touch sensitivity logic:
    // 1. Touch duration should be between 50ms and 500ms (not too short, not too long)
    // 2. Distance should be less than 15px (minimal movement)
    // 3. Not a long press (not showing trailer)
    // 4. Not currently scrolling
    const isShortTap = touchDuration >= 50 && touchDuration <= 500;
    const isMinimalMovement = totalDistance < 15; // Reduced from 20px to 15px
    const isNotLongPress = !isLongPressing;
    const isNotScrolling = !isScrollingRef.current;
    
    if (isShortTap && isMinimalMovement && isNotLongPress && isNotScrolling) {
      // Add a small delay to ensure it's not part of a scroll gesture
      setTimeout(() => {
        // Double-check that we're still not scrolling
        if (!isScrollingRef.current) {
          handleCardClick();
        }
      }, 100); // Increased delay to 100ms for better scroll detection
    }
    
    setIsLongPressing(false);
    setIsTouching(false);
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPressing(false);
    setIsTouching(false);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
      return;
    }

    // Update local state immediately for instant feedback
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setIsLoading(true);

    try {
      if (isFavorite) {
        await movieAPI.removeFromFavoritesByMovie(movie.tmdb_id);
      } else {
        await movieAPI.addToFavorites(movie.tmdb_id);
      }
      
      console.log('Favorite toggle completed, clearing cache...');
      debugCache();
      
      // Clear favorites cache to ensure fresh data
      clearApiCache();
      
      console.log('Cache cleared, dispatching event...');
      
      // Dispatch global event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
          detail: { 
            movieId: movie.tmdb_id,
            action: isFavorite ? 'removed' : 'added',
            forceRefresh: true
          } 
        }));
      }
      
      // Call the parent callback if provided
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert local state if the API call failed
      setIsFavorite(!newFavoriteState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
      return;
    }

    // Update local state immediately for instant feedback
    const newWatchlistState = !isInWatchlist;
    setIsInWatchlist(newWatchlistState);
    setIsLoading(true);

    try {
      if (isInWatchlist) {
        await movieAPI.removeFromWatchlistByMovie(movie.tmdb_id);
      } else {
        await movieAPI.addToWatchlist(movie.tmdb_id);
      }
      
      // Clear watchlist cache to ensure fresh data
      clearApiCache();
      
      // Dispatch global event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watchlistUpdated', { 
          detail: { 
            movieId: movie.tmdb_id,
            action: isInWatchlist ? 'removed' : 'added',
            forceRefresh: true
          } 
        }));
      }
      
      // Call the parent callback if provided
      if (onWatchlistToggle) {
        onWatchlistToggle();
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      // Revert local state if the API call failed
      setIsInWatchlist(!newWatchlistState);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` // Changed from w342 to w185 for faster loading
    : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image';

  // Handle both movie and TV show titles
  const movieTitle = (movie as any).name || movie.title || 'Unknown Title';

  return (
    <Card 
      onClick={handleCardClick}
      onMouseEnter={shouldAutoPlayTrailer() ? handleMouseEnter : undefined}
      onMouseLeave={shouldAutoPlayTrailer() ? handleMouseLeave : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      isLongPressing={isLongPressing}
      isTouching={isTouching}
    >
      <PosterContainer>
        <Skeleton />
        <LazyImage 
          src={posterUrl} 
          alt={movieTitle}
        />
        <Overlay>
          <Title>{movieTitle}</Title>
          <Rating>
            ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
          </Rating>
          <Year>
            {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}
          </Year>
        </Overlay>
        
        {/* Always show action buttons, they will be visible on hover */}
        <ActionButtons>
          <ActionButton 
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </ActionButton>
          
          <ActionButton 
            onClick={handleWatchlistToggle}
            disabled={isLoading}
            title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isInWatchlist ? <FaBookmark /> : <FaRegBookmark />}
          </ActionButton>
        </ActionButtons>
      </PosterContainer>
      
      {showTrailerPreview && trailerKey && shouldAutoPlayTrailer() && (
        <TrailerPreview
          videoKey={trailerKey}
          movieTitle={movieTitle}
          movieId={movie.tmdb_id}
          onClose={() => {
            setShowTrailerPreview(false);
            // Reset trailerKey after a short delay to allow re-triggering
            setTimeout(() => {
              setTrailerKey(null);
            }, 300);
          }}
          autoPlay={shouldAutoPlayTrailer()}
        />
      )}
    </Card>
  );
};

export default MovieCard;
