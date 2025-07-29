# Movie Recommendation API Backend

A comprehensive Django REST API for movie recommendations with TMDB integration, user authentication, favorites, watchlist, and ratings.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **TMDB Integration**: Real-time movie data from The Movie Database API
- **Favorites & Watchlist**: User can save and manage their favorite movies and watchlist
- **Movie Ratings**: Users can rate movies and write reviews
- **Search Functionality**: Search across movies and TV shows
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Swagger/OpenAPI documentation
- **Admin Interface**: Django admin for data management

## Tech Stack

- **Framework**: Django 4.2
- **API**: Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI (drf-yasg)
- **External API**: TMDB (The Movie Database)

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL
- Redis
- TMDB API Key

### Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd movie-recommendation-app/backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or
   source venv/bin/activate      # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Configure database**
   ```bash
   # Create PostgreSQL database
   createdb movie_db
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Sync movies from TMDB**
   ```bash
   python manage.py sync_movies --type trending --pages 5
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Settings
DB_NAME=movie_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# TMDB API Settings
TMDB_API_KEY=your-tmdb-api-key-here
```

## API Endpoints

### Authentication
- `POST /api/v1/users/register/` - User registration
- `POST /api/v1/users/login/` - User login
- `POST /api/v1/users/refresh/` - Refresh JWT token
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/profile/` - Update user profile
- `GET /api/v1/users/stats/` - Get user statistics

### Movies
- `GET /api/v1/movies/` - List movies (with filtering)
- `GET /api/v1/movies/search/` - Search movies and TV shows
- `GET /api/v1/movies/genres/` - Get movie genres
- `GET /api/v1/movies/{tmdb_id}/` - Get movie details
- `POST /api/v1/movies/favorites/` - Add to favorites
- `DELETE /api/v1/movies/favorites/{id}/` - Remove from favorites
- `POST /api/v1/movies/watchlist/` - Add to watchlist
- `DELETE /api/v1/movies/watchlist/{id}/` - Remove from watchlist
- `POST /api/v1/movies/{movie_id}/rate/` - Rate a movie

### Documentation
- `GET /swagger/` - Swagger UI documentation
- `GET /redoc/` - ReDoc documentation

## Query Parameters

### Movies List
- `type`: trending, top_rated, movies, tv
- `page`: Page number for pagination
- `search`: Search term
- `media_type`: Filter by media type (movie, tv)
- `genre_ids`: Filter by genre IDs

### Search
- `q`: Search query

## Authentication

The API uses JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## Management Commands

### Sync Movies
```bash
# Sync trending movies
python manage.py sync_movies --type trending --pages 5

# Sync top rated movies
python manage.py sync_movies --type top_rated --pages 3

# Sync TV shows
python manage.py sync_movies --type tv --pages 5
```

## Database Models

### User Models
- `User`: Custom user model with email as username
- `UserProfile`: Extended user profile with preferences

### Movie Models
- `Movie`: Movie/TV show data from TMDB
- `Favorite`: User's favorite movies
- `Watchlist`: User's watchlist
- `MovieRating`: User ratings and reviews

## Caching

The API uses Redis for caching:
- TMDB API responses (1 hour default)
- Genre data (24 hours)
- User-specific data (session-based)

## Development

### Running Tests
```bash
python manage.py test
```

### Code Formatting
```bash
black .
isort .
```

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up Redis for caching
4. Configure static files
5. Set up HTTPS
6. Configure CORS for your domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 