import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import { movieAPI } from '@/utils/api';
import { 
  MdMovie, 
  MdTrendingUp, 
  MdStar, 
  MdFavorite, 
  MdSearch, 
  MdPlayArrow 
} from 'react-icons/md';

// Dynamically import MovieCard to reduce initial bundle size
const MovieCard = dynamic(() => import('@/components/MovieCard'), {
  ssr: true,
  loading: () => (
    <div style={{ 
      width: '180px', 
      height: '270px', 
      background: 'linear-gradient(90deg, #1E1E1E 25%, #2A2A2A 50%, #1E1E1E 75%)',
      borderRadius: '8px',
      animation: 'shimmer 1.5s infinite'
    }} />
  )
});

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
  max-width: 1200px;
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
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(106, 17, 203, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
  }
  
  @keyframes gradientFlow {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
  }
  
  @media (max-width: 1200px) {
    max-width: 1000px;
    padding: 5rem 1.5rem;
    margin: 2.5rem auto;
  }
  
  @media (max-width: 900px) {
    max-width: 100%;
    padding: 4rem 1.5rem;
    margin: 2rem 1rem;
    border-radius: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
    margin: 1.5rem 0.5rem;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 0.75rem;
    margin: 1rem 0.25rem;
    border-radius: 12px;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #6a11cb 50%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  animation: titleGlow 3s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 3px;
    animation: titleUnderline 2s ease-in-out infinite;
  }
  
  @keyframes titleGlow {
    0%, 100% { filter: drop-shadow(0 0 20px rgba(106, 17, 203, 0.3)); }
    50% { filter: drop-shadow(0 0 30px rgba(106, 17, 203, 0.6)); }
  }
  
  @keyframes titleUnderline {
    0%, 100% { width: 100px; opacity: 0.7; }
    50% { width: 150px; opacity: 1; }
  }
  
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

const NoResults = styled.div`
  text-align: center;
  color: #e0e0e0;
  font-size: 1.2rem;
  margin: 2rem 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 800px;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    max-width: 100%;
    padding: 0 1rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
    margin: 1.5rem 0;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(106, 17, 203, 0.3);
    box-shadow: 0 8px 32px rgba(106, 17, 203, 0.2);
  }
  
  @media (max-width: 900px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #6a11cb;
  filter: drop-shadow(0 0 10px rgba(106, 17, 203, 0.5));
  
  @media (max-width: 900px) {
    font-size: 2.25rem;
    margin-bottom: 0.875rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.75rem;
    margin-bottom: 0.625rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  
  @media (max-width: 900px) {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.375rem;
  }
  
  @media (max-width: 600px) {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  
  @media (max-width: 900px) {
    font-size: 0.85rem;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    line-height: 1.4;
  }
  
  @media (max-width: 600px) {
    font-size: 0.75rem;
    line-height: 1.3;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    line-height: 1.2;
  }
`;

