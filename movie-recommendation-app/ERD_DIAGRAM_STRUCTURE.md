# ERD Diagram Structure for Movie Recommendation API

## Instructions for ERD Tool (Lucidchart, Draw.io, etc.)

### 1. User Entity
**Entity Name**: User
**Primary Key**: id (AutoField)
**Attributes**:
- id (PK, AutoField)
- email (EmailField, unique=True)
- username (CharField)
- first_name (CharField)
- last_name (CharField)
- password (CharField)
- date_joined (DateTimeField)
- is_active (BooleanField)
- is_staff (BooleanField)
- is_superuser (BooleanField)

### 2. UserProfile Entity
**Entity Name**: UserProfile
**Primary Key**: id (AutoField)
**Foreign Key**: user_id (OneToOneField to User)
**Attributes**:
- id (PK, AutoField)
- user_id (FK, OneToOneField to User)
- bio (TextField)
- birth_date (DateField)
- favorite_genres (JSONField)
- notification_preferences (JSONField)
- created_at (DateTimeField)
- updated_at (DateTimeField)

### 3. Movie Entity
**Entity Name**: Movie
**Primary Key**: id (AutoField)
**Unique Field**: tmdb_id (IntegerField)
**Attributes**:
- id (PK, AutoField)
- tmdb_id (IntegerField, unique=True)
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

### 4. Favorite Entity (Junction Table)
**Entity Name**: Favorite
**Primary Key**: id (AutoField)
**Foreign Keys**:
- user_id (ForeignKey to User)
- movie_id (ForeignKey to Movie)
**Attributes**:
- id (PK, AutoField)
- user_id (FK, ForeignKey to User)
- movie_id (FK, ForeignKey to Movie)
- created_at (DateTimeField)
**Constraints**: unique_together (user_id, movie_id)

### 5. Watchlist Entity (Junction Table)
**Entity Name**: Watchlist
**Primary Key**: id (AutoField)
**Foreign Keys**:
- user_id (ForeignKey to User)
- movie_id (ForeignKey to Movie)
**Attributes**:
- id (PK, AutoField)
- user_id (FK, ForeignKey to User)
- movie_id (FK, ForeignKey to Movie)
- created_at (DateTimeField)
**Constraints**: unique_together (user_id, movie_id)

### 6. MovieRating Entity
**Entity Name**: MovieRating
**Primary Key**: id (AutoField)
**Foreign Keys**:
- user_id (ForeignKey to User)
- movie_id (ForeignKey to Movie)
**Attributes**:
- id (PK, AutoField)
- user_id (FK, ForeignKey to User)
- movie_id (FK, ForeignKey to Movie)
- rating (IntegerField, choices 1-5)
- review (TextField)
- created_at (DateTimeField)
- updated_at (DateTimeField)
**Constraints**: unique_together (user_id, movie_id)

## Relationships to Draw

### 1. User ↔ UserProfile (One-to-One)
- **Cardinality**: 1:1
- **Line Style**: Solid line
- **Description**: "has profile"

### 2. User → Favorite (One-to-Many)
- **Cardinality**: 1:N
- **Line Style**: Solid line
- **Description**: "has favorites"

### 3. User → Watchlist (One-to-Many)
- **Cardinality**: 1:N
- **Line Style**: Solid line
- **Description**: "has watchlist items"

### 4. User → MovieRating (One-to-Many)
- **Cardinality**: 1:N
- **Line Style**: Solid line
- **Description**: "rates movies"

### 5. Movie → Favorite (One-to-Many)
- **Cardinality**: 1:N
- **Line Style**: Solid line
- **Description**: "favorited by users"

### 6. Movie → Watchlist (One-to-Many)
- **Cardinality**: 1:N
- **Line Style**: Solid line
- **Description**: "in users' watchlists"

### 7. Movie → MovieRating (One-to-Many)
- **Cardinality**: 1:N
- **Line Style**: Solid line
- **Description**: "rated by users"

## Visual Layout Suggestions

### Recommended Layout:
```
[User] ←→ [UserProfile]
   ↓
   ↓ (1:N)
   ↓
[Favorite] ←→ (N:1) [Movie]
[Watchlist] ←→ (N:1) [Movie]
[MovieRating] ←→ (N:1) [Movie]
```

### Alternative Layout (Circular):
```
        [User]
         ↕
    [UserProfile]
         ↕
[Favorite] [Watchlist] [MovieRating]
    ↕         ↕           ↕
    └───── [Movie] ──────┘
```

## Color Coding Suggestions

### Entity Colors:
- **User/UserProfile**: Blue (#3498db)
- **Movie**: Green (#2ecc71)
- **Junction Tables**: Orange (#e67e22)
- **Rating Entity**: Purple (#9b59b6)

### Relationship Colors:
- **One-to-One**: Blue solid line
- **One-to-Many**: Green solid line
- **Many-to-Many**: Orange solid line

## Additional Notes for ERD Tool

### 1. Entity Styling:
- Use rectangles for entities
- Include all attributes in each entity
- Mark primary keys with (PK)
- Mark foreign keys with (FK)

### 2. Relationship Styling:
- Use crow's foot notation for many relationships
- Use straight lines for one relationships
- Add descriptive labels on relationship lines

### 3. Constraints to Show:
- Primary Key constraints
- Foreign Key constraints
- Unique constraints
- Not Null constraints

### 4. Optional Enhancements:
- Add cardinality labels (1, N, M)
- Include data types for key fields
- Add brief descriptions for complex relationships
- Show indexes on frequently queried fields

## Database Design Principles Demonstrated

### 1. Normalization:
- **1NF**: All attributes contain atomic values
- **2NF**: No partial dependencies
- **3NF**: No transitive dependencies

### 2. Referential Integrity:
- Foreign key constraints
- Cascade delete rules
- Unique constraints

### 3. Performance Optimization:
- Indexes on foreign keys
- Composite indexes for junction tables
- Efficient query patterns

### 4. Scalability:
- Flexible JSON fields
- Efficient many-to-many relationships
- Caching-friendly design 