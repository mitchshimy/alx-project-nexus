# 🎬 Shimy Movies - Advanced Movie Recommendation Platform

A modern, full-stack movie recommendation application built with React/Next.js frontend and Django REST API backend, featuring real-time movie data from TMDB, advanced search capabilities, user authentication, and personalized recommendations.

![Shimy Movies](https://img.shields.io/badge/Shimy-Movies-purple?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.0+-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14.0+-black?style=for-the-badge&logo=next.js)
![Django](https://img.shields.io/badge/Django-4.2+-green?style=for-the-badge&logo=django)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Movie Data**: Live integration with TMDB API for up-to-date movie information
- **Advanced Search**: Multi-type search (General, Actor, Genre) with intelligent suggestions
- **User Authentication**: Secure JWT-based authentication with user profiles
- **Personalized Experience**: User-specific favorites, watchlist, and ratings
- **Responsive Design**: Mobile-first design with touch-optimized interactions

### 🎬 Movie Discovery
- **Hero Carousel**: Auto-advancing featured movies with trailer previews
- **Multiple Categories**: Movies, TV Shows, Anime, K-Drama, Trending, Top Rated
- **Smart Filtering**: Genre-based filtering and sorting options
- **Movie Details**: Comprehensive movie information with cast, reviews, and similar movies
- **Trailer Integration**: YouTube trailer integration with custom controls

### 🔍 Advanced Search System
- **Multi-Type Search**:
  - **General Search**: Search across movies, TV shows, and people
  - **Actor Search**: Find movies by specific actors
  - **Genre Search**: Discover content by genre preferences
- **Real-time Suggestions**: Intelligent search suggestions as you type
- **Mobile Search Overlay**: Full-screen search experience on mobile devices
- **Search History**: Remember recent searches for quick access

### 👤 User Features
- **User Profiles**: Detailed user profiles with activity statistics
- **Favorites System**: Save and manage favorite movies/shows
- **Watchlist Management**: Create and organize watchlists
- **Rating System**: Rate movies with 1-5 star system and reviews
- **Account Management**: Password changes, account deletion, preferences

### 📱 Mobile Experience
- **Touch-Optimized**: Enhanced touch sensitivity for mobile scrolling
- **Mobile Autoplay**: Long-press for trailer preview, short-tap for navigation
- **Responsive Navigation**: Collapsible sidebar and mobile menu
- **Mobile Search**: Full-screen search overlay with type selection
- **Touch Feedback**: Visual feedback for touch interactions

### 🎨 UI/UX Features
- **Modern Design**: Glassmorphism and neumorphism design elements
- **Dark Theme**: Eye-friendly dark theme with purple accents
- **Smooth Animations**: CSS animations and transitions
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: User-friendly error messages and fallbacks

### 🌐 Internationalization
- **Multi-language Support**: English and Spanish language options
- **Language Persistence**: Remember user language preferences
- **Responsive Text**: Footer and navigation adapt to language changes

### ⚙️ Settings & Preferences
- **Video Quality**: Configurable video quality settings (360p, 480p, 720p, 1080p)
- **Mobile Autoplay**: Toggle mobile trailer autoplay functionality
- **Language Settings**: Change application language
- **Account Settings**: Manage user account and preferences

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Next.js 14**: Full-stack React framework with SSR/SSG
- **TypeScript**: Type-safe JavaScript development
- **Styled Components**: CSS-in-JS styling with theme support
- **React Icons**: Comprehensive icon library
- **React Router**: Client-side routing and navigation

### Backend
- **Django 4.2**: High-level Python web framework
- **Django REST Framework**: Powerful API development toolkit
- **PostgreSQL**: Robust relational database
- **JWT Authentication**: Secure token-based authentication
- **Celery**: Asynchronous task processing
- **Redis**: Caching and session storage

### APIs & Services
- **TMDB API**: Comprehensive movie and TV show database
- **YouTube API**: Trailer and video integration
- **Cloudinary**: Image optimization and CDN

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Git**: Version control
- **Docker**: Containerization (optional)

## 📸 Screenshots

### Desktop Experience
- **Home Page**: Hero carousel with trending movies
- **Movie Details**: Comprehensive movie information with tabs
- **Search Results**: Advanced search with type filtering
- **User Profile**: Personal dashboard with statistics

### Mobile Experience
- **Mobile Navigation**: Touch-optimized navigation menu
- **Search Overlay**: Full-screen mobile search experience
- **Movie Cards**: Touch-sensitive movie cards with autoplay
- **Responsive Design**: Optimized for all screen sizes

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **PostgreSQL** (v13 or higher)
- **Redis** (for caching and sessions)
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/movie-recommendation-app.git
cd movie-recommendation-app
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your configuration
```

#### 3. Database Setup

```bash
# Create PostgreSQL database
createdb movie_recommendation_db

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

#### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

#### 5. Environment Variables

**Backend (.env)**
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/movie_recommendation_db
TMDB_API_KEY=your-tmdb-api-key
TMDB_READ_TOKEN=your-tmdb-read-token
REDIS_URL=redis://localhost:6379
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
```

#### 6. Run the Application

**Backend (Terminal 1)**
```bash
cd backend
python manage.py runserver
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```

**Background Tasks (Terminal 3)**
```bash
cd backend
celery -A movie_api worker --loglevel=info
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/users/register/
Register a new user account.
```json
{
  "username": "user@example.com",
  "password": "securepassword123",
  "confirm_password": "securepassword123"
}
```

#### POST /api/users/login/
Authenticate user and receive JWT token.
```json
{
  "username": "user@example.com",
  "password": "securepassword123"
}
```

#### POST /api/users/change-password/
Change user password (requires authentication).
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

#### DELETE /api/users/delete-account/
Delete user account and all associated data.
```json
{
  "password": "currentpassword"
}
```

### Movie Endpoints

#### GET /api/movies/
Get list of movies with filtering options.
```
Parameters:
- type: trending, top_rated, movies, tv
- page: page number (default: 1)
```

#### GET /api/movies/{tmdb_id}/
Get detailed movie information.
```
Response includes:
- Basic movie info
- Cast and crew
- Videos and trailers
- Reviews and ratings
- Similar movies
- User-specific data (if authenticated)
```

#### GET /api/movies/search/
Search movies and TV shows.
```
Parameters:
- q: search query (required)
- type: general, actor, genre (default: general)
- page: page number (default: 1)
```

### User Features Endpoints

#### GET /api/users/favorites/
Get user's favorite movies (requires authentication).

#### POST /api/users/favorites/
Add movie to favorites (requires authentication).
```json
{
  "movie_id": 12345
}
```

#### DELETE /api/users/favorites/{movie_id}/
Remove movie from favorites (requires authentication).

#### GET /api/users/watchlist/
Get user's watchlist (requires authentication).

#### POST /api/users/watchlist/
Add movie to watchlist (requires authentication).
```json
{
  "movie_id": 12345
}
```

#### DELETE /api/users/watchlist/{movie_id}/
Remove movie from watchlist (requires authentication).

#### POST /api/users/ratings/
Rate a movie (requires authentication).
```json
{
  "movie_id": 12345,
  "rating": 5,
  "review": "Excellent movie!"
}
```

#### GET /api/users/stats/
Get user statistics (requires authentication).
```json
{
  "favorites_count": 15,
  "watchlist_count": 8,
  "ratings_count": 12,
  "member_since": "2024-01-15"
}
```

### Utility Endpoints

#### GET /api/genres/
Get list of available movie genres.

#### GET /api/health/
Health check endpoint.

## 🏗 Architecture

### Frontend Architecture
```
frontend/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation and search
│   ├── Sidebar.tsx     # Navigation menu
│   ├── MovieCard.tsx   # Movie display component
│   ├── Hero.tsx        # Hero carousel
│   └── ...
├── pages/              # Next.js pages
│   ├── index.tsx       # Home page
│   ├── movies/         # Movie-related pages
│   ├── search.tsx      # Search results
│   └── ...
├── utils/              # Utility functions
│   ├── api.ts          # API integration
│   ├── translations.ts # Internationalization
│   └── ...
└── styles/             # Global styles and themes
```

### Backend Architecture
```
backend/
├── movies/             # Movie-related models and views
│   ├── models.py       # Movie, Favorite, Watchlist models
│   ├── views.py        # API endpoints
│   ├── services.py     # TMDB integration
│   └── serializers.py  # Data serialization
├── users/              # User-related functionality
│   ├── models.py       # User and UserProfile models
│   ├── views.py        # Authentication endpoints
│   └── serializers.py  # User data serialization
├── movie_api/          # Django project settings
│   ├── settings.py     # Application settings
│   ├── urls.py         # URL routing
│   └── wsgi.py         # WSGI configuration
└── requirements.txt    # Python dependencies
```

### Data Flow
1. **User Request**: Frontend makes API request
2. **Authentication**: JWT token validation
3. **TMDB Integration**: Backend fetches data from TMDB
4. **Database**: Store/retrieve user-specific data
5. **Response**: Return formatted data to frontend
6. **Rendering**: Frontend displays data with React

## 🔧 Development

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: PEP 8 Python style guide
- **TypeScript**: Strict type checking enabled

### Testing
```bash
# Frontend tests
npm run test

# Backend tests
python manage.py test
```

### Building for Production
```bash
# Frontend build
npm run build

# Backend collect static
python manage.py collectstatic
```

### Deployment
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, DigitalOcean, AWS, or any Python hosting
- **Database**: PostgreSQL hosting (Heroku Postgres, AWS RDS)
- **Cache**: Redis hosting (Redis Cloud, AWS ElastiCache)





## 🙏 Acknowledgments

- **TMDB**: For providing comprehensive movie and TV show data
- **React/Next.js**: For the excellent frontend framework
- **Django**: For the robust backend framework
- **Styled Components**: For the excellent styling solution
- **React Icons**: For the comprehensive icon library
