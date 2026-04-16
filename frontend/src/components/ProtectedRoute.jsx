import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
