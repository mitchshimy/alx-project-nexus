#!/usr/bin/env python
"""
Test Redis Cloud API Authentication
Tests Redis Cloud with HTTP header authentication
"""

import requests
import json
from pathlib import Path
from decouple import Config, RepositoryEnv

# Load environment variables from env.local file
BASE_DIR = Path(__file__).resolve().parent
config = Config(RepositoryEnv(BASE_DIR / 'env.local'))

def test_redis_cloud_api():
    """Test Redis Cloud with HTTP header authentication"""
    print("🔍 Testing Redis Cloud API Authentication")
    print("=" * 50)
    
    host = config('REDIS_HOST')
    port = config('REDIS_PORT', cast=int)
    account_key = "A55fvusmy3jwg7brsa021tj2plufwpldkun5rg60ymq73ouz4ha"
    user_key = "S1voxfj1unr98n054gf2lk5al8hcoykkxqyu0uvx403o6u16uo3"
    
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Account Key: {account_key[:10]}...")
    print(f"User Key: {user_key[:10]}...")
    
    # Test 1: Basic Redis Cloud API call
    print("\n🔍 Test 1: Redis Cloud API with headers")
    try:
        headers = {
            'x-api-key': account_key,
            'x-api-secret-key': user_key,
            'Content-Type': 'application/json'
        }
        
        # Try to get database info
        url = f"https://{host}/v1/databases"
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 200:
            print("✅ SUCCESS with API headers")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Test 2: Try different endpoint
    print("\n🔍 Test 2: Different API endpoint")
    try:
        headers = {
            'x-api-key': account_key,
            'x-api-secret-key': user_key,
            'Content-Type': 'application/json'
        }
        
        # Try to get database details
        url = f"https://{host}/v1/databases/current"
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 200:
            print("✅ SUCCESS with different endpoint")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n❌ All API methods failed!")
    print("\n💡 This appears to be a Redis Cloud API service, not a direct Redis connection.")
    print("You may need to use a different Redis Cloud plan or service type.")
    
    return False

if __name__ == "__main__":
    test_redis_cloud_api() 