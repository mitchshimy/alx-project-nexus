import { useState, memo, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { MdFavorite, MdFavoriteBorder, MdBookmark, MdBookmarkBorder } from 'react-icons/md';
import { movieAPI } from '@/utils/api';
import { TMDBMovie } from '@/types/tmdb';

const Card = styled.div`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  min-height: 200px; // Ensure minimum height for touch targets

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    min-height: 180px;
  }
  
  @media (max-width: 480px) {
    min-height: 160px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 1;
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
  animation: shimmer 3s infinite; // Slowed down from 1.5s to 3s
  opacity: 0.15; // Reduced from 0.3 to 0.15 for more subtlety
  pointer-events: none;
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
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
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

interface MovieCardProps {
  movie: TMDBMovie;
  onFavoriteToggle?: () => void;
  onWatchlistToggle?: () => void;
}

const MovieCard = memo<MovieCardProps>(({ movie, onFavoriteToggle, onWatchlistToggle }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = () => {
    return typeof window !== 'undefined' && localStorage.getItem('access_token');
  };

  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const handleCardClick = () => {
    router.push(`/movies/${movie.tmdb_id}`);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        // Try to remove by favorite_id first, then by movie ID
        try {
          if (movie.favorite_id) {
            await movieAPI.removeFromFavorites(movie.favorite_id);
          } else {
            await movieAPI.removeFromFavoritesByMovie(movie.tmdb_id);
          }
        } catch (error) {
          console.error('Error removing from favorites:', error);
          // Fallback to movie ID removal
          await movieAPI.removeFromFavoritesByMovie(movie.tmdb_id);
        }
        setIsFavorite(false);
      } else {
        await movieAPI.addToFavorites({
          tmdb_id: movie.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average
        });
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
    if (!isAuthenticated()) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        // Try to remove by watchlist_id first, then by movie ID
        try {
          if (movie.watchlist_id) {
            await movieAPI.removeFromWatchlist(movie.watchlist_id);
          } else {
            await movieAPI.removeFromWatchlistByMovie(movie.tmdb_id);
          }
        } catch (error) {
          console.error('Error removing from watchlist:', error);
          // Fallback to movie ID removal
          await movieAPI.removeFromWatchlistByMovie(movie.tmdb_id);
        }
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

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` // Changed from w500 to w342 for faster loading
    : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image';

  // Handle both movie and TV show titles
  const movieTitle = (movie as any).name || movie.title || 'Unknown Title';

  return (
    <Card onClick={handleCardClick}>
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
            ⭐ {formatRating(movie.vote_average)} ({movie.vote_count || 0} votes)
          </Rating>
          
          <ActionButtons>
            <ActionButton
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
            </ActionButton>
            
            <ActionButton
              onClick={handleWatchlistToggle}
              disabled={isLoading}
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInWatchlist ? <MdBookmark /> : <MdBookmarkBorder />}
            </ActionButton>
          </ActionButtons>
        </Overlay>
      </PosterContainer>
    </Card>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
