import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, getAuthHeader } from '../config/api';

// Base API configuration
const api = axios.create({
  ...API_CONFIG,
  withCredentials: false, // Set to false for cross-origin requests without credentials
});

// Add auth token automatically to every request when available
api.interceptors.request.use(request => {
  const authHeaders = getAuthHeader();
  if (Object.keys(authHeaders).length > 0) {
    request.headers = { ...request.headers, ...authHeaders };
  }
  
  console.log('Starting API Request:', request.method, request.url, request.data);
  return request;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  console.log('API Response:', response.status, response.config.url);
  return response;
}, error => {
  console.error('API Response Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error data:', error.response.data);
    console.error('Error status:', error.response.status);
    console.error('Error headers:', error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
  return Promise.reject(error);
});

// API for crop recommendations
export const getCropRecommendations = async (farmerId) => {
  if (!farmerId) {
    console.warn('No farmer ID provided to getCropRecommendations');
    return {
      success: false,
      message: 'No farmer ID provided. Please complete your profile first.',
      recommendations: []
    };
  }

  console.log('Fetching crop recommendations for farmer ID:', farmerId);
  try {
    const response = await api.post(API_ENDPOINTS.CROP_RECOMMENDATIONS, { farmer_id: farmerId });
    return response.data;
  } catch (error) {
    console.error('Error fetching crop recommendations:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to connect to the server. Please try again later.',
      recommendations: []
    };
  }
};

// API for government scheme recommendations
export const getGovernmentSchemes = async (farmerId) => {
  if (!farmerId) {
    console.warn('No farmer ID provided to getGovernmentSchemes');
    return {
      success: false,
      message: 'No farmer ID provided. Please complete your profile first.',
      recommendations: []
    };
  }

  console.log('Fetching government scheme recommendations for farmer ID:', farmerId);
  try {
    const response = await api.get(API_ENDPOINTS.FARMER_SCHEMES(farmerId));
    console.log('Response data:', response.data);
    
    return response.data.map(scheme => {
      // For debugging
      console.log('Processing scheme:', scheme.scheme.name);
      console.log('Matched challenges from API:', scheme.matched_challenges);
      
      return {
        id: scheme.scheme.id,
        name: scheme.scheme.name,
        implementing_agency: scheme.scheme.implementing_agency,
        relevance: scheme.relevance,
        addresses_challenge: scheme.addresses_challenge || '',
        designed_for: scheme.designed_for || '',
        details: {
          eligibility_criteria: scheme.scheme.eligibility_criteria,
          benefits: scheme.scheme.benefits,
          documents_required: scheme.scheme.documents_required,
          application_process: scheme.scheme.application_process,
          district_availability: scheme.scheme.district_availability,
          crop_applicability: scheme.scheme.crop_applicability,
          official_website: scheme.scheme.external_link
        },
        reasons: scheme.reasons || [],
        matched_challenges: scheme.matched_challenges || [] // This should match the backend field name exactly
      };
    });
  } catch (error) {
    console.error('Error fetching government schemes:', error);
    return [];
  }
};

// API for loan options recommendations
export const getLoanOptions = async (farmerId) => {
  if (!farmerId) {
    console.warn('No farmer ID provided to getLoanOptions');
    return {
      success: false,
      message: 'No farmer ID provided. Please complete your profile first.',
      recommendations: []
    };
  }

  console.log('Fetching loan options recommendations for farmer ID:', farmerId);
  try {
    const response = await api.post(API_ENDPOINTS.LOAN_OPTIONS, { farmer_id: farmerId });
    return response.data;
  } catch (error) {
    console.error('Error fetching loan options:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch loan recommendations. Please try again later.',
      recommendations: []
    };
  }
};

// API for technology recommendations
export const getTechnologyRecommendations = async (farmerId) => {
  if (!farmerId) {
    console.warn('No farmer ID provided to getTechnologyRecommendations');
    return {
      success: false,
      message: 'No farmer ID provided. Please complete your profile first.',
      recommendations: []
    };
  }

  console.log('Fetching technology recommendations for farmer ID:', farmerId);
  try {
    const response = await api.post(API_ENDPOINTS.TECHNOLOGY, { farmer_id: farmerId });
    return response.data;
  } catch (error) {
    console.error('Error fetching technology recommendations:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to connect to the server. Please try again later.',
      recommendations: []
    };
  }
};

// Profile API helpers
export const getUserProfile = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load profile data.',
      data: null
    };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put(API_ENDPOINTS.PROFILE, profileData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile.',
      data: null
    };
  }
};

export default api; 