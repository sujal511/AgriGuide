import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const CropForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState('');
  const [cropName, setCropName] = useState(''); // For title display
  
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    growing_season: '',
    min_temp_c: '',
    max_temp_c: '',
    water_requirement_mm: '',
    suitable_soil_types: '',
    ph_range: '',
    varieties: '',
    cultivation_practices: '',
    n_requirement_kg_per_ha: '',
    p_requirement_kg_per_ha: '',
    k_requirement_kg_per_ha: ''
  });

  useEffect(() => {
    // If id is provided, fetch crop data for editing
    if (id) {
      const fetchCrop = async () => {
        try {
          const response = await axios.get(`/api/admin/crops/${id}/`);
          setFormData(response.data);
          setCropName(response.data.name);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching crop details:', err);
          setError('Failed to load crop details. Please try again.');
          setLoading(false);
        }
      };

      fetchCrop();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        // Update existing crop
        await axios.put(`/api/admin/crops/${id}/`, formData);
      } else {
        // Create new crop
        await axios.post('/api/admin/crops/', formData);
      }
      
      // Get the section to return to from localStorage or default to 'crops'
      const returnSection = localStorage.getItem('adminReturnSection') || 'crops';
      
      // Redirect back to admin dashboard with the appropriate section
      navigate(`/admin#${returnSection}`);
      
      // Show success message by adding a query parameter
      // This will be handled in the AdminDashboard component
      const action = id ? 'updated' : 'created';
      navigate(`/admin?section=${returnSection}&action=${action}&type=crop&status=success`);
    } catch (err) {
      console.error('Error saving crop:', err);
      setError('Failed to save crop. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        entityName="Crop"
        entityId={id}
        isEditMode={!!id}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // Custom title for edit mode
  const title = id ? `Edit Crop: ${cropName}` : 'Add New Crop';

  return (
    <AdminLayout
      title={title}
      entityName="Crop"
      entityId={id}
      isEditMode={!!id}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scientific Name
              </label>
              <input
                type="text"
                name="scientific_name"
                value={formData.scientific_name}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Growing Season*
              </label>
              <select
                name="growing_season"
                value={formData.growing_season}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select Season</option>
                <option value="Kharif">Kharif (Monsoon)</option>
                <option value="Rabi">Rabi (Winter)</option>
                <option value="Zaid">Zaid (Summer)</option>
                <option value="Annual">Annual (Year-round)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Requirement (mm)*
              </label>
              <input
                type="number"
                name="water_requirement_mm"
                value={formData.water_requirement_mm}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.water_requirement_mm < 500 ? 'Low water requirement' : 
                 formData.water_requirement_mm < 1000 ? 'Medium water requirement' : 
                 'High water requirement'}
              </p>
            </div>
          </div>
        </section>
        
        {/* Temperature & Soil Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Temperature & Soil Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Temperature (°C)*
              </label>
              <input
                type="number"
                name="min_temp_c"
                value={formData.min_temp_c}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Temperature (°C)*
              </label>
              <input
                type="number"
                name="max_temp_c"
                value={formData.max_temp_c}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                pH Range*
              </label>
              <input
                type="text"
                name="ph_range"
                value={formData.ph_range}
                onChange={handleChange}
                placeholder="e.g., 6.0-7.5"
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suitable Soil Types*
              </label>
              <input
                type="text"
                name="suitable_soil_types"
                value={formData.suitable_soil_types}
                onChange={handleChange}
                placeholder="e.g., Loamy, Clay, Sandy"
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
        </section>
        
        {/* Cultivation Details Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Cultivation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Varieties
              </label>
              <input
                type="text"
                name="varieties"
                value={formData.varieties}
                onChange={handleChange}
                placeholder="Comma separated varieties"
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cultivation Practices
              </label>
              <textarea
                name="cultivation_practices"
                value={formData.cultivation_practices}
                onChange={handleChange}
                rows="3"
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              ></textarea>
            </div>
          </div>
        </section>
        
        {/* Nutrient Requirements Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Nutrient Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nitrogen (kg/ha)
              </label>
              <input
                type="number"
                name="n_requirement_kg_per_ha"
                value={formData.n_requirement_kg_per_ha}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phosphorus (kg/ha)
              </label>
              <input
                type="number"
                name="p_requirement_kg_per_ha"
                value={formData.p_requirement_kg_per_ha}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potassium (kg/ha)
              </label>
              <input
                type="number"
                name="k_requirement_kg_per_ha"
                value={formData.k_requirement_kg_per_ha}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin?section=crops')}
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
            {loading ? 'Saving...' : 'Save Crop'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CropForm; 