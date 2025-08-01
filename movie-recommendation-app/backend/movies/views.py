from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    MovieSerializer, 
    MovieDetailSerializer,
    FavoriteSerializer, 
    WatchlistSerializer,
    MovieRatingSerializer
)
from .models import Movie, Favorite, Watchlist, MovieRating
from .services import TMDBService
from django.utils import timezone
import asyncio
from concurrent.futures import ThreadPoolExecutor
from django.core.cache import cache


class MovieListView(generics.ListAPIView):
    """View for listing movies with TMDB integration"""
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]
    # Removed filter_backends and filterset_fields to avoid JSONField issues
    
    def get_queryset(self):
        tmdb_service = TMDBService()
        
        # Get movie type from query params
        movie_type = self.request.query_params.get('type', 'movies')
        page = int(self.request.query_params.get('page', 1))
        
        print(f"Requesting movies with type: {movie_type}, page: {page}")  # Debug
        
        try:
            # Handle different movie types
            if movie_type == 'trending':
                print("Getting trending movies")  # Debug
                data = tmdb_service.get_trending_movies(page=page)
            elif movie_type == 'top_rated':
                print("Getting top rated movies")  # Debug
                data = tmdb_service.get_top_rated_movies(page=page)
            elif movie_type == 'tv':
                print("Getting TV shows")  # Debug
                data = tmdb_service.get_tv_shows(page=page)
            elif movie_type == 'movies':
                print("Getting movies")  # Debug
                data = tmdb_service.get_movies(page=page)
            else:
                print(f"Unknown type: {movie_type}, defaulting to movies")  # Debug
                data = tmdb_service.get_movies(page=page)
            
            print(f"TMDB Data received: {len(data.get('results', []))} items")  # Debug
            print(f"First few items: {data.get('results', [])[:3]}")  # Debug
            
            # Store the TMDB data for pagination info
            self.tmdb_data = data  # Store for use in list() method
            
            # Start background sync process
            self._start_background_sync(data.get('results', []), tmdb_service)
            
            # Return movies from database that match the TMDB IDs for immediate display
            tmdb_ids = [item.get('id') for item in data.get('results', [])]
            existing_movies = Movie.objects.filter(tmdb_id__in=tmdb_ids)
            
            # Create a mapping of tmdb_id to movie for quick lookup
            existing_movie_map = {movie.tmdb_id: movie for movie in existing_movies}
            
            # Create a list of movies in the same order as TMDB results
            ordered_movies = []
            for item in data.get('results', []):
                tmdb_id = item.get('id')
                if tmdb_id in existing_movie_map:
                    ordered_movies.append(existing_movie_map[tmdb_id])
                else:
                    # Create a temporary movie object for display if not in database yet
                    temp_movie = Movie(
                        tmdb_id=tmdb_id,
                        title=item.get('title') or item.get('name', ''),
                        overview=item.get('overview', ''),
                        poster_path=item.get('poster_path'),
                        backdrop_path=item.get('backdrop_path'),
                        vote_average=item.get('vote_average', 0.0),
                        vote_count=item.get('vote_count', 0),
                        popularity=item.get('popularity', 0.0),
                        genre_ids=item.get('genre_ids', []),
                        media_type=item.get('media_type', 'movie'),
                        release_date=None  # Will be set during background sync
                    )
                    ordered_movies.append(temp_movie)
            
            print(f"Returning {len(ordered_movies)} movies for immediate display")  # Debug
            return ordered_movies
            
        except Exception as e:
            print(f"Error in get_queryset: {e}")  # Debug
            # Fallback to database if TMDB fails
            return Movie.objects.all()
    
    def _start_background_sync(self, tmdb_results, tmdb_service):
        """Start background sync process for movies"""
        try:
            # Use ThreadPoolExecutor for background sync to avoid blocking
            executor = ThreadPoolExecutor(max_workers=4)
            
            def sync_movie_batch():
                """Sync a batch of movies to database"""
                synced_count = 0
                for item in tmdb_results:
                    try:
                        # Handle TV shows from /discover/tv endpoint (they don't have media_type field)
                        is_tv_show = 'first_air_date' in item
                        is_movie = item.get('media_type') == 'movie' or ('release_date' in item and not is_tv_show)
                        
                        if is_movie or is_tv_show:
                            print(f"Background sync: Syncing {item.get('title', item.get('name', 'Unknown'))}")  # Debug
                            movie = tmdb_service.sync_movie_to_db(item)
                            if movie:
                                synced_count += 1
                                print(f"Background sync: Successfully synced {movie.title}")  # Debug
                    except Exception as e:
                        print(f"Background sync: Error syncing movie {item.get('title', item.get('name', 'Unknown'))}: {e}")  # Debug
                
                print(f"Background sync: Completed syncing {synced_count} movies")  # Debug
            
            # Submit the sync task to run in background
            executor.submit(sync_movie_batch)
            print("Background sync: Started async movie sync process")  # Debug
            
        except Exception as e:
            print(f"Background sync: Error starting sync process: {e}")  # Debug
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """Override list method to return TMDB format instead of Django pagination"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Use stored TMDB data for pagination info (avoid double API call)
        page = int(request.query_params.get('page', 1))
        
        if hasattr(self, 'tmdb_data'):
            # Return TMDB format with actual pagination data
            return Response({
                'page': page,
                'results': serializer.data,
                'total_pages': self.tmdb_data.get('total_pages', 1),
                'total_results': self.tmdb_data.get('total_results', len(serializer.data))
            })
        else:
            # Fallback if no TMDB data available
            return Response({
                'page': page,
                'results': serializer.data,
                'total_pages': 1,
                'total_results': len(serializer.data)
            })


class MovieDetailView(generics.RetrieveAPIView):
    """View for movie details with enhanced data"""
    serializer_class = MovieDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'tmdb_id'
    
    def get_object(self):
        tmdb_id = self.kwargs.get('tmdb_id')
        tmdb_service = TMDBService()
        
        try:
            print(f"MovieDetailView: Attempting to get movie with TMDB ID: {tmdb_id}")  # Debug
            
            # First try to get from database
            try:
                movie = Movie.objects.get(tmdb_id=tmdb_id)
                print(f"MovieDetailView: Found movie in database: {movie.title}")  # Debug
                
                # Get enhanced data from TMDB API
                try:
                    enhanced_data = tmdb_service.get_movie_details(tmdb_id)
                    print(f"MovieDetailView: Got enhanced data from TMDB for movie: {enhanced_data.get('title', 'Unknown')}")  # Debug
                    
                    # Attach enhanced data to the movie object
                    movie.credits = enhanced_data.get('credits')
                    movie.videos = enhanced_data.get('videos')
                    movie.reviews = enhanced_data.get('reviews')
                    movie.similar = enhanced_data.get('similar')
                    
                    # Update movie with additional fields if they exist
                    additional_fields = ['tagline', 'imdb_id', 'original_language', 'budget', 'revenue', 'status', 
                                      'production_companies', 'production_countries', 'spoken_languages', 'runtime']
                    for field in additional_fields:
                        if field in enhanced_data:
                            setattr(movie, field, enhanced_data[field])
                    
                    return movie
                except Exception as e:
                    print(f"MovieDetailView: Error fetching enhanced data from TMDB: {str(e)}")  # Debug
                    # Return movie without enhanced data if TMDB fails
                    return movie
                    
            except Movie.DoesNotExist:
                print(f"MovieDetailView: Movie not found in database, fetching from TMDB")  # Debug
                
                # Try to get from TMDB and sync to database
                try:
                    enhanced_data = tmdb_service.get_movie_details(tmdb_id)
                    print(f"MovieDetailView: Got enhanced data from TMDB for movie: {enhanced_data.get('title', 'Unknown')}")  # Debug
                    
                    # Sync basic movie data to database
                    movie = tmdb_service.sync_movie_to_db(enhanced_data)
                    if movie:
                        print(f"MovieDetailView: Successfully synced movie to database: {movie.title}")  # Debug
                        
                        # Attach enhanced data to the movie object
                        movie.credits = enhanced_data.get('credits')
                        movie.videos = enhanced_data.get('videos')
                        movie.reviews = enhanced_data.get('reviews')
                        movie.similar = enhanced_data.get('similar')
                        
                        # Update movie with additional fields if they exist
                        additional_fields = ['tagline', 'imdb_id', 'original_language', 'budget', 'revenue', 'status', 
                                          'production_companies', 'production_countries', 'spoken_languages', 'runtime']
                        for field in additional_fields:
                            if field in enhanced_data:
                                setattr(movie, field, enhanced_data[field])
                        
                        return movie
                    else:
                        print(f"MovieDetailView: Failed to sync movie to database")  # Debug
                        raise Movie.DoesNotExist()
                except Exception as e:
                    print(f"MovieDetailView: Error fetching from TMDB: {str(e)}")  # Debug
                    raise Movie.DoesNotExist()
                    
        except Movie.DoesNotExist:
            print(f"MovieDetailView: Movie with TMDB ID {tmdb_id} not found")  # Debug
            from django.http import Http404
            raise Http404(f"Movie with TMDB ID {tmdb_id} not found")
        except Exception as e:
            print(f"MovieDetailView: Unexpected error: {str(e)}")  # Debug
            from django.http import Http404
            raise Http404(f"Error retrieving movie: {str(e)}")
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class SearchView(generics.ListAPIView):
    """View for searching movies and TV shows"""
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        page = int(self.request.query_params.get('page', 1))
        print(f"SearchView: Received search query: '{query}', page: {page}")  # Debug
        
        if not query:
            print("SearchView: No query provided, returning empty queryset")  # Debug
            return Movie.objects.none()
        
        tmdb_service = TMDBService()
        
        try:
            print(f"SearchView: Calling TMDB search_movies_and_tv with query: '{query}', page: {page}")  # Debug
            data = tmdb_service.search_movies_and_tv(query, page=page)
            print(f"SearchView: TMDB search returned {len(data.get('results', []))} results for page {page}")  # Debug
            
            # Debug: Show breakdown of media types
            all_results = data.get('results', [])
            media_types = {}
            for item in all_results:
                media_type = item.get('media_type', 'unknown')
                media_types[media_type] = media_types.get(media_type, 0) + 1
            print(f"SearchView: Media type breakdown for page {page}: {media_types}")  # Debug
            
            # Debug: Show first few movie titles
            first_movies = data.get('results', [])[:3]
            print(f"SearchView: First 3 movies for page {page}: {[m.get('title', m.get('name', 'Unknown')) for m in first_movies]}")  # Debug
            
            # Store the TMDB data for pagination info
            self.tmdb_data = data
            
            # Start background sync process for search results
            self._start_background_sync_search(data.get('results', []), tmdb_service)
            
            # Return movies from database that match the TMDB IDs for immediate display
            tmdb_ids = [item.get('id') for item in data.get('results', []) if item.get('media_type') in ['movie', 'tv']]
            print(f"SearchView: Found {len(tmdb_ids)} movie/TV IDs from TMDB results")  # Debug
            
            existing_movies = Movie.objects.filter(tmdb_id__in=tmdb_ids)
            print(f"SearchView: Found {existing_movies.count()} existing movies in database")  # Debug
            
            # Create a mapping of tmdb_id to movie for quick lookup
            existing_movie_map = {movie.tmdb_id: movie for movie in existing_movies}
            
            # Create a list of movies in the same order as TMDB results
            ordered_movies = []
            for item in data.get('results', []):
                if item.get('media_type') in ['movie', 'tv']:
                    tmdb_id = item.get('id')
                    if tmdb_id in existing_movie_map:
                        ordered_movies.append(existing_movie_map[tmdb_id])
                    else:
                        # Create a temporary movie object for display if not in database yet
                        temp_movie = Movie(
                            tmdb_id=tmdb_id,
                            title=item.get('title') or item.get('name', ''),
                            overview=item.get('overview', ''),
                            poster_path=item.get('poster_path'),
                            backdrop_path=item.get('backdrop_path'),
                            vote_average=item.get('vote_average', 0.0),
                            vote_count=item.get('vote_count', 0),
                            popularity=item.get('popularity', 0.0),
                            genre_ids=item.get('genre_ids', []),
                            media_type=item.get('media_type', 'movie'),
                            release_date=None  # Will be set during background sync
                        )
                        ordered_movies.append(temp_movie)
            
            print(f"SearchView: Returning {len(ordered_movies)} movies for display")  # Debug
            return ordered_movies
            
        except Exception as e:
            print(f"SearchView: Error in search_multi: {str(e)}")  # Debug
            import traceback
            print(f"SearchView: Full traceback: {traceback.format_exc()}")  # Debug
            
            # Fallback to database search
            try:
                fallback_results = Movie.objects.filter(title__icontains=query)
                print(f"SearchView: Fallback search returned {fallback_results.count()} results")  # Debug
                return fallback_results
            except Exception as fallback_error:
                print(f"SearchView: Fallback search also failed: {str(fallback_error)}")  # Debug
                return Movie.objects.none()
    
    def _start_background_sync_search(self, tmdb_results, tmdb_service):
        """Start background sync process for search results"""
        try:
            # Use ThreadPoolExecutor for background sync to avoid blocking
            executor = ThreadPoolExecutor(max_workers=4)
            
            def sync_search_batch():
                """Sync a batch of search results to database"""
                synced_count = 0
                for item in tmdb_results:
                    try:
                        if item.get('media_type') in ['movie', 'tv']:
                            print(f"Background sync search: Syncing {item.get('title', item.get('name', 'Unknown'))}")  # Debug
                            movie = tmdb_service.sync_movie_to_db(item)
                            if movie:
                                synced_count += 1
                                print(f"Background sync search: Successfully synced {movie.title}")  # Debug
                    except Exception as e:
                        print(f"Background sync search: Error syncing movie {item.get('title', item.get('name', 'Unknown'))}: {e}")  # Debug
                
                print(f"Background sync search: Completed syncing {synced_count} movies")  # Debug
            
            # Submit the sync task to run in background
            executor.submit(sync_search_batch)
            print("Background sync search: Started async movie sync process")  # Debug
            
        except Exception as e:
            print(f"Background sync search: Error starting sync process: {e}")  # Debug
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """Override list method to return TMDB format instead of Django pagination"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Use stored TMDB data for pagination info (avoid double API call)
        page = int(request.query_params.get('page', 1))
        
        if hasattr(self, 'tmdb_data'):
            # Return TMDB format with actual pagination data
            return Response({
                'page': page,
                'results': serializer.data,
                'total_pages': self.tmdb_data.get('total_pages', 1),
                'total_results': self.tmdb_data.get('total_results', len(serializer.data))
            })
        else:
            # Fallback if no TMDB data available
            return Response({
                'page': page,
                'results': serializer.data,
                'total_pages': 1,
                'total_results': len(serializer.data)
            })


