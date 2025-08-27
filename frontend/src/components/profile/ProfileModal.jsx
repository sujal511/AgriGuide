import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  HelpCircle, 
  Lock, 
  Mail, 
  AlertTriangle, 
  HeartHandshake, 
  ChevronRight,
  X,
  Save,
  AlertCircle,
  Phone
} from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, userData, onSave }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    ...userData,
    newEmail: userData?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Call onSave callback with only the personal info data
      const personalData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        bio: formData.bio
      };
      
      await onSave(personalData);
      setSuccessMessage('Profile information updated successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Here you would typically call an API to update the email
      // For now we'll just simulate success
      setTimeout(() => {
        setFormData({ ...formData, email: formData.newEmail });
        setSuccessMessage('Email updated successfully!');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'An error occurred while updating your email');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Here you would typically call an API to update the password
      // For now we'll just simulate success
      setTimeout(() => {
        setSuccessMessage('Password changed successfully!');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'An error occurred while changing your password');
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Here you would call an API to delete the account
      alert('Account deletion functionality would be implemented here');
    }
  };

  const renderPersonalInfoTab = () => (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
      
      <form onSubmit={handleSavePersonal}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">To change your email, go to Account Settings tab</p>
          </div>
          
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Tell us about yourself and your farming experience"
            />
          </div>
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAccountSettingsTab = () => (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Account Settings</h3>
      
      <div className="space-y-8">
        {/* Change Email Section */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-gray-500" />
            Change Email Address
          </h4>
          <form onSubmit={handleChangeEmail} className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="current-email" className="block text-sm font-medium text-gray-700">Current Email</label>
                <input
                  type="email"
                  id="current-email"
                  value={formData.email || ''}
                  disabled
                  className="mt-1 bg-gray-100 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-gray-700">New Email</label>
                <input
                  type="email"
                  id="new-email"
                  name="newEmail"
                  value={formData.newEmail || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Update Email
              </button>
            </div>
          </form>
        </div>
        
        {/* Change Password Section */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-gray-500" />
            Change Password
          </h4>
          <form onSubmit={handleChangePassword} className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  name="currentPassword"
                  value={formData.currentPassword || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  name="newPassword"
                  value={formData.newPassword || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
        
        {/* Delete Account Section */}
        <div>
          <h4 className="text-md font-medium text-red-600 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Delete Account
          </h4>
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
            <p className="text-sm text-red-600 mb-4">
              Warning: Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpSupportTab = () => (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Help & Support</h3>
      
      <div className="space-y-8">
        {/* FAQs Section */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">Frequently Asked Questions</h4>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-4 text-left"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    openFaqId === index ? 'rotate-90' : ''
                  }`} />
                </button>
                {openFaqId === index && (
                  <div className="p-4 pt-0 text-gray-600 text-sm border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact Support Section */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
            <HeartHandshake className="h-5 w-5 mr-2 text-gray-500" />
            Contact Support
          </h4>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-2">You can reach our support team at:</p>
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <a href="mailto:agriguidefarm@gmail.com" className="text-green-600 hover:underline">agriguidefarm@gmail.com</a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-700">+91 9876 543 210</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // FAQ data and toggle function
  const [openFaqId, setOpenFaqId] = useState(null);
  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const faqs = [
    { 
      question: 'How does AgriGuide help with crop selection?', 
      answer: 'AgriGuide analyzes your soil type, local climate data, and current market trends to recommend the most suitable crops for your farm that will maximize yield and profitability.' 
    },
    { 
      question: 'How can I access government schemes for farmers?', 
      answer: 'Navigate to the Government Schemes section in your dashboard where you can browse all available schemes, check eligibility criteria, and find application instructions tailored to your farm profile.' 
    },
    { 
      question: 'How does the weather forecast help my farming?', 
      answer: 'Our localized weather forecasts provide accurate predictions for your specific farm location, helping you plan irrigation, planting, and harvesting activities to maximize crop health and yield.' 
    },
    { 
      question: 'How can I track my farm finances?', 
      answer: 'Use our Financial Resource Management module to track expenses, manage loans, monitor budgets, and access information about agricultural subsidies available to you.' 
    },
    { 
      question: 'Is my farm data secure in AgriGuide?', 
      answer: 'Yes, we use industry-standard encryption to protect all your farm data. Your information is stored securely and never shared with third parties without your explicit consent.' 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full">
          {/* Modal header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Profile Settings
            </h3>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Status messages */}
          {(error || successMessage) && (
            <div className={`px-4 py-3 sm:px-6 ${error ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`flex items-center ${error ? 'text-red-700' : 'text-green-700'}`}>
                {error ? (
                  <AlertCircle className="h-5 w-5 mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                <p className="text-sm">{error || successMessage}</p>
              </div>
            </div>
          )}
          
          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`${
                  activeTab === 'personal'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('personal')}
              >
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </button>
              <button
                className={`${
                  activeTab === 'account'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('account')}
              >
                <Settings className="h-5 w-5 mr-2" />
                Account Settings
              </button>
              <button
                className={`${
                  activeTab === 'help'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('help')}
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                Help & Support
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div>
            {activeTab === 'personal' && renderPersonalInfoTab()}
            {activeTab === 'account' && renderAccountSettingsTab()}
            {activeTab === 'help' && renderHelpSupportTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 