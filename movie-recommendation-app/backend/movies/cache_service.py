"""
Cache service for movie recommendation API
Provides enhanced caching functionality with Redis
"""

import json
import hashlib
from django.core.cache import cache
from django.conf import settings
import requests
from typing import Optional, Dict, Any


class MovieCacheService:
    """Enhanced caching service for movie data"""
    
    @staticmethod
    def generate_cache_key(prefix: str, **kwargs) -> str:
        """Generate a unique cache key based on parameters"""
        # Create a sorted string of key-value pairs
        sorted_params = sorted(kwargs.items())
        param_string = '_'.join(f"{k}_{v}" for k, v in sorted_params)
        
        # Create hash for long parameter strings
        if len(param_string) > 50:
            param_string = hashlib.md5(param_string.encode()).hexdigest()
        
        return f"movie_api_{prefix}_{param_string}"
    
    @staticmethod
    def get_cached_data(cache_key: str) -> Optional[Dict[str, Any]]:
        """Get data from cache"""
        try:
            cached_data = cache.get(cache_key)
            if cached_data:
                print(f"✅ Cache HIT for key: {cache_key}")
                return cached_data
            else:
                print(f"❌ Cache MISS for key: {cache_key}")
                return None
        except Exception as e:
            print(f"⚠️ Cache error for key {cache_key}: {e}")
            return None
    
    @staticmethod
    def set_cached_data(cache_key: str, data: Dict[str, Any], timeout: int = 3600) -> bool:
        """Set data in cache"""
        try:
            cache.set(cache_key, data, timeout)
            print(f"💾 Cached data for key: {cache_key} (timeout: {timeout}s)")
            return True
        except Exception as e:
            print(f"⚠️ Cache set error for key {cache_key}: {e}")
            return False
    
    @staticmethod
    def invalidate_cache_pattern(pattern: str) -> int:
        """Invalidate cache keys matching a pattern"""
        try:
            # Note: This is a simplified version. In production, you might want to use Redis SCAN
            # For now, we'll just clear the entire cache for patterns
            cache.clear()
            print(f"🗑️ Cleared cache for pattern: {pattern}")
            return 1
        except Exception as e:
            print(f"⚠️ Cache invalidation error for pattern {pattern}: {e}")
            return 0
    
    @staticmethod
    def get_trending_movies(page: int = 1, timeout: int = 3600) -> Optional[Dict[str, Any]]:
        """Get trending movies with caching"""
        cache_key = MovieCacheService.generate_cache_key('trending', page=page)
        
        # Try to get from cache first
        cached_data = MovieCacheService.get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # If not in cache, fetch from TMDB API
        try:
            headers = {
                'Authorization': f'Bearer {settings.TMDB_READ_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            api_url = f'{settings.TMDB_BASE_URL}/trending/all/week?page={page}'
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Cache the successful response
                MovieCacheService.set_cached_data(cache_key, data, timeout)
                return data
            else:
                print(f"❌ TMDB API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching trending movies: {e}")
            return None
    
    @staticmethod
    def get_movie_details(tmdb_id: int, timeout: int = 86400) -> Optional[Dict[str, Any]]:
        """Get movie details with caching"""
        cache_key = MovieCacheService.generate_cache_key('movie_details', tmdb_id=tmdb_id)
        
        # Try to get from cache first
        cached_data = MovieCacheService.get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # If not in cache, fetch from TMDB API
        try:
            headers = {
                'Authorization': f'Bearer {settings.TMDB_READ_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            api_url = f'{settings.TMDB_BASE_URL}/movie/{tmdb_id}?append_to_response=credits,videos,reviews'
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Cache the successful response
                MovieCacheService.set_cached_data(cache_key, data, timeout)
                return data
            else:
                print(f"❌ TMDB API error for movie {tmdb_id}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching movie details for {tmdb_id}: {e}")
            return None
    
    @staticmethod
    def search_movies(query: str, page: int = 1, timeout: int = 1800) -> Optional[Dict[str, Any]]:
        """Search movies with caching"""
        cache_key = MovieCacheService.generate_cache_key('search', query=query, page=page)
        
        # Try to get from cache first
        cached_data = MovieCacheService.get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # If not in cache, fetch from TMDB API
        try:
            headers = {
                'Authorization': f'Bearer {settings.TMDB_READ_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            api_url = f'{settings.TMDB_BASE_URL}/search/multi?query={query}&page={page}'
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Cache the successful response
                MovieCacheService.set_cached_data(cache_key, data, timeout)
                return data
            else:
                print(f"❌ TMDB API error for search '{query}': {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error searching movies for '{query}': {e}")
            return None
    
    @staticmethod
    def get_genres(timeout: int = 86400) -> Optional[Dict[str, Any]]:
        """Get movie genres with caching"""
        cache_key = MovieCacheService.generate_cache_key('genres')
        
        # Try to get from cache first
        cached_data = MovieCacheService.get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # If not in cache, fetch from TMDB API
        try:
            headers = {
                'Authorization': f'Bearer {settings.TMDB_READ_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            api_url = f'{settings.TMDB_BASE_URL}/genre/movie/list'
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Cache the successful response
                MovieCacheService.set_cached_data(cache_key, data, timeout)
                return data
            else:
                print(f"❌ TMDB API error for genres: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching genres: {e}")
            return None
    
    @staticmethod
    def clear_user_cache(user_id: int) -> bool:
        """Clear user-specific cache when user data changes"""
        try:
            # Clear user favorites cache
            cache.delete(f"user_favorites_{user_id}")
            # Clear user watchlist cache
            cache.delete(f"user_watchlist_{user_id}")
            # Clear user ratings cache
            cache.delete(f"user_ratings_{user_id}")
            print(f"🗑️ Cleared cache for user {user_id}")
            return True
        except Exception as e:
            print(f"⚠️ Error clearing cache for user {user_id}: {e}")
            return False
    
    @staticmethod
    def clear_movie_cache(tmdb_id: int) -> bool:
        """Clear movie-specific cache when movie data changes"""
        try:
            # Clear movie details cache
            cache.delete(f"movie_api_movie_details_tmdb_id_{tmdb_id}")
            # Clear movie ratings cache
            cache.delete(f"movie_ratings_{tmdb_id}")
            print(f"🗑️ Cleared cache for movie {tmdb_id}")
            return True
        except Exception as e:
            print(f"⚠️ Error clearing cache for movie {tmdb_id}: {e}")
            return False


# Cache statistics
class CacheStats:
    """Track cache performance statistics"""
    
    @staticmethod
    def get_cache_stats() -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            # This is a simplified version. In production, you might want to use Redis INFO
            return {
                'cache_backend': settings.CACHES['default']['BACKEND'],
                'cache_location': settings.CACHES['default']['LOCATION'],
                'cache_timeout': settings.CACHES['default']['TIMEOUT'],
                'cache_prefix': settings.CACHES['default']['KEY_PREFIX'],
            }
        except Exception as e:
            return {'error': str(e)} 