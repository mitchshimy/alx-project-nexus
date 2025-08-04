import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { movieAPI } from '@/utils/api';
import MovieCard from '@/components/MovieCard';


const Section = styled.section<{ isSidebarOpen?: boolean }>`
  padding: 2rem;
  max-width: ${({ isSidebarOpen }) => 
    isSidebarOpen ? 'calc(100vw - 320px)' : 'calc(100vw - 120px)'
  };
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    max-width: ${({ isSidebarOpen }) => 
      isSidebarOpen ? 'calc(100vw - 300px)' : 'calc(100vw - 100px)'
    };
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #f0f0f0;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 69, 0, 0.1), rgba(255, 69, 0, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(255, 69, 0, 0.2);
`;

const DescriptionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #FF4500;
  font-weight: 600;
`;

const DescriptionText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #cccccc;
  margin-bottom: 1rem;
`;



const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.8rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const GenreSelect = styled.select`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;

  option {
    background: #1a1a2e;
    color: #f0f0f0;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 2rem auto;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00D4FF, #0099CC);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #0099CC, #007799);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const TipsContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 4px solid #00D4FF;
`;

const TipsTitle = styled.h4`
  color: #FF4500;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const TipsList = styled.ul`
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.5;
  padding-left: 1rem;
`;

const TrendingBadge = styled.span`
  background: linear-gradient(45deg, #FF4500, #FF6347);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
  display: inline-block;
`;

const SearchResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
`;

const SearchTerm = styled.div`
  font-size: 1.2rem;
  color: #e0e0e0;
  margin-bottom: 2rem;
  text-align: center;
`;

const ResultsCount = styled.span`
  color: #ccc;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const ClearSearchButton = styled.button`
  background: #e50914;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: #b2070f;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
`;

export default function Trending({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]); // Changed type to any[] as TMDBMovie is removed
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<any[]>([]); // Changed type to any[]
  const [isSearchMode, setIsSearchMode] = useState(false);



  // Initialize search term from URL query parameter
  useEffect(() => {
    if (router.query.search) {
      const searchQuery = router.query.search as string;
      setSearchTerm(searchQuery);
      setIsSearchMode(true);
      // Reset movies when search changes
      setMovies([]);
      setPage(1);
      setHasMore(true);
    } else {
      setIsSearchMode(false);
      setSearchTerm('');
    }
  }, [router.query.search]);

  const loadMoreMovies = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let data;
      
      if (isSearchMode && searchTerm.trim()) {
        const searchData = await movieAPI.searchMovies(searchTerm.trim(), page);
        
        const filteredResults = searchData.results
          .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item: any) => ({
            ...item,
            title: item.title || item.name || 'Unknown Title',
            release_date: item.release_date || item.first_air_date || '',
          })) as any[]; // Changed type to any[]
        data = {
          ...searchData,
          results: filteredResults,
        };
      } else {
        // Use trending movies API
        data = await movieAPI.getMovies({ type: 'trending', page });
      }

      // Check if response has error property
      if (data && data.error) {
        console.error('API error:', data.error);
        setHasMore(false);
        return;
      }
      
      if (data?.results?.length) {
        setMovies(prev => {
          const existingIds = new Set(prev.map((m: any) => m.id));
          const uniqueNew = data.results.filter((m: any) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
        setPage(prev => prev + 1);
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading movies:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading, hasMore, page, isSearchMode, searchTerm]);

  // Infinite scroll effect
  useEffect(() => {
    const onScroll = () => {
      // Find the tips container element (near the end of content)
      const tipsContainer = document.querySelector('[data-tips-container]');
      
      if (tipsContainer) {
        const tipsRect = tipsContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Trigger when the tips container is visible (within 300px of viewport)
        const tipsReached = tipsRect.top <= windowHeight + 300;
        
        if (tipsReached && !loading && hasMore) {
          loadMoreMovies();
        }
      } else {
        // Fallback to original logic if tips container is not found
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
          loadMoreMovies();
        }
      }
    };

    // Use throttled scroll listener for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        setTimeout(() => {
          onScroll();
          ticking = false;
        }, 100); // Use setTimeout instead of requestAnimationFrame for better performance
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [loadMoreMovies, loading, hasMore]);

  // Load initial movies
  useEffect(() => {
    loadMoreMovies();
  }, [isSearchMode, searchTerm]);

  const fetchGenres = async () => {
    try {
      const genresData = await movieAPI.getGenres();
      // Ensure genres is always an array
      if (Array.isArray(genresData)) {
        setGenres(genresData);
      } else if (genresData && Array.isArray(genresData.genres)) {
        setGenres(genresData.genres);
      } else {
        console.warn('Unexpected genres data structure:', genresData);
        setGenres([]);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
      setGenres([]);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleClearSearch = () => {
    router.push('/trending');
  };



  const filteredMovies = filter === 'all' 
    ? movies 
    : movies.filter(movie => 
        movie.genre_ids?.includes(parseInt(filter))
      );

  return (
    <Section isSidebarOpen={isSidebarOpen}>
      {isSearchMode ? (
        <SearchResultsHeader>
          <div>
            <SearchTerm>
              Search Results: &ldquo;{searchTerm}&rdquo;
            </SearchTerm>
            <ResultsCount>{filteredMovies.length} results found</ResultsCount>
          </div>
          <ClearSearchButton onClick={handleClearSearch}>
            Clear Search
          </ClearSearchButton>
        </SearchResultsHeader>
      ) : (
        <>
          <SectionTitle>
            🔥 Trending Now
            <TrendingBadge>LIVE</TrendingBadge>
          </SectionTitle>
          
          <Description>
            <DescriptionTitle>What&apos;s Hot Right Now</DescriptionTitle>
            <DescriptionText>
              Stay up-to-date with the most popular movies and TV shows that everyone is talking about. 
              These trending titles are based on real-time popularity data and social media buzz. 
              From viral sensations to critically acclaimed masterpieces - discover what&apos;s capturing the world&apos;s attention!
            </DescriptionText>
          </Description>



          <FilterContainer>
            <GenreSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Genres</option>
              {Array.isArray(genres) && genres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </GenreSelect>
          </FilterContainer>
        </>
      )}

      <MovieGrid>
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={{
            tmdb_id: movie.tmdb_id || movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date
          }} />
        ))}
      </MovieGrid>

      {loading && <Loading>Loading more movies...</Loading>}
      
      {!loading && hasMore && (
        <LoadMoreButton onClick={loadMoreMovies}>
          Load More Trending
        </LoadMoreButton>
      )}

      {!initialLoading && movies.length > 0 && !isSearchMode && (
        <TipsContainer data-tips-container>
          <TipsTitle>💡 Trending Discovery Tips</TipsTitle>
          <TipsList>
            <li>Trending content updates in real-time based on popularity and social media buzz</li>
            <li>Use the genre filter to focus on specific types of trending content</li>
            <li>Click on any item to see detailed information and trailers</li>
            <li>Add trending items to your favorites or watchlist for later</li>
            <li>Scroll down to see more trending content automatically</li>
            <li>Check back regularly as trending content changes frequently</li>
          </TipsList>
        </TipsContainer>
      )}
    </Section>
  );
} 