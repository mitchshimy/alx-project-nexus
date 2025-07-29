import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MovieCard from '@/components/MovieCard';
import { getMovies, getGenres } from '@/utils/tmdbClient';
import { TMDBMovie, Genre } from '@/types/tmdb';

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

export default function Anime() {
  const [anime, setAnime] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [genres, setGenres] = useState<Genre[]>([]);

  const loadMoreAnime = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // For anime, we'll use the movies API with animation genre filter
      const data = await getMovies(page);
      if (data?.results?.length) {
        // Filter for animation genre (id: 16)
        const animeResults = data.results.filter(movie => 
          movie.genre_ids?.includes(16)
        );
        
        setAnime(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = animeResults.filter(m => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
        setPage(prev => prev + 1);
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading anime:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    loadMoreAnime();
  }, []); // Only on first load

  useEffect(() => {
    const onScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 90;

      if (scrolledToBottom && !loading && hasMore) {
        loadMoreAnime();
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMoreAnime, loading, hasMore]);

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

  const filteredAnime = anime.filter(item => {
    const matchesGenre = filter === 'all' || item.genre_ids?.includes(Number(filter));
    return matchesGenre;
  });

  return (
    <>
      <Section>
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

        <MovieGrid>
          {filteredAnime.map(item => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </MovieGrid>

        {loading && <Loading>Loading more anime...</Loading>}
      </Section>
    </>
  );
} 