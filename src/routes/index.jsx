import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Menu from '../pages/Menu';
import Offers from '../pages/Offers';
import About from '../pages/About';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import MenuManagement from '../pages/dashboard/MenuManagement';
import OffersManagement from '../pages/dashboard/OffersManagement';
import UserManagement from '../pages/dashboard/UserManagement';
import QRCodeManagement from '../pages/dashboard/QRCodeManagement';
import TableManagement from '../pages/dashboard/TableManagement';
import OrderManagement from '../pages/dashboard/OrderManagement';
import Settings from '../pages/dashboard/Settings';
import OldDashboard from '../pages/OldDashboard';
// Protected route component
export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles.length > 0 && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (!requiredRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.log(error)
      return <Navigate to="/login" replace />;
    }
  }
  
  return children;
};

// Public routes
export const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/menu', element: <Menu /> },
  { path: '/offers', element: <Offers /> },
  { path: '/about', element: <About /> },
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/old', element: <OldDashboard /> },
];

// Protected routes
export const protectedRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    requiredRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/dashboard/menu',
    element: <MenuManagement />,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/offers',
    element: <OffersManagement />,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/users',
    element: <UserManagement />,
    requiredRoles: ['owner']
  },
  {
    path: '/dashboard/qr-codes',
    element: <QRCodeManagement />,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/tables',
    element: <TableManagement />,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/orders',
    element: <OrderManagement />,
    requiredRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/dashboard/settings',
    element: <Settings />,
    requiredRoles: []
  }
]; 