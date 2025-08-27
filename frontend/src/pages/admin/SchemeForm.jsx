import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const SchemeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    implementing_agency: '',
    eligibility_criteria: '',
    benefits: '',
    application_process: '',
    required_documents: '',
    contact_info: '',
    district_availability: '',
    application_url: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [schemeName, setSchemeName] = useState(''); // For title display

  // Fetch scheme details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchSchemeDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/admin/schemes/${id}/`);
          setFormData(response.data);
          setSchemeName(response.data.name);
        } catch (err) {
          console.error('Error fetching scheme details:', err);
          setError('Failed to load scheme details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSchemeDetails();
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
        await axios.put(`/api/admin/schemes/${id}/`, formData);
      } else {
        await axios.post('/api/admin/schemes/', formData);
      }
      
      // Get the section to return to from localStorage or default to 'schemes'
      const returnSection = localStorage.getItem('adminReturnSection') || 'schemes';
      
      // Show success message by adding a query parameter
      const action = isEditMode ? 'updated' : 'created';
      navigate(`/admin?section=${returnSection}&action=${action}&type=scheme&status=success`);
    } catch (err) {
      console.error('Error saving scheme:', err);
      setError('Failed to save scheme. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        entityName="Scheme"
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
  const title = isEditMode ? `Edit Scheme: ${schemeName}` : 'Add New Government Scheme';

  return (
    <AdminLayout
      title={title}
      entityName="Scheme"
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
            {/* Scheme Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Scheme Name *
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

            {/* Implementing Agency */}
            <div>
              <label htmlFor="implementing_agency" className="block text-sm font-medium text-gray-700 mb-1">
                Implementing Agency *
              </label>
              <input
                type="text"
                id="implementing_agency"
                name="implementing_agency"
                value={formData.implementing_agency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
        </section>
          
        {/* Availability Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* District Availability */}
            <div>
              <label htmlFor="district_availability" className="block text-sm font-medium text-gray-700 mb-1">
                District Availability
              </label>
              <input
                type="text"
                id="district_availability"
                name="district_availability"
                value={formData.district_availability}
                onChange={handleChange}
                placeholder="Leave blank if available in all districts"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Application URL */}
            <div>
              <label htmlFor="application_url" className="block text-sm font-medium text-gray-700 mb-1">
                Application URL
              </label>
              <input
                type="url"
                id="application_url"
                name="application_url"
                value={formData.application_url}
                onChange={handleChange}
                placeholder="https://example.com/apply"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Description & Eligibility</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
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
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              ></textarea>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <label htmlFor="eligibility_criteria" className="block text-sm font-medium text-gray-700 mb-1">
                Eligibility Criteria *
              </label>
              <textarea
                id="eligibility_criteria"
                name="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              ></textarea>
            </div>

            {/* Benefits */}
            <div>
              <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
                Benefits *
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              ></textarea>
            </div>
          </div>
        </section>

        {/* Application Details Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Application Details</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            {/* Application Process */}
            <div>
              <label htmlFor="application_process" className="block text-sm font-medium text-gray-700 mb-1">
                Application Process *
              </label>
              <textarea
                id="application_process"
                name="application_process"
                value={formData.application_process}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              ></textarea>
            </div>

            {/* Required Documents */}
            <div>
              <label htmlFor="required_documents" className="block text-sm font-medium text-gray-700 mb-1">
                Required Documents *
              </label>
              <textarea
                id="required_documents"
                name="required_documents"
                value={formData.required_documents}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              ></textarea>
            </div>

            {/* Contact Information */}
            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information *
              </label>
              <textarea
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                rows={3}
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
            onClick={() => navigate('/admin?section=schemes')}
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
            {loading ? 'Saving...' : 'Save Scheme'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default SchemeForm;
