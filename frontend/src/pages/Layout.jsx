import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { Moon, Sun, TreeDeciduous, Bell, User, Layers } from 'lucide-react';

const Layout = ({ children }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';
  
  // Don't render the header on the landing page as it has its own
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-white text-gray-900'
    } transition-colors duration-300`}>
      {/* Header */}
      <header className={`${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        } border-b px-4 py-4 sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-bold text-xl flex items-center`}>
              <TreeDeciduous className="h-6 w-6 mr-2" />
              AgriGuide
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/dashboard'
                    ? darkMode 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-green-600 border-b-2 border-green-600'
                    : darkMode 
                      ? 'text-gray-300 hover:text-green-400' 
                      : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/crop-suggestions" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/crop-suggestions'
                    ? darkMode 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-green-600 border-b-2 border-green-600'
                    : darkMode 
                      ? 'text-gray-300 hover:text-green-400' 
                      : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Crop Suggestions
              </Link>
              <Link 
                to="/weather" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/weather'
                    ? darkMode 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-green-600 border-b-2 border-green-600'
                    : darkMode 
                      ? 'text-gray-300 hover:text-green-400' 
                      : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Weather
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className={`p-1 rounded-full ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-400 hover:text-gray-500'} focus:outline-none relative`}>
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } focus:outline-none transition-colors duration-300`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="relative">
              <button className={`flex items-center ${
                darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'
              }`}>
                <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default Layout; 