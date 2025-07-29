import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Hero from '@/components/Hero';
import MovieCard from '@/components/MovieCard';
import { getTrendingMovies, getGenres } from '@/utils/tmdbClient';
import { TMDBMovie, Genre } from '@/types/tmdb';

const Section = styled.section`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #f0f0f0;
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const WelcomeSection = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #f0f0f0;
  font-weight: 700;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    color: #e50914;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #ccc;
    line-height: 1.6;
  }
`;

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const data = await getTrendingMovies(1);
        if (data?.results?.length) {
          setFeaturedMovies(data.results.slice(0, 6)); // Show only 6 featured movies
        }
      } catch (err) {
        console.error('Error loading featured content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  return (
    <>
      <Hero />

      <WelcomeSection>
        <WelcomeTitle>Welcome to SHIMY</WelcomeTitle>
        <WelcomeSubtitle>
          Discover the world of cinema with our curated collection of movies, TV shows, and trending content. 
          From blockbusters to hidden gems, find your next favorite entertainment.
        </WelcomeSubtitle>
      </WelcomeSection>

      <Section>
        <SectionTitle>🎬 Featured This Week</SectionTitle>
        {loading ? (
          <Loading>Loading featured content...</Loading>
        ) : (
          <MovieGrid>
            {featuredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </MovieGrid>
        )}
      </Section>

      <Section>
        <SectionTitle>✨ What's New</SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <h3>🎭 Movies</h3>
            <p>Explore the latest movies from Hollywood and around the world. From action-packed blockbusters to thought-provoking dramas.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>📺 TV Shows</h3>
            <p>Discover binge-worthy TV series, from gripping dramas to hilarious comedies and everything in between.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>🔥 Trending</h3>
            <p>Stay up to date with what's hot right now. See what everyone is watching and talking about.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>⭐ Favorites</h3>
            <p>Keep track of your favorite movies and shows. Build your personal collection of must-watch content.</p>
          </FeatureCard>
        </FeatureGrid>
      </Section>
    </>
  );
}
