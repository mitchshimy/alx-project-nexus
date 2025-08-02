# Deployment Guide - Version 15.0

## Overview

This guide helps you deploy your Django backend to Render with the current version (15.0).

## Files Updated

### ✅ `requirements.txt`
- Added comprehensive dependencies
- Includes setuptools and wheel for deployment
- Added django-filter (was missing)
- Added deployment-specific dependencies

### ✅ `build.sh`
- Enhanced with pip and setuptools upgrade
- Better error handling
- Clear logging

### ✅ `runtime.txt`
- Specifies Python 3.11.7 (stable version)
- Avoids Python 3.13 compatibility issues

### ✅ `settings.py`
- Updated CORS settings for development
- Added Render domain to ALLOWED_HOSTS
- More permissive CORS for testing
- Added STATIC_ROOT and STATICFILES_DIRS for production deployment

## Deployment Steps

### 1. Commit and Push
```bash
git add .
git commit -m "Update deployment configuration for version 15.0"
git push
```

### 2. Render Configuration

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application
```

**Root Directory:** Leave empty (use repository root)

### 3. Environment Variables

Set these in your Render dashboard:

```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False

# Database Settings (from your PostgreSQL service)
DB_NAME=movie_db
DB_USER=movie_user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432

# Redis Settings (from your Redis service)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# TMDB API Settings
TMDB_READ_TOKEN=your-tmdb-read-token
TMDB_API_KEY=your-tmdb-api-key

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1
```

## Expected Build Output

```
==> Cloning from https://github.com/your-repo
==> Using Python version 3.11.7
==> Running build command 'chmod +x build.sh && ./build.sh'...
==> Installing dependencies...
==> Collecting static files...
==> Running migrations...
==> Build completed successfully! 🎉
```

## Troubleshooting

### If Build Fails

1. **Check Python Version:** Ensure runtime.txt specifies Python 3.11.7
2. **Check Dependencies:** All required packages are in requirements.txt
3. **Check Environment Variables:** All required variables are set
4. **Check CORS:** Frontend domain is allowed in CORS settings

### Common Issues

1. **psycopg2 Issues:** Python 3.11.7 should work fine
2. **CORS Issues:** CORS_ALLOW_ALL_ORIGINS is enabled for development
3. **Environment Variables:** Make sure all required variables are set
4. **Static Files:** STATIC_ROOT is now properly configured

## Testing

After deployment, test your API:

```bash
curl https://your-render-app.onrender.com/api/v1/
```

Should return:
```json
{
  "message": "Movie Recommendation API",
  "version": "v1",
  "endpoints": { ... }
}
```

## Next Steps

1. Deploy to Render
2. Test API endpoints
3. Configure frontend to use new API URL
4. Monitor logs for any issues

## Version Notes

- **Python:** 3.11.7 (stable, avoids 3.13 issues)
- **Django:** 4.2.7 (LTS version)
- **Database:** PostgreSQL with psycopg2-binary
- **Caching:** Redis
- **Server:** Gunicorn 