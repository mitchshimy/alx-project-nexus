import { useState, useEffect, useCallback } from 'react';
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
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
`;

const DescriptionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #FFD700;
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

const TipsContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 4px solid #FFD700;
`;

const TipsTitle = styled.h4`
  color: #FFD700;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const TipsList = styled.ul`
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.5;
  padding-left: 1rem;
`;

const TopRatedBadge = styled.span`
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #1a1a2e;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
  display: inline-block;
`;

export default function TopIMDB({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<any[]>([]);


  const loadMoreMovies = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await movieAPI.getMovies({ type: 'top_rated', page });
      
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
  }, [hasMore, page]);

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
  }, [loadMoreMovies, loading, hasMore]);

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


  const filteredMovies = movies.filter(movie => {
    const matchesGenre = filter === 'all' || movie.genre_ids?.includes(Number(filter));
    return matchesGenre;
  });

  return (
    <>
      <Section isSidebarOpen={isSidebarOpen}>
        <SectionTitle>
          ⭐ Top IMDb Movies
          <TopRatedBadge>CRITICALLY ACCLAIMED</TopRatedBadge>
        </SectionTitle>
        
        <Description>
          <DescriptionTitle>Critically Acclaimed Masterpieces</DescriptionTitle>
          <DescriptionText>
            Discover the highest-rated movies according to IMDb&apos;s comprehensive rating system. 
            These films represent the pinnacle of cinematic excellence, chosen by millions of viewers 
            and critics worldwide. From timeless classics to modern masterpieces, these top-rated 
            movies have earned their place in cinematic history.
          </DescriptionText>
        </Description>



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
          <Loading>Loading top-rated movies...</Loading>
        ) : (
          <>
            <MovieGrid>
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={{
                  tmdb_id: movie.tmdb_id || movie.id,
                  title: movie.title,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  release_date: movie.release_date
                }} />
              ))}
            </MovieGrid>

            {loading && <Loading>Loading more top-rated movies...</Loading>}
          </>
        )}

        {!initialLoading && movies.length > 0 && (
          <TipsContainer>
            <TipsTitle>💡 Top-Rated Discovery Tips</TipsTitle>
            <TipsList>
              <li>These movies are ranked by IMDb&apos;s comprehensive rating system</li>
              <li>Use the genre filter to explore top-rated movies in specific categories</li>
              <li>Click on any movie to see detailed information and trailers</li>
              <li>Add top-rated movies to your favorites or watchlist</li>
              <li>Scroll down to automatically load more top-rated movies</li>
              <li>These ratings are based on millions of user votes and reviews</li>
            </TipsList>
          </TipsContainer>
        )}
      </Section>
    </>
  );
} 