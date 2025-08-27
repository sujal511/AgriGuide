# Generated manually to fix datatype mismatch

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0011_remove_loanrecommendation_farmer_and_more'),
    ]

    operations = [
        # First convert JSONFields to TextFields to avoid data loss
        migrations.AlterField(
            model_name='loanscheme',
            name='eligibility',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='loanscheme',
            name='key_benefits',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='loanscheme',
            name='loan_purpose',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='loanscheme',
            name='insurance_linkage',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='loanscheme',
            name='collateral_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='loanscheme',
            name='bank_name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='loanscheme',
            name='repayment_category',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
        # Remove the id field and make scheme_id the primary key (do this last)
        migrations.AlterField(
            model_name='loanscheme',
            name='scheme_id',
            field=models.CharField(max_length=50, primary_key=True, serialize=False),
        ),
    ] 