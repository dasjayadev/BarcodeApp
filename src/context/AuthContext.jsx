import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/api';

export const AuthContext = createContext(null);

// Define routes that don't require authentication
const publicRoutes = [
  '/menu',
  '/login',
  '/register',
  '/public'
];

// Helper function to check if a route is public
export const isPublicRoute = (path) => {
  // Extract the base path without query parameters
  const basePath = path.split('?')[0];
  
  // Check if the base path starts with any public route
  return publicRoutes.some(route => basePath.startsWith(route));
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tableId, setTableId] = useState(null); // Track table ID for guest orders

  useEffect(() => {
    // Check for table parameter in URL for guest ordering
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setTableId(tableParam);
      // Store table ID in session storage for persistence across pages
      sessionStorage.setItem('guestTableId', tableParam);
    } else {
      // Check if we have a stored table ID
      const storedTableId = sessionStorage.getItem('guestTableId');
      if (storedTableId) {
        setTableId(storedTableId);
      }
    }

    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        isAuthenticated, 
        loading, 
        login, 
        logout,
        isPublicRoute,
        tableId,
        isGuestOrder: !!tableId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
