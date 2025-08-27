import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import WeatherDashboard from '../components/WeatherDashboard';
import DashboardWeather from '../components/DashboardWeather';
import { useCity } from '../context/CityContext';
import LoanDetails from '../components/LoanDetails';
import EMICalculator from '../components/EMICalculator';
import TaskManager from '../components/TaskManager';
import { 
  Calendar, Cloud, BarChart2, Home, Leaf, 
  Droplet, Thermometer, User, Settings, Menu, 
  X, Info, AlertTriangle, Sun, Moon, ChevronDown, 
  AlertCircle, AlertOctagon, Filter, Eye, 
  Bell, Globe, Mail, Shield,
  MessageCircle,
  Heart,
  MapPin,
  Award,
  Video,
  FileText,
  BarChart,
  Grid,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Database,
  BrainCircuit,
  DollarSign,
  Wallet,
  TrendingUp,
  HelpCircle,
  Phone
} from 'lucide-react';
// import Community from '../components/Community';
// import CommunityPage from './CommunityPage';
import GovernmentSchemes from '../components/GovernmentSchemes';
import FarmResourceManagement from '../components/FarmResourceManagement';
import BasicResources from '../components/BasicResources';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import FinancialResourceManagement from '../components/FinancialResourceManagement';
import { getUserProfile, updateUserProfile } from '../services/api';
import ProfileModal from '../components/profile/ProfileModal';
import { useWeather } from '../context/WeatherContext';
import CropRecommendations from '../components/recommendations/CropRecommendations';
import EnhancedCropDetails from '../components/recommendations/CropDetails';

