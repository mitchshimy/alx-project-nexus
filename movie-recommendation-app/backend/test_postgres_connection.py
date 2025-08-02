#!/usr/bin/env python3
"""
Test script to verify PostgreSQL connection and psycopg2 installation
"""

import sys
import os

def test_psycopg2_import():
    """Test if psycopg2 can be imported"""
    try:
        import psycopg2
        print("✅ psycopg2 imported successfully")
        print(f"psycopg2 version: {psycopg2.__version__}")
        return True
    except ImportError as e:
        print(f"❌ Failed to import psycopg2: {e}")
        return False

def test_psycopg2_binary_import():
    """Test if psycopg2-binary can be imported"""
    try:
        import psycopg2.binary
        print("✅ psycopg2.binary imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import psycopg2.binary: {e}")
        return False

def test_database_connection():
    """Test database connection if environment variables are set"""
    try:
        import psycopg2
        
        # Get database settings from environment
        db_name = os.getenv('DB_NAME')
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWORD')
        db_host = os.getenv('DB_HOST')
        db_port = os.getenv('DB_PORT', '5432')
        
        if not all([db_name, db_user, db_password, db_host]):
            print("⚠️  Database environment variables not set, skipping connection test")
            return True
        
        # Try to connect
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.close()
        print("✅ Database connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing PostgreSQL setup...")
    
    # Test imports
    psycopg2_ok = test_psycopg2_import()
    binary_ok = test_psycopg2_binary_import()
    
    # Test connection
    connection_ok = test_database_connection()
    
    if psycopg2_ok and connection_ok:
        print("✅ All PostgreSQL tests passed!")
        sys.exit(0)
    else:
        print("❌ Some PostgreSQL tests failed!")
        sys.exit(1) 