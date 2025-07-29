from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    MovieSerializer, 
    FavoriteSerializer, 
    WatchlistSerializer,
    MovieRatingSerializer
)
from .models import Movie, Favorite, Watchlist, MovieRating
from .services import TMDBService


class MovieListView(generics.ListAPIView):
    """View for listing movies with TMDB integration"""
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['media_type', 'genre_ids']
    search_fields = ['title', 'overview']
    
    def get_queryset(self):
        tmdb_service = TMDBService()
        
        # Get movie type from query params
        movie_type = self.request.query_params.get('type', 'movie')
        page = int(self.request.query_params.get('page', 1))
        
        try:
            if movie_type == 'trending':
                data = tmdb_service.get_trending_movies(page=page)
            elif movie_type == 'top_rated':
                data = tmdb_service.get_top_rated_movies(page=page)
            elif movie_type == 'tv':
                data = tmdb_service.get_tv_shows(page=page)
            else:
                data = tmdb_service.get_movies(page=page)
            
            # Sync movies to database
            movies = []
            for item in data.get('results', []):
                if item.get('media_type') in ['movie', 'tv']:
                    movie = tmdb_service.sync_movie_to_db(item)
                    movies.append(movie)
            
            return Movie.objects.filter(id__in=[m.id for m in movies])
            
        except Exception as e:
            # Fallback to database if TMDB fails
            return Movie.objects.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MovieDetailView(generics.RetrieveAPIView):
    """View for movie details"""
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'tmdb_id'
    
    def get_object(self):
        tmdb_id = self.kwargs.get('tmdb_id')
        tmdb_service = TMDBService()
        
        try:
            # Try to get from TMDB first
            data = tmdb_service.get_movie_details(tmdb_id)
            movie = tmdb_service.sync_movie_to_db(data)
            return movie
        except Exception as e:
            # Fallback to database
            return Movie.objects.get(tmdb_id=tmdb_id)
    
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
