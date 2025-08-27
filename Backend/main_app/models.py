from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

# Create your models here.

class District(models.Model):
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=50)
    avg_annual_rainfall_mm = models.FloatField()
    min_temp_c = models.FloatField()
    max_temp_c = models.FloatField()
    major_soil_types = models.TextField()

    def __str__(self):
        return self.name

class Crop(models.Model):
    name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=100, blank=True)
    varieties = models.TextField(blank=True)
    suitable_soil_types = models.TextField(default="All soil types")
    growing_season = models.CharField(max_length=50, default="All seasons")
    water_requirement_mm = models.FloatField(default=0)
    avg_yield_q_per_ha = models.FloatField(default=0)
    min_temp_c = models.FloatField(default=0)
    max_temp_c = models.FloatField(default=0)
    n_requirement_kg_per_ha = models.FloatField(default=0)
    p_requirement_kg_per_ha = models.FloatField(default=0)
    k_requirement_kg_per_ha = models.FloatField(default=0)
    ph_range = models.CharField(max_length=20, default="6.0-7.0")
    cultivation_practices = models.TextField(blank=True)

    def __str__(self):
        return self.name

class CropEconomics(models.Model):
    crop = models.OneToOneField(Crop, on_delete=models.CASCADE, related_name='economics')
    cost_of_cultivation_per_ha = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expected_yield_q_per_ha = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    msp_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    market_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_income_per_ha = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_income_per_ha = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    roi_percentage = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Additional fields from updated CSV
    growth_period = models.CharField(max_length=50, blank=True)
    market_demand = models.CharField(max_length=20, blank=True)
    water_requirement = models.CharField(max_length=20, blank=True)
    temperature_range_min = models.FloatField(null=True, blank=True)
    temperature_range_max = models.FloatField(null=True, blank=True)
    rainfall_range_min = models.FloatField(null=True, blank=True)
    rainfall_range_max = models.FloatField(null=True, blank=True)
    ph_range = models.CharField(max_length=20, blank=True)
    drought_resistance = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    
    # Season information
    season = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Economics for {self.crop.name}"

class SoilCropCompatibility(models.Model):
    soil_type = models.CharField(max_length=50)
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='soil_compatibilities')
    compatibility_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)], default=5)
    yield_potential_percentage = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)], default=70)
    special_requirements = models.TextField(blank=True)

    def __str__(self):
        return f"{self.soil_type} - {self.crop.name}"

