#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip and install setuptools first
pip install --upgrade pip
pip install --upgrade setuptools wheel

# Try to install requirements with psycopg2-binary first
echo "Attempting to install with psycopg2-binary..."
if pip install -r requirements.txt; then
    echo "Successfully installed with psycopg2-binary"
else
    echo "psycopg2-binary failed, trying alternative requirements..."
    # If psycopg2-binary fails, try the alternative version
    pip install -r requirements-alternative.txt
fi

# Test PostgreSQL connection
echo "Testing PostgreSQL setup..."
python test_postgres_connection.py

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate 