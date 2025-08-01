import React, { useState, useEffect, useCallback } from 'react';
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

const FilterSelect = styled.select`
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

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? '#e50914' : 'rgba(255, 255, 255, 0.1)'};
  color: #f0f0f0;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#b2070e' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const SearchTerm = styled.div`
  font-size: 1.2rem;
  color: #e0e0e0;
  margin-bottom: 2rem;
  text-align: center;
`;

export default function Discover({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const [content, setContent] = useState<Array<{
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
  const [hasMore, setHasMore] = useState(true);
  const [contentType, setContentType] = useState<'movies' | 'tv'>('movies');
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<Array<{
    id: number;
    name: string;
  }>>([]);
  const [searchQuery] = useState('');

  const loadMoreContent = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await movieAPI.getMovies({ 
        type: contentType, 
        page,
        search: searchQuery // Added search query to API call
      });
      if (data?.results?.length) {
        setContent(prev => {
          const existingIds = new Set(prev.map((m: { id: number }) => m.id));
          const uniqueNew = data.results.filter((m: { id: number }) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
        setPage(prev => prev + 1);
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading content:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, contentType, searchQuery]);

  useEffect(() => {
    // Reset when content type changes
    setContent([]);
    setPage(1);
    setHasMore(true);
    loadMoreContent();
  }, [contentType, loadMoreContent]);

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
          loadMoreContent();
        }
      } else {
        // Fallback to original logic if footer is not found
        const scrolledToBottom =
          window.innerHeight + window.scrollY >= document.body.scrollHeight - 90;

        if (scrolledToBottom && !loading && hasMore) {
          loadMoreContent();
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
  }, [loadMoreContent, loading, hasMore]);

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

  const filteredContent = content.filter(item => {
    const matchesGenre = filter === 'all' || item.genre_ids?.includes(Number(filter));
    return matchesGenre;
  });

  const handleSearch = async () => {
    setLoading(true);
    setContent([]);
    setPage(1);
    setHasMore(true);
    try {
             const data = await movieAPI.getMovies({ 
         type: contentType, 
         page: 1,
         search: searchQuery
       });
      // setSearchResults(data.results); // This line was removed as per the edit hint
    } catch (err) {
      console.error('Error searching content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section isSidebarOpen={isSidebarOpen}>
      <SectionTitle>🔍 Discover</SectionTitle>

      <TabContainer>
        <Tab 
          active={contentType === 'movies'} 
          onClick={() => setContentType('movies')}
        >
          Movies
        </Tab>
        <Tab 
          active={contentType === 'tv'} 
          onClick={() => setContentType('tv')}
        >
          TV Shows
        </Tab>
      </TabContainer>

      <FilterContainer>
        <FilterSelect value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Genres</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </FilterSelect>
      </FilterContainer>

      <SearchTerm>
        {/* {t('discover.searchResults')}: &ldquo;{searchQuery}&rdquo; */}
        Search Results for &ldquo;{searchQuery}&rdquo;
      </SearchTerm>

      {loading ? (
        <Loading>Loading {contentType}...</Loading>
      ) : (
        <>
          <MovieGrid>
            {filteredContent.map(item => (
              <MovieCard 
                key={item.id} 
                movie={{
                  tmdb_id: item.tmdb_id || item.id,
                  title: item.title,
                  poster_path: item.poster_path,
                  vote_average: item.vote_average,
                  release_date: item.release_date,
                 
                }} 
              />
            ))}
          </MovieGrid>

          {loading && <Loading>Loading more {contentType}...</Loading>}
        </>
      )}
    </Section>
  );
} 