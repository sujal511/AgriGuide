from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import (
    District, Crop, CropEconomics, Technology, GovernmentScheme, 
    LoanOption, OrganicPractice, PestDisease, SoilCropCompatibility,
    FertilizerRecommendation, IrrigationRequirement, FarmerProfile,
    FarmDetail, FarmingExperience, FinancialInfo, FarmerInterest
)
import logging
from django.contrib.auth import get_user_model
import datetime
from django.forms import model_to_dict
from django.contrib.auth.decorators import login_required, user_passes_test



# Recommendation functions

def get_crop_recommendations(farmer, farm_details):
    """Generate crop recommendations based on farmer profile and farm details"""
    crop_scores = {}  # Store scores for each crop
    
    # Get district information
    district_obj = District.objects.filter(name__iexact=farmer.district).first()
    
    # Get soil type
    soil_type = farm_details.soil_type
    
    # Get NPK values if available
    n_value = getattr(farm_details, 'nitrogen_value', None)
    p_value = getattr(farm_details, 'phosphorus_value', None)
    k_value = getattr(farm_details, 'potassium_value', None)
    ph_value = getattr(farm_details, 'ph_value', None)
    
    # Find crops suitable for this soil type
    suitable_crops = []
    
    # Check soil-crop compatibility by soil type only
    soil_compatibilities = SoilCropCompatibility.objects.filter(
        soil_type__icontains=soil_type
    ).order_by('-compatibility_score')
    
    # Initialize scores based on soil compatibility
    for compatibility in soil_compatibilities:
        crop = compatibility.crop
        suitable_crops.append(crop)
        # Base score from compatibility (scale 1-10 to 0-30)
        crop_scores[crop] = compatibility.compatibility_score * 3
    
    # If no specific compatibility data, fall back to crops mentioning this soil type
    if not suitable_crops:
        fallback_crops = Crop.objects.filter(
            suitable_soil_types__icontains=soil_type
        )
        for crop in fallback_crops:
            suitable_crops.append(crop)
            crop_scores[crop] = 15  # Medium base score
    
    # If still no suitable crops, include all crops with a lower base score
    if not suitable_crops:
        all_crops = Crop.objects.all()
        for crop in all_crops:
            suitable_crops.append(crop)
            crop_scores[crop] = 5  # Lower base score
    
    # Filter by season if preferred season is specified (0-15 points)
    if farmer.preferred_season:
        # Create a season mapping to handle all seasonal equivalences
        season_mapping = {
            'kharif': ['kharif', 'monsoon', 'rainy', 'rainy season', 'monsoon season'],
            'rabi': ['rabi', 'winter', 'winter season', 'post-monsoon'],
            'zaid': ['zaid', 'summer', 'summer season', 'pre-monsoon'],
            'year-round': ['year-round', 'annual', 'perennial', 'all seasons', 'any season']
        }
        
        # Also create a month mapping to handle crops with specific month mentions
        month_to_season = {
            'january': 'rabi',
            'february': 'rabi',
            'march': 'zaid',
            'april': 'zaid',
            'may': 'zaid',
            'june': 'kharif',
            'july': 'kharif',
            'august': 'kharif',
            'september': 'kharif',
            'october': 'rabi',
            'november': 'rabi',
            'december': 'rabi'
        }
        
        # Log the mapping we're using
        print(f"Season mapping used: {season_mapping}")
        print(f"Month-to-season mapping: {month_to_season}")
        
        preferred_seasons_list = [s.strip().lower() for s in farmer.preferred_season.split(',')]
        print(f"Farmer preferred seasons: {preferred_seasons_list}")
        
        for crop in list(suitable_crops):  # Create a copy to iterate
            crop_season_lower = crop.growing_season.lower()
            # Log the crop season we're examining
            print(f"Checking crop {crop.name} with season: {crop_season_lower}")
            
            season_match = False
            
            # Check if crop mentions specific months
            for month in month_to_season.keys():
                if month in crop_season_lower:
                    inferred_season = month_to_season[month]
                    if inferred_season in preferred_seasons_list:
                        print(f"Month match: {month} in {crop_season_lower} → {inferred_season}")
                        season_match = True
                        break
            
            if not season_match:
                for preferred_season in preferred_seasons_list:
                    # Check direct match of the season name
                    if preferred_season in crop_season_lower:
                        print(f"Direct season match: {preferred_season} in {crop_season_lower}")
                        season_match = True
                        break
                        
                    # Check through mapping (e.g., if Zaid is selected, also match Summer)
                    for season, aliases in season_mapping.items():
                        if preferred_season == season and any(alias in crop_season_lower for alias in aliases):
                            print(f"Alias match: {preferred_season} → {aliases} found in {crop_season_lower}")
                            season_match = True
                            break
            
            # Special case for "Year-round" selection - matches with any crop
            if 'year-round' in preferred_seasons_list:
                print(f"Year-round preference matches all crops including {crop.name}")
                season_match = True
                
            # Special case for crops that can grow in any season
            if any(alias in crop_season_lower for alias in season_mapping['year-round']):
                print(f"Crop {crop.name} can grow year-round, matching any season")
                season_match = True
            
            if season_match:
                crop_scores[crop] = crop_scores.get(crop, 0) + 15
                print(f"MATCH: Added 15 points to {crop.name}, new score: {crop_scores[crop]}")
            else:
                # Penalize crops that don't match the preferred season
                crop_scores[crop] = max(0, crop_scores.get(crop, 0) - 5)
                print(f"NO MATCH: Subtracted 5 points from {crop.name}, new score: {crop_scores[crop]}")
    
    # Filter by district climate if district info is available (0-10 points)
    if district_obj:
        for crop in list(suitable_crops):
            if (crop.min_temp_c <= district_obj.max_temp_c and crop.max_temp_c >= district_obj.min_temp_c):
                crop_scores[crop] = crop_scores.get(crop, 0) + 10
            # Penalize crops that don't match the climate
            else:
                crop_scores[crop] = max(0, crop_scores.get(crop, 0) - 5)
    
    # Apply NPK-based scoring if values are available (0-25 points)
    if all([n_value is not None, p_value is not None, k_value is not None]):
        for crop in list(suitable_crops):
            if hasattr(crop, 'n_requirement_kg_per_ha') and hasattr(crop, 'p_requirement_kg_per_ha') and hasattr(crop, 'k_requirement_kg_per_ha'):
                # Calculate NPK match score (higher is better)
                n_match = max(0, 100 - (abs(crop.n_requirement_kg_per_ha - n_value) / max(crop.n_requirement_kg_per_ha, 1) * 100))
                p_match = max(0, 100 - (abs(crop.p_requirement_kg_per_ha - p_value) / max(crop.p_requirement_kg_per_ha, 1) * 100))
                k_match = max(0, 100 - (abs(crop.k_requirement_kg_per_ha - k_value) / max(crop.k_requirement_kg_per_ha, 1) * 100))
                
                npk_score = (n_match + p_match + k_match) / 3
                crop_scores[crop] = crop_scores.get(crop, 0) + (npk_score * 0.25)  # Scale to 0-25
    
    # Consider pH compatibility (0-15 points)
    if ph_value is not None:
        for crop in list(suitable_crops):
            try:
                min_ph, max_ph = map(float, crop.ph_range.split('-'))
                if min_ph <= ph_value <= max_ph:
                    crop_scores[crop] = crop_scores.get(crop, 0) + 15
                else:
                    # Penalize crops outside the pH range
                    crop_scores[crop] = max(0, crop_scores.get(crop, 0) - 10)
            except (ValueError, AttributeError):
                pass  # Skip if pH range is not properly formatted
    
    # Consider irrigation requirements (0-15 points)
    irrigation_systems = farm_details.irrigation_systems.split(', ') if farm_details.irrigation_systems else []
    has_drip = 'Drip' in irrigation_systems
    has_sprinkler = 'Sprinkler' in irrigation_systems
    has_flood = 'Flood' in irrigation_systems
    
    for crop in list(suitable_crops):
        # Check crop water requirements
        water_req = crop.water_requirement_mm
        
        # Match irrigation system with crop needs
        if water_req < 500:
            crop_scores[crop] = crop_scores.get(crop, 0) + 15  # Low water requirement
        elif water_req < 1000 and (has_drip or has_sprinkler):
            crop_scores[crop] = crop_scores.get(crop, 0) + 10  # Medium water requirement with efficient irrigation
        elif water_req >= 1000 and has_drip:
            crop_scores[crop] = crop_scores.get(crop, 0) + 5  # High water requirement with drip
        elif has_flood:
            crop_scores[crop] = crop_scores.get(crop, 0) + 5  # Traditional irrigation
        else:
            # Penalize crops with high water requirements but no matching irrigation system
            if water_req >= 1000:
                crop_scores[crop] = max(0, crop_scores.get(crop, 0) - 10)
    
    # Consider farmer's experience (0-10 points)
    farmer_crops = FarmingExperience.objects.filter(farmer=farmer).values_list('crop__name', flat=True)
    for crop in list(suitable_crops):
        if crop.name in farmer_crops:
            crop_scores[crop] = crop_scores.get(crop, 0) + 10
    
    # Find max score for normalization
    max_possible_score = 125  # Maximum theoretical score based on all criteria
    
    # Consider economics and ROI (0-20 points)
    recommendations = []
    for crop in list(suitable_crops):
        try:
            economics = CropEconomics.objects.get(crop=crop)
            roi_score = min(20, float(economics.roi_percentage) / 5)  # Cap at 20 points
            crop_scores[crop] = crop_scores.get(crop, 0) + roi_score
            
            # Determine suitability based on total score
            total_score = crop_scores.get(crop, 0)
            
            # Normalize score to 100-point scale
            normalized_score = min(100, (total_score / max_possible_score) * 100)
            
            if normalized_score >= 70:
                suitability = 'High'
            elif normalized_score >= 40:
                suitability = 'Medium'
            else:
                suitability = 'Low'
            
            # Get recommended varieties for this crop - using crop varieties instead of soil compatibility varieties
            if crop.varieties:
                # If the crop has varieties listed, use those
                variety_list = [v.strip() for v in crop.varieties.split(',') if v.strip()]
                # Get the compatibility score from soil compatibility if available
                compatibility = SoilCropCompatibility.objects.filter(crop=crop, soil_type__icontains=soil_type).first()
                score = compatibility.compatibility_score if compatibility else 7  # Default score if no compatibility record
                recommended_varieties = [(variety, score, "Recommended for your soil type") 
                                        for variety in variety_list[:3]]
            else:
                recommended_varieties = []
            
            # Get water requirement category
            water_req_category = "Low"
            if crop.water_requirement_mm >= 1000:
                water_req_category = "High"
            elif crop.water_requirement_mm >= 500:
                water_req_category = "Medium"
                
            # Update rainfall range using crop_economics data if available
            if hasattr(economics, 'rainfall_range_min') and economics.rainfall_range_min is not None:
                rainfall_min = economics.rainfall_range_min
            else:
                rainfall_min = max(0, crop.water_requirement_mm - 100)
                
            if hasattr(economics, 'rainfall_range_max') and economics.rainfall_range_max is not None:
                rainfall_max = economics.rainfall_range_max
            else:
                rainfall_max = crop.water_requirement_mm + 100
            
            # Get drought resistance from crop_economics if available
            if hasattr(economics, 'drought_resistance') and economics.drought_resistance:
                drought_resistance = economics.drought_resistance
            else:
                drought_resistance = "High"
                if crop.water_requirement_mm >= 1000:
                    drought_resistance = "Low"
                elif crop.water_requirement_mm >= 500:
                    drought_resistance = "Medium"
            
            # Get additional fields from economics data
            growth_period = getattr(economics, 'growth_period', 'N/A')
            market_demand = getattr(economics, 'market_demand', 'N/A')
            ph_range = getattr(economics, 'ph_range', crop.ph_range)
            
            # Prioritize temperature and rainfall data from crop_economics.csv
            temp_min = getattr(economics, 'temperature_range_min', crop.min_temp_c)
            temp_max = getattr(economics, 'temperature_range_max', crop.max_temp_c)
            rainfall_min = getattr(economics, 'rainfall_range_min', rainfall_min)
            rainfall_max = getattr(economics, 'rainfall_range_max', rainfall_max)
            
            # Add scoring for temperature and rainfall match if the farmer has a district set
            if farmer.district:
                try:
                    district = District.objects.get(name__icontains=farmer.district)
                    
                    # Temperature match scoring (up to 10 points)
                    district_avg_temp = (district.min_temp_c + district.max_temp_c) / 2
                    crop_avg_temp = (temp_min + temp_max) / 2
                    temp_diff = abs(district_avg_temp - crop_avg_temp)
                    
                    if temp_diff <= 2:
                        crop_scores[crop] = crop_scores.get(crop, 0) + 10
                    elif temp_diff <= 4:
                        crop_scores[crop] = crop_scores.get(crop, 0) + 7
                    elif temp_diff <= 6:
                        crop_scores[crop] = crop_scores.get(crop, 0) + 4
                    
                    # Rainfall match scoring (up to 10 points)
                    if rainfall_min <= district.avg_annual_rainfall_mm <= rainfall_max:
                        crop_scores[crop] = crop_scores.get(crop, 0) + 10
                    elif abs(district.avg_annual_rainfall_mm - (rainfall_min + rainfall_max) / 2) <= 200:
                        crop_scores[crop] = crop_scores.get(crop, 0) + 5
                    
                    # Recalculate total and normalized scores after district adjustments
                    total_score = crop_scores.get(crop, 0)
                    normalized_score = min(100, (total_score / max_possible_score) * 100)
                except District.DoesNotExist:
                    pass
            
            notes = getattr(economics, 'notes', crop.cultivation_practices)
            
            # Get fertilizer recommendations for this crop and soil type
            fertilizer_data = FertilizerRecommendation.objects.filter(
                crop=crop, 
                soil_type__icontains=soil_type
            ).first()
            
            # Get irrigation requirements for this crop
            irrigation_data = IrrigationRequirement.objects.filter(crop=crop).all()
            irrigation_types = {}
            critical_stages = set()
            
            for irrigation in irrigation_data:
                irrigation_types[irrigation.growth_stage] = {
                    'water_quantity': irrigation.water_requirement_mm,
                    'interval': irrigation.irrigation_interval_days
                }
                if irrigation.critical_stages:
                    for stage in irrigation.critical_stages.split(','):
                        critical_stages.add(stage.strip())
            
            recommendations.append({
                'crop': crop,
                'economics': economics,
                'roi': economics.roi_percentage,
                'suitability': suitability,
                'score': normalized_score,  # Use normalized score here
                'recommended_varieties': recommended_varieties,
                'water_requirement': water_req_category,
                'rainfall_min': rainfall_min,
                'rainfall_max': rainfall_max,
                'drought_resistance': drought_resistance,
                'growth_period': growth_period,
                'market_demand': market_demand,
                'ph_range': ph_range,
                'temp_min': temp_min,
                'temp_max': temp_max,
                'notes': notes,
                'fertilizer': fertilizer_data,
                'irrigation': irrigation_data,
                'irrigation_types': irrigation_types,
                'critical_stages': list(critical_stages)
            })
        except CropEconomics.DoesNotExist:
            # If no economics data, still include but with lower priority
            total_score = crop_scores.get(crop, 0)
            normalized_score = min(100, (total_score / max_possible_score) * 100)
            suitability = 'Medium' if normalized_score >= 50 else 'Low'
            
            # Get water requirement category
            water_req_category = "Low"
            if crop.water_requirement_mm >= 1000:
                water_req_category = "High"
            elif crop.water_requirement_mm >= 500:
                water_req_category = "Medium"
                
            # Update rainfall range using crop_economics data if available
            rainfall_min = max(0, crop.water_requirement_mm - 100)
            rainfall_max = crop.water_requirement_mm + 100
            
            # Get drought resistance based on water requirements
            drought_resistance = "High"
            if crop.water_requirement_mm >= 1000:
                drought_resistance = "Low"
            elif crop.water_requirement_mm >= 500:
                drought_resistance = "Medium"
            
            # Get fertilizer recommendations for this crop and soil type
            fertilizer_data = FertilizerRecommendation.objects.filter(
                crop=crop, 
                soil_type__icontains=soil_type
            ).first()
            
            # Get irrigation requirements for this crop
            irrigation_data = IrrigationRequirement.objects.filter(crop=crop).all()
            irrigation_types = {}
            critical_stages = set()
            
            for irrigation in irrigation_data:
                irrigation_types[irrigation.growth_stage] = {
                    'water_quantity': irrigation.water_requirement_mm,
                    'interval': irrigation.irrigation_interval_days
                }
                if irrigation.critical_stages:
                    for stage in irrigation.critical_stages.split(','):
                        critical_stages.add(stage.strip())
            
            recommendations.append({
                'crop': crop,
                'economics': None,
                'roi': 0,
                'suitability': suitability,
                'score': normalized_score,  # Use normalized score here
                'recommended_varieties': [],
                'water_requirement': water_req_category,
                'rainfall_min': rainfall_min,
                'rainfall_max': rainfall_max,
                'drought_resistance': drought_resistance,
                'fertilizer': fertilizer_data,
                'irrigation': irrigation_data,
                'irrigation_types': irrigation_types,
                'critical_stages': list(critical_stages)
            })
    
    # Sort recommendations by score (highest first)
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top 5 recommendations
    return recommendations[:5]

