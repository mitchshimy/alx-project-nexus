from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    # Test endpoint
    path('test/', views.test_api, name='test_api'),
    
    # Movies
    path('', views.MovieListView.as_view(), name='movie_list'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('genres/', views.genres_list, name='genres_list'),
    path('<int:tmdb_id>/', views.MovieDetailView.as_view(), name='movie_detail'),
    
    # Favorites
    path('favorites/', views.FavoriteListView.as_view(), name='favorite_list'),
    path('favorites/<int:pk>/', views.FavoriteDetailView.as_view(), name='favorite_detail'),
    path('favorites/movie/<int:movie_id>/', views.FavoriteRemoveByMovieView.as_view(), name='favorite_remove_by_movie'),
    
    # Watchlist
    path('watchlist/', views.WatchlistListView.as_view(), name='watchlist_list'),
    path('watchlist/<int:pk>/', views.WatchlistDetailView.as_view(), name='watchlist_detail'),
    path('watchlist/movie/<int:movie_id>/', views.WatchlistRemoveByMovieView.as_view(), name='watchlist_remove_by_movie'),
    
    # Ratings
    path('<int:movie_id>/rate/', views.MovieRatingView.as_view(), name='movie_rating'),
] 