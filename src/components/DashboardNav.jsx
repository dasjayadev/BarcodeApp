import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState(null);
  
  // Navigation items with role restrictions
  const navItems = [
    { path: '/dashboard', label: 'Dashboard Overview', roles: ['owner', 'manager'] },
    { path: '/dashboard/menu', label: 'Menu Management', roles: ['owner', 'manager'] },
    { path: '/dashboard/tables', label: 'Table Management', roles: ['owner', 'manager'] },
    { path: '/dashboard/orders', label: 'Order Management', roles: ['owner', 'manager', 'staff'] },
    { path: '/dashboard/offers', label: 'Offers Management', roles: ['owner', 'manager'] },
    { path: '/dashboard/users', label: 'User Management', roles: ['owner'] },
    { path: '/dashboard/qr-codes', label: 'QR Code Management', roles: ['owner', 'manager'] },
    { path: '/dashboard/settings', label: 'Settings', roles: ['owner', 'manager', 'staff'] }
  ];
  
  // Get user role from local storage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const tokenStr = localStorage.getItem('authToken');
      
      console.log('Auth token exists:', !!tokenStr);
      console.log('User data exists:', !!userStr);
      
      if (!userStr || !tokenStr) {
        setUserRole('guest');
        console.warn('Missing authentication data');
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        console.log('User data parsed:', user);
        
        if (!user || !user.role) {
          setUserRole('guest');
          console.warn('User object or role is missing');
          return;
        }
        
        setUserRole(user.role);
        console.log('Current user role set to:', user.role);
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
        setError('Invalid user data format');
        setUserRole('guest');
      }
    } catch (error) {
      console.error('Error getting user role:', error);
      setError('Error loading user data');
      setUserRole('guest');
    }
  }, []);
  
  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles.length || item.roles.includes(userRole)
  );

  // If no items match user role, show at least the dashboard for anyone
  const itemsToDisplay = filteredNavItems.length > 0 
    ? filteredNavItems 
    : [{ path: '/dashboard', label: 'Dashboard', roles: [] }];

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>Error: {error}. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 mb-6 rounded shadow">
      {userRole && (
        <div className="mb-2 text-sm text-gray-600">
          Logged in as: <span className="font-bold">{userRole}</span>
        </div>
      )}
      <nav>
        <ul className="flex flex-wrap gap-1">
          {itemsToDisplay.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-2 rounded ${
                  currentPath === item.path
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardNav;
