import React from 'react';
import { X, Menu, Sun, Moon, Bell } from 'lucide-react';

const MobileHeader = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  toggleDarkMode, 
  notifications, 
  activeNav 
}) => {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow fixed top-0 left-0 right-0 z-20">
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{activeNav}</h1>
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
