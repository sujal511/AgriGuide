import React from 'react';

const TermsAndConditionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Welcome to AgriGuide</h3>
          
          <div className="space-y-4 text-gray-700">
            <p>
              These terms and conditions outline the rules and regulations for the use of AgriGuide's Application.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">1. User Accounts</h4>
            <p>
              By creating an account on our application, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">2. Agricultural Information</h4>
            <p>
              The agricultural advice, predictions, and recommendations provided through AgriGuide are based on data analysis and agricultural science. While we strive for accuracy, we cannot guarantee the outcomes of following our recommendations, as farming outcomes are subject to many external factors including weather, soil conditions, and implementation methods.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">3. Data Privacy</h4>
            <p>
              We collect and process personal information as outlined in our Privacy Policy. By using AgriGuide, you consent to this data collection and processing, including information about your farm location, crop types, and agricultural practices.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">4. User Conduct</h4>
            <p>
              You agree not to use the application for any illegal purposes or to conduct activities that may harm the application, its users, or third parties. This includes attempting to gain unauthorized access to the system or interfering with its functionality.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">5. Content Rights</h4>
            <p>
              All content provided through AgriGuide, including text, graphics, logos, and software, is the property of AgriGuide or its content suppliers and is protected by intellectual property laws.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">6. Limitation of Liability</h4>
            <p>
              AgriGuide and its developers, partners, and affiliates shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the application.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">7. Changes to Terms</h4>
            <p>
              We may modify these terms at any time. Continued use of the application after such modifications constitutes your acceptance of the updated terms.
            </p>
            
            <h4 className="text-lg font-semibold mt-4">8. Governing Law</h4>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AgriGuide operates.
            </p>
            
            <div className="mt-6 pt-4 border-t">
              <p>
                By using AgriGuide, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal; 