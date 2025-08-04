# Movie Recommendation App

A modern, responsive movie and TV show recommendation application built with Next.js, Django, and TMDB API.

## Features

### Frontend (Next.js)
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Movie Discovery**: Browse trending, top-rated, and genre-specific content
- **Search Functionality**: Search across movies and TV shows
- **User Authentication**: Sign up, sign in, and profile management
- **Favorites & Watchlist**: Save and manage your favorite content
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Enhanced Mobile Touch**: Improved touch sensitivity with scroll detection to prevent accidental clicks

### Backend (Django)
- **RESTful API**: Complete API with authentication and data management
- **TMDB Integration**: Real-time movie data from The Movie Database
- **User Management**: JWT-based authentication with user profiles
- **Database**: PostgreSQL with optimized models and relationships
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13+ with TypeScript
- **Styling**: Styled Components
- **State Management**: React Hooks
- **Routing**: Next.js Router
- **API Integration**: Fetch API with JWT authentication

### Backend
- **Framework**: Django 4.2 with Django REST Framework
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT (Simple JWT)
- **Documentation**: Swagger/OpenAPI (drf-yasg)
- **External API**: TMDB (The Movie Database)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Python 3.8+
- PostgreSQL
- Redis
- TMDB API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd movie-recommendation-app
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Create and activate virtual environment
```bash
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # Linux/Mac
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Set up environment variables
```bash
cp env.example .env
# Edit .env with your configuration
```

#### Configure database
```bash
# Create PostgreSQL database
createdb movie_db

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

#### Create superuser
```bash
python manage.py createsuperuser
```

#### Sync initial data
```bash
python manage.py sync_movies --type trending --pages 5
```

#### Start the backend server
```bash
python manage.py runserver
```

### 3. Frontend Setup

#### Navigate to frontend directory
```bash
cd ../frontend
```

#### Install dependencies
```bash
npm install
```

#### Set up environment variables
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

#### Start the development server
```bash
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **API Documentation**: http://localhost:8000/swagger/
- **Admin Panel**: http://localhost:8000/admin/

## 📁 Project Structure

```
movie-recommendation-app/
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   ├── pages/              # Next.js pages
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── ...
├── backend/                 # Django backend
│   ├── movie_api/          # Django project settings
│   ├── users/              # User authentication & profiles
│   ├── movies/             # Movie data & user interactions
│   ├── api/                # Main API endpoints
│   ├── management/         # Custom management commands
│   ├── manage.py           # Django management script
│   └── ...
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Django Settings
SECRET_KEY=your-secret-key
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
TMDB_API_KEY=your-tmdb-api-key
```

#### Frontend (.env.local)
```env
# Django Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/users/register/` - User registration
- `POST /api/v1/users/login/` - User login
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/profile/` - Update user profile

### Movies
- `GET /api/v1/movies/` - List movies with filtering
- `GET /api/v1/movies/search/` - Search movies and TV shows
- `GET /api/v1/movies/{tmdb_id}/` - Get movie details
- `POST /api/v1/movies/favorites/` - Add to favorites
- `DELETE /api/v1/movies/favorites/{id}/` - Remove from favorites
- `POST /api/v1/movies/watchlist/` - Add to watchlist
- `DELETE /api/v1/movies/watchlist/{id}/` - Remove from watchlist

## 🎯 Key Features

### User Experience
- **Seamless Authentication**: JWT-based auth with automatic token refresh
- **Real-time Search**: Instant search results with backend integration
- **Personalized Content**: User-specific favorites and watchlist
- **Responsive Design**: Beautiful UI that works on all devices

### Developer Experience
- **Type Safety**: Full TypeScript support
- **API Documentation**: Interactive Swagger documentation
- **Hot Reloading**: Fast development with Next.js
- **Database Management**: Django admin interface
- **Caching**: Redis-based performance optimization

## 🔄 Data Flow

1. **User Registration/Login**: Frontend → Django Backend → JWT Token
2. **Movie Discovery**: Frontend → Django Backend → TMDB API → Cached Response
3. **User Actions**: Frontend → Django Backend → Database Storage
4. **Search**: Frontend → Django Backend → TMDB Search API → Filtered Results

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up Redis for caching
4. Configure static files
5. Set up HTTPS
6. Configure CORS for your domain

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Django](https://www.djangoproject.com/) for the robust backend framework
- [Styled Components](https://styled-components.com/) for the beautiful styling solution

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team. 