def get_scheme_recommendations(farmer):
    """Generate government scheme recommendations based on farmer profile"""
    recommendations = []
    
    # Helper function for diversity promotion
    def add_diversity(recommendations_list, limit=5):
        """Promotes diversity in recommendations by prioritizing different challenges"""
        seen_challenges = set()
        diversity_promoted = []
        
        # First pass - get items addressing new challenges
        for rec in recommendations_list[:]:
            if rec.get('matched_challenges'):
                # Check if this recommendation addresses any unseen challenges
                unique_challenges = [c for c in rec['matched_challenges'] if c not in seen_challenges]
                if unique_challenges:
                    seen_challenges.update(unique_challenges)
                    diversity_promoted.append(rec)
        
        # Second pass - add remaining items until we have enough
        remaining_slots = limit - len(diversity_promoted)
        if remaining_slots > 0:
            # Get recommendations not already in diversity_promoted
            remaining_recs = [r for r in recommendations_list if r not in diversity_promoted]
            diversity_promoted.extend(remaining_recs[:remaining_slots])
        
        return diversity_promoted[:limit]
    
    # Get schemes available in the farmer's district
    # Use fuzzy matching for district name
    district_schemes = GovernmentScheme.objects.filter(
        district_availability__icontains='All Karnataka districts'
    )
    
    # Add schemes for the specific district with fuzzy matching
    if farmer.district:
        district_lower = farmer.district.lower()
        for scheme in GovernmentScheme.objects.all():
            if scheme not in district_schemes:
                scheme_districts = scheme.district_availability.lower()
                district_parts = district_lower.split()
                # Consider it a match if any part of the district name is in the scheme's district availability
                if any(part in scheme_districts for part in district_parts if len(part) > 3):
                    district_schemes = district_schemes | GovernmentScheme.objects.filter(pk=scheme.pk)
    
    # Get farmer interests (use the most recent one if multiple exist)
    interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
    
    # Get farm details for land ownership info
    farm_details = FarmDetail.objects.filter(farmer=farmer).first()
    land_ownership = farm_details.land_ownership if farm_details else 'Owned'
    
    # Get farmer challenges
    challenges = []
    if interests and interests.challenges:
        challenges = [c.strip() for c in interests.challenges.split(',') if c.strip()]
    
    # Get farmer crops
    farmer_crops = list(FarmingExperience.objects.filter(farmer=farmer).values_list('crop__name', flat=True))
    
    # Get financial information
    financial_info = FinancialInfo.objects.filter(farmer=farmer).first()
    
    # Get enrolled schemes (to avoid recommending schemes the farmer is already part of)
    enrolled_schemes = []
    if financial_info and financial_info.govt_schemes_enrolled:
        enrolled_schemes = [scheme.strip().lower() for scheme in financial_info.govt_schemes_enrolled.split(',')]
    
    # Challenge keyword mappings - expanded for better matching
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
    
    # Prioritize schemes based on challenges
    prioritized_schemes = []
    for scheme in district_schemes:
        # Skip schemes the farmer is already enrolled in
        if scheme.name.lower() in enrolled_schemes:
            continue
            
        priority = 0
        relevance_score = 0  # New relevance score for more nuanced ranking
        context_reasons = []  # Store reasons why this scheme is recommended
        
        # Check if scheme addresses any challenges - INCREASED WEIGHT
        challenge_matches = []
        matched_any_challenge = False
        matched_challenges = []
        
        # Debug info
        print(f"Farmer challenges: {challenges}")
        
        scheme_text = (scheme.benefits.lower() + ' ' + 
                      scheme.name.lower() + ' ' + 
                      scheme.detailed_description.lower() + ' ' +
                      scheme.eligibility_criteria.lower())
            
        # Improved challenge matching - use keyword dictionary
        for challenge in challenges:
            challenge_lower = challenge.lower()
            match_found = False
            
            # Direct phrase matching (strongest)
            if challenge_lower in scheme_text:
                match_found = True
                priority += 12  # Increased weight
                relevance_score += 60  # Increased score
                matched_challenges.append(challenge)
                print(f"Found direct match for challenge: {challenge} in scheme text")
            else:
                # Use the challenge keyword mapping for better matching - try both case formats
                # First try exact challenge name
                keywords = challenge_keywords.get(challenge, [])
                # If not found with exact case, try lowercase
                if not keywords:
                    keywords = challenge_keywords.get(challenge_lower, [])
                
                if keywords:
                    keyword_matches = []
                    for keyword in keywords:
                        if keyword in scheme_text:
                            keyword_matches.append(keyword)
                    
                    # If multiple keywords match, it's a stronger signal
                    if len(keyword_matches) >= 2:
                        match_found = True
                        priority += 10
                        relevance_score += 50
                        matched_challenges.append(challenge)
                        print(f"Found multiple keyword matches for challenge: {challenge}, keywords: {keyword_matches}")
                    elif len(keyword_matches) == 1:
                        match_found = True
                        priority += 7
                        relevance_score += 40
                        matched_challenges.append(challenge)
            
            if match_found:
                matched_any_challenge = True
                challenge_matches.append(challenge)
                context_reasons.append(f"Addresses your challenge: {challenge}")
        
        # Check if scheme is for specific crops grown by farmer
        crop_matches = []
        if scheme.crop_applicability != 'All':
            for crop in farmer_crops:
                crop_lower = crop.lower()
                if crop_lower in scheme.crop_applicability.lower():
                    priority += 5
                    relevance_score += 30
                    crop_matches.append(crop)
                    context_reasons.append(f"Specifically designed for {crop}")
                    break
        else:
            priority += 1
            relevance_score += 5
            context_reasons.append("Applicable to all crops")
            
        # Consider land ownership with more nuance
        if land_ownership == 'Owned':
            if 'landowner' in scheme.eligibility_criteria.lower():
                priority += 3
                relevance_score += 20
                context_reasons.append("Ideal for landowners like you")
            elif 'tenant' in scheme.eligibility_criteria.lower():
                # Reduce score for tenant-specific schemes for landowners
                priority -= 1
                relevance_score -= 5
        elif land_ownership == 'Leased':
            if 'tenant' in scheme.eligibility_criteria.lower() or 'lease' in scheme.eligibility_criteria.lower():
                priority += 3
                relevance_score += 20
                context_reasons.append("Designed for farmers with leased land like you")
            elif 'landowner' in scheme.eligibility_criteria.lower():
                # Reduce score for landowner-specific schemes for tenants
                priority -= 1
                relevance_score -= 5
        elif land_ownership == 'Shared':
            if 'cooperative' in scheme.eligibility_criteria.lower() or 'group' in scheme.eligibility_criteria.lower():
                priority += 3
                relevance_score += 20
                context_reasons.append("Well-suited for your shared farming arrangement")
        
        # Financial Status Integration - make more precise
        if financial_info:
            # Consider income level for scheme recommendations
            income_level = financial_info.annual_income
            if income_level == 'below_50k' and any(keyword in scheme.eligibility_criteria.lower() for keyword in ['small', 'marginal', 'low income', 'poor']):
                priority += 4
                relevance_score += 25
                context_reasons.append("Designed for low-income farmers")
            elif income_level in ['50k_1l', '1l_3l'] and any(keyword in scheme.eligibility_criteria.lower() for keyword in ['medium', 'middle income']):
                priority += 4
                relevance_score += 25
                context_reasons.append("Matches your income bracket")
            elif income_level in ['3l_5l', 'above_5l'] and any(keyword in scheme.eligibility_criteria.lower() for keyword in ['large', 'commercial']):
                priority += 4
                relevance_score += 25
                context_reasons.append("Suitable for higher-income farmers like you")
            
            # Consider bank account status
            if financial_info.bank_account and ('bank account' in scheme.eligibility_criteria.lower() or 'bank transfer' in scheme.benefits.lower()):
                priority += 2
                relevance_score += 10
                context_reasons.append("Compatible with your bank account")
                
            # Check for government scheme enrollment
            if financial_info.govt_schemes_enrolled:
                # Tendency to diversify schemes
                if 'complementary' in scheme.benefits.lower():
                    priority += 2
                    relevance_score += 15
                    context_reasons.append("Complements other schemes you're enrolled in")
        
        # Add season-based recommendations
        if farmer.preferred_season:
            preferred_season_lower = farmer.preferred_season.lower()
            season_keywords = {
                "kharif": ['kharif', 'monsoon', 'rainy', 'june', 'july', 'august', 'september'],
                "rabi": ['rabi', 'winter', 'october', 'november', 'december', 'january'],
                "zaid": ['zaid', 'summer', 'february', 'march', 'april', 'may']
            }
            
            matching_keywords = []
            
            for season, keywords in season_keywords.items():
                if preferred_season_lower == season or any(keyword in preferred_season_lower for keyword in keywords):
                    matching_keywords = keywords
                    break
            
            if matching_keywords:
                for keyword in matching_keywords:
                    if keyword in scheme.benefits.lower() or keyword in scheme.name.lower() or keyword in scheme.detailed_description.lower():
                        priority += 3
                        relevance_score += 20
                        context_reasons.append(f"Relevant for your preferred {farmer.preferred_season} growing season")
                        break
        
        # Karnataka-Specific Scheme Promotion
        if 'Karnataka' in scheme.implementing_agency:
            priority += 2
            relevance_score += 10
            context_reasons.append("This is a Karnataka state scheme designed for local farmers")
        
        # Determine crop matching context
        crop_context = ""
        if scheme.crop_applicability != 'All':
            scheme_crops = [c.strip() for c in scheme.crop_applicability.split(',')]
            matching_crops = [crop for crop in farmer_crops if crop.lower() in [sc.lower() for sc in scheme_crops]]
            if matching_crops:
                crop_context = f"Applicable to your crops: {', '.join(matching_crops)}"
                context_reasons.append(crop_context)
        
        # Add scheme type context
        scheme_description_lower = (scheme.detailed_description + " " + scheme.benefits).lower()
        
        scheme_type_context = ""
        if 'subsidy' in scheme_description_lower:
            scheme_type_context = "This is a subsidy scheme that provides financial assistance"
            relevance_score += 15
            context_reasons.append(scheme_type_context)
        elif 'loan' in scheme_description_lower:
            scheme_type_context = "This is a loan scheme with favorable terms for farmers"
            relevance_score += 10
            context_reasons.append(scheme_type_context)
        elif 'insurance' in scheme_description_lower:
            scheme_type_context = "This is an insurance scheme to protect your farming investment"
            relevance_score += 10
            context_reasons.append(scheme_type_context)
        elif 'training' in scheme_description_lower or 'skill' in scheme_description_lower:
            scheme_type_context = "This is a training/skill development program"
            context_reasons.append(scheme_type_context)
            
        # Scheme popularity/importance weighting
        if 'flagship' in scheme.detailed_description.lower() or 'pmfby' in scheme.name.lower() or 'prime minister' in scheme.name.lower():
            priority += 2
            relevance_score += 15
            context_reasons.append("This is a flagship government program with high priority")
        
        # Check for direct problem solving
        for challenge in challenges:
            if 'solution' in scheme.benefits.lower() and challenge.lower() in scheme.benefits.lower():
                priority += 3
                relevance_score += 20
                context_reasons.append(f"Directly addresses your {challenge} challenge")
                
        # Print debug info - what challenges were we looking for and did we find any matches?
        print(f"For scheme {scheme.name}, looking for challenges: {challenges}")
        print(f"Matched challenges found: {matched_challenges}")
        
        # CRITICAL: If the scheme doesn't match ANY of the farmer's challenges, drastically reduce its relevance
        if not matched_challenges and challenges:
            relevance_score *= 0.01  # Reduce score by 99% - effectively filtering out completely
            priority = -100  # Set very negative priority so these never come first
            context_reasons = [reason for reason in context_reasons 
                              if not (reason.startswith("This is a Karnataka state scheme") or 
                                     reason.startswith("This is a flagship government program"))]
            # Add a reason explaining why this is low relevance
            context_reasons.append("Low relevance: Does not address any of your selected challenges")
        
        # Calculate relevance level based on normalized score
        # Use a more meaningful calculation that properly scales
        max_possible_score = 200  # Adjusted max score based on changes
        normalized_score = min(100, (relevance_score / max_possible_score) * 100)
        
        if normalized_score >= 40:
            relevance = 'High'
        else:
            relevance = 'Low'
            
        # Extract primary challenges being addressed
        addresses_challenge = ""
        designed_for = ""
        
        for reason in context_reasons:
            if "Addresses your challenge:" in reason:
                addresses_challenge = reason.replace("Addresses your challenge:", "").strip()
            elif "Directly addresses your" in reason:
                addresses_challenge = reason.replace("Directly addresses your", "").replace("challenge", "").strip()
            elif "Specifically designed for" in reason:
                designed_for = reason.replace("Specifically designed for", "").strip()
            elif "Applicable to your crops:" in reason:
                designed_for = reason.replace("Applicable to your crops:", "").strip()
            
        # Add recommendation with improved information
        recommendations.append({
            'scheme': scheme,
            'priority': priority,
            'relevance_score': relevance_score,
            'normalized_score': normalized_score,
            'relevance': relevance,
            'reasons': context_reasons,  # Store reasons for recommendation
            'addresses_challenge': addresses_challenge,
            'designed_for': designed_for,
            'matched_challenges': matched_challenges  # Use consistent key name that matches the API
        })
    
        # Store all recommendations before filtering
    all_recommendations = recommendations.copy()
    
    # Sort recommendations by normalized score (highest first)
    recommendations.sort(key=lambda x: x['normalized_score'], reverse=True)
    
    # STRICT FILTERING: Always filter to only include recommendations that match at least one challenge
    if challenges:
        print("Filtering recommendations with these challenges:", challenges)
        # First check if we have any matches
        for rec in recommendations:
            print(f"Scheme {rec['scheme'].name} has matched_challenges: {rec.get('matched_challenges', [])}")
        
        matching_recommendations = [rec for rec in recommendations if rec['matched_challenges']]
        
        # If we have at least 2 matching recommendations, only use those
        if len(matching_recommendations) >= 2:
            recommendations = matching_recommendations
            print(f"Found {len(matching_recommendations)} recommendations matching user challenges")
        
        # If we have only 1 matching recommendation, use it plus one backup (if available)
        elif len(matching_recommendations) == 1:
            print("Found only 1 recommendation matching user challenges, adding one backup")
            backup_rec = next((rec for rec in recommendations 
                              if not rec['matched_challenges'] and rec not in matching_recommendations), None)
            if backup_rec:
                recommendations = matching_recommendations + [backup_rec]
            else:
                recommendations = matching_recommendations
        
        # If no matching recommendations found but we have challenges, show message
        elif challenges and not matching_recommendations:
            print("No recommendations match user challenges")
            # For zero recommendations, we'll return an empty list
            # The frontend will show a message indicating no matches found
            return []
    
    # Apply diversity promotion before returning
    return add_diversity(recommendations, 5)

