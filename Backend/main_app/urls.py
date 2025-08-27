from django.urls import path
from . import views
from .views import crop_recommendations_api, govt_schemes_api, loan_options_api, technology_api, save_farmer_profile_api
from .views import farmer_scheme_recommendations, farmer_loan_recommendations

# Import admin view functions directly
from .views import (
    admin_dashboard_stats, 
    admin_crops_list, admin_crop_detail,
    admin_technologies_list, admin_technology_detail,
    admin_schemes_list, admin_scheme_detail,
    admin_loans_list, admin_loan_detail,
    admin_users_list, admin_user_detail
)

urlpatterns = [
    # Existing API endpoints
    path('api/crop-recommendations/', crop_recommendations_api, name='crop_recommendations_api'),
    path('api/govt-schemes/', govt_schemes_api, name='govt_schemes_api'),
    path('api/loan-options/', loan_options_api, name='loan_options_api'),
    path('api/technology/', technology_api, name='technology_api'),
    path('api/save-farmer-profile/', save_farmer_profile_api, name='save_farmer_profile_api'),
    path('api/farmer/<int:farmer_id>/profile/', views.farmer_profile_api, name='farmer_profile_api'),
    path('api/farmer/<int:farmer_id>/recommendations/schemes/', farmer_scheme_recommendations, name='farmer_scheme_recommendations'),
    path('api/farmer/<int:farmer_id>/recommendations/loans/', farmer_loan_recommendations, name='farmer_loan_recommendations'),
    
    # Debug endpoints
    path('api/debug/loans/', views.debug_loans_list, name='debug_loans_list'),
    path('api/debug/farmer/<int:farmer_id>/profile/', views.debug_farmer_profile, name='debug_farmer_profile'),

    # Admin API endpoints
    path('api/admin/dashboard/stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('api/admin/stats/', admin_dashboard_stats, name='admin_stats'),  # Keep the old endpoint for backward compatibility
    
    # Crop admin endpoints
    path('api/admin/crops/', admin_crops_list, name='admin_crops_list'),
    path('api/admin/crops/<int:id>/', admin_crop_detail, name='admin_crop_detail'),
    
    # Technology admin endpoints
    path('api/admin/technologies/', admin_technologies_list, name='admin_technologies_list'),
    path('api/admin/technologies/<int:id>/', admin_technology_detail, name='admin_technology_detail'),
    
    # Scheme admin endpoints
    path('api/admin/schemes/', admin_schemes_list, name='admin_schemes_list'),
    path('api/admin/schemes/<int:id>/', admin_scheme_detail, name='admin_scheme_detail'),
    
    # Loan admin endpoints
    path('api/admin/loans/', admin_loans_list, name='admin_loans_list'),
    path('api/admin/loans/<int:id>/', admin_loan_detail, name='admin_loan_detail'),
    
    # User admin endpoints
    path('api/admin/users/', admin_users_list, name='admin_users_list'),
    path('api/admin/users/<int:id>/', admin_user_detail, name='admin_user_detail'),
] 