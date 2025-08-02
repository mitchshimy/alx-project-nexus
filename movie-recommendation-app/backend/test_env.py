#!/usr/bin/env python3
"""
Simple environment variable test script
"""

import os
import sys
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Test 1: Direct file reading
print("🔍 Testing direct file reading...")
env_file = BASE_DIR / 'env.local'
if env_file.exists():
    print(f"✅ env.local file exists at: {env_file}")
    with open(env_file, 'r') as f:
        content = f.read()
        print("📄 File contents:")
        print(content)
else:
    print(f"❌ env.local file not found at: {env_file}")

# Test 2: Using decouple
print("\n🔍 Testing decouple config...")
try:
    from decouple import Config, RepositoryEnv
    config = Config(RepositoryEnv(BASE_DIR / 'env.local'))
    
    db_vars = ['DB_ENGINE', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']
    for var in db_vars:
        value = config(var, default=None)
        print(f"   {var}: {value}")
        
except Exception as e:
    print(f"❌ Error loading config: {e}")

# Test 3: Django settings approach
print("\n🔍 Testing Django settings approach...")
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings')
    import django
    django.setup()
    
    from django.conf import settings
    db_settings = settings.DATABASES['default']
    print(f"   Engine: {db_settings['ENGINE']}")
    print(f"   Name: {db_settings['NAME']}")
    print(f"   User: {db_settings['USER']}")
    print(f"   Password: {db_settings['PASSWORD']}")
    print(f"   Host: {db_settings['HOST']}")
    print(f"   Port: {db_settings['PORT']}")
    
except Exception as e:
    print(f"❌ Error with Django settings: {e}") 