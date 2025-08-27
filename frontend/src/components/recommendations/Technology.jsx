import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { getTechnologyRecommendations } from '../../services/api';

const Technology = ({ farmerId }) => {
  const [expandedTech, setExpandedTech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [techData, setTechData] = useState([]);

  // Debug logging
  console.log('Technology component rendering with farmerId:', farmerId);

  // Fetch technology recommendations when component mounts or farmerId changes
  useEffect(() => {
    const fetchTechnology = async () => {
      if (!farmerId) {
        console.warn('No farmer ID provided to Technology component');
        setError('No farmer profile available. Please complete your profile to get recommendations.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching technology recommendations for farmer ID: ${farmerId}`);
        // Use API service
        const response = await getTechnologyRecommendations(farmerId);
        console.log('API response:', response);
        
        if (response.success) {
          setTechData(response.recommendations || []);
        } else {
          console.error('Error response from API:', response);
          setError(response.message || 'Failed to get recommendations');
        }
      } catch (err) {
        console.error('Exception in fetchTechnology:', err);
        setError('Error connecting to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnology();
  }, [farmerId]);

  const toggleTechDetails = (techId) => {
    if (expandedTech === techId) {
      setExpandedTech(null);
    } else {
      setExpandedTech(techId);
    }
  };

  // Group technologies by category
  const techByCategory = techData.reduce((acc, tech) => {
    const category = tech.category_display || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tech);
    return acc;
  }, {});

  // Order categories by importance
  const categoryOrder = [
    'Irrigation', 
    'Soil Management', 
    'Pest Control', 
    'Seed Technology', 
    'Machinery', 
    'Post-Harvest',
    'Digital Tools',
    'Other'
  ];
  
  const sortedCategories = Object.keys(techByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <div>
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Agricultural Technology</h2>

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
      {!loading && !error && techData.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Technology Recommendations Available</h3>
          <p className="text-gray-600">Complete your farm profile to get personalized technology recommendations.</p>
        </div>
      )}

      {/* Technology cards grouped by category */}
      {!loading && sortedCategories.map(category => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-medium text-gray-800 mb-4">{category}</h3>
          <div className="space-y-6">
            {techByCategory[category].map((tech) => (
              <div key={tech.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{tech.name || `Agricultural Technology ${tech.id}`}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tech.relevance === 'High' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tech.relevance} Relevance
                    </span>
                  </div>

                  {/* Key tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1 rounded-full font-medium">
                      {tech.difficulty || 'Medium'} Difficulty
                    </span>
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 text-sm px-3 py-1 rounded-full font-medium">
                      ROI: {tech.details?.roi_percentage || '0'}%
                    </span>
                    {tech.suitability && (
                      <span className="bg-green-50 text-green-700 border border-green-100 text-sm px-3 py-1 rounded-full font-medium">
                        {tech.suitability} Suitability
                      </span>
                    )}
                  </div>
                  
                  {/* Why This Matters For You section */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">WHY THIS MATTERS FOR YOU:</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                      {tech.reasoning && tech.reasoning.length > 0 ? (
                        tech.reasoning.slice(0, 3).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))
                      ) : (
                        <>
                          <li>Addresses {tech.addresses_issue || 'productivity challenges'} on your farm</li>
                          <li>Compatible with your current farming setup</li>
                          <li>Potential to {tech.benefit || 'increase yield while reducing costs'}</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  {/* Click for details button */}
                  <button 
                    onClick={() => toggleTechDetails(tech.id)} 
                    className="flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Click for details {expandedTech === tech.id ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
                  </button>

                  {expandedTech === tech.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">Technology Description:</h4>
                        <p className="text-sm text-gray-800">{tech.details?.description || `${tech.name} helps farmers increase productivity and reduce resource usage through advanced technological solutions.`}</p>
                      </div>

                      {/* Implementation details section */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Estimated Cost:</h4>
                          <p className="text-sm font-medium text-gray-800">₹{tech.details?.implementation_cost || 'Not specified'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">ROI:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.details?.roi_percentage || '0'}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Implementation Time:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.details?.implementation_time || 'Varies'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Suitable Crops:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.details?.suitable_crops || 'Information not available'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Technical Requirements:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.details?.technical_requirements || 'Information not available'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Training Needs:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.details?.training_needs || 'Information not available'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Supplier Contacts:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.details?.supplier_contacts || 'Information not available'}</p>
                        </div>
                      </div>

                      {tech.ownership_context && (
                        <div className="bg-white p-3 rounded-md shadow-sm mb-4">
                          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Land Ownership Context:</h4>
                          <p className="text-sm font-medium text-gray-800">{tech.ownership_context}</p>
                        </div>
                      )}
                      
                      {/* Implementation steps or supplier link if available */}
                      {tech.details?.implementation_steps && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">Implementation Steps</h4>
                          <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                            {tech.details.implementation_steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {/* Additional learn more section */}
                      {tech.details?.learn_more_url && (
                        <div className="mt-6 flex justify-end">
                          <a 
                            href={tech.details.learn_more_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-300"
                          >
                            Learn More
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Technology; 