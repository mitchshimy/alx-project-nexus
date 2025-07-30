import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SkeletonPoster, SkeletonTitle, SkeletonText } from '@/components/Skeleton';
import { TMDBMovie, TMDBCast } from '@/types/tmdb';
import { movieAPI } from '@/utils/api';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 32px;
  position: relative;
  color: #FFFFFF;

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
  color: #FFFFFF;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const Metadata = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);

  & > strong {
    color: #FFFFFF;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const Overview = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    flex-direction: column;
  }
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
  min-height: 44px; // Better touch target
  
  @media (max-width: 768px) {
    padding: 8px 20px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 6px 16px;
    font-size: 0.8rem;
  }
`;

const BackButton = styled(Button)`
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  color: #000000;
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #0099CC 0%, #00D4FF 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.4);
  }
`;

const FavoriteButton = styled(Button)<{ $isFavorite: boolean }>`
  background: ${({ $isFavorite }) => 
    $isFavorite ? 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $isFavorite }) => $isFavorite ? '#FFFFFF' : '#FFFFFF'};
  border: 1px solid ${({ $isFavorite }) => $isFavorite ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(20px);

  &:hover {
    background: ${({ $isFavorite }) => $isFavorite ? 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)' : 'rgba(0, 212, 255, 0.15)'};
    border-color: ${({ $isFavorite }) => $isFavorite ? 'transparent' : 'rgba(0, 212, 255, 0.4)'};
    transform: translateY(-2px);
  }
`;

const SimilarMoviesSection = styled.div`
  margin-top: 40px;
`;

const SimilarMoviesTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #FFFFFF;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const SimilarMoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
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
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const CastCard = styled.div`
  flex: 0 0 auto;
  width: 100px;
  text-align: center;
  
  @media (max-width: 480px) {
    width: 80px;
  }
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
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
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
        console.log(`Fetching movie details for ID: ${id}`); // Debug
        
        // Fetch movie details from our backend API
        const movieData = await movieAPI.getMovieDetails(Number(id));
        console.log('Movie data received:', movieData); // Debug
        setMovie(movieData);
        
        // Check if movie is in favorites
        if (movieData.is_favorite) {
          setIsFavoriteMovie(true);
        }

        // Set cast if available
        if (movieData.credits?.cast) {
          setCast(movieData.credits.cast.slice(0, 10)); // Top 10 cast
        }

        // For now, we'll skip similar movies since we don't have that endpoint yet
        // TODO: Add similar movies endpoint to backend
        
      } catch (err: any) {
        console.error('Error fetching movie details:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          id: id
        }); // Debug
        setError(err.message || 'Failed to fetch movie details');
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

  const formatRating = (rating: number | null) => {
    if (rating === null || rating === undefined) return 'Not rated';
    return `${rating.toFixed(1)}/10`;
  };

  const handleFavorite = async () => {
    if (!movie) return;
    
    try {
      if (isFavoriteMovie) {
        // Remove from favorites
        if (movie.favorite_id) {
          await movieAPI.removeFromFavorites(movie.favorite_id);
        } else {
          await movieAPI.removeFromFavoritesByMovie(movie.tmdb_id);
        }
        setIsFavoriteMovie(false);
      } else {
        // Add to favorites
        await movieAPI.addToFavorites(movie.tmdb_id);
        setIsFavoriteMovie(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
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

  if (error || !movie) {
    return (
      <Container>
        <Title>Movie Not Found</Title>
        <p>{error || 'We couldn\'t find that movie.'}</p>
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
            {similarMovies.map((similar) => (
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