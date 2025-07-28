// components/Hero.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getTrendingMovies } from '@/utils/tmdbClient';
import { TMDBMovie } from '@/types/tmdb';
import Link from 'next/link';


// ✅ Use transient prop: `$bg`
const HeroSection = styled.section<{ $bg: string }>`
  position: relative;
  height: 90vh;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  color: white;
  background-image: 
    linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.2)),
    url(${(props) => props.$bg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media (max-width: 768px) {
    height: 70vh;
    padding: 1rem;
  }
`;

const HeroContent = styled.div`
  max-width: 700px;
  z-index: 2;

  h1 {
    font-size: 3.5rem;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    color: #ddd;
  }

  button {
    background-color: #ff0055;
    border: none;
    padding: 0.8rem 1.6rem;
    border-radius: 10px;
    font-size: 1rem;
    color: white;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background-color: #e6004c;
    }
  }
`;

const Hero = () => {
  const [topMovie, setTopMovie] = useState<TMDBMovie | null>(null);

  useEffect(() => {
    const fetchTopMovie = async () => {
      const res = await getTrendingMovies();
      if (res.results.length > 0) {
        setTopMovie(res.results[0]);
      }
    };
    fetchTopMovie();
  }, []);

  const backdropUrl = topMovie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${topMovie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=1920&q=80';
 // fallback background

  return (
    <HeroSection $bg={backdropUrl}>
      <HeroContent>
        <h1>{topMovie?.title || 'Discover Movies'}</h1>
        <p>{topMovie?.overview?.slice(0, 180) || 'Find trending, recommended, and highly-rated movies tailored to you.'}</p>
        <Link href={`/movies/${topMovie?.id}`} passHref>
        <button>Start Watching</button>
        </Link>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero;
