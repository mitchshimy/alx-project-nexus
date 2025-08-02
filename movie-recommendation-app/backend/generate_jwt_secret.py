#!/usr/bin/env python3
"""
Script to generate JWT secret keys for Django REST Framework Simple JWT
"""
import secrets
import string

def generate_secret_key(length=64):
    """Generate a secure random secret key"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*(-_=+)"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_jwt_secrets():
    """Generate JWT secret keys"""
    print("🔐 Generating JWT Secret Keys...")
    print("=" * 50)
    
    # Generate Django SECRET_KEY
    django_secret = generate_secret_key(64)
    print(f"DJANGO_SECRET_KEY={django_secret}")
    print()
    
    # Generate JWT Secret Key
    jwt_secret = generate_secret_key(64)
    print(f"JWT_SECRET_KEY={jwt_secret}")
    print()
    
    print("📝 Copy these to your environment variables:")
    print("=" * 50)
    print("For local development (env.local):")
    print(f"SECRET_KEY={django_secret}")
    print(f"JWT_SECRET_KEY={jwt_secret}")
    print()
    print("For production (Render environment variables):")
    print(f"SECRET_KEY={django_secret}")
    print(f"JWT_SECRET_KEY={jwt_secret}")
    print()
    print("⚠️  IMPORTANT:")
    print("- Keep these keys secret and secure")
    print("- Use different keys for development and production")
    print("- Never commit these keys to version control")
    print("- Store them in environment variables only")

if __name__ == "__main__":
    generate_jwt_secrets() 