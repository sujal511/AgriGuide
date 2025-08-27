#!/usr/bin/env python
import os
import django
import json
from collections import Counter, defaultdict
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

# Import models
from main_app.models import (
    GovernmentScheme, LoanOption, FarmerProfile, FarmerInterest,
    FarmDetail, FinancialInfo
)
from django.core.exceptions import ObjectDoesNotExist

# ANSI colors for better output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")

def print_subheader(text):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.BLUE}{'-' * len(text)}{Colors.ENDC}\n")

def extract_challenge_keywords():
    """Extract challenge keywords from the views.py file"""
    try:
        with open('main_app/views.py', 'r') as file:
            content = file.read()
            
        # Find challenge keyword dictionaries
        scheme_keywords_start = content.find("challenge_keywords = {", content.find("def get_scheme_recommendations"))
        scheme_keywords_end = content.find("}", scheme_keywords_start) + 1
        
        loan_keywords_start = content.find("challenge_keywords = {", content.find("def get_loan_recommendations"))
        loan_keywords_end = content.find("}", loan_keywords_start) + 1
        
        # Extract and parse the dictionaries
        scheme_keywords_text = content[scheme_keywords_start:scheme_keywords_end]
        loan_keywords_text = content[loan_keywords_start:loan_keywords_end]
        
        # This is a simplification - actual parsing would be more complex
        scheme_keywords = {}
        loan_keywords = {}
        
        # Parse scheme keywords manually
        lines = scheme_keywords_text.split('\n')
        current_key = None
        for line in lines:
            if ":" in line and "[" in line:
                parts = line.split(":", 1)
                key = parts[0].strip().strip("'").strip('"')
                current_key = key
                scheme_keywords[key] = []
            elif current_key and "]" not in line and "[" not in line and "," in line:
                value = line.strip().strip("'").strip('"').strip(",")
                if value:
                    scheme_keywords[current_key].append(value)
        
        # Parse loan keywords similarly
        lines = loan_keywords_text.split('\n')
        current_key = None
        for line in lines:
            if ":" in line and "[" in line:
                parts = line.split(":", 1)
                key = parts[0].strip().strip("'").strip('"')
                current_key = key
                loan_keywords[key] = []
            elif current_key and "]" not in line and "[" not in line and "," in line:
                value = line.strip().strip("'").strip('"').strip(",")
                if value:
                    loan_keywords[current_key].append(value)
                    
        return scheme_keywords, loan_keywords
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return {}, {}

def find_keyword_overlaps(scheme_keywords, loan_keywords):
    """Find overlaps in challenge keywords"""
    all_keywords = scheme_keywords.copy()
    
    # Merge loan keywords if they don't exist in scheme keywords
    for key, values in loan_keywords.items():
        if key in all_keywords:
            # Add any new values
            all_keywords[key] = list(set(all_keywords[key] + values))
        else:
            all_keywords[key] = values
    
    # Find overlaps
    keyword_to_challenges = defaultdict(list)
    for challenge, keywords in all_keywords.items():
        for keyword in keywords:
            keyword_to_challenges[keyword].append(challenge)
    
    overlaps = {k: v for k, v in keyword_to_challenges.items() if len(v) > 1}
    return overlaps

def find_urgent_challenges():
    """Find urgent challenges from the loan recommendation function"""
    try:
        with open('main_app/views.py', 'r') as file:
            content = file.read()
        
        # Find urgent challenges list
        urgent_start = content.find("urgent_challenges = [", content.find("def get_loan_recommendations"))
        urgent_end = content.find("]", urgent_start) + 1
        
        urgent_text = content[urgent_start:urgent_end]
        
        # Extract challenges from text
        challenges = []
        parts = urgent_text.split("[")[1].split("]")[0].split(",")
        for part in parts:
            clean = part.strip().strip("'").strip('"')
            if clean:
                challenges.append(clean)
                
        return challenges
    except Exception as e:
        print(f"Error extracting urgent challenges: {e}")
        return []

def analyze_priority_weights():
    """Analyze how priorities are weighted in the recommendation functions"""
    try:
        with open('main_app/views.py', 'r') as file:
            content = file.read()
        
        scheme_priority_weights = {}
        loan_priority_weights = {}
        
        # Find priority weightings in scheme recommendations
        scheme_func = content[content.find("def get_scheme_recommendations"):content.find("def get_loan_recommendations")]
        
        # Look for priority += X patterns
        priority_patterns = scheme_func.split("priority += ")
        for i in range(1, len(priority_patterns)):
            line = priority_patterns[i].split("\n")[0]
            weight = line.strip()
            context = scheme_func.split("priority += " + weight)[0].split("\n")[-2:][0]
            scheme_priority_weights[context.strip()] = int(weight)
        
        # Similar for loan recommendations
        loan_func = content[content.find("def get_loan_recommendations"):content.find("def farmer_scheme_recommendations")]
        
        # Look for priority += X patterns
        priority_patterns = loan_func.split("priority += ")
        for i in range(1, len(priority_patterns)):
            line = priority_patterns[i].split("\n")[0]
            weight = line.strip()
            context = loan_func.split("priority += " + weight)[0].split("\n")[-2:][0]
            loan_priority_weights[context.strip()] = int(weight)
            
        return scheme_priority_weights, loan_priority_weights
    except Exception as e:
        print(f"Error analyzing priority weights: {e}")
        return {}, {}

