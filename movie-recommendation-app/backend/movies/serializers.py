from rest_framework import serializers
from .models import Movie, Favorite, Watchlist, MovieRating


class MovieSerializer(serializers.ModelSerializer):
    """Serializer for movie data"""
    is_favorite = serializers.SerializerMethodField()
    is_watchlisted = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'overview', 'poster_path', 'backdrop_path',
                 'release_date', 'vote_average', 'vote_count', 'popularity', 'genre_ids',
                 'media_type', 'is_favorite', 'is_watchlisted', 'user_rating', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def get_is_watchlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.watchlisted_by.filter(user=request.user).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.rating if rating else None
        return None


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for user favorites"""
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'movie', 'movie_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        movie, created = Movie.objects.get_or_create(tmdb_id=movie_id)
        return Favorite.objects.create(movie=movie, **validated_data)


class WatchlistSerializer(serializers.ModelSerializer):
    """Serializer for user watchlist"""
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Watchlist
        fields = ['id', 'movie', 'movie_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        movie, created = Movie.objects.get_or_create(tmdb_id=movie_id)
        return Watchlist.objects.create(movie=movie, **validated_data)


class MovieRatingSerializer(serializers.ModelSerializer):
    """Serializer for movie ratings"""
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MovieRating
        fields = ['id', 'movie', 'movie_id', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        movie, created = Movie.objects.get_or_create(tmdb_id=movie_id)
        return MovieRating.objects.create(movie=movie, **validated_data)
    
    def update(self, instance, validated_data):
        if 'movie_id' in validated_data:
            validated_data.pop('movie_id')
        return super().update(instance, validated_data) 