export default function Home({ isSidebarOpen = false }: { isSidebarOpen?: boolean }) {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for preloaded content first
  const checkPreloadedContent = () => {
    if (typeof window !== 'undefined') {
      const cachedContent = sessionStorage.getItem('shimy_cached_content');
      if (cachedContent) {
        try {
          const cached = JSON.parse(cachedContent);
          if (cached.trending?.results && cached.topRated?.results && cached.popular?.results) {
            console.log('Using preloaded content from cache');
            setFeaturedMovies(cached.trending.results.slice(0, 21));
            setTrendingMovies(cached.trending.results.slice(0, 21));
            setTopRatedMovies(cached.topRated.results.slice(0, 21));
            setLoading(false);
            return true;
          }
        } catch (e) {
          console.error('Failed to parse cached content:', e);
        }
      }
    }
    return false;
  };

  const loadFeaturedContent = async () => {
    try {
      console.log('Loading featured content...');
      const data = await movieAPI.getMovies({ type: 'trending', page: 1 });
      console.log('Featured content response:', data);
      if (data?.results?.length) {
        setFeaturedMovies(data.results.slice(0, 21));
        console.log('Set featured movies:', data.results.slice(0, 21));
      } else {
        console.log('No featured movies data');
      }
    } catch (err) {
      console.error('Error loading featured content:', err);
    }
  };



  // Optimized content loading - use single trending call for both featured and trending
  const loadAllContentOptimized = async () => {
    try {
      console.log('Loading all content with optimization...');
      
      // Load trending and top rated in parallel
      const [trendingData, topRatedData] = await Promise.all([
        movieAPI.getMovies({ type: 'trending', page: 1 }),
        movieAPI.getMovies({ type: 'top_rated', page: 1 })
      ]);
      
      if (trendingData?.results?.length) {
        const trendingMovies = trendingData.results.slice(0, 21);
        setFeaturedMovies(trendingMovies);
        setTrendingMovies(trendingMovies);
        console.log('Set featured and trending movies from single API call');
      }
      
      if (topRatedData?.results?.length) {
        setTopRatedMovies(topRatedData.results.slice(0, 21));
        console.log('Set top rated movies');
      }
      
    } catch (err) {
      console.error('Error loading optimized content:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadAllContent = async () => {
      const startTime = performance.now();
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting to load all content...');
        
        // First, check if we have preloaded content
        if (checkPreloadedContent()) {
          const endTime = performance.now();
          console.log(`Content loaded from cache in ${(endTime - startTime).toFixed(2)}ms`);
          return; // Content already loaded from cache
        }
        
        // Test API connectivity first
        try {
          const testResponse = await movieAPI.getMovies({ type: 'trending', page: 1 });
          console.log('API test response received');
          if (testResponse.error) {
            throw new Error(`API test failed: ${testResponse.error}`);
          }
        } catch (apiTestError) {
          console.error('API connectivity test failed:', apiTestError);
          setError('Cannot connect to the server. Please make sure the backend is running.');
          setLoading(false);
          return;
        }
        
        // Use optimized content loading
        await loadAllContentOptimized();
        
        const endTime = performance.now();
        console.log(`All content loaded successfully in ${(endTime - startTime).toFixed(2)}ms`);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAllContent();
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
                style={{ width: '100%' }}
              />
            </div>
            <div className="progress-text">
              Loading...
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
          
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>
                <MdMovie />
              </FeatureIcon>
              <FeatureTitle>Vast Collection</FeatureTitle>
              <FeatureDescription>
                Access thousands of movies and TV shows from classics to the latest releases
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <MdTrendingUp />
              </FeatureIcon>
              <FeatureTitle>Trending Now</FeatureTitle>
              <FeatureDescription>
                Stay updated with what&apos;s popular and trending in the entertainment world
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <MdStar />
              </FeatureIcon>
              <FeatureTitle>Top Rated</FeatureTitle>
              <FeatureDescription>
                Discover critically acclaimed content with high ratings and reviews
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <MdFavorite />
              </FeatureIcon>
              <FeatureTitle>Personal Lists</FeatureTitle>
              <FeatureDescription>
                Create your own watchlist and favorites for personalized experience
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <MdSearch />
              </FeatureIcon>
              <FeatureTitle>Smart Search</FeatureTitle>
              <FeatureDescription>
                Find exactly what you&apos;re looking for with our advanced search features
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <MdPlayArrow />
              </FeatureIcon>
              <FeatureTitle>Instant Access</FeatureTitle>
              <FeatureDescription>
                Get detailed information, trailers, and cast details instantly
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
          
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
              <NoResults>
                No featured movies available
              </NoResults>
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
              <NoResults>
                No trending movies available
              </NoResults>
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
              <NoResults>
                No top rated movies available
              </NoResults>
            )}
          </MovieGrid>
        </Section>
      </ContentWrapper>
    </PageContainer>
  );
}