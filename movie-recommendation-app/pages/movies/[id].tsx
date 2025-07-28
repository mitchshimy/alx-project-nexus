import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SkeletonPoster, SkeletonTitle, SkeletonText } from '@/components/Skeleton';
import { TMDBMovie, TMDBCast } from '@/types/tmdb';
import { isFavorite, addFavorite, removeFavorite } from '@/utils/favorites';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 32px;
  position: relative;

  @media (max-width: 600px) {
    padding: 24px;
    margin: 20px;
  }
`;

const MovieHeader = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const PosterContainer = styled.div`
  flex: 0 0 300px;
  position: relative;

  @media (max-width: 600px) {
    flex: 0 0 auto;
  }
`;

const Poster = styled.img`
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const MovieInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const Metadata = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;

  & > strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Overview = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 24px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const BackButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const FavoriteButton = styled(Button)<{ $isFavorite: boolean }>`
  background: ${({ $isFavorite, theme }) => 
    $isFavorite ? '#e0245e' : theme.colors.background};
  color: ${({ $isFavorite }) => $isFavorite ? '#fff' : '#333'};
  border: 1px solid ${({ $isFavorite }) => $isFavorite ? 'transparent' : '#ccc'};

  &:hover {
    background: ${({ $isFavorite }) => $isFavorite ? '#c41c50' : '#f0f0f0'};
  }
`;

const SimilarMoviesSection = styled.div`
  margin-top: 40px;
`;

const SimilarMoviesTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const SimilarMoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const SimilarMovie = styled.div`
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const SimilarPoster = styled.img`
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 2/3;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const CastList = styled.div`
  margin-top: 32px;
`;

const CastGrid = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const CastCard = styled.div`
  flex: 0 0 auto;
  width: 100px;
  text-align: center;
`;

const CastImage = styled.img`
  width: 100%;
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: cover;
  margin-bottom: 8px;
`;

const CastName = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export default function MovieDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [isFavoriteMovie, setIsFavoriteMovie] = useState(false);
  const [cast, setCast] = useState<TMDBCast[]>([]);

  useEffect(() => {
    if (!id) return;
      // Reset state when ID changes
    setMovie(null);
    setSimilarMovies([]);
    setCast([]);
    setError(null);
    setLoading(true); 

    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, similarRes] = await Promise.all([
          fetch(`/api/movie/${id}`),
          fetch(`/api/movie/${id}/similar`)
        ]);

        if (!movieRes.ok) throw new Error('Failed to fetch movie details');
        const movieData = await movieRes.json();
        setMovie(movieData);
        setIsFavoriteMovie(isFavorite(movieData.id));

        if (movieData.credits?.cast) {
          setCast(movieData.credits.cast.slice(0, 10)); // Top 10 cast
        }

        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilarMovies(similarData.results.slice(0, 6));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatRating = (rating: number) => rating ? `${rating.toFixed(1)}/10` : 'Not rated';

  const handleFavorite = () => {
    if (!movie) return;
    const newFavorite = !isFavoriteMovie;
    setIsFavoriteMovie(newFavorite);
    newFavorite ? addFavorite(movie.id) : removeFavorite(movie.id);
    window.dispatchEvent(new Event('favorites-changed'));
  };

  if (loading) {
    return (
      <Container>
        <MovieHeader>
          <PosterContainer><SkeletonPoster /></PosterContainer>
          <MovieInfo>
            <SkeletonTitle width="80%" />
            <SkeletonText width="60%" />
            <SkeletonText width="40%" />
            <SkeletonText />
          </MovieInfo>
        </MovieHeader>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Title>Movie Not Found</Title>
        <p>We couldn't find that movie.</p>
        <BackButton onClick={() => router.back()}>Go Back</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <MovieHeader>
        <PosterContainer>
          <Poster
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.png'}
            alt={movie.title}
          />
        </PosterContainer>
        <MovieInfo>
          <Title>{movie.title}</Title>
          <Metadata>
            <MetadataItem><strong>Release:</strong> {formatDate(movie.release_date)}</MetadataItem>
            <MetadataItem><strong>Rating:</strong> {formatRating(movie.vote_average)}</MetadataItem>
            {movie.runtime && <MetadataItem><strong>Runtime:</strong> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</MetadataItem>}
          </Metadata>
          <Overview>{movie.overview || 'No overview available.'}</Overview>
          <ActionButtons>
            <BackButton onClick={() => router.back()}>← Back</BackButton>
            <FavoriteButton $isFavorite={isFavoriteMovie} onClick={handleFavorite}>
              {isFavoriteMovie ? '❤️ Remove' : '🤍 Favorite'}
            </FavoriteButton>
          </ActionButtons>
        </MovieInfo>
      </MovieHeader>

      {cast.length > 0 && (
        <CastList>
          <SimilarMoviesTitle>Top Cast</SimilarMoviesTitle>
          <CastGrid>
            {cast.map((actor) => (
              <CastCard key={actor.id}>
                <CastImage
                  src={actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : '/no-poster.png'}
                  alt={actor.name}
                />
                <CastName>{actor.name}</CastName>
              </CastCard>
            ))}
          </CastGrid>
        </CastList>
      )}

      {similarMovies.length > 0 && (
        <SimilarMoviesSection>
          <SimilarMoviesTitle>Similar Movies</SimilarMoviesTitle>
          <SimilarMoviesGrid>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <SimilarMovie key={index}>
                    <SimilarPoster
                      src="/no-poster.png"
                      alt="Loading"
                      style={{ opacity: 0.3 }}
                    />
                  </SimilarMovie>
                ))
              : similarMovies.map((similar) => (
                  <SimilarMovie
                    key={similar.id}
                    onClick={() => router.push(`/movies/${similar.id}`)}
                  >
                    <SimilarPoster
                      src={
                        similar.poster_path
                          ? `https://image.tmdb.org/t/p/w300${similar.poster_path}`
                          : '/no-poster.png'
                      }
                      alt={similar.title}
                    />
                  </SimilarMovie>
                ))}
  </SimilarMoviesGrid>
        </SimilarMoviesSection>
      )}
    </Container>
  );
}