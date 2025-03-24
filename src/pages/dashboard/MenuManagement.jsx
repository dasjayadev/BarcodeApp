import React, { useState, useEffect } from 'react';
import DashboardNav from '../../components/DashboardNav';
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api';

const MenuManagement = () => {
  // State for menu items and categories
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Menu item form state
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null
  });

  // Add new state for custom category input
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Fetch menu items and categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch menu items
      const itemsResponse = await getMenuItems();
      setMenuItems(itemsResponse.data);
      
      try {
        // Fetch categories in a separate try-catch to handle potential category-specific errors
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.data || []);
        
        // If we have items but no categories, extract category info from items
        if ((!categoriesResponse.data || categoriesResponse.data.length === 0) && itemsResponse.data.length > 0) {
          const uniqueCategories = extractCategoriesFromItems(itemsResponse.data);
          setCategories(uniqueCategories);
        }
      } catch (catErr) {
        console.error('Failed to fetch categories:', catErr);
        // If categories fetch fails, try to extract categories from menu items
        if (itemsResponse.data && itemsResponse.data.length > 0) {
          const uniqueCategories = extractCategoriesFromItems(itemsResponse.data);
          setCategories(uniqueCategories);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.message || 'Failed to load menu data');
      setIsLoading(false);
    }
  };

  // Helper function to extract unique categories from menu items
  const extractCategoriesFromItems = (items) => {
    const categoryMap = new Map();
    
    items.forEach(item => {
      if (item.category) {
        // If category is an object with _id and name
        if (typeof item.category === 'object' && item.category._id) {
          categoryMap.set(item.category._id, {
            _id: item.category._id,
            name: item.category.name
          });
        } 
        // If category is a string ID
        else if (typeof item.category === 'string') {
          categoryMap.set(item.category, {
            _id: item.category,
            name: item.categoryName || `Category ${categoryMap.size + 1}`
          });
        }
      }
    });
    
    return Array.from(categoryMap.values());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuItem(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    setIsEditing(false);
    setMenuItem({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null
    });
    setImagePreview(null);
  };

  const handleEditItem = (item) => {
    setIsEditing(true);
    setCurrentItemId(item._id);
    setMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: null // We don't set the existing image as a file
    });
    setImagePreview(item.image); // Use the existing image URL as preview
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setIsLoading(true);
        await deleteMenuItem(itemId);
        
        setSuccess('Item deleted successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        
        fetchData(); // Refresh the data
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete item');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!menuItem.name || !menuItem.description || !menuItem.price) {
        setError('Please fill in all required fields: name, description, and price');
        setIsLoading(false);
        return;
      }
      
      // Create the menu item data to send
      let updatedMenuItem = { ...menuItem };
      
      // If using a custom category that's not in the dropdown
      if (showCustomCategory && customCategory.trim() !== '') {
        updatedMenuItem.category = customCategory.trim();
        updatedMenuItem.newCategory = 'true'; // Flag to indicate this is a new category - send as string
      } else if (!updatedMenuItem.category) {
        setError('Please select a category or create a new one');
        setIsLoading(false);
        return;
      }
      
      if (isEditing) {
        await updateMenuItem(currentItemId, updatedMenuItem);
        setSuccess('Item updated successfully!');
      } else {
        await createMenuItem(updatedMenuItem);
        setSuccess('Item created successfully!');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Reset form
      handleAddItem();
      setShowCustomCategory(false);
      setCustomCategory('');
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (isLoading && menuItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <DashboardNav />
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Menu Management</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
            <button 
              className="text-red-700 font-bold" 
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            <p>{success}</p>
            <button 
              className="text-green-700 font-bold" 
              onClick={() => setSuccess(null)}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Menu Item Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Update Menu Item' : 'Add New Menu Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={menuItem.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={menuItem.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="price">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={menuItem.price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="category">
                  Category
                </label>
                
                {!showCustomCategory ? (
                  <>
                    <select
                      id="category"
                      name="category"
                      value={menuItem.category}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                      required={!showCustomCategory}
                      disabled={showCustomCategory}
                    >
                      <option value="">Select a category</option>
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No categories available</option>
                      )}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setShowCustomCategory(true)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      + Add New Category
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                      required={showCustomCategory}
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomCategory(false);
                        setCustomCategory('');
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="image">
                  Image
                </label>
                <div className="flex flex-col items-center">
                  {imagePreview && (
                    <div className="mb-3">
                      <img 
                        src={typeof imagePreview === 'string' ? imagePreview : URL.createObjectURL(imagePreview)} 
                        alt="Preview" 
                        className="h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                       onClick={() => document.getElementById('image').click()}>
                    <p className="text-gray-500">Click to upload an image or drag and drop</p>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  {isEditing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Menu Items by Category */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
            
            {Object.keys(groupedMenuItems).length === 0 ? (
              <p className="text-gray-500">No menu items found. Add an item to get started.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category} className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">
                      {categories.find(cat => cat._id === category)?.name || 'Uncategorized'}
                    </h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item._id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm">
                          <div className="flex items-center">
                            {item.image && (
                              <img 
                                src={item.image.startsWith('/') ? `http://localhost:5000${item.image}` : item.image} 
                                alt={item.name} 
                                className="h-12 w-12 object-cover rounded mr-3"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">${parseFloat(item.price).toFixed(2)}</p>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;