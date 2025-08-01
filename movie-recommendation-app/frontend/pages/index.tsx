import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Hero from '@/components/Hero';
import MovieCard from '@/components/MovieCard';
import { movieAPI } from '@/utils/api';
import { TMDBMovie, Genre } from '@/types/tmdb';


// Modern glassmorphism and neumorphism inspired design
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f15 0%, #1a1a24 100%);
`;

const ContentWrapper = styled.main`
  padding-top: 0;
  min-height: 100vh;
`;

const Section = styled.section`
  padding: 4rem 2rem;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 3px;
  }
`;

const ViewAllButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 2000px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  @media (max-width: 1600px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
 
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.9rem;
  }
  
  @media (max-width: 700px) {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.8rem;
  }
  
  @media (max-width: 500px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.7rem;
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  margin: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  div {
    color: #fff;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }
  
  .progress-container {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    transition: width 0.4s ease-out;
  }
  
  .progress-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }
`;

const WelcomeSection = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  max-width: 1000px;
  margin: 3rem auto;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 50%, #6a11cb 100%);
    animation: gradientFlow 3s linear infinite;
    background-size: 200% auto;
  }
  
  @keyframes gradientFlow {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 3.2rem;
  margin-bottom: 1.5rem;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2.5rem;
  line-height: 1.8;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(106, 17, 203, 0.4);
    
    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  margin: 2rem;
  backdrop-filter: blur(5px);
  color: #ff6b6b;
  
  button {
    background: rgba(239, 68, 68, 0.2);
    color: #ff6b6b;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 0.6rem 1.5rem;
    border-radius: 50px;
    margin-top: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #fff;
    }
  }
`;

export default function Home({ isSidebarOpen = false }: { isSidebarOpen?: boolean }) {
  const [featuredMovies, setFeaturedMovies] = useState<TMDBMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const router = useRouter();

  const loadSectionData = async (apiCall: () => Promise<any>, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await apiCall();
        
        if (response && response.error) {
          console.error(`API error on attempt ${attempt}:`, response.error);
          if (attempt === retries) {
            return [];
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        return response.results || [];
      } catch (error) {
        if (attempt === retries) {
          console.error(`Failed to load data after ${retries} attempts:`, error);
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const loadFeaturedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      const promises = [
        loadSectionData(() => movieAPI.getMovies({ type: 'movies', page: 1 })),
        loadSectionData(() => movieAPI.getMovies({ type: 'trending', page: 1 })),
        loadSectionData(() => movieAPI.getMovies({ type: 'top_rated', page: 1 }))
      ];

      const results = await Promise.allSettled(promises);
      setLoadingProgress(100);

      const [featured, trending, topRated] = results.map(result => 
        result.status === 'fulfilled' ? result.value : []
      );

      setFeaturedMovies(featured.slice(0, 22));
      setTrendingMovies(trending.slice(0, 22));
      setTopRatedMovies(topRated.slice(0, 22));

      if (results.every(result => result.status === 'rejected')) {
        setError('Unable to load content. Please check your connection and try again.');
      }

    } catch (error) {
      console.error('Error loading featured content:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const handleBrowseMovies = () => {
    router.push('/movies');
  };

  const handleRetry = () => {
    setError(null);
    loadFeaturedContent();
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper id="main-content" role="main">
          <Hero isSidebarOpen={isSidebarOpen} />
          <Loading>
            <div>Loading cinematic experience...</div>
            <div className="progress-container">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(loadingProgress + 20, 100)}%` }}
              />
            </div>
            <div className="progress-text">
              {Math.min(loadingProgress + 20, 100)}% loaded
            </div>
          </Loading>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentWrapper id="main-content" role="main">
          <Hero isSidebarOpen={isSidebarOpen} />
          <ErrorMessage>
            <div>{error}</div>
            <button onClick={handleRetry}>Try Again</button>
          </ErrorMessage>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper id="main-content" role="main">
        <Hero isSidebarOpen={isSidebarOpen} />
        
        <WelcomeSection>
          <WelcomeTitle>Discover Shimy Movies</WelcomeTitle>
          <WelcomeSubtitle>
            Explore the latest blockbusters, timeless classics, and hidden gems. 
            Curated collections to match your mood and taste.
          </WelcomeSubtitle>
          <CTAButton onClick={handleBrowseMovies}>
            Explore Collection
          </CTAButton>
        </WelcomeSection>

        <Section>
          <SectionHeader>
            <SectionTitle>Featured Movies</SectionTitle>
            <ViewAllButton onClick={handleBrowseMovies}>View All</ViewAllButton>
          </SectionHeader>
          <MovieGrid>
            {featuredMovies.length > 0 ? (
              <>
                {featuredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={{
                    tmdb_id: movie.tmdb_id || movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date
                  }} />
                ))}
                {/* Debug info - remove in production */}
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.3)', 
                  fontSize: '0.8rem',
                  padding: '10px'
                }}>
                  Showing {featuredMovies.length} featured movies
                </div>
              </>
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                No featured movies available
              </div>
            )}
          </MovieGrid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Trending Now</SectionTitle>
            <ViewAllButton onClick={handleBrowseMovies}>View All</ViewAllButton>
          </SectionHeader>
          <MovieGrid>
            {trendingMovies.length > 0 ? (
              <>
                {trendingMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={{
                    tmdb_id: movie.tmdb_id || movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date
                  }} />
                ))}
                {/* Debug info - remove in production */}
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.3)', 
                  fontSize: '0.8rem',
                  padding: '10px'
                }}>
                  Showing {trendingMovies.length} trending movies
                </div>
              </>
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                No trending movies available
              </div>
            )}
          </MovieGrid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Top Rated</SectionTitle>
            <ViewAllButton onClick={handleBrowseMovies}>View All</ViewAllButton>
          </SectionHeader>
          <MovieGrid>
            {topRatedMovies.length > 0 ? (
              <>
                {topRatedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={{
                    tmdb_id: movie.tmdb_id || movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date
                  }} />
                ))}
                {/* Debug info - remove in production */}
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.3)', 
                  fontSize: '0.8rem',
                  padding: '10px'
                }}>
                  Showing {topRatedMovies.length} top rated movies
                </div>
              </>
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                No top rated movies available
              </div>
            )}
          </MovieGrid>
        </Section>
      </ContentWrapper>
    </PageContainer>
  );
}