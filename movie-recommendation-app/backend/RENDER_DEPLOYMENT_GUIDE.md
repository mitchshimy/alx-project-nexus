# Render Deployment Guide

## Quick Setup

### 1. Create a New Web Service

1. **Go to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

### 2. Service Configuration

**Name:** `movie-recommendation-api` (or your preferred name)

**Environment:** `Python 3`

**Build Command:** `chmod +x build.sh && ./build.sh`

**Start Command:** `cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application`

**Root Directory:** Leave empty (use repository root)

### 3. Environment Variables (Required)

Add these environment variables in your Render service:

```
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com

# Database (Use Render's PostgreSQL)
DATABASE_URL=postgresql://your-app-name:password@host:5432/database-name

# Redis (Use Render's Redis)
REDIS_URL=redis://your-redis-host:6379

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# TMDB API
TMDB_READ_TOKEN=your-tmdb-read-token
TMDB_API_KEY=your-tmdb-api-key

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### 4. Database Setup

1. **Create a PostgreSQL service** in Render
2. **Copy the Internal Database URL** from your PostgreSQL service
3. **Set it as `DATABASE_URL`** in your web service environment variables

### 5. Redis Setup (Optional)

1. **Create a Redis service** in Render
2. **Copy the Redis URL** from your Redis service
3. **Set it as `REDIS_URL`** in your web service environment variables

## Troubleshooting

### Common Issues:

1. **Build fails**: Check the build logs for dependency issues
2. **Database connection fails**: Verify `DATABASE_URL` is correct
3. **Static files not found**: Ensure `STATIC_ROOT` is set
4. **Gunicorn fails**: Check the start command is correct

### Debug Commands:

```bash
# Test database connection
python manage.py dbshell

# Check migrations
python manage.py showmigrations

# Test the application
python manage.py runserver 0.0.0.0:8000
```

## Deployment Checklist

- [ ] Repository connected to Render
- [ ] Build command configured
- [ ] Start command configured
- [ ] Environment variables set
- [ ] Database service created and connected
- [ ] Redis service created (optional)
- [ ] Domain configured (optional)

## API Endpoints

After deployment, your API will be available at:

- **Base URL**: `https://your-app-name.onrender.com/api/v1`
- **Health Check**: `https://your-app-name.onrender.com/api/v1/health/`
- **Swagger Docs**: `https://your-app-name.onrender.com/swagger/`
- **Admin Panel**: `https://your-app-name.onrender.com/admin/`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | Django secret key | Yes |
| `DEBUG` | Debug mode (False for production) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | No |
| `JWT_SECRET_KEY` | JWT signing key | Yes |
| `TMDB_READ_TOKEN` | TMDB API read token | Yes |
| `TMDB_API_KEY` | TMDB API key | Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | Yes |
| `CSRF_TRUSTED_ORIGINS` | Trusted CSRF origins | Yes | 