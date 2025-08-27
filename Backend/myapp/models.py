from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Add custom fields here
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    password_reset_token = models.CharField(max_length=100, null=True, blank=True)
    password_reset_token_created_at = models.DateTimeField(null=True, blank=True)
    profile_image = models.TextField(blank=True, null=True)  # Store base64 encoded image
    
    def __str__(self):
        return self.username

class TempUser(models.Model):
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    password = models.CharField(max_length=128)
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.username

# LoanScheme model moved from Bank_app
class LoanScheme(models.Model):
    scheme_id = models.CharField(max_length=50, primary_key=True)
    scheme_name = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=100)
    loan_type = models.CharField(max_length=100)
    interest_rate_min = models.FloatField()
    interest_rate_max = models.FloatField()
    interest_rate_note = models.TextField(null=True, blank=True)
    repayment_term_months = models.IntegerField()
    repayment_category = models.CharField(max_length=100, null=True, blank=True)
    eligibility = models.TextField(null=True, blank=True)
    description = models.TextField()
    key_benefits = models.TextField(null=True, blank=True)
    loan_limit_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    loan_limit_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    loan_limit_note = models.TextField(null=True, blank=True)
    collateral_required = models.BooleanField(default=False)
    loan_purpose = models.TextField(null=True, blank=True)
    processing_fee_note = models.TextField(null=True, blank=True)
    subsidy_available = models.BooleanField(default=False)
    subsidy_details = models.TextField(null=True, blank=True)
    insurance_linkage = models.BooleanField(default=False)
    renewal_period = models.CharField(max_length=100, null=True, blank=True)
    
    # Contact information
    contact_phone = models.CharField(max_length=50, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_website = models.URLField(null=True, blank=True)
    contact_info = models.TextField(null=True, blank=True, help_text="Additional contact information")

    def __str__(self):
        return f"{self.bank_name} - {self.scheme_name}"

# Government Scheme model - updated to match scheme_app implementation
class GovernmentScheme(models.Model):
    """
    Model to store government schemes information.
    
    This model is designed to store comprehensive information about various government schemes
    including central and state-level schemes. It uses JSONField for flexible storage of
    complex nested data structures.
    """
    
    # State choices for categorizing schemes
    STATE_CHOICES = [
        ('CENTRAL', 'Central Government'),
        ('KA', 'Karnataka'),
        ('MH', 'Maharashtra'),
        
       
    ]
    
    # Basic scheme information
    scheme_id = models.CharField(max_length=50, primary_key=True, 
        help_text="Unique identifier for the scheme")
    name = models.CharField(max_length=255, 
        help_text="Name of the government scheme")
    type = models.CharField(max_length=100, 
        help_text="Type/category of the scheme")
    description = models.TextField(
        help_text="Detailed description of the scheme")
    target_group = models.CharField(max_length=255, 
        help_text="Target beneficiaries of the scheme")
    status = models.CharField(max_length=50, 
        help_text="Current status of the scheme (Active/Inactive/etc)")
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='CENTRAL',
        help_text="State or central government scheme")
    
    # Complex data stored as JSON
    language_support = models.JSONField(default=list, null=True, blank=True,
        help_text="Supported languages and their content")
    eligibility = models.JSONField(default=dict, null=True, blank=True,
        help_text="Eligibility criteria in structured format")
    benefits = models.JSONField(default=list, null=True, blank=True,
        help_text="Benefits provided by the scheme")
    how_to_apply = models.JSONField(default=dict, null=True, blank=True,
        help_text="Application process and steps")
    required_documents = models.JSONField(default=list, null=True, blank=True,
        help_text="List of required documents")
    contact = models.JSONField(default=dict, null=True, blank=True,
        help_text="Contact information and support details")
    faq = models.JSONField(default=list, null=True, blank=True,
        help_text="Frequently asked questions and answers")
    
    def __str__(self):
        """String representation of the scheme"""
        return f"{self.name} ({self.state})"

class FarmResource(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='farm_resources')
    data = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Farm Resource'
        verbose_name_plural = 'Farm Resources'

    def __str__(self):
        return f"Farm Resources - {self.user.username}"