def get_available_challenges():
    """Get list of all challenges from FarmerProfileSetup component"""
    try:
        # Try to get challenges from the models.py file instead
        from main_app.models import FarmerInterest, FarmerProfile
        
        # Get all distinct challenges from the database
        challenges = set()
        
        # Get all farmer interest objects
        interests = FarmerInterest.objects.all()
        for interest in interests:
            if interest.challenges:
                # Split challenges by comma
                for challenge in interest.challenges.split(','):
                    challenge = challenge.strip()
                    if challenge:
                        challenges.add(challenge)
        
        # If no challenges found in database, use hardcoded list
        if not challenges:
            challenges = [
                'Water Scarcity', 'Market Access', 'Price Volatility',
                'Input Costs', 'Financial Constraints', 'Credit Access',
                'Irrigation Management', 'Crop Financing', 'Seed Quality',
                'Technology Access', 'Collateral Requirements', 'High Interest Rates',
                'Processing Delays', 'Seasonal Cash Flow', 'Documentation Complexity',
                'Limited Credit History', 'Infrastructure Development',
                'Farm Mechanization Costs', 'Post-harvest Financing',
                'Loan Repayment Flexibility'
            ]
        
        return sorted(list(challenges))
    except Exception as e:
        print(f"Error getting available challenges: {e}")
        return []

def test_recommendation_functions():
    """Test if recommendation functions are importable"""
    try:
        # First try to import the functions
        from main_app.views import get_scheme_recommendations, get_loan_recommendations
        print(f"{Colors.GREEN}✓ Successfully imported recommendation functions{Colors.ENDC}")
        
        # Check their implementation
        print(f"{Colors.CYAN}Analyzing recommendation functions...{Colors.ENDC}")
        
        # Get the implementation of get_scheme_recommendations
        from inspect import getsource
        scheme_rec_source = getsource(get_scheme_recommendations)
        loan_rec_source = getsource(get_loan_recommendations)
        
        # Check for the keyword overlap
        irrigation_keywords = []
        water_scarcity_keywords = []
        
        if "Irrigation Management" in scheme_rec_source:
            irrigation_section = scheme_rec_source.split("'Irrigation Management':", 1)[1].split("]", 1)[0]
            irrigation_keywords = [k.strip().strip("'").strip('"') for k in irrigation_section.split(",")]
            irrigation_keywords = [k for k in irrigation_keywords if k]
        
        if "Water Scarcity" in scheme_rec_source:
            water_section = scheme_rec_source.split("'Water Scarcity':", 1)[1].split("]", 1)[0]
            water_scarcity_keywords = [k.strip().strip("'").strip('"') for k in water_section.split(",")]
            water_scarcity_keywords = [k for k in water_scarcity_keywords if k]
        
        # Check for overlaps
        overlaps = set(irrigation_keywords) & set(water_scarcity_keywords)
        if overlaps:
            print(f"{Colors.WARNING}Found overlapping keywords between 'Irrigation Management' and 'Water Scarcity':{Colors.ENDC}")
            print(f"  {', '.join(overlaps)}")
        
        return True
    except ImportError as e:
        print(f"{Colors.FAIL}✗ Failed to import recommendation functions: {e}{Colors.ENDC}")
        print(f"{Colors.WARNING}Continuing with analysis without simulation...{Colors.ENDC}")
        return False
    except Exception as e:
        print(f"{Colors.FAIL}✗ Error analyzing recommendation functions: {e}{Colors.ENDC}")
        return True

