#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Check Python version and set appropriate settings
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}"
    
    if python_version == "3.13":
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings_python313')
        print(f"✅ Using Python {python_version} specific settings")
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_api.settings')
        print(f"✅ Using standard settings for Python {python_version}")
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
