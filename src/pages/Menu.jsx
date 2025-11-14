import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPublicMenuItems, getPublicTable, createPublicOrder, getPublicCategories } from '../services/api';
import { ShoppingCart, Search, X, Plus, Minus, CheckCircle, Package, History } from 'lucide-react';
import { saveOrder, getOrdersByTable, getLatestOrder } from '../utils/orderStorage';
import { getPublicOrdersByTable } from '../services/api';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false
  });
  
  // Table and order state
  const [table, setTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get table ID from URL query parameters
  const tableId = new URLSearchParams(location.search).get('table');
  
  useEffect(() => {
    // Fetch menu items and categories
    fetchData();
    
    // If table ID is provided, fetch table info
    if (tableId) {
      fetchTableInfo(tableId);
      fetchTableOrders(tableId);
    } else {
      // If no table, check for latest order from localStorage (fallback)
      const latestOrder = getLatestOrder();
      if (latestOrder) {
        setRecentOrders([latestOrder]);
      }
    }
  }, [tableId]);

  // Fetch orders from backend API
  const fetchTableOrders = async (tableId) => {
    try {
      const response = await getPublicOrdersByTable(tableId, false); // Don't include old completed orders
      const orders = response.data || [];
      
      // Filter out expired completed orders on frontend as well (double check)
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const activeOrders = orders.filter(order => {
        // Keep all non-completed orders
        if (order.status !== 'completed' || order.paymentStatus !== 'paid') {
          return true;
        }
        // For completed+paid, only keep if less than 24 hours old
        const updatedAt = new Date(order.updatedAt || order.createdAt);
        return (now - updatedAt.getTime()) < twentyFourHours;
      });
      
      // Transform backend orders to match UI format
      const formattedOrders = activeOrders.map(order => ({
        orderId: order._id,
        tableId: order.table?._id || order.table,
        tableNumber: order.table?.tableNumber || 'Unknown',
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        itemsCount: order.items?.length || 0,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt || order.createdAt
      }));
      
      setRecentOrders(formattedOrders);
      
      // Also save to localStorage as cache (only non-expired)
      activeOrders.forEach(order => {
        if (order._id && order.table) {
          saveOrder(order._id, order.table._id || order.table, order);
        }
      });
    } catch (error) {
      console.error('Error fetching table orders:', error);
      // Fallback to localStorage
      const tableOrders = getOrdersByTable(tableId);
      setRecentOrders(tableOrders);
    }
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch categories first using public API
      const categoriesResponse = await getPublicCategories();
      const categoryData = categoriesResponse.data;
      
      // Create a map of category IDs to names
      const catMap = {};
      categoryData.forEach(cat => {
        catMap[cat._id] = cat.name;
      });
      setCategoryMap(catMap);
      
      // Then fetch menu items using public API
      const menuResponse = await getPublicMenuItems();
      setMenuItems(menuResponse.data);
      
      // Extract unique category IDs
      const uniqueCategoryIds = [...new Set(menuResponse.data.map(item => item.category))];
      setCategories(uniqueCategoryIds);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu items. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };
  
  const fetchTableInfo = async (id) => {
    try {
      const response = await getPublicTable(id);
      setTable(response.data);
    } catch {
      setError('Invalid table QR code');
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleFilter = (filter) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  // Filter menu items based on search query and dietary filters
  const filteredMenuItems = menuItems.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Dietary filters
    const matchesVegetarian = !filters.vegetarian || item.dietaryInfo?.isVegetarian;
    const matchesVegan = !filters.vegan || item.dietaryInfo?.isVegan;
    const matchesGlutenFree = !filters.glutenFree || item.dietaryInfo?.isGlutenFree;
    
    return matchesSearch && matchesVegetarian && matchesVegan && matchesGlutenFree;
  });
  
  // Group menu items by category
  const menuItemsByCategory = categories.map(categoryId => ({
    categoryId,
    categoryName: categoryMap[categoryId] || "Uncategorized",
    items: filteredMenuItems.filter(item => item.category === categoryId)
  }));
  
  // Cart functions
  const addToCart = (menuItem) => {
    setCart(prevCart => {
      // Check if item is already in cart
      const itemInCart = prevCart.find(item => item._id === menuItem._id);
      
      if (itemInCart) {
        // Increment quantity if already in cart
        return prevCart.map(item => 
          item._id === menuItem._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { ...menuItem, quantity: 1 }];
      }
    });
  };
  
  const removeFromCart = (menuItemId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== menuItemId));
  };
  
  const updateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => prevCart.map(item => 
      item._id === menuItemId ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!tableId || !cart.length) {
      setError('Cannot place order. Please add items to your cart.');
      return;
    }
    
    try {
      setPlacingOrder(true);
      setError('');
      
      // Format order items for API
      const orderItems = cart.map(item => ({
        menuItem: item._id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const response = await createPublicOrder({
        tableId,
        items: orderItems,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        notes: customerInfo.notes
      });
      
      // Save order to localStorage for cache
      if (response.data?._id) {
        saveOrder(response.data._id, tableId, response.data);
      }
      
      // Refresh recent orders from backend after placing order
      if (tableId) {
        await fetchTableOrders(tableId);
      }
      
      // Reset cart and show success message
      setCart([]);
      setCustomerInfo({ name: '', email: '', notes: '' });
      setOrderSuccess(true);
      setShowOrderForm(false);
      setShowCart(false);
      
      // Redirect to order tracking after 2 seconds
      if (response.data?._id) {
        setTimeout(() => {
          navigate(`/order-tracking/${response.data._id}`);
        }, 2000);
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setOrderSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-4">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Our Menu</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* Table Info Section (if accessing from a table QR code) */}
        {table && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl mb-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-semibold">Table {table.tableNumber}</h2>
                <p className="text-sm md:text-base opacity-90">Place your order directly from here!</p>
                {recentOrders.length > 0 && (
                  <button
                    onClick={() => setShowOrderHistory(!showOrderHistory)}
                    className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    <History size={14} />
                    View Order History ({recentOrders.length})
                  </button>
                )}
              </div>
              {cartItemCount > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition"
                >
                  <ShoppingCart size={20} />
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs absolute -top-2 -right-2">
                    {cartItemCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order History Dropdown */}
        {table && showOrderHistory && recentOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <History size={18} />
                Your Recent Orders
              </h3>
              <button
                onClick={() => setShowOrderHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
                    <p className="text-sm text-gray-600 mt-1">
                      {order.itemsCount} items • ₹{order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => navigate(`/order-tracking/${order.orderId}`)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition"
                    >
                      Track
                    </button>
                    {(order.status === 'pending' || order.status === 'preparing') && (
                      <button
                        onClick={() => {
                          setShowOrderHistory(false);
                          // User can continue ordering - they're already on the menu page
                        }}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
                        title="Continue ordering from this table"
                      >
                        Add More
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Order Success Message */}
        {orderSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            <div className="flex-1">
              <p className="font-semibold">Order placed successfully!</p>
              <p className="text-sm">Your order has been received and will be prepared shortly.</p>
              <p className="text-sm mt-1">Redirecting to order tracking...</p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold">{error}</p>
          </div>
        )}
        
        {/* Search & Filter Section */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for dishes..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium mb-2 md:mb-0"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${filters.vegetarian ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => toggleFilter('vegetarian')}
              >
                🌱 Vegetarian
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${filters.vegan ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => toggleFilter('vegan')}
              >
                🌿 Vegan
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${filters.glutenFree ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => toggleFilter('glutenFree')}
              >
                🌾 Gluten-Free
              </button>
            </div>
          )}
        </div>
      
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        ) : menuItemsByCategory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-600 text-lg">No menu items found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-500 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Menu Categories */}
            {menuItemsByCategory.map(({ categoryId, categoryName, items }) => (
              items.length > 0 && (
                <div key={categoryId} className="category">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-200 text-gray-900">
                    {categoryName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map(item => {
                      const itemInCart = cart.find(cartItem => cartItem._id === item._id);
                      const itemQuantity = itemInCart ? itemInCart.quantity : 0;
                      
                      return (
                        <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          {item.image && (
                            <div className="relative w-full h-48 overflow-hidden">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                              <p className="text-lg font-bold text-blue-600 ml-2">₹{item.price.toFixed(2)}</p>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                            
                            {/* Dietary Info Tags */}
                            {(item.dietaryInfo?.isVegetarian || item.dietaryInfo?.isVegan || item.dietaryInfo?.isGlutenFree) && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.dietaryInfo?.isVegetarian && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">🌱 Veg</span>
                                )}
                                {item.dietaryInfo?.isVegan && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">🌿 Vegan</span>
                                )}
                                {item.dietaryInfo?.isGlutenFree && (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">🌾 GF</span>
                                )}
                              </div>
                            )}
                            
                            {/* Add to Cart Button (only show if a table is selected) */}
                            {table && (
                              <div className="mt-3">
                                {itemQuantity > 0 ? (
                                  <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                                    <button
                                      onClick={() => updateQuantity(item._id, itemQuantity - 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <span className="font-semibold text-gray-900">{itemQuantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item._id, itemQuantity + 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus size={18} />
                                    Add to Order
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile Cart Button */}
      {table && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 right-4 md:hidden bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition z-50"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}

      {/* Cart Sidebar/Drawer */}
      {showCart && table && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {cart.map(item => (
                <div key={item._id} className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">₹{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowOrderForm(true);
                  }}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Complete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Cart Summary */}
      {table && cart.length > 0 && (
        <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-700">{cartItemCount} item(s) in order</p>
                <p className="text-xl font-bold text-blue-600">Total: ₹{cartTotal.toFixed(2)}</p>
              </div>
              <button 
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                onClick={() => setShowOrderForm(true)}
              >
                <ShoppingCart size={20} />
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowOrderForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Order</h2>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-900">Order Summary</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-blue-600">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Name (Optional)</label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Special Instructions</label>
                <textarea
                  name="notes"
                  value={customerInfo.notes}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or dietary requirements?"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  onClick={() => setShowOrderForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={placingOrder}
                >
                  {placingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;