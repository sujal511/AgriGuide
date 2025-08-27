import React from 'react';

/**
 * Enhanced crop details component that checks for crop data in multiple places
 * and logs available data to help debug what information is present
 */
const CropDetails = ({ crop, isExpanded }) => {
  // Log crop data on mount to see what's available
  React.useEffect(() => {
    if (isExpanded && crop) {
      console.log("Full crop data:", crop);
      if (crop.details) {
        console.log("Crop details object:", crop.details);
      }
    }
  }, [crop, isExpanded]);

  // Helper functions to check data in multiple places
  const getTemperatureData = () => {
    // Check different properties where temperature might be stored
    if (crop.minTemp && crop.maxTemp) {
      return `${crop.minTemp}-${crop.maxTemp}°C`;
    } else if (crop.details?.temperatureRange) {
      return crop.details.temperatureRange;
    } else if (crop.details?.temperature) {
      return crop.details.temperature;
    } else if (crop.temperature) {
      return crop.temperature;
    } else if (crop.details?.min_temp && crop.details?.max_temp) {
      return `${crop.details.min_temp}-${crop.details.max_temp}°C`;
    } else {
      // Log what properties we actually have
      console.log("Missing temperature data. Available props:", crop);
      return null;
    }
  };

  const getPhData = () => {
    if (crop.minPh && crop.maxPh) {
      return `${crop.minPh}-${crop.maxPh}`;
    } else if (crop.details?.phRange) {
      return crop.details.phRange;
    } else if (crop.details?.soil_ph) {
      return crop.details.soil_ph;
    } else if (crop.ph) {
      return crop.ph;
    } else if (crop.details?.min_ph && crop.details?.max_ph) {
      return `${crop.details.min_ph}-${crop.details.max_ph}`;
    } else {
      console.log("Missing pH data. Available props:", crop);
      return null;
    }
  };

  const getRainfallData = () => {
    if (crop.minRainfall && crop.maxRainfall) {
      return `${crop.minRainfall}-${crop.maxRainfall} mm`;
    } else if (crop.details?.rainfallRange) {
      return crop.details.rainfallRange;
    } else if (crop.rainfall) {
      return `${crop.rainfall} mm`;
    } else if (crop.details?.rainfall) {
      return `${crop.details.rainfall} mm`;
    } else if (crop.details?.rainfall_min && crop.details?.rainfall_max) {
      return `${crop.details.rainfall_min}-${crop.details.rainfall_max} mm`;
    } else {
      console.log("Missing rainfall data. Available props:", crop);
      return null;
    }
  };

  const getGrowthPeriod = () => {
    if (crop.growthDays) {
      return `${crop.growthDays} days`;
    } else if (crop.details?.growthPeriod) {
      return crop.details.growthPeriod;
    } else if (crop.details?.growth_days) {
      return `${crop.details.growth_days} days`;
    } else if (crop.growth_days) {
      return `${crop.growth_days} days`;
    } else {
      console.log("Missing growth period data. Available props:", crop);
      return null;
    }
  };

  const getFertilizerData = () => {
    if (typeof crop.fertilizer === 'string') {
      return crop.fertilizer;
    } else if (typeof crop.fertilizer === 'object' && crop.fertilizer !== null) {
      return `NPK ${crop.fertilizer.n_kg_per_ha || 0}-${crop.fertilizer.p_kg_per_ha || 0}-${crop.fertilizer.k_kg_per_ha || 0}`;
    } else if (crop.details?.fertilizer) {
      return crop.details.fertilizer;
    } else {
      console.log("Missing fertilizer data. Available props:", crop);
      return null;
    }
  };

  // Check which data is actually available
  const temperatureData = getTemperatureData();
  const phData = getPhData();
  const rainfallData = getRainfallData();
  const growthPeriod = getGrowthPeriod();
  const fertilizerData = getFertilizerData();

  if (!isExpanded) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 p-3 rounded shadow-sm">
          <p className="text-xs text-gray-600 font-semibold mb-1">Growth Period</p>
          <p className="font-medium text-gray-900">
            {growthPeriod ? growthPeriod : <span className="text-amber-600 font-semibold">Not specified</span>}
          </p>
        </div>
        <div className="bg-gray-100 p-3 rounded shadow-sm">
          <p className="text-xs text-gray-600 font-semibold mb-1">Temperature</p>
          <p className="font-medium text-gray-900">
            {temperatureData ? temperatureData : <span className="text-amber-600 font-semibold">Not specified</span>}
          </p>
        </div>
        <div className="bg-gray-100 p-3 rounded shadow-sm">
          <p className="text-xs text-gray-600 font-semibold mb-1">pH Range</p>
          <p className="font-medium text-gray-900">
            {phData ? phData : <span className="text-amber-600 font-semibold">Not specified</span>}
          </p>
        </div>
        <div className="bg-gray-100 p-3 rounded shadow-sm">
          <p className="text-xs text-gray-600 font-semibold mb-1">Rainfall</p>
          <p className="font-medium text-gray-900">
            {rainfallData ? rainfallData : <span className="text-amber-600 font-semibold">Not specified</span>}
          </p>
        </div>
      </div>
      
      {/* Fertilizer recommendation if available */}
      {fertilizerData && (
        <div className="mt-3 bg-green-100 p-3 rounded shadow-sm border border-green-200">
          <p className="text-xs text-green-800 font-semibold mb-1">Recommended Fertilizer</p>
          <p className="text-sm font-medium text-gray-900">{fertilizerData}</p>
        </div>
      )}
    </div>
  );
};

export default CropDetails; 