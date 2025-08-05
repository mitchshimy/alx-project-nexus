// components/Hero.tsx
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { movieAPI } from '@/utils/api';
import { TMDBMovie } from '@/types/tmdb';
import Link from 'next/link';
import { MdChevronLeft, MdChevronRight, MdPlayArrow } from 'react-icons/md';

// Modern cinematic Hero section with seamless header integration
const HeroSection = styled.section<{ $isSidebarOpen?: boolean }>`
  position: relative;
  height: 98vh;
  width: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '86vw' : '100vw')};
  display: flex;
  align-items: center;
  overflow: hidden;
  color: white;
  z-index: 1;
  margin-top: -80px;
  padding-top: 30px;
  left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '15px' : '10px')};
  right: 0;
  margin-left: -105px;
  
  @media (max-width: 768px) {
    height: 80vh;
    margin-top: -70px;
    padding-top: 70px;
    width: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '85vw' : '100vw')};
    left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '5px' : '-15px')};
    margin-left: -10px;
  }
  
  @media (max-width: 480px) {
    margin-top: -65px;
    padding-top: 65px;
    width: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '90vw' : '100vw')};
    left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '2px' : '-10px')};
    margin-left: -5px;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const CarouselSlide = styled.div<{ $isActive: boolean; $bg: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background-image: 
    linear-gradient(180deg, rgba(10, 10, 10, 0.6) 0%, rgba(10, 10, 10, 0.5) 20%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.3) 100%),
    url(${(props) => props.$bg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${({ $isActive }) => ($isActive ? '1' : '0')};
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const HeroContent = styled.div`
  width: 100%;
  margin: 0;
  padding: 0 4rem;
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 2;
  
  @media (max-width: 1024px) {
    padding: 0 2rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const ContentLeft = styled.div`
  flex: 1;
  max-width: 600px;
  animation: emergeFromShadow 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
  position: relative;
  z-index: 3;

  @keyframes emergeFromShadow {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
      filter: blur(10px);
    }
    50% {
      opacity: 0.7;
      transform: translateY(15px) scale(0.98);
      filter: blur(5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0px);
    }
  }
`;

const MovieTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(ellipse, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
    z-index: -1;
    opacity: 0;
    animation: glowPulse 3s ease-in-out infinite 1s;
  }
  
  @keyframes glowPulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  
  @media (max-width: 1024px) {
    font-size: 3rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const MovieMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  animation: slideInFromLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 193, 7, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  backdrop-filter: blur(10px);
  color: #FFC107;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.2);
`;

const QualityBadge = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
`;

const MetadataItem = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
`;

const MovieSynopsis = styled.p`
  font-size: 1.1rem;
    line-height: 1.6;
  margin-bottom: 2.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  max-width: 500px;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1s both;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const WatchButton = styled.button`
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000;
    cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  position: relative;
  overflow: hidden;
  animation: buttonEmerge 1s cubic-bezier(0.4, 0, 0.2, 1) 1.2s both;

  @keyframes buttonEmerge {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

    &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 212, 255, 0.4);
    background: linear-gradient(135deg, #0099CC 0%, #00D4FF 100%);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
`;

const NavigationButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $direction }) => ($direction === 'left' ? 'right: 2rem' : 'right: 2rem')};
  ${({ $direction }) => ($direction === 'left' ? 'transform: translateY(-50%) translateX(-4rem)' : 'transform: translateY(-50%)')};
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
    color: #00D4FF;
    transform: ${({ $direction }) => 
      $direction === 'left' 
        ? 'translateY(-50%) translateX(-4rem) scale(1.1)' 
        : 'translateY(-50%) scale(1.1)'};
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const CarouselIndicators = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 5;

  @media (max-width: 768px) {
    bottom: 2rem;
  }
`;

const Indicator = styled.button<{ $isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${({ $isActive }) => ($isActive ? '#00D4FF' : 'rgba(255, 255, 255, 0.3)')};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #00D4FF;
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    width: 10px;
    height: 10px;
  }
`;



