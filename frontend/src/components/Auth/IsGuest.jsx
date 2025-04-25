import axios from 'axios';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';


const IsGuest = ({ children }) => {
  const token =localStorage.getItem('token');
  const navigate = useNavigate();

  if (token) {
    return <Navigate to="/" />; // Redirect to home if token exists
  } 


  return children;
};

export default IsGuest;