import { useEffect, useState } from 'react';
import styled from 'styled-components';
import MovieCard from '../components/MovieCard';
import Favorites from '../components/Favorites';
import Header from '../components/Header';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  release_date: string;
};

type Genre = {
  id: number;
  name: string;
};

async function fetchTrendingMovies(page = 1) {
  const res = await fetch(`/api/trending?page=${page}`);
  if (!res.ok) {
    throw new Error('Failed to fetch trending movies');
  }
  return res.json();
}

async function fetchGenres() {
  const res = await fetch('/api/genres');
  if (!res.ok) {
    throw new Error('Failed to fetch genres');
  }
  return res.json();
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 2px solid #eee;
  margin: 40px 0 24px 0;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  margin: 0 auto 24px auto;
  display: block;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 32px auto 0 auto;
  padding: 12px 32px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => (theme as any).colors.primary};
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => (theme as any).colors.secondary}; }
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 12px;
  margin-top: 0;
`;

const EmptyState = styled.p`
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  margin: 40px 0;
`;

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | ''>('');
  const [sort, setSort] = useState<'default' | 'rating' | 'release'>('default');

  useEffect(() => {
    fetchTrendingMovies(1)
      .then((data) => {
        setMovies(data.results);
        setHasMore(data.page < data.total_pages);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    fetchGenres()
      .then((data) => setGenres(data.genres))
      .catch(() => setGenres([]));
  }, []);

  const loadMore = () => {
    setLoadingMore(true);
    fetchTrendingMovies(page + 1)
      .then((data) => {
        setMovies((prev) => [...prev, ...data.results]);
        setPage(data.page);
        setHasMore(data.page < data.total_pages);
        setLoadingMore(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingMore(false);
      });
  };

  let filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === '' || movie.genre_ids.includes(Number(selectedGenre));
    return matchesSearch && matchesGenre;
  });

  if (sort === 'rating') {
    filteredMovies = [...filteredMovies].sort((a, b) => b.vote_average - a.vote_average);
  } else if (sort === 'release') {
    filteredMovies = [...filteredMovies].sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
  }

  if (loading) return <PageContainer><Header /><EmptyState>Loading trending movies...</EmptyState></PageContainer>;
  if (error) return <PageContainer><Header /><EmptyState>Error: {error}</EmptyState></PageContainer>;

  return (
    <PageContainer>
      <Header />
      <Favorites />
      <SectionDivider />
      <SectionTitle>Trending Movies</SectionTitle>
      <FilterRow>
        <SearchBar
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </Select>
        <Select value={sort} onChange={e => setSort(e.target.value as any)}>
          <option value="default">Sort: Default</option>
          <option value="rating">Sort: Rating</option>
          <option value="release">Sort: Release Date</option>
        </Select>
      </FilterRow>
      {filteredMovies.length === 0 ? (
        <EmptyState>No movies found. Try a different search or filter.</EmptyState>
      ) : (
        <>
          <Grid>
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} id={movie.id} title={movie.title} posterPath={movie.poster_path} />
            ))}
          </Grid>
          {hasMore && filteredMovies.length > 0 && (
            <LoadMoreButton onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More'}
            </LoadMoreButton>
          )}
        </>
      )}
    </PageContainer>
  );
}