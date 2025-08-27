#!/usr/bin/env python
import os
import sys
import django
from collections import Counter

# Set up Django environment - try different settings paths
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
    django.setup()
except Exception as e:
    print(f"Failed with first settings path: {e}")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
        django.setup()
    except Exception as e:
        print(f"Failed with second settings path: {e}")

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

# Count matches for each challenge
scheme_counts = {challenge: 0 for challenge in CHALLENGES}
loan_counts = {challenge: 0 for challenge in CHALLENGES}
tech_counts = {challenge: 0 for challenge in CHALLENGES}

# Check government schemes
print(f"Analyzing Government Schemes...")
for scheme in GovernmentScheme.objects.all():
    combined_text = f"{scheme.name} {scheme.detailed_description} {scheme.benefits} {scheme.eligibility_criteria}"
    for challenge in CHALLENGES:
        if check_match_in_text(challenge, combined_text):
            scheme_counts[challenge] += 1

# Check loans
print(f"Analyzing Loan Options...")
for loan in LoanOption.objects.all():
    combined_text = f"{loan.name} {loan.loan_type} {loan.special_features} {loan.eligibility}"
    for challenge in CHALLENGES:
        if check_match_in_text(challenge, combined_text):
            loan_counts[challenge] += 1

# Check technologies
print(f"Analyzing Technologies...")
for tech in Technology.objects.all():
    combined_text = f"{tech.name} {tech.category} {tech.technical_requirements} {tech.training_needs}"
    for challenge in CHALLENGES:
        if check_match_in_text(challenge, combined_text):
            tech_counts[challenge] += 1

# Check user selections
user_selections = Counter()
total_users_with_challenges = 0

print(f"Analyzing User Selections...")
for interest in FarmerInterest.objects.all():
    if interest.challenges:
        total_users_with_challenges += 1
        challenges = [c.strip() for c in interest.challenges.split(',') if c.strip()]
        for challenge in challenges:
            user_selections[challenge] += 1

# Calculate total schemes, loans, and technologies
total_schemes = GovernmentScheme.objects.count()
total_loans = LoanOption.objects.count()
total_techs = Technology.objects.count()

print("\n=== CHALLENGE ANALYSIS SUMMARY ===\n")
print(f"Database contains: {total_schemes} schemes, {total_loans} loan options, {total_techs} technologies")
print(f"Users with challenge data: {total_users_with_challenges}\n")

# Print summary table with percentage coverage
print(f"{'Challenge':<30} | {'Schemes':<8} | {'Loans':<8} | {'Tech':<8} | {'Total':<8} | {'Users':<8} | {'Rating'}")
print(f"{'-' * 30}-|{'-' * 10}|{'-' * 10}|{'-' * 10}|{'-' * 10}|{'-' * 10}|{'-' * 10}")

for challenge in CHALLENGES:
    scheme_count = scheme_counts[challenge]
    loan_count = loan_counts[challenge]
    tech_count = tech_counts[challenge]
    total = scheme_count + loan_count + tech_count
    user_count = user_selections[challenge]
    
    # Calculate percentages
    scheme_pct = f"{(scheme_count / total_schemes * 100):.1f}%" if total_schemes > 0 else "0%"
    loan_pct = f"{(loan_count / total_loans * 100):.1f}%" if total_loans > 0 else "0%" 
    tech_pct = f"{(tech_count / total_techs * 100):.1f}%" if total_techs > 0 else "0%"
    user_pct = f"{(user_count / total_users_with_challenges * 100):.1f}%" if total_users_with_challenges > 0 else "0%"
    
    if total >= 10:
        rating = "Excellent"
    elif total >= 5:
        rating = "Good"
    elif total >= 2:
        rating = "Fair"
    else:
        rating = "Poor"
    
    print(f"{challenge:<30} | {scheme_count:<3} {scheme_pct:<4} | {loan_count:<3} {loan_pct:<4} | {tech_count:<3} {tech_pct:<4} | {total:<8} | {user_count:<3} {user_pct:<4} | {rating}")

# Print recommendation
poor_challenges = [c for c in CHALLENGES if scheme_counts[c] + loan_counts[c] + tech_counts[c] < 2]
good_challenges = [c for c in CHALLENGES if scheme_counts[c] + loan_counts[c] + tech_counts[c] >= 5]
popular_challenges = [c for c, count in user_selections.most_common(5) if count > 0]

print("\n=== RECOMMENDATIONS ===")
print(f"\nStrongest matches (most recommendations):")
for challenge in sorted(good_challenges, key=lambda c: scheme_counts[c] + loan_counts[c] + tech_counts[c], reverse=True)[:5]:
    count = scheme_counts[challenge] + loan_counts[challenge] + tech_counts[challenge]
    print(f"- {challenge}: {count} recommendations")

if poor_challenges:
    print(f"\nWeakest matches (fewest recommendations):")
    for challenge in sorted(poor_challenges, key=lambda c: scheme_counts[c] + loan_counts[c] + tech_counts[c])[:5]:
        count = scheme_counts[challenge] + loan_counts[challenge] + tech_counts[challenge]
        print(f"- {challenge}: {count} recommendations")

if popular_challenges:
    print(f"\nMost selected by users:")
    for challenge in popular_challenges:
        print(f"- {challenge}: {user_selections[challenge]} users")

# Identify overlapping challenges that might be redundant
print("\n=== CHALLENGE OVERLAP ANALYSIS ===")
high_overlap = []
for i, challenge1 in enumerate(CHALLENGES):
    for challenge2 in CHALLENGES[i+1:]:
        # If both challenges match similar schemes and loans
        scheme_overlap = sum(1 for scheme in GovernmentScheme.objects.all() 
                           if check_match_in_text(challenge1, scheme.name + " " + scheme.benefits) and 
                              check_match_in_text(challenge2, scheme.name + " " + scheme.benefits))
        
        loan_overlap = sum(1 for loan in LoanOption.objects.all() 
                         if check_match_in_text(challenge1, loan.name + " " + loan.special_features) and 
                            check_match_in_text(challenge2, loan.name + " " + loan.special_features))
        
        total_overlap = scheme_overlap + loan_overlap
        if total_overlap > 3:  # Arbitrary threshold
            overlap_pct = (total_overlap / (scheme_counts[challenge1] + loan_counts[challenge1] + scheme_counts[challenge2] + loan_counts[challenge2])) * 100
            high_overlap.append((challenge1, challenge2, total_overlap, f"{overlap_pct:.1f}%"))

if high_overlap:
    print("\nPotentially redundant challenge pairs:")
    for c1, c2, count, pct in sorted(high_overlap, key=lambda x: x[2], reverse=True)[:5]:
        print(f"- {c1} & {c2}: {count} overlapping matches ({pct})")
else:
    print("\nNo significant overlap detected between challenges.")

print("\nAnalysis complete!") 