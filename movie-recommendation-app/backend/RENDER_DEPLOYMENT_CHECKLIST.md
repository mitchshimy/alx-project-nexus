# 🚀 Render Deployment Checklist

## **✅ Pre-Deployment Checklist**

### **1. Repository Setup**
- [x] `build.sh` exists at repository root
- [x] `requirements.txt` includes all dependencies
- [x] `movie_api/production.py` exists
- [x] Settings handle both local and production environments

### **2. Render Service Configuration**

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application
```

**Root Directory:** Leave empty (use repository root)

### **3. Environment Variables (Required)**

Add these to your Render environment variables:

```bash
# Django Settings
SECRET_KEY=X5%BUZoW+Q94)eYZ(M-fGJ!YfJRC8FzF+RvLV1G@JmhXc_oQqlNtdwNtblP54MQd
DEBUG=False

# Database Settings (from your PostgreSQL service)
DB_ENGINE=django.db.backends.postgresql
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

## **🔧 Database Setup**

### **PostgreSQL Service:**
- [ ] Create PostgreSQL database on Render
- [ ] Copy database credentials
- [ ] Update environment variables with database details

### **Redis Service:**
- [ ] Create Redis instance on Render
- [ ] Copy Redis credentials
- [ ] Update environment variables with Redis details

## **🚀 Deployment Steps**

### **1. Create Web Service**
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select your repository

### **2. Configure Service**
- **Name**: `movie-recommendation-api`
- **Environment**: `Python 3`
- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Start Command**: `cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application`
- **Root Directory**: Leave empty

### **3. Set Environment Variables**
1. Click "Environment" tab
2. Add all required environment variables (see above)
3. Save changes

### **4. Deploy**
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Check logs for any errors

## **✅ Expected Build Output**

```
==> Cloning from https://github.com/mitchshimy/alx-project-nexus
==> Using Python version 3.13.4
==> Running build command 'chmod +x build.sh && ./build.sh'...
==> Installing dependencies...
==> Collecting static files...
==> Running migrations...
==> Build completed successfully! 🎉
```

## **🔍 Troubleshooting**

### **Common Issues:**

1. **"No such file or directory: env.local"**
   - ✅ **FIXED**: Settings now handle both local and production environments

2. **"build.sh: command not found"**
   - ✅ **FIXED**: `build.sh` now exists at repository root

3. **Database connection errors**
   - Check database credentials in environment variables
   - Verify database service is running

4. **Redis connection errors**
   - Check Redis credentials in environment variables
   - Verify Redis service is running

5. **CORS errors**
   - Update `CORS_ALLOWED_ORIGINS` with your frontend domain
   - Check `CSRF_TRUSTED_ORIGINS`

## **📊 Post-Deployment Testing**

### **1. Health Check**
```bash
curl https://your-app-name.onrender.com/api/v1/movies/health/
```

### **2. API Endpoints**
```bash
# Test movies endpoint
curl https://your-app-name.onrender.com/api/v1/movies/

# Test user registration
curl -X POST https://your-app-name.onrender.com/api/v1/users/register/
```

### **3. Check Logs**
- Go to Render dashboard → Logs
- Monitor for any errors
- Check application performance

## **🎯 Next Steps**

1. **Deploy frontend** (Vercel recommended)
2. **Update CORS settings** with frontend domain
3. **Test end-to-end functionality**
4. **Set up monitoring** and alerts

## **📞 Support**

If deployment fails:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure database and Redis services are running
4. Check file structure in GitHub repository

Your API should be live at: `https://your-app-name.onrender.com` 🚀 