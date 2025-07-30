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
        # Check if we have a valid API key or read token
        if (self.api_key == 'your-tmdb-api-key' or not self.api_key) and not self.read_token:
            # Return mock data for development
            return self._get_mock_data(endpoint, params)
        
        url = f"{self.base_url}{endpoint}"
        params = params or {}
        
        # Use API key if no read token, otherwise use Bearer token
        if self.read_token:
            # Remove api_key from params when using Bearer token
            params.pop('api_key', None)
            print(f"Using Bearer token for TMDB API call to: {endpoint}")  # Debug
        else:
            params['api_key'] = self.api_key
            print(f"Using API key for TMDB API call to: {endpoint}")  # Debug
        
        try:
            print(f"Making request to: {url} with params: {params}")  # Debug
            # Reduced timeout for faster failure detection
            response = self.session.get(url, params=params, timeout=10)  # Reduced from 30 to 10 seconds
            print(f"Response status: {response.status_code}")  # Debug
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"TMDB API error for {endpoint}: {str(e)}")  # Debug
            print(f"Falling back to mock data for endpoint: {endpoint}")  # Debug
            # Fall back to mock data if API fails
            return self._get_mock_data(endpoint, params)
        except Exception as e:
            print(f"Unexpected error for {endpoint}: {str(e)}")  # Debug
            print(f"Falling back to mock data for endpoint: {endpoint}")  # Debug
            # Fall back to mock data for any other errors
            return self._get_mock_data(endpoint, params)
    
    def _get_mock_data(self, endpoint, params=None):
        """Return mock data for development when API key is not configured"""
        print(f"TMDB Service: Using mock data for endpoint: {endpoint}")  # Debug
        
        # Different mock data based on endpoint
        if '/trending' in endpoint:
            mock_movies = [
                {
                    'id': 1, 'tmdb_id': 550, 'title': 'Fight Club', 'overview': 'A nameless first-person narrator attends support groups in attempt to subdue his emotional state and relieve his insomniac state.',
                    'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                    'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                },
                {
                    'id': 2, 'tmdb_id': 13, 'title': 'Forrest Gump', 'overview': 'A man with a low IQ has accomplished great things in his life and been present during significant historic events.',
                    'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                    'vote_average': 8.8, 'vote_count': 2453, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                }
            ]
        elif '/discover/movie' in endpoint:
            mock_movies = [
                {
                    'id': 3, 'tmdb_id': 238, 'title': 'The Godfather', 'overview': 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
                    'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                    'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                },
                {
                    'id': 4, 'tmdb_id': 278, 'title': 'The Shawshank Redemption', 'overview': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                    'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                    'vote_average': 8.7, 'vote_count': 23420, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                }
            ]
        elif '/discover/tv' in endpoint:
            mock_movies = [
                {
                    'id': 5, 'tmdb_id': 1399, 'title': 'Game of Thrones', 'overview': 'Seven noble families fight for control of the mythical land of Westeros.',
                    'poster_path': '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', 'backdrop_path': '/suopoADq0k8YZX4AGW1M9cdDqQd.jpg',
                    'vote_average': 9.3, 'vote_count': 4502, 'release_date': '2011-04-17', 'genre_ids': [10765, 18, 10759], 'media_type': 'tv'
                },
                {
                    'id': 6, 'tmdb_id': 1396, 'title': 'Breaking Bad', 'overview': 'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer.',
                    'poster_path': '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', 'backdrop_path': '/tsRy63Q5W3D0FM2Wp9oRcFpngxK.jpg',
                    'vote_average': 9.5, 'vote_count': 3123, 'release_date': '2008-01-20', 'genre_ids': [18, 80], 'media_type': 'tv'
                }
            ]
        elif '/movie/top_rated' in endpoint:
            mock_movies = [
                {
                    'id': 7, 'tmdb_id': 278, 'title': 'The Shawshank Redemption', 'overview': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                    'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                    'vote_average': 8.7, 'vote_count': 23420, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                },
                {
                    'id': 8, 'tmdb_id': 238, 'title': 'The Godfather', 'overview': 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
                    'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                    'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                }
            ]
        elif '/search/multi' in endpoint:
            # Mock search results - return different results based on query
            query = params.get('query', '').lower() if params else ''
            
            if 'action' in query or 'fight' in query:
                mock_movies = [
                    {
                        'id': 1, 'tmdb_id': 550, 'title': 'Fight Club', 'overview': 'A nameless first-person narrator attends support groups in attempt to subdue his emotional state and relieve his insomniac state.',
                        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                    },
                    {
                        'id': 9, 'tmdb_id': 49524, 'title': 'The Dark Knight Rises', 'overview': 'Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent\'s crimes to protect the late attorney\'s reputation.',
                        'poster_path': '/85YzDqg6ZJhoP4Vku8ze5K5Px5h.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.4, 'vote_count': 12345, 'release_date': '2012-07-20', 'genre_ids': [28, 80, 18], 'media_type': 'movie'
                    }
                ]
            elif 'drama' in query or 'godfather' in query:
                mock_movies = [
                    {
                        'id': 3, 'tmdb_id': 238, 'title': 'The Godfather', 'overview': 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
                        'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                        'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                    },
                    {
                        'id': 4, 'tmdb_id': 278, 'title': 'The Shawshank Redemption', 'overview': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                        'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'backdrop_path': '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
                        'vote_average': 8.7, 'vote_count': 23420, 'release_date': '1994-09-23', 'genre_ids': [18, 80], 'media_type': 'movie'
                    }
                ]
            elif 'comedy' in query or 'forrest' in query:
                mock_movies = [
                    {
                        'id': 2, 'tmdb_id': 13, 'title': 'Forrest Gump', 'overview': 'A man with a low IQ has accomplished great things in his life and been present during significant historic events.',
                        'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                        'vote_average': 8.8, 'vote_count': 2453, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                    }
                ]
            elif 'tv' in query or 'show' in query or 'series' in query:
                mock_movies = [
                    {
                        'id': 5, 'tmdb_id': 1399, 'title': 'Game of Thrones', 'overview': 'Seven noble families fight for control of the mythical land of Westeros.',
                        'poster_path': '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', 'backdrop_path': '/suopoADq0k8YZX4AGW1M9cdDqQd.jpg',
                        'vote_average': 9.3, 'vote_count': 4502, 'release_date': '2011-04-17', 'genre_ids': [10765, 18, 10759], 'media_type': 'tv'
                    },
                    {
                        'id': 6, 'tmdb_id': 1396, 'title': 'Breaking Bad', 'overview': 'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer.',
                        'poster_path': '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', 'backdrop_path': '/tsRy63Q5W3D0FM2Wp9oRcFpngxK.jpg',
                        'vote_average': 9.5, 'vote_count': 3123, 'release_date': '2008-01-20', 'genre_ids': [18, 80], 'media_type': 'tv'
                    }
                ]
            else:
                # Default search results - return all movies
                mock_movies = [
                    {
                        'id': 1, 'tmdb_id': 550, 'title': 'Fight Club', 'overview': 'A nameless first-person narrator attends support groups in attempt to subdue his emotional state and relieve his insomniac state.',
                        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                        'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                    },
                    {
                        'id': 2, 'tmdb_id': 13, 'title': 'Forrest Gump', 'overview': 'A man with a low IQ has accomplished great things in his life and been present during significant historic events.',
                        'poster_path': '/arw2vcBveWOVZr6pxd9TDd1TdQa.jpg', 'backdrop_path': '/yE5d3BUhE8hCnkMUJOc1Unv402Y.jpg',
                        'vote_average': 8.8, 'vote_count': 2453, 'release_date': '1994-06-23', 'genre_ids': [35, 18], 'media_type': 'movie'
                    },
                    {
                        'id': 3, 'tmdb_id': 238, 'title': 'The Godfather', 'overview': 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
                    'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
                    'vote_average': 9.2, 'vote_count': 1564, 'release_date': '1972-03-14', 'genre_ids': [18, 80], 'media_type': 'movie'
                }
            ]
        else:
            # Default mock data
            mock_movies = [
                {
                    'id': 1, 'tmdb_id': 550, 'title': 'Fight Club', 'overview': 'A nameless first-person narrator attends support groups in attempt to subdue his emotional state and relieve his insomniac state.',
                    'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'backdrop_path': '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
                    'vote_average': 8.8, 'vote_count': 3439, 'release_date': '1999-10-15', 'genre_ids': [18], 'media_type': 'movie'
                }
            ]
        
        return {
            'page': 1,
            'results': mock_movies,
            'total_pages': 1,
            'total_results': len(mock_movies)
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