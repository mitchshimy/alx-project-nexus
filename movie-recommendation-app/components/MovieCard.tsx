import styled from 'styled-components';
import Link from 'next/link';
import { TMDBMovie } from '@/types/tmdb';
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { isFavorite, toggleFavorite } from '@/utils/favorites';

const Card = styled.a`
  position: relative;
  display: block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 2/3;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1rem;
  color: white;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

interface MovieCardProps {
  movie: TMDBMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(isFavorite(movie.id));
  }, [movie.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link from navigating
    toggleFavorite(movie.id);
    setIsFavorited(!isFavorited);
  };

  const posterSrc = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/no-poster.png';

  return (
    <Link href={`/movies/${movie.id}`} passHref>
      <Card>
        <Poster src={posterSrc} alt={movie.title} />
        <Overlay>
          <Title>{movie.title}</Title>
        </Overlay>
        <FavoriteButton onClick={handleFavoriteClick}>
          {isFavorited ? <FaHeart color="#e0245e" /> : <FaRegHeart />}
        </FavoriteButton>
      </Card>
    </Link>
  );
}
