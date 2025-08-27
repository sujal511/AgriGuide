import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { Moon, Sun, TreeDeciduous } from 'lucide-react';

const AuthLayout = ({ children, title }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    } transition-colors duration-300`}>
      {/* Simple header with logo and dark mode toggle */}
      <header className={`${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        } border-b px-4 py-4 flex justify-between items-center`}>
        <Link to="/" className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-bold text-xl flex items-center`}>
          <TreeDeciduous className="h-6 w-6 mr-2" />
          AgriGuide
        </Link>
        
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
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className={`max-w-md w-full ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-8 transition-colors duration-300`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h2>
          
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout; 