import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

from myapp.models import LoanScheme

def print_scheme(scheme):
    """Pretty print a loan scheme"""
    print(f"\n{'=' * 80}")
    print(f"Scheme: {scheme.scheme_name} ({scheme.scheme_id})")
    print(f"Bank: {scheme.bank_name}")
    print(f"Type: {scheme.loan_type}")
    print(f"Interest Rate: {scheme.interest_rate_min}-{scheme.interest_rate_max}% ({scheme.interest_rate_note})")
    print(f"Repayment Term: {scheme.repayment_term_months} months ({scheme.repayment_category})")
    print(f"Description: {scheme.description}")
    print("\nEligibility:")
    for item in scheme.eligibility:
        print(f"- {item}")
    print("\nKey Benefits:")
    for item in scheme.key_benefits:
        print(f"- {item}")
    print(f"\nLoan Limit: {scheme.loan_limit_note}")
    print(f"Collateral Required: {scheme.collateral_required}")
    print("\nLoan Purpose:")
    for item in scheme.loan_purpose:
        print(f"- {item}")
    print(f"\nSubsidy Available: {'Yes' if scheme.subsidy_available else 'No'}")
    if scheme.subsidy_available and scheme.subsidy_details:
        print(f"Subsidy Details: {scheme.subsidy_details}")
    print(f"{'=' * 80}")

def list_banks():
    """List all banks with their scheme count"""
    banks = LoanScheme.objects.values('bank_name').distinct()
    print("\nAvailable Banks:")
    for bank in banks:
        bank_name = bank['bank_name']
        count = LoanScheme.objects.filter(bank_name=bank_name).count()
        print(f"- {bank_name} ({count} schemes)")

def list_schemes(bank_name=None):
    """List all schemes, optionally filtered by bank"""
    query = LoanScheme.objects.all()
    if bank_name:
        query = query.filter(bank_name=bank_name)
    
    schemes = query.order_by('bank_name', 'scheme_name')
    
    if schemes.count() == 0:
        print(f"No schemes found{f' for {bank_name}' if bank_name else ''}.")
        return
    
    print(f"\nAvailable Schemes{f' for {bank_name}' if bank_name else ''}:")
    for i, scheme in enumerate(schemes, 1):
        print(f"{i}. {scheme.bank_name} - {scheme.scheme_name} ({scheme.loan_type})")

def search_schemes(term):
    """Search for schemes containing the given term"""
    schemes = LoanScheme.objects.filter(
        scheme_name__icontains=term
    ) | LoanScheme.objects.filter(
        description__icontains=term
    ) | LoanScheme.objects.filter(
        loan_type__icontains=term
    )
    
    if schemes.count() == 0:
        print(f"No schemes found matching '{term}'.")
        return
    
    print(f"\nSchemes matching '{term}':")
    for i, scheme in enumerate(schemes, 1):
        print(f"{i}. {scheme.bank_name} - {scheme.scheme_name} ({scheme.loan_type})")

def filter_by_interest_rate(max_rate):
    """Find schemes with maximum interest rate below the specified value"""
    try:
        max_rate = float(max_rate)
    except ValueError:
        print(f"Invalid interest rate: {max_rate}")
        return
    
    schemes = LoanScheme.objects.filter(interest_rate_max__lte=max_rate).order_by('interest_rate_max')
    
    if schemes.count() == 0:
        print(f"No schemes found with maximum interest rate below {max_rate}%.")
        return
    
    print(f"\nSchemes with maximum interest rate below {max_rate}%:")
    for i, scheme in enumerate(schemes, 1):
        print(f"{i}. {scheme.bank_name} - {scheme.scheme_name} " +
              f"({scheme.interest_rate_min}-{scheme.interest_rate_max}%)")

def filter_by_subsidy():
    """Find schemes that offer subsidies"""
    schemes = LoanScheme.objects.filter(subsidy_available=True).order_by('bank_name')
    
    if schemes.count() == 0:
        print("No schemes found with subsidies.")
        return
    
    print("\nSchemes with subsidies available:")
    for i, scheme in enumerate(schemes, 1):
        print(f"{i}. {scheme.bank_name} - {scheme.scheme_name}")
        if scheme.subsidy_details:
            print(f"   Details: {scheme.subsidy_details}")

def show_help():
    """Display help information"""
    print("\nAgricultural Loan Scheme Database Query Tool")
    print("===========================================")
    print("\nUsage: python query_bank_data.py [command] [options]")
    print("\nCommands:")
    print("  banks                 List all banks")
    print("  schemes               List all schemes")
    print("  schemes [bank_name]   List schemes for a specific bank")
    print("  search [term]         Search for schemes with a term")
    print("  rate [max_rate]       Find schemes with interest rate below max_rate")
    print("  subsidy               Find schemes with subsidies")
    print("  show [id]             Show details of a scheme by ID")
    print("  help                  Show this help information")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        show_help()
    else:
        command = sys.argv[1].lower()
        
        if command == 'banks':
            list_banks()
        
        elif command == 'schemes':
            if len(sys.argv) > 2:
                list_schemes(sys.argv[2])
            else:
                list_schemes()
        
        elif command == 'search' and len(sys.argv) > 2:
            search_schemes(sys.argv[2])
        
        elif command == 'rate' and len(sys.argv) > 2:
            filter_by_interest_rate(sys.argv[2])
        
        elif command == 'subsidy':
            filter_by_subsidy()
        
        elif command == 'show' and len(sys.argv) > 2:
            try:
                scheme_id = sys.argv[2]
                scheme = LoanScheme.objects.get(scheme_id=scheme_id)
                print_scheme(scheme)
            except LoanScheme.DoesNotExist:
                print(f"Scheme with ID '{scheme_id}' not found.")
        
        elif command == 'help':
            show_help()
        
        else:
            print("Invalid command or missing arguments.")
            show_help() 