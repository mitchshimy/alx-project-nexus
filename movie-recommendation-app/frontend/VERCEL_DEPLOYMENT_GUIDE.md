# Vercel Deployment Guide for Movie Recommendation Frontend

## 🚀 Step-by-Step Vercel Deployment

### **Step 1: Prepare Your Frontend**

1. **Ensure your code is committed to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify these files exist in your frontend directory:**
   - `package.json` ✅
   - `next.config.ts` ✅
   - `vercel.json` ✅

### **Step 2: Deploy to Vercel**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Your Repository**
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure the Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `movie-recommendation-app/frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-render-app-name.onrender.com/api/v1
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### **Step 3: Update Backend CORS Settings**

1. **Go to your Render app dashboard**
2. **Update Environment Variables**
   - Add your Vercel domain to `CORS_ALLOWED_ORIGINS`
   - Example: `https://your-app-name.vercel.app`

### **Step 4: Test Your Deployment**

1. **Test Frontend**
   - Visit your Vercel URL
   - Test all features (movies, authentication, etc.)

2. **Test API Integration**
   - Check browser console for CORS errors
   - Verify API calls are working

## 🔧 Configuration Details

### **Vercel Configuration (`vercel.json`)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-render-app-name.onrender.com/api/v1"
  }
}
```

### **Environment Variables**
- `NEXT_PUBLIC_API_URL`: Your Render backend URL
- Any other environment variables your app needs

## 🎯 Benefits of Vercel + Render Setup

### **Vercel Advantages:**
- ✅ **Automatic deployments** from GitHub
- ✅ **Global CDN** for fast loading
- ✅ **Preview deployments** for PRs
- ✅ **Built-in analytics** and performance monitoring
- ✅ **Zero configuration** for Next.js
- ✅ **Automatic HTTPS**

### **Render Advantages:**
- ✅ **PostgreSQL and Redis** support
- ✅ **Django optimization**
- ✅ **Database management**
- ✅ **Background job support**
- ✅ **Custom domains**

## 🔧 Troubleshooting

### **Common Issues:**

1. **CORS Errors**
   - Update `CORS_ALLOWED_ORIGINS` in Render with your Vercel domain
   - Check `CSRF_TRUSTED_ORIGINS`

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check Render app is running
   - Test API endpoints directly

3. **Build Errors**
   - Check `package.json` dependencies
   - Verify TypeScript configuration
   - Check for missing environment variables

### **Useful Commands:**

```bash
# Test API locally
curl https://your-render-app-name.onrender.com/api/v1/movies/

# Check Vercel deployment
# Go to Vercel dashboard → Functions tab
```

## 📊 Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Render Logs**: Monitor backend performance
3. **Uptime Monitoring**: Set up alerts for both services

## 🔒 Security Checklist

- [ ] HTTPS enabled on both services
- [ ] CORS properly configured
- [ ] Environment variables secure
- [ ] API keys not exposed in frontend
- [ ] Database credentials secure

## 🎯 Final Setup

Your app will be available at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-render-app-name.onrender.com`

This setup gives you the best of both worlds: Vercel's frontend optimization and Render's backend capabilities! 