class Technology(models.Model):
    CATEGORY_CHOICES = [
        ('irrigation', 'Irrigation'),
        ('precision_agriculture', 'Precision Agriculture'),
        ('soil_management', 'Soil Management'),
        ('climate_monitoring', 'Climate Monitoring'),
        ('crop_management', 'Crop Management'),
        ('planting_technology', 'Planting Technology'),
        ('harvesting', 'Harvesting'),
        ('protected_cultivation', 'Protected Cultivation'),
        ('renewable_energy', 'Renewable Energy'),
        ('organic_fertilizer', 'Organic Fertilizer'),
        ('post_harvest', 'Post Harvest'),
        ('pest_control', 'Pest Control'),
        ('nutrient_management', 'Nutrient Management'),
        ('animal_husbandry', 'Animal Husbandry'),
        ('storage_technology', 'Storage Technology'),
        ('disease_detection', 'Disease Detection'),
        ('smart_irrigation', 'Smart Irrigation'),
        ('food_processing', 'Food Processing'),
        ('livestock_technology', 'Livestock Technology'),
        ('integrated_farming', 'Integrated Farming'),
        ('waste_management', 'Waste Management'),
        ('market_technology', 'Market Technology'),
        ('specialty_crops', 'Specialty Crops'),
        ('fodder_management', 'Fodder Management'),
        ('aquaculture', 'Aquaculture'),
        ('farm_protection', 'Farm Protection'),
        ('research_tool', 'Research Tool'),
        ('microclimate_monitoring', 'Microclimate Monitoring'),
        ('seed_technology', 'Seed Technology'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='irrigation')
    suitable_crops = models.CharField(max_length=200, default='All')
    implementation_cost = models.IntegerField(default=0)
    roi_percentage = models.IntegerField(default=0)
    technical_requirements = models.TextField(default='')
    training_needs = models.CharField(max_length=100, default='')
    supplier_contacts = models.CharField(max_length=200, default='')
    district_availability = models.CharField(max_length=100, default='All districts')

    def __str__(self):
        return self.name

class GovernmentScheme(models.Model):
    name = models.CharField(max_length=100)
    implementing_agency = models.CharField(max_length=100, default='')
    eligibility_criteria = models.TextField(default='')
    benefits = models.TextField(default='')
    application_process = models.TextField(default='')
    documents_required = models.TextField(default='')
    district_availability = models.CharField(max_length=100, default='All Karnataka districts')
    crop_applicability = models.CharField(max_length=200, default='All')
    official_website = models.CharField(max_length=200, default='')
    detailed_description = models.TextField(default='')
    how_to_apply = models.TextField(default='')

    def __str__(self):
        return self.name

class LoanOption(models.Model):
    name = models.CharField(max_length=100)
    provider = models.CharField(max_length=100, default='')
    loan_type = models.CharField(max_length=50, default='')
    interest_rate = models.CharField(max_length=50, default='')
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tenure = models.CharField(max_length=50, default='')
    eligibility = models.TextField(default='')
    documents_required = models.TextField(default='')
    processing_time = models.CharField(max_length=50, default='')
    special_features = models.TextField(blank=True)
    benefits = models.TextField(null=True, blank=True, help_text="Key benefits of the loan")

    def __str__(self):
        return self.name

class OrganicPractice(models.Model):
    practice_name = models.CharField(max_length=100)
    description = models.TextField(default='')
    applicable_crops = models.CharField(max_length=200, default='All crops')
    implementation_cost_range = models.CharField(max_length=50, default='')
    certification_requirements = models.TextField(default='')
    benefits = models.TextField(default='')
    challenges = models.TextField(default='')
    time_to_results = models.CharField(max_length=50, default='')
    soil_types = models.CharField(max_length=100, default='All soil types')

    def __str__(self):
        return self.practice_name

class PestDisease(models.Model):
    TYPE_CHOICES = [
        ('pest', 'Pest'),
        ('disease', 'Disease'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='pest')
    affected_crops = models.CharField(max_length=200, default='')
    symptoms = models.TextField(default='')
    favorable_conditions = models.TextField(default='')
    organic_control_methods = models.TextField(default='')
    chemical_control_methods = models.TextField(default='')
    preventive_measures = models.TextField(default='')
    economic_threshold = models.CharField(max_length=100, default='')
    region_prevalence = models.CharField(max_length=200, default='')

    def __str__(self):
        return self.name

class FertilizerRecommendation(models.Model):
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='fertilizer_recommendations')
    soil_type = models.CharField(max_length=50)
    n_kg_per_ha = models.FloatField(default=0)
    p_kg_per_ha = models.FloatField(default=0)
    k_kg_per_ha = models.FloatField(default=0)
    organic_alternatives = models.TextField(blank=True)
    application_schedule = models.TextField(default='')
    
    # Added fields for specific fertilizer products
    urea_kg_per_ha = models.FloatField(default=0)
    dap_kg_per_ha = models.FloatField(default=0) 
    mop_kg_per_ha = models.FloatField(default=0)
    npk_complex_kg_per_ha = models.FloatField(default=0)

    def __str__(self):
        return f"Fertilizer for {self.crop.name} in {self.soil_type} soil"

class IrrigationRequirement(models.Model):
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='irrigation_requirements')
    growth_stage = models.CharField(max_length=50)
    water_requirement_mm = models.FloatField(default=0)
    critical_stages = models.TextField(blank=True)
    irrigation_interval_days = models.IntegerField(default=7)
    water_conservation_techniques = models.TextField(blank=True)

    def __str__(self):
        return f"Irrigation for {self.crop.name} - {self.growth_stage}"

