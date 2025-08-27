import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children, title, entityName, entityId, isEditMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which section is active based on URL
  const getEntitySection = () => {
    const path = location.pathname;
    if (path.includes('/crops')) return 'crops';
    if (path.includes('/technologies')) return 'technologies';
    if (path.includes('/schemes')) return 'schemes';
    if (path.includes('/loans')) return 'loans';
    if (path.includes('/users')) return 'users';
    return 'dashboard';
  };

  const section = getEntitySection();
  
  const handleGoBack = () => {
    const returnSection = localStorage.getItem('adminReturnSection') || section;
    navigate(`/admin?section=${returnSection}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Navigation breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/admin" className="text-gray-600 hover:text-green-600 inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link 
                  to={`/admin?section=${section}`} 
                  className="ml-1 text-gray-600 hover:text-green-600 md:ml-2"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-green-600 font-medium md:ml-2">
                  {isEditMode ? `Edit ${entityName}` : `Add ${entityName}`}
                  {entityId && <span className="ml-1 text-gray-500">#{entityId}</span>}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {title || (isEditMode ? `Edit ${entityName}` : `Add New ${entityName}`)}
            </h1>
            <button
              onClick={handleGoBack}
              className="text-gray-500 hover:text-gray-700 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all"
              title="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Card body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 