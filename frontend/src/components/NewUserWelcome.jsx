import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component shown to new users who don't have a profile set up yet
 * Directs them to create a profile instead of showing broken/empty recommendations
 */
const NewUserWelcome = ({ onCreateProfile }) => {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-green-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Personalized Recommendations</h1>
            <Link to="/dashboard" className="text-white hover:text-green-100">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Welcome to Personalized Recommendations
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              To provide you with tailored crop suggestions, farming advice, and relevant government schemes, 
              we need to know a bit about you and your farm.
            </p>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your data is only used to provide personalized recommendations and will never be shared with third parties.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              You'll get access to:
            </h3>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mt-1 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Crop recommendations based on your soil type and local climate</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mt-1 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Government schemes and subsidies you're eligible for</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mt-1 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Tailored agricultural loan options with best rates</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mt-1 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Agricultural technology recommendations matched to your farm size</span>
              </li>
            </ul>
            
            <div className="flex justify-center">
              <button 
                onClick={onCreateProfile}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Create My Farm Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewUserWelcome; 