import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const TechnologyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cost: '',
    roi_percentage: '',
    implementation_complexity: 'medium',
    suitable_farm_size: '',
    image_url: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [techName, setTechName] = useState(''); // For title display
  
  // Categories for dropdown
  const categories = [
    'Irrigation',
    'Harvesting',
    'Soil Management',
    'Pest Control',
    'Seed Technology',
    'Monitoring',
    'Other'
  ];
  
  // Complexity levels
  const complexityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // Fetch technology details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTechnologyDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/admin/technologies/${id}/`);
          setFormData(response.data);
          setTechName(response.data.name);
        } catch (err) {
          console.error('Error fetching technology details:', err);
          setError('Failed to load technology details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchTechnologyDetails();
    }
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (isEditMode) {
        await axios.put(`/api/admin/technologies/${id}/`, formData);
      } else {
        await axios.post('/api/admin/technologies/', formData);
      }
      
      // Get the section to return to from localStorage or default to 'technologies'
      const returnSection = localStorage.getItem('adminReturnSection') || 'technologies';
      
      // Show success message by adding a query parameter
      const action = isEditMode ? 'updated' : 'created';
      navigate(`/admin?section=${returnSection}&action=${action}&type=technology&status=success`);
    } catch (err) {
      console.error('Error saving technology:', err);
      setError('Failed to save technology. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        entityName="Technology"
        entityId={id}
        isEditMode={isEditMode}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // Custom title for edit mode
  const title = isEditMode ? `Edit Technology: ${techName}` : 'Add New Technology';

  return (
    <AdminLayout
      title={title}
      entityName="Technology"
      entityId={id}
      isEditMode={isEditMode}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Technology Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Technology Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Cost and ROI Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Cost */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Approximate Cost (₹) *
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* ROI Percentage */}
            <div>
              <label htmlFor="roi_percentage" className="block text-sm font-medium text-gray-700 mb-1">
                ROI Percentage (%) *
              </label>
              <input
                type="number"
                id="roi_percentage"
                name="roi_percentage"
                value={formData.roi_percentage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Implementation Details Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Implementation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Implementation Complexity */}
            <div>
              <label htmlFor="implementation_complexity" className="block text-sm font-medium text-gray-700 mb-1">
                Implementation Complexity *
              </label>
              <select
                id="implementation_complexity"
                name="implementation_complexity"
                value={formData.implementation_complexity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {complexityLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Suitable Farm Size */}
            <div>
              <label htmlFor="suitable_farm_size" className="block text-sm font-medium text-gray-700 mb-1">
                Suitable Farm Size (acres)
              </label>
              <input
                type="text"
                id="suitable_farm_size"
                name="suitable_farm_size"
                value={formData.suitable_farm_size}
                onChange={handleChange}
                placeholder="e.g., '5-10' or 'Any'"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </section>

        {/* Visual & Description Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Visual & Description</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {formData.image_url && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden w-32 h-32">
                  <img 
                    src={formData.image_url} 
                    alt="Technology preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              ></textarea>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin?section=technologies')}
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Saving...' : 'Save Technology'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default TechnologyForm; 