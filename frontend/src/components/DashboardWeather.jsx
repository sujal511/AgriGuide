import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Droplets, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { useCity } from '../context/CityContext';

const DashboardWeather = () => {
  const { city } = useCity();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const url = `/api/weather/?city=${city}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch weather data: ${response.status}`);
        }
        
        const data = await response.json();
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

  // Get appropriate weather icon
  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-12 w-12 text-gray-400" />;
    
    const desc = weather.description.toLowerCase();
    
    if (desc.includes('clear') || desc.includes('sunny')) {
      return <Sun className="h-12 w-12 text-gray-400" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="h-12 w-12 text-gray-400" />;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-12 w-12 text-gray-400" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="h-12 w-12 text-gray-400" />;
    } else if (desc.includes('thunder') || desc.includes('lightning')) {
      return <CloudLightning className="h-12 w-12 text-gray-400" />;
    } else {
      return <Cloud className="h-12 w-12 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-200 shadow-md rounded-lg overflow-hidden w-full">
        <div className="p-6 flex justify-center items-center" style={{ minHeight: "120px" }}>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blue-200 shadow-md rounded-lg overflow-hidden w-full">
        <div className="p-6">
          <div className="text-center text-gray-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-blue-200 shadow-md rounded-lg overflow-hidden w-full">
        <div className="p-6">
          <div className="text-center text-gray-600">
            No weather data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-200 shadow-md rounded-lg overflow-hidden w-full mb-6">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800 mr-2">
              Weather in {city}
            </h2>
            <span className="bg-blue-300 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
              Current Location
            </span>
          </div>
          <Cloud className="h-5 w-5 text-gray-600" />
        </div>

        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              {getWeatherIcon()}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {Math.round(weather.temperature)}°C
              </p>
              <p className="text-gray-600">
                {weather.description}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-center">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Droplets className="h-4 w-4 mr-1" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Wind className="h-4 w-4 mr-1" />
              <span>Wind: {weather.wind_speed} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWeather; 