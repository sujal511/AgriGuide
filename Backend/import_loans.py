import os
import django
import csv
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

from main_app.models import LoanOption

def import_loans_from_csv():
    csv_file_path = 'main_app/data/loan_options.csv'
    
    # First, delete existing loan options to avoid duplicates
    print(f"Deleting existing loan options...")
    existing_count = LoanOption.objects.count()
    LoanOption.objects.all().delete()
    print(f"Deleted {existing_count} existing loan options.")
    
    # Now import from CSV
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        next(csv_reader)  # Skip header row
        
        loans_created = 0
        for row in csv_reader:
            try:
                # Parse data
                name = row[0]
                provider = row[1]
                loan_type = row[2]
                interest_rate = row[3]
                max_amount = row[4].replace(',', '') if row[4] else '0'
                tenure = row[5]
                eligibility = row[6]
                collateral = row[7]
                documents = row[8]
                benefits = row[9] if len(row) > 9 else ""  # Get benefits from CSV
                
                # Handle special features based on collateral
                special_features = ""
                if collateral.lower() == 'no':
                    special_features += "No collateral required. "
                elif collateral.lower() == 'yes':
                    special_features += "Collateral required. "
                
                # Create loan object
                loan = LoanOption(
                    name=name,
                    provider=provider,
                    loan_type=loan_type,
                    interest_rate=interest_rate,
                    max_amount=Decimal(max_amount) if max_amount.replace('.','',1).isdigit() else 0,
                    tenure=tenure,
                    eligibility=eligibility,
                    documents_required=documents,
                    special_features=special_features,
                    benefits=benefits  # Add benefits
                )
                loan.save()
                loans_created += 1
                print(f"Imported: {name} ({loans_created})")
                
            except Exception as e:
                print(f"Error importing loan: {row[0] if row else 'unknown'} - {str(e)}")
        
        print(f"Successfully imported {loans_created} loan options.")

if __name__ == "__main__":
    import_loans_from_csv() 