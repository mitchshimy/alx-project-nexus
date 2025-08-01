#!/usr/bin/env python
"""
Debug Redis Connection
Tests different connection formats to identify the issue
"""

import redis
import os
from pathlib import Path
from decouple import Config, RepositoryEnv

# Load environment variables from env.local file
BASE_DIR = Path(__file__).resolve().parent
config = Config(RepositoryEnv(BASE_DIR / 'env.local'))

def debug_redis_connection():
    """Debug Redis connection with different formats"""
    print("🔍 Debugging Redis Connection")
    print("=" * 40)
    
    # Get credentials
    host = config('REDIS_HOST', default='localhost')
    port = config('REDIS_PORT', default=6379, cast=int)
    password = config('REDIS_PASSWORD', default='')
    db = config('REDIS_DB', default=0, cast=int)
    
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Password: {password[:10]}..." if password else "No password")
    print(f"DB: {db}")
    
    # Test 1: Basic connection without password
    print("\n🔍 Test 1: Basic connection")
    try:
        r = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        r.ping()
        print("✅ Basic connection successful")
    except Exception as e:
        print(f"❌ Basic connection failed: {e}")
    
    # Test 2: Connection with password
    print("\n🔍 Test 2: Connection with password")
    try:
        r = redis.Redis(host=host, port=port, password=password, db=db, decode_responses=True)
        r.ping()
        print("✅ Password connection successful")
    except Exception as e:
        print(f"❌ Password connection failed: {e}")
    
    # Test 3: Connection with username (Redis 6+)
    print("\n🔍 Test 3: Connection with username")
    try:
        r = redis.Redis(host=host, port=port, username='default', password=password, db=db, decode_responses=True)
        r.ping()
        print("✅ Username connection successful")
    except Exception as e:
        print(f"❌ Username connection failed: {e}")
    
    # Test 4: URL format
    print("\n🔍 Test 4: URL format")
    try:
        redis_url = f"redis://:{password}@{host}:{port}/{db}"
        r = redis.from_url(redis_url, decode_responses=True)
        r.ping()
        print("✅ URL format successful")
    except Exception as e:
        print(f"❌ URL format failed: {e}")
    
    # Test 5: URL format with username
    print("\n🔍 Test 5: URL format with username")
    try:
        redis_url = f"redis://default:{password}@{host}:{port}/{db}"
        r = redis.from_url(redis_url, decode_responses=True)
        r.ping()
        print("✅ URL with username successful")
    except Exception as e:
        print(f"❌ URL with username failed: {e}")

if __name__ == "__main__":
    debug_redis_connection() 