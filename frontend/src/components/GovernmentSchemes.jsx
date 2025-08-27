import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Filter, Search, ChevronRight, ExternalLink, Clock, ChevronDown, X } from 'lucide-react';

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeTypes, setSchemeTypes] = useState([]);
  const [schemeStates, setSchemeStates] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    state: '',
    status: '',
    search: '',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSchemeDetails, setSelectedSchemeDetails] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for FAQ accordions
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // State for sections expansion in detailed view
  const [expandedSections, setExpandedSections] = useState({
    eligibility: true, 
    benefits: true,
    application: true,
    documents: true,
    contact: true,
    faq: false
  });

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    if (sectionId === 'faq') {
      setExpandedSections(prev => ({
        ...prev,
        faq: !prev.faq
      }));
    }
    // Other sections are no longer toggleable
  };

  // Initialize all sections to be expanded by default except FAQ
  useEffect(() => {
    setExpandedSections({
      eligibility: true, 
      benefits: true,
      application: true,
      documents: true,
      contact: true,
      faq: false
    });
  }, []);

  // Placeholder for additional schemes
  const additionalSchemes = [
    {
      scheme_id: 'pmksy',
      name: 'Pradhan Mantri Krishi Sinchai Yojana (PMKSY)',
      type: 'Irrigation',
      description: 'A centrally sponsored scheme aimed at expanding cultivated area with assured irrigation, reducing wastage of water, and improving water use efficiency.',
      state: 'CENTRAL',
      target_group: 'Farmers requiring irrigation support',
      status: 'Active'
    },
    {
      scheme_id: 'pmmatsya',
      name: 'Pradhan Mantri Matsya Sampada Yojana',
      type: 'Fisheries',
      description: 'A scheme to boost fish production and aquaculture in the country through various interventions to promote sustainable and responsible development of fisheries sector.',
      state: 'CENTRAL',
      target_group: 'Fishermen and fish farmers',
      status: 'Active'
    },
    {
      scheme_id: 'e-nam',
      name: 'e-National Agriculture Market',
      type: 'Market',
      description: 'A pan-India electronic trading portal for agricultural commodities to create a unified national market for agricultural commodities.',
      state: 'CENTRAL',
      target_group: 'Farmers and traders',
      status: 'Active'
    }
  ];

  // Fetch schemes from the API
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        console.log('Fetching schemes data...');
        setLoading(true);
        setError(null);
        
        // Use the correct endpoint from myapp backend
        try {
          // This endpoint maps to myapp/views.py -> api_gov_schemes which returns data from the myapp model
          const response = await axios.get('/api/gov-schemes/');
          console.log('Successfully fetched schemes data from gov-schemes endpoint:', response.data);
          
          // Extract schemes from the response
          let fetchedSchemes = [];
          
          if (response.data.schemes && Array.isArray(response.data.schemes)) {
            fetchedSchemes = response.data.schemes;
            console.log('Using schemes array from response data:', fetchedSchemes.length);
          } else {
            console.warn('Unexpected data format, no schemes array found');
            // Try to extract schemes from other potential formats
            if (Array.isArray(response.data)) {
              fetchedSchemes = response.data;
              console.log('Using response data as array:', fetchedSchemes.length);
            } else if (response.data && typeof response.data === 'object') {
              // If data is directly in the response.data object
              console.log('Extracting schemes from response data object');
              fetchedSchemes = Object.values(response.data).filter(item => 
                item && typeof item === 'object' && (item.scheme_id || item.name)
              );
            }
          }
          
          console.log('Raw fetched schemes:', fetchedSchemes);
          
          // Make sure schemes have all required fields with defaults for missing values
          fetchedSchemes = fetchedSchemes.map(scheme => ({
            scheme_id: scheme.scheme_id || `scheme-${Math.random().toString(36).substr(2, 9)}`,
            name: scheme.name || 'Unnamed Scheme',
            type: scheme.type || 'Unspecified',
            description: scheme.description || 'No description available',
            state: scheme.state || 'CENTRAL',
            target_group: scheme.target_group || 'All Farmers', 
            status: scheme.status || 'Active'
          }));
          
          // Only use additional schemes if no data from API
          if (fetchedSchemes.length === 0) {
            console.warn('No schemes returned from API, using fallback data');
            fetchedSchemes = additionalSchemes;
          }
          
          // Remove any duplicates by scheme_id
          const uniqueSchemes = Array.from(new Map(fetchedSchemes.map(scheme => [scheme.scheme_id, scheme])).values());
          console.log(`Fetched ${uniqueSchemes.length} unique schemes`);
          
          setSchemes(uniqueSchemes);
          setFilteredSchemes(uniqueSchemes);
          
          // Extract unique scheme types and states
          const uniqueTypes = [...new Set(uniqueSchemes.map(scheme => scheme.type || 'Unspecified'))];
          const uniqueStates = [...new Set(uniqueSchemes.map(scheme => scheme.state || 'Unknown'))];
          
          console.log('Extracted unique types:', uniqueTypes);
          console.log('Extracted unique states:', uniqueStates);
          
          setSchemeTypes(uniqueTypes);
          setSchemeStates(uniqueStates);
          
          // Get filter options if provided by the API
          if (response.data.filterOptions) {
            if (response.data.filterOptions.types) {
              setSchemeTypes(response.data.filterOptions.types);
            }
            if (response.data.filterOptions.states) {
              setSchemeStates(response.data.filterOptions.states);
            }
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching from primary endpoint:', err);
          
          // Try the Django admin backend as a fallback
          try {
            const adminResponse = await axios.get('http://localhost:8000/admin/myapp/governmentscheme/');
            console.log('Fetched from admin endpoint:', adminResponse.data);
            
            // Process admin data if needed
            // ...
            
            setLoading(false);
          } catch (adminErr) {
            console.error('Error fetching from admin endpoint:', adminErr);
            
            // Fall back to additional schemes if all API attempts fail
            setSchemes(additionalSchemes);
            setFilteredSchemes(additionalSchemes);
            setSchemeTypes(['Irrigation', 'Fisheries', 'Market']);
            setSchemeStates(['CENTRAL']);
            setError('Could not connect to server. Showing sample schemes.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error in fetchSchemes:', err);
        // Fall back to additional schemes if API fails
        setSchemes(additionalSchemes);
        setFilteredSchemes(additionalSchemes);
        setSchemeTypes(['Irrigation', 'Fisheries', 'Market']);
        setSchemeStates(['CENTRAL']);
        setError('Could not connect to server. Showing sample schemes.');
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search query changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  // Apply filters
  useEffect(() => {
    if (!schemes.length) return;
    
    let result = [...schemes];
    console.log('Applying filters:', filters);
    console.log('Schemes before filtering:', schemes.length);
    
    if (filters.type) {
      console.log('Filtering by type:', filters.type);
      result = result.filter(scheme => {
        // Special case for unspecified type
        if (filters.type === 'Unspecified') {
          return !scheme.type || scheme.type.trim() === '';
        }
        return scheme.type && scheme.type.toLowerCase() === filters.type.toLowerCase();
      });
    }
    
    if (filters.state) {
      console.log('Filtering by state:', filters.state);
      result = result.filter(scheme => {
        // Special case for unknown state
        if (filters.state === 'Unknown') {
          return !scheme.state || scheme.state.trim() === '';
        }
        return scheme.state && scheme.state.toLowerCase() === filters.state.toLowerCase();
      });
    }
    
    if (filters.status) {
      console.log('Filtering by status:', filters.status);
      result = result.filter(scheme => {
        // Special case for unknown status
        if (filters.status === 'Unknown') {
          return !scheme.status || scheme.status.trim() === '';
        }
        return scheme.status && scheme.status.toLowerCase() === filters.status.toLowerCase();
      });
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      console.log('Filtering by search term:', searchTerm);
      
      if (searchTerm) {
        result = result.filter(scheme => {
          // Check each property exists before using toLowerCase()
          const nameMatch = scheme.name ? scheme.name.toLowerCase().includes(searchTerm) : false;
          const descMatch = scheme.description ? scheme.description.toLowerCase().includes(searchTerm) : false;
          const groupMatch = scheme.target_group ? scheme.target_group.toLowerCase().includes(searchTerm) : false;
          const typeMatch = scheme.type ? scheme.type.toLowerCase().includes(searchTerm) : false;
          const stateMatch = scheme.state ? scheme.state.toLowerCase().includes(searchTerm) : false;
          
          return nameMatch || descMatch || groupMatch || typeMatch || stateMatch;
        });
      }
    }
    
    console.log('Schemes after filtering:', result.length);
    setFilteredSchemes(result);
  }, [filters, schemes]);

  // Fetch detailed scheme info
  const fetchSchemeDetails = async (schemeId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching details for scheme ID: ${schemeId}`);
      
      // Always try to fetch from the API first
      let response;
      let apiSuccess = false;
      
      try {
        // Use the working endpoint first
        console.log(`Making API request to: /api/gov-schemes/${schemeId}/`);
        response = await axios.get(`/api/gov-schemes/${schemeId}/`);
        console.log('API response from gov-schemes endpoint:', response.data);
        apiSuccess = true;
      } catch (err1) {
        console.warn(`Primary endpoint failed: ${err1.message}`);
        
        // Try other endpoints as fallback
        try {
          console.log(`Trying alternative endpoint: /api/schemes/${schemeId}/`);
          response = await axios.get(`/api/schemes/${schemeId}/`);
          apiSuccess = true;
        } catch (err2) {
          console.warn(`Secondary endpoint failed: ${err2.message}`);
          
          try {
            console.log(`Trying final fallback: /schemes/api/schemes/${schemeId}/`);
            response = await axios.get(`/schemes/api/schemes/${schemeId}/`);
            apiSuccess = true;
          } catch (err3) {
            console.error('All API endpoint attempts failed:', err3);
            throw new Error(`Could not connect to API: ${err3.message}`);
          }
        }
      }
      
      if (apiSuccess) {
        // Process API response
        let schemeData;
        
        // Check if response has expected structure
        if (response.data && response.data.scheme) {
          console.log('Setting scheme details from API response');
          schemeData = response.data.scheme;
        } else if (response.data) {
          // If the API returns data directly without a 'scheme' wrapper
          console.log('Processing direct API response data');
          schemeData = response.data;
        } else {
          throw new Error('Invalid response format from API');
        }
        
        // Ensure we have valid JSON structure for all fields that expect JSON
        const ensureValidJson = (field, defaultValue) => {
          if (!schemeData[field]) {
            return defaultValue;
          }
          
          // Field exists, ensure it's proper format
          if (typeof schemeData[field] === 'string') {
            try {
              // Try to parse if it's a string
              return JSON.parse(schemeData[field]);
            } catch (err) {
              console.warn(`Failed to parse ${field} as JSON, using default value`);
              return defaultValue;
            }
          }
          
          // Return as is if already an object
          return schemeData[field];
        };
        
        // Process each complex field to ensure valid structure
        const processedScheme = {
          ...schemeData,
          eligibility: ensureValidJson('eligibility', { criteria: [] }),
          benefits: ensureValidJson('benefits', []),
          how_to_apply: ensureValidJson('how_to_apply', { steps: [], online: {} }),
          required_documents: ensureValidJson('required_documents', []),
          contact: ensureValidJson('contact', {}),
          faq: ensureValidJson('faq', [])
        };
        
        console.log('Processed scheme data:', processedScheme);
        setSelectedSchemeDetails(processedScheme);
        setShowDetails(true);
      } else {
        // If API fetching completely failed, check if it's an additional scheme as fallback
        const additionalScheme = additionalSchemes.find(scheme => scheme.scheme_id === schemeId);
        
        if (additionalScheme) {
          console.warn('API failed, falling back to sample data (for development only)');
          // Use additional scheme as fallback for development
          const detailedScheme = {
            ...additionalScheme,
            eligibility: {
              "residency": "Resident of India",
              "other": [
                "Must be a farmer with valid land records",
                "Must follow sustainable agricultural practices",
                "Must have a bank account for direct benefit transfer"
              ]
            },
            benefits: [
              "Financial assistance for implementing modern irrigation systems",
              "Technical support through trained professionals",
              "Training programs on water conservation methods"
            ],
            how_to_apply: {
              "mode": "Online and Offline Application",
              "steps": [
                "Submit application at local agricultural office",
                "Provide necessary documentation including land records",
                "Complete verification process"
              ],
              "portal": "Agricultural Department Portal",
              "check_status_link": "https://example.gov.in/check-status",
              "help_link": "https://example.gov.in/help",
              "application_needed": true,
              "deadline": "Open throughout the year"
            },
            required_documents: [
              "Land ownership documents",
              "Identity proof (Aadhaar card)",
              "Bank account details",
              "Passport-sized photographs"
            ],
            contact: {
              "helpline": "1800-XXX-XXXX",
              "email": "support@scheme.gov.in",
              "whatsapp": "9999XXXXXX"
            },
            faq: [
              {
                "q": "How long does the application process take?",
                "a": "Typically 2-4 weeks from submission to approval."
              },
              {
                "q": "Can I apply online?",
                "a": "Yes, applications can be submitted through the official portal."
              }
            ],
            language_support: ["Hindi", "English"]
          };
          
          setSelectedSchemeDetails(detailedScheme);
          setShowDetails(true);
        } else {
          throw new Error('Scheme not found in API or fallback data');
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scheme details:', err);
      setError(`Failed to load scheme details: ${err.message || 'Please try again later.'}`);
      setLoading(false);
      
      // Use a minimal fallback with error message
      const fallbackScheme = {
        scheme_id: schemeId,
        name: "Error Loading Scheme",
        type: "Unknown",
        description: `Failed to load scheme details: ${err.message || 'Unknown error occurred'}. Please try again later.`,
        target_group: "N/A",
        status: "Unknown",
        state: "N/A",
        eligibility: {
          "residency": "Information unavailable due to server error",
          "other": ["Information unavailable due to server error"]
        },
        benefits: ["Information unavailable due to server error"],
        how_to_apply: { 
          "mode": "Information unavailable", 
          "steps": ["Please try again later"],
          "portal": "Service temporarily unavailable",
          "application_needed": false,
          "deadline": "N/A"
        },
        required_documents: ["Information unavailable due to server error"],
        contact: {
          "helpline": "N/A",
          "email": "N/A",
          "whatsapp": "N/A"
        },
        faq: [
          {
            "q": "Why am I seeing this error?",
            "a": "There was an issue connecting to the database. Please try again later or contact support if the issue persists."
          }
        ],
        language_support: ["N/A"]
      };
      
      setSelectedSchemeDetails(fallbackScheme);
      setShowDetails(true);
    }
  };

  // Handle view details click
  const viewDetails = (schemeId) => {
    // Scroll to top when viewing scheme details
    window.scrollTo(0, 0);
    fetchSchemeDetails(schemeId);
  };

  // Reset all filters
  const resetFilters = () => {
    console.log('Resetting all filters');
    setFilters({
      type: '',
      state: '',
      status: '',
      search: '',
    });
    setSearchQuery('');
    // No need for setTimeout, the useEffect will handle updating filteredSchemes
  };

  // Handle back from scheme details
  const handleBackFromDetails = () => {
    setShowDetails(false);
    setSelectedSchemeDetails(null);
    // Delay to ensure smooth transition
    setTimeout(() => {
      // Restore scroll position after going back
      const scrollPosition = sessionStorage.getItem('schemeListScrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
      }
    }, 100);
  };

  // Save scroll position before viewing details
  const saveScrollPosition = () => {
    sessionStorage.setItem('schemeListScrollPosition', window.pageYOffset);
  };

  // Get scheme badge color based on type
  const getSchemeTypeBadgeClass = (type) => {
    if (!type) {
      return 'bg-gray-100 text-gray-800'; // Default for undefined/null types
    }
    
    switch (type.toLowerCase()) {
      case 'subsidy':
        return 'bg-emerald-100 text-emerald-800';
      case 'loan':
        return 'bg-blue-100 text-blue-800';
      case 'grant':
        return 'bg-purple-100 text-purple-800';
      case 'insurance':
        return 'bg-yellow-100 text-yellow-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'irrigation':
        return 'bg-cyan-100 text-cyan-800';
      case 'fisheries':
        return 'bg-teal-100 text-teal-800';
      case 'market':
        return 'bg-indigo-100 text-indigo-800';
      case 'financial support':
        return 'bg-green-100 text-green-800';
      case 'crop insurance':
        return 'bg-orange-100 text-orange-800';
      case 'agricultural support':
        return 'bg-lime-100 text-lime-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Helper function to render eligibility data regardless of format
  const renderEligibilityData = () => {
    if (!selectedSchemeDetails || !selectedSchemeDetails.eligibility) {
      return <p className="text-gray-600">Eligibility criteria not specified in database</p>;
    }
    
    // Handle different eligibility formats
    if (Array.isArray(selectedSchemeDetails.eligibility)) {
      // Direct array format
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {selectedSchemeDetails.eligibility.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (selectedSchemeDetails.eligibility.criteria && Array.isArray(selectedSchemeDetails.eligibility.criteria)) {
      // Object with criteria array
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {selectedSchemeDetails.eligibility.criteria.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (typeof selectedSchemeDetails.eligibility === 'object') {
      // Object with various properties
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {Object.entries(selectedSchemeDetails.eligibility).map(([key, value], index) => {
            if (Array.isArray(value)) {
              return value.map((item, idx) => (
                <li key={`${index}-${idx}`}>{item}</li>
              ));
            } else if (typeof value === 'string') {
              return <li key={index}>{key}: {value}</li>;
            }
            return null;
          }).flat().filter(Boolean)}
        </ul>
      );
    }
    
    // Fallback for unexpected formats
    return <p className="text-gray-600">Eligibility criteria format not recognized</p>;
  };
  
  // Helper function to render benefits data regardless of format
  const renderBenefitsData = () => {
    if (!selectedSchemeDetails || !selectedSchemeDetails.benefits) {
      return <p className="text-gray-600">Benefits not specified in database</p>;
    }
    
    // Handle different benefits formats
    if (Array.isArray(selectedSchemeDetails.benefits)) {
      // Direct array format
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {selectedSchemeDetails.benefits.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (selectedSchemeDetails.benefits.items && Array.isArray(selectedSchemeDetails.benefits.items)) {
      // Object with items array
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {selectedSchemeDetails.benefits.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    
    // Fallback for unexpected formats
    return <p className="text-gray-600">Benefits format not recognized</p>;
  };

  // Helper function to render required documents data regardless of format
  const renderRequiredDocumentsData = () => {
    if (!selectedSchemeDetails || !selectedSchemeDetails.required_documents) {
      return <p className="text-gray-600">Required documents not specified in database</p>;
    }
    
    // Handle different required_documents formats
    if (Array.isArray(selectedSchemeDetails.required_documents)) {
      // Direct array format
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {selectedSchemeDetails.required_documents.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (selectedSchemeDetails.required_documents.items && 
               Array.isArray(selectedSchemeDetails.required_documents.items)) {
      // Object with items array
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          {selectedSchemeDetails.required_documents.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    
    // Fallback for unexpected formats
    return <p className="text-gray-600">Required documents format not recognized</p>;
  };

  // Helper function to render how to apply data regardless of format
  const renderHowToApplyData = () => {
    if (!selectedSchemeDetails || !selectedSchemeDetails.how_to_apply) {
      return <p className="text-gray-600">Application process not specified in database</p>;
    }
    
    const howToApply = selectedSchemeDetails.how_to_apply;
    
    return (
      <div>
        {/* Display application mode if available */}
        {howToApply.mode && (
          <div className="mb-4">
            <h3 className="font-medium text-teal-800 mb-2">Mode</h3>
            <p className="text-gray-700">{howToApply.mode}</p>
          </div>
        )}
        
        {/* Display steps if available */}
        {howToApply.steps && Array.isArray(howToApply.steps) && howToApply.steps.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-teal-800 mb-3">Application Process</h3>
            <ol className="space-y-4">
              {howToApply.steps.map((step, index) => (
                <li key={index} className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <div className="pt-1">
                    <p className="text-gray-700">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        
        {/* Display deadline if available */}
        {howToApply.deadline && (
          <div className="mb-4">
            <h3 className="font-medium text-teal-800 mb-2">Deadline</h3>
            <p className="text-gray-700">{howToApply.deadline}</p>
          </div>
        )}
        
        {/* Display portal info if available */}
        {howToApply.portal && (
          <div className="mb-4">
            <h3 className="font-medium text-teal-800 mb-2">Portal</h3>
            <p className="text-gray-700">{howToApply.portal}</p>
          </div>
        )}
        
        {/* Display links if available */}
        <div className="flex flex-wrap gap-3 mt-4">
          {howToApply.check_status_link && (
            <a 
              href={howToApply.check_status_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Check Status
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          )}
          
          {howToApply.help_link && (
            <a 
              href={howToApply.help_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-teal-100 text-teal-800 hover:bg-teal-200 px-4 py-2 rounded-md transition-colors"
            >
              Help Portal
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    );
  };

  // Display loading state
  if (loading && schemes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          <p className="text-gray-600 mt-2">Loading government schemes...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error && schemes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If showing detailed view of a scheme
  if (showDetails && selectedSchemeDetails) {
    // Define the sections for our accordion UI
    const schemeSections = [
      {
        id: 'eligibility',
        title: 'Eligibility Requirements',
        icon: (
          <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        content: renderEligibilityData(),
        bgColor: 'bg-purple-50'
      },
      {
        id: 'benefits',
        title: 'Benefits',
        icon: (
          <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        content: renderBenefitsData(),
        bgColor: 'bg-indigo-50'
      },
      {
        id: 'application',
        title: 'How to Apply',
        icon: (
          <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        content: renderHowToApplyData(),
        bgColor: 'bg-teal-50'
      },
      {
        id: 'documents',
        title: 'Required Documents',
        icon: (
          <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        content: renderRequiredDocumentsData(),
        bgColor: 'bg-orange-50'
      },
      {
        id: 'contact',
        title: 'Contact Information',
        icon: (
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        ),
        content: (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedSchemeDetails.contact && (selectedSchemeDetails.contact.phone || selectedSchemeDetails.contact.helpline) && (
              <div className="flex items-start">
                <div className="rounded-full bg-blue-200 p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.948.684l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Helpline</h3>
                  <p className="text-gray-700">{selectedSchemeDetails.contact.phone || selectedSchemeDetails.contact.helpline}</p>
                </div>
              </div>
            )}

            {selectedSchemeDetails.contact && selectedSchemeDetails.contact.email && (
              <div className="flex items-start">
                <div className="rounded-full bg-blue-200 p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Email</h3>
                  <p className="text-gray-700">{selectedSchemeDetails.contact.email}</p>
                </div>
              </div>
            )}

            {selectedSchemeDetails.contact && (selectedSchemeDetails.contact.website || selectedSchemeDetails.contact.help_link) && (
              <div className="flex items-start">
                <div className="rounded-full bg-blue-200 p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Website</h3>
                  <a 
                    href={selectedSchemeDetails.contact.website || selectedSchemeDetails.contact.help_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {selectedSchemeDetails.contact.website || selectedSchemeDetails.contact.help_link}
                  </a>
                </div>
              </div>
            )}

            {(!selectedSchemeDetails.contact || 
              (!selectedSchemeDetails.contact.phone && 
              !selectedSchemeDetails.contact.helpline &&
              !selectedSchemeDetails.contact.email && 
              !selectedSchemeDetails.contact.website && 
              !selectedSchemeDetails.contact.help_link)) && (
              <div className="col-span-full">
                <p className="text-gray-500 italic">Contact information not available in database</p>
              </div>
            )}
          </div>
        ),
        bgColor: 'bg-blue-50'
      }
    ];

    // Define FAQ section separately for consistency in the UI
    const faqSection = {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: (
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: null, // We'll handle this specially
      bgColor: 'bg-gray-50'
    };

    return (
      <div className="p-4 max-w-full mx-auto animate-fadeIn">
        <div className="bg-white shadow rounded-lg mb-4 p-4 flex justify-between items-center sticky top-0 z-10">
          <button
            onClick={handleBackFromDetails}
            className="inline-flex items-center bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Schemes
          </button>
          
          <span className="inline-flex bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm">
            Scheme ID: {selectedSchemeDetails.scheme_id}
          </span>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden animate-fadeIn">
          {/* Scheme Header with gradient background */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{selectedSchemeDetails.name}</h1>
                <p className="text-green-100">
                  {selectedSchemeDetails.state === 'CENTRAL' ? 'Central Government' : selectedSchemeDetails.state} • Status: 
                  <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSchemeDetails.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {selectedSchemeDetails.status}
                  </span>
                </p>
              </div>
              <div className={`self-start px-4 py-2 rounded-md text-sm font-medium ${getSchemeTypeBadgeClass(selectedSchemeDetails.type)} border border-white/20`}>
                {selectedSchemeDetails.type}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
                <h2 className="text-lg font-medium text-green-800 mb-2">Description</h2>
                <p className="text-gray-700">{selectedSchemeDetails.description}</p>
              </div>

              {/* Target Group */}
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-lg font-medium text-blue-800 mb-2">Target Group</h2>
                <p className="text-gray-700">{selectedSchemeDetails.target_group}</p>
              </div>

              {/* Quick Info - Generated from database data when available */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 flex items-center mb-2">
                    <span className="bg-purple-100 text-purple-700 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </span>
                    Documentation
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedSchemeDetails.required_documents && 
                     Array.isArray(selectedSchemeDetails.required_documents) &&
                     selectedSchemeDetails.required_documents.length > 0 
                      ? `${selectedSchemeDetails.required_documents.length} document(s) required` 
                      : "Documentation requirements available in details below"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 flex items-center mb-2">
                    <span className="bg-yellow-100 text-yellow-700 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Processing Time
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedSchemeDetails.processing_time || 
                     (selectedSchemeDetails.faq && 
                      Array.isArray(selectedSchemeDetails.faq) &&
                      selectedSchemeDetails.faq.find(q => 
                        (q.question || q.q || "").toLowerCase().includes('time') || 
                        (q.question || q.q || "").toLowerCase().includes('long'))?.answer) || 
                     "Check with the respective department for processing time"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 flex items-center mb-2">
                    <span className="bg-red-100 text-red-700 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Security
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedSchemeDetails.security_info || "All personal information is securely handled"}
                  </p>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-4">
                {schemeSections.map(section => (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`px-6 py-4 ${section.bgColor} flex items-center`}>
                      <span className="mr-3">{section.icon}</span>
                      <h2 className="text-lg font-medium text-gray-800">{section.title}</h2>
                    </div>
                    <div className="px-6 py-4">
                      {section.content}
                    </div>
                  </div>
                ))}

                {/* FAQ Section - special handling for the collapsible FAQ part */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('faq')}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{faqSection.icon}</span>
                      <h2 className="text-lg font-medium text-gray-800">{faqSection.title}</h2>
                    </div>
                    <svg 
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedSections.faq ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`transition-all duration-300 ${expandedSections.faq ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className={`px-6 py-4 ${faqSection.bgColor}`}>
                      {selectedSchemeDetails.faq ? (
                        <div className="space-y-4">
                          {(() => {
                            // Handle both array format and object format with questions property
                            const faqItems = Array.isArray(selectedSchemeDetails.faq) 
                              ? selectedSchemeDetails.faq 
                              : (selectedSchemeDetails.faq.questions || []);
                            
                            if (faqItems.length > 0) {
                              return (
                                <div className="divide-y divide-gray-200">
                                  {faqItems.map((faqItem, index) => (
                                    <div key={index} className="py-4">
                                      <button
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                        className="flex justify-between items-center w-full text-left focus:outline-none"
                                      >
                                        <h3 className="text-lg font-medium text-gray-800">
                                          {faqItem.question || faqItem.q}
                                        </h3>
                                        <span className="ml-6 flex-shrink-0">
                                          <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedFaq === index ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                          </svg>
                                        </span>
                                      </button>
                                      <div className={`mt-2 transition-all duration-200 overflow-hidden ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-gray-600 px-2 pt-2 pb-1">
                                          {faqItem.answer || faqItem.a}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return <p className="text-gray-500 italic">No FAQs available for this scheme</p>;
                            }
                          })()}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No FAQs available for this scheme</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FAQ Section - Display from selectedSchemeDetails when available
  const renderFaqSection = () => {
    // Common FAQ data - shown on main listing page
    const commonFaqs = [
      {
        question: "How do I apply for government schemes?",
        answer: "You can apply for government schemes by visiting the respective department's website or visiting your nearest government office. Most schemes require basic documentation like identity proof, address proof, and income certificates."
      },
      {
        question: "What are the eligibility criteria for these schemes?",
        answer: "Eligibility criteria vary by scheme. They may be based on factors like income level, land holding, age, gender, or region. View the details of each scheme to know the specific eligibility requirements."
      },
      {
        question: "Are there any deadlines for applying to these schemes?",
        answer: "Yes, most schemes have application deadlines. Some schemes accept applications year-round, while others have specific application windows. Check the specific scheme details for deadline information."
      },
      {
        question: "How long does the approval process take?",
        answer: "The approval timeline varies by scheme. Simple schemes may take a few weeks while more complex ones could take 1-2 months. Check with the respective department for specific timelines."
      }
    ];
    
    // Helper to toggle FAQ item
    const toggleFaq = (index) => {
      setExpandedFaq(expandedFaq === index ? null : index);
    };
    
    if (showDetails && selectedSchemeDetails && selectedSchemeDetails.faq) {
      // Handle both array format and object format with questions property
      const faqItems = Array.isArray(selectedSchemeDetails.faq) 
        ? selectedSchemeDetails.faq 
        : (selectedSchemeDetails.faq.questions || []);
      
      if (faqItems.length > 0) {
        return (
          <div className="bg-white shadow-sm rounded-lg p-5 mt-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">Frequently Asked Questions</h2>
            <div className="divide-y divide-gray-200">
              {faqItems.map((faqItem, index) => (
                <div key={index} className="py-4">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full text-left focus:outline-none"
                  >
                    <h3 className="text-lg font-medium text-gray-800">
                      {faqItem.question || faqItem.q}
                    </h3>
                    <span className="ml-6 flex-shrink-0">
                      <svg className={`w-5 h-5 text-green-500 transform transition-transform ${expandedFaq === index ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </span>
                  </button>
                  <div className={`mt-2 transition-all duration-200 overflow-hidden ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-600 px-2 pt-2 pb-1">
                      {faqItem.answer || faqItem.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    // Default FAQ shown on main listing page
    return (
      <div className="bg-white shadow-sm rounded-lg p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4">Frequently Asked Questions</h2>
        
        <div className="divide-y divide-gray-200">
          {commonFaqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full text-left focus:outline-none"
              >
                <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                <span className="ml-6 flex-shrink-0">
                  <svg className={`w-5 h-5 text-green-500 transform transition-transform ${expandedFaq === index ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </span>
              </button>
              <div className={`mt-2 transition-all duration-200 overflow-hidden ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-600 px-2 pt-2 pb-1">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main view - scheme listing with filters
  return (
    <div className="p-4 w-full mx-auto bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Government Schemes</h1>
        
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-sm">
          <Clock className="h-5 w-5 mr-2" />
          <span>Show Recent Updates</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for schemes by name, type, or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-3"
          />
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-700 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'transform rotate-180' : ''}`} />
        </button>
        
        <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200">
          Showing {filteredSchemes.length} of {schemes.length} schemes
        </div>
      </div>

      {/* Filters - Collapsible */}
      {showFilters && (
        <div className="bg-white shadow-sm rounded-lg p-5 mb-6 animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-green-800">Filter Schemes</h2>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="mr-2">🏢</span> Select State
              </label>
              <select 
                name="state"
                value={filters.state}
                onChange={handleFilterChange}
                className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All States</option>
                {schemeStates && schemeStates.length > 0 ? (
                  schemeStates.map((state, index) => (
                    <option key={index} value={state}>
                      {state === 'CENTRAL' ? 'Central Government' : state}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading states...</option>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="mr-2">🔖</span> Scheme Type
              </label>
              <select 
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Scheme Types</option>
                {schemeTypes && schemeTypes.length > 0 ? (
                  [...new Set(schemeTypes.filter(Boolean).concat(['Unspecified']))].map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))
                ) : (
                  <option disabled>Loading types...</option>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="mr-2">🔍</span> Status
              </label>
              <select 
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                {schemes && schemes.length > 0 ? (
                  [...new Set(schemes.map(scheme => scheme.status))]
                    .filter(Boolean)
                    .map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))
                ) : (
                  <>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </>
                )}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={resetFilters}
              className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={() => {/* Apply filters is automatic */}}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Scheme Cards - Changed to always show 3 per row */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.length > 0 ? filteredSchemes.map((scheme, index) => (
          <div 
            key={scheme.scheme_id || index} 
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{scheme.name || 'Unnamed Scheme'}</h3>
                  <p className="text-sm text-gray-500">
                    {scheme.state === 'CENTRAL' ? 'Central Government' : scheme.state || 'Unknown State'}
                  </p>
                </div>
                
                <div className={`flex-shrink-0 px-3 py-1 text-xs rounded-full font-medium ${getSchemeTypeBadgeClass(scheme.type)}`}>
                  {scheme.type || 'Unspecified'}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4 h-16 overflow-hidden">
                <p className="text-sm text-gray-600 line-clamp-3">{scheme.description || 'No description available'}</p>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Target Group</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{scheme.target_group || 'Not specified'}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    scheme.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {scheme.status || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <button 
                  onClick={() => {
                    saveScrollPosition();
                    viewDetails(scheme.scheme_id);
                  }}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center bg-white rounded-lg shadow-sm">
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">No schemes found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Update FAQ section to match the new style */}
      {!showDetails && (
        <div className="mt-8">
          {renderFaqSection()}
        </div>
      )}
    </div>
  );
};

// Add animations to your CSS
const styles = `
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { 
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

export default GovernmentSchemes;