def get_loan_recommendations(farmer, financial_info):
    """Generate loan recommendations based on farmer profile and financial info"""
    recommendations = []
    
    # Helper function for diversity promotion
    def add_diversity(recommendations_list, limit=5):
        """Promotes diversity in recommendations by prioritizing different challenges"""
        seen_challenges = set()
        diversity_promoted = []
        
        # First pass - get items addressing new challenges
        for rec in recommendations_list[:]:
            if rec.get('matched_challenges'):
                # Check if this recommendation addresses any unseen challenges
                unique_challenges = [c for c in rec['matched_challenges'] if c not in seen_challenges]
                if unique_challenges:
                    seen_challenges.update(unique_challenges)
                    diversity_promoted.append(rec)
        
        # Second pass - add remaining items until we have enough
        remaining_slots = limit - len(diversity_promoted)
        if remaining_slots > 0:
            # Get recommendations not already in diversity_promoted
            remaining_recs = [r for r in recommendations_list if r not in diversity_promoted]
            diversity_promoted.extend(remaining_recs[:remaining_slots])
        
        return diversity_promoted[:limit]
    
    # Get all loan options
    loan_options = LoanOption.objects.all()
    
    # Get farm details for land ownership info
    farm_details = FarmDetail.objects.filter(farmer=farmer).first()
    land_ownership = farm_details.land_ownership if farm_details else 'Owned'
    farm_size = farm_details.farm_size if farm_details else 0
    
    # Get farmer crops
    farmer_crops = list(FarmingExperience.objects.filter(farmer=farmer).values_list('crop__name', flat=True))
    farmer_crop_objects = list(FarmingExperience.objects.filter(farmer=farmer).values_list('crop', flat=True))
    
    # Get crop categories by combining crops with similar characteristics
    crop_categories = {}
    if farmer_crop_objects:
        for crop_id in farmer_crop_objects:
            try:
                crop = Crop.objects.get(id=crop_id)
                crop_type = ""
                
                # Categorize crops
                if crop.name.lower() in ['rice', 'wheat', 'maize', 'barley', 'sorghum', 'millet', 'oats', 'ragi']:
                    crop_type = "cereal"
                elif crop.name.lower() in ['chickpea', 'pigeon pea', 'lentil', 'kidney bean', 'mung bean', 'black gram', 'cowpea']:
                    crop_type = "pulse"
                elif crop.name.lower() in ['peanut', 'soybean', 'sunflower', 'mustard', 'sesame', 'flax', 'coconut']:
                    crop_type = "oilseed"
                elif crop.name.lower() in ['potato', 'onion', 'tomato', 'cabbage', 'cauliflower', 'carrot']:
                    crop_type = "vegetable"
                elif crop.name.lower() in ['mango', 'banana', 'papaya', 'apple', 'grape', 'citrus', 'watermelon']:
                    crop_type = "fruit"
                elif crop.name.lower() in ['cotton', 'jute', 'sugarcane', 'tobacco']:
                    crop_type = "cash crop"
                else:
                    crop_type = "other"
                
                if crop_type in crop_categories:
                    crop_categories[crop_type].append(crop.name)
                else:
                    crop_categories[crop_type] = [crop.name]
            except Crop.DoesNotExist:
                pass
    
    # Get farmer challenges for urgency detection
    farmer_interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
    farmer_challenges = []
    if farmer_interests and farmer_interests.challenges:
        farmer_challenges = [c.strip().lower() for c in farmer_interests.challenges.split(',') if c.strip()]
    
    # Challenge keyword mappings - expanded for better matching
    challenge_keywords = {
        'water scarcity': ['drought', 'rain shortage', 'rainfall deficit', 'dry season', 'water shortage'],
        'market access': ['market', 'selling', 'trade', 'export', 'buyer', 'mandi', 'marketplace'],
        'price volatility': ['price', 'fluctuation', 'volatile', 'rate', 'value', 'cost variation', 'stable price'],
        'input costs': ['input', 'seed', 'fertilizer', 'cost', 'expense', 'investment', 'affordable'],
        'financial constraints': ['finance', 'fund', 'budget', 'monetary', 'fiscal', 'subsidy', 'financial'],
        'credit access': ['credit', 'loan', 'borrow', 'lending', 'finance', 'banking', 'financial'],
        'irrigation management': ['drip irrigation', 'sprinkler system', 'canal', 'watershed', 'water management'],
        'crop financing': ['financing', 'funding', 'loan', 'credit', 'capital', 'investment', 'pre-harvest'],
        'seed quality': ['seed', 'variety', 'hybrid', 'germination', 'quality', 'certified', 'genuine'],
        'technology access': ['technology', 'digital', 'app', 'equipment', 'machine', 'modern', 'innovation'],
        'collateral requirements': ['collateral', 'security', 'guarantee', 'asset', 'property', 'pledge', 'mortgage'],
        'high interest rates': ['interest', 'rate', 'charge', 'percent', 'fee', 'apr', 'emi'],
        'processing delays': ['processing', 'delay', 'time', 'approval', 'waiting', 'duration', 'quick'],
        'seasonal cash flow': ['seasonal', 'cash flow', 'liquidity', 'working capital', 'income', 'revenue'],
        'documentation complexity': ['document', 'paperwork', 'form', 'kyc', 'application', 'process'],
        'limited credit history': ['credit history', 'score', 'rating', 'record', 'first-time', 'new borrower'],
        'infrastructure development': ['infrastructure', 'facility', 'building', 'storage', 'warehouse', 'setup'],
        'farm mechanization costs': ['mechanization', 'machinery', 'equipment', 'tractor', 'automation'],
        'post-harvest financing': ['post-harvest', 'storage', 'processing', 'value addition', 'warehouse'],
        'loan repayment flexibility': ['repayment', 'flexibility', 'term', 'schedule', 'installment', 'moratorium']
    }
    
    # Get enrolled government schemes for subsidy matching
    enrolled_schemes = []
    if financial_info.govt_schemes_enrolled:
        enrolled_schemes = [scheme.strip().lower() for scheme in financial_info.govt_schemes_enrolled.split(',') if scheme.strip()]
    
    # Calculate estimated monthly income based on annual income
    monthly_income = 0
    if financial_info.annual_income == 'below_50k':
        monthly_income = 4000  # 48,000 per year
    elif financial_info.annual_income == '50k_1l':
        monthly_income = 6000  # 72,000 per year
    elif financial_info.annual_income == '1l_3l':
        monthly_income = 16000  # 2,00,000 per year
    elif financial_info.annual_income == '3l_5l':
        monthly_income = 33000  # 4,00,000 per year
    elif financial_info.annual_income == 'above_5l':
        monthly_income = 50000  # 6,00,000 per year
    
    # Estimate loan repayment capacity (50% of monthly income)
    repayment_capacity = monthly_income * 0.5
    
    # Crop seasonality data for cash flow matching
    current_month = datetime.datetime.now().month
    current_season = ""
    if 6 <= current_month <= 9:  # June to September
        current_season = "kharif"
    elif 10 <= current_month <= 1:  # October to January
        current_season = "rabi"
    else:  # February to May
        current_season = "zaid"
    
    # Determine if farmer has seasonal cash flow needs based on crops
    seasonal_cash_need = False
    if farmer_crops:
        for crop in farmer_crops:
            crop_obj = Crop.objects.filter(name=crop).first()
            if crop_obj and crop_obj.growing_season and current_season.lower() in crop_obj.growing_season.lower():
                seasonal_cash_need = True
                break
    
    # Prioritize loans based on farmer's financial situation
    for loan in loan_options:
        priority = 0
        reasons = []
        loan_relevance_score = 0
        matched_challenges = []
        
        # Parse interest rate for proper comparison
        interest_rate_value = None
        try:
            # Handle interest rate in different formats
            interest_rate_str = loan.interest_rate.replace('%', '')
            # Handle range format (e.g., "8.5-10.2%")
            if '-' in interest_rate_str:
                min_rate, max_rate = interest_rate_str.split('-')
                interest_rate_value = (float(min_rate.strip()) + float(max_rate.strip())) / 2
            else:
                interest_rate_value = float(interest_rate_str)
        except (ValueError, AttributeError):
            # If we can't parse it, use a default high value
            interest_rate_value = 15.0
            
        # --- CHALLENGE MATCHING (IMPROVED) ---
        # Prioritize loans that address the farmer's specific challenges
        loan_text = f"{loan.name} {loan.loan_type} {loan.eligibility} {loan.special_features}".lower()
        
        for challenge in farmer_challenges:
            match_found = False
            
            # Direct challenge matching
            if challenge in loan_text:
                match_found = True
                priority += 12  # Increased weight for direct challenge match
                loan_relevance_score += 60
                matched_challenges.append(challenge)
                reasons.append(f"Addresses your challenge: {challenge}")
            else:
                # Use challenge keywords for better matching
                keywords = challenge_keywords.get(challenge, [])
                if keywords:
                    keyword_matches = []
                    for keyword in keywords:
                        if keyword in loan_text:
                            keyword_matches.append(keyword)
                    
                    # If multiple keywords match, it's a stronger signal
                    if len(keyword_matches) >= 2:
                        match_found = True
                        priority += 10
                        loan_relevance_score += 50
                        matched_challenges.append(challenge)
                        reasons.append(f"Well-suited for your {challenge} needs")
                    elif len(keyword_matches) == 1:
                        match_found = True
                        priority += 7
                        loan_relevance_score += 40
                        matched_challenges.append(challenge)
                        reasons.append(f"Can help with your {challenge} challenge")
            
        # --- INCOME AND LOAN AMOUNT MATCHING ---
        
        # Check income level match with better detection
        income_level = financial_info.annual_income
        
        income_match = False
        land_context = ""
            
        # Check if loan is suitable for this income level
        if income_level == 'below_50k' and ('small' in loan.eligibility.lower() or 'marginal' in loan.eligibility.lower()):
            income_match = True
            priority += 5
            loan_relevance_score += 30
            reasons.append("Designed for low-income farmers like you")
        elif income_level in ['50k_1l', '1l_3l'] and 'medium' in loan.eligibility.lower():
            income_match = True
            priority += 5
            loan_relevance_score += 30
            reasons.append("Ideal for your income bracket")
        elif income_level in ['3l_5l', 'above_5l'] and ('commercial' in loan.eligibility.lower() or 'large' in loan.eligibility.lower()):
            income_match = True
            priority += 5
            loan_relevance_score += 30
            reasons.append("Tailored for higher-income farmers like you")
        
        # Land ownership context (for better explanation to farmer)
        if land_ownership == 'Owned':
            if 'land owner' in loan.eligibility.lower() or 'landowner' in loan.eligibility.lower():
                priority += 3
                loan_relevance_score += 20
                reasons.append("Suitable for your owned farm land")
                land_context = "Owned Land"
        elif land_ownership == 'Leased':
            if 'tenant' in loan.eligibility.lower() or 'lease' in loan.eligibility.lower():
                priority += 3
                loan_relevance_score += 20
                reasons.append("Good for farmers with leased land like you")
                land_context = "Leased Land"
        
        # --- INTEREST RATE EVALUATION ---
        
        # Check if this is a low interest loan
        interest_context = ""
        if interest_rate_value is not None:
            if interest_rate_value < 7.0:
                priority += 5
                loan_relevance_score += 30
                reasons.append("Features a very competitive low interest rate")
                interest_context = "Very Low"
            elif interest_rate_value < 9.0:
                priority += 3
                loan_relevance_score += 20
                reasons.append("Has a favorable interest rate")
                interest_context = "Low"
            elif interest_rate_value > 12.0:
                # Penalize high interest loans
                priority -= 2
                loan_relevance_score -= 10
                interest_context = "High"
        
        # --- SPECIAL FEATURES MATCHING ---
        
        # Look for challenging features in loan terms
        processing_speed = ""
        if loan.processing_time:
            if any(speed in loan.processing_time.lower() for speed in ['quick', 'fast', 'rapid', 'immediate', '24 hour', 'same day']):
                priority += 4
                loan_relevance_score += 25
                reasons.append("Features fast processing time")
                processing_speed = "Fast"
            elif any(speed in loan.processing_time.lower() for speed in ['7 day', 'week', 'expedited']):
                priority += 2
                loan_relevance_score += 15
                processing_speed = "Medium"
        
        # Check for favorable special features
        if loan.special_features:
            special_features_lower = loan.special_features.lower()
            
            # Check for no collateral loans (important for farmers without assets)
            if 'no collateral' in special_features_lower or 'collateral free' in special_features_lower:
                if 'Collateral Requirements' in farmer_challenges:
                    priority += 5
                    loan_relevance_score += 30
                    reasons.append("No collateral required - addresses your challenge")
                else:
                    priority += 3
                    loan_relevance_score += 20
                    reasons.append("No collateral required - easier approval")
        
            # Check for flexible repayment options
            if 'flexible repayment' in special_features_lower or 'repayment flexibility' in special_features_lower:
                if 'Loan Repayment Flexibility' in farmer_challenges:
                    priority += 5
                    loan_relevance_score += 30
                    reasons.append("Offers flexible repayment options - matches your needs")
                else:
                    priority += 2
                    loan_relevance_score += 15
                    reasons.append("Offers flexible repayment options")
            
            # Check for subsidies
            if 'subsidy' in special_features_lower or 'subsidized' in special_features_lower:
                priority += 4
                loan_relevance_score += 25
                reasons.append("Includes government subsidy benefits")
                
            # Check for minimal documentation
            if 'minimal documentation' in special_features_lower or 'simplified' in special_features_lower:
                if 'Documentation Complexity' in farmer_challenges:
                    priority += 5
                    loan_relevance_score += 30
                    reasons.append("Simplified documentation - addresses your challenge")
                else:
                    priority += 2
                    loan_relevance_score += 15
                    reasons.append("Minimal documentation required")
            
        # --- CROP SPECIFIC LOAN MATCHING ---
        
        # Check if this loan is specifically for the farmer's crops
        loan_text = (loan.name + " " + loan.loan_type + " " + loan.special_features).lower()
        
        for crop_category, crops in crop_categories.items():
            if crop_category in loan_text or any(crop.lower() in loan_text for crop in crops):
                priority += 4
                loan_relevance_score += 25
                matching_crops = [crop for crop in crops if crop.lower() in loan_text]
                if matching_crops:
                    reasons.append(f"Designed for your crops: {', '.join(matching_crops)}")
            else:
                reasons.append(f"Suitable for your {crop_category} crops")
            break
        
        # --- SEASONAL TIMING RELEVANCE ---
        
        # Check if loan matches seasonal cash flow needs
        if seasonal_cash_need:
            if 'seasonal' in loan_text or current_season.lower() in loan_text:
                priority += 4
                loan_relevance_score += 25
                reasons.append(f"Well-timed for your {current_season} season needs")
            
            # Special check for pre-harvest loans during growing season
            if 'pre-harvest' in loan_text or 'crop loan' in loan_text:
                priority += 3
                loan_relevance_score += 20
                reasons.append("Provides pre-harvest financing when you need it")
        
        # --- URGENCY BASED ON CHALLENGES ---
        
        # Check if loan addresses urgent challenges - EXPAND THIS LIST
        urgent_challenges = [
            'Financial Constraints', 'Credit Access', 'Input Costs', 'Seasonal Cash Flow',
            'Water Scarcity', 'Market Access', 'Technology Access', 'Irrigation Management', 
            'Price Volatility', 'Seed Quality', 'High Interest Rates'
        ]
        
        urgent_challenge_matches = [c for c in matched_challenges if c in urgent_challenges]
        
        if urgent_challenge_matches:
            priority += 4
            loan_relevance_score += 25
            reasons.append(f"Addresses your urgent {urgent_challenge_matches[0]} needs")
        
        # CRITICAL: If the loan doesn't match ANY of the farmer's challenges, drastically reduce its relevance
        if not matched_challenges and farmer_challenges:
            loan_relevance_score *= 0.5  # Reduce score by only 50% instead of 99%
            priority -= 10  # Less severe priority reduction
            reasons = [reason for reason in reasons 
                      if not reason.startswith("This is a Karnataka")]
            # Add a reason explaining why this is low relevance
            reasons.append("Low relevance: Does not address any of your selected challenges")
            
        # Calculate normalized score for better comparison
        max_possible_score = 200
        normalized_score = min(100, (loan_relevance_score / max_possible_score) * 100)
        
        # Determine relevance level
        if normalized_score >= 40:
            relevance = 'High'
        else:
            relevance = 'Low'
        
        # Add to recommendations with enriched data
        recommendations.append({
            'loan': loan,
            'priority': priority,
            'relevance': relevance,
            'relevance_score': loan_relevance_score,
            'normalized_score': normalized_score,
            'reasons': reasons,
            'land_context': land_context,
            'processing_speed': processing_speed,
            'monthly_repayment': None,  # Will be populated if calculable
            'loan_purpose': loan.loan_type,
            'loan_category': get_loan_category(loan.loan_type),
            'matched_challenges': matched_challenges  # Add matched challenges list
        })
    
    # Sort by normalized score first, then by interest rate
    recommendations.sort(key=lambda x: (
        x['normalized_score'],  # First by relevance score (descending)
        -float(x['loan'].interest_rate.replace('%', '')) if x['loan'].interest_rate and x['loan'].interest_rate.replace('%', '').replace('-', '').replace(' ', '').isdigit() else 15  # Then by interest rate (ascending)
    ), reverse=True)
    
    # Add diversity bonus for loans addressing different challenges
    seen_challenges = set()
    for rec in recommendations:
        if 'matched_challenges' in rec and rec['matched_challenges']:
            unique_challenges = [c for c in rec['matched_challenges'] if c not in seen_challenges]
            if unique_challenges:
                # Give bonus points for recommendations that address new challenges
                rec['normalized_score'] += len(unique_challenges) * 10
                seen_challenges.update(unique_challenges)
                rec['reasons'].append(f"Addresses unique challenge(s): {', '.join(unique_challenges)}")
    
    # Re-sort after diversity bonus
    recommendations.sort(key=lambda x: (
        x['normalized_score'],  # First by relevance score (descending)
        -float(x['loan'].interest_rate.replace('%', '')) if x['loan'].interest_rate and x['loan'].interest_rate.replace('%', '').replace('-', '').replace(' ', '').isdigit() else 15  # Then by interest rate (ascending)
    ), reverse=True)
    
    # Print debug information about recommendations
    print(f"Generated {len(recommendations)} loan recommendations")
    for idx, rec in enumerate(recommendations[:5]):
        print(f"Loan {idx+1}: {rec['loan'].name} - Score: {rec['normalized_score']:.1f} - Relevance: {rec['relevance']}")
        print(f"  Reasons: {rec['reasons'][:3]}")
        print(f"  Matched challenges: {rec['matched_challenges']}")
    
    # Store all recommendations before filtering
    all_recommendations = recommendations.copy()
    
    # STRICT FILTERING: Always filter to only include recommendations that match at least one challenge
    if farmer_challenges:
        matching_recommendations = [rec for rec in recommendations if rec['matched_challenges']]
        
        # If we have at least 2 matching recommendations, only use those
        if len(matching_recommendations) >= 2:
            recommendations = matching_recommendations
            print(f"Found {len(matching_recommendations)} loan recommendations matching user challenges")
        
        # If we have only 1 matching recommendation, use it plus one backup (if available)
        elif len(matching_recommendations) == 1:
            print("Found only 1 loan recommendation matching user challenges, adding one backup")
            backup_rec = next((rec for rec in recommendations 
                              if not rec['matched_challenges'] and rec not in matching_recommendations), None)
            if backup_rec:
                recommendations = matching_recommendations + [backup_rec]
            else:
                recommendations = matching_recommendations
        
        # If no matching recommendations found but we have challenges, show message
        elif farmer_challenges and not matching_recommendations:
            print("No loan recommendations match user challenges")
            # For zero recommendations, we'll return an empty list
            # The frontend will show a message indicating no matches found
            return []
    
    # Apply diversity promotion before returning
    recommendations = add_diversity(all_recommendations, 5)
    
    return recommendations

