from django.core.management.base import BaseCommand
from movies.services import TMDBService
from django.conf import settings


class Command(BaseCommand):
    help = 'Sync movies from TMDB API to database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            default='trending',
            choices=['trending', 'top_rated', 'movies', 'tv'],
            help='Type of movies to sync'
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=5,
            help='Number of pages to sync'
        )
    
    def handle(self, *args, **options):
        if settings.TMDB_API_KEY == 'your-tmdb-api-key-here':
            self.stdout.write(
                self.style.ERROR('Please set your TMDB API key in settings')
            )
            return
        
        tmdb_service = TMDBService()
        movie_type = options['type']
        pages = options['pages']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting to sync {movie_type} movies...')
        )
        
        total_synced = 0
        
        for page in range(1, pages + 1):
            try:
                if movie_type == 'trending':
                    data = tmdb_service.get_trending_movies(page=page)
                elif movie_type == 'top_rated':
                    data = tmdb_service.get_top_rated_movies(page=page)
                elif movie_type == 'tv':
                    data = tmdb_service.get_tv_shows(page=page)
                else:
                    data = tmdb_service.get_movies(page=page)
                
                synced_count = 0
                for item in data.get('results', []):
                    if item.get('media_type') in ['movie', 'tv']:
                        movie = tmdb_service.sync_movie_to_db(item)
                        synced_count += 1
                
                total_synced += synced_count
                self.stdout.write(
                    f'Page {page}: Synced {synced_count} movies'
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error syncing page {page}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully synced {total_synced} movies total')
        ) 