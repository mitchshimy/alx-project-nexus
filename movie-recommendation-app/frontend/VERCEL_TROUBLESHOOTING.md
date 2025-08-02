# Vercel MIME Type Error Troubleshooting

## Issue: "Refused to execute script because its MIME type ('text/html') is not executable"

This error occurs when Vercel serves HTML content instead of JavaScript files, usually due to build failures or configuration issues.

## Solutions

### 1. Clear Vercel Cache and Redeploy

```bash
# In your Vercel dashboard:
# 1. Go to your project
# 2. Click "Settings" → "General"
# 3. Scroll down to "Build & Development Settings"
# 4. Click "Clear Build Cache"
# 5. Redeploy
```

### 2. Check Build Logs

1. Go to your Vercel dashboard
2. Click on your latest deployment
3. Check the "Build" tab for any errors
4. Look for TypeScript or build errors

### 3. Update Environment Variables

Make sure you have the correct API URL set:

```
NEXT_PUBLIC_API_URL=https://your-render-app-name.onrender.com/api/v1
```

### 4. Force Clean Build

```bash
# Locally test the build
npm run build

# If successful, push and redeploy
git add .
git commit -m "Fix Vercel deployment"
git push
```

### 5. Check Next.js Version Compatibility

The error might be related to Next.js 15.4.4. Try downgrading:

```json
{
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### 6. Alternative: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### 7. Check for Common Issues

- **Missing environment variables**
- **API endpoint not responding**
- **TypeScript compilation errors**
- **Missing dependencies**

### 8. Debug Steps

1. **Check the Network tab** in browser dev tools
2. **Look for 404 errors** on JavaScript files
3. **Verify the build output** in Vercel logs
4. **Test locally** with `npm run build && npm start`

### 9. Quick Fix

If the issue persists, try this minimal `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['image.tmdb.org'],
  },
  swcMinify: true,
};

export default nextConfig;
```

### 10. Contact Vercel Support

If none of the above works:
1. Go to Vercel dashboard
2. Click "Help" → "Contact Support"
3. Include your build logs and error screenshots

## Prevention

- Always test builds locally before deploying
- Use consistent Node.js versions
- Keep dependencies updated
- Monitor build logs for warnings 