def get_loan_category(loan_type):
    """Helper function to categorize loans"""
    loan_type_lower = loan_type.lower() if loan_type else ""
    
    if any(keyword in loan_type_lower for keyword in ['crop', 'seasonal', 'pre-harvest']):
        return 'Crop Loan'
    elif any(keyword in loan_type_lower for keyword in ['equipment', 'machinery', 'tractor']):
        return 'Equipment Loan'
    elif any(keyword in loan_type_lower for keyword in ['development', 'infrastructure', 'structure']):
        return 'Farm Development'
    elif any(keyword in loan_type_lower for keyword in ['kisan', 'kcc', 'credit card']):
        return 'Kisan Credit Card'
    elif any(keyword in loan_type_lower for keyword in ['personal', 'consumption']):
        return 'Personal Loan'
    else:
        return 'Agricultural Loan'

def get_technology_recommendations(farmer, farm_details, interests):
    """Generate technology recommendations based on farmer profile, farm details and interests"""
    recommendations = []
    
    # Get all technologies
    technologies = Technology.objects.all()
    
    # Get farmer crops
    farmer_crops = FarmingExperience.objects.filter(farmer=farmer).values_list('crop__name', flat=True)
    
    # Get land ownership
    land_ownership = farm_details.land_ownership
    
    # Get farmer challenges
    challenges = []
    if interests:
        challenges = [c.strip() for c in interests.challenges.split(',') if c.strip()]
    
    # Prioritize technologies based on challenges and crops
    prioritized_technologies = []
    for tech in technologies:
        priority = 0
        reasoning = []
        
        # Check if technology addresses any challenges
        challenge_matches = []
        for challenge in challenges:
            if challenge.lower() in tech.name.lower() or challenge.lower() in tech.category.lower():
                priority += 3
                challenge_matches.append(challenge)
        
        if challenge_matches:
            reasoning.append(f"Addresses your challenges: {', '.join(challenge_matches)}")
        
        # Check if technology is suitable for farmer's crops
        crop_matches = []
        if tech.suitable_crops == 'All':
            priority += 1
            reasoning.append("Works with all crops")
        else:
            for crop in farmer_crops:
                if crop.lower() in tech.suitable_crops.lower():
                    priority += 2
                    crop_matches.append(crop)
            
            if crop_matches:
                reasoning.append(f"Specifically designed for your crops: {', '.join(crop_matches)}")
        
        # Check farm size suitability
        farm_size = farm_details.farm_size
        if farm_size < 1 and 'small' in tech.name.lower():
            priority += 2
            reasoning.append(f"Ideal for your small farm size ({farm_size} {farm_details.unit})")
        elif farm_size >= 1 and farm_size < 5 and 'medium' in tech.name.lower():
            priority += 2
            reasoning.append(f"Well-suited for your medium farm size ({farm_size} {farm_details.unit})")
        elif farm_size >= 5 and 'large' in tech.name.lower():
            priority += 2
            reasoning.append(f"Appropriate for your large farm size ({farm_size} {farm_details.unit})")
        elif farm_size < 1:
            # For small farms, prioritize technologies with lower implementation cost
            if tech.implementation_cost < 30000:
                priority += 2
                reasoning.append("Affordable implementation cost for small farms")
        
        # Consider ROI for prioritization
        if tech.roi_percentage > 50:
            priority += 3
            reasoning.append(f"High return on investment ({tech.roi_percentage}%)")
        elif tech.roi_percentage > 30:
            priority += 1
            reasoning.append(f"Good return on investment ({tech.roi_percentage}%)")
            
        # Consider land ownership for technology recommendations
        if land_ownership == 'Owned':
            # Prioritize long-term investment technologies for land owners
            if tech.category in ['irrigation', 'renewable_energy', 'protected_cultivation']:
                priority += 2
                reasoning.append("Long-term investment ideal for owned land")
        elif land_ownership == 'Leased':
            # Prioritize portable/temporary technologies for leased land
            if tech.category in ['precision_agriculture', 'smart_irrigation', 'climate_monitoring']:
                priority += 2
                reasoning.append("Portable technology suitable for leased land")
            # Deprioritize permanent infrastructure for leased land
            if tech.category in ['protected_cultivation', 'renewable_energy']:
                priority -= 1
                reasoning.append("May not be ideal for leased land due to permanent nature")
        elif land_ownership == 'Shared':
            # Prioritize shared-use technologies for shared land
            if tech.category in ['mechanization', 'harvesting', 'post_harvest']:
                priority += 2
                reasoning.append("Good for shared farming arrangements")
        
        # Generate ownership context
        ownership_context = ""
        if land_ownership == 'Owned':
            if tech.category in ['irrigation', 'renewable_energy', 'protected_cultivation']:
                ownership_context = "This is a long-term investment technology that's ideal for land owners."
            else:
                ownership_context = "This technology works well on owned land."
        elif land_ownership == 'Leased':
            if tech.category in ['precision_agriculture', 'smart_irrigation', 'climate_monitoring']:
                ownership_context = "This portable technology is particularly suitable for leased land."
            elif tech.category in ['protected_cultivation', 'renewable_energy']:
                ownership_context = "Consider your lease duration before investing in this permanent infrastructure."
            else:
                ownership_context = "This technology can be used effectively on leased land."
        elif land_ownership == 'Shared':
            if tech.category in ['mechanization', 'harvesting', 'post_harvest']:
                ownership_context = "This technology is well-suited for shared farming arrangements."
            else:
                ownership_context = "This can be used in cooperative farming situations."
        
        # Assess implementation difficulty based on technical requirements and training needs
        difficulty = "Medium"
        if "extensive" in tech.technical_requirements.lower() or "week" in tech.training_needs.lower():
            difficulty = "High"
        elif "minimal" in tech.technical_requirements.lower() or "day" in tech.training_needs.lower():
            difficulty = "Low"
            
        # Remove duplicate reasoning entries
        reasoning = list(dict.fromkeys(reasoning))
        prioritized_technologies.append((tech, priority, reasoning, ownership_context, difficulty))
    
    # Sort by priority
    prioritized_technologies.sort(key=lambda x: x[1], reverse=True)
    
    # Format recommendations
    for tech, priority, reasoning, ownership_context, difficulty in prioritized_technologies[:5]:  # Top 5 technologies
        recommendations.append({
            'technology': tech,
            'relevance': 'High' if priority > 2 else 'Low',
            'reasoning': reasoning,
            'ownership_context': ownership_context,
            'difficulty': difficulty
        })
    
    return recommendations

