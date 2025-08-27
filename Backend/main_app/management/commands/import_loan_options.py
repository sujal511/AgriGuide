import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from main_app.models import LoanOption

class Command(BaseCommand):
    help = 'Import loan options from CSV file'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting loan options import...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'loan_options.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                try:
                    # Extract numeric value from maximum_amount string
                    max_amount_str = row.get('maximum_amount', '0')
                    max_amount = ''.join(filter(lambda x: x.isdigit() or x == '.', max_amount_str))
                    
                    LoanOption.objects.update_or_create(
                        name=row['loan_name'],
                        defaults={
                            'provider': row['provider'],
                            'loan_type': row['loan_type'],
                            'interest_rate': row['interest_rate'],
                            'max_amount': float(max_amount) if max_amount else 0,
                            'tenure': row['repayment_period'],
                            'eligibility': row['eligibility_criteria'],
                            'documents_required': row['documents_needed'],
                            'processing_time': '2-4 weeks',  # Default value as it's not in the CSV
                            'special_features': row.get('collateral_required', 'No'),
                            'benefits': row.get('benefits', '')  # Add the benefits field
                        }
                    )
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing loan option {row.get("loan_name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {count} loan options')) 