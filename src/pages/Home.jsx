import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleViewMenu = () => {
    navigate('/menu');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Barcode App</h1>
          <p className="text-xl text-gray-600 mb-6">View our digital menu and special offers</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="mb-6 text-lg">Please log in to access all features</p>
              <div className="space-y-4">
                <button 
                  onClick={handleLoginRedirect} 
                  className="w-full md:w-1/2 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition duration-300"
                >
                  Login
                </button>
                <p>Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link></p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold mb-4">Browse Our Menu</h2>
              <p className="text-gray-600 mb-6">Check out our delicious food options</p>
              <button
                onClick={handleViewMenu}
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition duration-300"
              >
                View Menu
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Special</h2>
            <p className="text-gray-600 mb-2">Check out our chef's special menu items for today!</p>
            <Link to="/menu" className="text-blue-600 hover:underline">View Menu</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
            <p className="text-gray-600 mb-2">Don't miss our limited time offers and discounts!</p>
            <Link to="/offers" className="text-blue-600 hover:underline">View Offers</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;