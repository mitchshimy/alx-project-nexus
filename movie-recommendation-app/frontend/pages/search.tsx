import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { movieAPI, clearApiCache } from '@/utils/api';
import MovieCard from '@/components/MovieCard';
import { SkeletonBase } from '@/components/Skeleton';
import { t } from '@/utils/translations';

// Define types locally since we removed the import
type TMDBMovie = {
  id: number;
  tmdb_id?: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

type TMDBSearchResult = TMDBMovie & {
  media_type?: 'movie' | 'tv' | 'person';
};



const SearchContainer = styled.div<{ isSidebarOpen?: boolean }>`
  padding: 2rem;
  max-width: ${({ isSidebarOpen }) => 
    isSidebarOpen ? 'calc(100vw - 320px)' : 'calc(100vw - 120px)'
  };
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f15 0%, #1a1a24 100%);
  
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

const SearchTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const SearchSubtitle = styled.p`
  font-size: 1.2rem;
  color: #A1A1AA;
  text-align: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const SearchStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.8rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #00D4FF;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const ResultsTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0;
  color: #FFFFFF;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ResultsInfo = styled.div`
  color: #A1A1AA;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
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
  color: #A1A1AA;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .progress-container {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin: 1rem 0;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00D4FF 0%, #7C3AED 100%);
    animation: progressAnimation 2s ease-in-out infinite;
  }
  
  @keyframes progressAnimation {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
  }
`;

const SearchProgress = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #00D4FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #A1A1AA;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .no-results-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .no-results-title {
    font-size: 1.5rem;
    color: #FFFFFF;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .no-results-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
  }
  
  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .suggestion-tag {
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: #00D4FF;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 212, 255, 0.2);
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    
    .no-results-icon {
      font-size: 3rem;
    }
    
    .no-results-title {
      font-size: 1.3rem;
    }
    
    .no-results-subtitle {
      font-size: 0.9rem;
    }
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
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.active ? '#00D4FF' : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.active ? 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#000' : '#FFFFFF'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-height: 44px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.active ? '#00D4FF' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const SearchSuggestions = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .suggestions-title {
    color: #FFFFFF;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .suggestion-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(0, 212, 255, 0.3);
      transform: translateY(-2px);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    
    .suggestions-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }
`;

