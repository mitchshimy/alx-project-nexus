# Swagger API Documentation

## Overview

The Movie Recommendation API now includes comprehensive Swagger/OpenAPI documentation that provides interactive API documentation, testing capabilities, and detailed endpoint information.

## Accessing the Documentation

### Swagger UI
- **URL**: `http://localhost:8000/swagger/`
- **Description**: Interactive API documentation with testing capabilities
- **Features**: 
  - Try out API endpoints directly from the browser
  - View request/response schemas
  - Test authentication with JWT tokens
  - Download OpenAPI specification

### ReDoc
- **URL**: `http://localhost:8000/redoc/`
- **Description**: Clean, responsive API documentation
- **Features**:
  - Better for reading and understanding the API
  - Responsive design for mobile devices
  - Searchable documentation

### OpenAPI JSON Schema
- **URL**: `http://localhost:8000/swagger.json`
- **Description**: Raw OpenAPI specification in JSON format
- **Use Cases**: 
  - Import into API testing tools (Postman, Insomnia)
  - Generate client SDKs
  - Integration with CI/CD pipelines

## API Endpoints Documentation

### Authentication Endpoints

#### User Registration
- **Endpoint**: `POST /api/v1/users/register/`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- **Response**: JWT tokens and user information

#### User Login
- **Endpoint**: `POST /api/v1/users/login/`
- **Description**: Authenticate user and get JWT tokens
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: JWT tokens and user information

#### Token Refresh
- **Endpoint**: `POST /api/v1/users/refresh-token/`
- **Description**: Refresh expired access token
- **Request Body**:
  ```json
  {
    "refresh": "your_refresh_token"
  }
  ```
- **Response**: New access token

### Movie Endpoints

#### List Movies
- **Endpoint**: `GET /api/v1/movies/`
- **Description**: Get list of movies, TV shows, trending content, or top-rated content
- **Query Parameters**:
  - `type`: `movies`, `tv`, `trending`, `top_rated` (default: `movies`)
  - `page`: Page number for pagination (default: `1`)
- **Response**: Paginated list of movies with metadata

#### Movie Details
- **Endpoint**: `GET /api/v1/movies/{tmdb_id}/`
- **Description**: Get detailed information about a specific movie
- **Path Parameters**:
  - `tmdb_id`: TMDB ID of the movie
- **Response**: Comprehensive movie details including cast, videos, reviews, and similar movies

#### Search Movies
- **Endpoint**: `GET /api/v1/movies/search/`
- **Description**: Search for movies and TV shows
- **Query Parameters**:
  - `q`: Search query (required)
  - `page`: Page number for pagination (default: `1`)
- **Response**: Search results with pagination

#### Get Genres
- **Endpoint**: `GET /api/v1/movies/genres/`
- **Description**: Get list of available movie genres
- **Response**: List of genres with IDs and names

### User Management Endpoints

#### User Profile
- **Endpoint**: `GET /api/v1/users/profile/`
- **Description**: Get user profile information
- **Authentication**: Required
- **Response**: User profile data

#### Update Profile
- **Endpoint**: `PUT /api/v1/users/profile/`
- **Description**: Update user profile information
- **Authentication**: Required
- **Request Body**: User profile fields
- **Response**: Updated profile

#### User Statistics
- **Endpoint**: `GET /api/v1/users/stats/`
- **Description**: Get user statistics (favorites, watchlist, ratings count)
- **Authentication**: Required
- **Response**: User statistics

#### Change Password
- **Endpoint**: `POST /api/v1/users/change-password/`
- **Description**: Change user password
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "old_password": "current_password",
    "new_password": "new_password",
    "new_password_confirm": "new_password"
  }
  ```
- **Response**: Success message

### Personalization Endpoints

#### Favorites
- **GET**: `GET /api/v1/movies/favorites/`
  - Get user's favorite movies
  - Authentication required
- **POST**: `POST /api/v1/movies/favorites/`
  - Add movie to favorites
  - Authentication required
  - Request body: `{"movie_id": 123}`

#### Watchlist
- **GET**: `GET /api/v1/movies/watchlist/`
  - Get user's watchlist
  - Authentication required
- **POST**: `POST /api/v1/movies/watchlist/`
  - Add movie to watchlist
  - Authentication required
  - Request body: `{"movie_id": 123}`

#### Movie Ratings
- **POST**: `POST /api/v1/movies/ratings/`
  - Rate a movie
  - Authentication required
  - Request body: `{"movie_id": 123, "rating": 5, "review": "Great movie!"}`
- **PUT**: `PUT /api/v1/movies/ratings/{movie_id}/`
  - Update movie rating
  - Authentication required
  - Request body: `{"rating": 4, "review": "Updated review"}`

## Authentication

### JWT Token Usage

1. **Login or Register** to get access and refresh tokens
2. **Include the access token** in the Authorization header:
   ```
   Authorization: Bearer <your_access_token>
   ```
3. **Refresh the token** when it expires using the refresh endpoint

### Example Authentication Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123"
  }'

# 2. Login to get tokens
curl -X POST http://localhost:8000/api/v1/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 3. Use the access token for authenticated requests
curl -X GET http://localhost:8000/api/v1/movies/favorites/ \
  -H "Authorization: Bearer <your_access_token>"
```

## Testing with Swagger UI

1. **Open Swagger UI**: Navigate to `http://localhost:8000/swagger/`
2. **Authorize**: Click the "Authorize" button and enter your JWT token
3. **Test Endpoints**: Click on any endpoint to expand it and see:
   - Request parameters
   - Request body schema
   - Response schemas
   - Try it out functionality

## Error Responses

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "detail": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API requests are rate-limited to ensure fair usage. The limits are:
- **Anonymous users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour

## TMDB Integration

The API integrates with The Movie Database (TMDB) to provide:
- Real-time movie and TV show data
- Comprehensive movie details
- Cast and crew information
- Videos and trailers
- Reviews and ratings
- Similar movie recommendations

## Development

### Adding New Endpoints

To add Swagger documentation to new endpoints:

1. **Import the decorators**:
   ```python
   from drf_yasg.utils import swagger_auto_schema
   from drf_yasg import openapi
   ```

2. **Add the decorator** to your view:
   ```python
   @swagger_auto_schema(
       operation_description="Your endpoint description",
       manual_parameters=[
           openapi.Parameter(
               'param_name',
               openapi.IN_QUERY,
               description="Parameter description",
               type=openapi.TYPE_STRING
           )
       ],
       responses={
           200: openapi.Response(
               description="Success response",
               schema=YourSerializer
           )
       }
   )
   def your_method(self, request):
       # Your implementation
   ```

### Updating Documentation

1. **Modify the schema view** in `movie_api/urls.py` to update the main API description
2. **Add decorators** to new views for automatic documentation
3. **Update this README** when adding new features

## Troubleshooting

### Common Issues

1. **Swagger UI not loading**: Ensure the server is running on port 8000
2. **Authentication not working**: Check that your JWT token is valid and not expired
3. **CORS issues**: The API includes CORS headers for frontend integration

### Debugging

- Check the Django server logs for detailed error information
- Use the Swagger UI "Try it out" feature to test endpoints
- Verify your JWT token format: `Bearer <token>`

## Contributing

When adding new endpoints or modifying existing ones:

1. **Add comprehensive Swagger documentation**
2. **Include proper error responses**
3. **Test the endpoints in Swagger UI**
4. **Update this documentation**

## License

This API documentation is part of the Movie Recommendation API project. 