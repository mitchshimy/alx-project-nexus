import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import MovieCard from '@/components/MovieCard';
import { movieAPI } from '@/utils/api';
import { TMDBMovie, TMDBSearchResult } from '@/types/tmdb';

const SearchContainer = styled.div`
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

const SearchTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #FFD700;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const SearchSubtitle = styled.p`
  font-size: 1.2rem;
  color: #94A3B8;
  text-align: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #FFFFFF;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
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

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 1rem;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: #94A3B8;
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    padding: 2rem;
    font-size: 1rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? '#FFD700' : '#333'};
  background: ${props => props.active ? '#FFD700' : 'transparent'};
  color: ${props => props.active ? '#000' : '#FFD700'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-height: 44px; // Better touch target

  &:hover {
    background: ${props => props.active ? '#FFA500' : '#FFD700'};
    color: #000;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem;
  }
`;

const ResultCount = styled.div`
  text-align: center;
  color: #94A3B8;
  margin-bottom: 1rem;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

// Type for search results that includes media_type
type SearchResult = TMDBMovie & {
  media_type?: 'movie' | 'tv' | 'person';
};

export default function Search() {
  const router = useRouter();
  const { q: searchQuery } = router.query;
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [totalResults, setTotalResults] = useState(0);

  const loadSearchResults = useCallback(async (query: string, pageNum: number = 1, reset: boolean = false) => {
    if (!query || loading) return;

    setLoading(true);
    try {
      const data = await movieAPI.searchMovies(query, pageNum);
      
      if (data?.results?.length) {
        // Transform all results to match SearchResult format (don't filter here)
        const transformedResults = data.results.map((item: TMDBSearchResult) => ({
          ...item,
          title: item.title || item.name || 'Unknown Title',
          release_date: item.release_date || item.first_air_date || '',
        })) as SearchResult[];

        if (reset) {
          setSearchResults(transformedResults);
        } else {
          setSearchResults(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = transformedResults.filter(m => !existingIds.has(m.id));
            return [...prev, ...uniqueNew];
          });
        }

        setTotalResults(data.total_results || 0);
        setHasMore(pageNum < (data.total_pages || 1));
        setPage(pageNum + 1);
      } else {
        if (reset) {
          setSearchResults([]);
        }
        setHasMore(false);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Error searching:', err);
      if (reset) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Load initial search results
  useEffect(() => {
    if (searchQuery && typeof searchQuery === 'string') {
      // Reset all state for new search
      setSearchResults([]);
      setPage(1);
      setHasMore(true);
      setTotalResults(0);
      loadSearchResults(searchQuery, 1, true);
    }
  }, [searchQuery]);

  // Handle filter changes - just update the display, don't reload from API
  useEffect(() => {
    // Filter changes don't need to reload from API, just update the display
    // The filtering is done in the render section
  }, [filter]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
        if (!loading && hasMore && searchQuery && typeof searchQuery === 'string') {
          // Use the current page number for pagination
          loadSearchResults(searchQuery, page, false);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadSearchResults, loading, hasMore, page, searchQuery]);

  const handleFilterChange = (newFilter: 'all' | 'movie' | 'tv') => {
    setFilter(newFilter);
  };

  if (!searchQuery) {
    return (
      <SearchContainer>
        <SearchTitle>🔍 Search</SearchTitle>
        <SearchSubtitle>Enter a search term to find movies and TV shows</SearchSubtitle>
      </SearchContainer>
    );
  }

  const filteredResults = searchResults.filter((result: SearchResult) => {
    if (filter === 'all') return true;
    return result.media_type === filter;
  });

  return (
    <SearchContainer>
      <SearchTitle>🔍 Search Results</SearchTitle>
      <SearchSubtitle>
        Showing results for: <strong>"{searchQuery}"</strong>
      </SearchSubtitle>

      <FilterContainer>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => handleFilterChange('all')}
        >
          All ({searchResults.length})
        </FilterButton>
        <FilterButton 
          active={filter === 'movie'} 
          onClick={() => handleFilterChange('movie')}
        >
          Movies ({searchResults.filter(r => r.media_type === 'movie').length})
        </FilterButton>
        <FilterButton 
          active={filter === 'tv'} 
          onClick={() => handleFilterChange('tv')}
        >
          TV Shows ({searchResults.filter(r => r.media_type === 'tv').length})
        </FilterButton>
      </FilterContainer>

      <ResultsContainer>
        {loading && searchResults.length === 0 ? (
          <Loading>Searching for "{searchQuery}"...</Loading>
        ) : filteredResults.length > 0 ? (
          <>
            <ResultCount>
              Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` in ${filter === 'movie' ? 'Movies' : 'TV Shows'}`}
              {filter === 'all' && ` (${totalResults} total available)`}
            </ResultCount>
            <MovieGrid>
              {filteredResults.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </MovieGrid>
            {loading && <Loading>Loading more results...</Loading>}
          </>
        ) : (
          <NoResults>
            <div>No results found for "{searchQuery}"</div>
            <div style={{ marginTop: '1rem', fontSize: '1rem' }}>
              Try searching for a different term or check your spelling.
            </div>
          </NoResults>
        )}
      </ResultsContainer>
    </SearchContainer>
  );
} 