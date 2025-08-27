import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FarmerProfileSetup = ({ existingProfile, onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Personal
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    district: '',
    state: '',

    // Farm details
    farmSize: '',
    unit: 'Acre',
    soilType: '',
    nitrogenValue: '',
    phosphorusValue: '',
    potassiumValue: '',
    soilPh: '',
    irrigationSources: [],
    irrigationSystems: [],
    landOwnership: 'Owned',

    // Experience
    mainCrops: [],
    seasonalPreference: [],
    organicFarming: false,

    // Financial
    annualIncome: '',
    governmentSchemes: [],
    cropInsurance: 'Yes',
    bankAccount: 'Yes',

    // Interests
    sustainablePractices: [],
    challenges: [],
  });
  
  console.log("Initial form data:", formData);

  // If existingProfile is provided, populate form data
  useEffect(() => {
    if (existingProfile) {
      console.log("Loading existing profile:", existingProfile);
      
      // Create a deep copy of formData to modify
      const updatedFormData = { ...formData };
      
      // Map profile data to form fields
      if (existingProfile.personal) {
        // Handle name fields
        if (existingProfile.personal.firstName) {
          updatedFormData.firstName = existingProfile.personal.firstName;
        } else if (existingProfile.personal.name) {
          const nameParts = existingProfile.personal.name.split(' ');
          updatedFormData.firstName = nameParts[0] || '';
          updatedFormData.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Map other personal fields
        if (existingProfile.personal.lastName) updatedFormData.lastName = existingProfile.personal.lastName;
        if (existingProfile.personal.age) updatedFormData.age = existingProfile.personal.age;
        if (existingProfile.personal.gender) updatedFormData.gender = existingProfile.personal.gender;
        if (existingProfile.personal.district) updatedFormData.district = existingProfile.personal.district;
        if (existingProfile.personal.state) updatedFormData.state = existingProfile.personal.state;
      }
      
      // Map farm details
      if (existingProfile.farm) {
        // Parse farm size
        if (existingProfile.farm.size) {
          const sizeStr = existingProfile.farm.size;
          const numericPart = parseFloat(sizeStr);
          if (!isNaN(numericPart)) {
            updatedFormData.farmSize = numericPart.toString();
          }
          
          // Determine unit
          if (sizeStr.toLowerCase().includes('hectare')) {
            updatedFormData.unit = 'Hectare';
          } else {
            updatedFormData.unit = 'Acre';
          }
        }
        
        // Map soil type
        if (existingProfile.farm.soilType) {
          let soilType = existingProfile.farm.soilType;
          // Remove "soil" suffix if present
          soilType = soilType.replace(/\s+soil$/i, '');
          updatedFormData.soilType = soilType;
        }
        
        // Map NPK values
        if (existingProfile.farm.nitrogenValue) updatedFormData.nitrogenValue = parseFloat(existingProfile.farm.nitrogenValue);
        if (existingProfile.farm.phosphorusValue) updatedFormData.phosphorusValue = parseFloat(existingProfile.farm.phosphorusValue);
        if (existingProfile.farm.potassiumValue) updatedFormData.potassiumValue = parseFloat(existingProfile.farm.potassiumValue);
        if (existingProfile.farm.soilPh) updatedFormData.soilPh = parseFloat(existingProfile.farm.soilPh);
        
        // Map irrigation data
        if (existingProfile.farm.irrigationSources) {
          if (Array.isArray(existingProfile.farm.irrigationSources)) {
            updatedFormData.irrigationSources = existingProfile.farm.irrigationSources;
          } else if (typeof existingProfile.farm.irrigationSources === 'string') {
            updatedFormData.irrigationSources = existingProfile.farm.irrigationSources.split(',').map(item => item.trim());
          }
        }
        
        if (existingProfile.farm.irrigationSystems) {
          if (Array.isArray(existingProfile.farm.irrigationSystems)) {
            updatedFormData.irrigationSystems = existingProfile.farm.irrigationSystems;
          } else if (typeof existingProfile.farm.irrigationSystems === 'string') {
            updatedFormData.irrigationSystems = existingProfile.farm.irrigationSystems.split(',').map(item => item.trim());
          }
        }
        
        // Map land ownership
        if (existingProfile.farm.landOwnership) updatedFormData.landOwnership = existingProfile.farm.landOwnership;
        
        // Map main crops
        if (existingProfile.farm.mainCrops) {
          if (Array.isArray(existingProfile.farm.mainCrops)) {
            updatedFormData.mainCrops = existingProfile.farm.mainCrops;
          } else if (typeof existingProfile.farm.mainCrops === 'string') {
            updatedFormData.mainCrops = existingProfile.farm.mainCrops.split(',').map(item => item.trim());
          }
        }
      }
      
      // Map financial data
      if (existingProfile.financial) {
        if (existingProfile.financial.annualIncome) updatedFormData.annualIncome = existingProfile.financial.annualIncome;
        if (existingProfile.financial.cropInsurance) updatedFormData.cropInsurance = existingProfile.financial.cropInsurance;
        if (existingProfile.financial.bankAccount) updatedFormData.bankAccount = existingProfile.financial.bankAccount;
        
        if (existingProfile.financial.governmentSchemes) {
          if (Array.isArray(existingProfile.financial.governmentSchemes)) {
            updatedFormData.governmentSchemes = existingProfile.financial.governmentSchemes;
          } else if (typeof existingProfile.financial.governmentSchemes === 'string') {
            updatedFormData.governmentSchemes = existingProfile.financial.governmentSchemes.split(',').map(item => item.trim());
          }
        }
      }
      
      // Map preferences
      if (existingProfile.preferences) {
        if (existingProfile.preferences.seasonalPreference) {
          if (Array.isArray(existingProfile.preferences.seasonalPreference)) {
            updatedFormData.seasonalPreference = existingProfile.preferences.seasonalPreference;
          } else if (typeof existingProfile.preferences.seasonalPreference === 'string') {
            updatedFormData.seasonalPreference = existingProfile.preferences.seasonalPreference.split(',').map(item => item.trim());
          }
        }
        
        if (existingProfile.preferences.organicFarming !== undefined) {
          updatedFormData.organicFarming = Boolean(existingProfile.preferences.organicFarming);
        }
        
        if (existingProfile.preferences.sustainablePractices) {
          if (Array.isArray(existingProfile.preferences.sustainablePractices)) {
            updatedFormData.sustainablePractices = existingProfile.preferences.sustainablePractices;
          } else if (typeof existingProfile.preferences.sustainablePractices === 'string') {
            updatedFormData.sustainablePractices = existingProfile.preferences.sustainablePractices.split(',').map(item => item.trim());
          }
        }
      }
      
      // Map challenges
      if (existingProfile.challenges) {
        if (Array.isArray(existingProfile.challenges)) {
          updatedFormData.challenges = existingProfile.challenges;
        } else if (typeof existingProfile.challenges === 'string') {
          updatedFormData.challenges = existingProfile.challenges.split(',').map(item => item.trim());
        }
      }
      
      console.log("Updated form data with existing profile:", updatedFormData);
      // Log specific numeric values for debugging
      console.log("Soil pH value type:", typeof updatedFormData.soilPh, "Value:", updatedFormData.soilPh);
      console.log("N value type:", typeof updatedFormData.nitrogenValue, "Value:", updatedFormData.nitrogenValue);
      console.log("P value type:", typeof updatedFormData.phosphorusValue, "Value:", updatedFormData.phosphorusValue);
      console.log("K value type:", typeof updatedFormData.potassiumValue, "Value:", updatedFormData.potassiumValue);
      
      setFormData(updatedFormData);
    } else {
      // Try to load from localStorage if no existing profile was provided
      const storedProfileData = localStorage.getItem('farmerProfileData');
      if (storedProfileData) {
        try {
          const parsedData = JSON.parse(storedProfileData);
          console.log("Found profile data in localStorage:", parsedData);
          
          // Apply the stored profile data directly instead of trying recursion
          const updatedFormData = { ...formData };
          
          // Map personal data
          if (parsedData.personal) {
            if (parsedData.personal.firstName) updatedFormData.firstName = parsedData.personal.firstName;
            if (parsedData.personal.lastName) updatedFormData.lastName = parsedData.personal.lastName;
            if (parsedData.personal.age) updatedFormData.age = parsedData.personal.age;
            if (parsedData.personal.gender) updatedFormData.gender = parsedData.personal.gender;
            if (parsedData.personal.district) updatedFormData.district = parsedData.personal.district;
            if (parsedData.personal.state) updatedFormData.state = parsedData.personal.state;
          }
          
          // Map farm details
          if (parsedData.farm) {
            if (parsedData.farm.size) {
              const sizeStr = parsedData.farm.size;
              const numericPart = parseFloat(sizeStr);
              if (!isNaN(numericPart)) {
                updatedFormData.farmSize = numericPart.toString();
              }
              
              if (sizeStr.toLowerCase().includes('hectare')) {
                updatedFormData.unit = 'Hectare';
              } else {
                updatedFormData.unit = 'Acre';
              }
            }
            
            if (parsedData.farm.soilType) {
              let soilType = parsedData.farm.soilType;
              soilType = soilType.replace(/\s+soil$/i, '');
              updatedFormData.soilType = soilType;
            }
            
            if (parsedData.farm.nitrogenValue) updatedFormData.nitrogenValue = parseFloat(parsedData.farm.nitrogenValue);
            if (parsedData.farm.phosphorusValue) updatedFormData.phosphorusValue = parseFloat(parsedData.farm.phosphorusValue);
            if (parsedData.farm.potassiumValue) updatedFormData.potassiumValue = parseFloat(parsedData.farm.potassiumValue);
            if (parsedData.farm.soilPh) updatedFormData.soilPh = parseFloat(parsedData.farm.soilPh);
            
            if (parsedData.farm.irrigationSources) updatedFormData.irrigationSources = parsedData.farm.irrigationSources;
            if (parsedData.farm.irrigationSystems) updatedFormData.irrigationSystems = parsedData.farm.irrigationSystems;
            if (parsedData.farm.mainCrops) updatedFormData.mainCrops = parsedData.farm.mainCrops;
            if (parsedData.farm.landOwnership) updatedFormData.landOwnership = parsedData.farm.landOwnership;
          }
          
          // Map financial data
          if (parsedData.financial) {
            if (parsedData.financial.annualIncome) updatedFormData.annualIncome = parsedData.financial.annualIncome;
            if (parsedData.financial.governmentSchemes) updatedFormData.governmentSchemes = parsedData.financial.governmentSchemes;
            if (parsedData.financial.cropInsurance) updatedFormData.cropInsurance = parsedData.financial.cropInsurance;
            if (parsedData.financial.bankAccount) updatedFormData.bankAccount = parsedData.financial.bankAccount;
          }
          
          // Map preferences
          if (parsedData.preferences) {
            if (parsedData.preferences.seasonalPreference) updatedFormData.seasonalPreference = parsedData.preferences.seasonalPreference;
            if (parsedData.preferences.organicFarming !== undefined) updatedFormData.organicFarming = Boolean(parsedData.preferences.organicFarming);
            if (parsedData.preferences.sustainablePractices) updatedFormData.sustainablePractices = parsedData.preferences.sustainablePractices;
          }
          
          // Map challenges
          if (parsedData.challenges) updatedFormData.challenges = parsedData.challenges;
          
          console.log("Updated form data from localStorage:", updatedFormData);
          setFormData(updatedFormData);
        } catch (e) {
          console.error("Error parsing stored profile data:", e);
        }
      }
    }
  }, [existingProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    const numericFields = ['soilPh', 'nitrogenValue', 'phosphorusValue', 'potassiumValue', 'age', 'farmSize'];
    const parsedValue = numericFields.includes(name) && value !== '' ? parseFloat(value) : value;
    
    setFormData({ ...formData, [name]: parsedValue });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    // Log the change for debugging
    console.log(`Field ${name} changed to:`, parsedValue);
  };

  const handleCheckboxChange = (e, category) => {
    const { name, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, [category]: [...formData[category], name] });
    } else {
      setFormData({
        ...formData,
        [category]: formData[category].filter(item => item !== name)
      });
    }
    
    // Clear error for this category when user changes it
    if (errors[category]) {
      setErrors({
        ...errors,
        [category]: null
      });
    }
  };

  // Validate current step data
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;
    
    if (step === 1) {
      // Validate personal information
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        isValid = false;
      }
      if (!formData.district.trim()) {
        newErrors.district = 'District is required';
        isValid = false;
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
        isValid = false;
      }
    } else if (step === 2) {
      // Validate farm details
      if (!formData.farmSize || isNaN(parseFloat(formData.farmSize)) || parseFloat(formData.farmSize) <= 0) {
        newErrors.farmSize = 'Valid farm size is required';
        isValid = false;
      }
      if (!formData.soilType) {
        newErrors.soilType = 'Soil type is required';
        isValid = false;
      }
    } else if (step === 3) {
      // Validate farming experience
      if (formData.mainCrops.length === 0) {
        newErrors.mainCrops = 'Select at least one main crop';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`);
    
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
      console.warn(`Validation failed for step ${currentStep}`);
      return;
    }
    
    if (currentStep < 5) {
      // Force directly to step 5 if we're on step 4
      if (currentStep === 4) {
        console.log("Force navigating to step 5 (Interests)");
        setTimeout(() => {
          setCurrentStep(5);
          window.scrollTo(0, 0);
        }, 10);
      } else {
        setCurrentStep(prevStep => prevStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      console.warn("Attempted to go beyond the last step");
    }
  };

  const prevStep = () => {
    console.log(`Moving from step ${currentStep} to step ${currentStep - 1}`);
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    } else {
      console.warn("Attempted to go before the first step");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submission triggered. Current step:", currentStep);
    
    // Only process the actual submission if we're on the last step
    if (currentStep !== 5) {
      console.warn("Form submission attempted before reaching the final step. Preventing submission.");
      e.stopPropagation();
      return;
    }
    
    // Validate final step
    if (!validateStep(currentStep)) {
      console.warn("Final step validation failed. Preventing submission.");
      return;
    }
    
    // Log the complete form data
    console.log("Submitting form data:", formData);
    
    // Prepare the data for API submission
    const apiData = {
      personal: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        age: formData.age,
        gender: formData.gender,
        district: formData.district,
        state: formData.state
      },
      farm: {
        size: `${formData.farmSize} ${formData.unit}`,
        soilType: `${formData.soilType}`,
        nitrogenValue: formData.nitrogenValue,
        phosphorusValue: formData.phosphorusValue,
        potassiumValue: formData.potassiumValue,
        soilPh: formData.soilPh,
        irrigationSources: formData.irrigationSources,
        irrigationSystems: formData.irrigationSystems,
        mainCrops: formData.mainCrops,
        landOwnership: formData.landOwnership
      },
      financial: {
        annualIncome: formData.annualIncome,
        governmentSchemes: formData.governmentSchemes,
        cropInsurance: formData.cropInsurance,
        bankAccount: formData.bankAccount
      },
      preferences: {
        seasonalPreference: formData.seasonalPreference,
        organicFarming: formData.organicFarming,
        sustainablePractices: formData.sustainablePractices,
      },
      challenges: formData.challenges
    };
    
    // Make sure we preserve any existing ID when saving to localStorage
    const existingData = localStorage.getItem('farmerProfileData');
    let updatedApiData = apiData;
    
    if (existingData) {
      try {
        const parsedData = JSON.parse(existingData);
        if (parsedData.id) {
          console.log("Preserving existing ID from localStorage:", parsedData.id);
          updatedApiData = { ...apiData, id: parsedData.id };
        }
      } catch (e) {
        console.error("Error parsing existing profile data:", e);
      }
    }
    
    // Also preserve any ID from existingProfile prop
    if (existingProfile && existingProfile.id) {
      console.log("Preserving ID from existingProfile prop:", existingProfile.id);
      updatedApiData = { ...updatedApiData, id: existingProfile.id };
    }
    
    console.log("Saving to localStorage:", updatedApiData);
    localStorage.setItem('farmerProfileData', JSON.stringify(updatedApiData));
    console.log("Saved to localStorage. Verifying...");
    try {
      const savedData = localStorage.getItem('farmerProfileData');
      console.log("Verification - data in localStorage:", JSON.parse(savedData));
    } catch (e) {
      console.error("Error verifying localStorage data:", e);
    }
    
    try {
      console.log("Sending data to API:", updatedApiData);
      // Send the data to the backend API
      axios.post('/api/save-farmer-profile/', updatedApiData)
        .then(response => {
          console.log("API response:", response.data);
          
          if (response.data && response.data.success) {
            // Store the farmer ID for future API calls
            localStorage.setItem('farmerId', response.data.farmer_id);
            console.log("Saved farmerId to localStorage:", response.data.farmer_id);
            
            // Add ID to the profile data for onComplete callback
            const profileWithId = {
              ...updatedApiData,
              id: response.data.farmer_id
            };
            
            // Update localStorage with the ID included
            localStorage.setItem('farmerProfileData', JSON.stringify(profileWithId));
            console.log("Updated localStorage with profile containing ID:", profileWithId.id);
            
            // If onComplete callback exists, call it with the processed data
            if (onComplete) {
              console.log("Calling onComplete callback with profile data");
              onComplete(profileWithId);
            } else {
              // Otherwise redirect to recommendations page
              console.log("Profile setup complete, navigating to recommendations page");
              // Force a small delay before navigation to ensure localStorage is updated
              setTimeout(() => {
                console.log("Executing delayed navigation to recommendations page");
                navigate('/personalized-recommendations');
              }, 100);
            }
          } else {
            console.error("Profile save failed:", response.data?.message || "Unknown error");
            
            // Show error to the user
            setErrors({
              ...errors,
              submit: response.data?.message || "Failed to save profile. Please try again."
            });
            
            // Use local data as fallback
            handleApiFailure(updatedApiData);
          }
        })
        .catch(error => {
          console.error("Error saving farmer profile:", error);
          
          // Show appropriate error message
          let errorMessage = "Network error. Please try again.";
          
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 403) {
              errorMessage = "Permission denied. CORS error detected.";
            } else {
              errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`;
            }
          }
          
          setErrors({
            ...errors,
            submit: errorMessage
          });
          
          // Even on error, still process using localStorage data
          handleApiFailure(updatedApiData);
        });
    } catch (error) {
      console.error("Exception during API call:", error);
      setErrors({
        ...errors,
        submit: "An unexpected error occurred."
      });
      handleApiFailure(updatedApiData);
    }
  };
  
  // Helper function to handle API failures
  const handleApiFailure = (apiData) => {
    if (onComplete) {
      console.log("API failed but calling onComplete callback with local data");
      onComplete(apiData);
    } else {
      console.log("API failed, navigating to recommendations page with local data");
      // Force a small delay before navigation to ensure localStorage is updated
      setTimeout(() => {
        navigate('/personalized-recommendations');
      }, 100);
    }
  };

  // Step 1: Personal Info
  const renderPersonalInfo = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
          <ErrorMessage error={errors.firstName} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
          <ErrorMessage error={errors.lastName} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            placeholder="e.g., 35"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
          <ErrorMessage error={errors.district} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
          <ErrorMessage error={errors.state} />
        </div>
      </div>
    </div>
  );

  // Step 2: Farm Details
  const renderFarmDetails = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Farm Size <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="farmSize"
            value={formData.farmSize}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
          <ErrorMessage error={errors.farmSize} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Unit
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="Hectare">Hectare</option>
            <option value="Acre">Acre</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Land Ownership
          </label>
          <select
            name="landOwnership"
            value={formData.landOwnership}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="Owned">Owned</option>
            <option value="Leased">Leased</option>
            <option value="Shared">Shared</option>
          </select>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Soil Type <span className="text-red-500">*</span>
        </label>
        <select
          name="soilType"
          value={formData.soilType}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          required
        >
          <option value="Sandy">Sandy</option>
          <option value="Clay">Clay</option>
          <option value="Black">Black</option>
          <option value="Red">Red</option>
          <option value="Alluvial">Alluvial</option>
          <option value="Laterite">Laterite</option>
        </select>
        <ErrorMessage error={errors.soilType} />
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Soil Nutrient Information</h3>
        <p className="text-sm text-gray-500 mb-4">If you have soil test results, please enter the NPK values below</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Nitrogen (N) kg/ha
            </label>
            <input
              type="number"
              name="nitrogenValue"
              value={formData.nitrogenValue || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0.0"
              onBlur={(e) => {
                if (e.target.value !== '' && formData.nitrogenValue !== parseFloat(e.target.value)) {
                  setFormData({ ...formData, nitrogenValue: parseFloat(e.target.value) });
                }
              }}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Phosphorus (P) kg/ha
            </label>
            <input
              type="number"
              name="phosphorusValue"
              value={formData.phosphorusValue || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0.0"
              onBlur={(e) => {
                if (e.target.value !== '' && formData.phosphorusValue !== parseFloat(e.target.value)) {
                  setFormData({ ...formData, phosphorusValue: parseFloat(e.target.value) });
                }
              }}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Potassium (K) kg/ha
            </label>
            <input
              type="number"
              name="potassiumValue"
              value={formData.potassiumValue || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0.0"
              onBlur={(e) => {
                if (e.target.value !== '' && formData.potassiumValue !== parseFloat(e.target.value)) {
                  setFormData({ ...formData, potassiumValue: parseFloat(e.target.value) });
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Soil pH
        </label>
        <input
          type="number"
          name="soilPh"
          value={formData.soilPh || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          step="0.1"
          min="0"
          max="14"
          placeholder="0.0"
          onBlur={(e) => {
            if (e.target.value !== '' && formData.soilPh !== parseFloat(e.target.value)) {
              const parsedValue = parseFloat(e.target.value);
              setFormData({ ...formData, soilPh: parsedValue });
              console.log("pH value on blur:", parsedValue);
            }
          }}
        />
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Irrigation Sources (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Well', 'Borewell', 'Canal', 'River', 'Pond', 'Rainwater', 'None'].map(source => (
            <div key={source} className="flex items-center">
              <input
                type="checkbox"
                id={`irrigation-source-${source}`}
                name={source}
                checked={formData.irrigationSources.includes(source)}
                onChange={(e) => handleCheckboxChange(e, 'irrigationSources')}
                className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
              />
              <label htmlFor={`irrigation-source-${source}`} className="ml-2 text-sm text-gray-700">{source}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Irrigation Systems (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Drip', 'Sprinkler', 'Flood', 'Furrow', 'None'].map(system => (
            <div key={system} className="flex items-center">
              <input
                type="checkbox"
                id={`irrigation-system-${system}`}
                name={system}
                checked={formData.irrigationSystems.includes(system)}
                onChange={(e) => handleCheckboxChange(e, 'irrigationSystems')}
                className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
              />
              <label htmlFor={`irrigation-system-${system}`} className="ml-2 text-sm text-gray-700">{system}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 3: Experience
  const renderExperience = () => (
    <div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Main Crops Grown (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Rice', 'Wheat', 'Maize', 'Pulses', 'Sugarcane', 'Cotton', 'Vegetables', 'Fruits', 'Oil Seeds', 'Spices', 'Others'].map(crop => (
            <div key={crop} className="flex items-center">
              <input
                type="checkbox"
                id={`crop-${crop}`}
                name={crop}
                checked={formData.mainCrops.includes(crop)}
                onChange={(e) => handleCheckboxChange(e, 'mainCrops')}
                className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
              />
              <label htmlFor={`crop-${crop}`} className="ml-2 text-sm text-gray-700">{crop}</label>
            </div>
          ))}
        </div>
        <ErrorMessage error={errors.mainCrops} />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Seasonal Preference
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Kharif', 'Rabi', 'Zaid', 'Year-round'].map(season => (
            <div key={season} className="flex items-center">
              <input
                type="checkbox"
                id={`season-${season}`}
                name={season}
                checked={formData.seasonalPreference.includes(season)}
                onChange={(e) => handleCheckboxChange(e, 'seasonalPreference')}
                className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
              />
              <label htmlFor={`season-${season}`} className="ml-2 text-sm text-gray-700">{season}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Financial & Support
  const renderFinancial = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Annual Income
          </label>
          <select
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <option value="Below ₹1,00,000">Below ₹1,00,000</option>
            <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000</option>
            <option value="₹3,00,000 - ₹5,00,000">₹3,00,000 - ₹5,00,000</option>
            <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
            <option value="Above ₹10,00,000">Above ₹10,00,000</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Government Schemes Already Enrolled In (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'PM Kisan Samman Nidhi', 'Crop Insurance (PMFBY)', 'Soil Health Card',
              'Kisan Credit Card', 'PM Krishi Sinchai Yojana', 'Other Schemes'
            ].map(scheme => (
              <div key={scheme} className="flex items-center">
                <input
                  type="checkbox"
                  id={`scheme-${scheme}`}
                  name={scheme}
                  checked={formData.governmentSchemes.includes(scheme)}
                  onChange={(e) => handleCheckboxChange(e, 'governmentSchemes')}
                  className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
                />
                <label htmlFor={`scheme-${scheme}`} className="ml-2 text-sm text-gray-700">{scheme}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Do you have crop insurance?
          </label>
          <select
            name="cropInsurance"
            value={formData.cropInsurance}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Do you have a bank account?
          </label>
          <select
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
      
      {/* Instructions for next step */}
      <div className="text-center mt-6 mb-2">
        <p className="text-sm">
          Click the "Next" button below to move to the Interests & Challenges step.
        </p>
      </div>
    </div>
  );

  // Step 5: Interests and Challenges
  const renderInterests = () => (
    <div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Challenges Faced (Select at least one) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            'Water Scarcity', 'Market Access', 'Price Volatility',
            'Input Costs', 'Financial Constraints', 'Credit Access',
            'Irrigation Management', 'Crop Financing', 'Seed Quality',
            'Technology Access',
            // Loan-specific challenges
            'Collateral Requirements', 'High Interest Rates', 
            'Processing Delays', 'Seasonal Cash Flow',
            'Documentation Complexity', 'Limited Credit History',
            'Infrastructure Development', 'Farm Mechanization Costs',
            'Post-harvest Financing', 'Loan Repayment Flexibility'
          ].map(challenge => (
            <div key={challenge} className="flex items-center">
              <input
                type="checkbox"
                id={`challenge-${challenge}`}
                name={challenge}
                checked={formData.challenges.includes(challenge)}
                onChange={(e) => handleCheckboxChange(e, 'challenges')}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor={`challenge-${challenge}`} className="ml-2 text-sm text-gray-700">{challenge}</label>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Selecting challenges helps us provide targeted recommendations</p>
      </div>
      
      <div className="text-center mt-4">
        <p className="font-bold">You're on the final step! Just select your challenges, then click "Save and Get Recommendations" below!</p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    console.log(`Rendering content for step ${currentStep}`);
    
    const content = (() => {
      switch (currentStep) {
        case 1:
          return renderPersonalInfo();
        case 2:
          return renderFarmDetails();
        case 3:
          return renderExperience();
        case 4:
          return renderFinancial();
        case 5:
          return renderInterests();
        default:
          console.warn(`Unknown step: ${currentStep}, defaulting to step 1`);
          return renderPersonalInfo();
      }
    })();
    
    return (
      <div className="step-content" data-step={currentStep}>
        {content}
      </div>
    );
  };

  // Add error display component
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    
    return (
      <div className="text-red-500 text-sm mt-1">
        {error}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden font-sans">
      <div className="bg-green-500 text-white py-6 px-4">
        <h1 className="text-2xl font-bold text-center">Farmer Profile Setup</h1>
        <p className="text-center">Complete your profile to get personalized recommendations</p>
        <p className="text-center font-bold mt-2">Current Step: {currentStep} of 5</p>
      </div>
      
      <div className="p-6">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-10 relative">
          {/* Line connecting the steps */}
          <div className="absolute h-0.5 bg-gray-200 top-1/2 transform -translate-y-1/2 left-0 right-0 z-0"></div>
          
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center z-10 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step 
                    ? 'bg-green-500 text-white' 
                    : currentStep > step 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-base font-medium">{step}</span>
              </div>
              <div className="text-xs font-medium mt-2 text-center text-gray-700">
                {step === 1 && "Personal"}
                {step === 2 && "Farm Details"}
                {step === 3 && "Crop Selection"}
                {step === 4 && "Financial"}
                {step === 5 && "Challenges"}
              </div>
            </div>
          ))}
        </div>
        
        {/* Step Header - Separate from the progress steps */}
        <div className="mb-8">
          {currentStep === 1 && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                <span className="text-base font-medium">1</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700">Personal Information</h2>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                <span className="text-base font-medium">2</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700">Farm Details</h2>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                <span className="text-base font-medium">3</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700">Crop Selection</h2>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                <span className="text-base font-medium">4</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700">Financial & Support Information</h2>
              </div>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                <span className="text-base font-medium">5</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700">Challenges</h2>
              </div>
            </div>
          )}
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="farmer-profile-form"
          onKeyDown={(e) => {
            // Prevent form submission when pressing Enter key
            if (e.key === "Enter" && currentStep < 5) {
              e.preventDefault();
              console.log("Enter key pressed - preventing form submission");
              // If on step 4, go to step 5
              if (currentStep === 4) {
                nextStep();
              }
            }
          }}
        >
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  nextStep();
                }}
                className="flex items-center px-4 py-2 border border-transparent text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ml-auto"
                data-testid="next-button"
              >
                {currentStep === 4 ? "Go to Interests" : "Next"}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center px-6 py-2 border border-transparent text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ml-auto"
                data-testid="submit-button"
              >
                Save and Get Recommendations
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Only show debugging info when not in production */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <p>Current Step: {currentStep} of 5</p>
              <p>Component Status: {currentStep === 5 ? 'On Interests Form' : currentStep === 4 ? 'On Financial Form' : `On Step ${currentStep}`}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FarmerProfileSetup; 