from django.core.management.base import BaseCommand
from main_app.models import Crop, CropEconomics

class Command(BaseCommand):
    help = 'Update crop seasons to include Zaid where Summer is mentioned and add season to CropEconomics'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting crop season update...')
        
        # Get all crops with Summer in their growing season
        summer_crops = Crop.objects.filter(growing_season__icontains='Summer')
        count = 0
        
        for crop in summer_crops:
            if 'Zaid' not in crop.growing_season:
                # Replace Summer with "Summer, Zaid" or add ", Zaid" if Summer is at the end
                new_season = crop.growing_season.replace('Summer', 'Summer, Zaid')
                crop.growing_season = new_season
                crop.save()
                count += 1
                self.stdout.write(f'Updated {crop.name}: {crop.growing_season}')
        
        self.stdout.write(self.style.SUCCESS(f'Updated {count} crops to include Zaid season'))
        
        # Update CropEconomics with season information from Crop
        econ_count = 0
        for econ in CropEconomics.objects.all():
            if econ.crop and econ.crop.growing_season:
                # Add season field to CropEconomics based on Crop's growing_season
                econ.season = econ.crop.growing_season
                econ.save()
                econ_count += 1
                self.stdout.write(f'Updated economics for {econ.crop.name} with season: {econ.season}')
        
        self.stdout.write(self.style.SUCCESS(f'Updated {econ_count} crop economics records with season information'))
