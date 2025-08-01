#!/usr/bin/env python
"""
Test Redis Cloud Specific Connection
Tests Redis Cloud specific connection methods
"""

import redis
from pathlib import Path
from decouple import Config, RepositoryEnv

# Load environment variables from env.local file
BASE_DIR = Path(__file__).resolve().parent
config = Config(RepositoryEnv(BASE_DIR / 'env.local'))

def test_redis_cloud_specific():
    """Test Redis Cloud specific connection methods"""
    print("🔍 Testing Redis Cloud Specific Connection")
    print("=" * 50)
    
    host = config('REDIS_HOST')
    port = config('REDIS_PORT', cast=int)
    password = config('REDIS_PASSWORD')
    db = config('REDIS_DB', cast=int)
    
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Password: {password[:10]}...")
    print(f"DB: {db}")
    
    # Method 1: Redis Cloud with SSL (most common)
    print("\n🔍 Method 1: Redis Cloud with SSL")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            password=password, 
            db=db, 
            decode_responses=True,
            ssl=True,
            ssl_cert_reqs=None
        )
        r.ping()
        print("✅ SUCCESS with SSL")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 2: Redis Cloud without SSL
    print("\n🔍 Method 2: Redis Cloud without SSL")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            password=password, 
            db=db, 
            decode_responses=True,
            ssl=False
        )
        r.ping()
        print("✅ SUCCESS without SSL")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 3: Redis Cloud with username and SSL
    print("\n🔍 Method 3: Redis Cloud with username and SSL")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            username='default',
            password=password, 
            db=db, 
            decode_responses=True,
            ssl=True,
            ssl_cert_reqs=None
        )
        r.ping()
        print("✅ SUCCESS with username and SSL")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 4: URL format with SSL
    print("\n🔍 Method 4: URL format with SSL")
    try:
        redis_url = f"rediss://:{password}@{host}:{port}/{db}"
        r = redis.from_url(redis_url, decode_responses=True, ssl_cert_reqs=None)
        r.ping()
        print("✅ SUCCESS with URL and SSL")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 5: URL format without SSL
    print("\n🔍 Method 5: URL format without SSL")
    try:
        redis_url = f"redis://:{password}@{host}:{port}/{db}"
        r = redis.from_url(redis_url, decode_responses=True)
        r.ping()
        print("✅ SUCCESS with URL without SSL")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n❌ All Redis Cloud methods failed!")
    print("\n💡 Please check:")
    print("1. Redis Cloud database is active")
    print("2. IP restrictions (allow all IPs: 0.0.0.0/0)")
    print("3. Database access permissions")
    print("4. Try creating a new database")
    
    return False

if __name__ == "__main__":
    test_redis_cloud_specific() 