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

export default function Trending() {
  const router = useRouter();
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
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
        // Use search API when in search mode
        const searchData = await movieAPI.searchMovies(searchTerm.trim(), page);
        
        // Filter out people and normalize the data structure
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

      if (data?.results?.length) {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = data.results.filter(m => !existingIds.has(m.id));
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
    }
  }, [loading, hasMore, page, isSearchMode, searchTerm]);

  useEffect(() => {
    // Reset and reload when search mode changes
    setMovies([]);
    setPage(1);
    setHasMore(true);
    loadMoreMovies();
  }, [isSearchMode, searchTerm]); // Reload when search mode or term changes

  useEffect(() => {
    const onScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 90;

      if (scrolledToBottom && !loading && hasMore) {
        loadMoreMovies();
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
      <Section>
        <SectionTitle>
          {isSearchMode ? `🔍 Search Results for "${searchTerm}"` : '🔥 Trending Now'}
        </SectionTitle>

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

        {filteredMovies.length === 0 && !loading && isSearchMode && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
            No results found for "{searchTerm}". Try a different search term.
          </div>
        )}

        <MovieGrid>
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </MovieGrid>

        {loading && <Loading>Loading more {isSearchMode ? 'results' : 'movies'}...</Loading>}
      </Section>
    </>
  );
} 