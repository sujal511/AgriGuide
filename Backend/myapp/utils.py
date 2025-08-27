import random
import string
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from .models import CustomUser
import logging
import uuid
import hashlib
from django.utils import timezone

logger = logging.getLogger(__name__)

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email, otp):
    subject = 'Agriguide - Email Verification OTP'
    message = f'''Your OTP for email verification is: {otp}
    
This OTP is valid for 10 minutes.

Best regards,
Agriguide Team'''
    
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        logger.info(f"Attempting to send OTP email to {email}")
        logger.debug(f"Email settings: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}, USER={settings.EMAIL_HOST_USER}")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False
        )
        
        if result == 1:
            logger.info(f"Successfully sent OTP email to {email}")
            return True
        else:
            logger.error(f"Failed to send OTP email to {email}. send_mail returned {result}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending OTP email to {email}: {str(e)}", exc_info=True)
        return False

def generate_password_reset_token():
    """Generate a unique token for password reset"""
    return str(uuid.uuid4())

def send_password_reset_email(email, token):
    """Send password reset email with token"""
    user = CustomUser.objects.get(email=email)
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
    
    subject = 'Agriguide - Password Reset'
    message = f'''Hello {user.username},

You've requested to reset your password. Please click the link below to reset your password:

{reset_url}

This link is valid for 24 hours.

If you didn't request this, please ignore this email.

Best regards,
Agriguide Team'''
    
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        logger.info(f"Attempting to send password reset email to {email}")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False
        )
        
        if result == 1:
            logger.info(f"Successfully sent password reset email to {email}")
            return True
        else:
            logger.error(f"Failed to send password reset email to {email}. send_mail returned {result}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending password reset email to {email}: {str(e)}", exc_info=True)
        return False
