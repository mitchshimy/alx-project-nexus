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
            
            # Sync movies to database
            movies = []
            for item in data.get('results', []):
                # Handle TV shows from /discover/tv endpoint (they don't have media_type field)
                is_tv_show = 'first_air_date' in item
                is_movie = item.get('media_type') == 'movie' or ('release_date' in item and not is_tv_show)
                
                if is_movie or is_tv_show:
                    try:
                        print(f"TMDB View: Attempting to sync item: {item.get('title', item.get('name', 'Unknown'))} (ID: {item.get('id')})")  # Debug
                        movie = tmdb_service.sync_movie_to_db(item)
                        if movie:  # Check if sync returned a movie
                            movies.append(movie)
                            print(f"TMDB View: Successfully synced movie: {movie.title} (type: {movie.media_type})")  # Debug
                        else:
                            print(f"TMDB View: Sync returned None for item: {item.get('title', item.get('name', 'Unknown'))}")  # Debug
                    except Exception as e:
                        print(f"TMDB View: Error syncing movie {item.get('title', item.get('name', 'Unknown'))}: {e}")  # Debug
                        import traceback
                        print(f"TMDB View: Full traceback: {traceback.format_exc()}")  # Debug
            
            if movies:
                queryset = Movie.objects.filter(id__in=[m.id for m in movies])
                print(f"Final queryset count: {queryset.count()}")  # Debug
                return queryset
            else:
                print("No movies synced, returning all movies from database")  # Debug
                return Movie.objects.all()
            
        except Exception as e:
            print(f"Error in get_queryset: {e}")  # Debug
            # Fallback to database if TMDB fails
            return Movie.objects.all()
    
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
        if not query:
            return Movie.objects.none()
        
        tmdb_service = TMDBService()
        
        try:
            data = tmdb_service.search_multi(query)
            
            # Filter out people and sync movies to database
            movies = []
            for item in data.get('results', []):
                if item.get('media_type') in ['movie', 'tv']:
                    movie = tmdb_service.sync_movie_to_db(item)
                    movies.append(movie)
            
            return Movie.objects.filter(id__in=[m.id for m in movies])
            
        except Exception as e:
            # Fallback to database search
            return Movie.objects.filter(title__icontains=query)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """Override list method to return TMDB format instead of Django pagination"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Get the original TMDB search data to extract pagination info
        tmdb_service = TMDBService()
        query = request.query_params.get('q', '')
        page = int(request.query_params.get('page', 1))
        
        try:
            tmdb_data = tmdb_service.search_multi(query, page=page)
            
            # Return TMDB format with actual pagination data
            return Response({
                'page': page,
                'results': serializer.data,
                'total_pages': tmdb_data.get('total_pages', 1),
                'total_results': tmdb_data.get('total_results', len(serializer.data))
            })
        except Exception as e:
            print(f"Error getting TMDB search pagination data: {e}")  # Debug
            # Fallback to basic pagination
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
        return Favorite.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
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
        return Watchlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
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
