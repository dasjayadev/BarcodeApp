import React, { useState, useEffect, useMemo } from 'react';
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
    image: null,
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false, 
      isGlutenFree: false
    }
  });

  // Add new state for custom category input
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Add state for tracking expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});

  // Add new state for pagination
  const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items per page
  const [currentPage, setCurrentPage] = useState({}); // Track current page for each category

  // Move this up before any useEffect hooks that need it
  const groupedMenuItems = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [menuItems]); // Only recalculate when menuItems changes

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

  // Initial loading effect - set all categories to be initially expanded
  useEffect(() => {
    if (menuItems.length > 0) {
      const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
      const initialExpandState = {};
      uniqueCategories.forEach(cat => {
        initialExpandState[cat] = true; // Initially expand all categories
      });
      setExpandedCategories(initialExpandState);
    }
  }, [menuItems.length]);

  // Initialize current pages for each category
  useEffect(() => {
    if (Object.keys(groupedMenuItems).length > 0) {
      const initialPages = {};
      Object.keys(groupedMenuItems).forEach(categoryId => {
        initialPages[categoryId] = 1; // Start on page 1 for each category
      });
      setCurrentPage(initialPages);
    }
  }, [groupedMenuItems]); // Now correctly depends on groupedMenuItems

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a handler for dietary info checkboxes
  const handleDietaryChange = (e) => {
    const { name, checked } = e.target;
    setMenuItem(prev => ({
      ...prev,
      dietaryInfo: {
        ...prev.dietaryInfo,
        [name]: checked
      }
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
      image: null,
      dietaryInfo: {
        isVegetarian: false,
        isVegan: false, 
        isGlutenFree: false
      }
    });
    setImagePreview(null);
  };

  const handleEditItem = (item) => {
    setIsEditing(true);
    setCurrentItemId(item._id);
    setMenuItem({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      // Ensure dietaryInfo has all properties, with defaults if missing
      dietaryInfo: {
        isVegetarian: item.dietaryInfo?.isVegetarian || false,
        isVegan: item.dietaryInfo?.isVegan || false,
        isGlutenFree: item.dietaryInfo?.isGlutenFree || false
      },
      // existing image handling
      image: null
    });
    
    // Set image preview if exists
    if (item.image) {
      setImagePreview(item.image.startsWith('/') ? `http://localhost:5000${item.image}` : item.image);
    } else {
      setImagePreview(null);
    }
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

  // Function to toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Function to handle page change for a specific category
  const handlePageChange = (categoryId, pageNumber) => {
    setCurrentPage(prev => ({
      ...prev,
      [categoryId]: pageNumber
    }));
  };

  // Function to paginate items for a specific category
  const getPaginatedItems = (categoryId, items) => {
    const page = currentPage[categoryId] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Function to calculate total pages for a category
  const getTotalPages = (items) => {
    return Math.ceil(items.length / itemsPerPage);
  };

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
              
              {/* Add Dietary Information section before the image upload */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Dietary Information
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVegetarian"
                      checked={menuItem.dietaryInfo?.isVegetarian || false}
                      onChange={handleDietaryChange}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                    <span className="ml-2 text-gray-700">Vegetarian</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVegan"
                      checked={menuItem.dietaryInfo?.isVegan || false}
                      onChange={handleDietaryChange}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                    <span className="ml-2 text-gray-700">Vegan</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isGlutenFree"
                      checked={menuItem.dietaryInfo?.isGlutenFree || false}
                      onChange={handleDietaryChange}
                      className="form-checkbox h-5 w-5 text-yellow-600"
                    />
                    <span className="ml-2 text-gray-700">Gluten-Free</span>
                  </label>
                </div>
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
          
          {/* Menu Items by Category with Pagination */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Menu Items</h2>

            {/* Items per page selector */}
            <div className="mb-4 flex items-center">
              <label className="text-sm text-gray-600 mr-2">Items per page:</label>
              <select 
                className="border rounded p-1 text-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            
            {Object.keys(groupedMenuItems).length === 0 ? (
              <p className="text-gray-500">No menu items found. Add an item to get started.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Collapsible header */}
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer hover:bg-gray-200"
                      onClick={() => toggleCategory(category)}
                    >
                      <h3 className="text-lg font-medium">
                        {categories.find(cat => cat._id === category)?.name || 'Uncategorized'} 
                        <span className="text-gray-500 ml-2 text-sm">
                          ({items.length} item{items.length !== 1 ? 's' : ''})
                        </span>
                      </h3>
                      <div className="flex items-center">
                        {/* Toggle icon */}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 transition-transform duration-200 ${expandedCategories[category] ? 'transform rotate-180' : ''}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Collapsible content with pagination */}
                    {expandedCategories[category] && (
                      <>
                        <div className="divide-y divide-gray-200">
                          {getPaginatedItems(category, items).map(item => (
                            <div key={item._id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50">
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
                                  <div className="flex items-center">
                                    <p className="text-sm text-gray-600">₹{parseFloat(item.price).toFixed(2)}</p>
                                    
                                    {/* Dietary icons */}
                                    {item.dietaryInfo && (
                                      <div className="flex ml-2 space-x-1">
                                        {item.dietaryInfo.isVegetarian && (
                                          <span title="Vegetarian" className="inline-block px-1 text-xs bg-green-100 text-green-800 rounded">V</span>
                                        )}
                                        {item.dietaryInfo.isVegan && (
                                          <span title="Vegan" className="inline-block px-1 text-xs bg-green-100 text-green-800 rounded">Ve</span>
                                        )}
                                        {item.dietaryInfo.isGlutenFree && (
                                          <span title="Gluten-Free" className="inline-block px-1 text-xs bg-yellow-100 text-yellow-800 rounded">GF</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item._id)}
                                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Pagination controls */}
                        {items.length > itemsPerPage && (
                          <div className="bg-gray-50 py-2 px-3 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Page {currentPage[category] || 1} of {getTotalPages(items)}
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePageChange(category, Math.max(1, (currentPage[category] || 1) - 1))}
                                disabled={(currentPage[category] || 1) === 1}
                                className={`px-2 py-1 text-sm rounded ${
                                  (currentPage[category] || 1) === 1 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                Previous
                              </button>
                              
                              {/* Page numbers */}
                              <div className="flex space-x-1">
                                {Array.from({ length: Math.min(3, getTotalPages(items)) }, (_, i) => {
                                  // Show current page and adjacent pages
                                  const current = currentPage[category] || 1;
                                  let pageNum;
                                  
                                  if (getTotalPages(items) <= 3) {
                                    // If 3 or fewer pages, show all page numbers
                                    pageNum = i + 1;
                                  } else if (current <= 2) {
                                    // If near start, show first 3 pages
                                    pageNum = i + 1;
                                  } else if (current >= getTotalPages(items) - 1) {
                                    // If near end, show last 3 pages
                                    pageNum = getTotalPages(items) - 2 + i;
                                  } else {
                                    // Otherwise show current and adjacent pages
                                    pageNum = current - 1 + i;
                                  }
                                  
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => handlePageChange(category, pageNum)}
                                      className={`w-7 h-7 flex items-center justify-center rounded ${
                                        pageNum === (currentPage[category] || 1)
                                          ? 'bg-blue-500 text-white'
                                          : 'hover:bg-gray-200'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}
                                
                                {/* Show ellipsis if needed */}
                                {getTotalPages(items) > 3 && (currentPage[category] || 1) < getTotalPages(items) - 1 && (
                                  <span className="px-1">...</span>
                                )}
                                
                                {/* Always show last page if there are more than 3 pages */}
                                {getTotalPages(items) > 3 && (
                                  <button
                                    onClick={() => handlePageChange(category, getTotalPages(items))}
                                    className={`w-7 h-7 flex items-center justify-center rounded ${
                                      (currentPage[category] || 1) === getTotalPages(items)
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-200'
                                    }`}
                                  >
                                    {getTotalPages(items)}
                                  </button>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handlePageChange(
                                  category, 
                                  Math.min(getTotalPages(items), (currentPage[category] || 1) + 1)
                                )}
                                disabled={(currentPage[category] || 1) === getTotalPages(items)}
                                className={`px-2 py-1 text-sm rounded ${
                                  (currentPage[category] || 1) === getTotalPages(items) 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Category summary */}
            {Object.keys(groupedMenuItems).length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                {Object.keys(groupedMenuItems).length} categories, {menuItems.length} total items
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;