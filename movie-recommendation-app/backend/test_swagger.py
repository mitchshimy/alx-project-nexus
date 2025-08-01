#!/usr/bin/env python3
"""
Test script for Swagger API documentation
This script tests the basic functionality of the API endpoints
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_swagger_endpoints():
    """Test that Swagger documentation endpoints are accessible"""
    print("🔍 Testing Swagger documentation endpoints...")
    
    # Test Swagger UI
    try:
        response = requests.get(f"{BASE_URL}/swagger/")
        if response.status_code == 200:
            print("✅ Swagger UI is accessible")
        else:
            print(f"❌ Swagger UI returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing Swagger UI: {e}")
    
    # Test ReDoc
    try:
        response = requests.get(f"{BASE_URL}/redoc/")
        if response.status_code == 200:
            print("✅ ReDoc is accessible")
        else:
            print(f"❌ ReDoc returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing ReDoc: {e}")
    
    # Test OpenAPI JSON schema
    try:
        response = requests.get(f"{BASE_URL}/swagger.json")
        if response.status_code == 200:
            print("✅ OpenAPI JSON schema is accessible")
            # Try to parse the JSON to ensure it's valid
            try:
                schema = response.json()
                print(f"✅ OpenAPI schema contains {len(schema.get('paths', {}))} endpoints")
            except json.JSONDecodeError:
                print("❌ OpenAPI schema is not valid JSON")
        else:
            print(f"❌ OpenAPI JSON schema returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing OpenAPI JSON schema: {e}")

def test_api_endpoints():
    """Test basic API endpoints"""
    print("\n🔍 Testing API endpoints...")
    
    # Test movies endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/v1/movies/")
        if response.status_code == 200:
            print("✅ Movies endpoint is working")
        else:
            print(f"❌ Movies endpoint returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing movies endpoint: {e}")
    
    # Test genres endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/v1/movies/genres/")
        if response.status_code == 200:
            print("✅ Genres endpoint is working")
        else:
            print(f"❌ Genres endpoint returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing genres endpoint: {e}")
    
    # Test search endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/v1/movies/search/?q=test")
        if response.status_code == 200:
            print("✅ Search endpoint is working")
        else:
            print(f"❌ Search endpoint returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing search endpoint: {e}")

def test_user_endpoints():
    """Test user registration and login"""
    print("\n🔍 Testing user endpoints...")
    
    # Test user registration
    test_user_data = {
        "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
        "password": "testpassword123",
        "password_confirm": "testpassword123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/register/",
            json=test_user_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 201:
            print("✅ User registration is working")
            # Try to login with the created user
            login_data = {
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }
            login_response = requests.post(
                f"{BASE_URL}/api/v1/users/login/",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            if login_response.status_code == 200:
                print("✅ User login is working")
                # Extract token for further testing
                login_data = login_response.json()
                if 'tokens' in login_data and 'access' in login_data['tokens']:
                    token = login_data['tokens']['access']
                    # Test authenticated endpoint
                    headers = {"Authorization": f"Bearer {token}"}
                    profile_response = requests.get(
                        f"{BASE_URL}/api/v1/users/profile/",
                        headers=headers
                    )
                    if profile_response.status_code == 200:
                        print("✅ Authenticated endpoints are working")
                    else:
                        print(f"❌ Profile endpoint returned status code: {profile_response.status_code}")
                else:
                    print("❌ Login response doesn't contain tokens")
            else:
                print(f"❌ User login returned status code: {login_response.status_code}")
        else:
            print(f"❌ User registration returned status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing user endpoints: {e}")

def main():
    """Main test function"""
    print("🚀 Starting Swagger API Documentation Tests")
    print("=" * 50)
    
    # Test Swagger documentation endpoints
    test_swagger_endpoints()
    
    # Test basic API endpoints
    test_api_endpoints()
    
    # Test user endpoints
    test_user_endpoints()
    
    print("\n" + "=" * 50)
    print("🎉 Testing completed!")
    print("\n📖 To view the Swagger documentation:")
    print(f"   Swagger UI: {BASE_URL}/swagger/")
    print(f"   ReDoc: {BASE_URL}/redoc/")
    print(f"   OpenAPI JSON: {BASE_URL}/swagger.json")

if __name__ == "__main__":
    main() 