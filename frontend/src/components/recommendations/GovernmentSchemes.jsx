import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiBuildings } from 'react-icons/bi';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { getGovernmentSchemes } from '../../services/api';
import axios from 'axios';

const GovernmentSchemes = ({ farmerId }) => {
  const [schemesData, setSchemesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [farmerChallenges, setFarmerChallenges] = useState([]);

  // Fetch farmer profile to get challenges
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      if (!farmerId) return;
      
      try {
        console.log("Fetching challenges for farmer ID:", farmerId);
        
        // Force refresh the farmer profile to ensure we have the latest data
        try {
          // Add timestamp to prevent caching
          const timestamp = new Date().getTime();
          const response = await axios.get(`/api/farmer/${farmerId}/profile?t=${timestamp}`);
          
          if (response.data && response.data.interests && response.data.interests.challenges) {
            let challenges = response.data.interests.challenges;
            console.log('LATEST Farmer selected challenges from API:', challenges);
            
            // Convert to array if it's a string
            if (!Array.isArray(challenges)) {
              challenges = challenges.split(',').map(c => c.trim());
            }
            
            // Save to state and localStorage
            setFarmerChallenges(challenges);
            localStorage.setItem('farmerChallenges', JSON.stringify(challenges));
            console.log('Updated challenges in localStorage and state:', challenges);
            return; // We got the challenges successfully
          } else {
            console.warn('API returned no challenges data structure:', response.data);
          }
        } catch (apiErr) {
          console.error('Could not get challenges from API:', apiErr);
          
          // Fallback to localStorage
          const storedProfile = localStorage.getItem('farmerProfileData');
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile && parsedProfile.challenges) {
              console.log('Using farmer challenges from localStorage fallback:', parsedProfile.challenges);
              setFarmerChallenges(parsedProfile.challenges);
              return; // Successfully retrieved challenges from localStorage
            }
          }
        }
        
        console.warn('Could not retrieve farmer challenges from any source');
      } catch (e) {
        console.error('Error retrieving farmer challenges:', e);
      }
    };
    
    fetchFarmerProfile();
  }, [farmerId]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const data = await getGovernmentSchemes(farmerId);
        console.log("Received government scheme data:", data);
        
        // Process the scheme data to enhance challenge information
        const processedData = data.map(scheme => {
          // Initialize the final matched challenges array that we'll use
          let actualMatchedChallenges = [];
          
          // First, check for explicit matched_challenges from backend
          if (scheme.matched_challenges && scheme.matched_challenges.length > 0) {
            console.log('Found matched_challenges for scheme:', scheme.name, scheme.matched_challenges);
            // Filter to only include challenges that are in the farmer's selected challenges
            actualMatchedChallenges = scheme.matched_challenges.filter(
              challenge => farmerChallenges.includes(challenge)
            );
          } else {
            // Extract challenges from reasons, but still filter by selected challenges
            if (scheme.reasons && scheme.reasons.length > 0) {
              // Look for reasons that mention challenges
              scheme.reasons.forEach(reason => {
                if (reason.includes("Addresses your challenge:") || reason.includes("Directly addresses your")) {
                  // Extract the challenge from the reason text
                  const challengeMatch = reason.match(/challenge: (.*?)$/) || 
                                      reason.match(/addresses your (.*?) challenge/);
                  if (challengeMatch && challengeMatch[1]) {
                    const extractedChallenge = challengeMatch[1].trim();
                    // Only include if it's one of the farmer's selected challenges
                    if (farmerChallenges.includes(extractedChallenge)) {
                      actualMatchedChallenges.push(extractedChallenge);
                    }
                  }
                }
              });
            }
          }
          
          // Replace the matched_challenges with our filtered list
          scheme.matched_challenges = actualMatchedChallenges;
          
          // Extract what the scheme is designed for
          if (scheme.reasons && scheme.reasons.length > 0) {
            // Look for reasons about specific crops/farmers
            const designedForReason = scheme.reasons.find(reason => 
              reason.includes("Specifically designed for") || 
              reason.includes("Applicable to your crops")
            );
            
            if (designedForReason) {
              // Extract what it's designed for
              const designMatch = designedForReason.match(/designed for (.*?)$/) || 
                                designedForReason.match(/Applicable to your crops: (.*?)$/);
              if (designMatch && designMatch[1]) {
                scheme.designed_for = designMatch[1].trim();
              }
            }
          }
          
          return scheme;
        });
        
        console.log("Processed scheme data with extracted challenges:", processedData);
        setSchemesData(processedData);
      } catch (err) {
        setError(err.message || 'Failed to load government schemes');
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchSchemes();
    }
  }, [farmerId]);

  const toggleExpand = (index) => {
    setExpandedScheme(expandedScheme === index ? null : index);
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="200px" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Government Schemes</h2>
      
      <div className="space-y-6">
        {schemesData && schemesData.length > 0 ? (
          schemesData.map((scheme, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">{scheme.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    scheme.relevance === 'High' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {scheme.relevance} Relevance
                  </span>
                </div>
                
                <div className="flex items-center mt-2 text-gray-600">
                  <BiBuildings className="mr-1" />
                  <span className="text-sm">{scheme.implementing_agency}</span>
                </div>
                
                {/* Display matched challenges */}
                {scheme.matched_challenges && scheme.matched_challenges.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-gray-500">Addresses Your Challenges:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {scheme.matched_challenges.map((challenge, idx) => (
                        <span 
                          key={idx} 
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Key tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {scheme.crop_applicability !== 'All' && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1 rounded-full font-medium">
                      Crop-specific
                    </span>
                  )}
                  {scheme.eligibility_criteria && scheme.eligibility_criteria.toLowerCase().includes('subsidy') && (
                    <span className="bg-green-50 text-green-700 border border-green-100 text-sm px-3 py-1 rounded-full font-medium">
                      Includes Subsidy
                    </span>
                  )}
                  {scheme.district_availability && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 text-sm px-3 py-1 rounded-full font-medium">
                      {scheme.district_availability.includes('All') ? 'All Districts' : 'Selected Districts'}
                    </span>
                  )}
                </div>
                
                {/* Why This Matters For You - always visible */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">WHY THIS MATTERS FOR YOU:</h4>
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                    {scheme.reasons && scheme.reasons.length > 0 ? (
                      scheme.reasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className={
                          farmerChallenges.some(challenge => 
                            reason.toLowerCase().includes(challenge.toLowerCase())
                          ) ? "text-green-700 font-medium" : ""
                        }>{reason}</li>
                      ))
                    ) : (
                      <>
                        {scheme.addresses_challenge ? (
                          <li className="text-green-700 font-medium">Addresses your challenge: {scheme.addresses_challenge}</li>
                        ) : (
                          <li>Relevant for your farming needs</li>
                        )}
                        {scheme.designed_for ? (
                          <li>Specifically designed for {scheme.designed_for}</li>
                        ) : (
                          <li>Designed for farmers like you</li>
                        )}
                        <li>Relevant for the current growing season</li>
                      </>
                    )}
                  </ul>
                </div>
                
                {/* Click for details button */}
                <button 
                  onClick={() => toggleExpand(index)} 
                  className="flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Click for details {expandedScheme === index ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
                </button>
                
                {/* Expandable details section */}
                {expandedScheme === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Description */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">DESCRIPTION</h4>
                      <p className="text-gray-700 text-sm">{scheme.details?.detailed_description || scheme.detailed_description || scheme.description}</p>
                    </div>
                    
                    {/* Benefits */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">BENEFITS</h4>
                      <p className="text-gray-700 text-sm">{scheme.details?.benefits || scheme.benefits}</p>
                    </div>
                    
                    {/* Eligibility */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">ELIGIBILITY</h4>
                      <p className="text-gray-700 text-sm">{scheme.details?.eligibility_criteria || scheme.eligibility_criteria}</p>
                    </div>
                    
                    {/* Application Process */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">APPLICATION PROCESS</h4>
                      <p className="text-gray-700 text-sm">{scheme.details?.application_process || scheme.application_process}</p>
                    </div>
                    
                    {/* Documents Required */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">REQUIRED DOCUMENTS</h4>
                      <p className="text-gray-700 text-sm">{scheme.details?.documents_required || scheme.documents_required || "Contact the implementing agency for document requirements."}</p>
                    </div>
                    
                    {/* Additional Info */}
                    {(scheme.details?.district_availability || scheme.district_availability) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">AVAILABILITY</h4>
                        <p className="text-gray-700 text-sm">Available in: {scheme.details?.district_availability || scheme.district_availability}</p>
                      </div>
                    )}
                    
                    {(scheme.details?.crop_applicability || scheme.crop_applicability) && scheme.crop_applicability !== 'All' && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">APPLICABLE CROPS</h4>
                        <p className="text-gray-700 text-sm">{scheme.details?.crop_applicability || scheme.crop_applicability}</p>
                      </div>
                    )}
                    
                    {/* Official Website Link */}
                    {(scheme.details?.official_website || scheme.official_website) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">OFFICIAL WEBSITE</h4>
                        <a 
                          href={scheme.details?.official_website || scheme.official_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        >
                          Visit Website <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                    
                    {/* Apply Now button */}
                    <div className="mt-6 flex justify-end">
                      <a 
                        href={scheme.details?.official_website || scheme.official_website || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-300 flex items-center"
                      >
                        Apply Now <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">
              {farmerChallenges && farmerChallenges.length > 0 ? 
                `No government schemes found that match your selected challenges: ${farmerChallenges.join(', ')}. Try selecting different challenges or updating your profile.` :
                'No government schemes matching your profile were found. Please complete your profile information to get personalized recommendations.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSchemes; 