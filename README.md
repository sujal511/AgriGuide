# 🌾 AgriGuide - Comprehensive Agricultural Support Platform

AgriGuide is a full-stack agricultural support platform designed to assist farmers with intelligent crop planning, resource management, and seamless access to government schemes and financial resources. Built with modern web technologies, it provides data-driven insights and personalized recommendations for sustainable farming practices.

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [💻 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🛠️ Development Guide](#️-development-guide)
- [📊 Database Models](#-database-models)
- [🌐 API Documentation](#-api-documentation)
- [👨‍💼 Admin Dashboard](#️-admin-dashboard)
- [🔧 Environment Configuration](#-environment-configuration)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Project Overview

### Problem Statement
Indian farmers face challenges in:
- Accessing accurate crop recommendations based on soil and climate
- Finding suitable government schemes and financial support
- Understanding market prices and profitability analysis
- Implementing modern agricultural technologies

### Solution
AgriGuide provides:
- **AI-powered crop recommendations** based on soil type, climate, and economics
- **Comprehensive government scheme database** with eligibility criteria
- **Financial planning tools** including loan options and ROI calculations
- **Technology recommendations** for modern farming practices
- **Real-time weather integration** and crop season tracking

### Target Users
- 👨‍🌾 **Farmers** - Primary users seeking crop planning assistance
- 🏛️ **Government Agencies** - Policy makers and scheme administrators
- 👨‍💼 **Agricultural Advisors** - Extension workers and consultants
- 🏦 **Financial Institutions** - Banks and lending organizations

## ✨ Key Features

### 🌱 Core Agricultural Features
- **Intelligent Crop Selection** - Multi-parameter crop recommendation engine
- **Soil-Crop Compatibility Analysis** - Scientific matching algorithms
- **Fertilizer Recommendations** - NPK analysis with organic alternatives
- **Pest & Disease Management** - Comprehensive prevention and control guides
- **Technology Integration** - Modern farming equipment recommendations

### 💰 Financial & Economic Features
- **Crop Economics Calculator** - ROI analysis and profitability projections
- **Government Scheme Finder** - Personalized scheme recommendations
- **Loan Options Database** - Comprehensive financial assistance directory
- **EMI Calculator** - Financial planning tools
- **Market Price Integration** - Real-time pricing data

### 🌤️ Environmental Features
- **Weather Dashboard** - Real-time weather monitoring
- **Climate Analysis** - Historical and predictive weather patterns
- **Seasonal Planning** - Crop calendar and timing recommendations
- **Water Management** - Irrigation requirement calculations

### 👤 User Experience Features
- **Farmer Profile Management** - Comprehensive user profiles
- **Personalized Dashboard** - Customized recommendations
- **Dark/Light Mode** - Enhanced user experience
- **Responsive Design** - Mobile-first approach
- **Multi-language Support** - Accessibility for diverse users

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Frontend│◄────────────────┤  Django Backend │
│   (Vite.js)     │     JSON API    │   (DRF)         │
└─────────────────┘                 └─────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│   Static Files  │                 │   SQLite/       │
│   (Assets, JSON)│                 │   PostgreSQL    │
└─────────────────┘                 └─────────────────┘
```

### Design Patterns
- **Backend**: MVC (Model-View-Controller) with Django
- **Frontend**: Component-based architecture with React
- **API**: RESTful API design with Django REST Framework
- **State Management**: React Context API
- **Data Flow**: Unidirectional data flow pattern

## 💻 Technology Stack

### 🔧 Backend Technologies
```
Framework:     Django 5.1.7
API:           Django REST Framework 3.15.2
Database:      SQLite (Dev) / PostgreSQL (Prod)
Authentication: Django Auth + JWT
CORS:          django-cors-headers 4.7.0
Environment:   python-dotenv 1.1.0
HTTP Client:   requests 2.32.3
```

### ⚛️ Frontend Technologies
```
Framework:     React 18.2.0
Build Tool:    Vite 4.4.5
Styling:       Tailwind CSS 3.3.3
Routing:       React Router DOM 6.22.3
HTTP Client:   Axios 1.9.0
Charts:        Chart.js 4.5.0, react-chartjs-2 5.3.0, recharts 2.15.3
Icons:         Lucide React 0.479.0, React Icons 5.5.0
UI Components: Headless UI 2.2.4
Responsive:    React Responsive 10.0.1
```

### 🗄️ Data & External Services
```
Weather API:   OpenWeatherMap / WeatherAPI
Bank Data:     JSON files (SBI, ICICI, BoB, PNB)
Schemes:       Government databases (Karnataka, Maharashtra)
Maps:          Geolocation services
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** - Backend runtime
- **Node.js 18+** - Frontend development
- **Git** - Version control
- **VS Code** (recommended) - Development environment

### 1️⃣ Clone Repository
```bash
git clone https://github.com/sujal511/AgriGuide.git
cd AgriGuide
```

### 2️⃣ Backend Setup
```bash
# Navigate to backend
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load sample data
python manage.py import_data
python manage.py import_govt_schemes

# Start development server
python manage.py runserver
```
🎯 Backend will be available at: `http://localhost:8000`

### 3️⃣ Frontend Setup
```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
🎯 Frontend will be available at: `http://localhost:5173`

### 4️⃣ Quick Test
1. Open `http://localhost:5173` in your browser
2. Register a new farmer account
3. Complete farmer profile setup
4. Explore crop recommendations

## 📁 Project Structure

```
AgriGuide/
├── 📁 Backend/                    # Django backend application
│   ├── 📁 AgriGuide/             # Main Django project configuration
│   │   ├── ⚙️ settings.py         # Django settings
│   │   ├── 🔗 urls.py             # URL routing
│   │   ├── 🌐 wsgi.py             # WSGI configuration
│   │   └── ⚡ asgi.py             # ASGI configuration
│   ├── 📁 main_app/              # Core agricultural functionality
│   │   ├── 📊 models.py           # Database models
│   │   ├── 🎮 views.py            # API views
│   │   ├── 🔗 urls.py             # App URLs
│   │   ├── 👨‍💼 admin.py            # Admin interface
│   │   ├── 📁 data/               # CSV data files
│   │   ├── 📁 migrations/         # Database migrations
│   │   └── 📁 management/         # Custom commands
│   ├── 📁 myapp/                 # User management & authentication
│   │   ├── 👤 models.py           # User models
│   │   ├── 🎮 views.py            # Auth views
│   │   ├── 📝 serializers.py      # API serializers
│   │   ├── 🔗 urls.py             # Auth URLs
│   │   └── 🛠️ utils.py            # Utility functions
│   ├── 📁 data2/                 # JSON scheme data
│   ├── 📊 db.sqlite3             # Database file
│   ├── 📋 requirements.txt       # Python dependencies
│   └── ⚙️ manage.py              # Django management
├── 📁 frontend/                  # React frontend application
│   ├── 📁 src/                   # Source code
│   │   ├── 📱 App.jsx             # Main app component
│   │   ├── 🎨 index.css           # Global styles
│   │   ├── 🚀 main.jsx            # App entry point
│   │   ├── 📁 components/         # Reusable UI components
│   │   │   ├── 📊 Dashboard.jsx    # Main dashboard
│   │   │   ├── 🌾 PersonalizedRecommendations.jsx
│   │   │   ├── 🏛️ GovernmentSchemes.jsx
│   │   │   ├── 💰 EMICalculator.jsx
│   │   │   └── 🌤️ WeatherWidget.jsx
│   │   ├── 📁 pages/              # Application pages
│   │   │   ├── 🏠 AgriGuidePage.jsx # Landing page
│   │   │   ├── 🔐 Login.jsx        # Authentication
│   │   │   ├── 📊 Dashboard.jsx    # User dashboard
│   │   │   └── 👨‍💼 admin/          # Admin pages
│   │   ├── 📁 context/            # React context providers
│   │   │   ├── 🌙 DarkModeContext.jsx
│   │   │   ├── 🏙️ CityContext.jsx
│   │   │   └── 🌤️ WeatherContext.jsx
│   │   ├── 📁 services/           # API services
│   │   │   ├── 🌐 api.js           # Main API client
│   │   │   ├── 👨‍💼 adminApi.js      # Admin API
│   │   │   └── 💰 financialServices.js
│   │   └── 📁 utils/              # Utility functions
│   ├── 📁 public/                # Static assets
│   │   └── 📁 data/              # JSON data files
│   ├── 📋 package.json           # Dependencies
│   ├── ⚙️ vite.config.js         # Vite configuration
│   └── 🎨 tailwind.config.js     # Tailwind CSS config
├── 📁 data/                      # Bank loan data
│   ├── 🏦 BankofBaroda.json      # Bank of Baroda loans
│   ├── 🏦 icic.json              # ICICI Bank loans
│   ├── 🏦 punjab.json            # Punjab National Bank
│   └── 🏦 sbi.json               # State Bank of India
├── 📄 .gitignore                 # Git ignore rules
└── 📄 README.md                  # This file
```

## 🛠️ Development Guide

### Backend Development

#### Custom Management Commands
```bash
# Import crop and agricultural data
python manage.py import_data

# Import government schemes
python manage.py import_govt_schemes

# Import loan options
python manage.py import_loan_options

# Update crop seasons
python manage.py update_crop_seasons

# Update loan interest rates
python manage.py update_loan_rates
```

#### Database Operations
```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run Django shell
python manage.py shell
```

### Frontend Development

#### Available Scripts
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Initialize Tailwind CSS
npm run tailwind:init
```

#### Component Development
- Use functional components with hooks
- Implement responsive design with Tailwind CSS
- Follow React best practices for state management
- Use context providers for global state

## 📊 Database Models

### Core Models Overview

#### Agricultural Models
- **Crop** - Crop information and requirements
- **CropEconomics** - Economic analysis and profitability
- **SoilCropCompatibility** - Soil-crop matching data
- **FertilizerRecommendation** - NPK recommendations
- **Technology** - Modern farming technologies
- **PestDisease** - Pest and disease management

#### Financial Models
- **GovernmentScheme** - Government assistance programs
- **LoanOption** - Bank and financial institution loans
- **OrganicPractice** - Sustainable farming practices

#### User Models
- **CustomUser** - Extended user authentication
- **FarmerProfile** - Farmer-specific information
- **District** - Geographic and climate data

### Key Model Relationships
```python
# Crop has one-to-one relationship with CropEconomics
Crop ←→ CropEconomics

# Crop has many soil compatibility records
Crop → SoilCropCompatibility (Many)

# Crop has many fertilizer recommendations
Crop → FertilizerRecommendation (Many)

# User has one farmer profile
CustomUser ←→ FarmerProfile
```

## 🌐 API Documentation

### Authentication Endpoints
```
POST /api/auth/register/        # User registration
POST /api/auth/login/           # User login
POST /api/auth/logout/          # User logout
POST /api/auth/password-reset/  # Password reset
```

### Core API Endpoints
```
# Crop Management
GET  /api/crops/                # List all crops
GET  /api/crops/{id}/           # Crop details
GET  /api/crop-recommendations/ # Get recommendations

# Government Schemes
GET  /api/government-schemes/   # List schemes
GET  /api/schemes/search/       # Search schemes

# Loan Options
GET  /api/loan-options/         # List loan options
GET  /api/loans/calculate/      # EMI calculation

# Technology
GET  /api/technologies/         # List technologies
GET  /api/tech-recommendations/ # Technology recommendations

# Weather
GET  /api/weather/              # Weather data
GET  /api/weather/forecast/     # Weather forecast
```

### Admin API Endpoints
```
# CRUD operations for all models
GET    /api/admin/crops/        # List crops
POST   /api/admin/crops/        # Create crop
PUT    /api/admin/crops/{id}/   # Update crop
DELETE /api/admin/crops/{id}/   # Delete crop

# Similar patterns for:
# - technologies, schemes, loans, users
```

## 👨‍💼 Admin Dashboard

### Admin Features
- **Crop Management** - Add, edit, delete crop information
- **Technology Management** - Manage farming technologies
- **Scheme Management** - Government scheme administration
- **Loan Management** - Financial product management
- **User Management** - User account administration
- **Analytics Dashboard** - Usage statistics and insights

### Admin Access
1. Create superuser: `python manage.py createsuperuser`
2. Access admin at: `http://localhost:8000/admin/`
3. Frontend admin at: `http://localhost:5173/admin/`

## 🔧 Environment Configuration

### Backend Environment (.env)
```bash
# Debug mode
DEBUG=True

# Secret key for Django
SECRET_KEY=your-secret-key-here

# Database configuration
DATABASE_URL=sqlite:///db.sqlite3
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/agriguide

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# External API keys
WEATHER_API_KEY=your-weather-api-key
```

### Frontend Environment (.env)
```bash
# API base URL
VITE_API_BASE_URL=http://localhost:8000

# Weather API configuration
VITE_WEATHER_API_KEY=your-weather-api-key
VITE_WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Map services
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT_SUPPORT=false
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

#### Build Configuration
```bash
# Build command
npm run build

# Output directory
dist/

# Environment variables (set in hosting platform)
VITE_API_BASE_URL=https://your-backend-url.com
VITE_WEATHER_API_KEY=production-weather-key
```

### Backend Deployment (Railway/Heroku/DigitalOcean)

#### Requirements for Production
```bash
# Install production dependencies
pip install gunicorn psycopg2-binary

# Add to requirements.txt
gunicorn==21.2.0
psycopg2-binary==2.9.9
```

#### Production Settings
```python
# settings.py modifications for production
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', '.herokuapp.com']

# Database for production
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

#### Docker Deployment
```dockerfile
# Dockerfile example
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "AgriGuide.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `python manage.py test` (Backend) / `npm test` (Frontend)
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a Pull Request

### Code Standards
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ESLint configuration
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for significant changes

### Testing
```bash
# Backend tests
cd Backend
python manage.py test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Indian Agricultural Research Data** - ICAR and state agricultural departments
- **Weather Data** - OpenWeatherMap API
- **Government Schemes** - Various state and central government portals
- **Bank Data** - Public APIs and official bank websites

## 📞 Support & Contact

- **Email**: support@agriguide.com
- **GitHub Issues**: [Report bugs or request features](https://github.com/sujal511/AgriGuide/issues)
- **Documentation**: [Wiki](https://github.com/sujal511/AgriGuide/wiki)

## 🔮 Future Roadmap

- [ ] **Mobile App** - React Native application
- [ ] **AI/ML Integration** - Advanced crop prediction models
- [ ] **IoT Integration** - Sensor data integration
- [ ] **Marketplace** - Agricultural products marketplace
- [ ] **Multi-language Support** - Regional language support
- [ ] **Offline Mode** - PWA capabilities
- [ ] **Real-time Chat** - Farmer-advisor communication
- [ ] **Advanced Analytics** - Comprehensive farming analytics

---

**Note**: AgriGuide is designed to empower farmers with data-driven insights for sustainable and profitable agriculture. This platform bridges the gap between traditional farming practices and modern agricultural technology.

---

*Built with ❤️ for the farming community*