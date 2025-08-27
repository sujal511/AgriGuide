#!/usr/bin/env python
import os
import django
from collections import Counter

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

# Import models
from main_app.models import GovernmentScheme, LoanOption, Technology, FarmerInterest

# List of challenges shown in the screenshot
CHALLENGES = [
    "Water Scarcity",
    "Market Access",
    "Price Volatility",
    "Input Costs",
    "Financial Constraints",
    "Credit Access", 
    "Irrigation Management",
    "Crop Financing",
    "Seed Quality",
    "Technology Access",
    "Collateral Requirements",
    "High Interest Rates", 
    "Processing Delays",
    "Seasonal Cash Flow",
    "Documentation Complexity",
    "Limited Credit History",
    "Infrastructure Development",
    "Farm Mechanization Costs", 
    "Post-harvest Financing",
    "Loan Repayment Flexibility"
]

def check_match_in_text(challenge, text):
    """Check if challenge or its keywords appear in the text"""
    if not text:
        return False
    
    text = text.lower()
    challenge_lower = challenge.lower()
    
    # Direct match
    if challenge_lower in text:
        return True
    
    # Keyword matching - expanded for better matching
    keywords = {
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
    
    challenge_keywords = keywords.get(challenge, [])
    for keyword in challenge_keywords:
        if keyword in text:
            return True
    
    return False

def check_scheme_matches():
    """Check which challenges have matching government schemes"""
    schemes = GovernmentScheme.objects.all()
    matches = {challenge: [] for challenge in CHALLENGES}
    
    for scheme in schemes:
        combined_text = f"{scheme.name} {scheme.detailed_description} {scheme.benefits} {scheme.eligibility_criteria}"
        
        for challenge in CHALLENGES:
            if check_match_in_text(challenge, combined_text):
                matches[challenge].append(scheme.name)
    
    return matches

def check_loan_matches():
    """Check which challenges have matching loan options"""
    loans = LoanOption.objects.all()
    matches = {challenge: [] for challenge in CHALLENGES}
    
    for loan in loans:
        combined_text = f"{loan.name} {loan.loan_type} {loan.special_features} {loan.eligibility}"
        
        for challenge in CHALLENGES:
            if check_match_in_text(challenge, combined_text):
                matches[challenge].append(loan.name)
    
    return matches

def check_tech_matches():
    """Check which challenges have matching technologies"""
    techs = Technology.objects.all()
    matches = {challenge: [] for challenge in CHALLENGES}
    
    for tech in techs:
        combined_text = f"{tech.name} {tech.category} {tech.technical_requirements} {tech.training_needs}"
        
        for challenge in CHALLENGES:
            if check_match_in_text(challenge, combined_text):
                matches[challenge].append(tech.name)
    
    return matches

def check_user_selections():
    """Check which challenges users are selecting"""
    user_counts = Counter()
    
    for interest in FarmerInterest.objects.all():
        if interest.challenges:
            challenges = [c.strip() for c in interest.challenges.split(',') if c.strip()]
            for challenge in challenges:
                if challenge in CHALLENGES:
                    user_counts[challenge] += 1
    
    return user_counts

# Run the analysis
print("=== CHALLENGE MATCHING ANALYSIS ===\n")

# Check matches
scheme_matches = check_scheme_matches()
loan_matches = check_loan_matches()
tech_matches = check_tech_matches()
user_counts = check_user_selections()

# Calculate total matches
total_matches = {challenge: len(scheme_matches[challenge]) + 
                         len(loan_matches[challenge]) + 
                         len(tech_matches[challenge]) 
                for challenge in CHALLENGES}

# Print summary table
print(f"{'CHALLENGE':<30} | {'SCHEMES':<8} | {'LOANS':<8} | {'TECH':<8} | {'TOTAL':<8} | {'USERS':<8}")
print(f"{'-' * 30}-|{'-' * 9}|{'-' * 9}|{'-' * 9}|{'-' * 9}|{'-' * 9}")

for challenge in CHALLENGES:
    scheme_count = len(scheme_matches[challenge])
    loan_count = len(loan_matches[challenge])
    tech_count = len(tech_matches[challenge])
    total = total_matches[challenge]
    user_count = user_counts[challenge]
    
    print(f"{challenge:<30} | {scheme_count:<8} | {loan_count:<8} | {tech_count:<8} | {total:<8} | {user_count:<8}")

# Analyze challenge coverage
print("\n--- CHALLENGE COVERAGE ANALYSIS ---")
for challenge in CHALLENGES:
    total = total_matches[challenge]
    
    if total >= 10:
        rating = "Excellent"
    elif total >= 5:
        rating = "Good"
    elif total >= 2:
        rating = "Fair"
    else:
        rating = "Poor"
    
    print(f"{challenge}: {rating} coverage")

# Print examples for each challenge
print("\n--- EXAMPLES FOR EACH CHALLENGE ---")
for challenge in CHALLENGES:
    print(f"\n{challenge}:")
    
    if scheme_matches[challenge]:
        print(f"  Schemes: {', '.join(scheme_matches[challenge][:3])}")
    else:
        print("  Schemes: None")
        
    if loan_matches[challenge]:
        print(f"  Loans: {', '.join(loan_matches[challenge][:3])}")
    else:
        print("  Loans: None")
        
    if tech_matches[challenge]:
        print(f"  Technologies: {', '.join(tech_matches[challenge][:3])}")
    else:
        print("  Technologies: None")

# Recommendation
print("\n--- RECOMMENDATION ---")
poor_challenges = [c for c in CHALLENGES if total_matches[c] < 2]
good_challenges = [c for c in CHALLENGES if total_matches[c] >= 5]

print(f"Keep these challenges (good coverage): {', '.join(good_challenges)}")
if poor_challenges:
    print(f"Consider replacing or improving these challenges (poor coverage): {', '.join(poor_challenges)}")
else:
    print("All challenges have adequate coverage.") 