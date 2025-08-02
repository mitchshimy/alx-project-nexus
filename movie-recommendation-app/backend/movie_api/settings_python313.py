"""
Python 3.13 specific settings for Django
Uses psycopg3 instead of psycopg2 for PostgreSQL compatibility
"""

import sys
from .settings import *

# Check if we're running Python 3.13
if sys.version_info >= (3, 13):
    # Use psycopg3 for Python 3.13
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='movie_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='password'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
            'OPTIONS': {
                'client_encoding': 'UTF8',
            },
        }
    }
    
    # Add psycopg3 specific settings
    import psycopg
    print("✅ Using psycopg3 for Python 3.13 compatibility")
else:
    # Use psycopg2 for older Python versions
    DATABASES = {
        'default': {
            'ENGINE': config('DB_ENGINE', default='django.db.backends.postgresql'),
            'NAME': config('DB_NAME', default='movie_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='password'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
    print("✅ Using psycopg2 for Python compatibility") 