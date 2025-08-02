"""
Python 3.13 specific settings for Django
Uses psycopg3 instead of psycopg2 for PostgreSQL compatibility
"""

import sys
from .settings import *

# For Python 3.13, use standard psycopg2 settings
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

print("✅ Using standard PostgreSQL settings for Python 3.13") 