const LoadMoreButton = styled.button`
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  border: none;
  color: #000;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 2rem auto;
  display: block;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const LoadMoreInfo = styled.div`
  text-align: center;
  color: #A1A1AA;
  font-size: 0.9rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button<{ active?: boolean; disabled?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.active ? '#00D4FF' : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.active ? '#00D4FF' : 'transparent'};
  color: ${props => props.active ? '#000' : '#FFFFFF'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: ${props => props.active ? '600' : '500'};
  transition: all 0.2s ease;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? '#00D4FF' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const PageJump = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input {
    width: 60px;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    text-align: center;
    background: var(--bg-secondary);
    color: var(--text-color);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
  
  button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    
    &:hover {
      background: var(--primary-hover);
    }
  }
`;

// Type for search results that includes media_type
type SearchResult = TMDBMovie & {
  media_type?: 'movie' | 'tv' | 'person';
};

export default function Search({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const router = useRouter();
  const { q: searchQuery } = router.query;
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render

  const loadSearchResults = useCallback(async (page: number = 1) => {
    if (!searchQuery || typeof searchQuery !== 'string') return;

    console.log(`🚀 Starting loadSearchResults for page ${page}`);
    setLoading(true);
    if (page === 1) {
      setInitialLoading(true);
      setSearchResults([]);
    }

    try {
      const startTime = Date.now();
      console.log(`📡 Making API call for "${searchQuery}" page ${page}`);
      
      const data = await movieAPI.searchMovies(searchQuery, page);
      
      if (data?.error) {
        console.error('❌ Search error:', data.error);
        return;
      }
      
      console.log('✅ Search response received:', data);
      
      if (data?.results?.length) {
        const transformedResults = data.results.map((item: TMDBSearchResult) => ({
          ...item,
          title: item.title || item.name || 'Unknown Title',
          release_date: item.release_date || item.first_air_date || '',
        })) as SearchResult[];

        console.log(`🔄 Setting ${transformedResults.length} new results for page ${page}`);
        console.log('📊 First 3 movies:', transformedResults.slice(0, 3).map(m => m.title));
        
        // Always replace results for pagination (don't accumulate)
        setSearchResults(transformedResults);
        
        setCurrentPage(page);
        setTotalPages(data.total_pages || 1);
        setTotalResults(data.total_results || 0);
        
        const endTime = Date.now();
        setSearchTime(endTime - startTime);
        
        // Force a re-render
        setForceUpdate(prev => prev + 1);
        
        console.log(`✅ Successfully loaded ${transformedResults.length} results. Total: ${data.total_results}, Pages: ${data.total_pages}, Current page: ${page}`);
      } else {
        setSearchResults([]);
        setTotalPages(1);
        setTotalResults(0);
        console.log('⚠️ No results found');
      }
    } catch (err) {
      console.error('❌ Error searching:', err);
    } finally {
      console.log('🏁 Finishing loadSearchResults, setting loading to false');
      setLoading(false);
      setInitialLoading(false);
    }
  }, [searchQuery]);

  // Load initial search results
  useEffect(() => {
    if (searchQuery && typeof searchQuery === 'string') {
      setCurrentPage(1);
      loadSearchResults(1);
    }
  }, [searchQuery, loadSearchResults]);

  // Debug searchResults changes
  useEffect(() => {
    console.log('📋 searchResults changed:', {
      length: searchResults.length,
      currentPage,
      firstMovie: searchResults[0]?.title || 'No movies',
      lastMovie: searchResults[searchResults.length - 1]?.title || 'No movies'
    });
  }, [searchResults, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log(`🚀 Changing to page ${page}`);
      // Clear API cache to ensure fresh data
      clearApiCache();
      
      // Scroll to top instantly (no delay)
      window.scrollTo({ top: 0, behavior: 'auto' });
      
      loadSearchResults(page);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'movie' | 'tv') => {
    setFilter(newFilter);
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // Count helpers
  const getMovieCount = () => searchResults.filter(r => r.media_type === 'movie').length;
  const getTVCount = () => searchResults.filter(r => r.media_type === 'tv').length;

  // Filter results based on current filter
  const filteredResults = searchResults.filter((result) => {
    if (filter === 'all') return true;
    return result.media_type === filter;
  });

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Popular suggestions
  const popularSuggestions = [
    'Action Movies', 'Comedy Shows', 'Drama Series', 'Horror Films',
    'Sci-Fi', 'Romance', 'Thriller', 'Documentary'
  ];

  // Render empty state if no search query
  if (!searchQuery) {
    return (
      <SearchContainer isSidebarOpen={isSidebarOpen}>
        <SearchTitle>🔍 Search</SearchTitle>
        <SearchSubtitle>Enter a search term to find movies and TV shows</SearchSubtitle>
        
        <SearchSuggestions>
          <div className="suggestions-title">💡 Popular Searches</div>
          <div className="suggestions-grid">
            {popularSuggestions.map((suggestion) => (
              <div key={suggestion} className="suggestion-item" onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </div>
            ))}
          </div>
        </SearchSuggestions>
      </SearchContainer>
    );
  }

  return (
    <SearchContainer isSidebarOpen={isSidebarOpen}>
      <SearchTitle>🔍 Search Results</SearchTitle>
      <SearchSubtitle>
        Showing results for: <strong>&ldquo;{searchQuery}&rdquo;</strong>
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
          Movies ({getMovieCount()})
        </FilterButton>
        <FilterButton 
          active={filter === 'tv'} 
          onClick={() => handleFilterChange('tv')}
        >
          TV Shows ({getTVCount()})
        </FilterButton>
      </FilterContainer>

      <ResultsContainer>
        {initialLoading ? (
          <SearchProgress>
            <div className="spinner"></div>
            <div>
              <div>🔍 Searching for &ldquo;{searchQuery}&rdquo;...</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Searching through millions of titles...
              </div>
            </div>
          </SearchProgress>
        ) : filteredResults.length > 0 ? (
          <>
            <ResultsHeader>
              <ResultsTitle>
                {filter === 'all' ? 'All Results' : 
                 filter === 'movie' ? 'Movies' : 'TV Shows'}
              </ResultsTitle>
              <ResultsInfo>
                Showing {filteredResults.length} of {totalResults.toLocaleString()} results
                {searchTime > 0 && ` • Found in ${searchTime}ms`}
              </ResultsInfo>
            </ResultsHeader>
            
            <MovieGrid key={`page-${currentPage}-${forceUpdate}`}>
              {filteredResults.map(movie => (
                <MovieCard 
                  key={`${currentPage}-${movie.id}`} 
                  movie={{
                    tmdb_id: movie.tmdb_id || movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date
                  }} 
                />
              ))}
            </MovieGrid>
            
            {!loading && totalPages > 1 && (
              <PaginationContainer>
                <PageButton 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1 || loading}
                >
                  {loading ? '⏳' : 'First'}
                </PageButton>
                <PageButton 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1 || loading}
                >
                  {loading ? '⏳' : 'Previous'}
                </PageButton>
                
                {getPageNumbers().map((page, index) => (
                  <PageButton
                    key={index}
                    active={page === currentPage}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={typeof page === 'string' || loading}
                  >
                    {loading && page === currentPage ? '⏳' : page}
                  </PageButton>
                ))}
                
                <PageButton 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages || loading}
                >
                  {loading ? '⏳' : 'Next'}
                </PageButton>
                <PageButton 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages || loading}
                >
                  {loading ? '⏳' : 'Last'}
                </PageButton>
                
                <PageInfo>
                  <span>Page {currentPage} of {totalPages}</span>
                  <span>•</span>
                  <span>{totalResults.toLocaleString()} total results</span>
                  {loading && <span>• Loading...</span>}
                </PageInfo>
              </PaginationContainer>
            )}
          </>
        ) : (
          <NoResults>
            <div className="no-results-icon">🔍</div>
            <div className="no-results-title">No results found</div>
            <div className="no-results-subtitle">
              Try adjusting your search terms or browse our suggestions below
            </div>
            <div className="suggestions">
              {popularSuggestions.slice(0, 6).map((suggestion) => (
                <div 
                  key={suggestion} 
                  className="suggestion-tag"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </NoResults>
        )}
      </ResultsContainer>
    </SearchContainer>
  );
}