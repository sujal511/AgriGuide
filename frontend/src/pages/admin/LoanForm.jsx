import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const LoanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: '',
    interest_rate: '',
    loan_amount_range: '',
    loan_term_months: '',
    loan_type: '',
    eligibility_criteria: '',
    required_documents: '',
    application_process: '',
    repayment_options: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [loanName, setLoanName] = useState(''); // For title display

  // Loan types for dropdown
  const loanTypes = [
    'Crop Loan',
    'Equipment Purchase',
    'Land Purchase',
    'Infrastructure Development',
    'Livestock',
    'Refinance',
    'Other'
  ];
  
  // Fetch loan details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchLoanDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/admin/loans/${id}/`);
          setFormData(response.data);
          setLoanName(response.data.name);
        } catch (err) {
          console.error('Error fetching loan details:', err);
          setError('Failed to load loan details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchLoanDetails();
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
        await axios.put(`/api/admin/loans/${id}/`, formData);
      } else {
        await axios.post('/api/admin/loans/', formData);
      }

      // Get the section to return to from localStorage or default to 'loans'
      const returnSection = localStorage.getItem('adminReturnSection') || 'loans';
      
      // Show success message by adding a query parameter
      const action = isEditMode ? 'updated' : 'created';
      navigate(`/admin?section=${returnSection}&action=${action}&type=loan&status=success`);
    } catch (err) {
      console.error('Error saving loan:', err);
      setError('Failed to save loan. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        entityName="Loan"
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
  const title = isEditMode ? `Edit Loan: ${loanName}` : 'Add New Loan';

  return (
    <AdminLayout
      title={title}
      entityName="Loan"
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
            {/* Loan Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Name *
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

            {/* Provider */}
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                Provider *
              </label>
              <input
                type="text"
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Loan Details Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Loan Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Interest Rate */}
            <div>
              <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%) *
              </label>
              <input
                type="text"
                id="interest_rate"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                placeholder="e.g., 7.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Loan Type */}
            <div>
              <label htmlFor="loan_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Type *
              </label>
              <select
                id="loan_type"
                name="loan_type"
                value={formData.loan_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="" disabled>Select loan type</option>
                {loanTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Loan Amount Range */}
            <div>
              <label htmlFor="loan_amount_range" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount Range (₹) *
              </label>
              <input
                type="text"
                id="loan_amount_range"
                name="loan_amount_range"
                value={formData.loan_amount_range}
                onChange={handleChange}
                placeholder="e.g., 50,000 - 5,00,000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Loan Term */}
            <div>
              <label htmlFor="loan_term_months" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term (months) *
              </label>
              <input
                type="text"
                id="loan_term_months"
                name="loan_term_months"
                value={formData.loan_term_months}
                onChange={handleChange}
                placeholder="e.g., 12-60"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Description & Requirements Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Description & Requirements</h3>
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
          </div>
        </section>

        {/* Application & Repayment Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Application & Repayment</h3>
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

            {/* Repayment Options */}
            <div>
              <label htmlFor="repayment_options" className="block text-sm font-medium text-gray-700 mb-1">
                Repayment Options *
              </label>
              <textarea
                id="repayment_options"
                name="repayment_options"
                value={formData.repayment_options}
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
            onClick={() => navigate('/admin?section=loans')}
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
            {loading ? 'Saving...' : 'Save Loan'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default LoanForm;
