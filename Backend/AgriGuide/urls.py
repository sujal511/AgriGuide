from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
    # Add main_app URLs - both regular and API endpoints
    path('', include('main_app.urls')),
    # Government schemes are now handled through myapp API endpoints (api/gov-schemes/)
    # Bank_app URLs are also handled by myapp
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)