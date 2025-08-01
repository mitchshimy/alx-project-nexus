import React, { useState, useEffect } from 'react';
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
  border-left: 4px solid #00D4FF;
`;

const TipsTitle = styled.h4`
  color: #00D4FF;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const TipsList = styled.ul`
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.5;
  padding-left: 1rem;
`;

export default function TV({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const [shows, setShows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<any[]>([]);


  const loadMoreShows = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await movieAPI.getMovies({ type: 'tv', page });
      
      // Check if response has error property
      if (data && data.error) {
        console.error('API error:', data.error);
        setHasMore(false);
        return;
      }
      
      if (data?.results?.length) {
        setShows(prev => {
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
      console.error('Error loading TV shows:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadMoreShows();
  }, []); // Only on first load

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
          loadMoreShows();
        }
      } else {
        // Fallback to original logic if footer is not found
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight;
        const scrolledToBottom = scrollTop + window.innerHeight >= documentHeight - 200;
        
        if (scrolledToBottom && !loading && hasMore) {
          loadMoreShows();
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
  }, [loadMoreShows, loading, hasMore]);

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

  const filteredShows = shows.filter(show => {
    const matchesGenre = filter === 'all' || show.genre_ids?.includes(Number(filter));
    return matchesGenre;
  });

  return (
    <>
      <Section isSidebarOpen={isSidebarOpen}>
        <SectionTitle>📺 TV Shows</SectionTitle>
        
        <Description>
          <DescriptionTitle>Binge-Worthy Series & Episodic Entertainment</DescriptionTitle>
          <DescriptionText>
            Dive into the world of television with our extensive collection of TV shows. From gripping dramas 
            to hilarious comedies, from sci-fi adventures to reality shows - discover your next favorite series. 
            Filter by genre to find shows that match your mood!
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
          <Loading>Loading TV shows...</Loading>
        ) : (
          <>
            <MovieGrid>
              {filteredShows.map(show => (
                <MovieCard key={show.id} movie={{
                  tmdb_id: show.tmdb_id || show.id,
                  title: show.title,
                  name: show.name,
                  poster_path: show.poster_path,
                  vote_average: show.vote_average,
                  release_date: show.release_date,
                  first_air_date: show.first_air_date
                }} />
              ))}
            </MovieGrid>

            {loading && <Loading>Loading more TV shows...</Loading>}
          </>
        )}

        {!initialLoading && shows.length > 0 && (
          <TipsContainer>
            <TipsTitle>💡 TV Show Discovery Tips</TipsTitle>
            <TipsList>
              <li>Use the genre filter to find shows that match your interests</li>
              <li>Click on any show to see detailed information and episode guides</li>
              <li>Add shows to your watchlist to track what you want to watch</li>
              <li>Scroll down to automatically load more shows</li>
              <li>Check out the Trending page for what&apos;s hot right now</li>
            </TipsList>
          </TipsContainer>
        )}
      </Section>
    </>
  );
} 