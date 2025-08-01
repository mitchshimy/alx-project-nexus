#!/usr/bin/env python
"""
Test Redis Cloud Connection
Verifies connection to Redis Cloud
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
import redis

def test_redis_cloud():
    """Test Redis Cloud connection"""
    print("🚀 Testing Redis Cloud Connection")
    print("=" * 40)
    
    # Test 1: Django cache
    print("\n🔍 Test 1: Django Cache")
    try:
        cache.set('test_key', 'test_value', timeout=60)
        value = cache.get('test_key')
        print(f"✅ Django Cache: {value}")
        cache.delete('test_key')
    except Exception as e:
        print(f"❌ Django Cache failed: {e}")
    
    # Test 2: Direct Redis connection
    print("\n🔍 Test 2: Direct Redis")
    try:
        from django.conf import settings
        r = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        r.set('direct_test', 'direct_value')
        value = r.get('direct_test')
        print(f"✅ Direct Redis: {value}")
        r.delete('direct_test')
    except Exception as e:
        print(f"❌ Direct Redis failed: {e}")
    
    # Test 3: Complex data
    print("\n🔍 Test 3: Complex Data")
    try:
        test_data = {
            'movies': [
                {'id': 1, 'title': 'Test Movie 1'},
                {'id': 2, 'title': 'Test Movie 2'}
            ],
            'count': 2
        }
        cache.set('movies_test', test_data, timeout=300)
        retrieved_data = cache.get('movies_test')
        print(f"✅ Complex Data: {len(retrieved_data.get('movies', []))} movies")
        cache.delete('movies_test')
    except Exception as e:
        print(f"❌ Complex Data failed: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 Redis Cloud Test Complete!")

if __name__ == "__main__":
    test_redis_cloud() 