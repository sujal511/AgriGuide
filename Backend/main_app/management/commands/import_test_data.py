import csv
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from main_app.models import (
    FarmerProfile, Crop, GovernmentScheme, LoanOption, Technology
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Import test data from CSV files'

    def handle(self, *args, **options):
        self.stdout.write('Starting data import...')
        
        base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
        
        self.import_crops(os.path.join(base_dir, 'crops.csv'))
        self.import_govt_schemes(os.path.join(base_dir, 'government_schemes.csv'))
        self.import_loan_options(os.path.join(base_dir, 'loan_options.csv'))
        self.import_technologies(os.path.join(base_dir, 'agriculture_technologies.csv'))
        
        self.create_test_user()
        
        self.stdout.write(self.style.SUCCESS('Data import completed successfully!'))

    def import_crops(self, file_path):
        if not os.path.exists(file_path):
            self.stdout.write(self.style.WARNING(f'File not found: {file_path}'))
            return
            
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                Crop.objects.get_or_create(
                    name=row['name'],
                    defaults={
                        'crop_type': row.get('crop_type', ''),
                        'water_requirement': row.get('water_requirement', ''),
                        'soil_type_preference': row.get('soil_type_preference', ''),
                        'growing_season': row.get('growing_season', ''),
                        'growth_duration_days': int(row.get('growth_duration_days', 0)) if row.get('growth_duration_days') else 0,
                        'planting_method': row.get('planting_method', ''),
                        'climate_requirement': row.get('climate_requirement', ''),
                        'yield_per_acre': row.get('yield_per_acre', ''),
                        'market_value': row.get('market_value', ''),
                        'detailed_description': row.get('detailed_description', ''),
                    }
                )
                count += 1
            self.stdout.write(self.style.SUCCESS(f'Imported {count} crops'))

    def import_govt_schemes(self, file_path):
        if not os.path.exists(file_path):
            self.stdout.write(self.style.WARNING(f'File not found: {file_path}'))
            return
            
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                GovernmentScheme.objects.get_or_create(
                    name=row['name'],
                    defaults={
                        'implementing_agency': row.get('implementing_agency', ''),
                        'eligibility_criteria': row.get('eligibility_criteria', ''),
                        'benefits': row.get('benefits', ''),
                        'application_process': row.get('application_process', ''),
                        'documents_required': row.get('documents_required', ''),
                        'district_availability': row.get('district_availability', ''),
                        'crop_applicability': row.get('crop_applicability', ''),
                        'official_website': row.get('official_website', ''),
                        'detailed_description': row.get('detailed_description', ''),
                        'how_to_apply': row.get('how_to_apply', ''),
                    }
                )
                count += 1
            self.stdout.write(self.style.SUCCESS(f'Imported {count} government schemes'))

    def import_loan_options(self, file_path):
        if not os.path.exists(file_path):
            self.stdout.write(self.style.WARNING(f'File not found: {file_path}'))
            return
            
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                LoanOption.objects.get_or_create(
                    name=row['name'],
                    defaults={
                        'provider': row.get('provider', ''),
                        'loan_type': row.get('loan_type', ''),
                        'interest_rate': float(row.get('interest_rate', 0)) if row.get('interest_rate') else 0,
                        'max_amount': row.get('max_amount', ''),
                        'tenure': row.get('tenure', ''),
                        'eligibility': row.get('eligibility', ''),
                        'documents_required': row.get('documents_required', ''),
                        'processing_time': row.get('processing_time', ''),
                        'special_features': row.get('special_features', ''),
                    }
                )
                count += 1
            self.stdout.write(self.style.SUCCESS(f'Imported {count} loan options'))

    def import_technologies(self, file_path):
        if not os.path.exists(file_path):
            self.stdout.write(self.style.WARNING(f'File not found: {file_path}'))
            return
            
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                Technology.objects.get_or_create(
                    name=row['name'],
                    defaults={
                        'category': row.get('category', ''),
                        'suitable_crops': row.get('suitable_crops', ''),
                        'implementation_cost': row.get('implementation_cost', ''),
                        'roi_percentage': float(row.get('roi_percentage', 0)) if row.get('roi_percentage') else 0,
                        'technical_requirements': row.get('technical_requirements', ''),
                        'training_needs': row.get('training_needs', ''),
                        'supplier_contacts': row.get('supplier_contacts', ''),
                        'district_availability': row.get('district_availability', ''),
                    }
                )
                count += 1
            self.stdout.write(self.style.SUCCESS(f'Imported {count} technologies'))

    def create_test_user(self):
        # Create a test user and farmer profile if they don't exist
        username = 'testfarmer'
        email = 'test@example.com'
        password = 'testpassword'
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_active': True,
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created test user: {username} with password: {password}'))
        
        # Create a farmer profile for the test user if it doesn't exist
        farmer, created = FarmerProfile.objects.get_or_create(
            user=user,
            defaults={
                'name': 'Test Farmer',
                'age': 35,
                'gender': 'M',
                'phone_number': '9876543210',
                'district': 'Mysuru',
                'village': 'Test Village',
                'land_ownership': 'Own',
                'farming_experience_years': 10,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created farmer profile for test user'))
