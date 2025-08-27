#!/usr/bin/env python
import os
import django
from collections import Counter

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

# Import models
from main_app.models import (
    FarmerProfile, FarmDetail, FarmingExperience, FinancialInfo,
    GovernmentScheme, LoanOption, FarmerInterest, Crop
)
from main_app.views import get_scheme_recommendations, get_loan_recommendations

print("### RECOMMENDATION ALGORITHM IMPROVEMENT ###")

# 1. Analyze current data
govt_schemes = GovernmentScheme.objects.all()
loan_options = LoanOption.objects.all()
farmers = FarmerProfile.objects.all()

print(f"\n1. DATA ANALYSIS:")
print(f"- Total government schemes: {govt_schemes.count()}")
print(f"- Total loan options: {loan_options.count()}")
print(f"- Total farmers: {farmers.count()}")

# Check for data quality issues in government schemes
print("\n2. GOVERNMENT SCHEME DATA QUALITY:")
empty_fields = Counter()
for scheme in govt_schemes:
    for field in ['name', 'implementing_agency', 'eligibility_criteria', 'benefits', 
                  'application_process', 'documents_required', 'district_availability',
                  'crop_applicability', 'detailed_description']:
        if not getattr(scheme, field):
            empty_fields[field] += 1

print("Missing fields in government schemes:")
for field, count in empty_fields.items():
    print(f"- {field}: {count} records ({int(count/govt_schemes.count()*100)}%)")

# Check for data quality issues in loan options
print("\n3. LOAN OPTIONS DATA QUALITY:")
empty_loan_fields = Counter()
for loan in loan_options:
    for field in ['name', 'provider', 'loan_type', 'interest_rate', 'max_amount',
                  'tenure', 'eligibility', 'documents_required', 'processing_time',
                  'special_features']:
        if not getattr(loan, field):
            empty_loan_fields[field] += 1

print("Missing fields in loan options:")
for field, count in empty_loan_fields.items():
    print(f"- {field}: {count} records ({int(count/loan_options.count()*100)}%)")

# Test recommendation algorithms
print("\n4. TESTING RECOMMENDATIONS:")

# Get a test farmer with complete profile
test_farmers = []
for farmer in farmers:
    has_farm_details = FarmDetail.objects.filter(farmer=farmer).exists()
    has_financial_info = FinancialInfo.objects.filter(farmer=farmer).exists()
    has_farming_exp = FarmingExperience.objects.filter(farmer=farmer).exists()
    
    if has_farm_details and has_financial_info and has_farming_exp:
        test_farmers.append(farmer)

if test_farmers:
    test_farmer = test_farmers[0]
    print(f"\nTest farmer: {test_farmer.first_name} {test_farmer.last_name} (ID: {test_farmer.id})")
    
    # Get farmer details
    farm_details = FarmDetail.objects.filter(farmer=test_farmer).first()
    financial_info = FinancialInfo.objects.filter(farmer=test_farmer).first()
    farming_exp = FarmingExperience.objects.filter(farmer=test_farmer)
    interests = FarmerInterest.objects.filter(farmer=test_farmer).first()
    
    print(f"- District: {test_farmer.district}")
    print(f"- Land ownership: {farm_details.land_ownership if farm_details else 'Unknown'}")
    print(f"- Farm size: {farm_details.farm_size if farm_details else 'Unknown'} {farm_details.unit if farm_details else ''}")
    print(f"- Soil type: {farm_details.soil_type if farm_details else 'Unknown'}")
    print(f"- Income level: {financial_info.annual_income if financial_info else 'Unknown'}")
    print(f"- Crops grown: {', '.join([exp.crop.name for exp in farming_exp]) if farming_exp else 'None'}")
    print(f"- Challenges: {interests.challenges if interests and interests.challenges else 'None'}")
    
    # Test scheme recommendations
    print("\n5. CURRENT SCHEME RECOMMENDATIONS:")
    schemes = get_scheme_recommendations(test_farmer)
    for i, scheme in enumerate(schemes[:5]):
        print(f"{i+1}. {scheme['scheme'].name} - Relevance: {scheme.get('relevance', 'Unknown')}")
        print(f"   Agency: {scheme['scheme'].implementing_agency}")
        print(f"   Priority: {scheme.get('priority', 0)}")
        print(f"   Score: {scheme.get('relevance_score', 0)}")
    
    # Test loan recommendations
    print("\n6. CURRENT LOAN RECOMMENDATIONS:")
    if financial_info:
        loans = get_loan_recommendations(test_farmer, financial_info)
        for i, loan in enumerate(loans[:5]):
            print(f"{i+1}. {loan['loan'].name} - Relevance: {loan.get('relevance', 'Unknown')}")
            print(f"   Provider: {loan['loan'].provider}")
            print(f"   Interest: {loan['loan'].interest_rate}")
            print(f"   Priority: {loan.get('priority', 0)}")
            print(f"   Reasons: {', '.join(loan.get('reasons', []))[:100]}...")
    else:
        print("No financial info available for this farmer.")
else:
    print("No farmers with complete profiles found for testing.")

print("\n### ALGORITHM IMPROVEMENT RECOMMENDATIONS ###")

# 7. Suggest improvements
print("\n7. GOVT SCHEME ALGORITHM IMPROVEMENTS:")
print("""
1. Add keyword-based matching for scheme names and descriptions:
   - Use full-text search to match farmer's crops, challenges with scheme text
   - Use stemming/lemmatization for better matching (e.g., "irrigation" matches "irrigate")

2. Location-based precision:
   - Improve district matching with fuzzy matching for district names
   - Add taluka-level matching if data available

3. Increase weight for direct crop matches:
   - Increase priority score from 3 to 5 for direct crop matches
   - Add partial matching for crop families/categories

4. Seasonality improvements:
   - Match current season with scheme timing for better relevance
   - Consider crop growth stage with seasonal schemes

5. Add eligibility pre-check:
   - Flag schemes where farmer clearly doesn't meet eligibility
   - Highlight missing documentation farmer would need
""")

print("\n8. LOAN ALGORITHM IMPROVEMENTS:")
print("""
1. Better interest rate analysis:
   - Parse interest rates more robustly (handling ranges, special characters)
   - Compare rates against current RBI baseline for better scoring

2. Loan amount right-sizing:
   - Calculate appropriate loan amounts based on farm size and crops grown
   - Flag if loan amount is too small or large for farmer's needs

3. Financial health checks:
   - Consider debt-to-income ratio if previous loans exist
   - Scale recommendations based on repayment capacity

4. Purpose-specific matching:
   - Match loans with specific farming activities (equipment purchase, land development, etc.)
   - Consider seasonal cash flow needs based on crops grown

5. Add provider reliability metrics:
   - Include disbursal speed data if available
   - Add customer satisfaction metrics for lenders
""")

print("\n9. GENERAL IMPROVEMENTS:")
print("""
1. Increase transparency:
   - Show farmers exactly why each scheme/loan was recommended
   - Include clear eligibility checklist

2. Improve data quality:
   - Fill in missing fields in scheme and loan data
   - Standardize naming conventions and eligibility criteria format

3. Add feedback mechanism:
   - Let farmers rate recommendations
   - Use this feedback to improve algorithm
   
4. Implement machine learning:
   - Use farmer profiles and feedback to train recommendation model
   - Personalize recommendations based on similar farmers' preferences
""")

print("\nAnalysis complete. Implement these improvements to enhance recommendation accuracy.") 