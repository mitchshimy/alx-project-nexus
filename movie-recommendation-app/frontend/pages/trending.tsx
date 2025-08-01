import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import MovieCard from '@/components/MovieCard';
import { movieAPI } from '@/utils/api';
import { TMDBMovie, Genre, TMDBSearchResult } from '@/types/tmdb';

const Section = styled.section`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    padding: 1.5rem;
    max-width: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #f0f0f0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }
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
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
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

const SearchTerm = styled.span`
  font-size: 1.1rem;
  color: #e50914;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
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

export default function Trending() {
  const router = useRouter();
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<Genre[]>([]);
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
          .filter((item: TMDBSearchResult) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item: TMDBSearchResult) => ({
            ...item,
            title: item.title || item.name || 'Unknown Title',
            release_date: item.release_date || item.first_air_date || '',
          })) as TMDBMovie[];
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
          const existingIds = new Set(prev.map((m: TMDBMovie) => m.id));
          const uniqueNew = data.results.filter((m: TMDBMovie) => !existingIds.has(m.id));
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
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
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
    <Section>
      {isSearchMode ? (
        <SearchResultsHeader>
          <div>
            <SearchTerm>Search results for: "{searchTerm}"</SearchTerm>
            <ResultsCount>{filteredMovies.length} results found</ResultsCount>
          </div>
          <ClearSearchButton onClick={handleClearSearch}>
            Clear Search
          </ClearSearchButton>
        </SearchResultsHeader>
      ) : (
        <>
          <SectionTitle>Trending Now</SectionTitle>
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
    </Section>
  );
} 