import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';


const ProtectedRoute = ({ children }) => {
    const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({ loading: true, verified: false });

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = response.data.data;
        localStorage.setItem("user", JSON.stringify(user));
        if (!user.is_verified && location.pathname !== '/verify-email') {
          navigate('/verify-email', {
            state: {
              from: location,
              email: user.email // Pass the user's email
            },
            replace: true
          });
        } else {
          setAuthState({ loading: false, verified: true });
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    verifyAuth();
  }, [token, location, navigate]);

  if (authState.loading) {
    return <div>Loading...</div>;
  }

  return authState.verified ? children : null;
};

export default ProtectedRoute;