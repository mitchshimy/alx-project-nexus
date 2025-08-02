# Render Gunicorn Fix

## Issue: `Failed to find attribute 'application' in 'movie_api'`

This error occurs when the Gunicorn start command is incorrect.

## Solution

### 1. Update Start Command in Render

In your Render Web Service settings, change the **Start Command** to:

```bash
cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application
```

### 2. Alternative Start Commands

If the above doesn't work, try these alternatives:

```bash
# Option 1: Full path
gunicorn movie_api.wsgi:application --bind 0.0.0.0:$PORT

# Option 2: With settings
gunicorn movie_api.wsgi:application --bind 0.0.0.0:$PORT --workers 2

# Option 3: From backend directory
cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application --bind 0.0.0.0:$PORT
```

### 3. Verify WSGI File

Make sure your `movie_api/wsgi.py` file contains:

```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings')

application = get_wsgi_application()
```

### 4. Test Locally

Test the command locally to ensure it works:

```bash
cd movie-recommendation-app/backend
gunicorn movie_api.wsgi:application --bind 0.0.0.0:8000
```

### 5. Common Issues

- **Wrong module name**: Make sure it's `movie_api.wsgi:application`
- **Missing colon**: Must be `module:application`
- **Wrong directory**: Must run from backend directory
- **Port binding**: Use `$PORT` environment variable

### 6. Render Configuration

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application
```

**Root Directory:** Leave empty

After making these changes, redeploy your application in Render. 