import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 40px auto;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 32px;
`;
const Poster = styled.img`
  width: 100%;
  max-width: 320px;
  border-radius: 12px;
  margin-bottom: 24px;
`;
const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 16px;
`;
const Overview = styled.p`
  font-size: 1.1rem;
  color: #444;
`;
const BackButton = styled.button`
  margin-top: 32px;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.secondary}; }
`;

type MovieDetail = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
};

export default function MovieDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/movie?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status_code) throw new Error(data.status_message);
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>Error: {error}</Container>;
  if (!movie) return <Container>Movie not found.</Container>;

  return (
    <Container>
      <Poster src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.png'} alt={movie.title} />
      <Title>{movie.title}</Title>
      <Overview>{movie.overview}</Overview>
      <p><strong>Release Date:</strong> {movie.release_date}</p>
      <p><strong>Rating:</strong> {movie.vote_average}</p>
      <BackButton onClick={() => router.back()}>Back</BackButton>
    </Container>
  );
} 