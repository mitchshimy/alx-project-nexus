import styled from 'styled-components';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isFavorite, addFavorite, removeFavorite } from '../utils/favorites';

interface MovieCardProps {
  title: string;
  posterPath: string | null;
  id: number;
}

const Card = styled.a`
  background: ${({ theme }) => (theme as any).colors.card};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 320px;
  object-fit: cover;
  background: #eee;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin: 12px 0;
  text-align: center;
  color: ${({ theme }) => (theme as any).colors.text};
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #e0245e;
  z-index: 2;
  transition: transform 0.1s;
  &:active { transform: scale(1.2); }
`;

export default function MovieCard({ title, posterPath, id }: MovieCardProps) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/no-poster.png'; // fallback image
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(id));
  }, [id]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFavorite(id);
      setFavorite(false);
    } else {
      addFavorite(id);
      setFavorite(true);
    }
  };

  return (
    <Link href={`/movies/${id}`} passHref legacyBehavior>
      <Card>
        <FavoriteButton onClick={handleFavorite} aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}>
          {favorite ? '❤️' : '🤍'}
        </FavoriteButton>
        <Poster src={imageUrl} alt={title} />
        <Title>{title}</Title>
      </Card>
    </Link>
  );
} 