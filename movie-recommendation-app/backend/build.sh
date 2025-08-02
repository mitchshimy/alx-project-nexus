#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip and install setuptools first
pip install --upgrade pip
pip install --upgrade setuptools wheel

# Install requirements
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate 