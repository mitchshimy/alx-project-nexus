# Redis Setup Guide for Windows

This guide will help you set up Redis for local development on Windows.

## Method 1: Using Chocolatey (Recommended)

### Step 1: Install Redis
Open **PowerShell as Administrator** and run:

```powershell
# Install Redis
choco install redis-64 -y

# Refresh environment variables
refreshenv
```

### Step 2: Start Redis Service
```powershell
# Start Redis as a Windows service
redis-server --service-start

# Or start it manually (keep this running)
redis-server
```

### Step 3: Test Redis
```powershell
# Test Redis connection
redis-cli ping
```

You should see: `PONG`

## Method 2: Manual Installation

### Step 1: Download Redis
1. Go to: https://github.com/microsoftarchive/redis/releases
2. Download the latest MSI installer (e.g., `Redis-x64-3.0.504.msi`)

### Step 2: Install Redis
1. Run the MSI installer as Administrator
2. Follow the installation wizard
3. Make sure to check "Add to PATH" during installation

### Step 3: Start Redis
```powershell
# Start Redis service
redis-server --service-start

# Or start manually
redis-server
```

## Method 3: Using Docker (Alternative)

If you have Docker Desktop running:

```powershell
# Start Redis container
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# Test connection
docker exec redis-cache redis-cli ping
```

## Troubleshooting

### Issue: "redis-server is not recognized"
**Solution:** Redis is not in your PATH
```powershell
# Find Redis installation
Get-ChildItem -Path "C:\tools" -Recurse -Name "redis-server.exe" -ErrorAction SilentlyContinue
Get-ChildItem -Path "C:\ProgramData\chocolatey\lib\redis-64" -Recurse -Name "redis-server.exe" -ErrorAction SilentlyContinue

# Add to PATH manually if needed
$env:PATH += ";C:\tools\redis"
```

### Issue: "Connection refused"
**Solution:** Redis is not running
```powershell
# Start Redis
redis-server --service-start

# Check if Redis is running
netstat -an | findstr 6379
```

### Issue: "Permission denied"
**Solution:** Run PowerShell as Administrator

## Testing Redis with Django

After setting up Redis, test it with our Django app:

```powershell
# Navigate to backend directory
cd H:\Projects\nexus\movie-recommendation-app\backend

# Run Redis test
python test_redis.py
```

## Redis Configuration

The Django settings are already configured to use Redis:

- **Host:** localhost
- **Port:** 6379
- **Database:** 0

You can modify these in `movie_api/settings.py`:

```python
REDIS_HOST = config('REDIS_HOST', default='localhost')
REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
REDIS_DB = config('REDIS_DB', default=0, cast=int)
```

## Redis Commands

### Basic Redis CLI Commands
```powershell
# Connect to Redis
redis-cli

# Test connection
ping

# Set a value
set mykey "Hello Redis"

# Get a value
get mykey

# List all keys
keys *

# Delete a key
del mykey

# Exit Redis CLI
exit
```

### Redis Service Management
```powershell
# Start Redis service
redis-server --service-start

# Stop Redis service
redis-server --service-stop

# Install Redis as a service
redis-server --service-install

# Uninstall Redis service
redis-server --service-uninstall
```

## Production Considerations

For production, consider:
- Using Redis Cloud (free tier available)
- Setting up Redis with authentication
- Configuring Redis persistence
- Using Redis Cluster for high availability

## Free Redis Hosting Options

1. **Redis Cloud** (https://redis.com/try-free/)
   - Free tier: 30MB storage, 30 connections
   - Easy setup, good documentation

2. **Upstash Redis** (https://upstash.com/)
   - Free tier: 10,000 requests/day
   - Serverless Redis

3. **Railway** (https://railway.app/)
   - Free tier available
   - Easy deployment

## Next Steps

Once Redis is working locally:
1. Test with `python test_redis.py`
2. Start your Django server
3. Test API endpoints to see caching in action
4. Consider setting up Redis for production 