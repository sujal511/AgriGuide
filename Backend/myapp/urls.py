from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_user, name='register'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('login/', views.login_user, name='login'),
    path('weather/', views.get_weather, name='weather'),
    path('weather/forecast/', views.get_weather_forecast, name='weather-forecast'),
    path('profile/', views.user_profile, name='profile'),
    path('password-reset/', views.password_reset_request, name='password-reset'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    # Bank app endpoints - renamed to avoid conflict
    path('bank-schemes/', views.api_loan_schemes, name='api_loan_schemes'),
    path('bank-schemes/<str:scheme_id>/', views.api_scheme_detail, name='api_scheme_detail'),
    # Government schemes endpoints
    path('gov-schemes/', views.api_gov_schemes, name='api_gov_schemes'),
    path('gov-schemes/<str:scheme_id>/', views.api_gov_scheme_detail, name='api_gov_scheme_detail'),
    # Farm resources endpoint
    path('farm-resources/', views.farm_resources, name='farm_resources'),
    
    # Admin API endpoints
    path('api/check-admin/', views.admin_check_api, name='admin_check_api'),
    path('api/admin/crops/', views.admin_crops_api, name='admin_crops_api'),
    path('api/admin/crops/<int:crop_id>/', views.admin_crop_detail_api, name='admin_crop_detail_api'),
    path('api/admin/users/', views.admin_users_api, name='admin_users_api'),
    path('api/admin/users/<int:user_id>/', views.admin_user_detail_api, name='admin_user_detail_api'),
    
    # Financial resources API endpoints
    path('financial-resources/', views.get_financial_resources, name='get_financial_resources'),
    path('financial-resources/expenses/', views.create_expense, name='create_expense'),
    path('financial-resources/expenses/<str:expense_id>/', views.update_expense, name='update_expense'),
    path('financial-resources/expenses/<str:expense_id>/delete/', views.delete_expense, name='delete_expense'),
    path('financial-resources/loans/', views.create_loan, name='create_loan'),
    path('financial-resources/loans/<str:loan_id>/', views.update_loan, name='update_loan'),
    path('financial-resources/loans/<str:loan_id>/delete/', views.delete_loan, name='delete_loan'),
    path('financial-resources/budgetPlans/', views.create_budget_plan, name='create_budget_plan'),
    path('financial-resources/budgetPlans/<str:plan_id>/', views.update_budget_plan, name='update_budget_plan'),
    path('financial-resources/budgetPlans/<str:plan_id>/delete/', views.delete_budget_plan, name='delete_budget_plan'),
]