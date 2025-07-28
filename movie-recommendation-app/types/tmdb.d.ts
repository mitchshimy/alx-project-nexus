export interface TMDBMovie {
  id: number;
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
