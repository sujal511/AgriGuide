import csv
import os
from django.core.management.base import BaseCommand
from main_app.models import GovernmentScheme

class Command(BaseCommand):
    help = 'Import government schemes data from CSV file'

    def handle(self, *args, **kwargs):
        # Clear existing government schemes
        GovernmentScheme.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared existing government schemes data'))
        
        # Path to the CSV file
        csv_file_path = os.path.join('main_app', 'data', 'government_schemes.csv')
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                schemes_created = 0
                
                for row in reader:
                    GovernmentScheme.objects.create(
                        name=row['scheme_name'],
                        implementing_agency=row['implementing_agency'],
                        eligibility_criteria=row['eligibility_criteria'],
                        benefits=row['benefits'],
                        application_process=row['application_process'],
                        documents_required=row['documents_required'],
                        district_availability=row['district_availability'],
                        crop_applicability=row['crop_applicability'],
                        official_website=row['official_website'],
                        detailed_description=row['detailed_description'],
                        how_to_apply=row['how_to_apply']
                    )
                    schemes_created += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully imported {schemes_created} government schemes')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error importing government schemes data: {str(e)}')
            ) 