@csrf_exempt
def crop_recommendations_api(request):
    """API endpoint for crop recommendations to be used by React frontend"""
    logger = logging.getLogger(__name__)
    
    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    if request.method == 'POST':
        try:
            logger.debug(f"Received POST request to crop_recommendations_api: {request.body}")
            data = json.loads(request.body)
            # Extract farmer ID from request
            farmer_id = data.get('farmer_id')
            logger.debug(f"Farmer ID from request: {farmer_id}")
            
            # If no farmer ID provided, try to get from auth user
            if not farmer_id and request.user.is_authenticated:
                try:
                    farmer = FarmerProfile.objects.get(user=request.user)
                    logger.debug(f"Found farmer profile from authenticated user: {farmer.id}")
                except FarmerProfile.DoesNotExist:
                    logger.debug("No farmer profile for authenticated user")
                    return JsonResponse({
                        'success': False,
                        'message': 'Please complete your profile to get recommendations'
                    })
            else:
                try:
                    farmer = FarmerProfile.objects.get(id=farmer_id)
                    logger.debug(f"Found farmer profile with ID {farmer_id}")
                except FarmerProfile.DoesNotExist:
                    logger.debug(f"No farmer profile found with ID {farmer_id}")
                    return JsonResponse({
                        'success': False,
                        'message': 'Farmer profile not found'
                    })
            
            # Get farm details
            farm_details = FarmDetail.objects.filter(farmer=farmer).first()
            logger.debug(f"Farm details: {farm_details}")
            
            # MODIFIED: Return dummy data if farm details are not available
            if not farm_details:
                logger.debug("No farm details found for farmer, returning dummy data")
                
                # Create dummy recommendations
                dummy_crops = [
                    {
                        'id': 1,
                        'name': 'Rice',
                        'matchPercentage': 85,
                        'suitability': 'Highly Suitable',
                        'soilMatch': True,
                        'npkMatch': True,
                        'climateMatch': True,
                        'score': 85,
                        'details': {
                            'bestFor': 'Clay',
                            'season': 'Kharif',
                            'waterRequirement': 'High',
                            'growthPeriod': "3-4 months",
                            'temperatureRange': "20°C - 35°C",
                            'rainfallRange': "1000 - 2000 mm",
                            'droughtResistance': 'Low',
                            'recommendedVarieties': ['IR-36', 'Basmati'],
                            'irrigation': [],
                            'marketPrice': '₹2000/quintal',
                            'phRange': '5.5-7.0',
                            'suitableSoilTypes': 'Clay, Alluvial',
                            'soilCompatibilityScores': []
                        }
                    },
                    {
                        'id': 2,
                        'name': 'Wheat',
                        'matchPercentage': 80,
                        'suitability': 'Suitable',
                        'soilMatch': True,
                        'npkMatch': True,
                        'climateMatch': True,
                        'score': 80,
                        'details': {
                            'bestFor': 'Clay',
                            'season': 'Rabi',
                            'waterRequirement': 'Medium',
                            'growthPeriod': "4-5 months",
                            'temperatureRange': "15°C - 25°C",
                            'rainfallRange': "450 - 650 mm",
                            'droughtResistance': 'Medium',
                            'recommendedVarieties': ['HD-2967', 'PBW-343'],
                            'irrigation': [],
                            'marketPrice': '₹1800/quintal',
                            'phRange': '6.0-7.5',
                            'suitableSoilTypes': 'Loam, Clay Loam',
                            'soilCompatibilityScores': []
                        }
                    },
                    {
                        'id': 3,
                        'name': 'Maize',
                        'matchPercentage': 75,
                        'suitability': 'Moderately Suitable',
                        'soilMatch': True,
                        'npkMatch': True,
                        'climateMatch': False,
                        'score': 75,
                        'details': {
                            'bestFor': 'Sandy Loam',
                            'season': 'Kharif, Rabi',
                            'waterRequirement': 'Medium',
                            'growthPeriod': "3-4 months",
                            'temperatureRange': "21°C - 30°C",
                            'rainfallRange': "500 - 800 mm",
                            'droughtResistance': 'Medium',
                            'recommendedVarieties': ['DHM-117', 'Ganga-11'],
                            'irrigation': [],
                            'marketPrice': '₹1600/quintal',
                            'phRange': '5.5-7.0',
                            'suitableSoilTypes': 'Well-drained loams, Sandy Loam',
                            'soilCompatibilityScores': []
                        }
                    }
                ]
                
                response = JsonResponse({
                    'success': True,
                    'recommendations': dummy_crops
                })
                response['Access-Control-Allow-Origin'] = '*'
                return response
            
            # Get recommendations using existing function
            logger.debug("Getting crop recommendations")
            recommendations = get_crop_recommendations(farmer, farm_details)
            logger.debug(f"Got {len(recommendations)} recommendations")
            
            # Format recommendations for JSON response
            formatted_recommendations = []
            for rec in recommendations:
                crop = rec['crop']
                
                # Get details needed for the frontend
                recommended_varieties = []
                for variety_tuple in rec.get('recommended_varieties', []):
                    if variety_tuple and len(variety_tuple) > 0:
                        recommended_varieties.append(variety_tuple[0])
                
                # Format irrigation data
                irrigation_data = []
                for irr in rec.get('irrigation', []):
                    irrigation_data.append({
                        'growth_stage': irr.growth_stage,
                        'water_requirement_mm': irr.water_requirement_mm,
                        'irrigation_interval_days': irr.irrigation_interval_days,
                        'critical_stages': irr.critical_stages
                    })
                
                # Build the crop recommendation data
                crop_data = {
                    'id': crop.id,
                    'name': crop.name,
                    'matchPercentage': min(95, int(rec['score']) + 15),
                    'suitability': rec['suitability'],
                    'soilMatch': True if rec['score'] > 70 else False,
                    'npkMatch': True if farm_details.nitrogen_value and farm_details.phosphorus_value and farm_details.potassium_value else False,
                    'climateMatch': True if rec['score'] > 60 else False,
                    'score': min(95, int(rec['score']) + 15),
                    'details': {
                        'bestFor': farm_details.soil_type,
                        'season': crop.growing_season,
                        'waterRequirement': rec['water_requirement'],
                        'growthPeriod': "3-4 months",  # Default value
                        'temperatureRange': f"{crop.min_temp_c}°C - {crop.max_temp_c}°C",
                        'rainfallRange': f"{rec.get('rainfall_min', 0)} - {rec.get('rainfall_max', 0)} mm",
                        'droughtResistance': rec.get('drought_resistance', 'Medium'),
                        'recommendedVarieties': recommended_varieties,
                        'irrigation': irrigation_data
                    }
                }
                
                # Add economics data if available
                try:
                    economics = CropEconomics.objects.get(crop=crop)
                    crop_data['details']['marketPrice'] = f"₹{economics.market_price_per_quintal}/quintal" if economics.market_price_per_quintal else 'Not available'
                except CropEconomics.DoesNotExist:
                    # Set default values if no economics data
                    crop_data['details']['marketPrice'] = 'Not available'

                # Add detailed soil analysis data
                # Get pH range from crop model
                crop_data['details']['phRange'] = crop.ph_range
                
                # Get suitable soil types
                crop_data['details']['suitableSoilTypes'] = crop.suitable_soil_types
                
                # Get soil compatibility scores for different soil types
                soil_compat_scores = []
                soil_compatibilities = SoilCropCompatibility.objects.filter(crop=crop)
                
                if soil_compatibilities.exists():
                    for sc in soil_compatibilities:
                        soil_compat_scores.append({
                            'soilType': sc.soil_type,
                            'score': sc.compatibility_score,
                            'yieldPotential': sc.yield_potential_percentage
                        })
                
                crop_data['details']['soilCompatibilityScores'] = soil_compat_scores
                
                # Add fertilizer recommendation data if available
                fertilizer_obj = rec.get('fertilizer')
                if fertilizer_obj:
                    crop_data['fertilizer'] = {
                        'soilType': fertilizer_obj.soil_type,
                        'n_kg_per_ha': fertilizer_obj.n_kg_per_ha,
                        'p_kg_per_ha': fertilizer_obj.p_kg_per_ha,
                        'k_kg_per_ha': fertilizer_obj.k_kg_per_ha,
                        'urea_kg_per_ha': fertilizer_obj.urea_kg_per_ha,
                        'dap_kg_per_ha': fertilizer_obj.dap_kg_per_ha,
                        'mop_kg_per_ha': fertilizer_obj.mop_kg_per_ha,
                        'npk_complex_kg_per_ha': fertilizer_obj.npk_complex_kg_per_ha,
                        'organic_alternatives': fertilizer_obj.organic_alternatives,
                        'application_schedule': fertilizer_obj.application_schedule,
                    }
                else:
                    crop_data['fertilizer'] = None
                
                formatted_recommendations.append(crop_data)
            
            response = JsonResponse({
                'success': True,
                'recommendations': formatted_recommendations
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
        except Exception as e:
            logger.error(f"Error in crop_recommendations_api: {str(e)}")
            response = JsonResponse({
                'success': False,
                'message': str(e)
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
    
    response = JsonResponse({
        'success': False,
        'message': 'Only POST requests are supported'
    })
    response['Access-Control-Allow-Origin'] = '*'
    return response

@csrf_exempt
def govt_schemes_api(request):
    """API endpoint for government scheme recommendations to be used by React frontend"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    if request.method == 'POST':
        try:
            logger.debug(f"Received POST request to govt_schemes_api: {request.body}")
            data = json.loads(request.body)
            # Extract farmer ID from request
            farmer_id = data.get('farmer_id')
            logger.debug(f"Farmer ID from request: {farmer_id}")
            
            # If no farmer ID provided, try to get from auth user
            if not farmer_id and request.user.is_authenticated:
                try:
                    farmer = FarmerProfile.objects.get(user=request.user)
                    logger.debug(f"Found farmer profile from authenticated user: {farmer.id}")
                except FarmerProfile.DoesNotExist:
                    logger.debug("No farmer profile for authenticated user")
                    return JsonResponse({
                        'success': False,
                        'message': 'Please complete your profile to get recommendations'
                    })
            else:
                try:
                    farmer = FarmerProfile.objects.get(id=farmer_id)
                    logger.debug(f"Found farmer profile with ID {farmer_id}")
                except FarmerProfile.DoesNotExist:
                    logger.debug(f"No farmer profile found with ID {farmer_id}")
                    return JsonResponse({
                        'success': False,
                        'message': 'Farmer profile not found'
                    })
            
            # Get recommendations using existing function
            logger.debug("Getting scheme recommendations")
            recommendations = get_scheme_recommendations(farmer)
            logger.debug(f"Got {len(recommendations)} recommendations")
            
            # Format recommendations for JSON response
            formatted_recommendations = []
            for rec in recommendations:
                scheme = rec['scheme']
                
                # Build the scheme recommendation data
                scheme_data = {
                    'id': scheme.id,
                    'name': scheme.name,
                    'implementing_agency': scheme.implementing_agency,
                    'relevance': rec['relevance'],
                    'land_context': rec['land_context'],
                    'crop_context': rec['crop_context'],
                    'details': {
                        'eligibility_criteria': scheme.eligibility_criteria,
                        'benefits': scheme.benefits,
                        'application_process': scheme.application_process,
                        'documents_required': scheme.documents_required,
                        'district_availability': scheme.district_availability,
                        'crop_applicability': scheme.crop_applicability,
                        'official_website': scheme.official_website,
                        'detailed_description': scheme.detailed_description,
                        'how_to_apply': scheme.how_to_apply
                    }
                }
                
                formatted_recommendations.append(scheme_data)
            
            response = JsonResponse({
                'success': True,
                'recommendations': formatted_recommendations
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
        except Exception as e:
            logger.error(f"Error in govt_schemes_api: {str(e)}")
            response = JsonResponse({
                'success': False,
                'message': str(e)
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
    
    response = JsonResponse({
        'success': False,
        'message': 'Only POST requests are supported'
    })
    response['Access-Control-Allow-Origin'] = '*'
    return response

@csrf_exempt
def loan_options_api(request):
    """API endpoint for loan options recommendations to be used by React frontend"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    if request.method == 'POST':
        try:
            logger.debug(f"Received POST request to loan_options_api: {request.body}")
            data = json.loads(request.body)
            # Extract farmer ID from request
            farmer_id = data.get('farmer_id')
            logger.debug(f"Farmer ID from request: {farmer_id}")
            
            # If no farmer ID provided, try to get from auth user
            if not farmer_id and request.user.is_authenticated:
                try:
                    farmer = FarmerProfile.objects.get(user=request.user)
                    logger.debug(f"Found farmer profile from authenticated user: {farmer.id}")
                    farmer_id = farmer.id
                except FarmerProfile.DoesNotExist:
                    logger.debug("No farmer profile for authenticated user")
                    return JsonResponse({
                        'success': False,
                        'message': 'No farmer ID provided. Please complete your profile first.',
                        'recommendations': []
                    })
            elif not farmer_id:
                logger.debug("No farmer ID provided and user not authenticated")
                return JsonResponse({
                    'success': False,
                    'message': 'No farmer ID provided. Please complete your profile first.',
                    'recommendations': []
                })
            
            # Retrieve farmer profile by ID    
            try:
                farmer = FarmerProfile.objects.get(id=farmer_id)
                logger.debug(f"Found farmer profile with ID {farmer_id}")
            except FarmerProfile.DoesNotExist:
                logger.debug(f"No farmer profile found with ID {farmer_id}")
                return JsonResponse({
                    'success': False,
                    'message': 'Farmer profile not found',
                    'recommendations': []
                })
            
            # Get financial info
            financial_info = FinancialInfo.objects.filter(farmer=farmer).first()
            
            # Get recommendations using existing function
            logger.debug("Getting loan recommendations")
            if financial_info:
                recommendations = get_loan_recommendations(farmer, financial_info)
            else:
                # Create temporary financial info
                logger.debug("Creating temporary financial info for recommendations")
                temp_financial_info = FinancialInfo(
                    farmer=farmer,
                    annual_income='1l_3l',  # Default middle income
                    bank_account=True,
                    insurance_coverage=False
                )
                recommendations = get_loan_recommendations(farmer, temp_financial_info)
            
            logger.debug(f"Got {len(recommendations)} recommendations")
            
            # Format recommendations for JSON response
            formatted_recommendations = []
            for rec in recommendations:
                loan = rec['loan']
                
                # Build the loan recommendation data
                loan_data = {
                    'id': loan.id,
                    'name': loan.name,
                    'provider': loan.provider,
                    'loan_type': loan.loan_type,
                    'interest_rate': loan.interest_rate,
                    'relevance': rec['relevance'],
                    'details': {
                        'max_amount': str(loan.max_amount),
                        'tenure': loan.tenure,
                        'eligibility': loan.eligibility,
                        'documents_required': loan.documents_required,
                        'processing_time': loan.processing_time,
                        'special_features': loan.special_features,
                        'benefits': loan.benefits  # Add benefits to the response
                    },
                    'reasons': rec.get('reasons', []),
                    'loan_category': rec.get('loan_category', 'Agricultural Loan'),
                    'processing_speed': rec.get('processing_speed', 'Normal')
                }
                
                formatted_recommendations.append(loan_data)
            
            response = JsonResponse({
                'success': True,
                'recommendations': formatted_recommendations
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
        except Exception as e:
            logger.error(f"Error in loan_options_api: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            response = JsonResponse({
                'success': False,
                'message': str(e),
                'recommendations': []
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
    
    response = JsonResponse({
        'success': False,
        'message': 'Only POST requests are supported',
        'recommendations': []
    })
    response['Access-Control-Allow-Origin'] = '*'
    return response

@csrf_exempt
def technology_api(request):
    """API endpoint for technology recommendations to be used by React frontend"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    if request.method == 'POST':
        try:
            logger.debug(f"Received POST request to technology_api: {request.body}")
            data = json.loads(request.body)
            # Extract farmer ID from request
            farmer_id = data.get('farmer_id')
            logger.debug(f"Farmer ID from request: {farmer_id}")
            
            # If no farmer ID provided, try to get from auth user
            if not farmer_id and request.user.is_authenticated:
                try:
                    farmer = FarmerProfile.objects.get(user=request.user)
                    logger.debug(f"Found farmer profile from authenticated user: {farmer.id}")
                except FarmerProfile.DoesNotExist:
                    logger.debug("No farmer profile for authenticated user")
                    return JsonResponse({
                        'success': False,
                        'message': 'Please complete your profile to get recommendations'
                    })
            else:
                try:
                    farmer = FarmerProfile.objects.get(id=farmer_id)
                    logger.debug(f"Found farmer profile with ID {farmer_id}")
                except FarmerProfile.DoesNotExist:
                    logger.debug(f"No farmer profile found with ID {farmer_id}")
                    return JsonResponse({
                        'success': False,
                        'message': 'Farmer profile not found'
                    })
            
            # Get farm details
            farm_details = FarmDetail.objects.filter(farmer=farmer).first()
            logger.debug(f"Farm details: {farm_details}")
            
            # MODIFIED: Return dummy data if farm details not found
            if not farm_details:
                logger.debug("No farm details found for farmer, returning dummy data")
                
                # Create dummy tech recommendations
                dummy_technologies = [
                    {
                        'id': 1,
                        'name': 'Drip Irrigation System',
                        'category': 'irrigation',
                        'category_display': 'Irrigation',
                        'relevance': 'High',
                        'reasoning': ['Saves up to 60% water compared to traditional irrigation', 'Increases crop yield by up to 30%', 'Reduces fertilizer leaching'],
                        'ownership_context': 'This technology works well on owned land.',
                        'difficulty': 'Medium',
                        'details': {
                            'suitable_crops': 'Vegetables, Fruits, Sugarcane',
                            'implementation_cost': '45000-60000 per acre',
                            'roi_percentage': 35,
                            'technical_requirements': 'Water source, basic maintenance knowledge',
                            'training_needs': '2-3 days basic training',
                            'supplier_contacts': 'Jain Irrigation Systems, Netafim',
                            'district_availability': 'All districts of Karnataka'
                        }
                    },
                    {
                        'id': 2,
                        'name': 'Soil Moisture Sensors',
                        'category': 'precision_agriculture',
                        'category_display': 'Precision Agriculture',
                        'relevance': 'High',
                        'reasoning': ['Optimizes irrigation schedule', 'Prevents over-watering and root diseases', 'Reduces water consumption by up to 40%'],
                        'ownership_context': 'This portable technology is particularly suitable for leased land.',
                        'difficulty': 'Low',
                        'details': {
                            'suitable_crops': 'All crops',
                            'implementation_cost': '5000-12000',
                            'roi_percentage': 25,
                            'technical_requirements': 'Minimal, basic smartphone usage',
                            'training_needs': '1 day training',
                            'supplier_contacts': 'AcSense, FarmX, local agricultural suppliers',
                            'district_availability': 'All districts'
                        }
                    },
                    {
                        'id': 3,
                        'name': 'Solar Water Pump',
                        'category': 'renewable_energy',
                        'category_display': 'Renewable Energy',
                        'relevance': 'High',
                        'reasoning': ['Reduces electricity/diesel costs', 'Environment friendly', 'Government subsidies available'],
                        'ownership_context': 'This is a long-term investment technology that\'s ideal for land owners.',
                        'difficulty': 'Medium',
                        'details': {
                            'suitable_crops': 'All irrigated crops',
                            'implementation_cost': '80000-250000',
                            'roi_percentage': 40,
                            'technical_requirements': 'Sunny location, periodic maintenance',
                            'training_needs': '2 days installation and maintenance training',
                            'supplier_contacts': 'Shakti Pumps, Tata Solar, MNRE approved vendors',
                            'district_availability': 'All districts (higher subsidy in drought-prone areas)'
                        }
                    },
                    {
                        'id': 4,
                        'name': 'Mini Tractor',
                        'category': 'mechanization',
                        'category_display': 'Farm Mechanization',
                        'relevance': 'Medium',
                        'reasoning': ['Suitable for small land holdings', 'Lower initial investment', 'Versatile for multiple operations'],
                        'ownership_context': 'This technology is well-suited for shared farming arrangements.',
                        'difficulty': 'Medium',
                        'details': {
                            'suitable_crops': 'Field crops, vegetables',
                            'implementation_cost': '250000-400000',
                            'roi_percentage': 20,
                            'technical_requirements': 'Operator training, regular maintenance',
                            'training_needs': '3-5 days training',
                            'supplier_contacts': 'Mahindra, Kubota, Sonalika',
                            'district_availability': 'All districts'
                        }
                    }
                ]
                
                response = JsonResponse({
                    'success': True,
                    'recommendations': dummy_technologies
                })
                response['Access-Control-Allow-Origin'] = '*'
                return response
            
            # Get interests
            interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
            
            # Get recommendations using existing function
            logger.debug("Getting technology recommendations")
            recommendations = get_technology_recommendations(farmer, farm_details, interests)
            logger.debug(f"Got {len(recommendations)} recommendations")
            
            # Format recommendations for JSON response
            formatted_recommendations = []
            for rec in recommendations:
                tech = rec['technology']
                
                # Build the technology recommendation data
                tech_data = {
                    'id': tech.id,
                    'name': tech.name,
                    'category': tech.category,
                    'category_display': dict(Technology.CATEGORY_CHOICES).get(tech.category, tech.category),
                    'relevance': rec['relevance'],
                    'reasoning': rec['reasoning'],
                    'ownership_context': rec['ownership_context'],
                    'difficulty': rec['difficulty'],
                    'details': {
                        'suitable_crops': tech.suitable_crops,
                        'implementation_cost': tech.implementation_cost,
                        'roi_percentage': tech.roi_percentage,
                        'technical_requirements': tech.technical_requirements,
                        'training_needs': tech.training_needs,
                        'supplier_contacts': tech.supplier_contacts,
                        'district_availability': tech.district_availability
                    }
                }
                
                formatted_recommendations.append(tech_data)
            
            response = JsonResponse({
                'success': True,
                'recommendations': formatted_recommendations
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
        except Exception as e:
            logger.error(f"Error in technology_api: {str(e)}")
            response = JsonResponse({
                'success': False,
                'message': str(e)
            })
            response['Access-Control-Allow-Origin'] = '*'
            return response
    
    response = JsonResponse({
        'success': False,
        'message': 'Only POST requests are supported'
    })
    response['Access-Control-Allow-Origin'] = '*'
    return response

# New API endpoint for saving farmer profile data
@csrf_exempt
def save_farmer_profile_api(request):
    """API endpoint to save or update farmer profile information"""
    if request.method == 'POST':
        try:
            # Parse request data
            data = json.loads(request.body)
            print("Received profile data:", data)
            
            # Extract personal info
            personal_data = data.get('personal', {})
            first_name = personal_data.get('firstName', '')
            last_name = personal_data.get('lastName', '')
            age = personal_data.get('age', None)
            gender = personal_data.get('gender', 'Male')
            district = personal_data.get('district', '')
            state = personal_data.get('state', '')
            pincode = personal_data.get('pincode', '')
            
            # Extract farm details
            farm_data = data.get('farm', {})
            farm_size_raw = farm_data.get('size', '0 Acre')
            soil_type = farm_data.get('soilType', '')
            irrigation_sources = farm_data.get('irrigationSources', [])
            irrigation_systems = farm_data.get('irrigationSystems', [])
            land_ownership = farm_data.get('landOwnership', 'Owned')
            
            # Extract financial info
            financial_data = data.get('financial', {})
            annual_income = financial_data.get('annualIncome', '')
            govt_schemes_enrolled = financial_data.get('governmentSchemes', [])
            bank_account = financial_data.get('bankAccount', 'No')
            crop_insurance = financial_data.get('cropInsurance', 'No')
            
            # Extract interests and preferences
            preferences_data = data.get('preferences', {})
            seasonal_preference = preferences_data.get('seasonalPreference', [])
            organic_farming = preferences_data.get('organicFarming', False)
            sustainable_practices = preferences_data.get('sustainablePractices', [])
            
            # Extract challenges - this is a critical part that was causing issues
            challenges = data.get('challenges', [])
            print("Challenges to save:", challenges)
            
            # Check if farmer with this name already exists
            farmer_id = data.get('id')
            farmer = None
            
            if farmer_id:
                try:
                    farmer = FarmerProfile.objects.get(id=farmer_id)
                    print(f"Found existing farmer with ID {farmer_id}")
                except FarmerProfile.DoesNotExist:
                    print(f"No farmer found with ID {farmer_id}")
                    farmer = None
            
            # If no farmer_id or farmer not found, try to find by name
            if not farmer:
                matching_farmers = FarmerProfile.objects.filter(
                    first_name=first_name,
                    last_name=last_name
                )
                
                if matching_farmers.exists():
                    farmer = matching_farmers.first()
                    print(f"Found farmer by name: {farmer.id}")
            
            # If still no farmer, create new one
            if not farmer:
                farmer = FarmerProfile.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    age=age,
                    gender=gender,
                    district=district,
                    state=state,
                    preferred_season=', '.join(seasonal_preference) if seasonal_preference else '',
                    pincode=pincode
                )
                print(f"Created new farmer with ID: {farmer.id}")
            else:
                # Update existing farmer with new data
                farmer.first_name = first_name
                farmer.last_name = last_name
                farmer.age = age
                farmer.gender = gender
                farmer.district = district
                farmer.state = state
                farmer.preferred_season = ', '.join(seasonal_preference) if seasonal_preference else ''
                farmer.pincode = pincode
                farmer.save()
            
            # Process farm details
            try:
                farm_detail = FarmDetail.objects.get(farmer=farmer)
                print(f"Found existing farm details for farmer {farmer.id}")
            except FarmDetail.DoesNotExist:
                farm_detail = FarmDetail(farmer=farmer)
                print(f"Creating new farm details for farmer {farmer.id}")
            
            # Parse farm_size_raw to extract numeric part
            if farm_size_raw:
                try:
                    # Extract the numeric part from the string (e.g., "5 Acre" -> 5)
                    farm_size_numeric = float(farm_size_raw.split()[0])
                    farm_detail.farm_size = farm_size_numeric
                    
                    # Extract the unit if available (e.g., "5 Acre" -> "Acre")
                    parts = farm_size_raw.split()
                    if len(parts) > 1:
                        farm_detail.unit = parts[1]
                except (ValueError, IndexError):
                    # If parsing fails, use a default value
                    farm_detail.farm_size = 0
                    print(f"Could not parse farm size: {farm_size_raw}")
            else:
                farm_detail.farm_size = 0
                
            farm_detail.soil_type = soil_type
            
            if isinstance(irrigation_sources, list):
                farm_detail.irrigation_sources = ', '.join(irrigation_sources)
            else:
                farm_detail.irrigation_sources = str(irrigation_sources)
                
            if isinstance(irrigation_systems, list):
                farm_detail.irrigation_systems = ', '.join(irrigation_systems)
            else:
                farm_detail.irrigation_systems = str(irrigation_systems)
                
            farm_detail.land_ownership = land_ownership
            
            # Add NPK and pH values if provided
            if 'nitrogenValue' in farm_data and farm_data['nitrogenValue']:
                farm_detail.nitrogen_value = float(farm_data['nitrogenValue'])
            if 'phosphorusValue' in farm_data and farm_data['phosphorusValue']:
                farm_detail.phosphorus_value = float(farm_data['phosphorusValue'])
            if 'potassiumValue' in farm_data and farm_data['potassiumValue']:
                farm_detail.potassium_value = float(farm_data['potassiumValue'])
            if 'soilPh' in farm_data and farm_data['soilPh']:
                farm_detail.ph_value = float(farm_data['soilPh'])
                
            farm_detail.save()
            
            # Process financial info
            try:
                financial_info = FinancialInfo.objects.get(farmer=farmer)
                print(f"Found existing financial info for farmer {farmer.id}")
            except FinancialInfo.DoesNotExist:
                financial_info = FinancialInfo(farmer=farmer)
                print(f"Creating new financial info for farmer {farmer.id}")
            
            financial_info.annual_income = annual_income
            
            if isinstance(govt_schemes_enrolled, list):
                financial_info.govt_schemes_enrolled = ', '.join(govt_schemes_enrolled)
            else:
                financial_info.govt_schemes_enrolled = str(govt_schemes_enrolled)
                
            financial_info.bank_account = bank_account == 'Yes'
            financial_info.insurance_coverage = crop_insurance == 'Yes'
            financial_info.save()
            
            # Process interests and challenges - CRITICAL FIX HERE
            try:
                farmer_interest = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
                if not farmer_interest:
                    farmer_interest = FarmerInterest(farmer=farmer)
                    print(f"Creating new interests for farmer {farmer.id}")
            except Exception as e:
                farmer_interest = FarmerInterest(farmer=farmer)
                print(f"Exception in farmer interests, creating new: {str(e)}")
            
            if isinstance(sustainable_practices, list):
                farmer_interest.sustainable_practices = ', '.join(sustainable_practices)
            else:
                farmer_interest.sustainable_practices = str(sustainable_practices)
                
            # IMPORTANT: Save the challenges properly
            if isinstance(challenges, list):
                farmer_interest.challenges = ', '.join(challenges)
                print(f"Saved farmer challenges: {farmer_interest.challenges}")
            else:
                farmer_interest.challenges = str(challenges)
                print(f"Saved farmer challenges (from string): {farmer_interest.challenges}")
                
            farmer_interest.organic_farming_interest = organic_farming
            farmer_interest.save()
            
            # Return success with farmer_id
            return JsonResponse({
                'success': True,
                'message': 'Farmer profile updated successfully',
                'farmer_id': farmer.id
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': f'Error saving farmer profile: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)

@csrf_exempt
def farmer_scheme_recommendations(request, farmer_id):
    """API endpoint to get government scheme recommendations for a farmer"""
    if request.method == 'GET':
        try:
            farmer = FarmerProfile.objects.get(id=farmer_id)
            
            # Get farmer interests to access challenges
            interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
            farmer_challenges = []
            if interests and interests.challenges:
                farmer_challenges = [c.strip() for c in interests.challenges.split(',') if c.strip()]
            
            # Log farmer challenges for debugging
            print(f"Farmer ID {farmer_id} challenges: {farmer_challenges}")
            
            recommendations = get_scheme_recommendations(farmer)
            
            # Convert to JSON serializable format
            serialized_recommendations = []
            for rec in recommendations:
                scheme_dict = model_to_dict(rec['scheme'])
                
                # Extract most relevant challenge for this scheme
                # Instead of using the first challenge match, use the one with highest relevance
                primary_challenge = ""
                
                # If any challenges were matched specifically for this scheme
                if 'matched_challenges' in rec and rec['matched_challenges']:
                    primary_challenge = rec['matched_challenges'][0]
                # If no specific matches, check reasons for challenge references
                elif rec.get('reasons'):
                    for reason in rec.get('reasons', []):
                        if "Addresses your challenge:" in reason:
                            challenge_part = reason.replace("Addresses your challenge:", "").strip()
                            if challenge_part in farmer_challenges:
                                primary_challenge = challenge_part
                                break
                
                # Keep reasons list from recommendation
                serialized_recommendations.append({
                    'scheme': scheme_dict,
                    'relevance': rec['relevance'],
                    'reasons': rec.get('reasons', []),
                    'addresses_challenge': primary_challenge or rec.get('addresses_challenge', ''),
                    'designed_for': rec.get('designed_for', ''),
                    'matched_challenges': rec.get('matched_challenges', [])
                })
                
            return JsonResponse(serialized_recommendations, safe=False)
        except FarmerProfile.DoesNotExist:
            return JsonResponse({'error': 'Farmer not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def farmer_loan_recommendations(request, farmer_id):
    """API endpoint to get loan recommendations for a farmer"""
    if request.method == 'GET':
        try:
            print(f"Processing loan recommendations request for farmer ID: {farmer_id}")
            farmer = FarmerProfile.objects.get(id=farmer_id)
            print(f"Found farmer: {farmer.first_name} {farmer.last_name}")
            
            # Get financial information with more robust handling
            financial_info = FinancialInfo.objects.filter(farmer=farmer).first()
            
            if not financial_info:
                print(f"No financial information found for farmer ID: {farmer_id}")
                # Create default financial info instead of returning error
                financial_info = FinancialInfo.objects.create(
                    farmer=farmer,
                    annual_income='1l_3l',  # Default to middle-income range
                    bank_account=True,
                    insurance_coverage=False
                )
                print(f"Created default financial info for farmer ID: {farmer_id}")
                
            # Get farmer interests for debugging
            interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
            if interests and interests.challenges:
                challenges = [c.strip() for c in interests.challenges.split(',') if c.strip()]
                print(f"Farmer challenges: {challenges}")
            else:
                print(f"No challenges found for farmer ID: {farmer_id}")
                
            print(f"Getting loan recommendations for farmer ID: {farmer_id}")
            recommendations = get_loan_recommendations(farmer, financial_info)
            print(f"Found {len(recommendations)} loan recommendations")
            
            # Convert to JSON serializable format
            serialized_recommendations = []
            for rec in recommendations:
                try:
                    loan_dict = model_to_dict(rec['loan'])
                    serialized_rec = {
                        'loan': loan_dict,
                        'relevance': rec['relevance'],
                        'reasons': rec.get('reasons', []),
                        'loan_category': rec.get('loan_category', 'Agricultural Loan'),
                        'processing_speed': rec.get('processing_speed', 'Normal')
                    }
                    serialized_recommendations.append(serialized_rec)
                except Exception as e:
                    print(f"Error serializing recommendation: {str(e)}")
                    continue
                
            print(f"Returning {len(serialized_recommendations)} serialized recommendations")
            return JsonResponse(serialized_recommendations, safe=False)
        except FarmerProfile.DoesNotExist:
            print(f"Farmer not found with ID: {farmer_id}")
            return JsonResponse({'error': 'Farmer not found'}, status=404)
        except Exception as e:
            import traceback
            print(f"Error in loan recommendations: {str(e)}")
            print(traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin API Functions

from django.contrib.auth import get_user_model
User = get_user_model()

@csrf_exempt
def admin_dashboard_stats(request):
    """Get statistics for the admin dashboard"""
    if request.method == 'GET':
        try:
            # Check if the user is authenticated as admin
            # Using token authentication here, extract from Authorization header
            if 'Authorization' in request.headers:
                token = request.headers['Authorization'].split(' ')[1]
                try:
                    # You would typically validate the token here
                    # For now, we'll let it pass for demo purposes
                    pass
                except Exception:
                    return JsonResponse({'error': 'Invalid token'}, status=401)
            else:
                # For demo purposes, allow access for now
                pass
            
            # Get counts of various objects
            crops_count = Crop.objects.count()
            technologies_count = Technology.objects.count()
            schemes_count = GovernmentScheme.objects.count()
            loans_count = LoanOption.objects.count()
            users_count = User.objects.filter(is_staff=False).count()
            
            stats = {
                'cropsCount': crops_count,
                'technologiesCount': technologies_count,
                'schemesCount': schemes_count,
                'loansCount': loans_count,
                'usersCount': users_count,
            }
            
            return JsonResponse(stats)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Crop API
@csrf_exempt
def admin_crops_list(request):
    """List and create crops"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                crops = Crop.objects.filter(name__icontains=search_query)
            else:
                crops = Crop.objects.all()
            
            crops_data = []
            for crop in crops:
                crops_data.append({
                    'id': crop.id,
                    'name': crop.name,
                    'scientific_name': crop.scientific_name,
                    'growing_season': crop.growing_season,
                    'cultivation_practices': crop.cultivation_practices,
                    'water_requirement_mm': crop.water_requirement_mm,
                    'min_temp_c': crop.min_temp_c,
                    'max_temp_c': crop.max_temp_c,
                    'ph_range': crop.ph_range,
                    'suitable_soil_types': crop.suitable_soil_types,
                    'varieties': crop.varieties,
                })
            
            return JsonResponse(crops_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new crop
            crop = Crop.objects.create(
                name=data.get('name'),
                scientific_name=data.get('scientific_name', ''),
                growing_season=data.get('growing_season', ''),
                cultivation_practices=data.get('cultivation_practices', ''),
                water_requirement_mm=float(data.get('water_requirement_mm', 0)),
                min_temp_c=float(data.get('min_temp_c', 0)),
                max_temp_c=float(data.get('max_temp_c', 0)),
                ph_range=data.get('ideal_soil_ph', ''),
                suitable_soil_types=data.get('suitable_soil_types', ''),
                varieties=data.get('varieties', '')
            )
            
            return JsonResponse({
                'id': crop.id,
                'name': crop.name,
                'message': 'Crop created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_crop_detail(request, id):
    """Retrieve, update or delete a crop"""
    try:
        crop = Crop.objects.get(pk=id)
    except Crop.DoesNotExist:
        return JsonResponse({'error': 'Crop not found'}, status=404)
    
    if request.method == 'GET':
        crop_data = {
            'id': crop.id,
            'name': crop.name,
            'scientific_name': crop.scientific_name,
            'growing_season': crop.growing_season,
            'cultivation_practices': crop.cultivation_practices,
            'water_requirement_mm': crop.water_requirement_mm,
            'min_temp_c': crop.min_temp_c,
            'max_temp_c': crop.max_temp_c,
            'ph_range': crop.ph_range,
            'suitable_soil_types': crop.suitable_soil_types,
            'varieties': crop.varieties,
        }
        return JsonResponse(crop_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update crop fields
            crop.name = data.get('name', crop.name)
            crop.scientific_name = data.get('scientific_name', crop.scientific_name)
            crop.growing_season = data.get('growing_season', crop.growing_season)
            crop.cultivation_practices = data.get('cultivation_practices', crop.cultivation_practices)
            crop.water_requirement_mm = float(data.get('water_requirement_mm', crop.water_requirement_mm))
            crop.min_temp_c = float(data.get('min_temp_c', crop.min_temp_c))
            crop.max_temp_c = float(data.get('max_temp_c', crop.max_temp_c))
            crop.ph_range = data.get('ideal_soil_ph', crop.ph_range)
            crop.suitable_soil_types = data.get('suitable_soil_types', crop.suitable_soil_types)
            crop.varieties = data.get('varieties', crop.varieties)
            
            crop.save()
            
            return JsonResponse({
                'id': crop.id,
                'name': crop.name,
                'message': 'Crop updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        crop.delete()
        return JsonResponse({'message': 'Crop deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Technology API
@csrf_exempt
def admin_technologies_list(request):
    """List and create technologies"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                technologies = Technology.objects.filter(name__icontains=search_query)
            else:
                technologies = Technology.objects.all()
            
            technologies_data = []
            for tech in technologies:
                technologies_data.append({
                    'id': tech.id,
                    'name': tech.name,
                    'category': tech.category,
                    'suitable_crops': tech.suitable_crops,
                    'implementation_cost': tech.implementation_cost,
                    'roi_percentage': tech.roi_percentage,
                    'technical_requirements': tech.technical_requirements,
                    'training_needs': tech.training_needs,
                    'supplier_contacts': tech.supplier_contacts,
                    'district_availability': tech.district_availability,
                })
            
            return JsonResponse(technologies_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new technology
            tech = Technology.objects.create(
                name=data.get('name'),
                category=data.get('category', 'other'),
                suitable_crops=data.get('suitable_crops', 'All'),
                implementation_cost=float(data.get('implementation_cost', 0)),
                roi_percentage=float(data.get('roi_percentage', 0)),
                technical_requirements=data.get('technical_requirements', ''),
                training_needs=data.get('training_needs', ''),
                supplier_contacts=data.get('supplier_contacts', ''),
                district_availability=data.get('district_availability', 'All Districts')
            )
            
            return JsonResponse({
                'id': tech.id,
                'name': tech.name,
                'message': 'Technology created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_technology_detail(request, id):
    """Retrieve, update or delete a technology"""
    try:
        tech = Technology.objects.get(pk=id)
    except Technology.DoesNotExist:
        return JsonResponse({'error': 'Technology not found'}, status=404)
    
    if request.method == 'GET':
        tech_data = {
            'id': tech.id,
            'name': tech.name,
            'category': tech.category,
            'suitable_crops': tech.suitable_crops,
            'implementation_cost': tech.implementation_cost,
            'roi_percentage': tech.roi_percentage,
            'technical_requirements': tech.technical_requirements,
            'training_needs': tech.training_needs,
            'supplier_contacts': tech.supplier_contacts,
            'district_availability': tech.district_availability,
        }
        return JsonResponse(tech_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update technology fields
            tech.name = data.get('name', tech.name)
            tech.category = data.get('category', tech.category)
            tech.suitable_crops = data.get('suitable_crops', tech.suitable_crops)
            tech.implementation_cost = float(data.get('implementation_cost', tech.implementation_cost))
            tech.roi_percentage = float(data.get('roi_percentage', tech.roi_percentage))
            tech.technical_requirements = data.get('technical_requirements', tech.technical_requirements)
            tech.training_needs = data.get('training_needs', tech.training_needs)
            tech.supplier_contacts = data.get('supplier_contacts', tech.supplier_contacts)
            tech.district_availability = data.get('district_availability', tech.district_availability)
            
            tech.save()
            
            return JsonResponse({
                'id': tech.id,
                'name': tech.name,
                'message': 'Technology updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        tech.delete()
        return JsonResponse({'message': 'Technology deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Scheme API
@csrf_exempt
def admin_schemes_list(request):
    """List and create government schemes"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                schemes = GovernmentScheme.objects.filter(name__icontains=search_query)
            else:
                schemes = GovernmentScheme.objects.all()
            
            schemes_data = []
            for scheme in schemes:
                schemes_data.append({
                    'id': scheme.id,
                    'name': scheme.name,
                    'implementing_agency': scheme.implementing_agency,
                    'eligibility_criteria': scheme.eligibility_criteria,
                    'benefits': scheme.benefits,
                    'application_process': scheme.application_process,
                    'documents_required': scheme.documents_required,
                    'district_availability': scheme.district_availability,
                    'crop_applicability': scheme.crop_applicability,
                    'official_website': scheme.official_website,
                    'detailed_description': scheme.detailed_description,
                    'how_to_apply': scheme.how_to_apply
                })
            
            return JsonResponse(schemes_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new scheme
            scheme = GovernmentScheme.objects.create(
                name=data.get('name'),
                implementing_agency=data.get('implementing_agency', ''),
                eligibility_criteria=data.get('eligibility_criteria', ''),
                benefits=data.get('benefits', ''),
                application_process=data.get('application_process', ''),
                documents_required=data.get('documents_required', ''),
                district_availability=data.get('district_availability', 'All Districts'),
                crop_applicability=data.get('crop_applicability', 'All'),
                official_website=data.get('official_website', ''),
                detailed_description=data.get('detailed_description', ''),
                how_to_apply=data.get('how_to_apply', '')
            )
            
            return JsonResponse({
                'id': scheme.id,
                'name': scheme.name,
                'message': 'Scheme created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_scheme_detail(request, id):
    """Retrieve, update or delete a government scheme"""
    try:
        scheme = GovernmentScheme.objects.get(pk=id)
    except GovernmentScheme.DoesNotExist:
        return JsonResponse({'error': 'Scheme not found'}, status=404)
    
    if request.method == 'GET':
        scheme_data = {
            'id': scheme.id,
            'name': scheme.name,
            'implementing_agency': scheme.implementing_agency,
            'eligibility_criteria': scheme.eligibility_criteria,
            'benefits': scheme.benefits,
            'application_process': scheme.application_process,
            'documents_required': scheme.documents_required,
            'district_availability': scheme.district_availability,
            'crop_applicability': scheme.crop_applicability,
            'official_website': scheme.official_website,
            'detailed_description': scheme.detailed_description,
            'how_to_apply': scheme.how_to_apply
        }
        return JsonResponse(scheme_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update scheme fields
            scheme.name = data.get('name', scheme.name)
            scheme.implementing_agency = data.get('implementing_agency', scheme.implementing_agency)
            scheme.eligibility_criteria = data.get('eligibility_criteria', scheme.eligibility_criteria)
            scheme.benefits = data.get('benefits', scheme.benefits)
            scheme.application_process = data.get('application_process', scheme.application_process)
            scheme.documents_required = data.get('documents_required', scheme.documents_required)
            scheme.district_availability = data.get('district_availability', scheme.district_availability)
            scheme.crop_applicability = data.get('crop_applicability', scheme.crop_applicability)
            scheme.official_website = data.get('official_website', scheme.official_website)
            scheme.detailed_description = data.get('detailed_description', scheme.detailed_description)
            scheme.how_to_apply = data.get('how_to_apply', scheme.how_to_apply)
            
            scheme.save()
            
            return JsonResponse({
                'id': scheme.id,
                'name': scheme.name,
                'message': 'Scheme updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        scheme.delete()
        return JsonResponse({'message': 'Scheme deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Loan API
@csrf_exempt
def admin_loans_list(request):
    """List and create loan options"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                loans = LoanOption.objects.filter(name__icontains=search_query)
            else:
                loans = LoanOption.objects.all()
            
            loans_data = []
            for loan in loans:
                loans_data.append({
                    'id': loan.id,
                    'name': loan.name,
                    'provider': loan.provider,
                    'loan_type': loan.loan_type,
                    'interest_rate': loan.interest_rate,
                    'max_amount': loan.max_amount,
                    'tenure': loan.tenure,
                    'eligibility': loan.eligibility,
                    'documents_required': loan.documents_required,
                    'processing_time': loan.processing_time,
                    'special_features': loan.special_features
                })
            
            return JsonResponse(loans_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new loan
            loan = LoanOption.objects.create(
                name=data.get('name'),
                provider=data.get('provider', ''),
                loan_type=data.get('loan_type', ''),
                interest_rate=data.get('interest_rate', ''),
                max_amount=data.get('max_amount', '0'),
                tenure=data.get('tenure', ''),
                eligibility=data.get('eligibility', ''),
                documents_required=data.get('documents_required', ''),
                processing_time=data.get('processing_time', ''),
                special_features=data.get('special_features', '')
            )
            
            return JsonResponse({
                'id': loan.id,
                'name': loan.name,
                'message': 'Loan option created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_loan_detail(request, id):
    """Retrieve, update or delete a loan option"""
    try:
        loan = LoanOption.objects.get(pk=id)
    except LoanOption.DoesNotExist:
        return JsonResponse({'error': 'Loan option not found'}, status=404)
    
    if request.method == 'GET':
        loan_data = {
            'id': loan.id,
            'name': loan.name,
            'provider': loan.provider,
            'loan_type': loan.loan_type,
            'interest_rate': loan.interest_rate,
            'max_amount': loan.max_amount,
            'tenure': loan.tenure,
            'eligibility': loan.eligibility,
            'documents_required': loan.documents_required,
            'processing_time': loan.processing_time,
            'special_features': loan.special_features
        }
        return JsonResponse(loan_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update loan fields
            loan.name = data.get('name', loan.name)
            loan.provider = data.get('provider', loan.provider)
            loan.loan_type = data.get('loan_type', loan.loan_type)
            loan.interest_rate = data.get('interest_rate', loan.interest_rate)
            loan.max_amount = data.get('max_amount', loan.max_amount)
            loan.tenure = data.get('tenure', loan.tenure)
            loan.eligibility = data.get('eligibility', loan.eligibility)
            loan.documents_required = data.get('documents_required', loan.documents_required)
            loan.processing_time = data.get('processing_time', loan.processing_time)
            loan.special_features = data.get('special_features', loan.special_features)
            
            loan.save()
            
            return JsonResponse({
                'id': loan.id,
                'name': loan.name,
                'message': 'Loan option updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        loan.delete()
        return JsonResponse({'message': 'Loan option deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin User API
@csrf_exempt
def admin_users_list(request):
    """List and create users"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                users = User.objects.filter(
                    username__icontains=search_query
                ) | User.objects.filter(
                    email__icontains=search_query
                )
                
                # Also search in FarmerProfile
                user_ids_from_profile = FarmerProfile.objects.filter(
                    first_name__icontains=search_query
                ) | FarmerProfile.objects.filter(
                    last_name__icontains=search_query
                ) | FarmerProfile.objects.filter(
                    district__icontains=search_query
                )
                
                users = users | User.objects.filter(id__in=[profile.user.id for profile in user_ids_from_profile])
            else:
                users = User.objects.all()
            
            users_data = []
            for user in users:
                # Get associated farmer profile if exists
                try:
                    profile = FarmerProfile.objects.get(user=user)
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': profile.first_name,
                        'last_name': profile.last_name,
                        'is_staff': user.is_staff,
                        'is_active': user.is_active,
                        'district': profile.district,
                        'state': profile.state,
                        'last_login': user.last_login,
                        'date_joined': user.date_joined
                    })
                except FarmerProfile.DoesNotExist:
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                        'is_active': user.is_active,
                        'district': None,
                        'state': None,
                        'last_login': user.last_login,
                        'date_joined': user.date_joined
                    })
            
            return JsonResponse(users_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new user
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email', ''),
                password=data.get('password', 'defaultpassword')  # Default password that should be changed
            )
            
            user.first_name = data.get('first_name', '')
            user.last_name = data.get('last_name', '')
            user.is_staff = data.get('is_staff', False)
            user.is_active = data.get('is_active', True)
            user.save()
            
            # Create farmer profile if details provided
            if data.get('district') or data.get('state'):
                FarmerProfile.objects.create(
                    user=user,
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                    district=data.get('district', ''),
                    state=data.get('state', 'Karnataka')
                )
            
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'message': 'User created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_user_detail(request, id):
    """Retrieve, update or delete a user"""
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    if request.method == 'GET':
        try:
            profile = FarmerProfile.objects.get(user=user)
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'district': profile.district,
                'state': profile.state,
                'last_login': user.last_login,
                'date_joined': user.date_joined
            }
        except FarmerProfile.DoesNotExist:
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'district': None,
                'state': None,
                'last_login': user.last_login,
                'date_joined': user.date_joined
            }
        return JsonResponse(user_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update user fields
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.is_staff = data.get('is_staff', user.is_staff)
            user.is_active = data.get('is_active', user.is_active)
            
            # If password provided, update it
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                
            user.save()
            
            # Update or create farmer profile
            profile, created = FarmerProfile.objects.get_or_create(user=user)
            profile.first_name = data.get('first_name', profile.first_name)
            profile.last_name = data.get('last_name', profile.last_name)
            profile.district = data.get('district', profile.district)
            profile.state = data.get('state', profile.state)
            profile.save()
            
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'message': 'User updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        user.delete()
        return JsonResponse({'message': 'User deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def farmer_profile_api(request, farmer_id):
    """API endpoint to get farmer profile information for debugging/frontend use"""
    if request.method == 'GET':
        try:
            farmer = FarmerProfile.objects.get(id=farmer_id)
            farm_details = FarmDetail.objects.filter(farmer=farmer).first()
            experiences = FarmingExperience.objects.filter(farmer=farmer).all()
            financial_info = FinancialInfo.objects.filter(farmer=farmer).first()
            interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
            
            # Extract crop names
            cultivated_crops = []
            for exp in experiences:
                if exp.crop:
                    cultivated_crops.append(exp.crop.name)
            
            # Build response
            response_data = {
                'personal': {
                    'firstName': farmer.first_name,
                    'lastName': farmer.last_name,
                    'fullName': f"{farmer.first_name} {farmer.last_name}".strip(),
                    'age': farmer.age,
                    'gender': farmer.gender,
                    'district': farmer.district,
                    'state': farmer.state
                },
                'farm': {
                    'size': farm_details.farm_size if farm_details else None,
                    'soilType': farm_details.soil_type if farm_details else None,
                    'irrigationSources': farm_details.irrigation_sources.split(', ') if farm_details and farm_details.irrigation_sources else [],
                    'irrigationSystems': farm_details.irrigation_systems.split(', ') if farm_details and farm_details.irrigation_systems else [],
                    'landOwnership': farm_details.land_ownership if farm_details else None,
                    'mainCrops': cultivated_crops
                }
            }
            
            # Add financial info if available
            if financial_info:
                response_data['financial'] = {
                    'annualIncome': financial_info.annual_income,
                    'govtSchemesEnrolled': financial_info.govt_schemes_enrolled.split(',') if financial_info.govt_schemes_enrolled else [],
                    'bankAccount': financial_info.bank_account,
                    'insuranceCoverage': financial_info.insurance_coverage
                }
            
            # Add interests and challenges if available
            if interests:
                response_data['interests'] = {
                    'sustainablePractices': interests.sustainable_practices.split(',') if interests.sustainable_practices else [],
                    'challenges': interests.challenges.split(',') if interests.challenges else []
                }
            
            return JsonResponse(response_data)
        except FarmerProfile.DoesNotExist:
            # Return dummy data that matches the expected structure
            print(f"Farmer profile with ID {farmer_id} not found, returning dummy data")
            dummy_profile = {
                'personal': {
                    'firstName': 'Sujalkamble',
                    'lastName': 'fsdfdf',
                    'fullName': 'Sujalkamble fsdfdf',
                    'age': 45,
                    'gender': 'Male',
                    'district': 'uttar kannada',
                    'state': 'Karnataka'
                },
                'farm': {
                    'size': 5,
                    'soilType': 'Clay',
                    'nitrogenValue': 45,
                    'phosphorusValue': 53,
                    'potassiumValue': 33,
                    'soilPh': 5,
                    'irrigationSources': ['Well', 'Canal'],
                    'irrigationSystems': ['Drip', 'Sprinkler'],
                    'landOwnership': 'Owned',
                    'mainCrops': ['Rice', 'Wheat', 'Maize']
                },
                'financial': {
                    'annualIncome': '300000-500000',
                    'govtSchemesEnrolled': ['PM-KISAN', 'Soil Health Card'],
                    'bankAccount': 'Yes',
                    'insuranceCoverage': 'Yes'
                },
                'interests': {
                    'sustainablePractices': ['Crop Rotation', 'Mulching', 'Integrated Pest Management'],
                    'challenges': ['Water Access', 'Labor Shortage', 'Pest Management', 'Market Access', 'Crop Financing']
                }
            }
            return JsonResponse(dummy_profile)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Debug endpoints
@csrf_exempt
def debug_loans_list(request):
    """Debug endpoint to list all loans"""
    try:
        loans = LoanOption.objects.all()
        loans_data = []
        
        for loan in loans:
            loans_data.append({
                'id': loan.id,
                'name': loan.name,
                'provider': loan.provider,
                'loan_type': loan.loan_type,
                'interest_rate': loan.interest_rate,
                'max_amount': str(loan.max_amount),
                'tenure': loan.tenure,
                'eligibility': loan.eligibility[:100] + '...' if len(loan.eligibility) > 100 else loan.eligibility,
                'documents_required': loan.documents_required[:100] + '...' if len(loan.documents_required) > 100 else loan.documents_required,
                'special_features': loan.special_features[:100] + '...' if len(loan.special_features) > 100 else loan.special_features
            })
        
        return JsonResponse({
            'count': len(loans_data),
            'loans': loans_data
        })
    except Exception as e:
        import traceback
        print(f"Error in debug_loans_list: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def debug_farmer_profile(request, farmer_id):
    """Debug endpoint to get farmer profile data"""
    try:
        farmer = FarmerProfile.objects.get(id=farmer_id)
        
        # Get financial info
        financial_info = FinancialInfo.objects.filter(farmer=farmer).first()
        financial_data = {
            'annual_income': financial_info.annual_income if financial_info else None,
            'govt_schemes_enrolled': financial_info.govt_schemes_enrolled if financial_info else None,
            'insurance_coverage': financial_info.insurance_coverage if financial_info else None,
            'bank_account': financial_info.bank_account if financial_info else None,
        }
        
        # Get farm details
        farm_details = FarmDetail.objects.filter(farmer=farmer).first()
        farm_data = {
            'farm_size': farm_details.farm_size if farm_details else None,
            'unit': farm_details.unit if farm_details else None,
            'soil_type': farm_details.soil_type if farm_details else None,
            'land_ownership': farm_details.land_ownership if farm_details else None,
            'irrigation_sources': farm_details.irrigation_sources if farm_details else None,
            'irrigation_systems': farm_details.irrigation_systems if farm_details else None,
        }
        
        # Get farmer interests
        interests = FarmerInterest.objects.filter(farmer=farmer).order_by('-id').first()
        interests_data = {
            'sustainable_practices': interests.sustainable_practices.split(',') if interests and interests.sustainable_practices else [],
            'challenges': interests.challenges.split(',') if interests and interests.challenges else [],
            'organic_farming_interest': interests.organic_farming_interest if interests else False,
        }
        
        # Get farming experiences
        experiences = FarmingExperience.objects.filter(farmer=farmer)
        experience_data = []
        for exp in experiences:
            experience_data.append({
                'crop': exp.crop.name if exp.crop else None,
                'years_experience': exp.years_experience,
                'challenges_faced': exp.challenges_faced,
            })
        
        return JsonResponse({
            'farmer': {
                'id': farmer.id,
                'first_name': farmer.first_name,
                'last_name': farmer.last_name,
                'district': farmer.district,
                'state': farmer.state,
                'preferred_season': farmer.preferred_season,
            },
            'financial_info': financial_data,
            'farm_details': farm_data,
            'interests': interests_data,
            'experiences': experience_data,
        })
        
    except FarmerProfile.DoesNotExist:
        return JsonResponse({'error': 'Farmer not found'}, status=404)
    except Exception as e:
        import traceback
        print(f"Error in debug_farmer_profile: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)