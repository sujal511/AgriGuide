import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './admin.css';
import AdminDashboardCharts from '../../components/admin/AdminDashboardCharts';

import { 
  getDashboardStats, 
  getCrops, deleteCrop,
  getTechnologies, deleteTechnology,
  getSchemes, deleteScheme,
  getLoans, deleteLoan,
  getUsers, deleteUser
} from '../../services/adminApi';

// Animation utility for number counter
const animateCounter = (element, start, end, duration = 2000) => {
  if (!element) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    element.innerText = current;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.innerText = end; // Ensure the final number is exact
    }
  };
  window.requestAnimationFrame(step);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const counterRefs = useRef([]);
  const animationTriggered = useRef(false);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({
    cropsCount: 0,
    technologiesCount: 0,
    schemesCount: 0,
    loansCount: 0,
    usersCount: 0
  });
  const [crops, setCrops] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'crops', label: 'Crop Management', icon: '🌾' },
    { id: 'technologies', label: 'Technology Management', icon: '🔧' },
    { id: 'schemes', label: 'Scheme Management', icon: '📜' },
    { id: 'loans', label: 'Loan Management', icon: '💰' },
    { id: 'users', label: 'User Management', icon: '👤' },
  ];

  // Parse URL parameters for section and success/error messages
  useEffect(() => {
    // Parse the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const section = queryParams.get('section');
    const action = queryParams.get('action');
    const type = queryParams.get('type');
    const status = queryParams.get('status');
    
    // Set active section from URL if available
    if (section && menuItems.some(item => item.id === section)) {
      setActiveSection(section);
    } else if (window.location.hash) {
      // Check for hash in URL (#section)
      const hashSection = window.location.hash.substring(1);
      if (menuItems.some(item => item.id === hashSection)) {
        setActiveSection(hashSection);
      }
    }
    
    // Handle success/error messages
    if (status === 'success' && action && type) {
      const message = `${type.charAt(0).toUpperCase() + type.slice(1)} ${action} successfully.`;
      setSuccess(message);
      
      // Clear URL parameters after processing
      setTimeout(() => {
        // Remove query parameters from URL but keep the hash
        navigate(`${window.location.pathname}${window.location.hash}`, { replace: true });
      }, 100);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    }
  }, [navigate]);

  // Load dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await getDashboardStats();
        setDashboardStats(stats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeSection]);

  // Init animations when dashboard stats are loaded
  useEffect(() => {
    if (activeSection === 'dashboard' && !loading && !animationTriggered.current) {
      // Animate counters when stats are loaded
      setTimeout(() => {
        counterRefs.current.forEach((ref, index) => {
          if (ref) {
            let value = 0;
            switch (index) {
              case 0: value = dashboardStats.cropsCount; break;
              case 1: value = dashboardStats.technologiesCount; break;
              case 2: value = dashboardStats.schemesCount; break;
              case 3: value = dashboardStats.loansCount; break;
              case 4: value = dashboardStats.usersCount; break;
              default: value = 0;
            }
            animateCounter(ref, 0, value);
          }
        });
        animationTriggered.current = true;
      }, 300); // Small delay to ensure DOM is ready
    }

    // Reset animation flag when section changes
    return () => {
      if (activeSection !== 'dashboard') {
        animationTriggered.current = false;
      }
    };
  }, [activeSection, loading, dashboardStats]);

  // Load crops data
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        const data = await getCrops(searchQuery);
        setCrops(data);
      } catch (err) {
        console.error('Error fetching crops:', err);
        setError('Failed to load crops data');
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'crops') {
      fetchCrops();
    }
  }, [activeSection, searchQuery]);

  // Load technologies data
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        setLoading(true);
        const data = await getTechnologies(searchQuery);
        setTechnologies(data);
      } catch (err) {
        console.error('Error fetching technologies:', err);
        setError('Failed to load technology data');
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'technologies') {
      fetchTechnologies();
    }
  }, [activeSection, searchQuery]);

  // Load schemes data
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const data = await getSchemes(searchQuery);
        setSchemes(data);
      } catch (err) {
        console.error('Error fetching schemes:', err);
        setError('Failed to load government scheme data');
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'schemes') {
      fetchSchemes();
    }
  }, [activeSection, searchQuery]);

  // Load loans data
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const data = await getLoans(searchQuery);
        setLoans(data);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Failed to load loan data');
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'loans') {
      fetchLoans();
    }
  }, [activeSection, searchQuery]);

  // Load users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers(searchQuery);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection, searchQuery]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle delete button click - confirm before deletion
  const handleDeleteClick = (id, type) => {
    setConfirmDelete({ id, type });
  };

  // Handle confirm delete 
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    const { id, type } = confirmDelete;
    setLoading(true);
    
    try {
      switch (type) {
        case 'crop':
          await deleteCrop(id);
          setCrops(crops.filter(crop => crop.id !== id));
          break;
        case 'technology':
          await deleteTechnology(id);
          setTechnologies(technologies.filter(tech => tech.id !== id));
          break;
        case 'scheme':
          await deleteScheme(id);
          setSchemes(schemes.filter(scheme => scheme.id !== id));
          break;
        case 'loan':
          await deleteLoan(id);
          setLoans(loans.filter(loan => loan.id !== id));
          break;
        case 'user':
          await deleteUser(id);
          setUsers(users.filter(user => user.id !== id));
          break;
        default:
          break;
      }
      setConfirmDelete(null);
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(`Failed to delete ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Handle edit button click
  const handleEdit = (id, type) => {
    // Using navigate instead of plain URL change to ensure proper routing
    // Handle special pluralization for "technology" -> "technologies"
    let path;
    if (type === 'technology') {
      path = `/admin/technologies/edit/${id}`;
    } else {
      path = `/admin/${type}s/edit/${id}`;
    }
    
    navigate(path, { replace: false });
    
    // Add state to carry information about where to return after editing
    localStorage.setItem('adminReturnSection', activeSection);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  // Toggle help modal
  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

  // Show loading state
  if (loading && !activeSection === 'dashboard') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 font-sans admin-dashboard">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans admin-dashboard">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-100 admin-sidebar">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700 admin-sidebar-header">
          <h2 className="text-2xl font-bold text-white tracking-tight">AgriGuide Admin</h2>
          <p className="text-green-100 text-sm mt-1 opacity-80">Management Console</p>
        </div>
        <nav className="mt-6 px-2">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center py-3.5 px-6 rounded-lg mb-2 transition-all duration-200 admin-sidebar-menu-item ${
                activeSection === item.id ? 'active' : ''
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
          <div className="mt-6 border-t border-gray-100 pt-4 px-6">
            <button 
              className="flex items-center text-gray-500 hover:text-red-500 transition-all duration-300 admin-sidebar-menu-item"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 admin-heading">
            {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              className="admin-button admin-button-primary"
              onClick={toggleHelpModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 animate-fadeIn">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
            <button 
              className="text-xs hover:underline mt-2" 
              onClick={() => setSuccess(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 animate-fadeIn">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <button 
              className="text-xs hover:underline mt-2" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full modal-content">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this {confirmDelete.type}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
                  onClick={handleCancelDelete}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 admin-button-danger"
                  onClick={handleConfirmDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full modal-content">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-green-700">Admin Dashboard Help</h3>
                <button onClick={toggleHelpModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5 text-gray-700">
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Dashboard Overview
                  </h4>
                  <p className="pl-7">The dashboard provides a complete overview of all data in the system, including counts of crops, technologies, schemes, loans, and users.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Managing Content
                  </h4>
                  <ul className="list-disc pl-7 space-y-1 text-gray-600">
                    <li>Use the sidebar to navigate between different sections</li>
                    <li>Each section allows you to view, add, edit, and delete items</li>
                    <li>Use the search box to filter results in each section</li>
                    <li>Click on "Add New" to create new entries</li>
                    <li>Use the Edit and Delete buttons to manage existing entries</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Additional Support
                  </h4>
                  <p className="pl-7">If you need further assistance, please contact the technical support team at <a href="mailto:agriguidefarm@gmail.com" className="text-green-600 hover:text-green-800 hover:underline">agriguidefarm@gmail.com</a></p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 admin-button-primary"
                  onClick={toggleHelpModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        Content based on active section
        {activeSection === 'dashboard' && (
          <>
            
          
            
            
            {/* Quick Actions Panel */}
            <div className="mt-10 mb-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
              <p className="text-gray-600 mb-6">Frequently used administrative tasks and shortcuts</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Add New Crop</h3>
                    <p className="text-sm text-white text-opacity-80 mb-4">Create a new crop entry in the database</p>
                    <a 
                      href="#crops" 
                      onClick={() => setActiveSection('crops')}
                      className="mt-auto inline-flex items-center text-white text-sm font-medium hover:underline"
                    >
                      Add Crop
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">New Scheme</h3>
                    <p className="text-sm text-white text-opacity-80 mb-4">Add a new government scheme</p>
                    <a 
                      href="#schemes" 
                      onClick={() => setActiveSection('schemes')}
                      className="mt-auto inline-flex items-center text-white text-sm font-medium hover:underline"
                    >
                      Create Scheme
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Manage Loans</h3>
                    <p className="text-sm text-white text-opacity-80 mb-4">Review pending loan applications</p>
                    <a 
                      href="#loans" 
                      onClick={() => setActiveSection('loans')}
                      className="mt-auto inline-flex items-center text-white text-sm font-medium hover:underline"
                    >
                      View Applications
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">User Accounts</h3>
                    <p className="text-sm text-white text-opacity-80 mb-4">Manage farmer accounts and profiles</p>
                    <a 
                      href="#users" 
                      onClick={() => setActiveSection('users')}
                      className="mt-auto inline-flex items-center text-white text-sm font-medium hover:underline"
                    >
                      View Users
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Visualization Charts */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Dashboard Analytics</h2>
              <p className="text-gray-600 mb-6">Visual representation of your system data and trends</p>
              
              {loading ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading dashboard analytics...</p>
                </div>
              ) : (
                <AdminDashboardCharts 
                  dashboardStats={dashboardStats} 
                  users={users}
                  loans={loans}
                  crops={crops}
                />
              )}
            </div>
          </>
        )}

        {activeSection === 'crops' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 admin-heading">Crop Management</h2>
            <div className="flex justify-between mb-6">
              <div className="relative w-1/3 admin-search-input">
                <input 
                  type="text" 
                  placeholder="Search crops..." 
                  className="admin-form-input pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute text-gray-400 left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link 
                to="/admin/crops/add"
                className="admin-button admin-button-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Crop
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading crops...</p>
                </div>
              ) : crops.length > 0 ? (
                <table className="min-w-full bg-white rounded-lg overflow-hidden admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Growing Season</th>
                      <th>Water Requirement</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map(crop => (
                      <tr key={crop.id}>
                        <td>{crop.id}</td>
                        <td className="font-medium">{crop.name}</td>
                        <td>{crop.growing_season}</td>
                        <td>
                          {crop.water_requirement_mm < 500 ? (
                            <span className="status-badge status-badge-success">Low</span>
                          ) : crop.water_requirement_mm < 1000 ? (
                            <span className="status-badge status-badge-success">Medium</span>
                          ) : (
                            <span className="status-badge status-badge-warning">High</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            onClick={() => handleEdit(crop.id, 'crop')}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium"
                            onClick={() => handleDeleteClick(crop.id, 'crop')}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No crops found. Add a new crop to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'technologies' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 admin-heading">Technology Management</h2>
            <div className="flex justify-between mb-6">
              <div className="relative w-1/3 admin-search-input">
                <input 
                  type="text" 
                  placeholder="Search technologies..." 
                  className="admin-form-input pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute text-gray-400 left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link 
                to="/admin/technologies/add"
                className="admin-button admin-button-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Technology
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading technologies...</p>
                </div>
              ) : technologies.length > 0 ? (
                <table className="min-w-full bg-white rounded-lg overflow-hidden admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>ROI %</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technologies.map(tech => (
                      <tr key={tech.id}>
                        <td>{tech.id}</td>
                        <td className="font-medium">{tech.name}</td>
                        <td>
                          <span className="status-badge status-badge-success">{tech.category}</span>
                        </td>
                        <td className="text-green-600 font-medium">{tech.roi_percentage}%</td>
                        <td>
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            onClick={() => handleEdit(tech.id, 'technology')}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium"
                            onClick={() => handleDeleteClick(tech.id, 'technology')}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No technologies found. Add a new technology to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'schemes' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 admin-heading">Government Scheme Management</h2>
            <div className="flex justify-between mb-6">
              <div className="relative w-1/3 admin-search-input">
                <input 
                  type="text" 
                  placeholder="Search schemes..." 
                  className="admin-form-input pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute text-gray-400 left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link 
                to="/admin/schemes/add"
                className="admin-button admin-button-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Scheme
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading schemes...</p>
                </div>
              ) : schemes.length > 0 ? (
                <table className="min-w-full bg-white rounded-lg overflow-hidden admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Implementing Agency</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map(scheme => (
                      <tr key={scheme.id}>
                        <td>{scheme.id}</td>
                        <td className="font-medium">{scheme.name}</td>
                        <td>{scheme.implementing_agency}</td>
                        <td>{scheme.district_availability || 'All Districts'}</td>
                        <td>
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            onClick={() => handleEdit(scheme.id, 'scheme')}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium"
                            onClick={() => handleDeleteClick(scheme.id, 'scheme')}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No government schemes found. Add a new scheme to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'loans' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 admin-heading">Loan Management</h2>
            <div className="flex justify-between mb-6">
              <div className="relative w-1/3 admin-search-input">
                <input 
                  type="text" 
                  placeholder="Search loans..." 
                  className="admin-form-input pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute text-gray-400 left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link 
                to="/admin/loans/add"
                className="admin-button admin-button-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Loan
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading loans...</p>
                </div>
              ) : loans.length > 0 ? (
                <table className="min-w-full bg-white rounded-lg overflow-hidden admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Provider</th>
                      <th>Interest Rate</th>
                      <th>Loan Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr key={loan.id}>
                        <td>{loan.id}</td>
                        <td className="font-medium">{loan.name}</td>
                        <td>{loan.provider}</td>
                        <td className="text-green-600 font-medium">{loan.interest_rate}</td>
                        <td>{loan.loan_type}</td>
                        <td>
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            onClick={() => handleEdit(loan.id, 'loan')}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium"
                            onClick={() => handleDeleteClick(loan.id, 'loan')}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No loans found. Add a new loan to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 admin-heading">User Management</h2>
            <div className="flex justify-between mb-6">
              <div className="relative w-1/3 admin-search-input">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="admin-form-input pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute text-gray-400 left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link 
                to="/admin/users/add"
                className="admin-button admin-button-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New User
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : users.length > 0 ? (
                <table className="min-w-full bg-white rounded-lg overflow-hidden admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Farming Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td className="font-medium">{user.first_name} {user.last_name}</td>
                        <td>{user.email}</td>
                        <td>
                          {user.farmer_profile?.district ? (
                            <span className="tooltip" data-tip={`State: ${user.farmer_profile?.state || 'Not specified'}, Pincode: ${user.farmer_profile?.pincode || 'Not specified'}`}>
                              {user.farmer_profile.district}
                              <span className="text-xs text-blue-500 ml-1 cursor-help">ℹ️</span>
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {user.farmer_profile ? (
                            <span className="tooltip" data-tip={`Age: ${user.farmer_profile.age || 'Not specified'}, Gender: ${user.farmer_profile.gender || 'Not specified'}, Preferred Season: ${user.farmer_profile.preferred_season || 'Not specified'}`}>
                              Profile Available
                              <span className="text-xs text-blue-500 ml-1 cursor-help">ℹ️</span>
                            </span>
                          ) : 'No farming profile'}
                        </td>
                        <td>
                          {user.is_active ? (
                            <span className="status-badge status-badge-success">Active</span>
                          ) : (
                            <span className="status-badge status-badge-danger">Inactive</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            onClick={() => handleEdit(user.id, 'user')}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium"
                            onClick={() => handleDeleteClick(user.id, 'user')}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No users found. Add a new user to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 