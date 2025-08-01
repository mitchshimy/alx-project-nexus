import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { movieAPI, getAuthToken } from '@/utils/api';
import { shouldAutoPlayTrailer, buildYouTubeEmbedUrl } from '@/utils/videoPlayer';
import TrailerPreview from './TrailerPreview';
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

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-8px);
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

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${Card}:hover & {
    transform: scale(1.08);
  }
`;

const Skeleton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 4s infinite; // Further slowed down for better performance
  opacity: 0.1; // Further reduced for better performance
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

const Star = styled.span`
  color: #FF6B35;
  font-size: 1rem;
`;

const Content = styled.div`
  padding: 1.25rem;
  position: relative;
  z-index: 2;
`;

const MovieTitle = styled.h3`
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MovieInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Year = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top: 3px solid #00D4FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Badge = styled.div<{ $type: 'movie' | 'tv' }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ $type }) => 
    $type === 'tv' 
      ? 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)' 
      : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'};
  color: #FFFFFF;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

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
        // Ensure favorites is an array before using .some()
        const favoritesArray = Array.isArray(favorites) ? favorites : [];
        const isInFavorites = favoritesArray.some((fav: any) => fav.tmdb_id === movie.tmdb_id);
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
        // Ensure watchlist is an array before using .some()
        const watchlistArray = Array.isArray(watchlist) ? watchlist : [];
        const isInWatchlist = watchlistArray.some((item: any) => item.tmdb_id === movie.tmdb_id);
        setIsInWatchlist(isInWatchlist);
      } catch (error) {
        console.error('Error checking watchlist:', error);
        setIsInWatchlist(false);
      }
    };

    checkFavorites();
    checkWatchlist();
  }, [movie.tmdb_id]);

  const handleCardClick = () => {
    router.push(`/movies/${movie.tmdb_id}`);
  };

  const handleMouseEnter = () => {
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

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await movieAPI.removeFromFavoritesByMovie(movie.tmdb_id);
        setIsFavorite(false);
      } else {
        await movieAPI.addToFavorites(movie.tmdb_id);
        setIsFavorite(true);
      }
      
      // Call the parent callback if provided
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await movieAPI.removeFromWatchlistByMovie(movie.tmdb_id);
        setIsInWatchlist(false);
      } else {
        await movieAPI.addToWatchlist(movie.tmdb_id);
        setIsInWatchlist(true);
      }
      
      // Call the parent callback if provided
      if (onWatchlistToggle) {
        onWatchlistToggle();
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
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
    };
  }, []);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` // Changed from w500 to w342 for faster loading
    : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image';

  // Handle both movie and TV show titles
  const movieTitle = (movie as any).name || movie.title || 'Unknown Title';

  return (
    <Card 
      onClick={handleCardClick}
      onMouseEnter={shouldAutoPlayTrailer() ? handleMouseEnter : undefined}
      onMouseLeave={shouldAutoPlayTrailer() ? handleMouseLeave : undefined}
    >
      <PosterContainer>
        <Skeleton />
        <Poster 
          src={posterUrl} 
          alt={movieTitle}
          loading="lazy"
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
