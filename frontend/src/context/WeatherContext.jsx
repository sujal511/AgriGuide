import React, { createContext, useState, useContext, useEffect } from 'react';
import { useCity } from './CityContext';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
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

  return (
    <WeatherContext.Provider value={{ weather, loading, error }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext); 