import requests
import json
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import Movie


class TMDBService:
    """Service class for TMDB API integration"""
    
    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = settings.TMDB_BASE_URL
        self.session = requests.Session()
    
    def _make_request(self, endpoint, params=None):
        """Make a request to TMDB API"""
        url = f"{self.base_url}{endpoint}"
        params = params or {}
        params['api_key'] = self.api_key
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"TMDB API error: {str(e)}")
    
    def _get_cache_key(self, endpoint, params=None):
        """Generate cache key for endpoint"""
        param_str = json.dumps(params or {}, sort_keys=True)
        return f"tmdb:{endpoint}:{param_str}"
    
    def _get_cached_data(self, cache_key):
        """Get data from cache"""
        return cache.get(cache_key)
    
    def _set_cached_data(self, cache_key, data, timeout=3600):
        """Set data in cache"""
        cache.set(cache_key, data, timeout)
    
    def get_trending_movies(self, page=1, media_type='movie', time_window='week'):
        """Get trending movies from TMDB"""
        cache_key = self._get_cache_key('/trending/movie/week', {'page': page})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request('/trending/movie/week', {'page': page})
        self._set_cached_data(cache_key, data)
        return data
    
    def get_movies(self, page=1, sort_by='popularity.desc'):
        """Get movies from TMDB"""
        cache_key = self._get_cache_key('/discover/movie', {'page': page, 'sort_by': sort_by})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request('/discover/movie', {
            'page': page,
            'sort_by': sort_by
        })
        self._set_cached_data(cache_key, data)
        return data
    
    def get_tv_shows(self, page=1, sort_by='popularity.desc'):
        """Get TV shows from TMDB"""
        cache_key = self._get_cache_key('/discover/tv', {'page': page, 'sort_by': sort_by})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request('/discover/tv', {
            'page': page,
            'sort_by': sort_by
        })
        self._set_cached_data(cache_key, data)
        return data
    
    def get_top_rated_movies(self, page=1):
        """Get top rated movies from TMDB"""
        cache_key = self._get_cache_key('/movie/top_rated', {'page': page})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request('/movie/top_rated', {'page': page})
        self._set_cached_data(cache_key, data)
        return data
    
    def search_multi(self, query, page=1):
        """Search movies, TV shows, and people"""
        cache_key = self._get_cache_key('/search/multi', {'query': query, 'page': page})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request('/search/multi', {
            'query': query,
            'page': page
        })
        self._set_cached_data(cache_key, data)
        return data
    
    def get_movie_details(self, movie_id):
        """Get detailed movie information"""
        cache_key = self._get_cache_key(f'/movie/{movie_id}')
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request(f'/movie/{movie_id}')
        self._set_cached_data(cache_key, data)
        return data
    
    def get_genres(self):
        """Get movie genres"""
        cache_key = self._get_cache_key('/genre/movie/list')
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        data = self._make_request('/genre/movie/list')
        self._set_cached_data(cache_key, data, timeout=86400)  # Cache for 24 hours
        return data
    
    def sync_movie_to_db(self, tmdb_data):
        """Sync TMDB movie data to our database"""
        movie_data = {
            'tmdb_id': tmdb_data['id'],
            'title': tmdb_data.get('title', tmdb_data.get('name', '')),
            'overview': tmdb_data.get('overview', ''),
            'poster_path': tmdb_data.get('poster_path'),
            'backdrop_path': tmdb_data.get('backdrop_path'),
            'vote_average': tmdb_data.get('vote_average', 0.0),
            'vote_count': tmdb_data.get('vote_count', 0),
            'popularity': tmdb_data.get('popularity', 0.0),
            'genre_ids': tmdb_data.get('genre_ids', []),
            'media_type': tmdb_data.get('media_type', 'movie'),
        }
        
        # Handle release date
        release_date = tmdb_data.get('release_date') or tmdb_data.get('first_air_date')
        if release_date:
            movie_data['release_date'] = release_date
        
        movie, created = Movie.objects.update_or_create(
            tmdb_id=movie_data['tmdb_id'],
            defaults=movie_data
        )
        return movie 