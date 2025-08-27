import axios from 'axios';

// Base API configuration
const adminApi = axios.create({
  baseURL: '', // Using relative paths for all API calls
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, 
});

// Add auth token to requests if available
adminApi.interceptors.request.use(request => {
  const token = localStorage.getItem('authToken');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
});

// Add logging interceptors
adminApi.interceptors.request.use(request => {
  console.log('Admin API Request:', request.method, request.url);
  return request;
}, error => {
  console.error('Admin API Request Error:', error);
  return Promise.reject(error);
});

adminApi.interceptors.response.use(response => {
  console.log('Admin API Response:', response.status, response.config.url);
  return response;
}, error => {
  console.error('Admin API Response Error:', error);
  if (error.response && error.response.status === 401) {
    // Handle unauthorized access - redirect to login
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

// Dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await adminApi.get('/api/admin/dashboard/stats/');
    
    // If the API doesn't return some of the data we need for charts,
    // we'll add mock data for demonstration purposes
    const data = response.data || {};
    
    // Add user activity data if not provided
    if (!data.newUsersCount) {
      data.newUsersCount = Math.floor((data.usersCount || 10) * 0.2);
    }
    if (!data.activeUsersCount) {
      data.activeUsersCount = Math.floor((data.usersCount || 10) * 0.7);
    }
    if (!data.inactiveUsersCount) {
      data.inactiveUsersCount = Math.floor((data.usersCount || 10) * 0.1);
    }
    
    // Add user registration trend if not provided
    if (!data.userRegistrationTrend) {
      data.userRegistrationTrend = [5, 8, 12, 15, 10, Math.floor((data.usersCount || 10) * 0.2)];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      cropsCount: 0,
      technologiesCount: 0,
      schemesCount: 0,
      loansCount: 0, 
      usersCount: 0,
      newUsersCount: 0,
      activeUsersCount: 0,
      inactiveUsersCount: 0,
      userRegistrationTrend: [0, 0, 0, 0, 0, 0]
    };
  }
};

// Crop Management APIs
export const getCrops = async (searchQuery = '') => {
  try {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await adminApi.get('/api/admin/crops/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching crops:', error);
    return [];
  }
};

export const getCropById = async (id) => {
  try {
    const response = await adminApi.get(`/api/admin/crops/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crop with ID ${id}:`, error);
    return null;
  }
};

export const createCrop = async (cropData) => {
  try {
    const response = await adminApi.post('/api/admin/crops/', cropData);
    return response.data;
  } catch (error) {
    console.error('Error creating crop:', error);
    throw error;
  }
};

export const updateCrop = async (id, cropData) => {
  try {
    const response = await adminApi.put(`/api/admin/crops/${id}/`, cropData);
    return response.data;
  } catch (error) {
    console.error(`Error updating crop with ID ${id}:`, error);
    throw error;
  }
};

export const deleteCrop = async (id) => {
  try {
    await adminApi.delete(`/api/admin/crops/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting crop with ID ${id}:`, error);
    throw error;
  }
};

// Technology Management APIs
export const getTechnologies = async (searchQuery = '') => {
  try {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await adminApi.get('/api/admin/technologies/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return [];
  }
};

export const getTechnologyById = async (id) => {
  try {
    const response = await adminApi.get(`/api/admin/technologies/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching technology with ID ${id}:`, error);
    return null;
  }
};

export const createTechnology = async (technologyData) => {
  try {
    const response = await adminApi.post('/api/admin/technologies/', technologyData);
    return response.data;
  } catch (error) {
    console.error('Error creating technology:', error);
    throw error;
  }
};

export const updateTechnology = async (id, technologyData) => {
  try {
    const response = await adminApi.put(`/api/admin/technologies/${id}/`, technologyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating technology with ID ${id}:`, error);
    throw error;
  }
};

export const deleteTechnology = async (id) => {
  try {
    await adminApi.delete(`/api/admin/technologies/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting technology with ID ${id}:`, error);
    throw error;
  }
};

// Government Scheme Management APIs
export const getSchemes = async (searchQuery = '') => {
  try {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await adminApi.get('/api/admin/schemes/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return [];
  }
};

export const getSchemeById = async (id) => {
  try {
    const response = await adminApi.get(`/api/admin/schemes/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching scheme with ID ${id}:`, error);
    return null;
  }
};

export const createScheme = async (schemeData) => {
  try {
    const response = await adminApi.post('/api/admin/schemes/', schemeData);
    return response.data;
  } catch (error) {
    console.error('Error creating scheme:', error);
    throw error;
  }
};

export const updateScheme = async (id, schemeData) => {
  try {
    const response = await adminApi.put(`/api/admin/schemes/${id}/`, schemeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating scheme with ID ${id}:`, error);
    throw error;
  }
};

export const deleteScheme = async (id) => {
  try {
    await adminApi.delete(`/api/admin/schemes/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting scheme with ID ${id}:`, error);
    throw error;
  }
};

// Loan Management APIs
export const getLoans = async (searchQuery = '') => {
  try {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await adminApi.get('/api/admin/loans/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
};

export const getLoanById = async (id) => {
  try {
    const response = await adminApi.get(`/api/admin/loans/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching loan with ID ${id}:`, error);
    return null;
  }
};

export const createLoan = async (loanData) => {
  try {
    const response = await adminApi.post('/api/admin/loans/', loanData);
    return response.data;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

export const updateLoan = async (id, loanData) => {
  try {
    const response = await adminApi.put(`/api/admin/loans/${id}/`, loanData);
    return response.data;
  } catch (error) {
    console.error(`Error updating loan with ID ${id}:`, error);
    throw error;
  }
};

export const deleteLoan = async (id) => {
  try {
    await adminApi.delete(`/api/admin/loans/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting loan with ID ${id}:`, error);
    throw error;
  }
};

// User Management APIs
export const getUsers = async (searchQuery = '') => {
  try {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await adminApi.get('/api/admin/users/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const response = await adminApi.get(`/api/admin/users/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return null;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await adminApi.post('/api/admin/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await adminApi.put(`/api/admin/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await adminApi.delete(`/api/admin/users/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

export default adminApi; 