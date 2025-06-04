import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';

const ProtectedCompanyRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!token || !userData) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    if (!(userData.role === 'company')) {
      navigate('/unauthorized', { replace: true });
      return;
    }

    setAuthChecked(true);
  }, [location, navigate]);

  if (!authChecked) {
    return <div className="p-4">Verifying access...</div>;
  }

  return <Outlet />;
};

export default ProtectedCompanyRoute;