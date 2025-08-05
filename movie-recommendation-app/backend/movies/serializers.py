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
                 'media_type', 'is_favorite', 'is_watchlisted', 'user_rating', 'created_at', 'runtime']
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


class SimpleMovieSerializer(serializers.ModelSerializer):
    """Simplified movie serializer for favorites and watchlist to avoid N+1 queries"""
    
    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'overview', 'poster_path', 'backdrop_path',
                 'release_date', 'vote_average', 'vote_count', 'popularity', 'genre_ids',
                 'media_type', 'created_at', 'runtime']
        read_only_fields = ['id', 'created_at']


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for user favorites"""
    movie = SimpleMovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'movie', 'movie_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        user = self.context['request'].user
        
        # Get or create the movie
        movie, created = Movie.objects.get_or_create(
            tmdb_id=movie_id,
            defaults={
                'title': f'Movie {movie_id}',  # Placeholder title
                'overview': '',
                'poster_path': '',
                'backdrop_path': '',
                'vote_average': 0.0,
                'vote_count': 0,
                'popularity': 0.0,
                'genre_ids': [],
                'media_type': 'movie'
            }
        )
        
        # Create the favorite
        favorite, created = Favorite.objects.get_or_create(
            user=user,
            movie=movie,
            defaults=validated_data
        )
        
        if not created:
            # If favorite already exists, update the created_at timestamp
            favorite.save()
        
        return favorite
    
    def validate_movie_id(self, value):
        """Validate that the movie_id is a positive integer"""
        if not isinstance(value, int) or value <= 0:
            raise serializers.ValidationError("movie_id must be a positive integer")
        return value
    
    def validate(self, data):
        """Validate that the user hasn't already favorited this movie"""
        user = self.context['request'].user
        movie_id = data.get('movie_id')
        
        if movie_id:
            # Check if user already has this movie in favorites
            if Favorite.objects.filter(user=user, movie__tmdb_id=movie_id).exists():
                raise serializers.ValidationError("This movie is already in your favorites")
        
        return data


class WatchlistSerializer(serializers.ModelSerializer):
    """Serializer for user watchlist"""
    movie = SimpleMovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Watchlist
        fields = ['id', 'movie', 'movie_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        user = self.context['request'].user
        
        # Get or create the movie
        movie, created = Movie.objects.get_or_create(
            tmdb_id=movie_id,
            defaults={
                'title': f'Movie {movie_id}',
                'overview': '',
                'poster_path': '',
                'backdrop_path': '',
                'vote_average': 0.0,
                'vote_count': 0,
                'popularity': 0.0,
                'genre_ids': [],
                'media_type': 'movie'
            }
        )
        
        # Create the watchlist item
        watchlist_item, created = Watchlist.objects.get_or_create(
            user=user,
            movie=movie,
            defaults=validated_data
        )
        
        if not created:
            # If watchlist item already exists, update the created_at timestamp
            watchlist_item.save()
        
        return watchlist_item
    
    def validate_movie_id(self, value):
        """Validate that the movie_id is a positive integer"""
        if not isinstance(value, int) or value <= 0:
            raise serializers.ValidationError("movie_id must be a positive integer")
        return value
    
    def validate(self, data):
        """Validate that the user hasn't already added this movie to watchlist"""
        user = self.context['request'].user
        movie_id = data.get('movie_id')
        
        if movie_id:
            # Check if user already has this movie in watchlist
            if Watchlist.objects.filter(user=user, movie__tmdb_id=movie_id).exists():
                raise serializers.ValidationError("This movie is already in your watchlist")
        
        return data


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
        user = self.context['request'].user
        
        # Get or create the movie
        movie, created = Movie.objects.get_or_create(
            tmdb_id=movie_id,
            defaults={
                'title': f'Movie {movie_id}',  # Placeholder title
                'overview': '',
                'poster_path': '',
                'backdrop_path': '',
                'vote_average': 0.0,
                'vote_count': 0,
                'popularity': 0.0,
                'genre_ids': [],
                'media_type': 'movie'
            }
        )
        
        # Create or update the rating
        rating, created = MovieRating.objects.get_or_create(
            user=user,
            movie=movie,
            defaults=validated_data
        )
        
        if not created:
            # Update existing rating
            for attr, value in validated_data.items():
                setattr(rating, attr, value)
            rating.save()
        
        return rating
    
    def update(self, instance, validated_data):
        """Update an existing rating"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def validate_rating(self, value):
        """Validate that rating is between 1 and 5"""
        if not isinstance(value, int) or value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_movie_id(self, value):
        """Validate that the movie_id is a positive integer"""
        if not isinstance(value, int) or value <= 0:
            raise serializers.ValidationError("movie_id must be a positive integer")
        return value 