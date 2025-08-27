import React, { useState } from 'react';
import Layout from './Layout';
import { useDarkMode } from '../context/DarkModeContext';
import { Moon, Sun, Thermometer, CloudRain } from 'lucide-react';

const CropSuggestions = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  const [soilType, setSoilType] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [temperature, setTemperature] = useState('');
  const [rainfall, setRainfall] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ soilType, phLevel, temperature, rainfall });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
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
        
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Crop Suggestions
            </h1>
            
            <div className={`mt-8 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} shadow-md`}>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Find Suitable Crops
              </h2>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Soil Type
                  </label>
                  <select 
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option>Select Soil Type</option>
                    <option>Clay</option>
                    <option>Loam</option>
                    <option>Sandy</option>
                    <option>Silt</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    pH Level
                  </label>
                  <input 
                    type="text" 
                    value={phLevel}
                    onChange={(e) => setPhLevel(e.target.value)}
                    placeholder="e.g. 6.5" 
                    className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="relative">
                  <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Average Temperature (°C)
                  </label>
                  <Thermometer className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <input 
                    type="text" 
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g. 25" 
                    className={`w-full pl-10 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="relative">
                  <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Annual Rainfall (mm)
                  </label>
                  <CloudRain className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <input 
                    type="text" 
                    value={rainfall}
                    onChange={(e) => setRainfall(e.target.value)}
                    placeholder="e.g. 750" 
                    className={`w-full pl-10 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className={`mt-6 px-4 py-2 rounded-md text-white font-medium ${
                  darkMode 
                    ? 'bg-green-700 hover:bg-green-800' 
                    : 'bg-green-600 hover:bg-green-700'
                } transition-colors duration-200`}
              >
                Find Suitable Crops
              </button>
            </div>
          </div>
        </Layout>
      </div>
    </form>
  );
};

export default CropSuggestions; 