#!/usr/bin/env python
"""
Test Redis Authentication Methods
Tries different authentication approaches for Redis Cloud
"""

import redis
from pathlib import Path
from decouple import Config, RepositoryEnv

# Load environment variables from env.local file
BASE_DIR = Path(__file__).resolve().parent
config = Config(RepositoryEnv(BASE_DIR / 'env.local'))

def test_redis_auth():
    """Test different Redis authentication methods"""
    print("🔍 Testing Redis Authentication Methods")
    print("=" * 50)
    
    host = config('REDIS_HOST')
    port = config('REDIS_PORT', cast=int)
    password = config('REDIS_PASSWORD')
    db = config('REDIS_DB', cast=int)
    
    print(f"Testing connection to: {host}:{port}")
    
    # Method 1: Try with 'default' username (most common)
    print("\n🔍 Method 1: Username 'default'")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            username='default', 
            password=password, 
            db=db, 
            decode_responses=True
        )
        r.ping()
        print("✅ SUCCESS with username 'default'")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 2: Try without username (password only)
    print("\n🔍 Method 2: Password only")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            password=password, 
            db=db, 
            decode_responses=True
        )
        r.ping()
        print("✅ SUCCESS with password only")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 3: Try with empty username
    print("\n🔍 Method 3: Empty username")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            username='', 
            password=password, 
            db=db, 
            decode_responses=True
        )
        r.ping()
        print("✅ SUCCESS with empty username")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Method 4: Try with 'redis' username
    print("\n🔍 Method 4: Username 'redis'")
    try:
        r = redis.Redis(
            host=host, 
            port=port, 
            username='redis', 
            password=password, 
            db=db, 
            decode_responses=True
        )
        r.ping()
        print("✅ SUCCESS with username 'redis'")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n❌ All authentication methods failed!")
    print("\n💡 Please check your Redis Cloud dashboard for:")
    print("1. Correct password")
    print("2. Username (if required)")
    print("3. Database access permissions")
    
    return False

if __name__ == "__main__":
    test_redis_auth() 