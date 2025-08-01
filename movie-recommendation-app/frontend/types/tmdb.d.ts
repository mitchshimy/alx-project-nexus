export interface TMDBMovie {
  id: number;
  tmdb_id?: number;
  title: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  genres?: Genre[];
  vote_average: number;
  release_date: string;
  runtime?: number;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  adult?: boolean;
  video?: boolean;
  credits?: TMDBCredits;
  is_favorite?: boolean;
  is_watchlisted?: boolean;
  user_rating?: number;
  favorite_id?: number;
  watchlist_id?: number;
  
  // Additional properties for enhanced movie details
  tagline?: string;
  imdb_id?: string;
  original_language?: string;
  budget?: number;
  revenue?: number;
  status?: string;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string | null;
    origin_country?: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    iso_639_1: string;
    english_name: string;
    name: string;
  }>;
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      size: number;
      type: string;
      official: boolean;
      published_at: string;
    }>;
  };
  reviews?: {
    results: Array<{
      id: string;
      author: string;
      author_details: {
        name: string;
        username: string;
        avatar_path?: string | null;
        rating?: number;
      };
      content: string;
      created_at: string;
      updated_at: string;
      url: string;
    }>;
  };
  similar?: {
    results: TMDBMovie[];
  };
}

export interface TMDBTVShow {
  id: number;
  name: string;
  title?: string; // For compatibility with TMDBMovie
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  genres?: Genre[];
  vote_average: number;
  first_air_date: string;
  release_date?: string; // For compatibility with TMDBMovie
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  media_type?: 'tv';
}

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  media_type: 'movie' | 'tv' | 'person';
  adult?: boolean;
  video?: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBRequestOptions {
  params?: {
    [key: string]: string | number | boolean | undefined;
  };
  headers?: Record<string, string>;
  append_to_response?: string;
}

export interface RecommendationsError {
  error: string;
  message?: string;
  details?: any;
}

export interface TMDBCast {
  cast_id?: number;
  character: string;
  credit_id: string;
  gender: number | null;
  id: number;
  name: string;
  order: number;
  profile_path: string | null;
}

export interface TMDBCrew {
  credit_id: string;
  department: string;
  gender: number | null;
  id: number;
  job: string;
  name: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCrew[];
}