class FavoriteListView(generics.ListCreateAPIView):
    """View for user favorites"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        print(f"FavoriteListView: User {self.request.user.email} requesting favorites")
        favorites = Favorite.objects.filter(user=self.request.user)
        print(f"FavoriteListView: Found {favorites.count()} favorites for user")
        for fav in favorites:
            print(f"FavoriteListView: Favorite - {fav.movie.title} (ID: {fav.movie.tmdb_id})")
        return favorites
    
    def perform_create(self, serializer):
        print(f"FavoriteListView: Creating favorite for user {self.request.user.email}")
        serializer.save(user=self.request.user)


class FavoriteDetailView(generics.DestroyAPIView):
    """View for removing favorites"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class FavoriteRemoveByMovieView(generics.DestroyAPIView):
    """View for removing favorites by movie ID"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        movie_id = self.kwargs.get('movie_id')
        return Favorite.objects.get(user=self.request.user, movie__tmdb_id=movie_id)


class WatchlistListView(generics.ListCreateAPIView):
    """View for user watchlist"""
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        print(f"WatchlistListView: User {self.request.user.email} requesting watchlist")
        watchlist = Watchlist.objects.filter(user=self.request.user)
        print(f"WatchlistListView: Found {watchlist.count()} items in watchlist for user")
        for item in watchlist:
            print(f"WatchlistListView: Watchlist Item - {item.movie.title} (ID: {item.movie.tmdb_id})")
        return watchlist
    
    def perform_create(self, serializer):
        print(f"WatchlistListView: Creating watchlist item for user {self.request.user.email}")
        serializer.save(user=self.request.user)


class WatchlistDetailView(generics.DestroyAPIView):
    """View for removing from watchlist"""
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)


class WatchlistRemoveByMovieView(generics.DestroyAPIView):
    """View for removing from watchlist by movie ID"""
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        movie_id = self.kwargs.get('movie_id')
        return Watchlist.objects.get(user=self.request.user, movie__tmdb_id=movie_id)


class MovieRatingView(generics.CreateAPIView, generics.UpdateAPIView):
    """View for movie ratings"""
    serializer_class = MovieRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        movie_id = self.kwargs.get('movie_id')
        return MovieRating.objects.get(user=self.request.user, movie__tmdb_id=movie_id)
    
    def perform_create(self, serializer):
        movie_id = self.kwargs.get('movie_id')
        movie = Movie.objects.get(tmdb_id=movie_id)
        serializer.save(user=self.request.user, movie=movie)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def genres_list(request):
    """Get list of movie genres"""
    tmdb_service = TMDBService()
    
    try:
        data = tmdb_service.get_genres()
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_api(request):
    """Test endpoint to verify API is working"""
    return Response({
        'message': 'API is working!',
        'status': 'success',
        'timestamp': timezone.now().isoformat()
    })
