#!/bin/bash

echo "🚀 Starting Django deployment build..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Collect static files (CRITICAL for Swagger UI)
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create static directory if it doesn't exist
mkdir -p staticfiles

# Verify static files were collected
echo "✅ Checking static files..."
ls -la staticfiles/ || echo "⚠️ Static files directory is empty"

# Check if Swagger static files are present
echo "🔍 Checking for Swagger static files..."
find staticfiles -name "*swagger*" -o -name "*drf*" -o -name "*yasg*" | head -10

# Set proper permissions
echo "🔐 Setting file permissions..."
chmod -R 755 staticfiles/

echo "✅ Build completed successfully!"
echo "🌐 Your API should now be accessible at:"
echo "   - API: https://shimy.pythonanywhere.com/api/v1/"
echo "   - Swagger: https://shimy.pythonanywhere.com/swagger/"
echo "   - ReDoc: https://shimy.pythonanywhere.com/redoc/"
echo "   - Admin: https://shimy.pythonanywhere.com/admin/" 