# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for your movie recommendation app and test it locally.

## Prerequisites

1. **Install PostgreSQL** on your system:
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **macOS**: `brew install postgresql`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
   - **CentOS/RHEL**: `sudo yum install postgresql postgresql-server`

2. **Install Python dependencies**:
   ```bash
   cd movie-recommendation-app/backend
   pip install -r requirements.txt
   ```

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. PostgreSQL will be installed as a Windows service

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database and User

### Windows
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to the server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `movie_db`

### Command Line (All platforms)
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create the database
CREATE DATABASE movie_db;

# Create a user (optional, you can use postgres user)
CREATE USER movie_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE movie_db TO movie_user;

# Exit PostgreSQL
\q
```

## Step 3: Configure Environment Variables

Your `env.local` file should already be configured correctly:

```env
# Database Settings
DB_ENGINE=django.db.backends.postgresql
DB_NAME=movie_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

## Step 4: Test PostgreSQL Connection

### Test 1: Basic Connection Test
```bash
cd movie-recommendation-app/backend
python manage.py check --database default
```

### Test 2: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Test 3: Create Superuser
```bash
python manage.py createsuperuser
```

### Test 4: Run the Development Server
```bash
python manage.py runserver
```

## Step 5: Verify Database Setup

### Check Database Tables
```bash
python manage.py dbshell
```

In the PostgreSQL shell:
```sql
-- List all tables
\dt

-- Check users table
SELECT * FROM users_user LIMIT 5;

-- Check movies table
SELECT * FROM movies_movie LIMIT 5;

-- Exit
\q
```

### Django Shell Test
```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from movies.models import Movie

User = get_user_model()

# Check if we can query the database
print(f"Total users: {User.objects.count()}")
print(f"Total movies: {Movie.objects.count()}")
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Make sure PostgreSQL service is running
   - Check if port 5432 is open
   - Verify host and port in env.local

2. **Authentication Failed**
   - Check username and password in env.local
   - Verify the user exists in PostgreSQL
   - Try connecting with psql to test credentials

3. **Database Does Not Exist**
   - Create the database manually
   - Check database name in env.local

4. **Permission Denied**
   - Grant proper permissions to the user
   - Check if the user has access to the database

### Useful Commands

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL service
sudo systemctl start postgresql

# Connect to PostgreSQL
psql -U postgres -h localhost -p 5432

# List databases
\l

# Connect to specific database
\c movie_db

# List tables
\dt

# Exit PostgreSQL
\q
```

## Performance Tips

1. **Indexing**: PostgreSQL automatically creates indexes for primary keys and foreign keys
2. **Connection Pooling**: Consider using connection pooling for production
3. **Backup**: Set up regular backups of your database
4. **Monitoring**: Use PostgreSQL's built-in monitoring tools

## Next Steps

1. Test your API endpoints with the new PostgreSQL database
2. Set up database backups
3. Configure connection pooling for production
4. Set up database monitoring

## Production Considerations

1. **Security**: Change default passwords
2. **Performance**: Configure PostgreSQL for your workload
3. **Backup**: Implement automated backups
4. **Monitoring**: Set up database monitoring
5. **SSL**: Enable SSL connections in production 