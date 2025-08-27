from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import (
    District, Crop, CropEconomics, Technology, GovernmentScheme, 
    LoanOption, OrganicPractice, PestDisease, SoilCropCompatibility,
    FertilizerRecommendation, IrrigationRequirement, FarmerProfile
)
from django.contrib.auth import get_user_model
User = get_user_model()

# Admin Dashboard API
@csrf_exempt
def admin_dashboard_stats(request):
    """Get statistics for the admin dashboard"""
    if request.method == 'GET':
        try:
            # Check if the user is authenticated as admin
            # Using token authentication here, extract from Authorization header
            if 'Authorization' in request.headers:
                token = request.headers['Authorization'].split(' ')[1]
                try:
                    # You would typically validate the token here
                    # For now, we'll let it pass for demo purposes
                    pass
                except Exception:
                    return JsonResponse({'error': 'Invalid token'}, status=401)
            else:
                # For demo purposes, allow access for now
                pass
            
            # Get counts of various objects
            crops_count = Crop.objects.count()
            technologies_count = Technology.objects.count()
            schemes_count = GovernmentScheme.objects.count()
            loans_count = LoanOption.objects.count()
            users_count = User.objects.filter(is_staff=False).count()
            
            stats = {
                'cropsCount': crops_count,
                'technologiesCount': technologies_count,
                'schemesCount': schemes_count,
                'loansCount': loans_count,
                'usersCount': users_count,
            }
            
            return JsonResponse(stats)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Crop API
