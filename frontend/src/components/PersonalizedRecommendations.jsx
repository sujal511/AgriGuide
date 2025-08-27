import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CropRecommendations from './recommendations/CropRecommendations';
import GovernmentSchemes from './recommendations/GovernmentSchemes';
import LoanOptions from './recommendations/LoanOptions';
import Technology from './recommendations/Technology';
import FarmerProfileSetup from './FarmerProfileSetup';
import FarmerProfileDetails from './profile/FarmerProfileDetails';
import NewUserWelcome from './NewUserWelcome';

const PersonalizedRecommendations = ({ farmerProfile }) => {
  const [activeTab, setActiveTab] = useState('crops');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [farmerId, setFarmerId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  // Debug logging
  console.log('PersonalizedRecommendations component rendering with profile:', farmerProfile);

  // Get profile data and farmerId from props or localStorage
  useEffect(() => {
    console.log("PersonalizedRecommendations useEffect running with farmerProfile:", farmerProfile);
    
    // First check if there's profile data in localStorage
    const storedProfileData = localStorage.getItem('farmerProfileData');
    let storedProfile = null;
    
    if (storedProfileData) {
      try {
        storedProfile = JSON.parse(storedProfileData);
        console.log("Loaded profile data from localStorage:", storedProfile);
        
        // Always set the profile data from localStorage, even if we already have data from props
        // This ensures we have the most up-to-date data
        setProfileData(storedProfile);
        console.log("Updated profileData state with localStorage data");
        
        // Extract name from the stored profile data for display
        if (storedProfile?.personal?.firstName) {
          // Create a combined full name
          const fullName = `${storedProfile.personal.firstName} ${storedProfile.personal.lastName || ''}`.trim();
          storedProfile.personal.name = fullName;
          console.log("Created fullName from profile data:", fullName);
        }
      } catch (e) {
        console.error("Error parsing stored profile data:", e);
        // If parsing failed, treat as a new user
        setIsNewUser(true);
        console.log("Setting isNewUser to true due to parsing error");
      }
    } else {
      // No profile data in localStorage, mark as new user
      console.log("No profile data found in localStorage, marking as new user");
      setIsNewUser(true);
    }
    
    // Check for farmerId (from API response or manually stored)
    // First try to use farmerId from props
    if (farmerProfile?.id) {
      console.log("Using farmerId from props:", farmerProfile.id);
      setFarmerId(farmerProfile.id);
      localStorage.setItem('farmerId', farmerProfile.id);
      // If we have an ID but marked as new user, unmark
      if (isNewUser) {
        setIsNewUser(false);
        console.log("Unmarking as new user because farmerId found in props");
      }
    } else {
      // If no ID in props, try to get from localStorage
      const storedFarmerId = localStorage.getItem('farmerId');
      if (storedFarmerId) {
        console.log("Using farmerId from localStorage:", storedFarmerId);
        setFarmerId(parseInt(storedFarmerId, 10));
        // If we have an ID but marked as new user, unmark
        if (isNewUser) {
          setIsNewUser(false);
          console.log("Unmarking as new user because farmerId found in localStorage");
        }
      } else if (storedProfile?.id) {
        // Try to get ID from stored profile
        console.log("Using farmerId from stored profile:", storedProfile.id);
        setFarmerId(storedProfile.id);
        localStorage.setItem('farmerId', storedProfile.id);
        // If we have an ID but marked as new user, unmark
        if (isNewUser) {
          setIsNewUser(false);
          console.log("Unmarking as new user because farmerId found in stored profile");
        }
      } else {
        console.log("No farmerId available. Will mark as new user.");
        setIsNewUser(true);
      }
    }
    
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      console.log("Setting loading to false after timeout");
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [farmerProfile, isNewUser]); // Add isNewUser as dependency to re-run effect if it changes

  // Only use the provided profile or localStorage profile
  // Do not use sample data for new users - show the welcome component instead
  const profile = farmerProfile || profileData;
  
  // Remove sample data creation for testing - we'll use the welcome component instead
  
  // Check if profile is complete
  // Make sure both personal and farm sections exist and have the required fields
  const isProfileComplete = useMemo(() => {
    if (!profile) {
      console.log("Profile is null, not complete");
      return false;
    }
    
    const hasPersonalSection = profile.personal && 
      profile.personal.firstName && 
      profile.personal.lastName;
    
    const hasFarmSection = profile.farm && 
      (profile.farm.size || (profile.farm.farmSize && profile.farm.unit)) && 
      profile.farm.soilType;
    
    console.log("Profile completeness check:", {
      hasPersonalSection,
      hasFarmSection,
      isComplete: hasPersonalSection && hasFarmSection
    });
    
    return hasPersonalSection && hasFarmSection;
  }, [profile]);
  
  // Debug profile data structure
  useEffect(() => {
    console.log('DEBUG - Profile data structure:');
    console.log('Profile used in component:', profile);
    if (profile) {
      console.log('Personal section:', profile.personal);
      console.log('Farm section:', profile.farm);
      console.log('Financial section:', profile.financial);
      console.log('Preferences section:', profile.preferences);
      console.log('Challenges:', profile.challenges);
      console.log('Is profile complete?', isProfileComplete);
    } else {
      console.log('No profile data available');
      console.log('Is new user?', isNewUser);
    }
  }, [profile, isProfileComplete, isNewUser]);

  const handleEditProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(true);
  };

  const handleCreateProfile = () => {
    // Called from the NewUserWelcome component
    setIsEditingProfile(true);
    setIsNewUser(false); // Once they start creating a profile, they're no longer a "new" user
  };

  const handleProfileComplete = (updatedProfile) => {
    console.log("Profile update complete:", updatedProfile);
    // Update the profile data in state
    setProfileData(updatedProfile);
    setIsEditingProfile(false);
    setIsNewUser(false);
    
    // If the updated profile has an ID, use it
    if (updatedProfile?.id) {
      setFarmerId(updatedProfile.id);
      localStorage.setItem('farmerId', updatedProfile.id);
    }
    
    // Force reload the stored profile from localStorage
    try {
      const refreshedProfileData = localStorage.getItem('farmerProfileData');
      if (refreshedProfileData) {
        const parsedProfile = JSON.parse(refreshedProfileData);
        console.log("Refreshed profile data from localStorage:", parsedProfile);
        setProfileData(parsedProfile);
      }
    } catch (e) {
      console.error("Error refreshing profile data:", e);
    }
    
    // Force a re-render by setting loading briefly to true then false
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Function to receive and store crop recommendations for use in the Dashboard
  const handleCropRecommendationsUpdate = (recommendations) => {
    if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
      console.log("PersonalizedRecommendations received updated crop recommendations:", recommendations.length);
      
      // Create data object with timestamp to ensure freshness tracking
      const recommendationsWithTimestamp = {
        timestamp: Date.now(),
        data: recommendations
      };
      
      // Store in localStorage for dashboard access
      localStorage.setItem('personalizedCropRecommendations', JSON.stringify(recommendationsWithTimestamp));
      console.log("PersonalizedRecommendations stored recommendations with timestamp:", new Date(recommendationsWithTimestamp.timestamp).toLocaleString());
    }
  };

  // If we're editing the profile, show the profile setup component
  if (isEditingProfile) {
    console.log("Opening profile for editing with data:", profile);
    return <FarmerProfileSetup existingProfile={profile} onComplete={handleProfileComplete} />;
  }

  // If it's a new user, show the welcome component
  if (isNewUser) {
    return <NewUserWelcome onCreateProfile={handleCreateProfile} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'crops':
        return <CropRecommendations 
                 farmerId={farmerId} 
                 onRecommendationsUpdate={handleCropRecommendationsUpdate} 
               />;
      case 'schemes':
        return <GovernmentSchemes farmerId={farmerId} />;
      case 'loans':
        return <LoanOptions farmerId={farmerId} />;
      case 'technology':
        return <Technology farmerId={farmerId} />;
      default:
        return <CropRecommendations 
                 farmerId={farmerId} 
                 onRecommendationsUpdate={handleCropRecommendationsUpdate} 
               />;
    }
  };

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
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-3 text-gray-600">Loading recommendations...</p>
          </div>
        ) : !isProfileComplete ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Profile Incomplete</h2>
            <p className="text-gray-600 mb-6">Please complete your farmer profile to get personalized recommendations.</p>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Complete Profile
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <FarmerProfileDetails 
                profileData={profile} 
                onEditProfile={handleEditProfile} 
              />
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setActiveTab('crops')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'crops'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Crop Recommendations
                </button>
                <button
                  onClick={() => setActiveTab('schemes')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'schemes'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Government Schemes
                </button>
                <button
                  onClick={() => setActiveTab('loans')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'loans'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Loan Options
                </button>
                <button
                  onClick={() => setActiveTab('technology')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'technology'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Agricultural Technology
                </button>
              </nav>
            </div>

            {renderContent()}
          </>
        )}
      </main>
    </div>
  );
};

export default PersonalizedRecommendations; 