//profile component
const ProfileComponent = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_verified: false,
    date_joined: '',
    bio: 'Sustainable farming enthusiast with experience in organic produce.',
    location: 'Karnataka, India',
    profile_image: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...userData});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [loanSchemes, setLoanSchemes] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load user profile data from localStorage or fetch from API
  useEffect(() => {
    const loadUserData = () => {
      // Try to get user data from localStorage
      const storedUserData = localStorage.getItem('userData');
      
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData({
            ...userData,
            ...parsedData
          });
          setFormData({
            ...userData,
            ...parsedData
          });
          
          // Set image preview if available
          if (parsedData.profile_image) {
            setImagePreview(parsedData.profile_image);
          }
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
        }
      } else if (localStorage.getItem('token')) {
        // If we have a token but no user data, fetch from API
        fetchUserProfile();
      }
    };

    loadUserData();
    
    // Load crop recommendations from localStorage
    const storedRecommendations = localStorage.getItem('personalizedCropRecommendations');
    if (storedRecommendations) {
      try {
        const parsedData = JSON.parse(storedRecommendations);
        if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
          setCropRecommendations(parsedData.data);
        } else if (Array.isArray(parsedData)) {
          setCropRecommendations(parsedData);
        }
      } catch (err) {
        console.error('Error parsing stored crop recommendations:', err);
      }
    }
    
    // Load loan schemes from localStorage or set defaults
    const storedLoanSchemes = localStorage.getItem('loanSchemes');
    if (storedLoanSchemes) {
      try {
        const parsedSchemes = JSON.parse(storedLoanSchemes);
        setLoanSchemes(Array.isArray(parsedSchemes) ? parsedSchemes : []);
      } catch (err) {
        console.error('Error parsing stored loan schemes:', err);
        // Set default loan schemes
        setLoanSchemes([
          { id: 1, name: 'Kisan Credit Card', provider: 'SBI', interestRate: '7%' },
          { id: 2, name: 'Crop Loan', provider: 'NABARD', interestRate: '8.5%' },
          { id: 3, name: 'Agriculture Infrastructure', provider: 'HDFC', interestRate: '9%' },
          { id: 4, name: 'Farm Mechanization', provider: 'PNB', interestRate: '8%' },
          { id: 5, name: 'Land Development', provider: 'Canara Bank', interestRate: '7.5%' }
        ]);
      }
    } else {
      // Set default loan schemes
      setLoanSchemes([
        { id: 1, name: 'Kisan Credit Card', provider: 'SBI', interestRate: '7%' },
        { id: 2, name: 'Crop Loan', provider: 'NABARD', interestRate: '8.5%' },
        { id: 3, name: 'Agriculture Infrastructure', provider: 'HDFC', interestRate: '9%' },
        { id: 4, name: 'Farm Mechanization', provider: 'PNB', interestRate: '8%' },
        { id: 5, name: 'Land Development', provider: 'Canara Bank', interestRate: '7.5%' }
      ]);
    }
    
    // Set user activities - only include activities that are relevant to the project
    setUserActivities([
      { 
        id: 1, 
        type: 'view', 
        icon: <FileText className="h-5 w-5 text-green-600" />, 
        description: 'You viewed Government Schemes for Karnataka', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        timeText: '2 hours ago'
      },
      { 
        id: 2, 
        type: 'weather', 
        icon: <Cloud className="h-5 w-5 text-blue-600" />, 
        description: 'You checked weather forecast for your region', 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        timeText: 'Yesterday'
      },
      { 
        id: 3, 
        type: 'financial', 
        icon: <DollarSign className="h-5 w-5 text-purple-600" />, 
        description: 'You updated your farm expense tracker', 
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeText: '3 days ago'
      },
      { 
        id: 4, 
        type: 'resources', 
        icon: <Database className="h-5 w-5 text-cyan-600" />, 
        description: 'You added new farm equipment to resources', 
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        timeText: '4 days ago'
      },
      { 
        id: 5, 
        type: 'recommendation', 
        icon: <BrainCircuit className="h-5 w-5 text-yellow-600" />, 
        description: 'You received crop recommendations for Rabi season', 
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        timeText: '1 week ago'
      }
    ]);
  }, []);

  // Function to fetch user profile from the API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }

      const { success, data, message } = await getUserProfile();

      if (success && data) {
        // Update state with user data including profile image
        setUserData(data);
        setFormData(data);
        
        // Set image preview if available from the server
        if (data.profile_image) {
          setImagePreview(data.profile_image);
        }
        
        // Also update localStorage with the complete data from server
        localStorage.setItem('userData', JSON.stringify(data));
      } else {
        setError(message || 'Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      
      if (err.response && err.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Toggle between view and edit modes
  const toggleEditMode = () => {
    if (isEditing) {
      setFormData({...userData}); // Reset form data to original user data
    }
    setIsEditing(!isEditing);
    setSuccessMessage('');
  };

  // Handle form submission to update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      const { success, data, message } = await updateUserProfile(formData);

      if (success && data) {
        setUserData(data);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(data));
      } else {
        setError(message || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date string to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      // Set image preview
      setImagePreview(reader.result);
      
      // Update form data with profile image
      const updatedFormData = {
        ...formData,
        profile_image: reader.result
      };
      setFormData(updatedFormData);
      
      try {
        setLoading(true);
        // Send the profile image to the backend
        const { success, data, message } = await updateUserProfile({
        profile_image: reader.result
      });
      
        if (success && data) {
          // Update user data in state and localStorage with the response from the server
      const updatedUserData = {
        ...userData,
            ...data
      };
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setSuccessMessage('Profile image updated successfully!');
        } else {
          setError(message || 'Failed to update profile image. Please try again.');
        }
      } catch (err) {
        console.error('Error updating profile image:', err);
        setError('Failed to update profile image. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle profile update including image
  const handleProfileUpdate = async (updatedUserData) => {
    try {
      // If we have a new image preview, add it to the updated data
      if (imagePreview && imagePreview !== userData.profile_image) {
        updatedUserData = {
          ...updatedUserData,
          profile_image: imagePreview
        };
      }

      const response = await updateUserProfile(updatedUserData);
      if (response.success) {
        // Update the user data in state and localStorage
        const updatedData = { ...userData, ...updatedUserData };
        setUserData(updatedData);
        localStorage.setItem('userData', JSON.stringify(updatedData));
        return true;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      throw error;
    }
  };

  if (loading && !userData.username) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-3 text-gray-600">Loading profile...</p>
      </div>
    );
  }
  
  // Define app features information
  const appFeatures = {
    dashboard: {
      title: "Dashboard",
      icon: <Home className="h-5 w-5 text-green-600" />,
      description: "Overview of farm status, weather conditions, and key metrics"
    },
    recommendations: {
      title: "Personalized Recommendations",
      icon: <BrainCircuit className="h-5 w-5 text-blue-600" />,
      description: "AI-powered crop suggestions based on soil, climate, and market conditions"
    },
    farmResources: {
      title: "Farm Resources",
      icon: <Database className="h-5 w-5 text-purple-600" />,
      description: "Manage land, equipment, seeds, and other farming resources"
    },
    financialResources: {
      title: "Financial Resources",
      icon: <DollarSign className="h-5 w-5 text-yellow-600" />,
      description: "Track expenses, revenue, and financial planning tools"
    },
    weather: {
      title: "Weather",
      icon: <Cloud className="h-5 w-5 text-cyan-600" />,
      description: "Forecasts, alerts, and historical weather data for your region"
    },
    bankLoans: {
      title: "Bank Loans",
      icon: <CreditCard className="h-5 w-5 text-indigo-600" />,
      description: "Agricultural loan options, EMI calculator, and application tracking"
    },
    govSchemes: {
      title: "Government Schemes",
      icon: <FileText className="h-5 w-5 text-red-600" />,
      description: "Information on subsidies, grants, and government programs for farmers"
    },
    profile: {
      title: "Profile",
      icon: <User className="h-5 w-5 text-gray-600" />,
      description: "Manage your personal information and account settings"
    }
  };
  
  return (
    <div className="flex flex-col">
      {/* Display error/success messages */}
      {error && (
        <div className="w-full mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="w-full mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
          {successMessage}
        </div>
      )}
      
      {/* Profile Header Section */}
      <div className="relative flex flex-col items-center pb-6 border-b border-gray-200">
        {/* Profile picture with online indicator and upload option */}
        <div className="relative">
          <div 
            className="h-24 w-24 rounded-full border-4 border-white shadow-lg -mt-12 bg-green-600 overflow-hidden cursor-pointer group"
            onClick={triggerFileInput}
          >
            {imagePreview || userData.profile_image ? (
              <img
                className="h-full w-full object-cover"
                src={imagePreview || userData.profile_image}
                alt="User profile"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
              <div className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                Change Photo
              </div>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          <span className="absolute bottom-1 right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mt-4 mb-1">
          {userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}`
            : userData.username || 'User Name'}
        </h2>
        
        <p className="text-gray-600 mb-1 flex items-center">
          <Mail className="h-4 w-4 mr-1" />
          {userData.email || 'user@example.com'}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{userData.location}</span>
        </div>
        
        <div className="flex space-x-2 mb-3">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Farm User</span>
          {userData.is_verified && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </span>
          )}
        </div>

        {/* Real Statistics Section */}
        <div className="grid grid-cols-3 w-full gap-4 mt-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
            <span className="text-2xl font-bold text-gray-800">{cropRecommendations.length || 12}</span>
            <span className="text-xs text-gray-500">Crop Recommendations</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
            <span className="text-2xl font-bold text-gray-800">{loanSchemes.length || 5}</span>
            <span className="text-xs text-gray-500">Loan Options</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
            <span className="text-2xl font-bold text-gray-800">{userActivities.length || 5}</span>
            <span className="text-xs text-gray-500">Recent Activities</span>
          </div>
        </div>

        {/* Unified Action Button */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full py-2 mt-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Settings className="h-4 w-4" />
          Manage Profile & Settings
        </button>
      </div>
      
      {/* Profile Navigation */}
      <div className="flex border-b border-gray-200 mt-4">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 text-sm font-medium ${activeSection === 'overview' 
            ? 'text-green-600 border-b-2 border-green-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection('features')}
          className={`px-4 py-2 text-sm font-medium ${activeSection === 'features' 
            ? 'text-green-600 border-b-2 border-green-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Features
        </button>
        <button
          onClick={() => setActiveSection('activity')}
          className={`px-4 py-2 text-sm font-medium ${activeSection === 'activity' 
            ? 'text-green-600 border-b-2 border-green-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Activity
        </button>
      </div>
      
      {/* Content Sections */}
      <div className="mt-4">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            {/* About Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
              <p className="text-sm text-gray-600">{userData.bio}</p>
            </div>
            
            {/* Member Since */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Member Since</h3>
              <p className="text-sm text-gray-600">{formatDate(userData.date_joined) || 'May 18, 2025'}</p>
            </div>

            {/* App Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">AgriGuide</h3>
              <p className="text-sm text-gray-600">
                A comprehensive farming assistant application that helps farmers make data-driven decisions, 
                access financial resources, monitor weather conditions, and implement sustainable agricultural practices.
              </p>
            </div>
            
            {/* Top Recommendations */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Crop Recommendations</h3>
              <div className="flex flex-wrap gap-2">
                {cropRecommendations.length > 0 ? (
                  cropRecommendations.slice(0, 4).map((crop, index) => (
                    <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      {crop.name || crop}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Rice</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Wheat</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Tomato</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Cotton</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Features Section */}
        {activeSection === 'features' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Features</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {Object.values(appFeatures).map((feature, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-start">
                  <div className="mr-3 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">{feature.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Activity Section */}
        {activeSection === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h3>
            
            <div className="space-y-3">
              {userActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="mt-0.5 mr-3">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timeText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userData={userData}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

const MobileHeader = ({ sidebarOpen, setSidebarOpen, notifications, activeNav, weather, userData, onShowHelp }) => (
  <div className="lg:hidden">
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none mr-3"
        >
          <Menu className="h-6 w-6" />
        </button>
          <span className="font-semibold text-gray-800">{activeNav}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Weather indicator */}
          {weather && (
            <div className="flex items-center bg-blue-50 rounded-full py-1 px-2 text-xs">
              <Cloud className="h-3 w-3 text-blue-500 mr-1" />
              <span className="font-medium text-blue-700">
                {Math.round(weather.temperature)}°C
              </span>
            </div>
          )}
          
          {/* Help icon */}
          <HelpCircle 
            className="h-5 w-5 text-gray-500 cursor-pointer" 
            onClick={onShowHelp}
          />
          
          {/* Notification icon */}
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            {notifications && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
          
          {/* Profile icon */}
          <div className="relative">
            {userData && userData.profile_image ? (
              <img 
                className="h-8 w-8 rounded-full object-cover border-2 border-green-300" 
                src={userData.profile_image}
                alt="User profile" 
              />
            ) : (
            <User className="h-6 w-6 text-gray-500" />
            )}
          </div>
        </div>
      </div>
    </header>
  </div>
);

const SettingsComponent = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
      
      1. Account Settings
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Change Password</span>
              </div>
              <button className="text-green-600 hover:text-green-700">Update</button>
            </div>
            {/* Add other account settings items */}
          </div>
        </div>

        {/* 2. Privacy Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Privacy Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Profile Visibility</span>
              <select className="bg-white border border-gray-300 rounded-md px-3 py-1 text-gray-800">
                <option>Public</option>
                <option>Private</option>
                <option>Friends Only</option>
              </select>
            </div>
            {/* Add other privacy settings items */}
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Email Notifications</span>
              <input type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Push Notifications</span>
              <input type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">SMS Notifications</span>
              <input type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300" />
            </div>
          </div>
        </div>

        {/* 4. Danger Zone */}
        <div>
          <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-base font-medium text-red-800 mb-2">Delete Account</h4>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration

const CROP_DATABASE = [
  { 
    id: 1, 
    name: 'Rice', 
    soilTypes: ['clay', 'loam'], 
    minPh: 5.5, maxPh: 7.5, 
    minTemp: 20, maxTemp: 35, 
    minRainfall: 800, maxRainfall: 2200,
    season: 'Summer',
    fertilizer: 'Nitrogen-rich fertilizer (NPK 12-6-6)',
    growthDays: 90,
    waterRequirement: 'High',
    notes: 'Requires standing water during most of its growing period.',
    marketValue: 'High',
    pestResistance: 'Medium',
    droughtTolerance: 'Low'
  },
  { 
    id: 2, 
    name: 'Wheat', 
    soilTypes: ['loam', 'clay', 'silt'], 
    minPh: 6.0, maxPh: 7.5, 
    minTemp: 10, maxTemp: 24, 
    minRainfall: 450, maxRainfall: 650,
    season: 'Winter',
    fertilizer: 'Balanced NPK (NPK 10-10-10)',
    growthDays: 110,
    waterRequirement: 'Moderate',
    notes: 'Cold resistant variety can survive temperatures as low as -4°C.',
    marketValue: 'High',
    pestResistance: 'High',
    droughtTolerance: 'Medium'
  },
  { 
    id: 3, 
    name: 'Corn', 
    soilTypes: ['loam', 'silt'], 
    minPh: 5.8, maxPh: 7.0, 
    minTemp: 18, maxTemp: 32, 
    minRainfall: 500, maxRainfall: 800,
    season: 'Spring-Summer',
    fertilizer: 'NPK 10-20-20',
    growthDays: 80,
    waterRequirement: 'Moderate',
    notes: 'Sensitive to frost. Requires good drainage.',
    marketValue: 'Medium',
    pestResistance: 'Medium',
    droughtTolerance: 'Medium'
  },
  { 
    id: 4, 
    name: 'Potatoes', 
    soilTypes: ['sandy', 'loam'], 
    minPh: 5.0, maxPh: 6.5, 
    minTemp: 15, maxTemp: 24, 
    minRainfall: 400, maxRainfall: 800,
    season: 'Spring',
    fertilizer: 'Potassium-rich fertilizer (NPK 5-10-15)',
    growthDays: 75,
    waterRequirement: 'Moderate',
    notes: 'Requires well-drained soil to prevent tuber rot.',
    marketValue: 'Medium',
    pestResistance: 'Low',
    droughtTolerance: 'Low'
  },
  { 
    id: 5, 
    name: 'Sorghum', 
    soilTypes: ['loam', 'clay', 'sandy'], 
    minPh: 5.5, maxPh: 8.5, 
    minTemp: 25, maxTemp: 40, 
    minRainfall: 350, maxRainfall: 700,
    season: 'Summer',
    fertilizer: 'Drought-resistant blend (NPK 8-12-16)',
    growthDays: 100,
    waterRequirement: 'Low',
    notes: 'Highly drought resistant. Good for arid regions.',
    marketValue: 'Medium',
    pestResistance: 'High',
    droughtTolerance: 'High'
  },
  { 
    id: 6, 
    name: 'Soybeans', 
    soilTypes: ['loam', 'clay'], 
    minPh: 6.0, maxPh: 7.0, 
    minTemp: 20, maxTemp: 30, 
    minRainfall: 450, maxRainfall: 700,
    season: 'Summer',
    fertilizer: 'Phosphorus-rich (NPK 3-15-8)',
    growthDays: 85,
    waterRequirement: 'Moderate',
    notes: 'Fixes nitrogen in soil. Good rotation crop.',
    marketValue: 'High',
    pestResistance: 'Medium',
    droughtTolerance: 'Medium'
  },
  {
    id: 7,
    name: 'Cotton',
    soilTypes: ['loam', 'sandy loam'],
    minPh: 5.5,
    maxPh: 7.5,
    minTemp: 25,
    maxTemp: 35,
    minRainfall: 500,
    maxRainfall: 1000,
    season: 'Summer',
    fertilizer: 'Balanced NPK (NPK 20-20-20)',
    growthDays: 150,
    waterRequirement: 'High',
    notes: 'Requires well-drained soil and full sunlight.',
    marketValue: 'High',
    pestResistance: 'Low',
    droughtTolerance: 'Medium'
  },
  {
    id: 8,
    name: 'Groundnut',
    soilTypes: ['sandy loam', 'loam'],
    minPh: 6.0,
    maxPh: 7.0,
    minTemp: 25,
    maxTemp: 35,
    minRainfall: 500,
    maxRainfall: 1250,
    season: 'Summer',
    fertilizer: 'Calcium-rich (NPK 10-10-20)',
    growthDays: 120,
    waterRequirement: 'Moderate',
    notes: 'Good for crop rotation. Fixes nitrogen in soil.',
    marketValue: 'High',
    pestResistance: 'Medium',
    droughtTolerance: 'High'
  },
  {
    id: 9,
    name: 'Sugarcane',
    soilTypes: ['clay', 'clay loam'],
    minPh: 6.0,
    maxPh: 7.5,
    minTemp: 20,
    maxTemp: 35,
    minRainfall: 1100,
    maxRainfall: 1500,
    season: 'Year-round',
    fertilizer: 'Nitrogen-rich (NPK 25-10-10)',
    growthDays: 365,
    waterRequirement: 'High',
    notes: 'Requires rich soil and consistent moisture.',
    marketValue: 'High',
    pestResistance: 'Medium',
    droughtTolerance: 'Low'
  },
  {
    id: 10,
    name: 'Turmeric',
    soilTypes: ['loam', 'clay loam'],
    minPh: 5.5,
    maxPh: 7.5,
    minTemp: 20,
    maxTemp: 30,
    minRainfall: 1000,
    maxRainfall: 2000,
    season: 'Summer',
    fertilizer: 'Organic manure with NPK 12-12-12',
    growthDays: 270,
    waterRequirement: 'High',
    notes: 'Requires well-drained soil and partial shade.',
    marketValue: 'High',
    pestResistance: 'High',
    droughtTolerance: 'Low'
  }
];



// Component for sidebar navigation item

const NavItem = ({ icon, name, isActive = false, onClick, to }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    } else {
      onClick(name);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${
        isActive 
          ? 'text-white bg-green-700' 
          : 'text-gray-200 hover:bg-green-700 hover:text-white'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{name}</span>
    </a>
  );
};



// Card component for dashboard stats

const StatCard = ({ icon, title, value, trend = null }) => (

  <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl">

    <div className="p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center">

          <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">{icon}</div>

          <div className="ml-4">

            <p className="text-sm font-medium text-gray-500">{title}</p>

            <p className="text-lg font-semibold text-gray-900">{value}</p>

          </div>

        </div>

        {trend && (

          <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>

            <span className="text-sm font-medium">{trend > 0 ? '+' : ''}{trend}%</span>

            <ChevronDown className={`h-4 w-4 ml-1 ${trend > 0 ? 'transform rotate-180' : ''}`} />

          </div>

        )}

      </div>

    </div>

  </div>

);



// Component for crop details expansion panel

const CropDetails = ({ crop }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between">
      <h4 className="text-lg font-medium text-gray-800">{crop.name}</h4>
      <span className="text-sm text-gray-500">Match Score: {crop.score}%</span>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-3">
      <div className="bg-gray-50 p-2 rounded">
        <p className="text-xs text-gray-500">Soil Type</p>
        <p className="font-medium">{crop.soilTypes.join(', ')}</p>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <p className="text-xs text-gray-500">pH Range</p>
        <p className="font-medium">{crop.minPh} - {crop.maxPh}</p>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <p className="text-xs text-gray-500">Temperature</p>
        <p className="font-medium">{crop.minTemp}°C - {crop.maxTemp}°C</p>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <p className="text-xs text-gray-500">Rainfall</p>
        <p className="font-medium">{crop.minRainfall} - {crop.maxRainfall} mm</p>
      </div>
    </div>
  </div>
);



// Add this component after the MarketPrices component

// TaskManager component is now imported from '../components/TaskManager'

// Add Bank Loans Section Component
const BankLoansSection = () => {
  const [loanSchemes, setLoanSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    banks: [],
    loanTypes: [],
    interestRates: { min: 0, max: 0 }
  });
  const [filter, setFilter] = useState({
    bank: '',
    loanType: '',
    minRate: '',
    maxRate: ''
  });
  // Define the variables referenced in the applyFilters function
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedLoanType, setSelectedLoanType] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // Add state for expanded FAQs
  const [expandedFaq, setExpandedFaq] = useState(null);
  // State for sections expansion in detailed view
  const [expandedSections, setExpandedSections] = useState({
    overview: true, 
    eligibility: false,
    application: false
  });
  
  const navigate = useNavigate();
  
  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Toggle FAQ expansion
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
  const fetchLoanSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching loan schemes...');
      const response = await fetch('http://localhost:8000/api/bank-schemes/');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loan schemes data:', data);
        setLoanSchemes(data.schemes || []);
        setFilterOptions(data.filterOptions || {});
        setFilteredSchemes(data.schemes || []);
      } else {
        setError('Failed to load loan schemes. Please try again later.');
        console.error(`Failed to load schemes: Server responded with ${response.status}`);
      }
    } catch (error) {
      setError('Failed to connect to the server. Please check your connection and try again.');
      console.error('Error fetching loan schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch loan schemes from the API
    fetchLoanSchemes();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Update both the filter object and individual state variables
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update the specific state variable
    if (name === 'bank') {
      setSelectedBank(value);
    } else if (name === 'loanType') {
      setSelectedLoanType(value);
    } else if (name === 'minRate') {
      setMinRate(value);
    } else if (name === 'maxRate') {
      setMaxRate(value);
    }
  };
  
  // Handle search query changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create query params
      const params = new URLSearchParams();
      if (selectedBank && selectedBank !== 'All Banks') {
        params.append('bank', selectedBank);
      }
      if (selectedLoanType && selectedLoanType !== 'All Loan Types') {
        params.append('loan_type', selectedLoanType);
      }
      if (minRate) {
        params.append('min_rate', minRate);
      }
      if (maxRate) {
        params.append('max_rate', maxRate);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      console.log('Applying filters with params:', params.toString());
      const response = await fetch(`http://localhost:8000/api/bank-schemes/?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setLoanSchemes(data.schemes || []);
        setFilterOptions(data.filterOptions || {});
        setFilteredSchemes(data.schemes || []);
      } else {
        setError('Failed to apply filters. Please try again later.');
        console.error('Failed to apply filters: Server responded with', response.status);
      }
    } catch (error) {
      setError('Failed to connect to the server. Please check your internet connection and try again.');
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to view scheme details
  const viewSchemeDetails = (schemeId) => {
    console.log(`Viewing details for scheme ID: ${schemeId}`);
    
    // Reset expanded sections to default state when viewing a new scheme
    setExpandedSections({
      overview: true, 
      eligibility: false,
      application: false
    });
    
    // Set the selected scheme ID
    setSelectedSchemeId(schemeId);
  };

  // Helper function to ensure data is an array
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return [data];
    return [];
  };
  
  // Function to get appropriate badge color based on loan type
  const getLoanTypeBadgeClass = (loanType) => {
    switch (loanType) {
      case 'Crop Loan':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Term Loan':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Gold Loan':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Emergency Loan':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Cash Credit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Agri-Business (Renewable Energy)':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };
  
  // Common FAQs about bank loans
  const commonFaqs = [
    {
      question: "How do I apply for an agricultural loan?",
      answer: "You can apply for an agricultural loan by visiting the nearest branch of the bank offering the loan scheme, or in some cases, through their online portal. Most banks require documentation like land records, identity proof, and income statements."
    },
    {
      question: "What is the Kisan Credit Card (KCC)?",
      answer: "The Kisan Credit Card is a credit system introduced by Indian banks to provide affordable short-term credit to farmers. It allows farmers to purchase agricultural inputs such as seeds, fertilizers, and pesticides, and draw cash for their production needs."
    },
    {
      question: "Are there any government subsidies available?",
      answer: "Yes, several loan schemes have government subsidies associated with them. These can include interest subvention (reduced interest rates) or direct subsidies that reduce the principal amount. The availability varies by scheme and may be subject to eligibility criteria."
    },
    {
      question: "What factors affect loan approval?",
      answer: "Loan approval typically depends on factors like creditworthiness, land ownership documents, crop history, income stability, repayment capacity, and previous loan history. Some specialized agricultural loans may have additional criteria related to the type of farming activity."
    }
  ];

  // Render FAQ section with collapsible items
  const renderFaqSection = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {commonFaqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full text-left focus:outline-none"
              >
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{faq.question}</h3>
                <span className="ml-6 flex-shrink-0">
                  <svg className={`w-6 h-6 text-gray-500 dark:text-gray-400 transform transition-transform ${expandedFaq === index ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </span>
              </button>
              <div className={`mt-2 transition-all duration-200 overflow-hidden ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-600 dark:text-gray-300 px-2 pt-2 pb-1">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {!selectedSchemeId ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agricultural Loan Schemes</h1>
              
              {/* EMI Calculator Button */}
              <button 
                onClick={() => setShowEMICalculator(!showEMICalculator)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <span className="mr-2">{showEMICalculator ? 'Hide' : 'Show'} EMI Calculator</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* EMI Calculator (conditionally rendered) */}
            {showEMICalculator && <EMICalculator onClose={() => setShowEMICalculator(false)} />}

            {/* Search Bar */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for loan schemes by name, bank, or description..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-3 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <div className="mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'transform rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters - Collapsible */}
            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 animate-slideDown">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Filter Loan Schemes</h2>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="mr-2">🏦</span> Select Bank
                    </label>
                    <select 
                      name="bank"
                      value={filter.bank}
                      onChange={handleFilterChange}
                      className="w-full border rounded-md py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">All Banks</option>
                      {filterOptions.banks.length > 0 ? (
                        filterOptions.banks.map(bank => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))
                      ) : (
                        <>
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="mr-2">💰</span> Loan Type
                    </label>
                    <select 
                      name="loanType"
                      value={filter.loanType}
                      onChange={handleFilterChange}
                      className="w-full border rounded-md py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">All Loan Types</option>
                      {filterOptions.loanTypes.length > 0 ? (
                        filterOptions.loanTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))
                      ) : (
                        <>
                          <option value="Crop Loan">Crop Loan</option>
                          <option value="Term Loan">Term Loan</option>
                          <option value="Gold Loan">Gold Loan</option>
                          <option value="Emergency Loan">Emergency Loan</option>
                          <option value="Cash Credit">Cash Credit</option>
                          <option value="Agri-Business (Renewable Energy)">Agri-Business (Renewable Energy)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="mr-2">%</span> Interest Rate Range (%)
                    </label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        name="minRate"
                        value={filter.minRate}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        min="0"
                        max="20"
                        className="w-full border rounded-l-md py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="px-2 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white">to</span>
                      <input 
                        type="number" 
                        name="maxRate"
                        value={filter.maxRate}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        min="0"
                        max="20"
                        className="w-full border rounded-r-md py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Available range: {filterOptions.interestRates?.min || 5}% - {filterOptions.interestRates?.max || 18}%
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button 
                    onClick={() => {
                      setFilter({
                        bank: '',
                        loanType: '',
                        minRate: '',
                        maxRate: ''
                      });
                      setSearchQuery('');
                      // Reload all schemes
                      fetchLoanSchemes();
                    }}
                    className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-lg mb-6">
                <div className="flex items-center text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loan Schemes List */}
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {loanSchemes.length > 0 ? (
                  loanSchemes.map(scheme => (
                    <div 
                      key={scheme.id} 
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden transform hover:-translate-y-1"
                    >
                      <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{scheme.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{scheme.bank}</p>
                          </div>
                          
                          <div className={`px-3 py-1 text-xs rounded-full font-medium ${getLoanTypeBadgeClass(scheme.loanType)}`}>
                            {scheme.loanType}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-4 h-16 overflow-hidden">
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{scheme.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Interest Rate</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {scheme.interestRateMin}% - {scheme.interestRateMax}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Repayment Term</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {scheme.repaymentTermMonths} months
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => {
                              setShowEMICalculator(true);
                              // Use the scheme's values for the calculator
                              setSelectedSchemeId(scheme.id);
                            }}
                            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                          >
                            Calculate EMI
                          </button>
                          
                          <button 
                            onClick={() => viewSchemeDetails(scheme.id)}
                            className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors border border-green-200 dark:border-green-800 shadow-sm"
                          >
                            View Details
                            <ChevronRight className="h-5 w-5 ml-1 animate-bounce-right text-green-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-10 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No loan schemes found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* FAQ Section */}
          {renderFaqSection()}
        </>
      ) : (
        <div>
          {/* Loan Details and Calculate EMI button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4 flex justify-between items-center sticky top-0 z-10">
            <button
              onClick={() => setSelectedSchemeId(null)}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Loans
            </button>
            
            <button 
              onClick={() => setShowEMICalculator(!showEMICalculator)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <span className="mr-2">{showEMICalculator ? 'Hide' : 'Calculate'} EMI</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Show EMI Calculator before the loan details */}
          {showEMICalculator && (
            <div className="mb-4">
              <EMICalculator 
                initialLoanAmount={
                  loanSchemes.find(scheme => scheme.id === selectedSchemeId)?.minLoanAmount || 100000
                }
                initialInterestRate={
                  loanSchemes.find(scheme => scheme.id === selectedSchemeId) ? 
                  (loanSchemes.find(scheme => scheme.id === selectedSchemeId).interestRateMin + 
                   loanSchemes.find(scheme => scheme.id === selectedSchemeId).interestRateMax) / 2 : 8.5
                }
                initialLoanTerm={
                  loanSchemes.find(scheme => scheme.id === selectedSchemeId)?.repaymentTermMonths || 12
                }
                onClose={() => setShowEMICalculator(false)}
              />
            </div>
          )}
          
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <LoanDetails 
              schemeId={selectedSchemeId} 
              onBack={() => setSelectedSchemeId(null)}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { city, setCity } = useCity();
  const { weather } = useWeather();
  
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [currentCity, setCurrentCity] = useState(city);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_verified: false,
    date_joined: '',
    bio: 'Sustainable farming enthusiast with experience in organic produce.',
    location: 'Karnataka, India',
    profile_image: null
  });
  
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownRef]);

  // Load user profile data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (err) {
        console.error('Error parsing user data from localStorage:', err);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    soilType: '',
    phLevel: '',
    temperature: '',
    rainfall: '',
    soilMoisture: '',
    soilNPK: { nitrogen: '', phosphorus: '', potassium: '' },
    irrigationAvailable: false,
    sunlightExposure: '',
    season: '',
    landArea: '',
    pestResistance: false,
    budgetRange: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [personalizedCropRecommendations, setPersonalizedCropRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [notifications, setNotifications] = useState(2);
  
  // Enhanced Navigation with data refresh
  const handleNavChange = (navItem) => {
    setActiveNav(navItem);
    
    // Clear any expandedCrop when changing views
    if (expandedCrop) {
      setExpandedCrop(null);
    }
    
    // If navigating to "Personalized Recommendations", ensure the user is logged in
    // and get the latest profile data
    if (navItem === 'Personalized Recommendations') {
      const token = localStorage.getItem('token');
      if (!token) {
        // If the user is not authenticated, redirect to login
        navigate('/login', { state: { from: '/personalized-recommendations' } });
        return;
      }
      
      // Trigger a refresh of recommendations data
      console.log("Navigating to Personalized Recommendations, refreshing data");
      refreshRecommendations();
      
      // Force a re-render by setting and clearing a key
      // This will ensure the component gets the latest profile data
      const timestamp = Date.now();
      setActiveNav(`${navItem}-${timestamp}`);
      setTimeout(() => {
        setActiveNav(navItem);
      }, 10);
    }
    
    // Special handling for mobile to close sidebar
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Function to refresh recommendations data from localStorage
  const refreshRecommendations = () => {
    console.log("Refreshing recommendations data");
    const storedRecommendations = localStorage.getItem('personalizedCropRecommendations');
    if (storedRecommendations) {
      try {
        const parsedData = JSON.parse(storedRecommendations);
        
        // Handle new format with timestamp
        if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
          console.log("Refreshed recommendations with timestamp:", new Date(parsedData.timestamp).toLocaleString());
          setPersonalizedCropRecommendations(parsedData.data);
        } 
        // Handle old format for backward compatibility
        else if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log("Refreshed recommendations in old format");
          setPersonalizedCropRecommendations(parsedData);
        }
      } catch (err) {
        console.error("Error refreshing recommendations:", err);
      }
    }
  };

  // Keep currentCity in sync with city context
  useEffect(() => {
    setCurrentCity(city);
  }, [city]);

  // Get personalized crop recommendations from API or localStorage
  useEffect(() => {
    const storedRecommendations = localStorage.getItem('personalizedCropRecommendations');
    if (storedRecommendations) {
      try {
        const parsedData = JSON.parse(storedRecommendations);
        
        // Check if data is in the new format with timestamp
        if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
          console.log("Found recommendations with timestamp:", new Date(parsedData.timestamp).toLocaleString());
          setPersonalizedCropRecommendations(parsedData.data);
        } 
        // Handle old format for backward compatibility
        else if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log("Found recommendations in old format");
          setPersonalizedCropRecommendations(parsedData);
        }
      } catch (err) {
        console.error("Error parsing stored crop recommendations:", err);
      }
    } else {
      // Try to fetch recommendations from API if farmer ID is available
      const farmerId = localStorage.getItem('farmerId');
      if (farmerId) {
        fetchCropRecommendations(farmerId);
      }
    }
  }, []);

  // Function to fetch crop recommendations
  const fetchCropRecommendations = async (farmerId) => {
    try {
      console.log(`Dashboard fetching crop recommendations for farmer ID: ${farmerId}`);
      const response = await axios.post('/api/crop-recommendations/', { farmer_id: farmerId });
      if (response.data.success && response.data.recommendations) {
        const recommendations = response.data.recommendations || [];
        setPersonalizedCropRecommendations(recommendations);
        
        // Store in localStorage with timestamp
        const recommendationsWithTimestamp = {
          timestamp: Date.now(),
          data: recommendations
        };
        localStorage.setItem('personalizedCropRecommendations', JSON.stringify(recommendationsWithTimestamp));
        console.log('Dashboard stored fresh recommendations in localStorage');
      }
    } catch (error) {
      console.error('Dashboard error fetching crop recommendations:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      if (sidebarOpen && sidebar && !sidebar.contains(event.target) && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  // Scoring algorithm to find suitable crops based on user input
  const findSuitableCrops = (data) => {
    const { 
      soilType, 
      phLevel, 
      temperature, 
      rainfall,
      soilMoisture,
      soilNPK,
      irrigationAvailable,
      sunlightExposure,
      season,
      landArea,
      pestResistance,
      budgetRange 
    } = data;
    
    // Validate basic inputs
    if (!soilType || !phLevel || !temperature || !rainfall) {
      return [];
    }

    const numPh = parseFloat(phLevel);
    const numTemp = parseFloat(temperature);
    const numRainfall = parseFloat(rainfall);

    return CROP_DATABASE
      .map(crop => {
        let score = 0;

        // Basic criteria scoring (50% of total)
        // Soil type match (15 points)
        if (crop.soilTypes.includes(soilType)) {
          score += 15;
        }

        // pH range (15 points)
        if (numPh >= crop.minPh && numPh <= crop.maxPh) {
          score += 15;
        } else {
          const phDiff = Math.min(
            Math.abs(numPh - crop.minPh),
            Math.abs(numPh - crop.maxPh)
          );
          score += Math.max(0, 15 - phDiff * 2);
        }

        // Temperature range (10 points)
        if (numTemp >= crop.minTemp && numTemp <= crop.maxTemp) {
          score += 10;
        } else {
          const tempDiff = Math.min(
            Math.abs(numTemp - crop.minTemp),
            Math.abs(numTemp - crop.maxTemp)
          );
          score += Math.max(0, 10 - tempDiff);
        }

        // Rainfall range (10 points)
        if (numRainfall >= crop.minRainfall && numRainfall <= crop.maxRainfall) {
          score += 10;
        } else {
          const rainfallDiff = Math.min(
            Math.abs(numRainfall - crop.minRainfall),
            Math.abs(numRainfall - crop.maxRainfall)
          );
          score += Math.max(0, 10 - rainfallDiff / 100);
        }
        
        // Advanced criteria scoring (50% of total)
        if (isAdvancedMode) {
          // Soil moisture consideration (10 points)
          if (soilMoisture) {
            const moisture = parseFloat(soilMoisture);
            if (crop.waterRequirement === 'High' && moisture >= 70) {
              score += 10;
            } else if (crop.waterRequirement === 'Moderate' && moisture >= 50) {
              score += 10;
            } else if (crop.waterRequirement === 'Low' && moisture >= 30) {
              score += 10;
            }
          }
          
          // Soil NPK levels (10 points)
          if (soilNPK.nitrogen && soilNPK.phosphorus && soilNPK.potassium) {
            const nitrogen = parseFloat(soilNPK.nitrogen);
            const phosphorus = parseFloat(soilNPK.phosphorus);
            const potassium = parseFloat(soilNPK.potassium);
            
            // Check if soil nutrients match crop requirements
            if (crop.fertilizer.includes('Nitrogen-rich') && nitrogen >= 15) {
              score += 3;
            }
            if (crop.fertilizer.includes('Phosphorus-rich') && phosphorus >= 15) {
              score += 3;
            }
            if (crop.fertilizer.includes('Potassium-rich') && potassium >= 15) {
              score += 4;
            }
          }
          
          // Irrigation availability (5 points)
          if (irrigationAvailable && crop.waterRequirement === 'High') {
            score += 5;
          }
          
          // Sunlight exposure (5 points)
          if (sunlightExposure === 'full' && !crop.notes.includes('partial shade')) {
            score += 5;
          } else if (sunlightExposure === 'partial' && crop.notes.includes('partial shade')) {
            score += 5;
          }
          
          // Season match (5 points)
          if (season && crop.season.toLowerCase().includes(season.toLowerCase())) {
            score += 5;
          }
          
          // Land area consideration (5 points)
          if (landArea) {
            const area = parseFloat(landArea);
            if (area >= 1) { // Assuming 1 acre minimum
              score += 5;
            }
          }
          
          // Pest resistance preference (5 points)
          if (pestResistance && crop.pestResistance === 'High') {
            score += 5;
          }
          
          // Budget consideration (5 points)
          if (budgetRange) {
            const budget = parseFloat(budgetRange);
            if (crop.marketValue === 'High' && budget >= 50000) {
              score += 5;
            } else if (crop.marketValue === 'Medium' && budget >= 25000) {
              score += 5;
            }
          }
        }
        
        return {
          ...crop,
          score
        };
      })
      .filter(crop => crop.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 matches
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.soilType) {
      errors.soilType = 'Soil type is required';
    }
    
    if (!formData.phLevel) {
      errors.phLevel = 'pH level is required';
    } else if (formData.phLevel < 0 || formData.phLevel > 14) {
      errors.phLevel = 'pH must be between 0 and 14';
    }
    
    if (!formData.temperature) {
      errors.temperature = 'Temperature is required';
    }
    
    if (!formData.rainfall) {
      errors.rainfall = 'Rainfall is required';
    } else if (formData.rainfall < 0) {
      errors.rainfall = 'Rainfall cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('soilNPK')) {
      const nutrient = name.split('.')[1]; // Get nutrient type (nitrogen, phosphorus, potassium)
      setFormData({
        ...formData,
        soilNPK: {
          ...formData.soilNPK,
          [nutrient]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = findSuitableCrops(formData);
      setSuggestions(results);
      setLoading(false);
    }, 800);
  };

  // Combined suggestions - prefer personalized recommendations if available
  const combinedSuggestions = personalizedCropRecommendations.length > 0 
    ? personalizedCropRecommendations 
    : suggestions;

  // Financial metrics for dashboard
  const stats = [
    { title: 'Total Expenses', value: '₹25,000', icon: <Wallet className="h-5 w-5 text-green-600" />, trend: 8 },
    { title: 'Active Loans', value: '2', icon: <CreditCard className="h-5 w-5 text-green-600" />, trend: 0 },
    { title: 'Expected Revenue', value: '₹58,000', icon: <DollarSign className="h-5 w-5 text-green-600" />, trend: 12 },
    { title: 'ROI', value: '32%', icon: <TrendingUp className="h-5 w-5 text-green-600" />, trend: 5 }
  ];

  // Add logout handler function
  const handleLogout = () => {
    // Clear any auth tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other auth-related data you might have
    localStorage.removeItem('darkMode'); // Optional: clear theme preference
    
    // Redirect to login page
    navigate('/login');
  };

  // Profile Section Components
  const ProfileSection = () => {
    const sections = {
      personalInfo: {
        title: "Personal Information",
        fields: [
          { label: "Profile Picture", type: "image" },
          { label: "Full Name", type: "text" },
          { label: "Email", type: "email" },
          { label: "Phone", type: "tel" },
          { label: "Location", type: "text" },
          { label: "Bio", type: "textarea" }
        ]
      },
      farmDetails: {
        title: "Farm Details",
        fields: [
          { label: "Number of Farms", type: "number" },
          { label: "Total Land Area", type: "number" },
          { label: "Farming Experience", type: "number" },
          { label: "Certifications", type: "multiselect" }
        ]
      },
      activityHistory: {
        title: "Activity History",
        items: [
          "Recent Actions",
          "Crop Management History",
          "Reports Generated",
          "Analysis History"
        ]
      }
    };
  };

  // Settings Section Components
  const SettingsSection = () => {
    const settings = {
      accountSettings: {
        title: "Account Settings",
        options: [
          { label: "Change Password", icon: "lock" },
          { label: "Two-Factor Authentication", icon: "shield" },
          { label: "Language Preferences", icon: "globe" },
          { label: "Time Zone Settings", icon: "clock" }
        ]
      },
      notifications: {
        title: "Notification Preferences",
        options: [
          { label: "Weather Alerts", enabled: true },
          { label: "Crop Monitoring", enabled: true },
          { label: "Market Updates", enabled: false },
          { label: "System Notifications", enabled: true }
        ]
      },
      privacy: {
        title: "Privacy & Security",
        options: [
          { label: "Profile Visibility", type: "toggle" },
          { label: "Data Sharing", type: "toggle" },
          { label: "Connected Devices", type: "list" },
          { label: "Login History", type: "view" }
        ]
      },
      subscription: {
        title: "Subscription & Billing",
        details: [
          { label: "Current Plan", value: "Premium" },
          { label: "Billing Cycle", value: "Monthly" },
          { label: "Payment Method", value: "Credit Card" },
          { label: "Next Billing Date", value: "2024-04-01" }
        ]
      },
      integrations: {
        title: "Integration Settings",
        services: [
          { name: "Weather Service", connected: true },
          { name: "IoT Devices", connected: true },
          { name: "Market Data API", connected: false },
          { name: "Soil Sensors", connected: true }
        ]
      },
      support: {
        title: "Support & Help",
        resources: [
          { type: "Documentation", url: "/docs" },
          { type: "Video Tutorials", url: "/tutorials" },
          { type: "FAQs", url: "/faqs" },
          { type: "Contact Support", url: "/support" }
        ]
      }
    };
  };

  // Theme Settings Component
  const ThemeSettings = () => {
    const themes = {
      display: {
        title: "Display Settings",
        options: [
          { label: "Dark Mode", type: "toggle" },
          { label: "High Contrast", type: "toggle" },
          { label: "Reduced Motion", type: "toggle" }
        ]
      },
      units: {
        title: "Measurement Units",
        options: [
          { label: "Temperature", values: ["Celsius", "Fahrenheit"] },
          { label: "Distance", values: ["Metric", "Imperial"] },
          { label: "Weight", values: ["Kilograms", "Pounds"] }
        ]
      }
    };
  };

  // Data Management Component
  const DataManagement = () => {
    const dataOptions = {
      export: {
        title: "Export Data",
        formats: ["CSV", "PDF", "JSON"],
        timeRange: ["Last Month", "Last 3 Months", "Last Year", "All Time"]
      },
      delete: {
        title: "Delete Account",
        steps: [
          "Backup Data",
          "Confirm Deletion",
          "Enter Password",
          "Final Confirmation"
        ]
      }
    };
  };

  // Add error handling and debugging
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Debug logging to help identify the issue
  useEffect(() => {
    console.log("Dashboard component mounting...");
    try {
      // Check if the component loads properly
      setLoadingDashboard(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setDashboardError(error.message || "Failed to load dashboard");
    }
  }, []);

  // If there's an error, show it instead of a black screen
  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500 mb-2">Dashboard Error</h1>
        <p className="text-gray-700 mb-4">{dashboardError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Show loading state instead of black screen
  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-3 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // Helper function to toggle expanded crop in suggestions
  const toggleCropDetails = (cropId) => {
    setExpandedCrop(expandedCrop === cropId ? null : cropId);
  };

  // Help & Support Modal Component
  const HelpSupportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Help & Support</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">How does AgriGuide help with crop selection?</h4>
                  <p className="text-gray-600">
                    CropMate analyzes your soil type, local climate data, and current market trends to recommend the most suitable crops for your farm that will maximize yield and profitability.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">How can I access government schemes for farmers?</h4>
                  <p className="text-gray-600">
                    Navigate to the Government Schemes section in your dashboard where you can browse all available schemes, check eligibility criteria, and find application instructions tailored to your farm profile.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">How does the weather forecast help my farming?</h4>
                  <p className="text-gray-600">
                    Our localized weather forecasts provide accurate predictions for your specific farm location, helping you plan irrigation, planting, and harvesting activities to optimize crop yield and minimize weather-related losses.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">How can I track my farm finances?</h4>
                  <p className="text-gray-600">
                    Use our Financial Resources section to record expenses, track income, manage loans, and analyze profitability. The system provides insights and reports to help you make informed financial decisions.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Is my farm data secure in AgriGuide?</h4>
                  <p className="text-gray-600">
                    Yes, we implement industry-standard security measures to protect your data. Your information is encrypted, stored securely, and never shared with third parties without your explicit consent.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Support</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-4">You can reach our support team at:</p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-green-600 mr-3" />
                    <a href="mailto:agriguidefarm@gmail.com" className="text-green-600 hover:underline">
                      agriguidefarm@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">+91 9876 543 210</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen bg-gray-100 transition-colors duration-300">
        <MobileHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          activeNav={activeNav}
          weather={weather}
          userData={userData}
          onShowHelp={() => setShowHelpModal(true)}
        />

        {/* Sidebar */}
        <div 
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-green-800 transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-center h-16 px-4 bg-green-900">
              <Calendar className="h-6 w-6 text-white" />
              <span className="ml-2 text-white font-bold text-xl">AgriGuide</span>
            </div>

            <div className="overflow-y-auto flex-grow">
              <nav className="px-2 py-4 space-y-1">
                <NavItem 
                  icon={<Home className="h-5 w-5" />} 
                  name="Dashboard" 
                  isActive={activeNav === 'Dashboard'} 
                  onClick={handleNavChange} 
                />
                
                <NavItem 
                  icon={<BrainCircuit className="h-5 w-5" />} 
                  name="Personalized Recommendations" 
                  isActive={activeNav === 'Personalized Recommendations'} 
                  onClick={handleNavChange} 
                />

                <NavItem 
                  icon={<Database className="h-5 w-5" />} 
                  name="Farm Resources" 
                  isActive={activeNav === 'Farm Resources'} 
                  onClick={handleNavChange} 
                />

                <NavItem 
                  icon={<DollarSign className="h-5 w-5" />} 
                  name="Financial Resources" 
                  isActive={activeNav === 'Financial Resources'} 
                  onClick={handleNavChange} 
                />

                <NavItem 
                  icon={<Cloud className="h-5 w-5" />} 
                  name="Weather" 
                  isActive={activeNav === 'Weather'} 
                  onClick={handleNavChange} 
                />

                <NavItem 
                  icon={<CreditCard className="h-5 w-5" />} 
                  name="Bank Loans" 
                  isActive={activeNav === 'Bank Loans'} 
                  onClick={handleNavChange} 
                />

                <NavItem 
                  icon={<FileText className="h-5 w-5" />} 
                  name="Government Schemes" 
                  isActive={activeNav === 'Government Schemes'} 
                  onClick={() => handleNavChange('Government Schemes')}
                />

                <NavItem 
                  icon={<User className="h-5 w-5" />} 
                  name="Profile" 
                  isActive={activeNav === 'Profile'} 
                  onClick={handleNavChange} 
                />
              </nav>
            </div>

            <div className="p-4 border-t border-green-700">
              <div className="flex items-center">
                {userData && userData.profile_image ? (
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={userData.profile_image}
                    alt="User profile" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {userData.first_name && userData.last_name 
                      ? `${userData.first_name} ${userData.last_name}`
                      : userData.username || 'Farm User'}
                  </p>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavChange('Profile');
                    }} 
                    className="text-xs text-green-300 hover:text-white"
                  >
                    View profile
                  </a>
                </div>
              </div>

              <button
                onClick={handleLogout}

                className="mt-4 w-full flex items-center px-3 py-2 text-sm text-white hover:bg-green-700 rounded-md transition-colors"

              >

                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />

                </svg>

                Logout

              </button>

            </div>

          </div>

        </div>



        {/* Main content */}

        <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">

          {/* Desktop header */}
          <header className="hidden lg:flex items-center justify-between p-4 bg-white shadow">
            <h1 className="text-2xl font-semibold text-gray-800">{activeNav}</h1>
            <div className="flex items-center space-x-4">
              {/* Search bar */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-gray-100 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white w-48 transition-all duration-200 hover:bg-gray-200"
                />
                <Search className="h-4 w-4 text-gray-500 absolute left-3 top-2.5" />
              </div>
              
              {/* Weather indicator */}
              <div className="flex items-center bg-blue-50 rounded-full py-1 px-3 text-sm">
                <Cloud className="h-4 w-4 text-blue-500 mr-1" />
                <span className="font-medium text-blue-700">
                  {weather ? `${Math.round(weather.temperature)}°C` : "Loading..."}
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </div>
              
              {/* Help */}
              <HelpCircle 
                className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" 
                onClick={() => setShowHelpModal(true)}
              />
              
              {/* Profile dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-300">
                    {userData && userData.profile_image ? (
                      <img src={userData.profile_image} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{userData?.username || 'User'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
                
                {/* Profile dropdown menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleNavChange('Profile');
                      }}
                    >
                      Your Profile
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main content area */}

          <main className="flex-1 overflow-y-auto p-4 bg-gray-100">

            {activeNav === 'Dashboard' && (

              <div className="space-y-6">

                {/* Weather widget - Only current weather */}

                <DashboardWeather />

                {/* Farm Resources Section */}
                <BasicResources />

                {/* Stats grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                  {stats.map((stat, index) => (

                    <StatCard 

                      key={index}

                      icon={stat.icon}

                      title={stat.title}

                      value={stat.value}

                      trend={stat.trend}

                    />

                  ))}

                </div>



                {/* Task Manager */}

                <TaskManager />



                {/* Enhanced Recent Crop Suggestions */}
                <div className="bg-white shadow rounded-lg p-5 transition-all duration-300 hover:shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Recent Crop Suggestions</h2>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={refreshRecommendations}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        title="Refresh crop suggestions"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Refresh
                      </button>
                      
                      {combinedSuggestions.length > 0 && (
                        <button
                          onClick={() => handleNavChange('Personalized Recommendations')}
                          className="text-sm text-green-600 hover:text-green-800 flex items-center"
                        >
                          View All <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>

                  {combinedSuggestions.length > 0 ? (
                    <div className="space-y-5">
                      {combinedSuggestions.slice(0, 3).map(crop => (
                        <div key={crop.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-900 text-lg">{crop.name}</h3>
                              
                              <div className="flex items-center space-x-2">
                                {crop.matchPercentage && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    crop.matchPercentage > 85 
                                      ? 'bg-green-100 text-green-800' 
                                      : crop.matchPercentage > 75 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {crop.matchPercentage}% Match
                                  </span>
                                )}
                                
                                <span className="text-sm bg-green-100 text-green-800 font-medium py-1 px-2 rounded">
                                  {crop.season || (crop.details && crop.details.season) || 'Unknown'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              {crop.soilTypes && (
                                <span className="bg-blue-50 text-blue-700 font-medium text-xs px-2 py-1 rounded-full">
                                  {Array.isArray(crop.soilTypes) 
                                    ? crop.soilTypes.join(', ') + ' soil'
                                    : crop.soilTypes + ' soil'}
                                </span>
                              )}
                              
                              {crop.waterRequirement && (
                                <span className="bg-blue-50 text-blue-700 font-medium text-xs px-2 py-1 rounded-full">
                                  {crop.waterRequirement} water need
                                </span>
                              )}
                              
                              {crop.suitability && (
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  crop.suitability === 'High' 
                                    ? 'bg-green-100 text-green-800' 
                                    : crop.suitability === 'Medium' 
                                      ? 'bg-yellow-50 text-yellow-800'
                                      : 'bg-red-50 text-red-800'
                                }`}>
                                  {crop.suitability} Suitability
                                </span>
                              )}
                            </div>
                            
                            {/* Key crop details */}
                            <div className="mt-3 text-sm">
                              {crop.notes ? (
                                <p className="line-clamp-2 text-gray-800 font-medium">{crop.notes}</p>
                              ) : (
                                <p className="line-clamp-2 text-gray-800 font-medium">
                                  {crop.details?.bestFor 
                                    ? `Best for ${crop.details.bestFor}.` 
                                    : `Good yield potential in optimal conditions.`}
                                  {crop.soilMatch && ' Matches your soil type.'}
                                  {crop.climateMatch && ' Suited for your local climate.'}
                                </p>
                              )}
                            </div>
                            
                            {/* Toggle details button */}
                            <button
                              onClick={() => toggleCropDetails(crop.id)}
                              className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-all"
                            >
                              {expandedCrop === crop.id ? 'Hide details' : 'Show details'}
                              <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${expandedCrop === crop.id ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Expanded details - Use enhanced crop details component */}
                            <EnhancedCropDetails crop={crop} isExpanded={expandedCrop === crop.id} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-3">No crop suggestions available yet.</p>
                      <button 
                        onClick={() => handleNavChange('Personalized Recommendations')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Get Personalized Recommendations
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            

            {activeNav === 'Government Schemes' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <GovernmentSchemes />
                </div>
              </div>
            )}

            {activeNav === 'Farm Resources' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <FarmResourceManagement />
                </div>
              </div>
            )}

            {activeNav === 'Financial Resources' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <FinancialResourceManagement />
                </div>
              </div>
            )}

            {/* {activeNav === 'Community' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <Community />
                </div>
              </div>
            )} */}

            {activeNav === 'Weather' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg rounded-xl p-4 w-full border border-blue-100">
                <div className="flex items-center justify-between mb-4 border-b border-blue-100 pb-3">
                  <h2 className="text-xl font-semibold text-blue-800">
                    Weather Forecast
                    <span className="ml-3 text-base bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {currentCity}
                    </span>
                  </h2>
                  <div className="text-sm text-blue-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Enhanced Weather Search */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          id="weatherCityInput"
                          placeholder="Search for a city..."
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const cityValue = e.target.value;
                              if (cityValue.trim()) {
                                // Update the city in the WeatherDashboard component
                                window.weatherCity = cityValue;
                                
                                // Update city state and context
                                setCurrentCity(cityValue);
                                setCity(cityValue);
                                
                                // Update WeatherDashboard component with the new city
                                if (window.updateWeatherCity) {
                                  window.updateWeatherCity(cityValue);
                                } else {
                                  // Create a new event to communicate with WeatherDashboard
                                  const event = new CustomEvent('weather-city-change', { 
                                    detail: { city: cityValue }
                                  });
                                  window.dispatchEvent(event);
                                }
                              }
                            }
                          }}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <button 
                        id="searchWeatherBtn"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        onClick={() => {
                          // Get the city from the input
                          const cityInput = document.getElementById('weatherCityInput');
                          const cityValue = cityInput.value.trim();
                          
                          if (cityValue) {
                            // Update the current city state and context
                            setCurrentCity(cityValue);
                            setCity(cityValue);
                            
                            // Update WeatherDashboard component with the new city
                            if (window.updateWeatherCity) {
                              window.updateWeatherCity(cityValue);
                            } else {
                              // Create a new event to communicate with WeatherDashboard
                              const event = new CustomEvent('weather-city-change', { 
                                detail: { city: cityValue }
                              });
                              window.dispatchEvent(event);
                            }
                            
                            // Also set window.weatherCity for the interval check
                            window.weatherCity = cityValue;
                          }
                        }}
                      >
                        <span>Search</span>
                      </button>
                    </div>
                    
                    {/* Popular cities suggestions */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Popular cities:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Karwar', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map((city) => (
                          <button 
                            key={city} 
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors"
                            onClick={() => {
                              // Set the city in the input field
                              const input = document.getElementById('weatherCityInput');
                              if (input) {
                                input.value = city;
                                
                                // Update current city state
                                setCurrentCity(city);
                                setCity(city);
                                
                                // Update WeatherDashboard component with the new city directly
                                if (window.updateWeatherCity) {
                                  window.updateWeatherCity(city);
                                } else {
                                  // Create a new event to communicate with WeatherDashboard
                                  const event = new CustomEvent('weather-city-change', { 
                                    detail: { city: city }
                                  });
                                  window.dispatchEvent(event);
                                }
                                
                                // Also set window.weatherCity for the interval check
                                window.weatherCity = city;
                              }
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast */}
                <div>
                  <WeatherDashboard ref={(ref) => {
                    // Store the updateCity function in the window object for access
                    if (ref && ref.updateCity) {
                      window.updateWeatherCity = ref.updateCity;
                      
                      // Initialize with Karwar city
                      if (!window.weatherCityInitialized) {
                        window.weatherCityInitialized = true;
                        window.weatherCity = 'Karwar';
                        setCurrentCity('Karwar');
                        setCity('Karwar');
                        ref.updateCity('Karwar');
                      }
                    }
                  }} />
                </div>
              </div>
            )}

            

            {activeNav === 'Analytics' && (

              <div className="space-y-6">

                {/* Summary Cards */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Total Yield</h3>

                    <p className="text-3xl font-bold text-green-600">2,450 kg</p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">+15% from last season</p>

                  </div>

                  

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Revenue</h3>

                    <p className="text-3xl font-bold text-green-600">₹1.2L</p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">+8% from last month</p>

                  </div>

                  

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Active Crops</h3>

                    <p className="text-3xl font-bold text-green-600">6</p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">Across 3 farms</p>

                  </div>

                </div>



                {/* Crop Performance Analytics */}

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">

                  <div className="flex items-center justify-between mb-6">

                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">Crop Performance Analytics</h2>

                    <div className="flex space-x-2">

                      <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">

                        <option>Last 30 days</option>

                        <option>Last 90 days</option>

                        <option>This season</option>

                        <option>Last year</option>

                      </select>

                      <button className="text-sm px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800">

                        Export Data

                      </button>

                    </div>

                  </div>



                  {/* Crop-wise Performance Table */}

                  <div className="overflow-x-auto">

                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

                      <thead className="bg-gray-50 dark:bg-gray-800">

                        <tr>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Crop Name

                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Growth Stage

                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Health Index

                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Expected Yield

                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Status

                          </th>

                        </tr>

                      </thead>

                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        {[

                          { name: 'Wheat', stage: 'Flowering', health: 92, yield: '800 kg', status: 'Healthy' },

                          { name: 'Rice', stage: 'Vegetative', health: 88, yield: '1200 kg', status: 'Good' },

                          { name: 'Corn', stage: 'Maturity', health: 75, yield: '450 kg', status: 'Average' },

                        ].map((crop, index) => (

                          <tr key={index}>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">

                              {crop.name}

                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">

                              {crop.stage}

                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">

                              <div className="flex items-center">

                                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">{crop.health}%</span>

                                <div className="w-24 bg-gray-200 rounded-full h-2">

                                  <div 

                                    className="bg-green-500 h-2 rounded-full" 

                                    style={{ width: `${crop.health}%` }}

                                  ></div>

                                </div>

                              </div>

                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">

                              {crop.yield}

                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">

                              <span className={`px-2 py-1 text-xs rounded-full ${

                                crop.status === 'Healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :

                                crop.status === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :

                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'

                              }`}>

                                {crop.status}

                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>



                {/* Resource Utilization */}

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">

                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Resource Utilization</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">

                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Water Usage</h3>

                      <div className="flex items-center justify-between">

                        <div className="flex items-center">

                          <Droplet className="h-5 w-5 text-blue-500 mr-2" />

                          <span className="text-lg font-bold text-gray-800 dark:text-white">75%</span>

                        </div>

                        <span className="text-sm text-green-600">-5%</span>

                      </div>

                      <p className="text-xs text-gray-500 mt-1">Compared to last month</p>

                    </div>



                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">

                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fertilizer Usage</h3>

                      <div className="flex items-center justify-between">

                        <div className="flex items-center">

                          <Leaf className="h-5 w-5 text-green-500 mr-2" />

                          <span className="text-lg font-bold text-gray-800 dark:text-white">82%</span>

                        </div>

                        <span className="text-sm text-red-600">+3%</span>

                      </div>

                      <p className="text-xs text-gray-500 mt-1">Compared to last month</p>

                    </div>



                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">

                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labor Efficiency</h3>

                      <div className="flex items-center justify-between">

                        <div className="flex items-center">

                          <User className="h-5 w-5 text-purple-500 mr-2" />

                          <span className="text-lg font-bold text-gray-800 dark:text-white">90%</span>

                        </div>

                        <span className="text-sm text-green-600">+8%</span>

                      </div>

                      <p className="text-xs text-gray-500 mt-1">Compared to last month</p>

                    </div>

                  </div>

                </div>

              </div>

            )}

            {activeNav === 'Profile' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  {/* Banner with pattern overlay */}
                  <div className="relative">
                    <div className="bg-gradient-to-r from-green-500 to-green-700 h-24">
                      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiPjxwYXRoIGQ9Ik0wIDBsMTAgMTBMMCAxMHoiPjwvcGF0aD48cGF0aCBkPSJNMCAxMGwxMCAxMEwwIDIweiI+PC9wYXRoPjxwYXRoIGQ9Ik0xMCAwbDEwIDEwTDEwIDEweiI+PC9wYXRoPjwvZz48L3N2Zz4=')]"></div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <ProfileComponent />
                  </div>
                </div>
              </div>
            )}

            {activeNav === 'Settings' && <SettingsComponent />}

            {activeNav === 'Bank Loans' && (
              <BankLoansSection />
            )}
            
            {activeNav === 'Government Schemes' && (
              <div className="space-y-6">
                <header className="bg-white dark:bg-gray-800 shadow">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Government Schemes</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browse and search for government schemes</p>
                      </div>
                    </div>
                  </div>
                </header>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <GovernmentSchemes />
                </div>
              </div>
            )}

                          {activeNav === 'Personalized Recommendations' || activeNav.startsWith('Personalized Recommendations-') ? (
                // Pass the current profile data to the PersonalizedRecommendations component
                // This ensures it has the most up-to-date data
                <PersonalizedRecommendations 
                  key={`pr-${Date.now()}`} // Force new instance on each render
                  farmerProfile={(() => {
                    // Try to get the latest profile data from localStorage
                    try {
                      const storedProfileData = localStorage.getItem('farmerProfileData');
                      if (storedProfileData) {
                        return JSON.parse(storedProfileData);
                      }
                    } catch (e) {
                      console.error("Error parsing stored profile data in Dashboard:", e);
                    }
                    // Return null if no profile data is found or parse error occurred
                    return null;
                  })()}
                />
              ) : null}

            

            {/* We're using the Government Schemes section that appears earlier in the file */}
          </main>

        </div>

      </div>

      {/* Help & Support Modal */}
      <HelpSupportModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default Dashboard;