# User-related models

class FarmerProfile(models.Model):
    EDUCATION_CHOICES = [
        ('none', 'No Formal Education'),
        ('primary', 'Primary Education'),
        ('secondary', 'Secondary Education'),
        ('higher_secondary', 'Higher Secondary'),
        ('graduate', 'Graduate'),
        ('post_graduate', 'Post Graduate'),
    ]

    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE, related_name='farmer_profile', null=True, blank=True)
    first_name = models.CharField(max_length=100, default='')
    last_name = models.CharField(max_length=100, default='')
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    mobile = models.CharField(max_length=15, default='')
    district = models.CharField(max_length=100, default='')
    state = models.CharField(max_length=100, default='Karnataka')
    address = models.TextField(blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, blank=True)
    preferred_season = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class FarmDetail(models.Model):
    SOIL_TYPE_CHOICES = [
        ('Black', 'Black Soil'),
        ('Red', 'Red Soil'),
        ('Alluvial', 'Alluvial Soil'),
        ('Laterite', 'Laterite Soil'),
        ('Sandy', 'Sandy Soil'),
        ('Clay', 'Clay Soil'),
    ]

    LAND_OWNERSHIP_CHOICES = [
        ('Owned', 'Owned'),
        ('Leased', 'Leased'),
        ('Shared', 'Shared'),
    ]

    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='farms')
    farm_size = models.FloatField(default=0)
    unit = models.CharField(max_length=10, default='Hectare')
    soil_type = models.CharField(max_length=20, choices=SOIL_TYPE_CHOICES, default='Black')
    land_ownership = models.CharField(max_length=10, choices=LAND_OWNERSHIP_CHOICES, default='Owned')
    irrigation_sources = models.CharField(max_length=200, blank=True)
    irrigation_systems = models.CharField(max_length=200, blank=True)
    
    # Soil nutrient values (NPK)
    nitrogen_value = models.FloatField(null=True, blank=True, help_text="Nitrogen content in kg/ha")
    phosphorus_value = models.FloatField(null=True, blank=True, help_text="Phosphorus content in kg/ha")
    potassium_value = models.FloatField(null=True, blank=True, help_text="Potassium content in kg/ha")
    ph_value = models.FloatField(null=True, blank=True, help_text="Soil pH value")

    def __str__(self):
        return f"{self.farmer.first_name}'s farm - {self.farm_size} {self.unit}"

class FarmingExperience(models.Model):
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='experiences')
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE)
    years_experience = models.CharField(max_length=50, default='')
    challenges_faced = models.TextField(blank=True)

    def __str__(self):
        return f"{self.farmer.first_name}'s experience with {self.crop.name}"

class FinancialInfo(models.Model):
    INCOME_CHOICES = [
        ('below_50k', 'Below ₹50,000'),
        ('50k_1l', '₹50,000 - ₹1,00,000'),
        ('1l_3l', '₹1,00,000 - ₹3,00,000'),
        ('3l_5l', '₹3,00,000 - ₹5,00,000'),
        ('above_5l', 'Above ₹5,00,000'),
    ]

    farmer = models.OneToOneField(FarmerProfile, on_delete=models.CASCADE, related_name='financial_info')
    annual_income = models.CharField(max_length=20, choices=INCOME_CHOICES, default='below_50k')
    loan_history = models.TextField(blank=True)
    govt_schemes_enrolled = models.TextField(blank=True)
    insurance_coverage = models.BooleanField(default=False)
    bank_account = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.farmer.first_name}'s financial info"

class FarmerInterest(models.Model):
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='interests')
    sustainable_practices = models.TextField(blank=True)
    challenges = models.TextField(blank=True)

    def __str__(self):
        return f"{self.farmer.first_name}'s interests"
