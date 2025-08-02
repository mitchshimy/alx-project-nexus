# Render Deployment Guide for Movie Recommendation API

## 🚀 Step-by-Step Deployment Instructions

### **Step 1: Prepare Your Repository**

1. **Ensure your code is committed to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify these files exist in your backend directory:**
   - `requirements.txt` ✅
   - `build.sh` ✅
   - `movie_api/production.py` ✅
   - `env.production` ✅

### **Step 2: Set Up PostgreSQL Database on Render**

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in to your account

2. **Create PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - **Name**: `movie-recommendation-db`
   - **Database**: `movie_db`
   - **User**: `movie_user`
   - **Region**: Choose closest to your users
   - Click "Create Database"

3. **Save Database Credentials**
   - Copy the **Internal Database URL**
   - Copy the **External Database URL**
   - Save these for later use

### **Step 3: Set Up Redis on Render**

1. **Create Redis Instance**
   - Click "New" → "Redis"
   - **Name**: `movie-recommendation-redis`
   - **Region**: Same as your database
   - Click "Create Redis"

2. **Save Redis Credentials**
   - Copy the **Internal Redis URL**
   - Copy the **External Redis URL**
   - Save these for later use

### **Step 4: Deploy Your Django App**

1. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure the Service**
   - **Name**: `movie-recommendation-api`
   - **Environment**: `Python 3`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd movie-recommendation-app/backend && gunicorn movie_api.wsgi:application`
   - **Root Directory**: Leave empty (use repository root)

3. **Set Environment Variables**
   Click "Environment" tab and add these variables:

   ```bash
   # Django Settings
   SECRET_KEY=X5%BUZoW+Q94)eYZ(M-fGJ!YfJRC8FzF+RvLV1G@JmhXc_oQqlNtdwNtblP54MQd
   DEBUG=False
   
   # Database Settings (from Step 2)
   DB_NAME=movie_db
   DB_USER=movie_user
   DB_PASSWORD=your-db-password
   DB_HOST=your-db-host
   DB_PORT=5432
   
   # Redis Settings (from Step 3)
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

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### **Step 5: Update Frontend Configuration**

1. **Update API Base URL**
   - Go to your frontend code
   - Update `API_BASE_URL` in `utils/api.ts`
   - Change from `http://localhost:8000/api/v1` to `https://your-app-name.onrender.com/api/v1`

2. **Update CORS Settings**
   - Go back to your Render app settings
   - Update `CORS_ALLOWED_ORIGINS` with your frontend domain

### **Step 6: Test Your Deployment**

1. **Test API Endpoints**
   ```bash
   # Test health check
   curl https://your-app-name.onrender.com/api/v1/movies/
   
   # Test authentication
   curl https://your-app-name.onrender.com/api/v1/users/register/
   ```

2. **Check Logs**
   - Go to your Render app dashboard
   - Click "Logs" tab
   - Monitor for any errors

### **Step 7: Set Up Custom Domain (Optional)**

1. **Add Custom Domain**
   - Go to your app settings
   - Click "Settings" → "Custom Domains"
   - Add your domain (e.g., `api.yourdomain.com`)

2. **Update DNS**
   - Add CNAME record pointing to your Render app
   - Wait for DNS propagation

## 🔧 Troubleshooting

### **Common Issues:**

1. **Build Fails**
   - Check `build.sh` has execute permissions
   - Verify all dependencies in `requirements.txt`

2. **Database Connection Error**
   - Verify database credentials
   - Check if database is accessible from your app

3. **Static Files Not Loading**
   - Ensure `STATIC_ROOT` is set correctly
   - Check `whitenoise` is in requirements

4. **CORS Errors**
   - Update `CORS_ALLOWED_ORIGINS` with your frontend domain
   - Check `CSRF_TRUSTED_ORIGINS`

### **Useful Commands:**

```bash
# Check app logs
# Go to Render dashboard → Logs

# Restart app
# Go to Render dashboard → Manual Deploy

# Check environment variables
# Go to Render dashboard → Environment
```

## 📊 Monitoring

1. **Set up alerts** in Render dashboard
2. **Monitor logs** for errors
3. **Check performance** metrics
4. **Set up uptime monitoring**

## 🔒 Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY`
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database credentials secure
- [ ] API keys not exposed in logs

## 🎯 Next Steps

1. **Deploy your frontend** (Vercel, Netlify, etc.)
2. **Set up monitoring** (Sentry, etc.)
3. **Configure backups** for database
4. **Set up CI/CD** pipeline

Your API should now be live at: `https://your-app-name.onrender.com` 