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

def check_govt_scheme_matches():
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

def suggest_new_challenges():
    """Suggest new challenges based on frequent terms in the database"""
    schemes = GovernmentScheme.objects.all()
    loans = LoanOption.objects.all()
    
    all_text = ""
    for scheme in schemes:
        all_text += f" {scheme.name} {scheme.detailed_description} {scheme.benefits} {scheme.eligibility_criteria}"
    
    for loan in loans:
        all_text += f" {loan.name} {loan.loan_type} {loan.special_features} {loan.eligibility}"
    
    # Extract potential keywords from text
    common_terms = Counter()
    words = all_text.lower().split()
    for word in words:
        if len(word) > 5 and word not in [c.lower() for c in CHALLENGES]:
            common_terms[word] += 1
    
    return [term for term, count in common_terms.most_common(15) if count > 5]

# Run the analysis
print("=== CHALLENGE MATCHING ANALYSIS ===\n")

# Check government scheme matches
scheme_matches = check_govt_scheme_matches()
print("GOVERNMENT SCHEME MATCHES:")
for challenge, schemes in scheme_matches.items():
    print(f"{challenge}: {len(schemes)} matches")
    if len(schemes) > 0:
        print(f"  Examples: {', '.join(schemes[:3])}")
print()

# Check loan matches
loan_matches = check_loan_matches()
print("LOAN OPTION MATCHES:")
for challenge, loans in loan_matches.items():
    print(f"{challenge}: {len(loans)} matches")
    if len(loans) > 0:
        print(f"  Examples: {', '.join(loans[:3])}")
print()

# Evaluate which challenges have good coverage
print("CHALLENGE COVERAGE ANALYSIS:")
for challenge in CHALLENGES:
    scheme_count = len(scheme_matches[challenge])
    loan_count = len(loan_matches[challenge])
    total = scheme_count + loan_count
    
    if total >= 10:
        rating = "Excellent"
    elif total >= 5:
        rating = "Good"
    elif total >= 2:
        rating = "Fair"
    else:
        rating = "Poor"
    
    print(f"{challenge}: {rating} coverage ({scheme_count} schemes, {loan_count} loans)")
print()

# Suggest potential new challenges
print("POTENTIAL NEW CHALLENGES BASED ON DATABASE CONTENT:")
potential_terms = suggest_new_challenges()
print(f"{', '.join(potential_terms)}")
print()

print("RECOMMENDATION:")
poor_challenges = [c for c in CHALLENGES if len(scheme_matches[c]) + len(loan_matches[c]) < 2]
good_challenges = [c for c in CHALLENGES if len(scheme_matches[c]) + len(loan_matches[c]) >= 5]

print(f"Keep these challenges (good matches): {', '.join(good_challenges)}")
if poor_challenges:
    print(f"Consider replacing these challenges (poor matches): {', '.join(poor_challenges)}")
else:
    print("All current challenges have adequate matches in the database.") 