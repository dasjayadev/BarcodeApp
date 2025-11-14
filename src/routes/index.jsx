import React, { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const Home = lazy(() => import('../pages/Home'));
const Menu = lazy(() => import('../pages/Menu'));
const Offers = lazy(() => import('../pages/Offers'));
const About = lazy(() => import('../pages/About'));
const Login = lazy(() => import('../pages/Login'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const OrderTracking = lazy(() => import('../pages/OrderTracking'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MenuManagement = lazy(() => import('../pages/dashboard/MenuManagement'));
const OffersManagement = lazy(() => import('../pages/dashboard/OffersManagement'));
const UserManagement = lazy(() => import('../pages/dashboard/UserManagement'));
const QRCodeManagement = lazy(() => import('../pages/dashboard/QRCodeManagement'));
const TableManagement = lazy(() => import('../pages/dashboard/TableManagement'));
const OrderManagement = lazy(() => import('../pages/dashboard/OrderManagement'));
const Settings = lazy(() => import('../pages/dashboard/Settings'));
const OldDashboard = lazy(() => import('../pages/OldDashboard'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);
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
  { path: '/', element: <SuspenseWrapper><Home /></SuspenseWrapper> },
  { path: '/menu', element: <SuspenseWrapper><Menu /></SuspenseWrapper> },
  { path: '/offers', element: <SuspenseWrapper><Offers /></SuspenseWrapper> },
  { path: '/about', element: <SuspenseWrapper><About /></SuspenseWrapper> },
  { path: '/login', element: <SuspenseWrapper><Login /></SuspenseWrapper> },
  { path: '/forgot-password', element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper> },
  { path: '/reset-password', element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper> },
  { path: '/order-tracking/:orderId', element: <SuspenseWrapper><OrderTracking /></SuspenseWrapper> },
  { path: '/old', element: <SuspenseWrapper><OldDashboard /></SuspenseWrapper> },
];

// Protected routes
export const protectedRoutes = [
  {
    path: '/dashboard',
    element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>,
    requiredRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/dashboard/menu',
    element: <SuspenseWrapper><MenuManagement /></SuspenseWrapper>,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/offers',
    element: <SuspenseWrapper><OffersManagement /></SuspenseWrapper>,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/users',
    element: <SuspenseWrapper><UserManagement /></SuspenseWrapper>,
    requiredRoles: ['owner']
  },
  {
    path: '/dashboard/qr-codes',
    element: <SuspenseWrapper><QRCodeManagement /></SuspenseWrapper>,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/tables',
    element: <SuspenseWrapper><TableManagement /></SuspenseWrapper>,
    requiredRoles: ['owner', 'manager']
  },
  {
    path: '/dashboard/orders',
    element: <SuspenseWrapper><OrderManagement /></SuspenseWrapper>,
    requiredRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/dashboard/settings',
    element: <SuspenseWrapper><Settings /></SuspenseWrapper>,
    requiredRoles: []
  }
]; 