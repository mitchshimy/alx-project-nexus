#!/usr/bin/env python3
"""
PostgreSQL Connection Test Script

This script tests the PostgreSQL connection and basic functionality
for the movie recommendation app.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings')
django.setup()

from django.db import connection
from django.conf import settings
from django.contrib.auth import get_user_model
from movies.models import Movie

def test_database_connection():
    """Test basic database connection"""
    print("🔍 Testing PostgreSQL connection...")
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL connected successfully!")
            print(f"📊 Database version: {version[0]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_database_settings():
    """Display current database settings"""
    print("\n🔧 Current database settings:")
    db_settings = settings.DATABASES['default']
    print(f"   Engine: {db_settings['ENGINE']}")
    print(f"   Name: {db_settings['NAME']}")
    print(f"   User: {db_settings['USER']}")
    print(f"   Host: {db_settings['HOST']}")
    print(f"   Port: {db_settings['PORT']}")

def test_migrations():
    """Test if migrations can be applied"""
    print("\n🔄 Testing migrations...")
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'check', '--database', 'default'])
        print("✅ Database migrations check passed!")
        return True
    except Exception as e:
        print(f"❌ Migration check failed: {e}")
        return False

def test_models():
    """Test model queries"""
    print("\n📋 Testing model queries...")
    
    try:
        User = get_user_model()
        user_count = User.objects.count()
        print(f"✅ Users table accessible: {user_count} users found")
        
        movie_count = Movie.objects.count()
        print(f"✅ Movies table accessible: {movie_count} movies found")
        
        return True
    except Exception as e:
        print(f"❌ Model query failed: {e}")
        return False

def test_environment():
    """Check environment variables"""
    print("\n🌍 Checking environment variables...")
    
    from decouple import config
    
    required_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']
    missing_vars = []
    
    for var in required_vars:
        value = config(var, default=None)
        if value is None:
            missing_vars.append(var)
        else:
            print(f"   ✅ {var}: {value}")
    
    if missing_vars:
        print(f"   ❌ Missing variables: {missing_vars}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🚀 PostgreSQL Setup Test")
    print("=" * 50)
    
    tests = [
        ("Environment Variables", test_environment),
        ("Database Settings", test_database_settings),
        ("Database Connection", test_database_connection),
        ("Migrations", test_migrations),
        ("Model Queries", test_models),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📝 Running: {test_name}")
        if test_func():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! PostgreSQL is ready to use.")
        print("\nNext steps:")
        print("1. Run: python manage.py migrate")
        print("2. Run: python manage.py createsuperuser")
        print("3. Run: python manage.py runserver")
    else:
        print("❌ Some tests failed. Please check the setup guide.")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is installed and running")
        print("2. Check your env.local file configuration")
        print("3. Verify database and user exist in PostgreSQL")
        print("4. Install dependencies: pip install -r requirements.txt")

if __name__ == "__main__":
    main() 