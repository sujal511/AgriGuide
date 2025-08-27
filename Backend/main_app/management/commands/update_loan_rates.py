import csv
import os
from django.core.management.base import BaseCommand
from main_app.models import LoanOption

class Command(BaseCommand):
    help = 'Update loan interest rates to be at least 4% for government schemes and 5% for other loans'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting loan interest rate update...')
        
        # Get all loans with interest rates below 5%
        loans_to_update = []
        
        # Government schemes that should have at least 4% interest
        govt_schemes = [
            'Karnataka Raitha Bandhu Scheme',
            'Karnataka Krishi Bhagya Scheme',
            'Karnataka Bhoochetana Scheme',
            'Karnataka Yashaswini Scheme',
            'Karnataka Anna Bhagya Scheme',
            'Karnataka Ganga Kalyana Scheme',
            'Karnataka Pashu Bhagya Scheme'
        ]
        
        for loan in LoanOption.objects.all():
            try:
                # Extract interest rate
                current_rate = float(loan.interest_rate)
                
                # Check if rate needs updating
                if current_rate < 4.0:
                    # Government schemes get minimum 4%
                    if loan.name in govt_schemes or 'Government of' in loan.provider:
                        new_rate = 4.0
                        loans_to_update.append((loan, current_rate, new_rate))
                    # All other loans get minimum 5%
                    else:
                        new_rate = 5.0
                        loans_to_update.append((loan, current_rate, new_rate))
                # Loans between 4-5% that aren't govt schemes
                elif current_rate < 5.0 and loan.name not in govt_schemes and 'Government of' not in loan.provider:
                    new_rate = 5.0
                    loans_to_update.append((loan, current_rate, new_rate))
            except (ValueError, TypeError):
                self.stdout.write(self.style.WARNING(f'Could not parse interest rate for {loan.name}: {loan.interest_rate}'))
        
        # Update loans
        for loan, old_rate, new_rate in loans_to_update:
            self.stdout.write(f'Updating {loan.name} from {old_rate}% to {new_rate}%')
            loan.interest_rate = str(new_rate)
            loan.save()
        
        self.stdout.write(self.style.SUCCESS(f'Updated {len(loans_to_update)} loan interest rates')) 