"""
WSGI config for movie_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import sys

# Add the project directory to the Python path
project_home = '/home/shimy/alx-project-nexus/movie-recommendation-app/backend'
if project_home not in sys.path:
    sys.path.append(project_home)

# Set the Django settings module (temporarily using regular settings)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings')

# Get the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Add WhiteNoise for static files in production
try:
    from whitenoise import WhiteNoise
    application = WhiteNoise(application)
    # Add static files directory
    application.add_files('staticfiles/', prefix='static/')
except ImportError:
    # WhiteNoise not available, continue without it
    pass
