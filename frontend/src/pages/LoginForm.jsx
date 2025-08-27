import { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const LoginForm = () => {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Replace with your actual API call
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle error response from server
        setErrors(data);
      } else {
        // Handle successful login
        console.log('Login successful', data);
        // Redirect or update state as needed
      }
    } catch (error) {
      setErrors({ non_field_errors: ['An error occurred. Please try again.'] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label 
            htmlFor="email" 
            className={`block text-sm font-medium ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label 
            htmlFor="password" 
            className={`block text-sm font-medium ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        {/* Display general errors */}
        {errors.non_field_errors && (
          <div className={`rounded-md p-4 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
            <div className="flex">
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                  {errors.non_field_errors.includes('credentials') ? 'Wrong Password or Email' : 'Login failed'}
                </h3>
                <div className={`mt-2 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  <ul className="list-disc pl-5 space-y-1">
                    {Array.isArray(errors.non_field_errors) 
                      ? errors.non_field_errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))
                      : <li>{errors.non_field_errors}</li>
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md ${
            darkMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;