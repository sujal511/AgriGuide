import React from 'react';
import { DarkModeProvider } from './context/DarkModeContext';
import { CityProvider } from './context/CityContext';
import { WeatherProvider } from './context/WeatherContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgriGuidePage from './pages/AgriGuidePage';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CropSuggestions from './pages/CropSuggestions';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
// import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';
import ContactUs from './pages/ContactUs';
import FarmerProfileSetup from './components/FarmerProfileSetup';
import PersonalizedRecommendations from './components/PersonalizedRecommendations';

// Admin imports
import AdminRoute from './pages/admin/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import CropForm from './pages/admin/CropForm';
import UserForm from './pages/admin/UserForm';
import TechnologyForm from './pages/admin/TechnologyForm';
import SchemeForm from './pages/admin/SchemeForm';
import LoanForm from './pages/admin/LoanForm';

function App() {
  return (
    <DarkModeProvider>
      <CityProvider>
        <WeatherProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AgriGuidePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contactUs" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
              <Route path="/crop-suggestions" element={<CropSuggestions />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/profile" element={<Profile />} /> */}
              <Route path="/government-schemes" element={<GovernmentSchemesPage />} />
              <Route path="/farmer-profile-setup" element={<FarmerProfileSetup />} />
              <Route path="/personalized-recommendations" element={<PersonalizedRecommendations />} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/crops/add" element={<CropForm />} />
                <Route path="/admin/crops/edit/:id" element={<CropForm />} />
                <Route path="/admin/technologies/add" element={<TechnologyForm />} />
                <Route path="/admin/technologies/edit/:id" element={<TechnologyForm />} />
                <Route path="/admin/schemes/add" element={<SchemeForm />} />
                <Route path="/admin/schemes/edit/:id" element={<SchemeForm />} />
                <Route path="/admin/loans/add" element={<LoanForm />} />
                <Route path="/admin/loans/edit/:id" element={<LoanForm />} />
                <Route path="/admin/users/add" element={<UserForm />} />
                <Route path="/admin/users/edit/:id" element={<UserForm />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </WeatherProvider>
      </CityProvider>
    </DarkModeProvider>
  );
}

export default App;
