# 🚨 Render Deployment Quick Fix

## **Current Issue:**
```
bash: line 1: build.sh: command not found
==> Build failed 😞
```

## **🔧 Quick Fix Steps:**

### **1. Update Your Render Service Configuration**

Go to your Render dashboard and update these settings:

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application
```

**Root Directory:** Leave empty (use repository root)

### **2. Set Environment Variables**

Add these to your Render environment variables:

```bash
# Django Settings
SECRET_KEY=X5%BUZoW+Q94)eYZ(M-fGJ!YfJRC8FzF+RvLV1G@JmhXc_oQqlNtdwNtblP54MQd
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
TMDB_READ_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1Y2QyNDAyMDJlNzEwNWM5ZmJlYmFhNzU1OTNmZDAwZSIsIm5iZiI6MTc1MzY5NjA2Ny45NTIsInN1YiI6IjY4ODc0NzQzNTBlYWY2NjI1MjI0NzBiZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-DSG0t2dpq-Hhv-IdYclsEq7vSIYyBd5LIPCnruii_Y
TMDB_API_KEY=5cd240202e7105c9fbebaa75593fd00e

# JWT Settings
JWT_SECRET_KEY=piaYDAztqJziFMwmm!ZiM-2ZE_9fe0eKYR8L%7!s&to*)Fx(1hZ@bHQn%grYa8o8
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1

# CORS Settings (update with your frontend domain)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### **3. Redeploy**

1. **Save the configuration changes**
2. **Click "Manual Deploy" → "Deploy latest commit"**
3. **Wait for the build to complete**

## **✅ Expected Result:**

After the fix, you should see:
```
==> Cloning from https://github.com/mitchshimy/alx-project-nexus
==> Using Python version 3.13.4
==> Running build command 'chmod +x build.sh && ./build.sh'...
==> Installing dependencies...
==> Collecting static files...
==> Running migrations...
==> Build completed successfully! 🎉
```

## **🔍 If Still Failing:**

1. **Check the build logs** for specific error messages
2. **Verify file structure** - ensure `build.sh` exists in repository root
3. **Check permissions** - the script should be executable
4. **Verify environment variables** are set correctly

## **📞 Need Help?**

If the issue persists, check:
- Build logs in Render dashboard
- File structure in your GitHub repository
- Environment variable configuration 