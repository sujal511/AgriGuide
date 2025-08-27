#!/usr/bin/env python
import os
import django
from collections import Counter

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

# Import models
from main_app.models import GovernmentScheme, LoanOption

# List of challenges shown in the frontend
CHALLENGES = [
    "Water Scarcity",
    "Pest Management",
    "Disease Control",
    "Market Access",
    "Price Volatility",
    "Labor Shortage",
    "Input Costs",
    "Climate Change Effects",
    "Soil Degradation",
    "Financial Constraints"
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
    
    # Keyword matching
    keywords = {
        "Water Scarcity": ["water", "irrigation", "drought", "rain", "rainfall", "moisture"],
        "Pest Management": ["pest", "insect", "fungicide", "pesticide", "insecticide", "crop protection"],
        "Disease Control": ["disease", "blight", "pathogen", "fungal", "bacterial", "viral", "infection"],
        "Market Access": ["market", "selling", "trade", "export", "buyer", "mandi", "marketplace"],
        "Price Volatility": ["price", "fluctuation", "volatile", "rate", "value", "cost variation"],
        "Labor Shortage": ["labor", "worker", "manpower", "workforce", "employment", "labour"],
        "Input Costs": ["input", "seed", "fertilizer", "cost", "expense", "investment"],
        "Climate Change Effects": ["climate", "weather", "temperature", "global warming", "extreme"],
        "Soil Degradation": ["soil", "erosion", "fertility", "degradation", "land quality", "nutrient"],
        "Financial Constraints": ["finance", "loan", "credit", "funding", "capital", "money", "financial"]
    }
    
    challenge_keywords = keywords.get(challenge, [])
    for keyword in challenge_keywords:
        if keyword in text:
            return True
    
    return False

# Count matches for each challenge
scheme_counts = {challenge: 0 for challenge in CHALLENGES}
loan_counts = {challenge: 0 for challenge in CHALLENGES}

# Check government schemes
for scheme in GovernmentScheme.objects.all():
    combined_text = f"{scheme.name} {scheme.detailed_description} {scheme.benefits} {scheme.eligibility_criteria}"
    for challenge in CHALLENGES:
        if check_match_in_text(challenge, combined_text):
            scheme_counts[challenge] += 1

# Check loans
for loan in LoanOption.objects.all():
    combined_text = f"{loan.name} {loan.loan_type} {loan.special_features} {loan.eligibility}"
    for challenge in CHALLENGES:
        if check_match_in_text(challenge, combined_text):
            loan_counts[challenge] += 1

# Print summary table
print("Challenge | Schemes | Loans | Total | Rating")
print("---------|---------|-------|-------|-------")

for challenge in CHALLENGES:
    scheme_count = scheme_counts[challenge]
    loan_count = loan_counts[challenge]
    total = scheme_count + loan_count
    
    if total >= 10:
        rating = "Excellent"
    elif total >= 5:
        rating = "Good"
    elif total >= 2:
        rating = "Fair"
    else:
        rating = "Poor"
    
    print(f"{challenge:<25} | {scheme_count:<7} | {loan_count:<5} | {total:<5} | {rating}")

# Print recommendation
poor_challenges = [c for c in CHALLENGES if scheme_counts[c] + loan_counts[c] < 2]
good_challenges = [c for c in CHALLENGES if scheme_counts[c] + loan_counts[c] >= 5]

print("\nRECOMMENDATION:")
print(f"Keep: {', '.join(good_challenges)}")
if poor_challenges:
    print(f"Consider replacing: {', '.join(poor_challenges)}") 