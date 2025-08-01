from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    UserSerializer,
    PasswordChangeSerializer
)
from .models import User, UserProfile


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    
    Allows new users to create an account with email and password.
    Returns JWT tokens upon successful registration.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="Register a new user account",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password', 'password_confirm'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description="User's email address"
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="User's password (minimum 8 characters)"
                ),
                'password_confirm': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Password confirmation"
                ),
                'first_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="User's first name (optional)"
                ),
                'last_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="User's last name (optional)"
                )
            }
        ),
        responses={
            201: openapi.Response(
                description="User registered successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'user': openapi.Schema(type=openapi.TYPE_OBJECT),
                        'tokens': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'access': openapi.Schema(type=openapi.TYPE_STRING),
                                'refresh': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        )
                    }
                )
            ),
            400: 'Bad Request - Invalid data or passwords do not match',
            409: 'Conflict - Email already exists'
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint
    
    Authenticates users with email and password.
    Returns JWT tokens upon successful login.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="Login with email and password",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description="User's email address"
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="User's password"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Login successful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'user': openapi.Schema(type=openapi.TYPE_OBJECT),
                        'tokens': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'access': openapi.Schema(type=openapi.TYPE_STRING),
                                'refresh': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        )
                    }
                )
            ),
            400: 'Bad Request - Invalid credentials',
            401: 'Unauthorized - Invalid email or password'
        }
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile management
    
    **GET**: Retrieve user profile information
    **PUT/PATCH**: Update user profile information
    
    Requires authentication.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Get user profile information",
        responses={
                       200: openapi.Response(
               description="User profile",
               schema=openapi.Schema(type=openapi.TYPE_OBJECT)
           ),
            401: 'Unauthorized - Authentication required'
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update user profile information",
        request_body=openapi.Schema(type=openapi.TYPE_OBJECT),
        responses={
            200: openapi.Response(
                description="Profile updated successfully",
                schema=openapi.Schema(type=openapi.TYPE_OBJECT)
            ),
            400: 'Bad Request - Invalid data',
            401: 'Unauthorized - Authentication required'
        }
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
    
    def get_object(self):
        return self.request.user.profile


@swagger_auto_schema(
    method='get',
    operation_description="Get user statistics",
    responses={
        200: openapi.Response(
            description="User statistics",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'favorites_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'watchlist_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'ratings_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'member_since': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        401: 'Unauthorized - Authentication required'
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    user = request.user
    
    stats = {
        'favorites_count': user.favorites.count(),
        'watchlist_count': user.watchlist.count(),
        'ratings_count': user.ratings.count(),
        'member_since': user.date_joined.strftime('%B %Y'),
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    operation_description="Refresh JWT access token",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['refresh'],
        properties={
            'refresh': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Refresh token"
            )
        }
    ),
    responses={
        200: openapi.Response(
            description="Token refreshed successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: 'Bad Request - Invalid refresh token',
        401: 'Unauthorized - Invalid or expired refresh token'
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_token(request):
    """Refresh JWT token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    operation_description="Change user password",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['old_password', 'new_password', 'new_password_confirm'],
        properties={
            'old_password': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Current password"
            ),
            'new_password': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="New password (minimum 8 characters)"
            ),
            'new_password_confirm': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="New password confirmation"
            )
        }
    ),
    responses={
        200: openapi.Response(
            description="Password changed successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: 'Bad Request - Invalid data or passwords do not match',
        401: 'Unauthorized - Authentication required or incorrect old password'
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
