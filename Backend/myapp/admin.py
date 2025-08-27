from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, LoanScheme, TempUser, GovernmentScheme, FarmResource
import json

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)

class LoanSchemeAdmin(admin.ModelAdmin):
    list_display = ('scheme_id', 'scheme_name', 'bank_name', 'loan_type', 'interest_rate_min', 'interest_rate_max')
    list_filter = ('bank_name', 'loan_type', 'subsidy_available')
    search_fields = ('scheme_name', 'scheme_id', 'description')
    ordering = ('bank_name', 'scheme_name')
    
    # Group fields into logical sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('scheme_id', 'scheme_name', 'bank_name', 'loan_type', 'description')
        }),
        ('Interest and Repayment', {
            'fields': ('interest_rate_min', 'interest_rate_max', 'interest_rate_note', 
                       'repayment_term_months', 'repayment_category')
        }),
        ('Loan Details', {
            'fields': ('loan_limit_min', 'loan_limit_max', 'loan_limit_note', 
                       'collateral_required', 'loan_purpose', 'processing_fee_note')
        }),
        ('Benefits and Eligibility', {
            'fields': ('eligibility', 'key_benefits', 'subsidy_available', 
                       'subsidy_details', 'insurance_linkage', 'renewal_period')
        }),
        ('Contact Information', {
            'fields': ('contact_phone', 'contact_email', 'contact_website', 'contact_info')
        }),
    )

class GovernmentSchemeAdmin(admin.ModelAdmin):
    list_display = ('scheme_id', 'name', 'type', 'state', 'status', 'target_group')
    list_filter = ('state', 'type', 'status')
    search_fields = ('name', 'scheme_id', 'description', 'target_group')
    ordering = ('state', 'name')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('scheme_id', 'name', 'type', 'description', 'target_group', 'status', 'state')
        }),
        ('Eligibility & Benefits', {
            'fields': ('eligibility', 'benefits')
        }),
        ('Application Information', {
            'fields': ('how_to_apply', 'required_documents')
        }),
        ('Additional Information', {
            'fields': ('contact', 'faq', 'language_support')
        }),
    )

class FarmResourceAdmin(admin.ModelAdmin):
    list_display = ('user', 'last_updated')
    search_fields = ('user__username', 'user__email')
    
    def has_delete_permission(self, request, obj=None):
        return True
        
    def has_add_permission(self, request):
        return True
        
    def has_change_permission(self, request, obj=None):
        return True

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(LoanScheme, LoanSchemeAdmin)
admin.site.register(TempUser)
admin.site.register(GovernmentScheme, GovernmentSchemeAdmin)
admin.site.register(FarmResource, FarmResourceAdmin)