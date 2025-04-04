import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Offers from './pages/Offers';
import About from './pages/About';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/dashboard/MenuManagement';
import OffersManagement from './pages/dashboard/OffersManagement';
import UserManagement from './pages/dashboard/UserManagement';
import QRCodeManagement from './pages/dashboard/QRCodeManagement';
import TableManagement from './pages/dashboard/TableManagement';
import OrderManagement from './pages/dashboard/OrderManagement';
import Settings from './pages/dashboard/Settings';
import NewDashboard from './pages/NewDashboard';

// Protected route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role restrictions if applicable
  if (requiredRoles.length > 0 && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (!requiredRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      return <Navigate to="/login" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path='/new' element={<NewDashboard/>} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRoles={['owner', 'manager']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/menu" element={
            <ProtectedRoute requiredRoles={['owner', 'manager']}>
              <MenuManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/offers" element={
            <ProtectedRoute requiredRoles={['owner', 'manager']}>
              <OffersManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/users" element={
            <ProtectedRoute requiredRoles={['owner']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/qr-codes" element={
            <ProtectedRoute requiredRoles={['owner', 'manager']}>
              <QRCodeManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/tables" element={
            <ProtectedRoute requiredRoles={['owner', 'manager']}>
              <TableManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/orders" element={
            <ProtectedRoute requiredRoles={['owner', 'manager', 'staff']}>
              <OrderManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;