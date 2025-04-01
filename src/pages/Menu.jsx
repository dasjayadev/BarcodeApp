import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMenuItems, getTable, createOrder, getCategories } from '../services/api';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false
  });
  
  // Table and order state
  const [table, setTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  
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
    }
  }, [tableId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories first
      const categoriesResponse = await getCategories();
      const categoryData = categoriesResponse.data;
      
      // Create a map of category IDs to names
      const catMap = {};
      categoryData.forEach(cat => {
        catMap[cat._id] = cat.name;
      });
      setCategoryMap(catMap);
      
      // Then fetch menu items
      const menuResponse = await getMenuItems();
      setMenuItems(menuResponse.data);
      
      // Extract unique category IDs
      const uniqueCategoryIds = [...new Set(menuResponse.data.map(item => item.category))];
      setCategories(uniqueCategoryIds);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu items');
      setLoading(false);
      console.error(err);
    }
  };
  
  const fetchTableInfo = async (id) => {
    try {
      const response = await getTable(id);
      setTable(response.data);
    } catch (err) {
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
      
      // Format order items for API
      const orderItems = cart.map(item => ({
        menuItem: item._id,
        quantity: item.quantity,
        price: item.price
      }));
      
      await createOrder({
        tableId,
        items: orderItems,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        notes: customerInfo.notes
      });
      
      // Reset cart and show success message
      setCart([]);
      setOrderSuccess(true);
      setShowOrderForm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setOrderSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Menu</h1>
      
      {/* Table Info Section (if accessing from a table QR code) */}
      {table && (
        <div className="bg-blue-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold">Table {table.tableNumber}</h2>
          <p>You can place an order directly from this table!</p>
        </div>
      )}
      
      {/* Order Success Message */}
      {orderSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Order placed successfully!</p>
          <p>Your order has been received and will be prepared shortly.</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Search & Filter Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Search & Filter</h2>
        <input 
          type="text" 
          placeholder="Search for dishes..." 
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded ${filters.vegetarian ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleFilter('vegetarian')}
          >
            Vegetarian
          </button>
          <button 
            className={`px-4 py-2 rounded ${filters.vegan ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleFilter('vegan')}
          >
            Vegan
          </button>
          <button 
            className={`px-4 py-2 rounded ${filters.glutenFree ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleFilter('glutenFree')}
          >
            Gluten-Free
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center py-4">Loading menu...</p>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Menu Categories */}
          {menuItemsByCategory.map(({ categoryId, categoryName, items }) => (
            items.length > 0 && (
              <div key={categoryId} className="category">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">{categoryName}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map(item => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {item.image && (
                        <img 
                          src={item.image.startsWith('/') ? `http://localhost:5000${item.image}` : item.image} 
                          alt={item.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-medium">{item.name}</h3>
                          <p className="text-lg font-bold">₹{item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-gray-600 mt-2">{item.description}</p>
                        
                        {/* Dietary Info Tags */}
                        {(item.dietaryInfo?.isVegetarian || item.dietaryInfo?.isVegan || item.dietaryInfo?.isGlutenFree) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.dietaryInfo?.isVegetarian && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Vegetarian</span>
                            )}
                            {item.dietaryInfo?.isVegan && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Vegan</span>
                            )}
                            {item.dietaryInfo?.isGlutenFree && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Gluten-Free</span>
                            )}
                          </div>
                        )}
                        
                        {/* Add to Cart Button (only show if a table is selected) */}
                        {table && (
                          <button 
                            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            onClick={() => addToCart(item)}
                          >
                            Add to Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
      
      {/* Cart Section */}
      {table && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{cart.length} item(s) in order</p>
                <p className="text-lg font-bold">Total: ₹{calculateTotal().toFixed(2)}</p>
              </div>
              <button 
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={() => setShowOrderForm(true)}
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4">Complete Your Order</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between items-center border-b py-2">
                    <div className="flex items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600">₹{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button 
                        className="ml-3 text-red-500"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <p className="text-lg font-bold">Total: ₹{calculateTotal().toFixed(2)}</p>
              </div>
            </div>
            
            <form onSubmit={handlePlaceOrder}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Optional"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Optional"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  name="notes"
                  value={customerInfo.notes}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Any special requests?"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  onClick={() => setShowOrderForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  disabled={placingOrder}
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
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