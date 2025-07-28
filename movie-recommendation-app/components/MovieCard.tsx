import styled from 'styled-components';

interface MovieCardProps {
  title: string;
  posterPath: string | null;
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
  cursor: pointer;
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
  color: ${({ theme }) => theme.colors.text};
`;

export default function MovieCard({ title, posterPath }: MovieCardProps) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/no-poster.png'; // fallback image
  return (
    <Card>
      <Poster src={imageUrl} alt={title} />
      <Title>{title}</Title>
    </Card>
  );
} 