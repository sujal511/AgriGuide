import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { FaFilter, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    states: [],
    statuses: []
  });
  
  // Filter states
  const [selectedType, setSelectedType] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchemes();
  }, [selectedType, selectedState, selectedStatus, searchQuery]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      let url = '/schemes/api/schemes/?';
      
      if (selectedType) url += `type=${selectedType}&`;
      if (selectedState) url += `state=${selectedState}&`;
      if (selectedStatus) url += `status=${selectedStatus}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      const response = await axios.get(url);
      setSchemes(response.data.schemes);
      setFilterOptions(response.data.filterOptions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Failed to load government schemes. Please try again later.');
      setLoading(false);
    }
  };

  const handleSchemeClick = (schemeId) => {
    navigate(`/government-schemes/${schemeId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already triggered by the useEffect when searchQuery changes
  };

  const clearFilters = () => {
    setSelectedType('');
    setSelectedState('');
    setSelectedStatus('');
    setSearchQuery('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Government Agricultural Schemes</h1>
        
        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Types</option>
                    {filterOptions.types.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All States</option>
                    {filterOptions.states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Statuses</option>
                    {filterOptions.statuses.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Schemes List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : schemes.length === 0 ? (
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            No schemes found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <div 
                key={scheme.id}
                onClick={() => handleSchemeClick(scheme.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{scheme.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scheme.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {scheme.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{scheme.type} • {scheme.state}</p>
                  <p className="text-sm line-clamp-3 mb-3">
                    {scheme.description}
                  </p>
                  <p className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <span className="font-medium">Target Group:</span> {scheme.targetGroup}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GovernmentSchemes; 