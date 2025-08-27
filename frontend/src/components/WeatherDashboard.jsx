/**
 * WeatherDashboard Component
 * 
 * This component displays a 5-day weather forecast using the OpenWeatherMap API.
 * It fetches data from our backend endpoint that provides forecast information
 * and displays it in a responsive grid layout.
 * 
 * Features:
 * - Shows 5-day weather forecast
 * - Displays temperature, weather condition, humidity, wind speed
 * - Allows changing the location via parent component
 * - Responsive layout (1 column on mobile, 5 columns on desktop)
 * - Dark mode support
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets, Clock } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherDashboard = forwardRef((props, ref) => {
  const [city, setCity] = useState('Karwar'); // Default city
  const [forecast, setForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expose updateCity method to parent via ref
  useImperativeHandle(ref, () => ({
    updateCity: (newCity) => {
      console.log('Updating city to:', newCity);
      setCity(newCity);
    }
  }));

  // Listen for custom event
  useEffect(() => {
    const handleCityChange = (e) => {
      const newCity = e.detail.city;
      console.log('Custom event received:', newCity);
      setCity(newCity);
    };

    window.addEventListener('weather-city-change', handleCityChange);
    
    return () => {
      window.removeEventListener('weather-city-change', handleCityChange);
    };
  }, []);

  // Direct access from window object
  useEffect(() => {
    const checkWindowCity = () => {
      if (window.weatherCity && window.weatherCity !== city) {
        console.log('Window city changed:', window.weatherCity);
        setCity(window.weatherCity);
      }
    };

    const intervalId = setInterval(checkWindowCity, 500);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [city]);

  // Fetch current weather data
  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const cityToFetch = city || 'Karwar';
        console.log('Fetching current weather for:', cityToFetch);
        
        const url = `/api/weather/?city=${cityToFetch}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch current weather: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Current weather data received:', data);
        setCurrentWeather(data);
      } catch (err) {
        console.error('Current weather error:', err);
        // Don't set main error here, just log it
      }
    };
    
    fetchCurrentWeather();
    // Refresh current weather data every 30 minutes
    const intervalId = setInterval(fetchCurrentWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [city]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        // Use current city or default to India if empty
        const cityToFetch = city || 'Karwar';
        console.log('Fetching weather forecast for:', cityToFetch);
        
        // Set the full URL including the development server
        const url = `/api/weather/forecast/?city=${cityToFetch}`;
        console.log('Fetch URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch weather forecast data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Forecast data received:', data);
        setForecast(data);
        
        // Extract hourly forecast from the forecast data
        if (data && data.hourly) {
          // Use the hourly forecast data directly from the API
          setHourlyForecast(data.hourly);
        } else if (data && data.forecasts) {
          // Fallback to using daily forecasts if hourly not available
          setHourlyForecast(data.forecasts);
        }
        
        setError(null);
      } catch (err) {
        console.error('Weather forecast error details:', err);
        setError('Could not load weather forecast data');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
    // Refresh weather data every hour
    const intervalId = setInterval(fetchForecast, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [city]);

  // Get weather icon based on description
  const getWeatherIcon = (description) => {
    const desc = description ? description.toLowerCase() : '';
    
    if (desc.includes('clear') || desc.includes('sunny')) {
      return <Sun className="h-8 w-8 text-yellow-400" />;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-8 w-8 text-blue-400" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="h-8 w-8 text-blue-200" />;
    } else if (desc.includes('thunder') || desc.includes('lightning')) {
      return <CloudLightning className="h-8 w-8 text-purple-500" />;
    } else if (desc.includes('wind') || desc.includes('gust')) {
      return <Wind className="h-8 w-8 text-gray-400" />;
    } else {
      return <Cloud className="h-8 w-8 text-gray-400" />;
    }
  };

  // Format date to display day name
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };
  
  // Format time for hourly forecast
  const formatTime = (date) => {
    if (!date) return '';
    
    if (typeof date === 'string') {
      // Check if the string has time component
      if (date.includes(' ')) {
        // Extract time part from the timestamp string (format: "YYYY-MM-DD HH:MM:SS")
        const timePart = date.split(' ')[1];
        const [hours, minutes] = timePart.split(':');
        
        // Create date with the extracted time
        const timeDate = new Date();
        timeDate.setHours(parseInt(hours, 10));
        timeDate.setMinutes(parseInt(minutes, 10));
        
        return new Intl.DateTimeFormat('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }).format(timeDate);
      } else {
        // If it's just a date without time, create a date object
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return new Intl.DateTimeFormat('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }).format(dateObj);
        }
        return '12:00 PM'; // Fallback
      }
    }
    
    // If it's already a Date object
    if (date instanceof Date) {
      return new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).format(date);
    }
    
    return '12:00 PM'; // Fallback for any other case
  };

  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="p-4 bg-gradient-to-r from-green-600 to-blue-500 text-white border-b border-blue-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Weather Forecast 
            <span className="ml-2 text-base bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
              {city}
            </span>
          </h3>
        </div>
      </div>
      
      <div className="p-5">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-8 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-gray-600">Loading forecast for {city}...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Could not load weather data for {city}</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : forecast ? (
          <div className="space-y-8">
            {/* Current Weather Section */}
            {currentWeather && (
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 shadow-md text-white">
                <h4 className="text-xl font-semibold mb-5">
                  Current Weather
                </h4>
                
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-5 md:mb-0">
                    <div className="mr-6 bg-white bg-opacity-20 p-3 rounded-full">
                      {getWeatherIcon(currentWeather.description)}
                    </div>
                    <div>
                      <div className="text-4xl font-bold">
                        {Math.round(currentWeather.temperature)}°C
                      </div>
                      <div className="text-sm text-white text-opacity-80 capitalize mt-1">
                        {currentWeather.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-8">
                    <div className="flex flex-col items-center bg-white bg-opacity-10 p-3 rounded-lg">
                      <span className="text-sm text-white text-opacity-80 mb-1">Humidity</span>
                      <span className="text-lg font-medium">{currentWeather.humidity}%</span>
                    </div>
                    <div className="flex flex-col items-center bg-white bg-opacity-10 p-3 rounded-lg">
                      <span className="text-sm text-white text-opacity-80 mb-1">Wind</span>
                      <span className="text-lg font-medium">{currentWeather.wind_speed} m/s</span>
                    </div>
                    <div className="flex flex-col items-center bg-white bg-opacity-10 p-3 rounded-lg">
                      <span className="text-sm text-white text-opacity-80 mb-1">Updated</span>
                      <span className="text-lg font-medium">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Temperature Chart - Last 24 hours */}
                {hourlyForecast && hourlyForecast.length > 0 && (
                  <div className="mt-8 bg-white bg-opacity-10 p-4 rounded-lg">
                    <h5 className="text-white mb-3">Temperature Trend</h5>
                    <div className="h-64">
                      <Line
                        data={{
                          labels: hourlyForecast.slice(0, 8).map(item => formatTime(item.timestamp)),
                          datasets: [
                            {
                              label: 'Temperature (°C)',
                              data: hourlyForecast.slice(0, 8).map(item => item.temperature),
                              borderColor: 'rgba(255, 255, 255, 0.8)',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              tension: 0.4,
                              fill: true,
                              pointBackgroundColor: 'white',
                              pointRadius: 4,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              min: 26.5,
                              max: 28.5,
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                              },
                              ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                              }
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              titleColor: '#3B82F6',
                              bodyColor: '#1F2937',
                              borderColor: '#E5E7EB',
                              borderWidth: 1,
                              displayColors: false,
                              padding: 10
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Today's Forecast with improved visuals */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Today's Forecast</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {hourlyForecast.slice(0, 8).map((hourData, index) => (
                  <div 
                    key={index}
                    className={`rounded-lg p-3 text-center ${
                      new Date().getHours() === new Date(hourData.timestamp).getHours() 
                        ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white'
                        : 'bg-blue-50 text-gray-800 hover:bg-blue-100'
                    } transition-all duration-300`}
                  >
                    <div className="text-sm font-medium mb-2">
                      {formatTime(hourData.timestamp)}
                    </div>
                    
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(hourData.description)}
                    </div>
                    
                    <div className={`text-xl font-bold ${new Date().getHours() === new Date(hourData.timestamp).getHours() ? 'text-white' : 'text-gray-800'}`}>
                      {Math.round(hourData.temperature)}°C
                    </div>
                    
                    <div className="text-xs mt-2 flex items-center justify-center">
                      <Droplets className="h-3 w-3 mr-1" />
                      <span>{hourData.humidity}%</span>
                    </div>
                    
                    <div className="text-xs mt-1 flex items-center justify-center">
                      <Wind className="h-3 w-3 mr-1" />
                      <span>{hourData.wind_speed} m/s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 5-Day Forecast with Bar Chart */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">5-Day Forecast</h4>
              
              {/* Precipitation Chart */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                <h5 className="text-gray-700 mb-3">Precipitation Forecast</h5>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: forecast.forecasts.map(day => formatDate(day.date)),
                      datasets: [
                        {
                          label: 'Precipitation Probability (%)',
                          data: forecast.forecasts.map(day => day.humidity), // Using humidity as a proxy for precipitation
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                          borderRadius: 5
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Daily Forecast Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {forecast.forecasts.map((day, index) => (
                  <div 
                    key={index}
                    className="rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3">
                      <div className="font-medium">{formatDate(day.date)}</div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-b from-white to-blue-50">
                      <div className="flex justify-center mb-4">
                        {getWeatherIcon(day.description)}
                      </div>
                      
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold text-gray-800">
                          {Math.round(day.temperature)}°C
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {day.description}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600">
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                          <span>{day.humidity}%</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Wind className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{day.wind_speed} m/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No forecast data available for {city}
          </div>
        )}
      </div>
    </div>
  );
});

export default WeatherDashboard;