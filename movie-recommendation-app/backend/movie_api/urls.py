"""movie_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Movie Recommendation API",
        default_version='v1',
        description="""
        # Movie Recommendation API
        
        A comprehensive movie recommendation API with TMDB integration.
        
        ## Features
        
        - **Movie Discovery**: Browse movies, TV shows, trending content, and top-rated films
        - **Search**: Search through movies and TV shows with real-time results
        - **User Management**: Registration, login, profile management, and password changes
        - **Personalization**: Favorites, watchlist, and movie ratings
        - **Authentication**: JWT-based authentication with refresh tokens
        
        ## Authentication
        
        Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
        ```
        Authorization: Bearer <your_access_token>
        ```
        
        ## Rate Limiting
        
        API requests are rate-limited to ensure fair usage.
        
        ## TMDB Integration
        
        This API integrates with The Movie Database (TMDB) to provide comprehensive movie and TV show data.
        """,
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(
            email="contact@movieapi.com",
            name="API Support",
            url="https://github.com/your-repo"
        ),
        license=openapi.License(
            name="MIT License",
            url="https://opensource.org/licenses/MIT"
        ),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    patterns=[
        path('api/v1/', include('api.urls')),
        path('api/v1/users/', include('users.urls')),
        path('api/v1/movies/', include('movies.urls')),
    ],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/v1/', include('api.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/movies/', include('movies.urls')),
    
    # JWT Token refresh
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Swagger Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
