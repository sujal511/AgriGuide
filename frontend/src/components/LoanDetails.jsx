import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Check, Calendar, DollarSign, FileText, 
  Home, Percent, Shield, Clock, Users, ChevronDown,
  Info, CreditCard, Landmark, Award, Phone, HelpCircle
} from 'lucide-react';

const LoanDetails = ({ schemeId, onBack, expandedSections, toggleSection }) => {
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFaqs, setExpandedFaqs] = useState(null);
  
  // Use expandedSections from props for FAQs
  const hasFaqs = loanDetails?.faq && Object.keys(loanDetails.faq).length > 0;
  
  // Toggle FAQ expansion
  const toggleFaq = (faqId) => {
    setExpandedFaqs(expandedFaqs === faqId ? null : faqId);
  };

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching loan details for scheme ID: ${schemeId}`);
        const response = await fetch(`/api/bank-schemes/${schemeId}/`);
        console.log(`API response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Loan details data received:', data);
          
          // Decode all string values in the data object
          const decodeObjectStrings = (obj) => {
            if (!obj) return obj;
            
            const processValue = (val) => {
              if (typeof val === 'string') {
                return val.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => 
                  String.fromCodePoint(parseInt(hex, 16))
                );
              } else if (Array.isArray(val)) {
                return val.map(item => processValue(item));
              } else if (typeof val === 'object' && val !== null) {
                return decodeObjectStrings(val);
              }
              return val;
            };
            
            const result = {};
            for (const key in obj) {
              result[key] = processValue(obj[key]);
            }
            return result;
          };
          
          const decodedData = decodeObjectStrings(data);
          
          // Ensure the data is properly processed and handle different field naming conventions
          const processedData = {
            ...decodedData,
            // Normalize field names for consistent access
            name: decodedData.schemeName || decodedData.name,
            description: decodedData.description || decodedData.longDescription,
            interestRateMin: decodedData.interestRate?.min || decodedData.interestRateMin || 9,
            interestRateMax: decodedData.interestRate?.max || decodedData.interestRateMax || 12,
            interestRateNote: decodedData.interestRate?.note || decodedData.interestRateNote,
            repaymentTermMonths: decodedData.repaymentTerm?.durationMonths || decodedData.repaymentTermMonths || 12,
            repaymentCategory: decodedData.repaymentTerm?.category || decodedData.repaymentCategory || 'Short',
            eligibilityCriteria: decodedData.eligibility || decodedData.eligibilityCriteria || [],
            benefits: decodedData.keyBenefits || decodedData.benefits || [],
            subsidyAvailable: decodedData.subsidy?.available || decodedData.subsidyAvailable || false,
            subsidyDetails: decodedData.subsidy?.details || decodedData.subsidyDetails,
            loanLimitNote: decodedData.loanLimit?.note || decodedData.loanLimitNote,
            id: decodedData.schemeId || decodedData.id
          };
          
          setLoanDetails(processedData);
        } else {
          setError('Failed to load loan scheme details. Please try again later.');
          console.error(`Failed to load loan details: Server responded with ${response.status}`);
        }
      } catch (error) {
        setError('An unexpected error occurred. Please try again later.');
        console.error('Error fetching loan details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [schemeId]);

  // Helper function to ensure data is an array and parse string representations properly
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    
    if (typeof data === 'string') {
      // If it's a string representation of an array
      if (data.startsWith('[') && data.endsWith(']')) {
        try {
          // Try to parse it as JSON
          return JSON.parse(data);
        } catch (e) {
          // If JSON parsing fails, use a simplified approach
          // This handles formats like ["item1", "item2", "item3"]
          const cleanData = data
            .replace(/^\[|\]$/g, '') // Remove starting [ and ending ]
            .split(',')
            .map(item => {
              const trimmed = item.trim();
              // Remove quotes around items if present
              return trimmed.replace(/^["']|["']$/g, '');
            })
            .filter(Boolean); // Remove empty entries
          
          return cleanData;
        }
      }
      // Single string, return as a single-item array
      return [data];
    }
    
    return [];
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg w-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Loading Loan Details</h2>
        </div>
        <div className="p-10 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg w-full overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Error</h2>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Loan Scheme</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!loanDetails) {
    return (
      <div className="bg-white rounded-lg shadow-lg w-full overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Not Found</h2>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loan Scheme Not Found</h3>
          <p className="text-gray-600 mb-4">The loan scheme you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl w-full overflow-hidden border border-gray-100">
      {/* Enhanced header with scheme info */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center mb-3">
              <span className="px-3 py-1 bg-white text-green-800 text-xs rounded-full font-medium mr-2 shadow-sm">
                {loanDetails.loanType}
              </span>
              <span className="text-xs text-white bg-green-700 bg-opacity-30 px-2 py-1 rounded-md">
                ID: {loanDetails.id || 'BOB-AGRI-001'}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{loanDetails.name}</h1>
            <p className="flex items-center text-white opacity-90">
              <Landmark className="h-4 w-4 mr-2" />
              {loanDetails.bank}
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <button className="inline-flex items-center px-4 py-2 bg-white text-green-700 rounded-md shadow-sm hover:bg-gray-50 transition duration-150">
              <FileText className="h-4 w-4 mr-2" />
              Download Details
            </button>
          </div>
        </div>
      </div>
      
      {/* Key metrics bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
        <div className="bg-white p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <Percent className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Interest Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {(loanDetails.interestRate?.min || loanDetails.interestRateMin || 9)}% - 
              {(loanDetails.interestRate?.max || loanDetails.interestRateMax || 12)}%
            </p>
          </div>
        </div>
        <div className="bg-white p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Loan Amount</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{(loanDetails.loanLimit?.minAmount || loanDetails.minLoanAmount || 10000).toLocaleString()} - 
              ₹{(loanDetails.loanLimit?.maxAmount || loanDetails.maxLoanAmount || 500000).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Repayment Term</p>
            <p className="text-xl font-bold text-gray-900">
              {loanDetails.repaymentTerm?.durationMonths || loanDetails.repaymentTermMonths || 12} months
            </p>
          </div>
        </div>
      </div>
      
      {/* Static sections content */}
      <div className="space-y-8 px-6 py-8">
        {/* Overview Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="py-4 px-6 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-4 shadow-sm">
                <Info className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Loan Overview</h3>
            </div>
          </div>
          
          <div className="p-6">
            {/* Description */}
            <div className="mb-8 bg-gray-50 p-5 rounded-lg border-l-4 border-green-400">
              <p className="text-gray-700 italic">
                {loanDetails.longDescription || loanDetails.description || 
                "Short-term credit for crop cultivation, post-harvest expenses, farm maintenance, allied activities, household consumption, and marketing"}
              </p>
            </div>

            {/* Key Benefits */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                Key Benefits
              </h2>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <ul className="space-y-4 divide-y divide-gray-100">
                  {ensureArray(loanDetails.keyBenefits || loanDetails.benefits).length > 0 ? 
                    ensureArray(loanDetails.keyBenefits || loanDetails.benefits).map((benefit, index) => (
                      <li key={index} className="flex items-start pt-4 first:pt-0">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    )) : 
                    <>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">Government interest subvention for loans up to ₹3 lakh</span>
                      </li>
                      <li className="flex items-start pt-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">Revolving credit facility</span>
                      </li>
                    </>
                  }
                </ul>
              </div>
            </div>

            {/* Subsidy Information */}
            {(loanDetails.subsidy?.available || loanDetails.subsidyAvailable) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-purple-600 mr-2" />
                  Subsidy Information
                </h2>
                <div className="bg-purple-50 rounded-lg p-5 border border-purple-200 relative overflow-hidden">
                  <div className="flex items-center mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      Subsidy Available
                    </span>
                  </div>
                  {(loanDetails.subsidy?.details || loanDetails.subsidyDetails) && (
                    <p className="text-gray-700">{loanDetails.subsidy?.details || loanDetails.subsidyDetails}</p>
                  )}
                  <div className="absolute top-0 right-0 opacity-10">
                    <Shield className="h-24 w-24 text-purple-300" />
                  </div>
                </div>
              </div>
            )}

            {/* Collateral Requirements */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                Collateral Requirements
              </h2>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <p className="text-gray-700">
                  {loanDetails.collateralRequired || "No collateral required for loans up to ₹1.6 lakh"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility & Documents Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="py-4 px-6 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-4 shadow-sm">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Eligibility & Documents</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Eligibility Criteria */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Eligibility Criteria
                </h2>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                  <ul className="space-y-4 divide-y divide-gray-100">
                    {ensureArray(loanDetails.eligibility || loanDetails.eligibilityCriteria).length > 0 ?
                      ensureArray(loanDetails.eligibility || loanDetails.eligibilityCriteria).map((criteria, index) => (
                        <li key={index} className="flex items-start pt-4 first:pt-0">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-purple-600" />
                          </div>
                          <span className="text-gray-700">{criteria}</span>
                        </li>
                      )) :
                      <>
                        <li className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-purple-600" />
                          </div>
                          <span className="text-gray-700">All farmers - individual, joint borrowers, tenant farmers, sharecroppers, oral lessees</span>
                        </li>
                        <li className="flex items-start pt-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-purple-600" />
                          </div>
                          <span className="text-gray-700">Self-help groups or joint liability groups of farmers</span>
                        </li>
                      </>
                    }
                  </ul>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Required Documents
                </h2>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                  <ul className="space-y-4 divide-y divide-gray-100">
                    {ensureArray(loanDetails.requiredDocuments).length > 0 ?
                      ensureArray(loanDetails.requiredDocuments).map((doc, index) => (
                        <li key={index} className="flex items-start pt-4 first:pt-0">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">{doc}</span>
                        </li>
                      )) :
                      <>
                        <li className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">Identity proof (Aadhaar, PAN, Voter ID)</span>
                        </li>
                        <li className="flex items-start pt-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">Land records/proof of farming activity</span>
                        </li>
                        <li className="flex items-start pt-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">Passport-sized photographs</span>
                        </li>
                      </>
                    }
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Loan Purpose */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                Approved Loan Purposes
              </h2>
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <div className="flex flex-wrap gap-3">
                  {ensureArray(loanDetails.loanPurpose).length > 0 ?
                    ensureArray(loanDetails.loanPurpose).map((purpose, index) => (
                      <span key={index} className="px-4 py-2 bg-white text-green-800 rounded-lg text-sm shadow-sm border border-green-100">
                        {purpose}
                      </span>
                    )) :
                    <>
                      <span className="px-4 py-2 bg-white text-green-800 rounded-lg text-sm shadow-sm border border-green-100">Crop Cultivation</span>
                      <span className="px-4 py-2 bg-white text-green-800 rounded-lg text-sm shadow-sm border border-green-100">Farm Equipment</span>
                      <span className="px-4 py-2 bg-white text-green-800 rounded-lg text-sm shadow-sm border border-green-100">Post-harvest Expenses</span>
                      <span className="px-4 py-2 bg-white text-green-800 rounded-lg text-sm shadow-sm border border-green-100">Farm Maintenance</span>
                    </>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Process Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="py-4 px-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-4 shadow-sm">
                <FileText className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Application Process</h3>
            </div>
          </div>
          
          <div className="p-6">
            {/* Application Process */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                Application Steps
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <ol className="relative">
                  {ensureArray(loanDetails.applicationProcess).length > 0 ?
                    ensureArray(loanDetails.applicationProcess).map((step, index) => (
                      <li key={index} className="mb-6 last:mb-0 pl-10 pb-6 last:pb-0 border-l-2 border-blue-300 relative">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white text-blue-800 font-medium">
                          {index + 1}
                        </span>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-700">{step}</p>
                        </div>
                      </li>
                    )) :
                    <>
                      <li className="mb-6 pl-10 pb-6 border-l-2 border-blue-300 relative">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white text-blue-800 font-medium">
                          1
                        </span>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-700">Visit the nearest Bank of Baroda branch with required documents</p>
                        </div>
                      </li>
                      <li className="mb-6 pl-10 pb-6 border-l-2 border-blue-300 relative">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white text-blue-800 font-medium">
                          2
                        </span>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-700">Submit the KCC application form along with necessary documentation</p>
                        </div>
                      </li>
                      <li className="mb-6 pl-10 pb-6 border-l-2 border-blue-300 relative">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white text-blue-800 font-medium">
                          3
                        </span>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-700">Bank verification and assessment of credit requirements</p>
                        </div>
                      </li>
                      <li className="pl-10 relative">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white text-blue-800 font-medium">
                          4
                        </span>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-700">Loan approval and issuance of Kisan Credit Card</p>
                        </div>
                      </li>
                    </>
                  }
                </ol>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Processing Fee */}
              {loanDetails.processingFeeNote && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                    Processing Fee
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 h-full">
                    <p className="text-gray-700">{loanDetails.processingFeeNote}</p>
                  </div>
                </div>
              )}

              {/* Renewal Information */}
              {loanDetails.renewalPeriod && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    Renewal Information
                  </h2>
                  <div className="bg-purple-50 rounded-lg p-5 border border-purple-200 h-full">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Renewal Period</p>
                        <p className="text-gray-700">{loanDetails.renewalPeriod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {loanDetails.contactInfo && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-2" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loanDetails.contactInfo.phone && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-800">{loanDetails.contactInfo.phone}</p>
                    </div>
                  )}
                  {loanDetails.contactInfo.email && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-800">{loanDetails.contactInfo.email}</p>
                    </div>
                  )}
                  {loanDetails.contactInfo.website && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                      <a 
                        href={loanDetails.contactInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* FAQ Section (Kept expandable) */}
        {hasFaqs && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="py-4 px-6 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center mr-4 shadow-sm">
                  <HelpCircle className="h-5 w-5 text-amber-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="divide-y divide-gray-200">
                {Object.entries(loanDetails.faq).map(([question, answer], index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <button 
                      onClick={() => toggleFaq(question)}
                      className="w-full flex justify-between items-center p-4 rounded-lg text-left bg-white hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      <span className="font-semibold text-gray-800 pr-8">{question}</span>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedFaqs === question ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaqs === question && (
                      <div className="mt-2 p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-700">{answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with CTA */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600 mb-4 sm:mb-0">
            Ready to move forward with your loan application?
          </p>
          <div className="flex gap-3">
            <button 
              className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-sm transition duration-150"
              onClick={onBack}
            >
              Back
            </button>
            <button 
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition duration-150"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails; 