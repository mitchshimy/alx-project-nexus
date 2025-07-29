from django.contrib import admin
from .models import Movie, Favorite, Watchlist, MovieRating


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    """Admin configuration for Movie model"""
    list_display = ('title', 'tmdb_id', 'media_type', 'vote_average', 'popularity', 'release_date', 'created_at')
    list_filter = ('media_type', 'release_date', 'created_at')
    search_fields = ('title', 'overview', 'tmdb_id')
    ordering = ('-popularity',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {'fields': ('tmdb_id', 'title', 'overview', 'media_type')}),
        ('Media', {'fields': ('poster_path', 'backdrop_path')}),
        ('Stats', {'fields': ('vote_average', 'vote_count', 'popularity', 'genre_ids')}),
        ('Dates', {'fields': ('release_date', 'created_at', 'updated_at')}),
    )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    """Admin configuration for Favorite model"""
    list_display = ('user', 'movie', 'created_at')
    list_filter = ('created_at', 'movie__media_type')
    search_fields = ('user__email', 'movie__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    """Admin configuration for Watchlist model"""
    list_display = ('user', 'movie', 'created_at')
    list_filter = ('created_at', 'movie__media_type')
    search_fields = ('user__email', 'movie__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(MovieRating)
class MovieRatingAdmin(admin.ModelAdmin):
    """Admin configuration for MovieRating model"""
    list_display = ('user', 'movie', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'movie__media_type')
    search_fields = ('user__email', 'movie__title', 'review')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Rating Info', {'fields': ('user', 'movie', 'rating', 'review')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
