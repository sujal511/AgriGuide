#!/usr/bin/env python
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgriGuide.settings')
django.setup()

# Import models
from main_app.models import Crop

# Find crops with Zaid growing season
zaid_crops = Crop.objects.filter(growing_season__icontains='Zaid')

print(f"Number of Zaid crops found: {zaid_crops.count()}")

if zaid_crops.count() > 0:
    print("\nZaid crops:")
    for crop in zaid_crops:
        print(f"- {crop.name} (Growing Season: {crop.growing_season})")
else:
    print("No crops with 'Zaid' in their growing season were found.")

# Check if 'summer' is used instead
summer_crops = Crop.objects.filter(growing_season__icontains='summer')
print(f"\nNumber of Summer crops found: {summer_crops.count()}")

if summer_crops.count() > 0:
    print("\nSummer crops:")
    for crop in summer_crops:
        print(f"- {crop.name} (Growing Season: {crop.growing_season})")

# Check all unique growing season values
all_seasons = set()
for crop in Crop.objects.all():
    seasons = [s.strip() for s in crop.growing_season.replace('and', ',').split(',')]
    all_seasons.update(seasons)

print(f"\nAll growing seasons found in the database: {sorted(all_seasons)}") 