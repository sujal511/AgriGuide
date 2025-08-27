# myapp/views.py
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer, UserProfileSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
import logging
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import CustomUser, TempUser, LoanScheme, GovernmentScheme, FarmResource  # Add FarmResource
from django.utils import timezone
from .utils import generate_otp, send_otp_email, generate_password_reset_token, send_password_reset_email
from datetime import timedelta
import logging
from django.core.mail import send_mail
from django.conf import settings
import requests
import json
import os
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Min, Max
from django.http import JsonResponse
from main_app.models import Crop, Technology, LoanOption, FarmerProfile
from django.views.decorators.csrf import csrf_exempt
from django.db import models
from django.contrib.auth import get_user_model
import uuid

logger = logging.getLogger(__name__)
#registration
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        logger.info("Registration attempt with data: %s", {
            k: v for k, v in request.data.items() if k != 'password'
        })
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Instead of creating a CustomUser, create a TempUser
            username = serializer.validated_data['username']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            phone_number = serializer.validated_data.get('phone_number', '')
            
            # Check if email or username is already registered and verified
            if CustomUser.objects.filter(username=username, is_email_verified=True).exists():
                return Response({
                    'message': 'Registration validation failed',
                    'errors': {'username': ['This username is already taken.']}
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if CustomUser.objects.filter(email=email, is_email_verified=True).exists():
                return Response({
                    'message': 'Registration validation failed',
                    'errors': {'email': ['This email is already registered.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate OTP
            otp = generate_otp()
            
            # Check if a TempUser with this email already exists and update it
            temp_user, created = TempUser.objects.update_or_create(
                email=email,
                defaults={
                    'username': username,
                    'password': make_password(password),
                    'phone_number': phone_number,
                    'otp': otp,
                    'otp_created_at': timezone.now()
                }
            )
            
            # Send OTP via email
            if send_otp_email(email, otp):
                return Response({
                    'message': 'Please verify your email with OTP.',
                    'user_id': temp_user.id,
                    'is_temp': True
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error("Failed to send OTP email to %s", email)
                return Response({
                    'message': 'Failed to send OTP email. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error("Registration validation failed: %s", serializer.errors)
            return Response({
                'message': 'Registration validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error("Registration failed with error: %s", str(e))
        return Response({
            'message': 'Registration failed',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#otp verification
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    try:
        user_id = request.data.get('user_id')
        otp = request.data.get('otp')
        is_temp = request.data.get('is_temp', True)  # Default to True for backward compatibility
        
        if not user_id or not otp:
            return Response({
                'message': 'User ID and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            if is_temp:
                # Verify TempUser
                temp_user = TempUser.objects.get(id=user_id)
                
                # Check if OTP is expired (10 minutes validity)
                if timezone.now() > temp_user.otp_created_at + timedelta(minutes=10):
                    return Response({
                        'message': 'OTP has expired'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
                if temp_user.otp == otp:
                    # Create actual user if OTP matches
                    user = CustomUser.objects.create(
                        username=temp_user.username,
                        email=temp_user.email,
                        password=temp_user.password,  # Use the already hashed password
                        phone_number=temp_user.phone_number
                    )
                    user.is_email_verified = True
                    user.save()
                    
                    # Delete the temp user
                    temp_user.delete()
                    
                    # Create token for the new user
                    token, _ = Token.objects.get_or_create(user=user)
                    
                    return Response({
                        'message': 'Email verified successfully',
                        'token': token.key,
                        'user_id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'phone_number': user.phone_number,
                        'is_verified': user.is_email_verified,
                        'date_joined': user.date_joined.isoformat()
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'Invalid OTP'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Handle legacy verification for users created directly
                user = CustomUser.objects.get(id=user_id)
                
                # Check if OTP is expired (10 minutes validity)
                if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=10):
                    return Response({
                        'message': 'OTP has expired'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
                if user.otp == otp:
                    user.is_email_verified = True
                    user.otp = None
                    user.otp_created_at = None
                    user.save()
                    
                    # Create token after verification
                    token, _ = Token.objects.get_or_create(user=user)
                    
                    return Response({
                        'message': 'Email verified successfully',
                        'token': token.key,
                        'user_id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'phone_number': user.phone_number,
                        'is_verified': user.is_email_verified,
                        'date_joined': user.date_joined.isoformat()
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'Invalid OTP'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
        except (CustomUser.DoesNotExist, TempUser.DoesNotExist):
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        return Response({
            'message': 'Verification failed',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#login
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    API endpoint for user login.
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Check if username is an email
        if '@' in username:
            try:
                user = CustomUser.objects.get(email=username)
                username = user.username
            except CustomUser.DoesNotExist:
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user is not None:
            # Generate token
            token, created = Token.objects.get_or_create(user=user)
            
            # Return user data and token
            return Response({
                'token': token.key,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_verified': user.is_email_verified,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined,
                'profile_image': user.profile_image  # Include profile image in response
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({'error': 'An error occurred during login'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Weather API
@api_view(['GET'])
@permission_classes([AllowAny])
def get_weather(request):
    try:
        city = request.query_params.get('city', 'London')  # Default to London if no city provided
        api_key = 'bc9254afa9db3515eab55abb72088120'  # OpenWeather API key
        
        # Make request to OpenWeather API
        url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric'
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            weather_data = {
                'city': data['name'],
                'temperature': data['main']['temp'],
                'description': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed'],
                'timestamp': timezone.now().isoformat()
            }
            return Response(weather_data, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Failed to fetch weather data',
                'error': response.json().get('message', 'Unknown error')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        return Response({
            'message': 'Failed to retrieve weather data',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 5-day Weather Forecast API
@api_view(['GET'])
@permission_classes([AllowAny])
def get_weather_forecast(request):
    try:
        city = request.query_params.get('city', 'Mumbai')  # Default to Mumbai if no city provided
        api_key = '08fdd254cb046013cd79b0c67a7a485d'  # OpenWeather API key
        
        logger.info(f"Weather forecast request for city: {city}")
        
        # Make request to OpenWeather 5-day forecast API
        url = f'https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric'
        logger.info(f"Making request to OpenWeather API: {url}")
        
        try:
            response = requests.get(url, timeout=10)  # Add timeout to prevent hanging
            logger.info(f"OpenWeather API response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Process the forecast data - we'll take one forecast per day (noon time) for 5-day forecast
                daily_forecasts = []
                days_processed = set()
                
                for item in data['list']:
                    # Parse date from timestamp
                    date = item['dt_txt'].split(' ')[0]
                    time = item['dt_txt'].split(' ')[1]
                    
                    # Only take one reading per day (around noon) for daily forecast
                    if date not in days_processed and '12:00:00' in time:
                        days_processed.add(date)
                        
                        forecast = {
                            'date': date,
                            'temperature': item['main']['temp'],
                            'feels_like': item['main']['feels_like'],
                            'description': item['weather'][0]['description'],
                            'icon': item['weather'][0]['icon'],
                            'humidity': item['main']['humidity'],
                            'wind_speed': item['wind']['speed'],
                            'timestamp': item['dt_txt']
                        }
                        daily_forecasts.append(forecast)
                        
                        # Only get 5 days of forecast
                        if len(daily_forecasts) >= 5:
                            break
                
                # If we couldn't find exactly noon forecasts, just take the first forecast for each day
                if len(daily_forecasts) < 5:
                    days_processed = set()
                    daily_forecasts = []
                    
                    for item in data['list']:
                        date = item['dt_txt'].split(' ')[0]
                        if date not in days_processed:
                            days_processed.add(date)
                            
                            forecast = {
                                'date': date,
                                'temperature': item['main']['temp'],
                                'feels_like': item['main']['feels_like'],
                                'description': item['weather'][0]['description'],
                                'icon': item['weather'][0]['icon'],
                                'humidity': item['main']['humidity'],
                                'wind_speed': item['wind']['speed'],
                                'timestamp': item['dt_txt']
                            }
                            daily_forecasts.append(forecast)
                            
                            if len(daily_forecasts) >= 5:
                                break
                
                # For hourly forecast, take the first 8 entries which will have different times
                hourly_forecasts = []
                for i, item in enumerate(data['list']):
                    if i >= 8:  # Only take first 8 entries for hourly forecast
                        break
                        
                    forecast = {
                        'date': item['dt_txt'].split(' ')[0],
                        'temperature': item['main']['temp'],
                        'feels_like': item['main']['feels_like'],
                        'description': item['weather'][0]['description'],
                        'icon': item['weather'][0]['icon'],
                        'humidity': item['main']['humidity'],
                        'wind_speed': item['wind']['speed'],
                        'timestamp': item['dt_txt']
                    }
                    hourly_forecasts.append(forecast)
                
                response_data = {
                    'city': data['city']['name'],
                    'country': data['city']['country'],
                    'forecasts': daily_forecasts,
                    'hourly': hourly_forecasts
                }
                
                logger.info(f"Successfully processed forecast data for {city}, found {len(daily_forecasts)} day(s) and {len(hourly_forecasts)} hourly forecasts")
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                error_message = response.json().get('message', 'Unknown error')
                logger.error(f"OpenWeather API error: {response.status_code} - {error_message}")
                return Response({
                    'message': 'Failed to fetch forecast data',
                    'error': error_message
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except requests.RequestException as req_err:
            logger.error(f"Request error to OpenWeather API: {str(req_err)}")
            return Response({
                'message': 'Failed to connect to weather service',
                'error': str(req_err)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    except Exception as e:
        logger.error(f"Weather forecast API error: {str(e)}")
        return Response({
            'message': 'Failed to retrieve forecast data',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def home(request):
    return render(request, 'myapp/home.html')

# JSON Data Deletion API
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_json_data(request):
    try:
        # Get parameters from request
        file_name = request.data.get('file_name')  # e.g., 'sbi.json'
        key_to_match = request.data.get('key')     # e.g., 'schemeId'
        value_to_match = request.data.get('value') # e.g., 'SBI-AGRI-001'
        
        if not all([file_name, key_to_match, value_to_match]):
            return Response({
                'message': 'Missing required parameters: file_name, key, value'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Construct the file path - adjust the base path as needed
        base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
        file_path = os.path.join(base_path, file_name)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return Response({
                'message': f'File {file_name} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Read the JSON file
        with open(file_path, 'r') as file:
            data = json.load(file)
        
        # Keep track of original length
        original_length = len(data)
        
        # Filter out the items to delete
        if isinstance(data, list):
            filtered_data = [item for item in data if item.get(key_to_match) != value_to_match]
            deleted_count = original_length - len(filtered_data)
            
            # Write back to file if items were deleted
            if deleted_count > 0:
                with open(file_path, 'w') as file:
                    json.dump(filtered_data, file, indent=2)
                
                return Response({
                    'message': f'Successfully deleted {deleted_count} items',
                    'deleted_count': deleted_count
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': f'No items found with {key_to_match}={value_to_match}'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            # Handle case where JSON is not a list
            return Response({
                'message': 'JSON file is not in expected list format'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except json.JSONDecodeError:
        return Response({
            'message': 'Invalid JSON file'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"JSON data deletion error: {str(e)}")
        return Response({
            'message': 'Failed to delete JSON data',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User Profile API
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    GET: Retrieve the authenticated user's profile information.
    PUT: Update the authenticated user's profile information.
    """
    try:
        user = request.user
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            serializer = UserProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        logger.error(f"Profile operation error: {str(e)}")
        return Response({
            'message': 'Failed to process profile operation',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add these views at the end of the file
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Handle password reset request"""
    try:
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Find the user
            user = CustomUser.objects.get(email=email)
            
            # Generate token for password reset
            token = generate_password_reset_token()
            
            # Save token and timestamp to user
            user.password_reset_token = token
            user.password_reset_token_created_at = timezone.now()
            user.save()
            
            # Send password reset email
            if send_password_reset_email(email, token):
                return Response({
                    'message': 'Password reset link has been sent to your email'
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Failed to send password reset email to {email}")
                return Response({
                    'error': 'Failed to send password reset email. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except CustomUser.DoesNotExist:
        # Return a success message even if user doesn't exist for security
        return Response({
            'message': 'Password reset link has been sent to your email if the account exists'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        return Response({
            'error': 'Failed to process password reset request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset and set new password"""
    try:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            
            # Find user with this token
            try:
                user = CustomUser.objects.get(password_reset_token=token)
                
                # Check if token is expired (24 hours validity)
                if not user.password_reset_token_created_at or timezone.now() > user.password_reset_token_created_at + timedelta(hours=24):
                    return Response({
                        'error': 'Password reset link has expired. Please request a new one.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(password)
                
                # Clear token and timestamp
                user.password_reset_token = None
                user.password_reset_token_created_at = None
                user.save()
                
                return Response({
                    'message': 'Password has been reset successfully'
                }, status=status.HTTP_200_OK)
                
            except CustomUser.DoesNotExist:
                return Response({
                    'error': 'Invalid password reset token'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Password reset confirm error: {str(e)}")
        return Response({
            'error': 'Failed to reset password'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Bank App API endpoints

@api_view(['GET'])
@permission_classes([AllowAny])
def api_loan_schemes(request):
    """API endpoint to fetch loan schemes for the React frontend"""
    schemes = LoanScheme.objects.all()
    
    # Filter by bank
    bank = request.GET.get('bank')
    if bank:
        schemes = schemes.filter(bank_name=bank)
    
    # Filter by loan type
    loan_type = request.GET.get('loan_type')
    if loan_type:
        schemes = schemes.filter(loan_type=loan_type)
    
    # Filter by interest rate range
    min_rate = request.GET.get('min_rate')
    max_rate = request.GET.get('max_rate')
    
    try:
        if min_rate and min_rate.strip():
            min_rate = float(min_rate)
            schemes = schemes.filter(interest_rate_min__gte=min_rate)
        
        if max_rate and max_rate.strip():
            max_rate = float(max_rate)
            schemes = schemes.filter(interest_rate_max__lte=max_rate)
    except ValueError:
        pass
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        schemes = schemes.filter(
            Q(scheme_name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(loan_purpose__icontains=search_query)
        )
    
    # Format data for frontend
    schemes_data = []
    for scheme in schemes:
        scheme_data = {
            'id': scheme.scheme_id,
            'name': scheme.scheme_name,
            'bank': scheme.bank_name,
            'description': scheme.description,
            'loanType': scheme.loan_type,
            'interestRateMin': scheme.interest_rate_min,
            'interestRateMax': scheme.interest_rate_max,
            'repaymentTermMonths': scheme.repayment_term_months
        }
        schemes_data.append(scheme_data)
    
    # Get filter options
    filter_options = {
        'banks': list(LoanScheme.objects.values_list('bank_name', flat=True).distinct()),
        'loanTypes': list(LoanScheme.objects.values_list('loan_type', flat=True).distinct()),
        'interestRates': {
            'min': LoanScheme.objects.aggregate(min=Min('interest_rate_min'))['min'],
            'max': LoanScheme.objects.aggregate(max=Max('interest_rate_max'))['max']
        }
    }
    
    response_data = {
        'schemes': schemes_data,
        'filterOptions': filter_options
    }
    
    return JsonResponse(response_data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_scheme_detail(request, scheme_id):
    """API endpoint to fetch details of a specific loan scheme"""
    try:
        print(f"Fetching scheme with ID: {scheme_id}")
        scheme = LoanScheme.objects.get(scheme_id=scheme_id)
        print(f"Found scheme: {scheme.scheme_name}")
        
        scheme_data = {
            'id': scheme.scheme_id,
            'name': scheme.scheme_name,
            'bank': scheme.bank_name,
            'description': scheme.description,
            'loanType': scheme.loan_type,
            'interestRateMin': scheme.interest_rate_min,
            'interestRateMax': scheme.interest_rate_max,
            'interestRateNote': scheme.interest_rate_note,
            'repaymentTermMonths': scheme.repayment_term_months,
            'repaymentCategory': scheme.repayment_category,
            'eligibilityCriteria': scheme.eligibility,
            'benefits': scheme.key_benefits,
            'maxLoanAmount': float(scheme.loan_limit_max) if scheme.loan_limit_max else None,
            'minLoanAmount': float(scheme.loan_limit_min) if scheme.loan_limit_min else None,
            'loanLimitNote': scheme.loan_limit_note,
            'collateralRequired': scheme.collateral_required,
            'loanPurpose': scheme.loan_purpose,
            'processingFeeNote': scheme.processing_fee_note,
            'subsidyAvailable': scheme.subsidy_available,
            'subsidyDetails': scheme.subsidy_details,
            'insuranceLinkage': scheme.insurance_linkage,
            'renewalPeriod': scheme.renewal_period,
            'longDescription': scheme.description,
            'requiredDocuments': ['Proof of Identity (Aadhaar/PAN/Voter ID)', 'Proof of Address', 'Land Records', 'Income Statements (if applicable)', 'Bank Statements (last 6 months)'],
            'applicationProcess': [
                'Visit your nearest branch or apply online through the bank website',
                'Fill out the loan application form',
                'Submit all required documents',
                'Await field verification and loan approval',
                'Sign loan agreement and receive disbursement'
            ],
            'contactInfo': {
                'phone': scheme.contact_phone or '1800-XXX-XXXX',
                'email': scheme.contact_email or ('support@' + scheme.bank_name.lower().replace(' ', '') + '.com'),
                'website': scheme.contact_website or ('https://www.' + scheme.bank_name.lower().replace(' ', '') + '.com'),
                'additionalInfo': scheme.contact_info
            }
        }
        
        print("Returning data to frontend")
        return JsonResponse(scheme_data)
    except LoanScheme.DoesNotExist:
        print(f"Error: Scheme with ID {scheme_id} not found")
        return JsonResponse({'error': 'Scheme not found'}, status=404)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

# Government Schemes API views
@api_view(['GET'])
@permission_classes([AllowAny])
def api_gov_schemes(request):
    """API endpoint to fetch government schemes for the React frontend"""
    try:
        # Get filters from query params
        scheme_type = request.GET.get('type')
        state = request.GET.get('state')
        status = request.GET.get('status')
        search_query = request.GET.get('search')
        
        # Get data from database
        schemes = GovernmentScheme.objects.all()
        
        # Apply filters if any
        if scheme_type:
            schemes = schemes.filter(type__iexact=scheme_type)
        
        if state:
            schemes = schemes.filter(state__iexact=state)
            
        if status:
            schemes = schemes.filter(status__iexact=status)
            
        if search_query:
            schemes = schemes.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(target_group__icontains=search_query) |
                Q(type__icontains=search_query)
            )
        
        # Convert queryset to list of dictionaries
        schemes_data = []
        for scheme in schemes:
            scheme_data = {
                'scheme_id': scheme.scheme_id,
                'name': scheme.name,
                'type': scheme.type,
                'description': scheme.description,
                'state': scheme.state,
                'target_group': scheme.target_group,
                'status': scheme.status
            }
            schemes_data.append(scheme_data)
        
        # Prepare filter options from database
        filter_options = {
            'types': list(GovernmentScheme.objects.values_list('type', flat=True).distinct()),
            'states': list(GovernmentScheme.objects.values_list('state', flat=True).distinct()),
            'statuses': list(GovernmentScheme.objects.values_list('status', flat=True).distinct())
        }
        
        response_data = {
            'schemes': schemes_data,
            'filterOptions': filter_options
        }
        
        return JsonResponse(response_data)
            
    except Exception as e:
        logger.error(f"Error in api_gov_schemes: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_gov_scheme_detail(request, scheme_id):
    """API endpoint to fetch details of a specific government scheme"""
    try:
        # Get scheme from database
        try:
            scheme = GovernmentScheme.objects.get(scheme_id=scheme_id)
            
            # Convert DB object to dict
            scheme_data = {
                'scheme_id': scheme.scheme_id,
                'name': scheme.name,
                'type': scheme.type,
                'description': scheme.description,
                'state': scheme.state,
                'target_group': scheme.target_group,
                'status': scheme.status,
                'eligibility': scheme.eligibility,
                'benefits': scheme.benefits,
                'how_to_apply': scheme.how_to_apply,
                'required_documents': scheme.required_documents,
                'contact': scheme.contact,
                'faq': scheme.faq,
                'language_support': scheme.language_support
            }
            
            return JsonResponse(scheme_data)
        except GovernmentScheme.DoesNotExist:
            return JsonResponse({'error': 'Scheme not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in api_gov_scheme_detail: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def farm_resources(request):
    """
    GET: Retrieve the farm resources for the authenticated user
    POST: Create or update farm resources for the authenticated user
    """
    if request.method == 'GET':
        try:
            # Default data structure with all required fields
            default_data = {
                        'waterStorage': {
                            'current': 15000,
                            'capacity': 20000,
                            'unit': 'L'
                        },
                        'seedInventory': [
                            {'name': 'Rice', 'quantity': 61, 'unit': 'kg'},
                            {'name': 'Wheat', 'quantity': 54, 'unit': 'kg'},
                            {'name': 'Corn', 'quantity': 70, 'unit': 'kg'}
                        ],
                        'fertilizerStock': [
                            {'name': 'NPK', 'quantity': 200, 'unit': 'kg'},
                            {'name': 'Urea', 'quantity': 150, 'unit': 'kg'}
                        ],
                        'equipmentStatus': [
                            {'name': 'Tractor', 'status': 'Available'},
                            {'name': 'Irrigation System', 'status': 'Active'}
                ],
                'machineryInventory': [
                    {'name': 'Tractor - John Deere', 'condition': 'Good', 'lastMaintenance': '2023-10-15', 'nextMaintenance': '2024-01-15'},
                    {'name': 'Harvester', 'condition': 'Needs Repair', 'lastMaintenance': '2023-08-20', 'nextMaintenance': '2023-11-20'},
                    {'name': 'Irrigation Pump', 'condition': 'Excellent', 'lastMaintenance': '2023-11-01', 'nextMaintenance': '2024-02-01'}
                ],
                'usageLogs': [
                    {'equipment': 'Tractor - John Deere', 'user': 'Rahul', 'date': '2023-11-10', 'purpose': 'Field preparation', 'fuelUsed': 25},
                    {'equipment': 'Harvester', 'user': 'Amit', 'date': '2023-11-05', 'purpose': 'Rice harvesting', 'fuelUsed': 40}
                ],
                'laborRoster': [
                    {'name': 'Rahul Kumar', 'role': 'Field Manager', 'contactNumber': '9876543210', 'skills': ['Tractor Operation', 'Irrigation']},
                    {'name': 'Amit Singh', 'role': 'Harvester Operator', 'contactNumber': '8765432109', 'skills': ['Harvester Operation', 'Basic Repairs']},
                    {'name': 'Priya Verma', 'role': 'Field Worker', 'contactNumber': '7654321098', 'skills': ['Sowing', 'Crop Monitoring']}
                ],
                'taskSchedule': [
                    {'task': 'Field preparation - North', 'assignedTo': 'Rahul Kumar', 'date': '2023-11-15', 'status': 'Pending'},
                    {'task': 'Irrigation maintenance', 'assignedTo': 'Amit Singh', 'date': '2023-11-14', 'status': 'Completed'},
                    {'task': 'Seed sowing - East field', 'assignedTo': 'Priya Verma', 'date': '2023-11-16', 'status': 'Pending'}
                ],
                'attendanceLog': [
                    {
                        'date': '2023-11-10', 
                        'records': [
                            {'name': 'Rahul Kumar', 'hoursWorked': 8, 'overtimeHours': 1},
                            {'name': 'Amit Singh', 'hoursWorked': 8, 'overtimeHours': 0},
                            {'name': 'Priya Verma', 'hoursWorked': 7, 'overtimeHours': 0}
                        ]
                    }
                ]
            }
            
            # Try to get existing resources for the user
            farm_resource, created = FarmResource.objects.get_or_create(
                user=request.user,
                defaults={'data': default_data}
            )
            
            # Check if all required fields exist in the data
            # If an existing record lacks any of the required fields, update it
            if not created:
                data = farm_resource.data
                needs_update = False
                
                # Check for each required field and add it if missing
                for key, value in default_data.items():
                    if key not in data:
                        data[key] = value
                        needs_update = True
                
                # Save the updated data if changes were made
                if needs_update:
                    farm_resource.data = data
                    farm_resource.save()
            
            # Return the complete data structure
            return Response(farm_resource.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching farm resources: {str(e)}")
            return Response(
                {'message': 'Error fetching farm resources', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'POST':
        try:
            # Get the data from the request
            data = request.data
            
            # Save or update the resource
            farm_resource, created = FarmResource.objects.update_or_create(
                user=request.user,
                defaults={'data': data}
            )
            
            return Response(
                {'message': 'Farm resources updated successfully', 'data': farm_resource.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error updating farm resources: {str(e)}")
            return Response(
                {'message': 'Error updating farm resources', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Admin panel API views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_check_api(request):
    """Check if the current user is an admin"""
    if request.user.is_staff:
        return Response({'is_admin': True})
    return Response({'is_admin': False})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_crops_api(request):
    """API endpoint for managing crops in the admin panel"""
    # Check if user is admin
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
    if request.method == 'GET':
        # List all crops with pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        search = request.query_params.get('search', '')
        
        # Apply search filter if provided
        if search:
            crops = Crop.objects.filter(name__icontains=search)
        else:
            crops = Crop.objects.all()
            
        # Calculate pagination
        start = (page - 1) * page_size
        end = start + page_size
        
        # Get paginated crops
        paginated_crops = crops[start:end]
        
        # Serialize crops data
        crops_data = []
        for crop in paginated_crops:
            crops_data.append({
                'id': crop.id,
                'name': crop.name,
                'scientific_name': crop.scientific_name if hasattr(crop, 'scientific_name') else '',
                'growing_season': crop.growing_season,
                'min_temp_c': crop.min_temp_c,
                'max_temp_c': crop.max_temp_c,
                'water_requirement_mm': crop.water_requirement_mm,
                'suitable_soil_types': crop.suitable_soil_types,
                'ph_range': crop.ph_range,
                'varieties': crop.varieties,
                'cultivation_practices': crop.cultivation_practices,
                'n_requirement_kg_per_ha': crop.n_requirement_kg_per_ha,
                'p_requirement_kg_per_ha': crop.p_requirement_kg_per_ha,
                'k_requirement_kg_per_ha': crop.k_requirement_kg_per_ha
            })
            
        return Response({
            'crops': crops_data,
            'total_count': crops.count(),
            'page': page,
            'page_size': page_size,
            'total_pages': (crops.count() + page_size - 1) // page_size
        })
        
    elif request.method == 'POST':
        # Create new crop
        try:
            data = request.data
            
            crop = Crop.objects.create(
                name=data['name'],
                growing_season=data.get('growing_season', ''),
                min_temp_c=data.get('min_temp_c'),
                max_temp_c=data.get('max_temp_c'),
                water_requirement_mm=data.get('water_requirement_mm'),
                suitable_soil_types=data.get('suitable_soil_types', ''),
                ph_range=data.get('ph_range', ''),
                varieties=data.get('varieties', ''),
                cultivation_practices=data.get('cultivation_practices', ''),
                n_requirement_kg_per_ha=data.get('n_requirement_kg_per_ha'),
                p_requirement_kg_per_ha=data.get('p_requirement_kg_per_ha'),
                k_requirement_kg_per_ha=data.get('k_requirement_kg_per_ha')
            )
            
            return Response({
                'success': True,
                'id': crop.id,
                'message': f'Crop {crop.name} created successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_crop_detail_api(request, crop_id):
    """API endpoint for managing a specific crop in the admin panel"""
    # Check if user is admin
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if crop exists
    try:
        crop = Crop.objects.get(id=crop_id)
    except Crop.DoesNotExist:
        return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return crop details
        crop_data = {
            'id': crop.id,
            'name': crop.name,
            'scientific_name': crop.scientific_name if hasattr(crop, 'scientific_name') else '',
            'growing_season': crop.growing_season,
            'min_temp_c': crop.min_temp_c,
            'max_temp_c': crop.max_temp_c,
            'water_requirement_mm': crop.water_requirement_mm,
            'suitable_soil_types': crop.suitable_soil_types,
            'ph_range': crop.ph_range,
            'varieties': crop.varieties,
            'cultivation_practices': crop.cultivation_practices,
            'n_requirement_kg_per_ha': crop.n_requirement_kg_per_ha,
            'p_requirement_kg_per_ha': crop.p_requirement_kg_per_ha,
            'k_requirement_kg_per_ha': crop.k_requirement_kg_per_ha
        }
        
        return Response(crop_data)
    
    elif request.method == 'PUT':
        # Update crop
        try:
            data = request.data
            
            # Update crop fields
            crop.name = data.get('name', crop.name)
            if hasattr(crop, 'scientific_name'):
                crop.scientific_name = data.get('scientific_name', crop.scientific_name)
            crop.growing_season = data.get('growing_season', crop.growing_season)
            crop.min_temp_c = data.get('min_temp_c', crop.min_temp_c)
            crop.max_temp_c = data.get('max_temp_c', crop.max_temp_c)
            crop.water_requirement_mm = data.get('water_requirement_mm', crop.water_requirement_mm)
            crop.suitable_soil_types = data.get('suitable_soil_types', crop.suitable_soil_types)
            crop.ph_range = data.get('ph_range', crop.ph_range)
            crop.varieties = data.get('varieties', crop.varieties)
            crop.cultivation_practices = data.get('cultivation_practices', crop.cultivation_practices)
            crop.n_requirement_kg_per_ha = data.get('n_requirement_kg_per_ha', crop.n_requirement_kg_per_ha)
            crop.p_requirement_kg_per_ha = data.get('p_requirement_kg_per_ha', crop.p_requirement_kg_per_ha)
            crop.k_requirement_kg_per_ha = data.get('k_requirement_kg_per_ha', crop.k_requirement_kg_per_ha)
            
            # Save changes
            crop.save()
            
            return Response({
                'success': True,
                'message': f'Crop {crop.name} updated successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Delete crop
        try:
            crop_name = crop.name
            crop.delete()
            
            return Response({
                'success': True,
                'message': f'Crop {crop_name} deleted successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_users_api(request):
    """API endpoint for managing users in the admin panel"""
    # Check if user is admin
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
    if request.method == 'GET':
        # List all users with pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        search = request.query_params.get('search', '')
        
        User = get_user_model()
        
        # Apply search filter if provided
        if search:
            users = User.objects.filter(
                models.Q(username__icontains=search) | 
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        else:
            users = User.objects.all()
            
        # Calculate pagination
        start = (page - 1) * page_size
        end = start + page_size
        
        # Get paginated users
        paginated_users = users[start:end]
        
        # Serialize users data
        users_data = []
        for user in paginated_users:
            # Get farmer profile if exists
            try:
                farmer_profile = FarmerProfile.objects.get(user=user)
                profile_data = {
                    'first_name': farmer_profile.first_name,
                    'last_name': farmer_profile.last_name,
                    'age': farmer_profile.age,
                    'gender': farmer_profile.gender,
                    'district': farmer_profile.district,
                    'state': farmer_profile.state,
                    'pincode': farmer_profile.pincode,
                    'preferred_season': farmer_profile.preferred_season,
                }
            except FarmerProfile.DoesNotExist:
                profile_data = None
                
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
                'farmer_profile': profile_data
            })
            
        return Response({
            'users': users_data,
            'total_count': users.count(),
            'page': page,
            'page_size': page_size,
            'total_pages': (users.count() + page_size - 1) // page_size
        })
        
    elif request.method == 'POST':
        # Create new user
        try:
            data = request.data
            User = get_user_model()
            
            # Create user
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                is_staff=data.get('is_staff', False),
                is_active=data.get('is_active', True)
            )
            
            # Create farmer profile if profile data is provided
            if data.get('age') is not None or data.get('gender') or data.get('district'):
                FarmerProfile.objects.create(
                    user=user,
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                    age=data.get('age'),
                    gender=data.get('gender', ''),
                    district=data.get('district', ''),
                    state=data.get('state', 'Karnataka'),
                    pincode=data.get('pincode', ''),
                    preferred_season=data.get('preferred_season', '')
                )
            
            return Response({
                'success': True,
                'id': user.id,
                'message': f'User {user.username} created successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail_api(request, user_id):
    """API endpoint for managing a specific user in the admin panel"""
    # Check if user is admin
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    User = get_user_model()
    
    # Check if user exists
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Get farmer profile if exists
        try:
            farmer_profile = FarmerProfile.objects.get(user=user)
            profile_data = {
                'first_name': farmer_profile.first_name,
                'last_name': farmer_profile.last_name,
                'age': farmer_profile.age,
                'gender': farmer_profile.gender,
                'district': farmer_profile.district,
                'state': farmer_profile.state,
                'pincode': farmer_profile.pincode,
                'preferred_season': farmer_profile.preferred_season,
            }
        except FarmerProfile.DoesNotExist:
            profile_data = None
            
        # Return user details
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
            'farmer_profile': profile_data
        }
        
        return Response(user_data)
    
    elif request.method == 'PUT':
        # Update user
        try:
            data = request.data
            
            # Update user fields
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.is_staff = data.get('is_staff', user.is_staff)
            user.is_active = data.get('is_active', user.is_active)
            
            # Set password if provided
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            # Save user changes
            user.save()
            
            # Update or create farmer profile
            if data.get('age') is not None or data.get('gender') or data.get('district'):
                farmer_profile, created = FarmerProfile.objects.update_or_create(
                    user=user,
                    defaults={
                        'first_name': data.get('first_name', ''),
                        'last_name': data.get('last_name', ''),
                        'age': data.get('age'),
                        'gender': data.get('gender', ''),
                        'district': data.get('district', ''),
                        'state': data.get('state', 'Karnataka'),
                        'pincode': data.get('pincode', ''),
                        'preferred_season': data.get('preferred_season', '')
                    }
                )
            
            return Response({
                'success': True,
                'message': f'User {user.username} updated successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Delete user
        try:
            username = user.username
            user.delete()
            
            return Response({
                'success': True,
                'message': f'User {username} deleted successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Financial Resources Management API
# Mock database for development - will be replaced with proper DB models
FINANCIAL_DATA = {
    'expenses': [
        {
            'id': '1',
            'category': 'Input Costs',
            'item': 'Hybrid Rice Seeds',
            'amount': 12000,
            'date': '2023-11-05',
            'vendor': 'AgriSeeds Ltd'
        },
        {
            'id': '2',
            'category': 'Labor Payments',
            'item': 'Harvesting Workers',
            'amount': 8000,
            'date': '2023-11-15',
            'payee': 'Seasonal Workers'
        },
        {
            'id': '3',
            'category': 'Equipment Maintenance',
            'item': 'Tractor Service',
            'amount': 5000,
            'date': '2023-10-20',
            'vendor': 'Farm Mechanics Inc'
        },
        {
            'id': '4',
            'category': 'Utilities',
            'item': 'Electricity Bill',
            'amount': 3000,
            'date': '2023-11-01',
            'vendor': 'State Power Corp'
        }
    ],
    'loans': [
        {
            'id': '1',
            'schemeName': 'Kisan Credit Card',
            'bankName': 'State Bank of India',
            'applicationDate': '2023-08-10',
            'amount': 200000,
            'interestRate': 7.0,
            'status': 'Approved',
            'repaymentSchedule': 'Monthly',
            'nextPaymentDate': '2023-12-10'
        },
        {
            'id': '2',
            'schemeName': 'Agri Gold Loan',
            'bankName': 'Punjab National Bank',
            'applicationDate': '2023-10-05',
            'amount': 150000,
            'interestRate': 8.5,
            'status': 'Applied',
            'repaymentSchedule': 'Quarterly',
            'nextPaymentDate': None
        }
    ],
    'budgetPlans': [
        {
            'id': '1',
            'seasonName': 'Rabi 2023-24',
            'estimatedInputCosts': 45000,
            'estimatedLaborCosts': 30000,
            'estimatedMachineryCosts': 15000,
            'expectedRevenue': 120000,
            'notes': 'Focus on wheat and pulses'
        }
    ]
}

# Helper function to get user specific data
def get_user_financial_data(user_id):
    # In a real implementation, this would query the database for the specific user's data
    # For now, we'll just return our mock data
    return FINANCIAL_DATA

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_financial_resources(request):
    """Get all financial resources for a user"""
    try:
        # For demo, we don't need a specific user ID since we're returning mock data
        user_id = request.user.id if request.user and request.user.is_authenticated else 1
        data = get_user_financial_data(user_id)
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_expense(request):
    """Create a new expense"""
    try:
        user_id = request.user.id
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['category', 'item', 'amount', 'date']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
        
        # Generate a new ID
        new_id = str(uuid.uuid4())
        data['id'] = new_id
        
        # Add to the mock database
        FINANCIAL_DATA['expenses'].append(data)
        
        return JsonResponse({'id': new_id, 'message': 'Expense created successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_expense(request, expense_id):
    """Update an existing expense"""
    try:
        user_id = request.user.id
        data = json.loads(request.body)
        
        # Find the expense to update
        expense_index = None
        for i, expense in enumerate(FINANCIAL_DATA['expenses']):
            if expense['id'] == expense_id:
                expense_index = i
                break
        
        if expense_index is None:
            return JsonResponse({'error': 'Expense not found'}, status=404)
        
        # Update the expense
        FINANCIAL_DATA['expenses'][expense_index] = {**FINANCIAL_DATA['expenses'][expense_index], **data}
        
        return JsonResponse({'message': 'Expense updated successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_expense(request, expense_id):
    """Delete an expense"""
    try:
        user_id = request.user.id
        
        # Find the expense to delete
        expense_index = None
        for i, expense in enumerate(FINANCIAL_DATA['expenses']):
            if expense['id'] == expense_id:
                expense_index = i
                break
        
        if expense_index is None:
            return JsonResponse({'error': 'Expense not found'}, status=404)
        
        # Delete the expense
        del FINANCIAL_DATA['expenses'][expense_index]
        
        return JsonResponse({'message': 'Expense deleted successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_loan(request):
    """Create a new loan"""
    try:
        user_id = request.user.id
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['schemeName', 'bankName', 'applicationDate', 'amount', 'interestRate', 'status', 'repaymentSchedule']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
        
        # Generate a new ID
        new_id = str(uuid.uuid4())
        data['id'] = new_id
        
        # Add to the mock database
        FINANCIAL_DATA['loans'].append(data)
        
        return JsonResponse({'id': new_id, 'message': 'Loan created successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_loan(request, loan_id):
    """Update an existing loan"""
    try:
        user_id = request.user.id
        data = json.loads(request.body)
        
        # Find the loan to update
        loan_index = None
        for i, loan in enumerate(FINANCIAL_DATA['loans']):
            if loan['id'] == loan_id:
                loan_index = i
                break
        
        if loan_index is None:
            return JsonResponse({'error': 'Loan not found'}, status=404)
        
        # Update the loan
        FINANCIAL_DATA['loans'][loan_index] = {**FINANCIAL_DATA['loans'][loan_index], **data}
        
        return JsonResponse({'message': 'Loan updated successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_loan(request, loan_id):
    """Delete a loan"""
    try:
        user_id = request.user.id
        
        # Find the loan to delete
        loan_index = None
        for i, loan in enumerate(FINANCIAL_DATA['loans']):
            if loan['id'] == loan_id:
                loan_index = i
                break
        
        if loan_index is None:
            return JsonResponse({'error': 'Loan not found'}, status=404)
        
        # Delete the loan
        del FINANCIAL_DATA['loans'][loan_index]
        
        return JsonResponse({'message': 'Loan deleted successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_budget_plan(request):
    """Create a new budget plan"""
    try:
        user_id = request.user.id
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['seasonName', 'estimatedInputCosts', 'estimatedLaborCosts', 'estimatedMachineryCosts', 'expectedRevenue']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
        
        # Generate a new ID
        new_id = str(uuid.uuid4())
        data['id'] = new_id
        
        # Add to the mock database
        FINANCIAL_DATA['budgetPlans'].append(data)
        
        return JsonResponse({'id': new_id, 'message': 'Budget plan created successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_budget_plan(request, plan_id):
    """Update an existing budget plan"""
    try:
        user_id = request.user.id
        data = json.loads(request.body)
        
        # Find the budget plan to update
        plan_index = None
        for i, plan in enumerate(FINANCIAL_DATA['budgetPlans']):
            if plan['id'] == plan_id:
                plan_index = i
                break
        
        if plan_index is None:
            return JsonResponse({'error': 'Budget plan not found'}, status=404)
        
        # Update the budget plan
        FINANCIAL_DATA['budgetPlans'][plan_index] = {**FINANCIAL_DATA['budgetPlans'][plan_index], **data}
        
        return JsonResponse({'message': 'Budget plan updated successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_budget_plan(request, plan_id):
    """Delete a budget plan"""
    try:
        user_id = request.user.id
        
        # Find the budget plan to delete
        plan_index = None
        for i, plan in enumerate(FINANCIAL_DATA['budgetPlans']):
            if plan['id'] == plan_id:
                plan_index = i
                break
        
        if plan_index is None:
            return JsonResponse({'error': 'Budget plan not found'}, status=404)
        
        # Delete the budget plan
        del FINANCIAL_DATA['budgetPlans'][plan_index]
        
        return JsonResponse({'message': 'Budget plan deleted successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)