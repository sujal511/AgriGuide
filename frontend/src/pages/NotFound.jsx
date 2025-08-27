import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { Home } from 'lucide-react';

const NotFound = () => {
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="text-center">
        <h1 className={`text-6xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          404
        </h1>
        <h2 className={`mt-4 text-2xl font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Page Not Found
        </h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/dashboard"  // Redirects to the Dashboard page
          className={`mt-6 inline-flex items-center px-4 py-2 rounded-md ${
            darkMode 
              ? 'bg-green-700 hover:bg-green-800 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
