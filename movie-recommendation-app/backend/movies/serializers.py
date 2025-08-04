from rest_framework import serializers
from .models import Movie, Favorite, Watchlist, MovieRating


class MovieDetailSerializer(serializers.ModelSerializer):
    """Enhanced serializer for movie details with credits, videos, reviews, and similar movies"""
    is_favorite = serializers.SerializerMethodField()
    is_watchlisted = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    credits = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    similar = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'overview', 'poster_path', 'backdrop_path',
                 'release_date', 'vote_average', 'vote_count', 'popularity', 'genre_ids',
                 'media_type', 'is_favorite', 'is_watchlisted', 'user_rating', 'created_at',
                 'credits', 'videos', 'reviews', 'similar', 'tagline', 'imdb_id', 
                 'original_language', 'budget', 'revenue', 'status', 'production_companies',
                 'production_countries', 'spoken_languages', 'runtime']
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
    
    def get_credits(self, obj):
        # This will be populated from TMDB API data
        return getattr(obj, 'credits', None)
    
    def get_videos(self, obj):
        # This will be populated from TMDB API data
        return getattr(obj, 'videos', None)
    
    def get_reviews(self, obj):
        # This will be populated from TMDB API data
        return getattr(obj, 'reviews', None)
    
    def get_similar(self, obj):
        # This will be populated from TMDB API data
        return getattr(obj, 'similar', None)


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
        print(f"FavoriteSerializer: Creating favorite for movie_id: {movie_id}")
        
        # Try to get existing movie first
        try:
            movie = Movie.objects.get(tmdb_id=movie_id)
            print(f"FavoriteSerializer: Found existing movie: {movie.title}")
        except Movie.DoesNotExist:
            print(f"FavoriteSerializer: Movie with tmdb_id {movie_id} not found, creating...")
            # If movie doesn't exist, we need to fetch it from TMDB
            from .services import TMDBService
            tmdb_service = TMDBService()
            try:
                movie_data = tmdb_service.get_movie_details(movie_id)
                movie = Movie.objects.create(
                    tmdb_id=movie_id,
                    title=movie_data.get('title', ''),
                    overview=movie_data.get('overview', ''),
                    poster_path=movie_data.get('poster_path'),
                    backdrop_path=movie_data.get('backdrop_path'),
                    release_date=movie_data.get('release_date'),
                    vote_average=movie_data.get('vote_average', 0.0),
                    vote_count=movie_data.get('vote_count', 0),
                    popularity=movie_data.get('popularity', 0.0),
                    genre_ids=movie_data.get('genre_ids', []),
                    media_type=movie_data.get('media_type', 'movie')
                )
                print(f"FavoriteSerializer: Created new movie: {movie.title}")
            except Exception as e:
                print(f"FavoriteSerializer: Error fetching movie from TMDB: {e}")
                # Create a minimal movie record
                movie = Movie.objects.create(
                    tmdb_id=movie_id,
                    title=f'Movie {movie_id}',
                    overview='',
                    media_type='movie'
                )
        
        favorite = Favorite.objects.create(movie=movie, **validated_data)
        print(f"FavoriteSerializer: Created favorite: {favorite.user.email} - {favorite.movie.title}")
        return favorite


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
        print(f"WatchlistSerializer: Creating watchlist item for movie_id: {movie_id}")
        
        # Try to get existing movie first
        try:
            movie = Movie.objects.get(tmdb_id=movie_id)
            print(f"WatchlistSerializer: Found existing movie: {movie.title}")
        except Movie.DoesNotExist:
            print(f"WatchlistSerializer: Movie with tmdb_id {movie_id} not found, creating...")
            # If movie doesn't exist, we need to fetch it from TMDB
            from .services import TMDBService
            tmdb_service = TMDBService()
            try:
                movie_data = tmdb_service.get_movie_details(movie_id)
                movie = Movie.objects.create(
                    tmdb_id=movie_id,
                    title=movie_data.get('title', ''),
                    overview=movie_data.get('overview', ''),
                    poster_path=movie_data.get('poster_path'),
                    backdrop_path=movie_data.get('backdrop_path'),
                    release_date=movie_data.get('release_date'),
                    vote_average=movie_data.get('vote_average', 0.0),
                    vote_count=movie_data.get('vote_count', 0),
                    popularity=movie_data.get('popularity', 0.0),
                    genre_ids=movie_data.get('genre_ids', []),
                    media_type=movie_data.get('media_type', 'movie')
                )
                print(f"WatchlistSerializer: Created new movie: {movie.title}")
            except Exception as e:
                print(f"WatchlistSerializer: Error fetching movie from TMDB: {e}")
                # Create a minimal movie record
                movie = Movie.objects.create(
                    tmdb_id=movie_id,
                    title=f'Movie {movie_id}',
                    overview='',
                    media_type='movie'
                )
        
        watchlist_item = Watchlist.objects.create(movie=movie, **validated_data)
        print(f"WatchlistSerializer: Created watchlist item: {watchlist_item.user.email} - {watchlist_item.movie.title}")
        return watchlist_item


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