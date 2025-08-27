import os
import sys
import django
from collections import Counter

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

from main_app.models import (
    GovernmentScheme, LoanOption, Technology,
    FarmerProfile, FarmerInterest
)

def analyze_challenge_mappings():
    """Analyze how many recommendations exist for each challenge in the system"""
    print("Analyzing challenge mappings in the database...\n")
    
    # List of all possible challenges
    all_challenges = [
        'Water Scarcity', 'Market Access', 'Price Volatility', 'Input Costs',
        'Financial Constraints', 'Credit Access', 'Irrigation Management',
        'Technology Access', 'Processing Delays', 'Limited Credit History',
        'Post-harvest Financing', 'Crop Financing', 'Collateral Requirements',
        'Seasonal Cash Flow', 'Infrastructure Development', 'Farm Mechanization Costs',
        'Documentation Complexity', 'High Interest Rates', 'Seed Quality',
        'Loan Repayment Flexibility'
    ]
    
    # Challenge keyword mappings from the code
    challenge_keywords = {
        'Water Scarcity': ['drought', 'rain shortage', 'rainfall deficit', 'dry season', 'water shortage'],
        'Market Access': ['market', 'selling', 'trade', 'export', 'buyer', 'mandi', 'marketplace'],
        'Price Volatility': ['price', 'fluctuation', 'volatile', 'rate', 'value', 'cost variation', 'stable price'],
        'Input Costs': ['input', 'seed', 'fertilizer', 'cost', 'expense', 'investment', 'affordable'],
        'Financial Constraints': ['finance', 'fund', 'budget', 'monetary', 'fiscal', 'subsidy', 'financial'],
        'Credit Access': ['credit', 'loan', 'borrow', 'lending', 'finance', 'banking', 'financial'],
        'Irrigation Management': ['drip irrigation', 'sprinkler system', 'canal', 'watershed', 'water management'],
        'Crop Financing': ['financing', 'funding', 'loan', 'credit', 'capital', 'investment', 'pre-harvest'],
        'Seed Quality': ['seed', 'variety', 'hybrid', 'germination', 'quality', 'certified', 'genuine'],
        'Technology Access': ['technology', 'digital', 'app', 'equipment', 'machine', 'modern', 'innovation'],
        'Collateral Requirements': ['collateral', 'security', 'guarantee', 'asset', 'property', 'pledge', 'mortgage'],
        'High Interest Rates': ['interest', 'rate', 'charge', 'percent', 'fee', 'apr', 'emi'],
        'Processing Delays': ['processing', 'delay', 'time', 'approval', 'waiting', 'duration', 'quick'],
        'Seasonal Cash Flow': ['seasonal', 'cash flow', 'liquidity', 'working capital', 'income', 'revenue'],
        'Documentation Complexity': ['document', 'paperwork', 'form', 'kyc', 'application', 'process'],
        'Limited Credit History': ['credit history', 'score', 'rating', 'record', 'first-time', 'new borrower'],
        'Infrastructure Development': ['infrastructure', 'facility', 'building', 'storage', 'warehouse', 'setup'],
        'Farm Mechanization Costs': ['mechanization', 'machinery', 'equipment', 'tractor', 'automation'],
        'Post-harvest Financing': ['post-harvest', 'storage', 'processing', 'value addition', 'warehouse'],
        'Loan Repayment Flexibility': ['repayment', 'flexibility', 'term', 'schedule', 'installment', 'moratorium']
    }
    
    # 1. Analyze Government Schemes
    scheme_matches = {challenge: 0 for challenge in all_challenges}
    all_schemes = GovernmentScheme.objects.all()
    for scheme in all_schemes:
        scheme_text = (scheme.benefits.lower() + ' ' + 
                      scheme.name.lower() + ' ' + 
                      scheme.detailed_description.lower() + ' ' +
                      scheme.eligibility_criteria.lower())
                      
        for challenge, keywords in challenge_keywords.items():
            # Direct match
            if challenge.lower() in scheme_text:
                scheme_matches[challenge] += 1
                continue
                
            # Keyword match
            for keyword in keywords:
                if keyword in scheme_text:
                    scheme_matches[challenge] += 1
                    break
    
    # 2. Analyze Loan Options
    loan_matches = {challenge: 0 for challenge in all_challenges}
    all_loans = LoanOption.objects.all()
    for loan in all_loans:
        loan_text = (loan.name.lower() + ' ' +
                    loan.loan_type.lower() + ' ' +
                    loan.eligibility.lower() + ' ' +
                    loan.special_features.lower())
                    
        for challenge, keywords in challenge_keywords.items():
            # Direct match
            if challenge.lower() in loan_text:
                loan_matches[challenge] += 1
                continue
                
            # Keyword match
            for keyword in keywords:
                if keyword in loan_text:
                    loan_matches[challenge] += 1
                    break
    
    # 3. Analyze Technologies
    tech_matches = {challenge: 0 for challenge in all_challenges}
    all_techs = Technology.objects.all()
    for tech in all_techs:
        tech_text = (tech.name.lower() + ' ' +
                    tech.category.lower() + ' ' +
                    tech.technical_requirements.lower())
                    
        for challenge, keywords in challenge_keywords.items():
            # Direct match
            if challenge.lower() in tech_text:
                tech_matches[challenge] += 1
                continue
                
            # Keyword match
            for keyword in keywords:
                if keyword in tech_text:
                    tech_matches[challenge] += 1
                    break
    
    # 4. User statistics - Check which challenges farmers are selecting
    user_challenge_selections = Counter()
    farmer_interests = FarmerInterest.objects.all()
    total_farmers = 0
    
    for interest in farmer_interests:
        if interest.challenges:
            total_farmers += 1
            challenges = [c.strip() for c in interest.challenges.split(',')]
            for challenge in challenges:
                user_challenge_selections[challenge] += 1
    
    # Print Results
    print("=" * 80)
    print("CHALLENGE RECOMMENDATION ANALYSIS")
    print("=" * 80)
    print(f"Total Government Schemes: {all_schemes.count()}")
    print(f"Total Loan Options: {all_loans.count()}")
    print(f"Total Technologies: {all_techs.count()}")
    print(f"Total Farmers with Challenge Data: {total_farmers}")
    print("=" * 80)
    
    print("\nCHALLENGE RECOMMENDATION COUNTS")
    print("-" * 80)
    print(f"{'CHALLENGE':<30} {'SCHEMES':<10} {'LOANS':<10} {'TECH':<10} {'TOTAL':<10} {'USERS':<10}")
    print("-" * 80)
    
    for challenge in all_challenges:
        scheme_count = scheme_matches[challenge]
        loan_count = loan_matches[challenge]
        tech_count = tech_matches[challenge]
        total_count = scheme_count + loan_count + tech_count
        user_count = user_challenge_selections.get(challenge, 0)
        
        print(f"{challenge:<30} {scheme_count:<10} {loan_count:<10} {tech_count:<10} {total_count:<10} {user_count:<10}")
    
    print("\n")

if __name__ == "__main__":
    analyze_challenge_mappings() 