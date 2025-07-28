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
};

async function fetchTrendingMovies() {
  const res = await fetch('/api/trending');
  if (!res.ok) {
    throw new Error('Failed to fetch trending movies');
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

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTrendingMovies()
      .then((data) => {
        setMovies(data.results);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading trending movies...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <Header />
      <Favorites />
      <SectionDivider />
      <h1>Trending Movies</h1>
      <SearchBar
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Grid>
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} id={movie.id} title={movie.title} posterPath={movie.poster_path} />
        ))}
      </Grid>
    </div>
  );
}