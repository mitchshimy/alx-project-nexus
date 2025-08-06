import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { movieAPI } from '@/utils/api';
import MovieCard from '@/components/MovieCard';


const Section = styled.section<{ isSidebarOpen?: boolean }>`
  padding: 2rem;
  max-width: ${({ isSidebarOpen }) => 
    isSidebarOpen ? 'calc(100vw - 320px)' : '1200px'
  };
  margin: ${({ isSidebarOpen }) => 
    isSidebarOpen ? '20px' : '40px auto'
  };
  
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
  
  @media (min-width: 1920px) {
    max-width: ${({ isSidebarOpen }) => 
      isSidebarOpen ? 'calc(100vw - 400px)' : '1400px'
    };
    margin: ${({ isSidebarOpen }) => 
      isSidebarOpen ? '40px' : '60px auto'
    };
    padding: 3rem;
  }
  
  @media (min-width: 2560px) {
    max-width: ${({ isSidebarOpen }) => 
      isSidebarOpen ? 'calc(100vw - 500px)' : '1600px'
    };
    margin: ${({ isSidebarOpen }) => 
      isSidebarOpen ? '60px' : '80px auto'
    };
    padding: 4rem;
  }
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

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
    background: linear-gradient(135deg, #00E6FF 0%, #00B3E6 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TipsContainer = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const TipsTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #00D4FF;
  font-weight: 600;
`;

const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0.5rem 0;
    color: #cccccc;
    font-size: 0.95rem;
    line-height: 1.5;
    position: relative;
    padding-left: 1.5rem;

    &:before {
      content: '•';
      color: #00D4FF;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
  }
`;

export default function Anime({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const [movies, setMovies] = useState<Array<{
    id: number;
    tmdb_id?: number;
    title?: string;
    poster_path?: string | null;
    vote_average?: number;
    release_date?: string;
    genre_ids?: number[];
  }>>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<Array<{
    id: number;
    name: string;
  }>>([]);

  const loadMoreMovies = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await movieAPI.getMovies({ type: 'movies', page });
      
      if (data?.results?.length) {
        // Filter for animation genre (ID: 16)
        const animeMovies = data.results.filter((movie: {
          id: number;
          genre_ids?: number[];
        }) => 
          movie.genre_ids?.includes(16)
        );
        
        setMovies(prev => {
          const existingIds = new Set(prev.map((m: { id: number }) => m.id));
          const uniqueNew = animeMovies.filter((m: { id: number }) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
        
        setPage(prev => prev + 1);
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading anime movies:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page]); // Only depend on page, not loading/hasMore to prevent cycles

  useEffect(() => {
    loadMoreMovies();
  }, []); // Only run once on mount

  useEffect(() => {
    const onScroll = () => {
      // Find the footer element
      const footer = document.querySelector('footer');
      
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Trigger when the beginning of the footer is visible (top of footer reaches bottom of viewport)
        const footerReached = footerRect.top <= windowHeight;
        
        if (footerReached && !loading && hasMore) {
          loadMoreMovies();
        }
      } else {
        // Fallback to original logic if footer is not found
        const scrolledToBottom =
          window.innerHeight + window.scrollY >= document.body.scrollHeight - 90;

        if (scrolledToBottom && !loading && hasMore) {
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
  }, [loading, hasMore, loadMoreMovies]); // Include loadMoreMovies to ensure it can be called

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await movieAPI.getGenres();
        setGenres(data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    fetchGenres();
  }, []);

  const filteredMovies = movies.filter(item => {
    const matchesGenre = filter === 'all' || item.genre_ids?.includes(Number(filter));
    return matchesGenre;
  });

  return (
    <>
      <Section isSidebarOpen={isSidebarOpen}>
        <SectionTitle>🎌 Anime</SectionTitle>

        <FilterContainer>
          <GenreSelect value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </GenreSelect>
        </FilterContainer>

        {initialLoading ? (
          <Loading>Loading anime...</Loading>
        ) : (
          <>
            <MovieGrid>
              {filteredMovies.map(item => (
                <MovieCard key={item.id} movie={{
                  tmdb_id: item.tmdb_id || item.id,
                  title: item.title,
                  poster_path: item.poster_path,
                  vote_average: item.vote_average,
                  release_date: item.release_date
                }} />
              ))}
            </MovieGrid>

            {loading && <Loading>Loading more anime...</Loading>}
            
            {!loading && hasMore && (
              <LoadMoreButton onClick={loadMoreMovies}>
                Load More Anime
              </LoadMoreButton>
            )}
          </>
        )}

        {!initialLoading && movies.length > 0 && (
          <TipsContainer data-tips-container>
            <TipsTitle>💡 Anime Discovery Tips</TipsTitle>
            <TipsList>
              <li>Use the genre filter to explore specific types of anime</li>
              <li>Click on any anime card to see detailed information and trailers</li>
              <li>Add anime to your favorites or watchlist for later viewing</li>
              <li>Scroll down to automatically load more anime</li>
              <li>Check out the Trending page for what&apos;s popular right now</li>
            </TipsList>
          </TipsContainer>
        )}
      </Section>
    </>
  );
} 