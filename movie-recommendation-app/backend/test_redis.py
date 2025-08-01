#!/usr/bin/env python
"""
Redis Connection Test Script
Tests Redis connection and basic functionality
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings')
django.setup()

from django.core.cache import cache
from django.conf import settings
import redis

def test_redis_connection():
    """Test Redis connection and basic operations"""
    print("🚀 Starting Redis Connection Test")
    print("=" * 50)
    
    try:
        # Test 1: Direct Redis connection
        print("🔍 Test 1: Direct Redis Connection")
        r = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        
        # Test ping
        response = r.ping()
        print(f"✅ Redis ping: {response}")
        
        # Test basic operations
        r.set('test_key', 'test_value')
        value = r.get('test_key')
        print(f"✅ Set/Get test: {value}")
        
        # Clean up
        r.delete('test_key')
        print("✅ Cleanup completed")
        
    except Exception as e:
        print(f"❌ Direct Redis connection failed: {e}")
        return False
    
    try:
        # Test 2: Django cache connection
        print("\n🔍 Test 2: Django Cache Connection")
        
        # Test cache set/get
        cache.set('django_test_key', 'django_test_value', timeout=60)
        value = cache.get('django_test_key')
        print(f"✅ Django cache set/get: {value}")
        
        # Test cache delete
        cache.delete('django_test_key')
        value = cache.get('django_test_key')
        print(f"✅ Django cache delete: {value}")
        
    except Exception as e:
        print(f"❌ Django cache connection failed: {e}")
        return False
    
    try:
        # Test 3: Cache performance
        print("\n🔍 Test 3: Cache Performance")
        
        # Test multiple operations
        for i in range(5):
            cache.set(f'perf_test_{i}', f'value_{i}', timeout=30)
        
        # Retrieve all
        for i in range(5):
            value = cache.get(f'perf_test_{i}')
            print(f"✅ Performance test {i}: {value}")
        
        # Clean up
        for i in range(5):
            cache.delete(f'perf_test_{i}')
        
    except Exception as e:
        print(f"❌ Cache performance test failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All Redis tests passed!")
    print("✅ Redis is properly configured and working")
    return True

if __name__ == '__main__':
    success = test_redis_connection()
    if not success:
        print("\n❌ Redis tests failed. Please check your Redis installation.")
        sys.exit(1) 