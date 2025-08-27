import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// AdminRoute component to protect admin routes
const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if user data in localStorage indicates admin status
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData.is_admin) {
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        }

        // Call API to check if user is admin
        const response = await axios.get('http://localhost:8000/api/check-admin/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.data.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Fallback to user data from localStorage if API call fails
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setIsAdmin(userData.is_admin === true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If user is not admin, redirect to login
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // If user is admin, render the child routes
  return <Outlet />;
};

export default AdminRoute; 