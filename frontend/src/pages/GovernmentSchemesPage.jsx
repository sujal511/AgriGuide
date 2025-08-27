import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GovernmentSchemes from '../components/GovernmentSchemes';
import { FileText, ArrowLeft } from 'lucide-react';

const GovernmentSchemesPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/dashboard'); // Navigate back to dashboard
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={handleBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Government Schemes</h1>
                <p className="text-sm text-gray-500">Browse and search for government schemes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <FileText className="h-4 w-4 mr-1" />
                Schemes
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-160px)]">
          <GovernmentSchemes />
        </div>
      </main>
    </div>
  );
};

export default GovernmentSchemesPage; 