@csrf_exempt
def admin_crops_list(request):
    """List and create crops"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                crops = Crop.objects.filter(name__icontains=search_query)
            else:
                crops = Crop.objects.all()
            
            crops_data = []
            for crop in crops:
                crops_data.append({
                    'id': crop.id,
                    'name': crop.name,
                    'scientific_name': crop.scientific_name,
                    'growing_season': crop.growing_season,
                    'cultivation_practices': crop.cultivation_practices,
                    'water_requirement_mm': crop.water_requirement_mm,
                    'min_temp_c': crop.min_temp_c,
                    'max_temp_c': crop.max_temp_c,
                    'ph_range': crop.ph_range,
                    'suitable_soil_types': crop.suitable_soil_types,
                    'varieties': crop.varieties,
                })
            
            return JsonResponse(crops_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new crop
            crop = Crop.objects.create(
                name=data.get('name'),
                scientific_name=data.get('scientific_name', ''),
                growing_season=data.get('growing_season', ''),
                cultivation_practices=data.get('cultivation_practices', ''),
                water_requirement_mm=float(data.get('water_requirement_mm', 0)),
                min_temp_c=float(data.get('min_temp_c', 0)),
                max_temp_c=float(data.get('max_temp_c', 0)),
                ph_range=data.get('ideal_soil_ph', ''),
                suitable_soil_types=data.get('suitable_soil_types', ''),
                varieties=data.get('varieties', '')
            )
            
            return JsonResponse({
                'id': crop.id,
                'name': crop.name,
                'message': 'Crop created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_crop_detail(request, id):
    """Retrieve, update or delete a crop"""
    try:
        crop = Crop.objects.get(pk=id)
    except Crop.DoesNotExist:
        return JsonResponse({'error': 'Crop not found'}, status=404)
    
    if request.method == 'GET':
        crop_data = {
            'id': crop.id,
            'name': crop.name,
            'scientific_name': crop.scientific_name,
            'growing_season': crop.growing_season,
            'cultivation_practices': crop.cultivation_practices,
            'water_requirement_mm': crop.water_requirement_mm,
            'min_temp_c': crop.min_temp_c,
            'max_temp_c': crop.max_temp_c,
            'ph_range': crop.ph_range,
            'suitable_soil_types': crop.suitable_soil_types,
            'varieties': crop.varieties,
        }
        return JsonResponse(crop_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update crop fields
            crop.name = data.get('name', crop.name)
            crop.scientific_name = data.get('scientific_name', crop.scientific_name)
            crop.growing_season = data.get('growing_season', crop.growing_season)
            crop.cultivation_practices = data.get('cultivation_practices', crop.cultivation_practices)
            crop.water_requirement_mm = float(data.get('water_requirement_mm', crop.water_requirement_mm))
            crop.min_temp_c = float(data.get('min_temp_c', crop.min_temp_c))
            crop.max_temp_c = float(data.get('max_temp_c', crop.max_temp_c))
            crop.ph_range = data.get('ideal_soil_ph', crop.ph_range)
            crop.suitable_soil_types = data.get('suitable_soil_types', crop.suitable_soil_types)
            crop.varieties = data.get('varieties', crop.varieties)
            
            crop.save()
            
            return JsonResponse({
                'id': crop.id,
                'name': crop.name,
                'message': 'Crop updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        crop.delete()
        return JsonResponse({'message': 'Crop deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Technology API
@csrf_exempt
def admin_technologies_list(request):
    """List and create technologies"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                technologies = Technology.objects.filter(name__icontains=search_query)
            else:
                technologies = Technology.objects.all()
            
            technologies_data = []
            for tech in technologies:
                technologies_data.append({
                    'id': tech.id,
                    'name': tech.name,
                    'category': tech.category,
                    'suitable_crops': tech.suitable_crops,
                    'implementation_cost': tech.implementation_cost,
                    'roi_percentage': tech.roi_percentage,
                    'technical_requirements': tech.technical_requirements,
                    'training_needs': tech.training_needs,
                    'supplier_contacts': tech.supplier_contacts,
                    'district_availability': tech.district_availability,
                })
            
            return JsonResponse(technologies_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new technology
            tech = Technology.objects.create(
                name=data.get('name'),
                category=data.get('category', 'other'),
                suitable_crops=data.get('suitable_crops', 'All'),
                implementation_cost=float(data.get('implementation_cost', 0)),
                roi_percentage=float(data.get('roi_percentage', 0)),
                technical_requirements=data.get('technical_requirements', ''),
                training_needs=data.get('training_needs', ''),
                supplier_contacts=data.get('supplier_contacts', ''),
                district_availability=data.get('district_availability', 'All Districts')
            )
            
            return JsonResponse({
                'id': tech.id,
                'name': tech.name,
                'message': 'Technology created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_technology_detail(request, id):
    """Retrieve, update or delete a technology"""
    try:
        tech = Technology.objects.get(pk=id)
    except Technology.DoesNotExist:
        return JsonResponse({'error': 'Technology not found'}, status=404)
    
    if request.method == 'GET':
        tech_data = {
            'id': tech.id,
            'name': tech.name,
            'category': tech.category,
            'suitable_crops': tech.suitable_crops,
            'implementation_cost': tech.implementation_cost,
            'roi_percentage': tech.roi_percentage,
            'technical_requirements': tech.technical_requirements,
            'training_needs': tech.training_needs,
            'supplier_contacts': tech.supplier_contacts,
            'district_availability': tech.district_availability,
        }
        return JsonResponse(tech_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update technology fields
            tech.name = data.get('name', tech.name)
            tech.category = data.get('category', tech.category)
            tech.suitable_crops = data.get('suitable_crops', tech.suitable_crops)
            tech.implementation_cost = float(data.get('implementation_cost', tech.implementation_cost))
            tech.roi_percentage = float(data.get('roi_percentage', tech.roi_percentage))
            tech.technical_requirements = data.get('technical_requirements', tech.technical_requirements)
            tech.training_needs = data.get('training_needs', tech.training_needs)
            tech.supplier_contacts = data.get('supplier_contacts', tech.supplier_contacts)
            tech.district_availability = data.get('district_availability', tech.district_availability)
            
            tech.save()
            
            return JsonResponse({
                'id': tech.id,
                'name': tech.name,
                'message': 'Technology updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        tech.delete()
        return JsonResponse({'message': 'Technology deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Scheme API
@csrf_exempt
def admin_schemes_list(request):
    """List and create government schemes"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                schemes = GovernmentScheme.objects.filter(name__icontains=search_query)
            else:
                schemes = GovernmentScheme.objects.all()
            
            schemes_data = []
            for scheme in schemes:
                schemes_data.append({
                    'id': scheme.id,
                    'name': scheme.name,
                    'implementing_agency': scheme.implementing_agency,
                    'eligibility_criteria': scheme.eligibility_criteria,
                    'benefits': scheme.benefits,
                    'application_process': scheme.application_process,
                    'documents_required': scheme.documents_required,
                    'district_availability': scheme.district_availability,
                    'crop_applicability': scheme.crop_applicability,
                    'official_website': scheme.official_website,
                    'detailed_description': scheme.detailed_description,
                    'how_to_apply': scheme.how_to_apply
                })
            
            return JsonResponse(schemes_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new scheme
            scheme = GovernmentScheme.objects.create(
                name=data.get('name'),
                implementing_agency=data.get('implementing_agency', ''),
                eligibility_criteria=data.get('eligibility_criteria', ''),
                benefits=data.get('benefits', ''),
                application_process=data.get('application_process', ''),
                documents_required=data.get('documents_required', ''),
                district_availability=data.get('district_availability', 'All Districts'),
                crop_applicability=data.get('crop_applicability', 'All'),
                official_website=data.get('official_website', ''),
                detailed_description=data.get('detailed_description', ''),
                how_to_apply=data.get('how_to_apply', '')
            )
            
            return JsonResponse({
                'id': scheme.id,
                'name': scheme.name,
                'message': 'Scheme created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_scheme_detail(request, id):
    """Retrieve, update or delete a government scheme"""
    try:
        scheme = GovernmentScheme.objects.get(pk=id)
    except GovernmentScheme.DoesNotExist:
        return JsonResponse({'error': 'Scheme not found'}, status=404)
    
    if request.method == 'GET':
        scheme_data = {
            'id': scheme.id,
            'name': scheme.name,
            'implementing_agency': scheme.implementing_agency,
            'eligibility_criteria': scheme.eligibility_criteria,
            'benefits': scheme.benefits,
            'application_process': scheme.application_process,
            'documents_required': scheme.documents_required,
            'district_availability': scheme.district_availability,
            'crop_applicability': scheme.crop_applicability,
            'official_website': scheme.official_website,
            'detailed_description': scheme.detailed_description,
            'how_to_apply': scheme.how_to_apply
        }
        return JsonResponse(scheme_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update scheme fields
            scheme.name = data.get('name', scheme.name)
            scheme.implementing_agency = data.get('implementing_agency', scheme.implementing_agency)
            scheme.eligibility_criteria = data.get('eligibility_criteria', scheme.eligibility_criteria)
            scheme.benefits = data.get('benefits', scheme.benefits)
            scheme.application_process = data.get('application_process', scheme.application_process)
            scheme.documents_required = data.get('documents_required', scheme.documents_required)
            scheme.district_availability = data.get('district_availability', scheme.district_availability)
            scheme.crop_applicability = data.get('crop_applicability', scheme.crop_applicability)
            scheme.official_website = data.get('official_website', scheme.official_website)
            scheme.detailed_description = data.get('detailed_description', scheme.detailed_description)
            scheme.how_to_apply = data.get('how_to_apply', scheme.how_to_apply)
            
            scheme.save()
            
            return JsonResponse({
                'id': scheme.id,
                'name': scheme.name,
                'message': 'Scheme updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        scheme.delete()
        return JsonResponse({'message': 'Scheme deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin Loan API
@csrf_exempt
def admin_loans_list(request):
    """List and create loan options"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                loans = LoanOption.objects.filter(name__icontains=search_query)
            else:
                loans = LoanOption.objects.all()
            
            loans_data = []
            for loan in loans:
                loans_data.append({
                    'id': loan.id,
                    'name': loan.name,
                    'provider': loan.provider,
                    'loan_type': loan.loan_type,
                    'interest_rate': loan.interest_rate,
                    'max_amount': loan.max_amount,
                    'tenure': loan.tenure,
                    'eligibility': loan.eligibility,
                    'documents_required': loan.documents_required,
                    'processing_time': loan.processing_time,
                    'special_features': loan.special_features
                })
            
            return JsonResponse(loans_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new loan
            loan = LoanOption.objects.create(
                name=data.get('name'),
                provider=data.get('provider', ''),
                loan_type=data.get('loan_type', ''),
                interest_rate=data.get('interest_rate', ''),
                max_amount=data.get('max_amount', '0'),
                tenure=data.get('tenure', ''),
                eligibility=data.get('eligibility', ''),
                documents_required=data.get('documents_required', ''),
                processing_time=data.get('processing_time', ''),
                special_features=data.get('special_features', '')
            )
            
            return JsonResponse({
                'id': loan.id,
                'name': loan.name,
                'message': 'Loan option created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_loan_detail(request, id):
    """Retrieve, update or delete a loan option"""
    try:
        loan = LoanOption.objects.get(pk=id)
    except LoanOption.DoesNotExist:
        return JsonResponse({'error': 'Loan option not found'}, status=404)
    
    if request.method == 'GET':
        loan_data = {
            'id': loan.id,
            'name': loan.name,
            'provider': loan.provider,
            'loan_type': loan.loan_type,
            'interest_rate': loan.interest_rate,
            'max_amount': loan.max_amount,
            'tenure': loan.tenure,
            'eligibility': loan.eligibility,
            'documents_required': loan.documents_required,
            'processing_time': loan.processing_time,
            'special_features': loan.special_features
        }
        return JsonResponse(loan_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update loan fields
            loan.name = data.get('name', loan.name)
            loan.provider = data.get('provider', loan.provider)
            loan.loan_type = data.get('loan_type', loan.loan_type)
            loan.interest_rate = data.get('interest_rate', loan.interest_rate)
            loan.max_amount = data.get('max_amount', loan.max_amount)
            loan.tenure = data.get('tenure', loan.tenure)
            loan.eligibility = data.get('eligibility', loan.eligibility)
            loan.documents_required = data.get('documents_required', loan.documents_required)
            loan.processing_time = data.get('processing_time', loan.processing_time)
            loan.special_features = data.get('special_features', loan.special_features)
            
            loan.save()
            
            return JsonResponse({
                'id': loan.id,
                'name': loan.name,
                'message': 'Loan option updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        loan.delete()
        return JsonResponse({'message': 'Loan option deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin User API
@csrf_exempt
def admin_users_list(request):
    """List and create users"""
    if request.method == 'GET':
        try:
            search_query = request.GET.get('search', '')
            
            if search_query:
                users = User.objects.filter(
                    username__icontains=search_query
                ) | User.objects.filter(
                    email__icontains=search_query
                )
                
                # Also search in FarmerProfile
                user_ids_from_profile = FarmerProfile.objects.filter(
                    first_name__icontains=search_query
                ) | FarmerProfile.objects.filter(
                    last_name__icontains=search_query
                ) | FarmerProfile.objects.filter(
                    district__icontains=search_query
                )
                
                users = users | User.objects.filter(id__in=[profile.user.id for profile in user_ids_from_profile])
            else:
                users = User.objects.all()
            
            users_data = []
            for user in users:
                # Get associated farmer profile if exists
                try:
                    profile = FarmerProfile.objects.get(user=user)
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': profile.first_name,
                        'last_name': profile.last_name,
                        'is_staff': user.is_staff,
                        'is_active': user.is_active,
                        'district': profile.district,
                        'state': profile.state,
                        'last_login': user.last_login,
                        'date_joined': user.date_joined
                    })
                except FarmerProfile.DoesNotExist:
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                        'is_active': user.is_active,
                        'district': None,
                        'state': None,
                        'last_login': user.last_login,
                        'date_joined': user.date_joined
                    })
            
            return JsonResponse(users_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create new user
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email', ''),
                password=data.get('password', 'defaultpassword')  # Default password that should be changed
            )
            
            user.first_name = data.get('first_name', '')
            user.last_name = data.get('last_name', '')
            user.is_staff = data.get('is_staff', False)
            user.is_active = data.get('is_active', True)
            user.save()
            
            # Create farmer profile if details provided
            if data.get('district') or data.get('state'):
                FarmerProfile.objects.create(
                    user=user,
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                    district=data.get('district', ''),
                    state=data.get('state', 'Karnataka')
                )
            
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'message': 'User created successfully'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_user_detail(request, id):
    """Retrieve, update or delete a user"""
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    if request.method == 'GET':
        try:
            profile = FarmerProfile.objects.get(user=user)
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'district': profile.district,
                'state': profile.state,
                'last_login': user.last_login,
                'date_joined': user.date_joined
            }
        except FarmerProfile.DoesNotExist:
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'district': None,
                'state': None,
                'last_login': user.last_login,
                'date_joined': user.date_joined
            }
        return JsonResponse(user_data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Update user fields
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.is_staff = data.get('is_staff', user.is_staff)
            user.is_active = data.get('is_active', user.is_active)
            
            # If password provided, update it
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                
            user.save()
            
            # Update or create farmer profile
            profile, created = FarmerProfile.objects.get_or_create(user=user)
            profile.first_name = data.get('first_name', profile.first_name)
            profile.last_name = data.get('last_name', profile.last_name)
            profile.district = data.get('district', profile.district)
            profile.state = data.get('state', profile.state)
            profile.save()
            
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'message': 'User updated successfully'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        user.delete()
        return JsonResponse({'message': 'User deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405) 