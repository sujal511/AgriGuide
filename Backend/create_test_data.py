import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

# Import models
from django.contrib.auth import get_user_model
from main_app.models import District, FarmerProfile, FarmDetail

# Get the custom user model
User = get_user_model()

# Create or get test user
try:
    user = User.objects.get(username='testuser')
    print(f"Found existing test user: {user.username} (ID: {user.id})")
except User.DoesNotExist:
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='password123'
    )
    print(f"Created new test user: {user.username} (ID: {user.id})")

# Create or get district
try:
    district = District.objects.first()
    if not district:
        district = District.objects.create(
            name='Test District',
            region='Test Region',
            avg_annual_rainfall_mm=1000,
            min_temp_c=20,
            max_temp_c=30,
            major_soil_types='Red, Black'
        )
        print(f"Created new district: {district.name} (ID: {district.id})")
    else:
        print(f"Using existing district: {district.name} (ID: {district.id})")
except Exception as e:
    print(f"Error creating district: {str(e)}")
    district = District.objects.create(
        name='Test District',
        region='Test Region',
        avg_annual_rainfall_mm=1000,
        min_temp_c=20,
        max_temp_c=30,
        major_soil_types='Red, Black'
    )
    print(f"Created new district: {district.name} (ID: {district.id})")

# Create or get farmer profile
try:
    farmer = FarmerProfile.objects.get(user=user)
    print(f"Found existing farmer profile for {user.username} (ID: {farmer.id})")
except FarmerProfile.DoesNotExist:
    farmer = FarmerProfile.objects.create(
        user=user,
        first_name='Test',
        last_name='User',
        district=district.name,
        preferred_season='Kharif',
        mobile='9876543210',
        state='Karnataka'
    )
    print(f"Created new farmer profile (ID: {farmer.id})")

# Create or get farm details
try:
    farm = FarmDetail.objects.get(farmer=farmer)
    print(f"Found existing farm details for farmer ID {farmer.id} (ID: {farm.id})")
except FarmDetail.DoesNotExist:
    farm = FarmDetail.objects.create(
        farmer=farmer,
        farm_size=5.0,
        soil_type='Red',
        irrigation_sources='Well',
        irrigation_systems='Drip',
        nitrogen_value=120,
        phosphorus_value=60,
        potassium_value=80,
        ph_value=6.5
    )
    print(f"Created new farm details (ID: {farm.id})")

print("\nTest data setup complete!")
print(f"User ID: {user.id}")
print(f"Farmer Profile ID: {farmer.id}")
print(f"Farm Details ID: {farm.id}")
print("\nYou can now use these IDs in your React application.") 