import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedAdminRoute = ({ redirectPath = '/login-admin' }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null: loading, false: redirect, true: show

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Validasi token expired atau bukan admin
      if (decoded.exp * 1000 < Date.now() || decoded.role !== 'admin') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminToken');
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminToken');
      setIsAuthorized(false);
    }
  }, []);

  if (isAuthorized === null) {
    return <div className="py-20 text-center text-gray-500">Checking access...</div>; // loading
  }

  if (isAuthorized === false) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
