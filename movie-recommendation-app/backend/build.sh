#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip and install setuptools first
pip install --upgrade pip
pip install --upgrade setuptools wheel

# Check Python version
echo "Python version: $(python --version)"

# Check if we're using Python 3.13
PYTHON_VERSION=$(python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Detected Python version: $PYTHON_VERSION"

# Try to install requirements based on Python version
if [[ "$PYTHON_VERSION" == "3.13" ]]; then
    echo "Using Python 3.13 specific requirements..."
    pip install -r requirements-python313.txt
    
    # Set Django settings for Python 3.13
    export DJANGO_SETTINGS_MODULE=movie_api.settings_python313
    echo "✅ Using Python 3.13 specific Django settings"
else
    echo "Using standard requirements..."
    # Try to install requirements with psycopg2-binary first
    echo "Attempting to install with psycopg2-binary..."
    if pip install -r requirements.txt; then
        echo "Successfully installed with psycopg2-binary"
    else
        echo "psycopg2-binary failed, trying alternative requirements..."
        # If psycopg2-binary fails, try the alternative version
        pip install -r requirements-alternative.txt
    fi
fi

# Test PostgreSQL connection
echo "Testing PostgreSQL setup..."
python test_postgres_connection.py

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate 