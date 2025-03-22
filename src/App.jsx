import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import Settings from './pages/dashboard/Settings';

function App() {
  return (
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/menu" element={<MenuManagement />} />
        <Route path="/dashboard/offers" element={<OffersManagement />} />
        <Route path="/dashboard/users" element={<UserManagement />} />
        <Route path="/dashboard/qr-codes" element={<QRCodeManagement />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;