from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_root(request):
    """API root endpoint with available endpoints"""
    return Response({
        'message': 'Movie Recommendation API',
        'version': 'v1',
        'endpoints': {   
            'users': {
                'register': '/api/v1/users/register/',
                'login': '/api/v1/users/login/',
                'profile': '/api/v1/users/profile/',
                'stats': '/api/v1/users/stats/',
                'refresh_token': '/api/v1/users/refresh/',
            },
            'movies': {
                'list': '/api/v1/movies/',
                'search': '/api/v1/movies/search/',
                'genres': '/api/v1/movies/genres/',
                'detail': '/api/v1/movies/{tmdb_id}/',
                'favorites': '/api/v1/movies/favorites/',
                'watchlist': '/api/v1/movies/watchlist/',
                'rating': '/api/v1/movies/{movie_id}/rate/',
            },
            'documentation': {
                'swagger': '/swagger/',
                'redoc': '/redoc/',
            }
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
] 