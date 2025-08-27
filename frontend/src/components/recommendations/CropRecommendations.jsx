import React, { useState, useEffect } from 'react';
import { getCropRecommendations } from '../../services/api';
import { FaChevronDown, FaChevronUp, FaSeedling, FaLeaf } from 'react-icons/fa';
import axios from 'axios';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const CropRecommendations = ({ farmerId, onRecommendationsUpdate }) => {
  const [cropData, setCropData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCrop, setExpandedCrop] = useState(null);

  // Debug logging
  console.log('CropRecommendations component rendering with farmerId:', farmerId);

  // Fetch crop recommendations when component mounts or farmerId changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!farmerId) {
        console.warn('No farmer ID provided to CropRecommendations component');
        setError('No farmer profile available. Please complete your profile to get recommendations.');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching crop recommendations for farmer ID: ${farmerId}`);
        // Use direct axios call to backend
        const response = await axios.post('/api/crop-recommendations/', { farmer_id: farmerId });
        console.log('Crop recommendations response:', response.data);
        
        if (response.data.success) {
          // Debug the fertilizer data
          console.log('Crop recommendations with fertilizer data:', response.data.recommendations);
          if (response.data.recommendations && response.data.recommendations.length > 0) {
            console.log('First crop fertilizer data:', response.data.recommendations[0].fertilizer);
          }
          
          const recommendations = response.data.recommendations || [];
          setCropData(recommendations);
          
          // Clear any existing recommendations in localStorage before storing new ones
          localStorage.removeItem('personalizedCropRecommendations');

          // Add a timestamp to the stored recommendations data
          const recommendationsWithTimestamp = {
            timestamp: Date.now(),
            data: recommendations
          };
          
          // Pass recommendations to parent component if callback is provided
          if (onRecommendationsUpdate && typeof onRecommendationsUpdate === 'function') {
            onRecommendationsUpdate(recommendations);
          }
          
          // Always store in localStorage for dashboard access
          localStorage.setItem('personalizedCropRecommendations', JSON.stringify(recommendationsWithTimestamp));
          console.log('Stored new recommendations in localStorage with timestamp');
        } else {
          setError(response.data.message || 'Failed to fetch recommendations');
        }
      } catch (error) {
        console.error('Error fetching crop recommendations:', error);
        setError('Error fetching recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch fresh recommendations when this component mounts
    fetchRecommendations();
  }, [farmerId, onRecommendationsUpdate]);

  const toggleCropDetails = (cropId) => {
    if (expandedCrop === cropId) {
      setExpandedCrop(null);
    } else {
      setExpandedCrop(cropId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-800">Crop Recommendations</h2>
        
      </div>

      {/* Loading state */}
      {loading && (
        <LoadingSkeleton count={3} height="150px" />
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && cropData.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Recommendations Available</h3>
          <p className="text-gray-600">Complete your farm profile to get personalized crop recommendations.</p>
        </div>
      )}

      {/* Crop cards */}
      <div className="space-y-6">
        {!loading && cropData.map((crop) => (
          <div key={crop.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                  crop.matchPercentage > 85 
                    ? 'bg-green-100 text-green-800' 
                    : crop.matchPercentage > 75 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {crop.matchPercentage}% Match
                </div>
              </div>
              
              {/* Key summary - always visible */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`${
                  crop.suitability === 'High' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : crop.suitability === 'Medium' 
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                } text-sm px-3 py-1 rounded-full font-medium`}>
                  {crop.suitability} Suitability
                </span>
                {crop.soilMatch && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1 rounded-full font-medium">
                    Soil Match
                  </span>
                )}
                {crop.details?.season && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-100 text-sm px-3 py-1 rounded-full font-medium">
                    {crop.details.season}
                  </span>
                )}
              </div>
              
              {/* Why This Matters For You - always visible */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">Why This Matters For You:</h4>
                <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                  {crop.soilMatch && <li>Matches your soil type</li>}
                  {crop.npkMatch && <li>Optimal for your soil nutrients</li>}
                  {crop.climateMatch && <li>Suited for your local climate</li>}
                  <li>{crop.details?.bestFor ? `Best for ${crop.details.bestFor} soil` : 'Good yield potential'}</li>
                </ul>
              </div>
              
              {/* Click for details button */}
              <button 
                onClick={() => toggleCropDetails(crop.id)} 
                className="flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Click for details {expandedCrop === crop.id ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
              </button>
              
              {/* Expandable details section */}
              {expandedCrop === crop.id && crop.details && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Season:</h4>
                      <p className="text-sm font-medium text-gray-800">{crop.details?.season || crop.growing_season || 'Rabi (Winter)'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Water Requirement:</h4>
                      <p className="text-sm font-medium text-gray-800">{crop.details?.waterRequirement || `${crop.water_requirement || '450-650'}mm`}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Growth Period:</h4>
                      <p className="text-sm font-medium text-gray-800">{crop.details?.growthPeriod || '90-130 days'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Temperature Range:</h4>
                      <p className="text-sm font-medium text-gray-800">{crop.details?.temperatureRange || `${crop.min_temp || '15'}-${crop.max_temp || '35'}°C`}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Rainfall Range:</h4>
                      <p className="text-sm font-medium text-gray-800">{crop.details?.rainfallRange || `${crop.rainfall_min || '450'}-${crop.rainfall_max || '650'}mm`}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Drought Resistance:</h4>
                      <p className="text-sm font-medium text-gray-800">{crop.details?.droughtResistance || crop.drought_resistance || 'Medium'}</p>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold mt-6 mb-3 text-gray-700 uppercase">Market Price</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-green-50 p-3 rounded-md shadow-sm border border-green-100">
                      <p className="text-sm font-medium text-gray-800">
                        {typeof crop.details?.marketPrice === 'string' 
                          ? crop.details.marketPrice 
                          : Array.isArray(crop.details?.marketPrice) 
                            ? crop.details.marketPrice[0] 
                            : '₹20-30/kg'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white p-4 rounded-md shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Varieties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {crop.recommended_varieties && crop.recommended_varieties.length > 0 ? (
                        crop.recommended_varieties.map((variety, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">{variety}</span>
                        ))
                      ) : crop.details?.recommendedVarieties && crop.details.recommendedVarieties.length > 0 ? (
                        crop.details.recommendedVarieties.map((variety, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">{variety}</span>
                        ))
                      ) : (
                        <>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">HD-2967</span>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">PBW-343</span>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">K-307</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detailed Soil Analysis Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 uppercase">Detailed Soil Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">pH Range:</h4>
                        <p className="text-sm font-medium text-gray-800">{crop.details?.phRange || '6.0-7.0'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Compatible Soil Types:</h4>
                        <p className="text-sm font-medium text-gray-800">
                          {crop.details?.suitableSoilTypes || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 uppercase">Irrigation Requirements:</h4>
                    <div className="overflow-x-auto bg-white rounded-md shadow-sm">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-4 py-3 text-left font-bold text-gray-800">Growth Stage</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-800">Water (mm)</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-800">Interval (days)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crop.details?.irrigation && crop.details.irrigation.length > 0 ? (
                            crop.details.irrigation.map((irr, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 font-semibold text-gray-800">{irr.growth_stage}</td>
                                <td className="px-4 py-3 text-gray-700">{irr.water_requirement_mm}</td>
                                <td className="px-4 py-3 text-gray-700">{irr.irrigation_interval_days}</td>
                              </tr>
                            ))
                          ) : (
                            <>
                              <tr className="bg-white">
                                <td className="px-4 py-3 font-semibold text-gray-800">Seedling stage</td>
                                <td className="px-4 py-3 text-gray-700">40-50</td>
                                <td className="px-4 py-3 text-gray-700">7-10</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">Tillering stage</td>
                                <td className="px-4 py-3 text-gray-700">50-60</td>
                                <td className="px-4 py-3 text-gray-700">10-15</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-4 py-3 font-semibold text-gray-800">Heading stage</td>
                                <td className="px-4 py-3 text-gray-700">60-70</td>
                                <td className="px-4 py-3 text-gray-700">12-15</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">Flowering stage</td>
                                <td className="px-4 py-3 text-gray-700">70-80</td>
                                <td className="px-4 py-3 text-gray-700">8-12</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Fertilizer Recommendation Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 uppercase flex items-center">
                      <FaSeedling className="mr-2 text-green-600" />
                      Fertilizer Recommendations
                    </h4>
                    <div className="bg-green-50 p-4 rounded-md shadow-sm border border-green-100">
                      {crop.fertilizer ? (
                        <div className="space-y-3">
                          <h5 className="font-medium text-green-800 text-sm">Recommended Fertilizers</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white rounded shadow p-4">
                              <div className="text-xs text-gray-500 font-semibold mb-1">UREA</div>
                              <div className="font-bold text-gray-900 text-base">{crop.fertilizer.urea_kg_per_ha} kg/ha</div>
                            </div>
                            <div className="bg-white rounded shadow p-4">
                              <div className="text-xs text-gray-500 font-semibold mb-1">DAP</div>
                              <div className="font-bold text-gray-900 text-base">{crop.fertilizer.dap_kg_per_ha} kg/ha</div>
                            </div>
                            <div className="bg-white rounded shadow p-4">
                              <div className="text-xs text-gray-500 font-semibold mb-1">MOP</div>
                              <div className="font-bold text-gray-900 text-base">{crop.fertilizer.mop_kg_per_ha} kg/ha</div>
                            </div>
                          </div>
                          
                          <h5 className="font-medium text-green-800 text-sm mt-4">NPK Values</h5>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                              <h6 className="text-xs text-gray-500 font-semibold mb-1">Nitrogen (N)</h6>
                              <p className="text-gray-800 font-medium">{crop.fertilizer.n_kg_per_ha || 0} kg/ha</p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                              <h6 className="text-xs text-gray-500 font-semibold mb-1">Phosphorus (P)</h6>
                              <p className="text-gray-800 font-medium">{crop.fertilizer.p_kg_per_ha || 0} kg/ha</p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                              <h6 className="text-xs text-gray-500 font-semibold mb-1">Potassium (K)</h6>
                              <p className="text-gray-800 font-medium">{crop.fertilizer.k_kg_per_ha || 0} kg/ha</p>
                            </div>
                          </div>
                          
                          {crop.fertilizer.application_schedule && (
                            <div className="mt-3">
                              <h5 className="font-medium text-green-800 text-sm">Application Schedule</h5>
                              <p className="text-gray-800 mt-1 p-2 bg-white rounded border border-green-100">
                                {crop.fertilizer.application_schedule}
                              </p>
                            </div>
                          )}
                          
                          {crop.fertilizer.organic_alternatives && (
                            <div className="mt-3">
                              <h5 className="font-medium text-green-800 text-sm">Organic Alternatives</h5>
                              <div className="p-2 bg-white rounded border border-green-100 mt-1">
                                {crop.fertilizer.organic_alternatives.split('\n').map((alt, idx) => (
                                  alt ? <p key={idx} className="text-gray-800">{alt}</p> : null
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FaLeaf className="mx-auto h-6 w-6 text-green-500 mb-2" />
                          <p className="text-gray-600">Generic fertilizer recommendation: {crop.details?.fertilizer || 'Balanced NPK based on soil test'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropRecommendations; 