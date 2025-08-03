import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { movieAPI } from '@/utils/api';
import MovieCard from '@/components/MovieCard';
import { SkeletonMovieGrid } from '@/components/Skeleton';

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
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
`;

const DescriptionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #00D4FF;
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

const LoadMoreButton = styled.button`
  display: block;
  margin: 2rem auto;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const TipsTitle = styled.h3`
  color: #00D4FF;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const TipsList = styled.ul`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;
  }
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
  const [initialLoading, setInitialLoading] = useState(true);
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
      console.log(`Loading page ${page} for ${contentType}`);
      const data = await movieAPI.getMovies({ 
        type: contentType, 
        media_type: contentType === 'tv' ? 'tv' : 'movie',
        page,
        search: searchQuery
      });
      
      if (data?.results?.length) {
        setContent(prev => {
          const existingIds = new Set(prev.map((m: { id: number }) => m.id));
          const uniqueNew = data.results.filter((m: { id: number }) => !existingIds.has(m.id));
          console.log(`Adding ${uniqueNew.length} new items to existing ${prev.length}`);
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
      setInitialLoading(false);
    }
  }, [loading, hasMore, page, contentType, searchQuery]);

  useEffect(() => {
    // Reset when content type changes
    setContent([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    setLoading(false);
    
    // Load initial content for the new type
    const loadInitialContent = async () => {
      try {
        const data = await movieAPI.getMovies({ 
          type: contentType, 
          media_type: contentType === 'tv' ? 'tv' : 'movie',
          page: 1,
          search: searchQuery
        });
        
        if (data?.results?.length) {
          setContent(data.results);
          setPage(2); // Set to 2 since we've loaded page 1
          setHasMore(data.page < data.total_pages);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error loading initial content:', err);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialContent();
  }, [contentType, searchQuery]);

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

  // Initial load effect
  useEffect(() => {
    const loadInitialContent = async () => {
      setInitialLoading(true);
      try {
        const data = await movieAPI.getMovies({ 
          type: contentType, 
          media_type: contentType === 'tv' ? 'tv' : 'movie',
          page: 1,
          search: searchQuery
        });
        
        if (data?.results?.length) {
          setContent(data.results);
          setPage(2); // Set to 2 since we've loaded page 1
          setHasMore(data.page < data.total_pages);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error loading initial content:', err);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialContent();
  }, [contentType, searchQuery]); // Include dependencies

  const filteredContent = content.filter(item => {
    const matchesGenre = filter === 'all' || item.genre_ids?.includes(Number(filter));
    return matchesGenre;
  });



  return (
    <>
      <Section isSidebarOpen={isSidebarOpen}>
        <SectionTitle>🔍 Discover</SectionTitle>
        
        <Description>
          <DescriptionTitle>Explore Movies & TV Shows</DescriptionTitle>
          <DescriptionText>
            Discover amazing content from our vast collection of movies and TV shows. 
            Switch between movies and TV shows, filter by genre, and find your next favorite entertainment. 
            Use the search functionality to find specific titles or explore by genre to discover new content.
          </DescriptionText>
        </Description>

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

        {searchQuery && (
          <SearchTerm>
            Search Results for &ldquo;{searchQuery}&rdquo;
          </SearchTerm>
        )}

        {initialLoading ? (
          <SkeletonMovieGrid />
        ) : (
          <>
            <MovieGrid>
              {filteredContent.map(item => (
                <MovieCard 
                  key={item.id} 
                  movie={{
                    tmdb_id: item.tmdb_id || item.id,
                    title: item.title || '',
                    poster_path: item.poster_path || '',
                    vote_average: item.vote_average || 0,
                    release_date: item.release_date || '',
                  }} 
                />
              ))}
            </MovieGrid>

            {loading && <Loading>Loading more {contentType}...</Loading>}
            
            {!loading && hasMore && (
              <LoadMoreButton onClick={loadMoreContent}>
                Load More {contentType === 'movies' ? 'Movies' : 'TV Shows'}
              </LoadMoreButton>
            )}
          </>
        )}

        {!initialLoading && content.length > 0 && (
          <TipsContainer data-tips-container>
            <TipsTitle>💡 Discovery Tips</TipsTitle>
            <TipsList>
              <li>Switch between Movies and TV Shows using the tabs above</li>
              <li>Use the genre filter to explore specific types of content</li>
              <li>Click on any card to see detailed information and trailers</li>
              <li>Add content to your favorites or watchlist for later viewing</li>
              <li>Scroll down to automatically load more content</li>
              <li>Use the search bar to find specific titles</li>
            </TipsList>
          </TipsContainer>
        )}
      </Section>
    </>
  );
} 