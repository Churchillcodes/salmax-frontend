import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center">
        {/* Luxury Premium Loader */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-gold/10"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
        </div>
        <span className="font-serif text-sm tracking-widest text-gold uppercase animate-pulse">
          SALMAX
        </span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save current location to return after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If authenticated but not an admin, send back to home
    return <Navigate to="/" replace />;
  }

  return children;
}
