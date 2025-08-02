# Frontend Environment Setup Guide

## Creating Environment Files

Since `.env` files are in `.gitignore`, you need to create them manually. Here's how:

### 1. For Local Development

Create a file named `.env.local` in your frontend directory:

```bash
# Navigate to your frontend directory
cd movie-recommendation-app/frontend

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

### 2. For Production

Create a file named `.env.production` in your frontend directory:

```bash
# Create .env.production file
echo "NEXT_PUBLIC_API_URL=https://shimy.pythonanywhere.com/api/v1" > .env.production
```

## Environment File Contents

### `.env.local` (for development)
```env
# Django Backend API URL for local development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### `.env.production` (for production)
```env
# Django Backend API URL for production
NEXT_PUBLIC_API_URL=https://shimy.pythonanywhere.com/api/v1
```

## How to Use

### Development Mode
```bash
# Start your Django backend first
cd movie-recommendation-app/backend
python manage.py runserver

# Then start your frontend (in another terminal)
cd movie-recommendation-app/frontend
npm run dev
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variable Priority

Next.js loads environment variables in this order:
1. `.env.local` (highest priority)
2. `.env.production` (for production builds)
3. `.env` (fallback)

## Testing Your Setup

1. **Check if environment variable is loaded**:
   ```javascript
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
   ```

2. **Verify API connection**:
   - Open browser console
   - Check network tab for API requests
   - Verify requests go to the correct URL

## Troubleshooting

### Environment Variable Not Working
1. Make sure the file is named correctly (`.env.local` or `.env.production`)
2. Restart your development server after creating the file
3. Check that variable names start with `NEXT_PUBLIC_`

### API Connection Issues
1. Verify your Django backend is running on the correct port
2. Check that the API URL is correct
3. Test the API endpoint directly in your browser

## Current Configuration

Your `utils/api.ts` is configured to:
- Use `NEXT_PUBLIC_API_URL` if set
- Fall back to `https://shimy.pythonanywhere.com/api/v1` if not set

This means:
- **With `.env.local`**: Connects to local Django backend
- **Without `.env.local`**: Connects to PythonAnywhere backend
- **With `.env.production`**: Connects to PythonAnywhere backend

## Quick Commands

```bash
# Create development environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Create production environment file
echo "NEXT_PUBLIC_API_URL=https://shimy.pythonanywhere.com/api/v1" > .env.production

# Remove environment file (to use default PythonAnywhere)
rm .env.local
``` 