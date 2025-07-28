import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Hero from '@/components/Hero';
import MovieCard from '@/components/MovieCard';
import { getTrendingMovies, getGenres } from '@/utils/tmdbClient';
import { TMDBMovie, Genre } from '@/types/tmdb';

const Section = styled.section`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
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

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  min-width: 250px;
`;

const GenreSelect = styled.select`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

export default function Home() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<Genre[]>([]);

  const loadMoreMovies = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await getTrendingMovies(page);
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
  }, [loading, hasMore, page]);

  useEffect(() => {
    loadMoreMovies();
  }, []); // Only on first load

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
        const data = await getGenres();
        setGenres(data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    fetchGenres();
  }, []);

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filter === 'all' || movie.genre_ids?.includes(Number(filter));
    return matchesSearch && matchesGenre;
  });

  return (
    <>
      <Hero />

      <Section>
        <SectionTitle>🔥 Trending Now</SectionTitle>

        <FilterContainer>
          <SearchInput
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <GenreSelect value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </GenreSelect>
        </FilterContainer>

        <MovieGrid>
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </MovieGrid>

        {loading && <Loading>Loading more movies...</Loading>}
      </Section>
    </>
  );
}
