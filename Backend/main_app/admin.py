from django.contrib import admin
from .models import (
    District, Crop, CropEconomics, Technology, GovernmentScheme, 
    LoanOption, OrganicPractice, PestDisease, SoilCropCompatibility,
    FertilizerRecommendation, IrrigationRequirement, FarmerProfile,
    FarmDetail, FarmingExperience, FinancialInfo, FarmerInterest
)

# Register your models here.
admin.site.register(District)
admin.site.register(Crop)
admin.site.register(CropEconomics)
admin.site.register(Technology)
admin.site.register(GovernmentScheme)
admin.site.register(LoanOption)
admin.site.register(OrganicPractice)
admin.site.register(PestDisease)
admin.site.register(SoilCropCompatibility)
admin.site.register(FertilizerRecommendation)
admin.site.register(IrrigationRequirement)
admin.site.register(FarmerProfile)
admin.site.register(FarmDetail)
admin.site.register(FarmingExperience)
admin.site.register(FinancialInfo)
admin.site.register(FarmerInterest)
