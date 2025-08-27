from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'confirm_password', 'phone_number')
        extra_kwargs = {
            'email': {'required': True},
            'phone_number': {'required': True}
        }
    
    def validate(self, data):
        # Log the incoming data for debugging (excluding sensitive fields)
        logger.info(f"Validating data for user: {data.get('username')}, email: {data.get('email')}")
        
        # Check if all required fields are present
        required_fields = ['username', 'email', 'password', 'confirm_password', 'phone_number']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} is required."
                })

        # Only check if username is present and unique (handled by model)
        if not data.get('username'):
            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        # Validate passwords match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Validate password strength
        try:
            validate_password(data.get('password'))
        except ValidationError as e:
            raise serializers.ValidationError({
                "password": list(e.messages)
            })
            
        # Validate phone number format
        phone = data.get('phone_number')
        if not phone.isdigit() or len(phone) != 10:
            raise serializers.ValidationError({
                "phone_number": "Phone number must be 10 digits."
            })
        
        # Remove confirm_password from the data as we don't need to save it
        if 'confirm_password' in data:
            data.pop('confirm_password')
            
        return data
    
    def create(self, validated_data):
        try:
            logger.info(f"Creating user with email: {validated_data.get('email')}")
            user = CustomUser.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                phone_number=validated_data.get('phone_number', '')
            )
            return user
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information."""
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 
                  'address', 'date_joined', 'is_email_verified', 'profile_image')
        read_only_fields = ('id', 'email', 'date_joined', 'is_email_verified')

class PasswordResetSerializer(serializers.Serializer):
    """Serializer for requesting a password reset"""
    email = serializers.EmailField()

    def validate_email(self, value):
        """Validate that the email exists in the database"""
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is registered with this email address")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset"""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        """Validate the password reset data"""
        # Validate that passwords match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Validate password strength
        try:
            validate_password(data.get('password'))
        except ValidationError as e:
            raise serializers.ValidationError({
                "password": list(e.messages)
            })
            
        return data