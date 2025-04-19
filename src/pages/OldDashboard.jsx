import React from 'react';
import { Link } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/dashboard/menu" className="block p-4 bg-gray-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Menu Management</h2>
          <p>Manage your menu items here.</p>
        </Link>
        <Link to="/dashboard/tables" className="block p-4 bg-blue-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Table Management</h2>
          <p>Manage tables and generate table QR codes.</p>
        </Link>
        <Link to="/dashboard/orders" className="block p-4 bg-green-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Order Management</h2>
          <p>View and manage customer orders.</p>
        </Link>
        <Link to="/dashboard/users" className="block p-4 bg-gray-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">User Management</h2>
          <p>Manage your staff members here.</p>
        </Link>
        <Link to="/dashboard/qr-codes" className="block p-4 bg-gray-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">QR Code Management</h2>
          <p>Generate and manage other QR codes.</p>
        </Link>
        <Link to="/dashboard/offers" className="block p-4 bg-gray-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Special Offers Management</h2>
          <p>Manage your special offers here.</p>
        </Link>
        <Link to="/dashboard/settings" className="block p-4 bg-gray-100 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p>Manage your account settings here.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;