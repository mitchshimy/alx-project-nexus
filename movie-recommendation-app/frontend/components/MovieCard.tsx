import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { movieAPI } from '../utils/api';
import { getAuthToken } from '../utils/api';

const Card = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }
  }
  
  @media (max-width: 480px) {
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  }
`;

const Poster = styled.div<{ posterPath: string }>`
  width: 100%;
  height: 300px;
  background-image: ${props => 
    props.posterPath 
      ? `url(https://image.tmdb.org/t/p/w500${props.posterPath})`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  
  @media (max-width: 768px) {
    height: 250px;
  }
  
  @media (max-width: 480px) {
    height: 200px;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  flex-direction: column;
  gap: 10px;

  ${Card}:hover & {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const ActionButton = styled.button<{ isActive?: boolean }>`
  background: ${props => props.isActive ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 5px;

  &:hover {
    transform: scale(1.05);
    background: ${props => props.isActive ? '#c0392b' : '#2980b9'};
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
    margin: 0 3px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    margin: 0 2px;
  }
`;

const Content = styled.div`
  padding: 15px;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 5px;
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    margin-top: 8px;
  }
  
  @media (max-width: 480px) {
    margin-top: 6px;
  }
`;

const Rating = styled.span`
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    padding: 2px 5px;
    font-size: 10px;
  }
`;

const Year = styled.span`
  color: #666;
  font-size: 12px;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

interface MovieCardProps {
  movie: {
    id: number;
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date: string;
    is_favorite?: boolean;
    is_watchlisted?: boolean;
  };
  onFavoriteToggle?: () => void;
  onWatchlistToggle?: () => void;
}

export default function MovieCard({ movie, onFavoriteToggle, onWatchlistToggle }: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(movie.is_favorite || false);
  const [isWatchlisted, setIsWatchlisted] = useState(movie.is_watchlisted || false);

  const isAuthenticated = () => {
    return getAuthToken() !== null;
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      alert('Please sign in to add favorites');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await movieAPI.removeFromFavorites(movie.id);
        setIsFavorite(false);
      } else {
        // Add to favorites
        await movieAPI.addToFavorites(movie.tmdb_id);
        setIsFavorite(true);
      }
      onFavoriteToggle?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      alert('Please sign in to add to watchlist');
      return;
    }

    setIsLoading(true);
    try {
      if (isWatchlisted) {
        // Remove from watchlist
        await movieAPI.removeFromWatchlist(movie.id);
        setIsWatchlisted(false);
      } else {
        // Add to watchlist
        await movieAPI.addToWatchlist(movie.tmdb_id);
        setIsWatchlisted(true);
      }
      onWatchlistToggle?.();
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      alert('Failed to update watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  return (
    <Link href={`/movies/${movie.tmdb_id}`} passHref>
      <Card>
        <Poster posterPath={movie.poster_path || ''}>
          <Overlay>
            <ActionButton
              isActive={isFavorite}
              onClick={handleFavoriteToggle}
              disabled={isLoading}
            >
              {isFavorite ? '❤️ Remove' : '🤍 Add to Favorites'}
            </ActionButton>
            <ActionButton
              isActive={isWatchlisted}
              onClick={handleWatchlistToggle}
              disabled={isLoading}
            >
              {isWatchlisted ? '📝 Remove from Watchlist' : '📝 Add to Watchlist'}
            </ActionButton>
          </Overlay>
          {isLoading && (
            <LoadingOverlay>
              Updating...
            </LoadingOverlay>
          )}
        </Poster>
        <Content>
          <Title>{movie.title}</Title>
          <Meta>
            <Rating>⭐ {movie.vote_average.toFixed(1)}</Rating>
            <Year>{formatYear(movie.release_date)}</Year>
          </Meta>
        </Content>
      </Card>
    </Link>
  );
}
