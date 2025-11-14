import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Search, History } from 'lucide-react';
import { getStoredOrders, getLatestOrder } from '../utils/orderStorage';
import { getPublicOrder } from '../services/api';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showOrderLookup, setShowOrderLookup] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    
    // Load recent orders from localStorage (filtered for non-expired)
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    // Get from localStorage first (fast)
    const storedOrders = getStoredOrders();
    const recentStored = storedOrders.slice(0, 3);
    
    // Update order statuses from backend for accuracy
    const updatedOrders = await Promise.all(
      recentStored.map(async (order) => {
        try {
          const response = await getPublicOrder(order.orderId);
          const orderData = response.data;
          return {
            ...order,
            status: orderData.status,
            paymentStatus: orderData.paymentStatus,
            totalAmount: orderData.totalAmount,
            itemsCount: orderData.items?.length || 0
          };
        } catch (error) {
          // If order not found or error, filter it out
          return null;
        }
      })
    );
    
    // Filter out null values and expired completed orders
    const validOrders = updatedOrders.filter(order => {
      if (!order) return false;
      
      // Filter out completed+paid orders older than 24 hours
      if (order.status === 'completed' && order.paymentStatus === 'paid') {
        const updatedAt = new Date(order.updatedAt || order.createdAt);
        const age = Date.now() - updatedAt.getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return age < twentyFourHours;
      }
      
      return true;
    });
    
    setRecentOrders(validOrders);
  };

  const handleOrderLookup = (e) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      navigate(`/order-tracking/${orderIdInput.trim()}`);
    }
  };

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
        
        {/* Order Lookup Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package size={24} className="text-blue-600" />
              Track Your Order
            </h2>
            {recentOrders.length > 0 && (
              <button
                onClick={() => setShowOrderLookup(!showOrderLookup)}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <History size={16} />
                {showOrderLookup ? 'Hide' : 'Show'} Recent Orders
              </button>
            )}
          </div>
          
          <form onSubmit={handleOrderLookup} className="flex gap-2 mb-4">
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter your order ID (e.g., 123456)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Search size={18} />
              Track
            </button>
          </form>

          {recentOrders.length > 0 && showOrderLookup && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/order-tracking/${order.orderId}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-600" />
                        <span className="font-medium text-gray-900">
                          Order #{order.orderId.substring(order.orderId.length - 6).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'served' ? 'bg-pink-100 text-pink-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Table {order.tableNumber} • ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order-tracking/${order.orderId}`);
                      }}
                      className="ml-3 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
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