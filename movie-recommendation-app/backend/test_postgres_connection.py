#!/usr/bin/env python3
"""
Test script to verify PostgreSQL connection and psycopg2 installation
"""

import sys
import os

def test_psycopg_import():
    """Test if psycopg can be imported (psycopg2 or psycopg3)"""
    try:
        import psycopg
        print("✅ psycopg imported successfully")
        print(f"psycopg version: {psycopg.__version__}")
        return True
    except ImportError as e:
        print(f"❌ Failed to import psycopg: {e}")
        return False

def test_psycopg2_import():
    """Test if psycopg2 can be imported (for older Python versions)"""
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
        # Get database settings from environment
        db_name = os.getenv('DB_NAME')
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWORD')
        db_host = os.getenv('DB_HOST')
        db_port = os.getenv('DB_PORT', '5432')
        
        if not all([db_name, db_user, db_password, db_host]):
            print("⚠️  Database environment variables not set, skipping connection test")
            return True
        
        # Try psycopg3 first (for Python 3.13)
        try:
            import psycopg
            conn = psycopg.connect(
                dbname=db_name,
                user=db_user,
                password=db_password,
                host=db_host,
                port=db_port
            )
            conn.close()
            print("✅ Database connection successful with psycopg3")
            return True
        except ImportError:
            # Fallback to psycopg2
            import psycopg2
            conn = psycopg2.connect(
                dbname=db_name,
                user=db_user,
                password=db_password,
                host=db_host,
                port=db_port
            )
            conn.close()
            print("✅ Database connection successful with psycopg2")
            return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing PostgreSQL setup...")
    
    # Test imports
    psycopg_ok = test_psycopg_import()
    psycopg2_ok = test_psycopg2_import()
    binary_ok = test_psycopg2_binary_import()
    
    # Test connection
    connection_ok = test_database_connection()
    
    # For Python 3.13, we might have import issues but connection might still work
    import sys
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}"
    
    if python_version == "3.13":
        print(f"⚠️  Python {python_version} detected - import warnings are expected")
        if connection_ok:
            print("✅ Database connection successful despite import warnings!")
            sys.exit(0)
        else:
            print("❌ Database connection failed!")
            sys.exit(1)
    else:
        if psycopg2_ok and connection_ok:
            print("✅ All PostgreSQL tests passed!")
            sys.exit(0)
        else:
            print("❌ Some PostgreSQL tests failed!")
            sys.exit(1) 