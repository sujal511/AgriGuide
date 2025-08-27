import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import { useCity } from '../context/CityContext';

const WeatherWidget = () => {
  const { darkMode } = useDarkMode();
  const { city } = useCity();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        console.log('Fetching current weather for:', city);
        
        const url = `/api/weather/?city=${city}`;
        console.log('Fetch URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeather(data);
        setError(null);
      } catch (err) {
        console.error('Weather error details:', err);
        setError('Could not load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [city]);

  // Get weather icon based on description
  const getWeatherIcon = (description) => {
    const desc = description ? description.toLowerCase() : '';
    
    if (desc.includes('clear') || desc.includes('sunny')) {
      return <Sun className="h-10 w-10 text-yellow-400" />;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-10 w-10 text-blue-400" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="h-10 w-10 text-blue-200" />;
    } else if (desc.includes('thunder') || desc.includes('lightning')) {
      return <CloudLightning className="h-10 w-10 text-purple-500" />;
    } else if (desc.includes('wind') || desc.includes('gust')) {
      return <Wind className="h-10 w-10 text-gray-400" />;
    } else {
      return <Cloud className="h-10 w-10 text-gray-400" />;
    }
  };

  // Determine background gradient based on temperature
  const getBgGradient = () => {
    if (!weather) return darkMode ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-gray-100';
    
    const temp = Math.round(weather.temperature);
    
    if (darkMode) {
      // Dark mode gradients
      if (temp >= 30) {
        return 'from-red-900 to-orange-900'; // Hot
      } else if (temp >= 22) {
        return 'from-orange-900 to-yellow-900'; // Warm
      } else if (temp >= 15) {
        return 'from-green-900 to-emerald-900'; // Mild
      } else if (temp >= 5) {
        return 'from-blue-900 to-indigo-900'; // Cool
      } else {
        return 'from-indigo-900 to-violet-900'; // Cold
      }
    } else {
      // Light mode gradients
      if (temp >= 30) {
        return 'from-red-500 to-orange-500'; // Hot
      } else if (temp >= 22) {
        return 'from-orange-400 to-yellow-400'; // Warm
      } else if (temp >= 15) {
        return 'from-green-500 to-emerald-500'; // Mild
      } else if (temp >= 5) {
        return 'from-blue-400 to-indigo-500'; // Cool
      } else {
        return 'from-indigo-600 to-violet-600'; // Cold
      }
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 bg-gradient-to-r ${getBgGradient()}`}>
      <div className="p-4 backdrop-blur-sm bg-white bg-opacity-10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Weather</h3>
          {!loading && !error && weather && (
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs text-white">
              {weather.city || city}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-white text-opacity-80">
            {error}
          </div>
        ) : weather ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-white">
                  {Math.round(weather.temperature)}°C
                </h4>
                <p className="text-sm text-white text-opacity-80 capitalize">
                  {weather.description}
                </p>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-10 rounded-full">
                  {getWeatherIcon(weather.description)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm">
                <div className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-white text-opacity-80" />
                  <span className="text-sm font-medium text-white text-opacity-80">Humidity</span>
                </div>
                <p className="text-xl font-bold mt-1 text-white">
                  {weather.humidity}%
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm">
                <div className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-white text-opacity-80" />
                  <span className="text-sm font-medium text-white text-opacity-80">Wind</span>
                </div>
                <p className="text-xl font-bold mt-1 text-white">
                  {weather.wind_speed} m/s
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white border-opacity-20 flex justify-end">
              <p className="text-xs text-white text-opacity-60">
                Updated: {new Date(weather.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white text-opacity-80">
            No weather data available
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;