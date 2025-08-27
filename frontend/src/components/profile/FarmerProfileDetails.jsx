import React, { useState, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaSeedling, FaWater, FaMoneyBillWave, FaUserAlt, FaLeaf } from 'react-icons/fa';

const FarmerProfileDetails = ({ profileData, onEditProfile }) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    personal: 0,
    farm: 0,
    financial: 0,
    preferences: 0
  });
  
  // Always try to get the latest profile data from localStorage
  const [latestProfileData, setLatestProfileData] = useState(profileData);
  
  useEffect(() => {
    try {
      const storedProfileData = localStorage.getItem('farmerProfileData');
      if (storedProfileData) {
        const parsedProfile = JSON.parse(storedProfileData);
        console.log("FarmerProfileDetails - Found fresh profile data in localStorage");
        setLatestProfileData(parsedProfile);
      } else {
        setLatestProfileData(profileData);
      }
    } catch (e) {
      console.error("Error parsing stored profile data in FarmerProfileDetails:", e);
      setLatestProfileData(profileData);
    }
  }, [profileData]);
  
  // Debug logging
  useEffect(() => {
    console.log("FarmerProfileDetails received profile data:", profileData);
  }, [profileData]);
  
  useEffect(() => {
    if (latestProfileData) {
      calculateCompletionStatus();
    }
  }, [latestProfileData]);
  
  // Calculate the completion percentage for each section
  const calculateCompletionStatus = () => {
    const personal = latestProfileData.personal || {};
    const farm = latestProfileData.farm || {};
    const financial = latestProfileData.financial || {};
    const preferences = latestProfileData.preferences || {};
    
    // Count filled fields in personal section
    const personalFields = ['firstName', 'lastName', 'age', 'gender', 'district', 'state'];
    const personalFilled = personalFields.filter(field => personal[field]).length;
    const personalCompletion = Math.round((personalFilled / personalFields.length) * 100);
    
    // Count filled fields in farm section
    const farmFields = ['size', 'soilType', 'soilPh', 'landOwnership', 'nitrogenValue', 'phosphorusValue', 'potassiumValue', 'irrigationSources', 'irrigationSystems'];
    const farmFilled = farmFields.filter(field => farm[field]).length;
    const farmCompletion = Math.round((farmFilled / farmFields.length) * 100);
    
    // Count filled fields in financial section
    const financialFields = ['annualIncome', 'cropInsurance', 'bankAccount'];
    const financialFilled = financialFields.filter(field => financial[field]).length;
    const financialCompletion = Math.round((financialFilled / financialFields.length) * 100);
    
    // Count filled fields in preferences section
    const preferencesFields = ['seasonalPreference'];
    const preferencesFilled = preferencesFields.filter(field => preferences[field]).length;
    const preferencesCompletion = Math.round((preferencesFilled / preferencesFields.length) * 100);
    
    setCompletionStatus({
      personal: personalCompletion,
      farm: farmCompletion,
      financial: financialCompletion,
      preferences: preferencesCompletion
    });
  };
  
  if (!latestProfileData) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p>No profile data available</p>
      </div>
    );
  }

  // Extract data with fallbacks for different structures
  const personal = latestProfileData.personal || {};
  const farm = latestProfileData.farm || {};
  const financial = latestProfileData.financial || {};
  const preferences = latestProfileData.preferences || {};
  const challenges = latestProfileData.challenges || [];

  // Handle district and state that might be in different locations
  const district = personal.district || '';
  const state = personal.state || '';
  
  // Get name from different possible locations
  const firstName = personal.firstName || '';
  const lastName = personal.lastName || '';
  const fullName = personal.name || `${firstName} ${lastName}`.trim();
  
  // Parse and extract size components
  let farmSize = '';
  let sizeUnit = '';
  if (farm.size && typeof farm.size === 'string') {
    const sizeMatch = farm.size.match(/(\d+(?:\.\d+)?)\s*([A-Za-z]+)/);
    if (sizeMatch) {
      farmSize = sizeMatch[1];
      sizeUnit = sizeMatch[2];
    } else {
      farmSize = farm.size;
    }
  }

  // Format arrays for display
  const formatArrayData = (arr) => {
    if (!arr) return 'None';
    if (typeof arr === 'string') return arr;
    if (Array.isArray(arr) && arr.length === 0) return 'None';
    if (Array.isArray(arr)) return arr.join(', ');
    return String(arr);
  };

  // Calculate overall profile completion
  const overallCompletion = Math.round(
    (completionStatus.personal + completionStatus.farm + completionStatus.financial + completionStatus.preferences) / 4
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden transition-all shadow-sm border border-gray-200">
      {/* Profile Completion Bar */}
      <div className="bg-gray-100 p-2 border-b border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-bold text-gray-800">{overallCompletion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              overallCompletion > 75 ? 'bg-green-600' : 
              overallCompletion > 50 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} 
            style={{ width: `${overallCompletion}%` }}
          ></div>
        </div>
      </div>
      
      {/* Summary View (always visible) */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {fullName || 'Farmer'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {district && state ? `${district}, ${state}` : ''}
            </p>
          </div>
          <button
            onClick={onEditProfile}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            Edit Profile
          </button>
        </div>
        
        {/* Basic Farm Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <div className="flex items-center mb-2">
              <FaSeedling className="text-green-600 mr-2" />
              <span className="font-medium text-green-800">Farm Size</span>
            </div>
            <span className="text-gray-800 font-bold text-lg">{farmSize ? `${farmSize} ${sizeUnit}` : (farm.farmSize ? `${farm.farmSize} ${farm.unit || ''}` : 'N/A')}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-center mb-2">
              <FaLeaf className="text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Soil Type</span>
            </div>
            <span className="text-gray-800 font-bold text-lg">{farm.soilType || 'N/A'}</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
            <div className="flex items-center mb-2">
              <FaSeedling className="text-purple-600 mr-2" />
              <span className="font-medium text-purple-800">Main Crops</span>
            </div>
            <span className="text-gray-800">{formatArrayData(farm.mainCrops)}</span>
          </div>
        </div>
        
        <button
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="mt-6 text-green-600 text-sm flex items-center w-full justify-center py-2 border border-green-200 rounded-md hover:bg-green-50 transition-colors"
        >
          {showFullDetails ? (
            <>Hide Details <FaChevronUp className="ml-1" /></>
          ) : (
            <>Show More Details <FaChevronDown className="ml-1" /></>
          )}
        </button>
      </div>
      
      {/* Detailed View (collapsible) */}
      {showFullDetails && (
        <div className="p-4 bg-gray-50 text-sm border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Personal Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FaUserAlt className="mr-2 text-blue-600" />
                  Personal Information
                </h4>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        completionStatus.personal > 75 ? 'bg-green-600' : 
                        completionStatus.personal > 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${completionStatus.personal}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{completionStatus.personal}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500">Age: </span>
                  <span className="text-gray-800 font-medium">{personal.age || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Gender: </span>
                  <span className="text-gray-800 font-medium">{personal.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">District: </span>
                  <span className="text-gray-800 font-medium">{district || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">State: </span>
                  <span className="text-gray-800 font-medium">{state || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Financial Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-green-600" />
                  Financial Information
                </h4>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        completionStatus.financial > 75 ? 'bg-green-600' : 
                        completionStatus.financial > 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${completionStatus.financial}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{completionStatus.financial}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Annual Income: </span>
                  <span className="text-gray-800 font-medium">{financial.annualIncome || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Crop Insurance: </span>
                  <span className="text-gray-800 font-medium">{financial.cropInsurance || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Bank Account: </span>
                  <span className="text-gray-800 font-medium">{financial.bankAccount || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Government Schemes: </span>
                  <span className="text-gray-800 font-medium">{formatArrayData(financial.governmentSchemes)}</span>
                </div>
              </div>
            </div>
            
            {/* Farm Details Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FaSeedling className="mr-2 text-yellow-600" />
                  Farm Details
                </h4>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        completionStatus.farm > 75 ? 'bg-green-600' : 
                        completionStatus.farm > 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${completionStatus.farm}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{completionStatus.farm}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-500">Soil pH: </span>
                  <span className="text-gray-800 font-medium">{farm.soilPh || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Land Ownership: </span>
                  <span className="text-gray-800 font-medium">{farm.landOwnership || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nitrogen: </span>
                  <span className="text-gray-800 font-medium">{farm.nitrogenValue || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phosphorus: </span>
                  <span className="text-gray-800 font-medium">{farm.phosphorusValue || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Potassium: </span>
                  <span className="text-gray-800 font-medium">{farm.potassiumValue || 'N/A'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <FaWater className="text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Irrigation Sources</span>
                  </div>
                  <span className="text-gray-800">{formatArrayData(farm.irrigationSources)}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <FaWater className="text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Irrigation Systems</span>
                  </div>
                  <span className="text-gray-800">{formatArrayData(farm.irrigationSystems)}</span>
                </div>
              </div>
            </div>
            
            {/* Preferences Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FaLeaf className="mr-2 text-green-600" />
                  Preferences
                </h4>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        completionStatus.preferences > 75 ? 'bg-green-600' : 
                        completionStatus.preferences > 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${completionStatus.preferences}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{completionStatus.preferences}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Season Preferences: </span>
                  <span className="text-gray-800 font-medium">{formatArrayData(preferences.seasonalPreference)}</span>
                </div>
              </div>
            </div>
            
            {/* Challenges Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 flex items-center mb-3">
                <FaExclamationTriangle className="mr-2 text-amber-600" />
                Current Challenges
              </h4>
              <div>
                {challenges && challenges.length > 0 ? (
                  <ul className="space-y-2">
                    {typeof challenges === 'string' ? (
                      <li className="flex items-start">
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">{challenges}</span>
                      </li>
                    ) : Array.isArray(challenges) ? (
                      <div className="flex flex-wrap gap-2">
                        {challenges.map((challenge, index) => (
                          <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                            {challenge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">None specified</span>
                    )}
                  </ul>
                ) : (
                  <span className="text-gray-500 italic">None specified</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Missing Information Alert - only if completion is below 75% */}
          {overallCompletion < 75 && (
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Complete your profile</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your profile is {overallCompletion}% complete. Adding missing information will help us provide more accurate and personalized recommendations for your farm.
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={onEditProfile}
                      className="px-3 py-2 text-xs font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerProfileDetails; 