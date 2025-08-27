import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from main_app.models import (
    District, Crop, CropEconomics, Technology, GovernmentScheme, 
    LoanOption, OrganicPractice, PestDisease, SoilCropCompatibility,
    FertilizerRecommendation, IrrigationRequirement
)

class Command(BaseCommand):
    help = 'Import data from CSV files to database'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data import...')
        
        # Import districts
        self.import_districts()
        
        # Import crops
        self.import_crops()
        
        # Import crop economics
        self.import_crop_economics()
        
        # Import technologies
        self.import_technologies()
        
        # Import government schemes
        self.import_government_schemes()
        
        # Import loan options
        self.import_loan_options()
        
        # Import organic practices
        self.import_organic_practices()
        
        # Import pest and disease management
        self.import_pest_disease()
        
        # Import soil-crop compatibility
        self.import_soil_crop_compatibility()
        
        # Import fertilizer recommendations
        self.import_fertilizer_recommendations()
        
        # Import irrigation requirements
        self.import_irrigation_requirements()
        
        self.stdout.write(self.style.SUCCESS('Data import completed successfully!'))
    
    def import_districts(self):
        self.stdout.write('Importing districts...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'district.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                District.objects.update_or_create(
                    name=row['district_name'],
                    defaults={
                        'region': row['region'],
                        'avg_annual_rainfall_mm': float(row['avg_annual_rainfall_mm']),
                        'min_temp_c': float(row['min_temp_c']),
                        'max_temp_c': float(row['max_temp_c']),
                        'major_soil_types': row['major_soil_types']
                    }
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {District.objects.count()} districts'))
    
    def import_crops(self):
        self.stdout.write('Importing crops...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'crops.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Skip header rows that might appear in the middle of the file
                if row['name'] == 'Crop' or row['name'] == 'name':
                    continue
                    
                try:
                    # Normalize growing season to include Zaid where Summer is mentioned
                    growing_season = row.get('growing_season', '')
                    if 'Summer' in growing_season and 'Zaid' not in growing_season:
                        growing_season = growing_season.replace('Summer', 'Summer, Zaid')
                    
                    Crop.objects.update_or_create(
                        name=row['name'].strip('"'),
                        defaults={
                            'scientific_name': row.get('scientific_name', '').strip('"'),
                            'varieties': row.get('varieties', ''),
                            'suitable_soil_types': row.get('suitable_soil_types', ''),
                            'growing_season': growing_season,
                            'water_requirement_mm': float(row.get('water_requirement_mm', 0)),
                            'avg_yield_q_per_ha': float(row.get('avg_yield_q_per_ha', 0)),
                            'min_temp_c': float(row.get('min_temp_c', 0)),
                            'max_temp_c': float(row.get('max_temp_c', 0)),
                            'n_requirement_kg_per_ha': float(row.get('n_requirement_kg_per_ha', 0)),
                            'p_requirement_kg_per_ha': float(row.get('p_requirement_kg_per_ha', 0)),
                            'k_requirement_kg_per_ha': float(row.get('k_requirement_kg_per_ha', 0)),
                            'ph_range': row.get('ph_range', ''),
                            'cultivation_practices': row.get('cultivation_practices', '')
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing crop {row["name"]}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {Crop.objects.count()} crops'))
    
    def import_crop_economics(self):
        self.stdout.write('Importing crop economics...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'crop_economics.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Find the crop - handle names with parentheses
                    full_crop_name = row.get('Crop Name', '').strip()
                    if not full_crop_name:
                        continue
                    
                    # Extract main crop name before parentheses if present
                    if '(' in full_crop_name:
                        crop_name = full_crop_name.split('(')[0].strip()
                    else:
                        crop_name = full_crop_name
                        
                    # Try to find the crop by name
                    crop = Crop.objects.filter(name__iexact=crop_name).first()
                    
                    if not crop:
                        # If not found, try with the full name
                        crop = Crop.objects.filter(name__iexact=full_crop_name).first()
                    
                    if crop:
                        # Extract numeric values from string fields
                        market_price_str = row.get('Avg. Market Price (₹/Quintal)', '0')
                        market_price = ''.join(filter(lambda x: x.isdigit() or x == '.', market_price_str))
                        
                        cost_per_hectare_str = row.get('Cost per Hectare (₹)', '0')
                        cost_per_hectare = ''.join(filter(lambda x: x.isdigit() or x == '.', cost_per_hectare_str))
                        
                        # Calculate gross and net income
                        avg_yield = crop.avg_yield_q_per_ha
                        market_price_float = float(market_price) if market_price else 0
                        cost_float = float(cost_per_hectare) if cost_per_hectare else 0
                        
                        gross_income = avg_yield * market_price_float
                        net_income = gross_income - cost_float
                        
                        # Calculate ROI percentage
                        roi_percentage = (net_income / cost_float * 100) if cost_float > 0 else 0
                        
                        # Get additional fields from CSV
                        growth_period = row.get('Growth Period', '')
                        market_demand = row.get('Market Demand', '')
                        water_requirement = row.get('Water Requirement', '')
                        
                        # Get temperature range
                        temp_min = row.get('Temperature Range Min (°C)', '')
                        temp_max = row.get('Temperature Range Max (°C)', '')
                        temp_min_float = float(temp_min) if temp_min and temp_min.replace('.', '', 1).isdigit() else None
                        temp_max_float = float(temp_max) if temp_max and temp_max.replace('.', '', 1).isdigit() else None
                        
                        # Get rainfall range
                        rainfall_min = row.get('Rainfall Range Min (mm)', '')
                        rainfall_max = row.get('Rainfall Range Max (mm)', '')
                        rainfall_min_float = float(rainfall_min) if rainfall_min and rainfall_min.replace('.', '', 1).isdigit() else None
                        rainfall_max_float = float(rainfall_max) if rainfall_max and rainfall_max.replace('.', '', 1).isdigit() else None
                        
                        # Get pH range and drought resistance
                        ph_range = row.get('pH Range', '')
                        drought_resistance = row.get('Drought Resistance', '')
                        
                        # Get notes
                        notes = row.get('Notes', '')
                        
                        CropEconomics.objects.update_or_create(
                            crop=crop,
                            defaults={
                                'cost_of_cultivation_per_ha': cost_float,
                                'expected_yield_q_per_ha': avg_yield,
                                'market_price_per_quintal': market_price_float,
                                'gross_income_per_ha': gross_income,
                                'net_income_per_ha': net_income,
                                'roi_percentage': roi_percentage,
                                'growth_period': growth_period,
                                'market_demand': market_demand,
                                'water_requirement': water_requirement,
                                'temperature_range_min': temp_min_float,
                                'temperature_range_max': temp_max_float,
                                'rainfall_range_min': rainfall_min_float,
                                'rainfall_range_max': rainfall_max_float,
                                'ph_range': ph_range,
                                'drought_resistance': drought_resistance,
                                'notes': notes
                            }
                        )
                        self.stdout.write(self.style.SUCCESS(f'Imported economics for {crop.name}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'Crop not found: {full_crop_name}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing economics for {row.get("Crop Name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {CropEconomics.objects.count()} crop economics records'))
    
    def import_technologies(self):
        self.stdout.write('Importing technologies...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'agriculture_technologies.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    Technology.objects.update_or_create(
                        name=row['technology_name'],
                        defaults={
                            'category': row['category'].lower().replace(' ', '_'),
                            'suitable_crops': row['suitable_crops'],
                            'implementation_cost': int(row['implementation_cost']),
                            'roi_percentage': int(row['roi_percentage']),
                            'technical_requirements': row['technical_requirements'],
                            'training_needs': row['training_needs'],
                            'supplier_contacts': row['supplier_contacts'],
                            'district_availability': row['district_availability']
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing technology {row.get("technology_name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {Technology.objects.count()} technologies'))
    
    def import_government_schemes(self):
        self.stdout.write('Importing government schemes...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'government_schemes.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    GovernmentScheme.objects.update_or_create(
                        name=row['scheme_name'],
                        defaults={
                            'implementing_agency': row['implementing_agency'],
                            'eligibility_criteria': row['eligibility_criteria'],
                            'benefits': row['benefits'],
                            'application_process': row['application_process'],
                            'documents_required': row['documents_required'],
                            'district_availability': row['district_availability'],
                            'crop_applicability': row['crop_applicability'],
                            'official_website': row['official_website'],
                            'detailed_description': row['detailed_description'],
                            'how_to_apply': row['how_to_apply']
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing scheme {row.get("scheme_name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {GovernmentScheme.objects.count()} government schemes'))
    
    def import_loan_options(self):
        self.stdout.write('Importing loan options...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'loan_options.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Extract numeric value from maximum_amount string
                    max_amount_str = row.get('maximum_amount', '0')
                    max_amount = ''.join(filter(lambda x: x.isdigit() or x == '.', max_amount_str))
                    
                    LoanOption.objects.update_or_create(
                        name=row['loan_name'],
                        defaults={
                            'provider': row['provider'],
                            'loan_type': row['loan_type'],
                            'interest_rate': row['interest_rate'],
                            'max_amount': float(max_amount) if max_amount else 0,
                            'tenure': row['repayment_period'],
                            'eligibility': row['eligibility_criteria'],
                            'documents_required': row['documents_needed'],
                            'processing_time': '2-4 weeks',  # Default value as it's not in the CSV
                            'special_features': row.get('collateral_required', 'No'),
                            'benefits': row.get('benefits', '')
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing loan option {row.get("loan_name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {LoanOption.objects.count()} loan options'))
    
    def import_organic_practices(self):
        self.stdout.write('Importing organic practices...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'organic_farming.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    OrganicPractice.objects.update_or_create(
                        practice_name=row['practice_name'],
                        defaults={
                            'description': row['description'],
                            'applicable_crops': row['applicable_crops'],
                            'implementation_cost_range': row['implementation_cost_range'],
                            'certification_requirements': row['certification_requirements'],
                            'benefits': row['benefits'],
                            'challenges': row['challenges'],
                            'time_to_results': row['time_to_results'],
                            'soil_types': row['soil_types']
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing organic practice {row.get("practice_name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {OrganicPractice.objects.count()} organic practices'))
    
    def import_pest_disease(self):
        self.stdout.write('Importing pest and disease management...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'pest_disease_management.csv')
        
        with open(data_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    PestDisease.objects.update_or_create(
                        name=row['name'],
                        defaults={
                            'type': row['type'].lower(),
                            'affected_crops': row['affected_crops'],
                            'symptoms': row['symptoms'],
                            'favorable_conditions': row['favorable_conditions'],
                            'organic_control_methods': row['organic_control_methods'],
                            'chemical_control_methods': row['chemical_control_methods'],
                            'preventive_measures': row['preventive_measures'],
                            'economic_threshold': row['economic_threshold'],
                            'region_prevalence': row['region_prevalence']
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing pest/disease {row.get("name", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Imported {PestDisease.objects.count()} pest/disease records'))
    
    def import_soil_crop_compatibility(self):
        self.stdout.write('Importing soil-crop compatibility...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'soil_crop_compatibilty.csv')
        
        try:
            with open(data_file, encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    try:
                        # Find the crop
                        crop_name = row.get('crop_name', '').strip()
                        if not crop_name:
                            continue
                            
                        crop = Crop.objects.filter(name__iexact=crop_name).first()
                        
                        if crop:
                            soil_type = row.get('soil_type', '').strip()
                            if soil_type:
                                SoilCropCompatibility.objects.update_or_create(
                                    crop=crop,
                                    soil_type=soil_type,
                                    defaults={
                                        'compatibility_score': int(row.get('compatibility_score', 5)),
                                        'yield_potential_percentage': int(row.get('yield_potential_percentage', 70)),
                                        'special_requirements': row.get('special_requirements', '')
                                    }
                                )
                                count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error importing soil compatibility for {row.get("crop_name", "unknown")}: {str(e)}'))
                
                self.stdout.write(self.style.SUCCESS(f'Imported {count} soil-crop compatibility records'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error opening soil compatibility file: {str(e)}'))
    
    def import_fertilizer_recommendations(self):
        self.stdout.write('Importing fertilizer recommendations...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'fertilizer_recommendations.csv')
        
        try:
            with open(data_file, encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    try:
                        # Find the crop
                        crop_name = row.get('crop_name', '').strip()
                        if not crop_name:
                            continue
                            
                        crop = Crop.objects.filter(name__iexact=crop_name).first()
                        
                        if crop:
                            soil_type = row.get('soil_type', '').strip()
                            if soil_type:
                                # Get NPK values from the fertilizer recommendations
                                urea_kg = float(row.get('urea_kg_ha', 0))
                                dap_kg = float(row.get('dap_kg_ha', 0))
                                mop_kg = float(row.get('mop_kg_ha', 0))
                                npk_complex = float(row.get('npk_complex', 0))
                                
                                # Get application details
                                application_timing = row.get('application_timing', '')
                                
                                # Create fertilizer recommendation schedule
                                application_schedule = f"{application_timing}"
                                if row.get('split_application'):
                                    application_schedule += f" (Split in {row.get('split_application')} applications)"
                                
                                # Calculate equivalent NPK values based on fertilizer formulations
                                # Urea contains 46% N
                                # DAP contains 18% N and 46% P2O5
                                # MOP contains 60% K2O
                                n_kg_per_ha = urea_kg * 0.46 + dap_kg * 0.18
                                p_kg_per_ha = dap_kg * 0.46 
                                k_kg_per_ha = mop_kg * 0.60
                                
                                # Get organic alternatives
                                organic_alternatives = ""
                                if n_kg_per_ha > 0:
                                    organic_alternatives += "Nitrogen: FYM, vermicompost, green manure\n"
                                if p_kg_per_ha > 0:
                                    organic_alternatives += "Phosphorus: Bone meal, rock phosphate\n"
                                if k_kg_per_ha > 0:
                                    organic_alternatives += "Potassium: Wood ash, seaweed extract"
                                
                                FertilizerRecommendation.objects.update_or_create(
                                    crop=crop,
                                    soil_type=soil_type,
                                    defaults={
                                        'n_kg_per_ha': n_kg_per_ha,
                                        'p_kg_per_ha': p_kg_per_ha,
                                        'k_kg_per_ha': k_kg_per_ha,
                                        'urea_kg_per_ha': urea_kg,
                                        'dap_kg_per_ha': dap_kg,
                                        'mop_kg_per_ha': mop_kg,
                                        'npk_complex_kg_per_ha': npk_complex,
                                        'organic_alternatives': organic_alternatives,
                                        'application_schedule': application_schedule
                                    }
                                )
                                count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error importing fertilizer recommendation for {row.get("crop_name", "unknown")}: {str(e)}'))
                
                self.stdout.write(self.style.SUCCESS(f'Imported {count} fertilizer recommendation records'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error opening fertilizer recommendations file: {str(e)}'))
    
    def import_irrigation_requirements(self):
        self.stdout.write('Importing irrigation requirements...')
        data_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'irrigation_requirements.csv')
        
        try:
            with open(data_file, encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    try:
                        # Find the crop
                        crop_name = row.get('crop_name', '').strip()
                        if not crop_name:
                            continue
                            
                        crop = Crop.objects.filter(name__iexact=crop_name).first()
                        
                        if crop:
                            # Use irrigation_type as growth_stage since we need a value for the growth_stage field
                            growth_stage = row.get('irrigation_type', '').strip()
                            if growth_stage:
                                # Extract water requirement from water_quantity_mm
                                water_quantity = row.get('water_quantity_mm', '0')
                                # Handle ranges like "5-10"
                                if '-' in water_quantity:
                                    water_parts = water_quantity.split('-')
                                    if len(water_parts) == 2:
                                        try:
                                            # Use the average of the range
                                            min_val = float(''.join(filter(lambda x: x.isdigit() or x == '.', water_parts[0])))
                                            max_val = float(''.join(filter(lambda x: x.isdigit() or x == '.', water_parts[1])))
                                            water_req = (min_val + max_val) / 2
                                        except:
                                            water_req = 0
                                    else:
                                        water_req = 0
                                else:
                                    water_req = float(''.join(filter(lambda x: x.isdigit() or x == '.', water_quantity))) if water_quantity else 0
                                
                                # Extract irrigation interval from frequency_days
                                frequency = row.get('frequency_days', '7')
                                if '-' in frequency:
                                    freq_parts = frequency.split('-')
                                    if len(freq_parts) == 2:
                                        try:
                                            # Use the average of the range
                                            min_val = float(''.join(filter(lambda x: x.isdigit() or x == '.', freq_parts[0])))
                                            max_val = float(''.join(filter(lambda x: x.isdigit() or x == '.', freq_parts[1])))
                                            interval = (min_val + max_val) / 2
                                        except:
                                            interval = 7
                                    else:
                                        interval = 7
                                else:
                                    interval = float(''.join(filter(lambda x: x.isdigit() or x == '.', frequency))) if frequency else 7
                                
                                IrrigationRequirement.objects.update_or_create(
                                    crop=crop,
                                    growth_stage=growth_stage,
                                    defaults={
                                        'water_requirement_mm': water_req,
                                        'critical_stages': row.get('critical_growth_stages', ''),
                                        'irrigation_interval_days': int(interval),
                                        'water_conservation_techniques': row.get('remarks', '')
                                    }
                                )
                                count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error importing irrigation requirement for {row.get("crop_name", "unknown")}: {str(e)}'))
                
                self.stdout.write(self.style.SUCCESS(f'Imported {count} irrigation requirement records'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error opening irrigation requirements file: {str(e)}')) 