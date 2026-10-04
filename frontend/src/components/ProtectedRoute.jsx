import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      ADMIN: '/dashboard/admin',
      VENDOR: '/dashboard/vendor',
      CUSTOMER: '/dashboard/customer',
    };
    return <Navigate to={redirectMap[user.role] || '/products'} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;