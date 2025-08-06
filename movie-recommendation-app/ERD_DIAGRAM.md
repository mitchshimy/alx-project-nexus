# Movie Recommendation API - Entity Relationship Diagram

## Database Schema Overview

### Core Entities

#### 1. User Entity
- **Primary Key**: id (AutoField)
- **Fields**:
  - email (EmailField, unique=True)
  - username (CharField)
  - first_name (CharField)
  - last_name (CharField)
  - password (CharField)
  - date_joined (DateTimeField)
  - is_active (BooleanField)
  - is_staff (BooleanField)
  - is_superuser (BooleanField)

#### 2. UserProfile Entity
- **Primary Key**: id (AutoField)
- **Foreign Key**: user (OneToOneField to User)
- **Fields**:
  - bio (TextField)
  - birth_date (DateField)
  - favorite_genres (JSONField)
  - notification_preferences (JSONField)
  - created_at (DateTimeField)
  - updated_at (DateTimeField)

#### 3. Movie Entity
- **Primary Key**: id (AutoField)
- **Unique Field**: tmdb_id (IntegerField)
- **Fields**:
  - title (CharField)
  - overview (TextField)
  - tagline (TextField)
  - poster_path (CharField)
  - backdrop_path (CharField)
  - release_date (DateField)
  - runtime (IntegerField)
  - vote_average (FloatField)
  - vote_count (IntegerField)
  - popularity (FloatField)
  - genre_ids (JSONField)
  - media_type (CharField)
  - imdb_id (CharField)
  - original_language (CharField)
  - budget (BigIntegerField)
  - revenue (BigIntegerField)
  - status (CharField)
  - production_companies (JSONField)
  - production_countries (JSONField)
  - spoken_languages (JSONField)
  - created_at (DateTimeField)
  - updated_at (DateTimeField)

#### 4. Favorite Entity (Junction Table)
- **Primary Key**: id (AutoField)
- **Foreign Keys**:
  - user (ForeignKey to User)
  - movie (ForeignKey to Movie)
- **Fields**:
  - created_at (DateTimeField)
- **Constraints**: unique_together (user, movie)

#### 5. Watchlist Entity (Junction Table)
- **Primary Key**: id (AutoField)
- **Foreign Keys**:
  - user (ForeignKey to User)
  - movie (ForeignKey to Movie)
- **Fields**:
  - created_at (DateTimeField)
- **Constraints**: unique_together (user, movie)

#### 6. MovieRating Entity
- **Primary Key**: id (AutoField)
- **Foreign Keys**:
  - user (ForeignKey to User)
  - movie (ForeignKey to Movie)
- **Fields**:
  - rating (IntegerField, choices 1-5)
  - review (TextField)
  - created_at (DateTimeField)
  - updated_at (DateTimeField)
- **Constraints**: unique_together (user, movie)

## Relationships

### One-to-One Relationships
- **User ↔ UserProfile**: One user has one profile, one profile belongs to one user

### One-to-Many Relationships
- **User → Favorite**: One user can have many favorites
- **User → Watchlist**: One user can have many watchlist items
- **User → MovieRating**: One user can have many movie ratings
- **Movie → Favorite**: One movie can be favorited by many users
- **Movie → Watchlist**: One movie can be in many users' watchlists
- **Movie → MovieRating**: One movie can have many ratings

### Many-to-Many Relationships (through junction tables)
- **User ↔ Movie** (through Favorite): Users can favorite many movies, movies can be favorited by many users
- **User ↔ Movie** (through Watchlist): Users can add many movies to watchlist, movies can be in many users' watchlists
- **User ↔ Movie** (through MovieRating): Users can rate many movies, movies can be rated by many users

## Database Design Principles

### 1. Normalization
- **First Normal Form**: All attributes contain atomic values
- **Second Normal Form**: No partial dependencies
- **Third Normal Form**: No transitive dependencies

### 2. Referential Integrity
- Foreign key constraints ensure data consistency
- Cascade deletes maintain referential integrity
- Unique constraints prevent duplicate relationships

### 3. Performance Optimization
- Indexes on frequently queried fields (tmdb_id, user_id, movie_id)
- Composite indexes for junction tables
- JSON fields for flexible data storage

### 4. Scalability
- Efficient query patterns for user preferences
- Caching strategies for movie data
- Pagination support for large datasets

## API Endpoints Mapping

### User Management
- `POST /api/v1/users/register/` - Create new user
- `POST /api/v1/users/login/` - User authentication
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/profile/` - Update user profile

### Movie Operations
- `GET /api/v1/movies/` - List movies with pagination
- `GET /api/v1/movies/{tmdb_id}/` - Get movie details
- `GET /api/v1/movies/search/` - Search movies
- `GET /api/v1/movies/genres/` - Get available genres

### User Preferences
- `GET /api/v1/movies/favorites/` - Get user favorites
- `POST /api/v1/movies/favorites/` - Add to favorites
- `DELETE /api/v1/movies/favorites/{movie_id}/` - Remove from favorites
- `GET /api/v1/movies/watchlist/` - Get user watchlist
- `POST /api/v1/movies/watchlist/` - Add to watchlist
- `DELETE /api/v1/movies/watchlist/{movie_id}/` - Remove from watchlist

### Ratings and Reviews
- `GET /api/v1/movies/{movie_id}/rate/` - Get movie rating
- `POST /api/v1/movies/{movie_id}/rate/` - Rate movie
- `PUT /api/v1/movies/{movie_id}/rate/` - Update rating
- `DELETE /api/v1/movies/{movie_id}/rate/` - Delete rating

## Data Flow

### 1. User Registration Flow
1. User submits registration data
2. System creates User record
3. System creates UserProfile record
4. System generates JWT tokens
5. User is authenticated

### 2. Movie Discovery Flow
1. User requests movie list
2. System queries Movie table
3. System applies filters and pagination
4. System returns movie data with user preferences

### 3. Personalization Flow
1. User interacts with movies (favorite, watchlist, rate)
2. System creates/updates junction table records
3. System updates user preferences
4. System provides personalized recommendations

## Security Considerations

### 1. Authentication
- JWT-based authentication
- Token expiration and refresh
- Secure password hashing

### 2. Authorization
- User-specific data access
- Rate limiting on API endpoints
- Input validation and sanitization

### 3. Data Protection
- Sensitive user data encryption
- GDPR compliance considerations
- Audit trails for user actions 