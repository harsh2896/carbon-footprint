import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Auth from '../../utils/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!Auth.loggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
