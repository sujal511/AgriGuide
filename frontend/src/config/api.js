// API configuration
const isDev = import.meta.env.MODE === 'development';
const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:8000' : '');

export const API_ENDPOINTS = {
    // Auth endpoints
    REGISTER: `${API_BASE_URL}/api/register`, 
    LOGIN: `${API_BASE_URL}/api/login`,
    VERIFY_OTP: `${API_BASE_URL}/api/verify-otp/`,
    PROFILE: `${API_BASE_URL}/api/profile/`,
    
    // Recommendation endpoints
    CROP_RECOMMENDATIONS: `${API_BASE_URL}/api/crop-recommendations/`,
    GOVERNMENT_SCHEMES: `${API_BASE_URL}/api/govt-schemes/`,
    LOAN_OPTIONS: `${API_BASE_URL}/api/loan-options/`,
    TECHNOLOGY: `${API_BASE_URL}/api/technology/`,
    FARMER_PROFILE: (id) => `${API_BASE_URL}/api/farmer/${id}/profile/`,
    FARMER_SCHEMES: (id) => `${API_BASE_URL}/api/farmer/${id}/recommendations/schemes/`,
    FARMER_LOANS: (id) => `${API_BASE_URL}/api/farmer/${id}/recommendations/loans/`,
};

export const API_CONFIG = {
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000 // 15 seconds
};

// Helper function to get auth header
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
};