def main():
    print_header("RECOMMENDATION SYSTEM ANALYSIS")
    
    # Extract challenge keywords
    print_subheader("CHALLENGE KEYWORD MAPPING")
    scheme_keywords, loan_keywords = extract_challenge_keywords()
    
    print(f"{Colors.CYAN}Scheme Challenge Keywords:{Colors.ENDC}")
    for challenge, keywords in scheme_keywords.items():
        print(f"  {Colors.BOLD}{challenge}:{Colors.ENDC} {', '.join(keywords)}")
        
    print(f"\n{Colors.CYAN}Loan Challenge Keywords:{Colors.ENDC}")
    for challenge, keywords in loan_keywords.items():
        print(f"  {Colors.BOLD}{challenge}:{Colors.ENDC} {', '.join(keywords)}")
    
    # Find keyword overlaps
    print_subheader("KEYWORD OVERLAPS (POTENTIAL ISSUES)")
    overlaps = find_keyword_overlaps(scheme_keywords, loan_keywords)
    
    for keyword, challenges in overlaps.items():
        if len(challenges) > 1:
            print(f"{Colors.WARNING}Keyword '{keyword}' is used in multiple challenges:{Colors.ENDC} {', '.join(challenges)}")
    
    # Find urgent challenges
    print_subheader("URGENT CHALLENGES (SPECIAL TREATMENT)")
    urgent_challenges = find_urgent_challenges()
    
    print(f"{Colors.CYAN}The following challenges receive special 'urgent' treatment:{Colors.ENDC}")
    for challenge in urgent_challenges:
        print(f"  {Colors.WARNING}- {challenge}{Colors.ENDC}")
        
    # Analyze priority weights
    print_subheader("PRIORITY WEIGHTING ANALYSIS")
    scheme_weights, loan_weights = analyze_priority_weights()
    
    print(f"{Colors.CYAN}Scheme Priority Weights:{Colors.ENDC}")
    for context, weight in scheme_weights.items():
        print(f"  {Colors.BOLD}{context}:{Colors.ENDC} +{weight} priority points")
        
    print(f"\n{Colors.CYAN}Loan Priority Weights:{Colors.ENDC}")
    for context, weight in loan_weights.items():
        print(f"  {Colors.BOLD}{context}:{Colors.ENDC} +{weight} priority points")
    
    # Get all available challenges
    print_subheader("AVAILABLE CHALLENGES")
    challenges = get_available_challenges()
    
    print(f"{Colors.CYAN}The following {len(challenges)} challenges are available for selection:{Colors.ENDC}")
    for i, challenge in enumerate(challenges):
        print(f"  {i+1}. {challenge}")
    
    # Test if we can import the recommendation functions
    print_subheader("FUNCTION TEST")
    can_import_functions = test_recommendation_functions()
    
    # Generate insights
    print_subheader("INSIGHTS AND RECOMMENDATIONS")
    
    # Analyze keyword issues
    print(f"{Colors.CYAN}Issues identified:{Colors.ENDC}")
    
    if overlaps:
        print(f"\n{Colors.WARNING}1. Keyword Overlap Issues:{Colors.ENDC}")
        print("   The following keywords appear in multiple challenges and cause bias:")
        overlap_count = 0
        for keyword, challenges in overlaps.items():
            if len(challenges) > 1:
                print(f"   - '{keyword}' is shared by: {', '.join(challenges)}")
                overlap_count += 1
                if overlap_count >= 10:  # Limit to 10 examples
                    print(f"   ... and {len(overlaps) - 10} more overlapping keywords")
                    break
        print("\n   SOLUTION: Make keywords more specific to each challenge")
        
    if urgent_challenges:
        print(f"\n{Colors.WARNING}2. Urgent Challenges Special Treatment:{Colors.ENDC}")
        print("   These challenges receive special priority weighting:")
        for challenge in urgent_challenges:
            print(f"   - {challenge}")
        print("\n   SOLUTION: Either remove special treatment or extend it to all challenges")
    
    print(f"\n{Colors.WARNING}3. Priority Weight Imbalance:{Colors.ENDC}")
    print("   Different conditions receive very different priority weights")
    print("   SOLUTION: Standardize priority weights for similar conditions")
    
    print(f"\n{Colors.GREEN}Recommended Code Changes:{Colors.ENDC}")
    print("""
1. Modify challenge_keywords in both functions to reduce overlap:

```python
# In views.py, in get_scheme_recommendations and get_loan_recommendations:
challenge_keywords = {
    'Water Scarcity': ['drought', 'rainfall deficit', 'water shortage', 'lack of water'],
    'Irrigation Management': ['drip irrigation', 'sprinkler system', 'canal', 'water usage', 'water management'],
    'Financial Constraints': ['fund shortage', 'budget limits', 'monetary limitation', 'subsidy need'],
    'Credit Access': ['loan access', 'borrowing difficulty', 'credit approval', 'finance access'],
    # ... other challenges with more specific keywords
}
```

2. Balance the urgent_challenges list:

```python
# In views.py, in get_loan_recommendations:
urgent_challenges = [
    'Financial Constraints', 'Credit Access', 'Input Costs', 'Seasonal Cash Flow',
    'Water Scarcity', 'Market Access', 'Technology Access', 'Seed Quality',
    'Irrigation Management', 'High Interest Rates', 'Documentation Complexity'
]
```

3. Standardize priority weighting:

```python
# Instead of varying weights (10-12 for challenges, 5 for crop, etc.)
# Use consistent weights
if match_found:
    priority += 5  # Standard weight for any matched challenge
    relevance_score += 25
```

4. Reduce the critical score reduction for non-matching loans:

```python
# Instead of:
if not matched_challenges and farmer_challenges:
    loan_relevance_score *= 0.01  # Reduce score by 99% - effectively filtering out completely
    priority = -100  # Set very negative priority so these never come first

# Change to:
if not matched_challenges and farmer_challenges:
    loan_relevance_score *= 0.5  # Reduce score by only 50%
    priority -= 10  # Less severe priority reduction
```

5. Add diversity scoring to recommendations:

```python
# Add after recommendations are gathered
seen_challenges = set()
for rec in recommendations:
    unique_challenges = [c for c in rec['matched_challenges'] if c not in seen_challenges]
    if unique_challenges:
        rec['relevance_score'] += len(unique_challenges) * 10
        seen_challenges.update(unique_challenges)
```
""")

if __name__ == "__main__":
    main() 