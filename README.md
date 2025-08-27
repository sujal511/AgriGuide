# CropMate - Agricultural Support Platform

CropMate is an agricultural support platform designed to assist farmers with crop planning, resource management, and access to government schemes and financial resources.

## 🌾 Features

- **Farmer Profile Management**: Complete farmer profile setup and management
- **Crop Recommendations**: AI-powered crop suggestions based on soil and climate conditions
- **Government Schemes**: Access to agricultural schemes and loan options
- **Fertilizer Analysis**: Personalized fertilizer recommendations and crop economics
- **Resource Management**: Farm resource and task management tools
- **Weather Integration**: Real-time weather tracking and crop season monitoring
- **EMI Calculator**: Financial planning tools for agricultural loans
- **Dashboard**: Comprehensive monitoring of farm activities and weather

## 🏗️ Architecture

- **Backend**: Django REST API with Python 3.10+
- **Frontend**: React 18+ with Vite.js
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, react-chartjs-2, recharts
- **Data**: JSON-based static data with Django ORM

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the Django development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
cropmate/
├── Backend/                 # Django backend application
│   ├── AgriGuide/          # Main Django project configuration
│   ├── main_app/           # Core functionality (crops, fertilizer, etc.)
│   ├── myapp/              # User management and authentication
│   ├── data2/              # Static JSON data files
│   └── manage.py
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API services
│   │   ├── context/        # React context providers
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── data/                   # Bank and loan data
└── README.md
```

## 🛠️ Development

### Backend Commands

- Run development server: `python manage.py runserver`
- Run migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Import data: `python manage.py import_data`

### Frontend Commands

- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

## 🌐 API Endpoints

The backend provides RESTful APIs for:
- User authentication and management
- Farmer profile operations
- Crop recommendations
- Government schemes
- Loan options
- Fertilizer recommendations
- Weather data

## 🔧 Environment Variables

Create `.env` files for both backend and frontend with necessary configuration:

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_WEATHER_API_KEY=your-weather-api-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📋 Technologies Used

### Backend
- Django 4.2+
- Django REST Framework
- Python 3.10+
- SQLite/PostgreSQL

### Frontend
- React 18+
- Vite.js
- Tailwind CSS
- Chart.js
- Axios
- React Router

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Target Users

- Farmers seeking crop planning assistance
- Agricultural advisors
- Government agencies
- Financial institutions

## 📞 Support

For support and queries, please contact the development team or create an issue in the repository.

---

**Note**: This is an agricultural support platform designed to help farmers make informed decisions about crop planning, resource management, and financial planning.