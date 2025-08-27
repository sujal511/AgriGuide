import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiBuildings, BiRupee, BiTime } from 'react-icons/bi';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { getLoanOptions } from '../../services/api';
import axios from 'axios';

const LoanOptions = ({ farmerId }) => {
  const [loansData, setLoansData] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [activeFilter, setActiveFilter] = useState('');
  const [farmerChallenges, setFarmerChallenges] = useState([]);

  useEffect(() => {
    const fetchFarmerProfile = async () => {
      if (!farmerId) return;
      
      try {
        console.log("Fetching challenges for farmer ID:", farmerId);
        
        // Try to get challenges using the farmer profile API
        try {
          const response = await axios.get(`/api/farmer/${farmerId}/profile`);
          if (response.data && response.data.interests && response.data.interests.challenges) {
            let challenges = response.data.interests.challenges;
            console.log('Farmer selected challenges from API:', challenges);
            // Convert to array if it's a string
            if (!Array.isArray(challenges)) {
              challenges = challenges.split(',').map(c => c.trim());
            }
            setFarmerChallenges(challenges);
            // Save to localStorage for other components
            localStorage.setItem('farmerChallenges', JSON.stringify(challenges));
            return; // We got the challenges successfully
          }
        } catch (apiErr) {
          console.log('Could not get challenges from API, trying localStorage', apiErr);
        }
        
        // Fallback to localStorage
        const storedProfile = localStorage.getItem('farmerProfileData');
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile && parsedProfile.challenges) {
            console.log('Farmer challenges from localStorage:', parsedProfile.challenges);
            setFarmerChallenges(parsedProfile.challenges);
            return; // Successfully retrieved challenges from localStorage
          }
        }
        
        // Try farmerChallenges directly from localStorage (set by GovernmentSchemes.jsx)
        const storedChallenges = localStorage.getItem('farmerChallenges');
        if (storedChallenges) {
          try {
            const challenges = JSON.parse(storedChallenges);
            if (Array.isArray(challenges) && challenges.length > 0) {
              console.log('Farmer challenges from localStorage (direct):', challenges);
              setFarmerChallenges(challenges);
              return;
            }
          } catch (e) {
            console.error('Error parsing stored challenges:', e);
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
    const fetchLoans = async () => {
      try {
        setLoading(true);
        console.log("Fetching loan options with farmer ID:", farmerId);
        const data = await getLoanOptions(farmerId);
        
        if (data.success && data.recommendations) {
          console.log("Received loan recommendations:", data.recommendations);
          
          // Process loan data to highlight matched challenges
          const processedLoans = data.recommendations.map(loan => {
            // Extract and highlight matched challenges
            let matchedChallenges = loan.matched_challenges || [];
            
            // Filter to only include challenges that match the farmer's selected challenges
            if (matchedChallenges.length > 0 && farmerChallenges.length > 0) {
              matchedChallenges = matchedChallenges.filter(
                challenge => farmerChallenges.includes(challenge)
              );
            }
            
            // If there are no explicit matched_challenges, try to extract them from reasons
            if ((!matchedChallenges || matchedChallenges.length === 0) && loan.reasons) {
              const extractedChallenges = loan.reasons
                .filter(reason => reason.includes("challenge:") || reason.includes("challenges:"))
                .map(reason => {
                  const match = reason.match(/challenge: (.*?)$/) || reason.match(/challenges: (.*?)$/);
                  return match ? match[1].trim() : null;
                })
                .filter(Boolean);
                
              // Still filter by farmer's selected challenges
              matchedChallenges = extractedChallenges.filter(
                challenge => farmerChallenges.includes(challenge)
              );
            }
            
            return {
              ...loan,
              matched_challenges: matchedChallenges
            };
          });
          
          setLoansData(processedLoans);
          setFilteredLoans(processedLoans);
        } else {
          console.warn("No loan recommendations in response:", data);
          setLoansData([]);
          setFilteredLoans([]);
          if (data.message) {
            setError(data.message);
          }
        }
      } catch (err) {
        console.error('Error fetching loan options:', err);
        setError(err.message || 'Failed to load loan options');
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchLoans();
    } else {
      setError("No farmer profile found. Please complete your profile first.");
      setLoading(false);
    }
  }, [farmerId]);

  // Add filter functionality
  useEffect(() => {
    if (!activeFilter || !loansData) {
      setFilteredLoans(loansData);
      return;
    }
    
    const filtered = loansData.filter(loan => {
      // Filter by matched challenges
      if (loan.matched_challenges && loan.matched_challenges.some(challenge => 
        challenge.toLowerCase().includes(activeFilter.toLowerCase())
      )) {
        return true;
      }
      
      // Check reasons field
      if (loan.reasons && loan.reasons.some(reason => 
        reason.toLowerCase().includes(activeFilter.toLowerCase())
      )) {
        return true;
      }
      
      // Check loan details
      if (loan.details) {
        // Check benefits field
        if (loan.details.benefits && loan.details.benefits.toLowerCase().includes(activeFilter.toLowerCase())) {
          return true;
        }
        
        // Check special features
        if (loan.details.special_features && 
            loan.details.special_features.toLowerCase().includes(activeFilter.toLowerCase())) {
          return true;
        }
      }
      
      // Match specific keywords
      if (activeFilter === 'collateral' && 
          loan.details?.special_features && 
          loan.details.special_features.toLowerCase().includes('no collateral')) {
        return true;
      }
      
      if (activeFilter === 'interest' && 
          loan.relevance === 'High' && 
          loan.reasons && 
          loan.reasons.some(r => r.toLowerCase().includes('interest'))) {
        return true;
      }
      
      return false;
    });
    
    setFilteredLoans(filtered);
  }, [activeFilter, loansData]);

  // Toggle expanded loan details
  const toggleExpand = (index) => {
    setExpandedLoan(expandedLoan === index ? null : index);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
    
    if (isNaN(numAmount)) return amount;
    
    if (numAmount >= 10000000) {
      return `₹${(numAmount / 10000000).toFixed(2)} Cr`;
    } else if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(2)} Lakh`;
    } else if (numAmount >= 1000) {
      return `₹${(numAmount / 1000).toFixed(2)} K`;
    } else {
      return `₹${numAmount}`;
    }
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
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Loan Options</h2>
      
      {/* Debug section - farmer challenges - removed as requested */}
      
      {/* Add filter UI */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => handleFilterChange('')}
          className={`px-3 py-1 text-sm rounded-full ${!activeFilter ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => handleFilterChange('subsidy')}
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'subsidy' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Subsidies
        </button>
        <button 
          onClick={() => handleFilterChange('collateral')}
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'collateral' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          No Collateral
        </button>
        <button 
          onClick={() => handleFilterChange('interest')}
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'interest' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Low Interest
        </button>
        <button 
          onClick={() => handleFilterChange('processing')}
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'processing' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Fast Processing
        </button>
        <button 
          onClick={() => handleFilterChange('flexible')}
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'flexible' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Flexible Repayment
        </button>
      </div>
      
      <div className="space-y-6">
        {filteredLoans && filteredLoans.length > 0 ? (
          filteredLoans.map((loan, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">{loan.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    loan.relevance === 'High' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.relevance} Relevance
                  </span>
                </div>
                
                <div className="flex items-center mt-2 text-gray-600">
                  <BiBuildings className="mr-1" />
                  <span className="text-sm">{loan.provider}</span>
                </div>
                
                {/* Display matched challenges */}
                {loan.matched_challenges && loan.matched_challenges.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-gray-500">Addresses Your Challenges:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {loan.matched_challenges.map((challenge, idx) => (
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
                  {loan.loan_category && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1 rounded-full font-medium">
                      {loan.loan_category}
                    </span>
                  )}
                  <span className="bg-green-50 text-green-700 border border-green-100 text-sm px-3 py-1 rounded-full font-medium">
                    {loan.interest_rate || loan.details?.interest_rate}
                  </span>
                  {loan.details?.max_amount && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 text-sm px-3 py-1 rounded-full font-medium">
                      Up to {formatCurrency(loan.details?.max_amount)}
                    </span>
                  )}
                </div>
                
                {/* Why This Matters For You - always visible */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">WHY THIS MATTERS FOR YOU:</h4>
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                    {loan.reasons && loan.reasons.length > 0 ? (
                      loan.reasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className={
                          farmerChallenges.some(challenge => 
                            reason.toLowerCase().includes(challenge.toLowerCase())
                          ) ? "text-green-700 font-medium" : ""
                        }>
                          {reason}
                        </li>
                      ))
                    ) : (
                      <>
                        <li>Matches your financial profile</li>
                        <li>Offers competitive interest rate</li>
                        <li>Suitable for your farm type and size</li>
                      </>
                    )}
                  </ul>
                </div>
                
                {/* Click for details button */}
                <button 
                  onClick={() => toggleExpand(index)} 
                  className="flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Click for details {expandedLoan === index ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
                </button>
                
                {/* Expandable details section */}
                {expandedLoan === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Key Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Interest Rate:</h4>
                        <p className="text-sm font-medium text-gray-800">{loan.interest_rate || loan.details?.interest_rate}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Max Amount:</h4>
                        <p className="text-sm font-medium text-gray-800">{formatCurrency(loan.details?.max_amount)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Processing Time:</h4>
                        <div className="flex items-center">
                          <BiTime className="mr-1 text-gray-600" />
                          <p className="text-sm font-medium text-gray-800">{loan.details?.processing_time}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Benefits */}
                    {loan.details?.benefits && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">KEY BENEFITS</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                          {loan.details.benefits.split(',').map((benefit, idx) => (
                            <li key={idx} className="text-green-600 font-medium">
                              {benefit.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Eligibility */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">Eligibility</h4>
                      <p className="text-gray-700 text-sm">{loan.details?.eligibility}</p>
                    </div>
                    
                    {/* Documents Required */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">Required Documents</h4>
                      <p className="text-gray-700 text-sm">{loan.details?.documents_required}</p>
                    </div>
                    
                    {/* Special Features */}
                    {loan.details?.special_features && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">Special Features</h4>
                        <p className="text-gray-700 text-sm">{loan.details?.special_features}</p>
                      </div>
                    )}
                    
                    {/* Tenure info */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold uppercase text-gray-600 mb-2">Tenure</h4>
                      <p className="text-gray-700 text-sm">{loan.details?.tenure}</p>
                    </div>
                    
                    {/* Apply Now button */}
                    <div className="mt-6 flex justify-end">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-300">
                        Apply Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">
              {activeFilter ? 
                `No loans matching the "${activeFilter}" filter were found. Please try a different filter.` :
                farmerChallenges && farmerChallenges.length > 0 ?
                  `No loan options found that match your selected challenges: ${farmerChallenges.join(', ')}. Try selecting different challenges or updating your profile.` :
                  'No loan options matching your profile were found. Please complete your financial information to get personalized recommendations.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanOptions; 