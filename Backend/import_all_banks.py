import os
import json
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

from myapp.models import LoanScheme

# Bank name mappings
BANK_NAMES = {
    'BankofBaroda': 'Bank of Baroda',
    'sbi': 'State Bank of India',
    'icic': 'ICICI Bank',
    'punjab': 'Punjab National Bank'
}

def clean_bool_value(value):
    """Convert string or other values to proper boolean"""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('yes', 'true', '1', 'available', 'required')
    return bool(value)

def import_bank_data(json_file, bank_name):
    """Import loan schemes from JSON file into database"""
    print(f"Importing {bank_name} data from {json_file}...")
    
    # Delete existing records for this bank to prevent duplicates
    LoanScheme.objects.filter(bank_name=bank_name).delete()
    
    try:
        # Read JSON file
        with open(json_file, 'r', encoding='utf-8') as f:
            schemes = json.load(f)
        
        success_count = 0
        # Process each scheme
        for scheme in schemes:
            try:
                # Create a scheme_id if not present
                if not scheme.get('schemeId', ''):
                    scheme_id = f"{bank_name.replace(' ', '-')}-{success_count+1}"
                else:
                    scheme_id = scheme.get('schemeId', '')
                
                # Handle possible string values for numeric fields
                interest_min = scheme.get('interestRate', {}).get('min', 0.0)
                if isinstance(interest_min, str):
                    try:
                        interest_min = float(interest_min.replace('%', ''))
                    except:
                        interest_min = 0.0
                        
                interest_max = scheme.get('interestRate', {}).get('max', 0.0)
                if isinstance(interest_max, str):
                    try:
                        interest_max = float(interest_max.replace('%', ''))
                    except:
                        interest_max = 0.0
                
                term_months = scheme.get('repaymentTerm', {}).get('durationMonths', 0)
                if isinstance(term_months, str):
                    try:
                        term_months = int(term_months.replace('months', '').strip())
                    except:
                        term_months = 12
                
                loan_min = scheme.get('loanLimit', {}).get('minAmount', None)
                if isinstance(loan_min, str) and loan_min:
                    try:
                        loan_min = float(loan_min.replace('₹', '').replace(',', ''))
                    except:
                        loan_min = None
                
                loan_max = scheme.get('loanLimit', {}).get('maxAmount', None)
                if isinstance(loan_max, str) and loan_max:
                    try:
                        loan_max = float(loan_max.replace('₹', '').replace(',', ''))
                    except:
                        loan_max = None
                
                # Extract data with proper handling of missing or nested values
                # Convert lists and dictionaries to strings if necessary
                eligibility = scheme.get('eligibility', [])
                if isinstance(eligibility, list):
                    eligibility = json.dumps(eligibility)
                
                key_benefits = scheme.get('keyBenefits', [])
                if isinstance(key_benefits, list):
                    key_benefits = json.dumps(key_benefits)
                
                loan_purpose = scheme.get('loanPurpose', [])
                if isinstance(loan_purpose, list):
                    loan_purpose = json.dumps(loan_purpose)
                
                insurance_linkage = scheme.get('insuranceLinkage', [])
                if isinstance(insurance_linkage, list) or isinstance(insurance_linkage, dict):
                    insurance_linkage = json.dumps(insurance_linkage)
                
                loan_scheme = LoanScheme(
                    scheme_id=scheme_id,
                    scheme_name=scheme.get('schemeName', '') or f"{bank_name} Loan Scheme {success_count+1}",
                    bank_name=bank_name,
                    loan_type=scheme.get('loanType', '') or 'Agricultural Loan',
                    interest_rate_min=interest_min,
                    interest_rate_max=interest_max,
                    interest_rate_note=scheme.get('interestRate', {}).get('note', ''),
                    repayment_term_months=term_months or 12,
                    repayment_category=scheme.get('repaymentTerm', {}).get('category', '') or '',
                    eligibility=eligibility,
                    description=scheme.get('description', '') or 'Agricultural loan scheme',
                    key_benefits=key_benefits,
                    loan_limit_min=loan_min,
                    loan_limit_max=loan_max,
                    loan_limit_note=scheme.get('loanLimit', {}).get('note', ''),
                    collateral_required=clean_bool_value(scheme.get('collateralRequired', False)),
                    loan_purpose=loan_purpose,
                    processing_fee_note=scheme.get('processingFee', {}).get('note', ''),
                    subsidy_available=clean_bool_value(scheme.get('subsidy', {}).get('available', False)),
                    subsidy_details=scheme.get('subsidy', {}).get('details', ''),
                    insurance_linkage=clean_bool_value(scheme.get('insuranceLinkage', False)),
                    renewal_period=scheme.get('renewalPeriod', '')
                )
                loan_scheme.save()
                success_count += 1
                print(f"Imported scheme: {loan_scheme.scheme_name}")
            except Exception as e:
                print(f"Error importing scheme {scheme.get('schemeId', 'unknown')}: {str(e)}")
        
        return success_count
    except Exception as e:
        print(f"Error reading file {json_file}: {str(e)}")
        return 0

if __name__ == '__main__':
    # Get the data directory relative to this script
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    
    # Process all JSON files in the data directory
    total_imported = 0
    for filename in os.listdir(data_dir):
        if filename.endswith('.json') and any(bank in filename for bank in ['BankofBaroda', 'sbi', 'icic', 'punjab']):
            base_name = os.path.splitext(filename)[0]
            bank_name = BANK_NAMES.get(base_name, base_name.title())
            file_path = os.path.join(data_dir, filename)
            
            count = import_bank_data(file_path, bank_name)
            print(f"Imported {count} schemes from {bank_name}")
            total_imported += count
    
    print(f"\nTotal: Imported {total_imported} schemes from all banks") 