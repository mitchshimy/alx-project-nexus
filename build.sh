#!/usr/bin/env bash
# exit on error
set -o errexit

# Navigate to backend directory
cd movie-recommendation-app/backend

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Create database if it doesn't exist (for Render)
python manage.py dbshell --command="SELECT 1;" 2>/dev/null || python manage.py dbshell --command="CREATE DATABASE movie_db;" 2>/dev/null || echo "Database creation failed, continuing..."

# Run migrations
python manage.py migrate 