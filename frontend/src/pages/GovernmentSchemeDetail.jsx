import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaFileAlt, FaInfoCircle, FaPhone, FaQuestion, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const GovernmentSchemeDetail = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFaqs, setExpandedFaqs] = useState({});

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/schemes/api/schemes/${schemeId}/`);
        setScheme(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching scheme details:', err);
        setError('Failed to load scheme details. Please try again later.');
        setLoading(false);
      }
    };

    fetchSchemeDetails();
  }, [schemeId]);

  const handleBack = () => {
    navigate('/government-schemes');
  };

  const toggleFaq = (question) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [question]: !prev[question]
    }));
  };

  // Function to render section content
  const renderSectionContent = (sectionId) => {
    if (!scheme) return null;

    switch (sectionId) {
      case 'overview':
        return (
          <div>
            <p className="mb-4">{scheme.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Type</h4>
                <p>{scheme.type}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Status</h4>
                <p>{scheme.status}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">State</h4>
                <p>{scheme.state}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Target Group</h4>
                <p>{scheme.targetGroup}</p>
              </div>
            </div>
          </div>
        );
      
      case 'eligibility':
        return (
          <div>
            {scheme.eligibility && typeof scheme.eligibility === 'object' ? (
              <ul className="list-disc pl-5 space-y-2">
                {Object.entries(scheme.eligibility).map(([key, value], index) => (
                  <li key={index}>
                    <span className="font-medium">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{scheme.eligibility || 'No eligibility information available.'}</p>
            )}
          </div>
        );
      
      case 'benefits':
        return (
          <div>
            {scheme.benefits && typeof scheme.benefits === 'object' ? (
              <ul className="list-disc pl-5 space-y-2">
                {Object.entries(scheme.benefits).map(([key, value], index) => (
                  <li key={index}>
                    <span className="font-medium">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{scheme.benefits || 'No benefits information available.'}</p>
            )}
          </div>
        );
      
      case 'application':
        return (
          <div>
            {scheme.howToApply && typeof scheme.howToApply === 'object' ? (
              <div>
                <ol className="list-decimal pl-5 space-y-3 mb-6">
                  {Object.entries(scheme.howToApply).map(([key, value], index) => (
                    <li key={index} className="pl-2">
                      {value}
                    </li>
                  ))}
                </ol>
                
                <h4 className="text-lg font-medium mb-3">Required Documents</h4>
                {scheme.requiredDocuments && typeof scheme.requiredDocuments === 'object' ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {Object.entries(scheme.requiredDocuments).map(([key, value], index) => (
                      <li key={index}>{value}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{scheme.requiredDocuments || 'No document information available.'}</p>
                )}
              </div>
            ) : (
              <p>{scheme.howToApply || 'No application information available.'}</p>
            )}
          </div>
        );
      
      case 'contact':
        return (
          <div>
            {scheme.contact && typeof scheme.contact === 'object' ? (
              <div className="space-y-4">
                {Object.entries(scheme.contact).map(([key, value], index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{key}</h4>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{scheme.contact || 'No contact information available.'}</p>
            )}
          </div>
        );
      
      case 'faq':
        return (
          <div>
            {scheme.faq && typeof scheme.faq === 'object' ? (
              <div className="space-y-4">
                {Object.entries(scheme.faq).map(([question, answer], index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(question)}
                      className="w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-medium">{question}</span>
                      {expandedFaqs[question] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {expandedFaqs[question] && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200">
                        <p>{answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>{scheme.faq || 'No FAQ information available.'}</p>
            )}
          </div>
        );
      
      default:
        return <div>Select a section to view information</div>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-6"
        >
          <FaArrowLeft /> Back to Schemes
        </button>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : scheme ? (
          <div>
            {/* Scheme header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{scheme.name}</h1>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  scheme.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {scheme.status}
                </span>
              </div>
              <p className="text-gray-500 mt-2">{scheme.type} • {scheme.state}</p>
            </div>
            
            {/* Static sections */}
            <div className="space-y-6">
              {/* Overview Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900">
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="text-green-600" />
                    <h3 className="text-lg font-semibold">Overview</h3>
                  </div>
                </div>
                <div className="p-4">
                  {renderSectionContent('overview')}
                </div>
              </div>

              {/* Eligibility Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600" />
                    <h3 className="text-lg font-semibold">Eligibility Criteria</h3>
                  </div>
                </div>
                <div className="p-4">
                  {renderSectionContent('eligibility')}
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-purple-600" />
                    <h3 className="text-lg font-semibold">Benefits</h3>
                  </div>
                </div>
                <div className="p-4">
                  {renderSectionContent('benefits')}
                </div>
              </div>

              {/* Application Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900">
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-yellow-600" />
                    <h3 className="text-lg font-semibold">How to Apply</h3>
                  </div>
                </div>
                <div className="p-4">
                  {renderSectionContent('application')}
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-red-600" />
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                  </div>
                </div>
                <div className="p-4">
                  {renderSectionContent('contact')}
                </div>
              </div>

              {/* FAQ Section - Kept expandable */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900">
                  <div className="flex items-center gap-2">
                    <FaQuestion className="text-indigo-600" />
                    <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                  </div>
                </div>
                <div className="p-4">
                  {renderSectionContent('faq')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            Scheme not found.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GovernmentSchemeDetail; 