interface HeroProps {
  isSidebarOpen?: boolean;
}

const Hero = ({ isSidebarOpen = false }: HeroProps) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getMovies({ type: 'trending', page: 1 });
        
        // Check if response has error property
        if (res && res.error) {
          console.error('Error fetching movies:', res.error);
          return;
        }
        
        if (res?.results?.length > 0) {
          setMovies(res.results.slice(0, 5)); // Get top 5 movies
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      try {
        const genresData = await movieAPI.getGenres();
        if (Array.isArray(genresData)) {
          setGenres(genresData);
        } else if (genresData && Array.isArray(genresData.genres)) {
          setGenres(genresData.genres);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchTopMovies();
    fetchGenres();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance carousel every 8 seconds (reduced frequency for better performance)
  useEffect(() => {
    if (movies.length === 0) return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only auto-advance if user doesn't prefer reduced motion
    if (!prefersReducedMotion) {
      const interval = setInterval(() => {
        nextSlide();
      }, 8000); // Increased from 5000ms to 8000ms

      return () => clearInterval(interval);
    }
  }, [movies.length, nextSlide]);

  if (loading || movies.length === 0) {
    return (
      <HeroSection $isSidebarOpen={isSidebarOpen}>
        <CarouselContainer>
          <CarouselSlide
            $isActive={true}
            $bg="/images/shimy.png"
          >
            <HeroContent>
              <ContentLeft>
                <MovieTitle>Welcome to Shimy Movies</MovieTitle>
                <MovieSynopsis>Loading the latest trending movies...</MovieSynopsis>
              </ContentLeft>
            </HeroContent>
          </CarouselSlide>
        </CarouselContainer>
      </HeroSection>
    );
  }

  const currentMovie = movies[currentIndex];

  const releaseYear = currentMovie?.release_date 
    ? new Date(currentMovie.release_date).getFullYear() 
    : 'N/A';

  const rating = currentMovie?.vote_average 
    ? currentMovie.vote_average.toFixed(1) 
    : 'N/A';

  // Get real runtime or show N/A if not available
  const duration = currentMovie?.runtime 
    ? `${currentMovie.runtime} min` 
    : 'N/A';

  // Convert genre ID to actual genre name
  const getGenreName = (genreId: number) => {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : 'Unknown';
  };

  const genre = currentMovie?.genre_ids?.[0] 
    ? getGenreName(currentMovie.genre_ids[0])
    : 'N/A';

  return (
    <HeroSection $isSidebarOpen={isSidebarOpen}>
      <CarouselContainer>
        {movies.map((movie, index) => (
          <CarouselSlide
            key={movie.id}
            $isActive={index === currentIndex}
            $bg={movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : 'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=1920&q=80'
            }
          />
        ))}

        <NavigationButton $direction="left" onClick={prevSlide}>
          <MdChevronLeft size={24} />
        </NavigationButton>

        <NavigationButton $direction="right" onClick={nextSlide}>
          <MdChevronRight size={24} />
        </NavigationButton>

      <HeroContent>
          <ContentLeft>
            <MovieTitle>{currentMovie.title}</MovieTitle>
            <MovieMetadata>
              <RatingBadge>
                ⭐ {rating}
              </RatingBadge>
              <QualityBadge>HD</QualityBadge>
              {/* <MetadataItem>{duration}</MetadataItem> */}
              <MetadataItem>{genre}</MetadataItem>
              <MetadataItem>{releaseYear}</MetadataItem>
            </MovieMetadata>
            <MovieSynopsis>
              {currentMovie.overview?.slice(0, 200)}...
            </MovieSynopsis>
            <Link href={`/movies/${currentMovie.tmdb_id}`} passHref>
              <WatchButton>
                <MdPlayArrow size={24} />
                Watch Now
              </WatchButton>
        </Link>
          </ContentLeft>
      </HeroContent>

        <CarouselIndicators>
          {movies.map((_, index) => (
            <Indicator
              key={index}
              $isActive={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </CarouselIndicators>
      </CarouselContainer>
    </HeroSection>
  );
};

export default Hero;