import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Update crop season CSV file to include Zaid where Summer is mentioned'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting CSV update...')
        
        # File paths
        csv_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'cropdeailsaboutseson.csv')
        temp_file = os.path.join(settings.BASE_DIR, 'main_app', 'data', 'cropdeailsaboutseson_updated.csv')
        
        # Read and update the CSV
        rows_updated = 0
        try:
            with open(csv_file, 'r', encoding='utf-8') as input_file, \
                 open(temp_file, 'w', newline='', encoding='utf-8') as output_file:
                
                reader = csv.reader(input_file)
                writer = csv.writer(output_file)
                
                # Write header
                header = next(reader)
                writer.writerow(header)
                
                # Process rows
                for row in reader:
                    if len(row) >= 4:  # Ensure the row has enough columns
                        season_column = row[3]  # Suitable Seasons column
                        if 'Summer' in season_column and 'Zaid' not in season_column:
                            # Replace Summer with "Summer (Zaid)" or add ", Zaid" if Summer is at the end
                            row[3] = season_column.replace('Summer', 'Summer (Zaid)')
                            rows_updated += 1
                    
                    writer.writerow(row)
            
            # Replace the original file with the updated one
            os.replace(temp_file, csv_file)
            self.stdout.write(self.style.SUCCESS(f'Updated {rows_updated} rows in the CSV file'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating CSV: {str(e)}')) 