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
        self.read_token = settings.TMDB_READ_TOKEN
        self.base_url = settings.TMDB_BASE_URL
        self.session = requests.Session()
        
        # Debug: Check if credentials are loaded
        print(f"TMDB Service: API Key loaded: {'Yes' if self.api_key and self.api_key != 'your-tmdb-api-key' else 'No'}")
        print(f"TMDB Service: Read Token loaded: {'Yes' if self.read_token else 'No'}")
        print(f"TMDB Service: API Key value: {self.api_key[:10]}..." if self.api_key and len(self.api_key) > 10 else f"TMDB Service: API Key value: {self.api_key}")
        
        # Set up authentication headers
        if self.read_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.read_token}',
                'Content-Type': 'application/json'
            })
            print("TMDB Service: Using Bearer token authentication")
        else:
            print("TMDB Service: No read token available")
    
    def _make_request(self, endpoint, params=None):
        """Make a request to TMDB API with optimized performance"""
        print(f"TMDB Service: _make_request called for endpoint: {endpoint}")  # Debug
        
        # Check if we have a valid API key or read token
        if (self.api_key == 'your-tmdb-api-key' or not self.api_key or self.api_key == 'your-tmdb-api-key-here') and not self.read_token:
            print("TMDB Service: No valid API credentials, using mock data")  # Debug
            # Return mock data for development
            return self._get_mock_data(endpoint, params)
        
        url = f"{self.base_url}{endpoint}"
        params = params or {}
        
        # Use API key if no read token, otherwise use Bearer token
        if self.read_token:
            # Remove api_key from params when using Bearer token
            params.pop('api_key', None)
            print(f"TMDB Service: Using Bearer token for TMDB API call to: {endpoint}")  # Debug
        else:
            params['api_key'] = self.api_key
            print(f"TMDB Service: Using API key for TMDB API call to: {endpoint}")  # Debug
        
        try:
            print(f"TMDB Service: Making request to: {url} with params: {params}")  # Debug
            # Increased timeout for better reliability
            response = self.session.get(url, params=params, timeout=15)  # Increased from 10 to 15 seconds
            print(f"TMDB Service: Response status: {response.status_code}")  # Debug
            
            if response.status_code != 200:
                print(f"TMDB Service: Error response from TMDB API: {response.status_code} - {response.text}")  # Debug
                # Only fall back to mock data for 4xx and 5xx errors, not for rate limits
                if response.status_code >= 400:
                    print(f"TMDB Service: Falling back to mock data for endpoint: {endpoint}")  # Debug
                    return self._get_mock_data(endpoint, params)
                else:
                    # For other status codes, try to parse the response anyway
                    print(f"TMDB Service: Attempting to parse non-200 response")  # Debug
            
            response.raise_for_status()
            data = response.json()
            print(f"TMDB Service: Successfully parsed JSON response with {len(data.get('results', []))} results")  # Debug
            return data
        except requests.Timeout:
            print(f"TMDB Service: Timeout for {endpoint}")  # Debug
            print(f"TMDB Service: Falling back to mock data for endpoint: {endpoint}")  # Debug
            return self._get_mock_data(endpoint, params)
        except requests.RequestException as e:
            print(f"TMDB Service: RequestException for {endpoint}: {str(e)}")  # Debug
            print(f"TMDB Service: Falling back to mock data for endpoint: {endpoint}")  # Debug
            # Fall back to mock data if API fails
            return self._get_mock_data(endpoint, params)
        except Exception as e:
            print(f"TMDB Service: Unexpected error for {endpoint}: {str(e)}")  # Debug
            print(f"TMDB Service: Falling back to mock data for endpoint: {endpoint}")  # Debug
            # Fall back to mock data for any other errors
            return self._get_mock_data(endpoint, params)
    
    def _get_mock_data(self, endpoint, params=None):
        """Return mock data for development when API key is not configured"""
        print(f"TMDB Service: Using mock data for endpoint: {endpoint}")  # Debug
        
        # Get page number for consistent pagination
        page = params.get('page', 1) if params else 1
        
        # Generate 20 items per page for consistent pagination
        base_id = (page - 1) * 20
        
        # Different mock data based on endpoint
        if '/trending' in endpoint:
            mock_movies = [
                {
                    'id': base_id + 1, 'tmdb_id': 550 + base_id, 'title': f'Trending Movie {base_id + 1}', 'overview': f'This is trending movie number {base_id + 1}.',
                    'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                    'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                },
                {
                    'id': base_id + 2, 'tmdb_id': 13 + base_id, 'title': f'Trending Movie {base_id + 2}', 'overview': f'This is trending movie number {base_id + 2}.',
                    'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                    'vote_average': 8.8, 'vote_count': 2453, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                }
            ]
            # Add more items to reach 20
            for i in range(3, 21):
                mock_movies.append({
                    'id': base_id + i, 'tmdb_id': 1000 + base_id + i, 'title': f'Trending Movie {base_id + i}', 'overview': f'This is trending movie number {base_id + i}.',
                    'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                    'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                })
        elif '/discover/movie' in endpoint:
            mock_movies = [
                {
                    'id': base_id + 1, 'tmdb_id': 238 + base_id, 'title': f'Movie {base_id + 1}', 'overview': f'This is movie number {base_id + 1}.',
                    'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                    'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                },
                {
                    'id': base_id + 2, 'tmdb_id': 278 + base_id, 'title': f'Movie {base_id + 2}', 'overview': f'This is movie number {base_id + 2}.',
                    'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                    'vote_average': 8.7, 'vote_count': 23420, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                }
            ]
            # Add more items to reach 20
            for i in range(3, 21):
                mock_movies.append({
                    'id': base_id + i, 'tmdb_id': 2000 + base_id + i, 'title': f'Movie {base_id + i}', 'overview': f'This is movie number {base_id + i}.',
                    'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                    'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                })
        elif '/discover/tv' in endpoint:
            mock_movies = [
                {
                    'id': base_id + 1, 'tmdb_id': 1399 + base_id, 'title': f'TV Show {base_id + 1}', 'overview': f'This is TV show number {base_id + 1}.',
                    'poster_path': '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', 'backdrop_path': '/suopoADq0k8YZX4AGW1M9cdDqQd.jpg',
                    'vote_average': 9.3, 'vote_count': 4502, 'release_date': '2011-04-17', 'genre_ids': [10765, 18, 10759], 'media_type': 'tv'
                },
                {
                    'id': base_id + 2, 'tmdb_id': 1396 + base_id, 'title': f'TV Show {base_id + 2}', 'overview': f'This is TV show number {base_id + 2}.',
                    'poster_path': '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', 'backdrop_path': '/tsRy63Q5W3D0FM2Wp9oRcFpngxK.jpg',
                    'vote_average': 9.5, 'vote_count': 3123, 'release_date': '2008-01-20', 'genre_ids': [18, 80], 'media_type': 'tv'
                }
            ]
            # Add more items to reach 20
            for i in range(3, 21):
                mock_movies.append({
                    'id': base_id + i, 'tmdb_id': 3000 + base_id + i, 'title': f'TV Show {base_id + i}', 'overview': f'This is TV show number {base_id + i}.',
                    'poster_path': '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', 'backdrop_path': '/suopoADq0k8YZX4AGW1M9cdDqQd.jpg',
                    'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '2011-04-17', 'genre_ids': [10765, 18, 10759], 'media_type': 'tv'
                })
        elif '/movie/top_rated' in endpoint:
            mock_movies = [
                {
                    'id': base_id + 1, 'tmdb_id': 278 + base_id, 'title': f'Top Rated Movie {base_id + 1}', 'overview': f'This is top rated movie number {base_id + 1}.',
                    'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                    'vote_average': 8.7, 'vote_count': 23420, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                },
                {
                    'id': base_id + 2, 'tmdb_id': 238 + base_id, 'title': f'Top Rated Movie {base_id + 2}', 'overview': f'This is top rated movie number {base_id + 2}.',
                    'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                    'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                }
            ]
            # Add more items to reach 20
            for i in range(3, 21):
                mock_movies.append({
                    'id': base_id + i, 'tmdb_id': 4000 + base_id + i, 'title': f'Top Rated Movie {base_id + i}', 'overview': f'This is top rated movie number {base_id + i}.',
                    'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                    'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                })
        elif '/search/multi' in endpoint:
            # Mock search results - return different results based on query
            query = params.get('query', '').lower() if params else ''
            
            if 'action' in query or 'fight' in query:
                mock_movies = [
                    {
                        'id': base_id + 1, 'tmdb_id': 550 + base_id, 'title': f'Action Movie {base_id + 1}', 'overview': f'This is action movie number {base_id + 1}.',
                        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                    },
                    {
                        'id': base_id + 2, 'tmdb_id': 49524 + base_id, 'title': f'Action Movie {base_id + 2}', 'overview': f'This is action movie number {base_id + 2}.',
                        'poster_path': '/85YzDqg6ZJhoP4Vku8ze5K5Px5h.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.4, 'vote_count': 12345, 'release_date': '2012-07-20', 'genre_ids': [28, 80, 18], 'media_type': 'movie'
                    }
                ]
                # Add more items to reach 20
                for i in range(3, 21):
                    mock_movies.append({
                        'id': base_id + i, 'tmdb_id': 50000 + base_id + i, 'title': f'Action Movie {base_id + i}', 'overview': f'This is action movie number {base_id + i}.',
                        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                    })
            elif 'drama' in query or 'godfather' in query:
                mock_movies = [
                    {
                        'id': base_id + 1, 'tmdb_id': 238 + base_id, 'title': f'Drama Movie {base_id + 1}', 'overview': f'This is drama movie number {base_id + 1}.',
                        'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                        'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                    },
                    {
                        'id': base_id + 2, 'tmdb_id': 278 + base_id, 'title': f'Drama Movie {base_id + 2}', 'overview': f'This is drama movie number {base_id + 2}.',
                        'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                        'vote_average': 8.7, 'vote_count': 23420, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                    }
                ]
                # Add more items to reach 20
                for i in range(3, 21):
                    mock_movies.append({
                        'id': base_id + i, 'tmdb_id': 60000 + base_id + i, 'title': f'Drama Movie {base_id + i}', 'overview': f'This is drama movie number {base_id + i}.',
                        'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                        'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                    })
            elif 'comedy' in query or 'forrest' in query:
                mock_movies = [
                    {
                        'id': base_id + 1, 'tmdb_id': 13 + base_id, 'title': f'Comedy Movie {base_id + 1}', 'overview': f'This is comedy movie number {base_id + 1}.',
                        'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                        'vote_average': 8.8, 'vote_count': 2453, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                    }
                ]
                # Add more items to reach 20
                for i in range(2, 21):
                    mock_movies.append({
                        'id': base_id + i, 'tmdb_id': 70000 + base_id + i, 'title': f'Comedy Movie {base_id + i}', 'overview': f'This is comedy movie number {base_id + i}.',
                        'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                        'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                    })
            elif 'tv' in query or 'show' in query or 'series' in query:
                mock_movies = [
                    {
                        'id': base_id + 1, 'tmdb_id': 1399 + base_id, 'title': f'TV Show {base_id + 1}', 'overview': f'This is TV show number {base_id + 1}.',
                        'poster_path': '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', 'backdrop_path': '/suopoADq0k8YZX4AGW1M9cdDqQd.jpg',
                        'vote_average': 9.3, 'vote_count': 4502, 'release_date': '2011-04-17', 'genre_ids': [10765, 18, 10759], 'media_type': 'tv'
                    },
                    {
                        'id': base_id + 2, 'tmdb_id': 1396 + base_id, 'title': f'TV Show {base_id + 2}', 'overview': f'This is TV show number {base_id + 2}.',
                        'poster_path': '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', 'backdrop_path': '/tsRy63Q5W3D0FM2Wp9oRcFpngxK.jpg',
                        'vote_average': 9.5, 'vote_count': 3123, 'release_date': '2008-01-20', 'genre_ids': [18, 80], 'media_type': 'tv'
                    }
                ]
                # Add more items to reach 20
                for i in range(3, 21):
                    mock_movies.append({
                        'id': base_id + i, 'tmdb_id': 80000 + base_id + i, 'title': f'TV Show {base_id + i}', 'overview': f'This is TV show number {base_id + i}.',
                        'poster_path': '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', 'backdrop_path': '/suopoADq0k8YZX4AGW1M9cdDqQd.jpg',
                        'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '2011-04-17', 'genre_ids': [10765, 18, 10759], 'media_type': 'tv'
                    })
            else:
                # Default search results - return all movies
                mock_movies = [
                    {
                        'id': base_id + 1, 'tmdb_id': 550 + base_id, 'title': f'Search Result {base_id + 1}', 'overview': f'This is search result number {base_id + 1}.',
                        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                    },
                    {
                        'id': base_id + 2, 'tmdb_id': 13 + base_id, 'title': f'Search Result {base_id + 2}', 'overview': f'This is search result number {base_id + 2}.',
                        'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                        'vote_average': 8.8, 'vote_count': 2453, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                    },
                    {
                        'id': base_id + 3, 'tmdb_id': 238 + base_id, 'title': f'Search Result {base_id + 3}', 'overview': f'This is search result number {base_id + 3}.',
                        'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                        'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                    }
                ]
                # Add more items to reach 20
                for i in range(4, 21):
                    mock_movies.append({
                        'id': base_id + i, 'tmdb_id': 90000 + base_id + i, 'title': f'Search Result {base_id + i}', 'overview': f'This is search result number {base_id + i}.',
                        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                    })
        else:
            # Default mock data - return 20 items
            mock_movies = []
            for i in range(1, 21):
                mock_movies.append({
                    'id': base_id + i, 'tmdb_id': 10000 + base_id + i, 'title': f'Default Movie {base_id + i}', 'overview': f'This is default movie number {base_id + i}.',
                    'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                    'vote_average': 8.0 + (i % 10) * 0.1, 'vote_count': 1000 + i * 100, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                })
        
        return {
            'page': page,
            'results': mock_movies,
            'total_pages': 10,  # Always return 10 pages for consistent pagination
            'total_results': 200  # Always return 200 total results
        }
    
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
        print(f"TMDB Service: Getting trending movies, page={page}")  # Debug
        cache_key = self._get_cache_key('/trending/movie/week', {'page': page})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            print("TMDB Service: Using cached trending data")  # Debug
            return cached_data
        
        data = self._make_request('/trending/movie/week', {'page': page})
        print(f"TMDB Service: Got {len(data.get('results', []))} trending items")  # Debug
        self._set_cached_data(cache_key, data)
        return data
    
    def get_movies(self, page=1, sort_by='popularity.desc'):
        """Get movies from TMDB"""
        print(f"TMDB Service: Getting movies, page={page}, sort_by={sort_by}")  # Debug
        cache_key = self._get_cache_key('/discover/movie', {'page': page, 'sort_by': sort_by})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            print("TMDB Service: Using cached movies data")  # Debug
            return cached_data
        
        data = self._make_request('/discover/movie', {
            'page': page,
            'sort_by': sort_by
        })
        print(f"TMDB Service: Got {len(data.get('results', []))} movie items")  # Debug
        self._set_cached_data(cache_key, data)
        return data
    
    def get_tv_shows(self, page=1, sort_by='popularity.desc'):
        """Get TV shows from TMDB"""
        print(f"TMDB Service: Getting TV shows, page={page}, sort_by={sort_by}")  # Debug
        cache_key = self._get_cache_key('/discover/tv', {'page': page, 'sort_by': sort_by})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            print("TMDB Service: Using cached TV data")  # Debug
            return cached_data
        
        data = self._make_request('/discover/tv', {
            'page': page,
            'sort_by': sort_by
        })
        print(f"TMDB Service: Got {len(data.get('results', []))} TV items")  # Debug
        self._set_cached_data(cache_key, data)
        return data
    
    def get_top_rated_movies(self, page=1):
        """Get top rated movies from TMDB"""
        print(f"TMDB Service: Getting top rated movies, page={page}")  # Debug
        cache_key = self._get_cache_key('/movie/top_rated', {'page': page})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            print("TMDB Service: Using cached top rated data")  # Debug
            return cached_data
        
        data = self._make_request('/movie/top_rated', {'page': page})
        print(f"TMDB Service: Got {len(data.get('results', []))} top rated items")  # Debug
        self._set_cached_data(cache_key, data)
        return data
    
    def search_multi(self, query, page=1):
        """Search movies, TV shows, and people"""
        print(f"TMDB Service: search_multi called with query: '{query}', page: {page}")  # Debug
        
        cache_key = self._get_cache_key('/search/multi', {'query': query, 'page': page})
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            print(f"TMDB Service: Using cached search data for query: '{query}'")  # Debug
            return cached_data
        
        try:
            print(f"TMDB Service: Making search request to TMDB API for query: '{query}'")  # Debug
            data = self._make_request('/search/multi', {
                'query': query,
                'page': page
            })
            print(f"TMDB Service: Search request successful, got {len(data.get('results', []))} results")  # Debug
            self._set_cached_data(cache_key, data)
            return data
        except Exception as e:
            print(f"TMDB Service: Error in search_multi for query '{query}': {str(e)}")  # Debug
            import traceback
            print(f"TMDB Service: Full traceback: {traceback.format_exc()}")  # Debug
            # Return empty results instead of raising exception
            return {
                'page': page,
                'results': [],
                'total_pages': 0,
                'total_results': 0
            }

    def search_movies_and_tv(self, query, page=1):
        """Search movies and TV shows separately for consistent results"""
        print(f"TMDB Service: search_movies_and_tv called with query: '{query}', page: {page}")  # Debug
        
        try:
            # Search movies
            print(f"TMDB Service: Searching movies for query: '{query}', page: {page}")  # Debug
            movies_data = self._make_request('/search/movie', {
                'query': query,
                'page': page
            })
            
            # Search TV shows
            print(f"TMDB Service: Searching TV shows for query: '{query}', page: {page}")  # Debug
            tv_data = self._make_request('/search/tv', {
                'query': query,
                'page': page
            })
            
            # Combine results
            combined_results = []
            
            # Add movies with media_type
            for movie in movies_data.get('results', []):
                movie['media_type'] = 'movie'
                combined_results.append(movie)
            
            # Add TV shows with media_type
            for tv in tv_data.get('results', []):
                tv['media_type'] = 'tv'
                combined_results.append(tv)
            
            # Sort by popularity (vote_average * vote_count)
            combined_results.sort(key=lambda x: (x.get('vote_average', 0) * x.get('vote_count', 0)), reverse=True)
            
            # Calculate combined totals
            total_results = movies_data.get('total_results', 0) + tv_data.get('total_results', 0)
            total_pages = max(movies_data.get('total_pages', 0), tv_data.get('total_pages', 0))
            
            print(f"TMDB Service: Combined search results - {len(combined_results)} items (movies: {len(movies_data.get('results', []))}, TV: {len(tv_data.get('results', []))})")  # Debug
            
            return {
                'page': page,
                'results': combined_results,
                'total_pages': total_pages,
                'total_results': total_results
            }
            
        except Exception as e:
            print(f"TMDB Service: Error in search_movies_and_tv for query '{query}': {str(e)}")  # Debug
            import traceback
            print(f"TMDB Service: Full traceback: {traceback.format_exc()}")  # Debug
            # Return empty results instead of raising exception
            return {
                'page': page,
                'results': [],
                'total_pages': 0,
                'total_results': 0
            }
    
    def get_movie_details(self, movie_id):
        """Get detailed movie information with credits, videos, reviews, and similar movies"""
        cache_key = self._get_cache_key(f'/movie/{movie_id}')
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        # Fetch comprehensive movie data with all append_to_response parameters
        data = self._make_request(f'/movie/{movie_id}', {
            'append_to_response': 'credits,videos,reviews,similar'
        })
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
        try:
            # Handle title/name for movies vs TV shows
            title = tmdb_data.get('title') or tmdb_data.get('name', '')
            if not title:
                print(f"TMDB Service: Warning - No title found for item {tmdb_data.get('id')}")  # Debug
                return None
            
            # Determine media type - TV shows from /discover/tv endpoint are TV shows
            media_type = tmdb_data.get('media_type', 'movie')
            if 'first_air_date' in tmdb_data:
                media_type = 'tv'
            
            movie_data = {
                'tmdb_id': tmdb_data['id'],
                'title': title,
                'overview': tmdb_data.get('overview', ''),
                'poster_path': tmdb_data.get('poster_path'),
                'backdrop_path': tmdb_data.get('backdrop_path'),
                'vote_average': tmdb_data.get('vote_average', 0.0),
                'vote_count': tmdb_data.get('vote_count', 0),
                'popularity': tmdb_data.get('popularity', 0.0),
                'genre_ids': tmdb_data.get('genre_ids', []),
                'media_type': media_type,
                'tagline': tmdb_data.get('tagline', ''),
                'imdb_id': tmdb_data.get('imdb_id', ''),
                'original_language': tmdb_data.get('original_language', ''),
                'budget': tmdb_data.get('budget', 0),
                'revenue': tmdb_data.get('revenue', 0),
                'status': tmdb_data.get('status', ''),
                'runtime': tmdb_data.get('runtime', 0),
                'production_companies': tmdb_data.get('production_companies', []),
                'production_countries': tmdb_data.get('production_countries', []),
                'spoken_languages': tmdb_data.get('spoken_languages', []),
            }
            
            # Handle release date
            release_date = tmdb_data.get('release_date') or tmdb_data.get('first_air_date')
            if release_date:
                try:
                    from datetime import datetime
                    movie_data['release_date'] = datetime.strptime(release_date, '%Y-%m-%d').date()
                except Exception as e:
                    print(f"TMDB Service: Error parsing date '{release_date}': {str(e)}")  # Debug
                    movie_data['release_date'] = None
            else:
                movie_data['release_date'] = None
            
            # Check if movie already exists to avoid unnecessary updates
            existing_movie = Movie.objects.filter(tmdb_id=movie_data['tmdb_id']).first()
            if existing_movie:
                # Only update if data has changed significantly
                if (existing_movie.vote_average != movie_data['vote_average'] or 
                    existing_movie.popularity != movie_data['popularity'] or
                    existing_movie.vote_count != movie_data['vote_count']):
                    
                    for key, value in movie_data.items():
                        setattr(existing_movie, key, value)
                    existing_movie.save()
                    print(f"TMDB Service: Updated movie '{existing_movie.title}'")  # Debug
                else:
                    print(f"TMDB Service: Using cached movie '{existing_movie.title}'")  # Debug
                return existing_movie
            else:
                # Create new movie
                movie = Movie.objects.create(**movie_data)
                print(f"TMDB Service: Created movie '{movie.title}'")  # Debug
                return movie
            
        except Exception as e:
            print(f"TMDB Service: Error syncing movie {tmdb_data.get('title', tmdb_data.get('name', 'Unknown'))}: {str(e)}")  # Debug
            import traceback
            print(f"TMDB Service: Full traceback: {traceback.format_exc()}")  # Debug
            raise e 