import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardHome from './DashboardHome';
import FarmerProfile from './profile/FarmerProfile';
import CropRecommendations from './recommendations/CropRecommendations';
import GovernmentSchemes from './recommendations/GovernmentSchemes';
import LoanOptions from './recommendations/LoanOptions';
import Technology from './recommendations/Technology';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [farmerId, setFarmerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user profile data with token:', authToken?.substring(0, 10) + '...');
        const response = await axios.get('/api/user-profile/', {
          headers: {
            Authorization: `Token ${authToken}`
          }
        });
        
        console.log('User profile data received:', response.data);
        setUser(response.data);
        
        // Set farmerId from the response
        if (response.data.farmer_profile && response.data.farmer_profile.id) {
          const id = response.data.farmer_profile.id;
          console.log("Farmer ID set:", id);
          setFarmerId(id);
          // Store farmerId in localStorage for persistence
          localStorage.setItem('farmerId', id);
        } else {
          console.warn("No farmer profile ID found in user data");
          // Try to get farmerId from localStorage as fallback
          const storedFarmerId = localStorage.getItem('farmerId');
          if (storedFarmerId) {
            console.log("Using stored farmer ID:", storedFarmerId);
            setFarmerId(storedFarmerId);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile');
        
        // Try to get farmerId from localStorage as fallback
        const storedFarmerId = localStorage.getItem('farmerId');
        if (storedFarmerId) {
          console.log("Using stored farmer ID after error:", storedFarmerId);
          setFarmerId(storedFarmerId);
        }
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [authToken]);

  const renderContent = () => {
    console.log("Rendering content with farmerId:", farmerId);
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      );
    }
    
    switch(activeTab) {
      case 'dashboard':
        return <DashboardHome user={user} farmerId={farmerId} />;
      case 'profile':
        return <FarmerProfile user={user} farmerId={farmerId} />;
      case 'crops':
        return <CropRecommendations farmerId={farmerId} />;
      case 'schemes':
        return <GovernmentSchemes farmerId={farmerId} />;
      case 'loans':
        return <LoanOptions farmerId={farmerId} />;
      case 'technology':
        return <Technology farmerId={farmerId} />;
      default:
        return <DashboardHome user={user} farmerId={farmerId} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-white w-64 shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-green-600">CropMate</h2>
          <p className="text-sm text-gray-600">Farming Assistant</p>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left p-3 flex items-center ${activeTab === 'dashboard' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left p-3 flex items-center ${activeTab === 'profile' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                My Profile
              </button>
            </li>
            <li className="border-t mt-2 pt-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Recommendations</p>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('crops')}
                className={`w-full text-left p-3 flex items-center ${activeTab === 'crops' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 7a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h10z" />
                  <path d="M5 3a2 2 0 00-2 2v1h14V5a2 2 0 00-2-2H5z" />
                </svg>
                Crop Recommendations
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('schemes')}
                className={`w-full text-left p-3 flex items-center ${activeTab === 'schemes' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-2.95-4.419 2.95A1 1 0 014 16V4z" clipRule="evenodd" />
                </svg>
                Government Schemes
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('loans')}
                className={`w-full text-left p-3 flex items-center ${activeTab === 'loans' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Loan Options
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('technology')}
                className={`w-full text-left p-3 flex items-center ${activeTab === 'technology' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
                  <path d="M9 6h6v2H9V6z" />
                  <path d="M9 10h6v2H9v-2z" />
                  <path d="M5 6h2v2H5V6z" />
                  <path d="M5 10h2v2H5v-2z" />
                </svg>
                Agricultural Technology
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'crops' && 'Crop Recommendations'}
              {activeTab === 'schemes' && 'Government Schemes'}
              {activeTab === 'loans' && 'Loan Options'}
              {activeTab === 'technology' && 'Agricultural Technology'}
            </h1>
            <div className="flex items-center">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user?.name || 'Farmer'}</span>
                  {farmerId && <span className="text-xs text-gray-400 ml-2">(ID: {farmerId})</span>}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 h-8 w-64 rounded"></div>
              <div className="bg-gray-200 h-32 rounded"></div>
              <div className="bg-gray-200 h-16 rounded"></div>
              <div className="bg-gray-200 h-16 rounded"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 