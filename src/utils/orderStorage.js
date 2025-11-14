// Utility functions to manage order history in localStorage
// Note: This is now used as a cache/fallback. Primary source is backend API.

const ORDER_STORAGE_KEY = 'barcodeapp_orders';
const MAX_STORED_ORDERS = 10; // Keep last 10 orders
const COMPLETED_ORDER_EXPIRY_MINUTES = 15; // Remove completed+paid orders after 15 minutes

export const saveOrder = (orderId, tableId, orderData) => {
  try {
    const orders = getStoredOrders();
    
    // Check if order already exists
    const existingOrderIndex = orders.findIndex(o => o.orderId === orderId);
    
    // Prepare order data
    const orderInfo = {
      orderId,
      tableId,
      tableNumber: orderData?.table?.tableNumber || orderData?.tableNumber || 'Unknown',
      createdAt: existingOrderIndex >= 0 ? orders[existingOrderIndex].createdAt : new Date().toISOString(),
      status: orderData?.status || 'pending',
      totalAmount: orderData?.totalAmount || 0,
      itemsCount: orderData?.items?.length || 0,
      updatedAt: new Date().toISOString()
    };
    
    let updatedOrders;
    if (existingOrderIndex >= 0) {
      // Update existing order (preserve createdAt, update status and other fields)
      updatedOrders = [...orders];
      updatedOrders[existingOrderIndex] = { ...updatedOrders[existingOrderIndex], ...orderInfo };
      // Move to beginning
      updatedOrders = [updatedOrders[existingOrderIndex], ...updatedOrders.filter((_, i) => i !== existingOrderIndex)];
    } else {
      // Add new order to the beginning
      updatedOrders = [orderInfo, ...orders];
    }
    
    // Keep only last MAX_STORED_ORDERS
    updatedOrders = updatedOrders.slice(0, MAX_STORED_ORDERS);
    
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
    return true;
  } catch (error) {
    console.error('Error saving order to localStorage:', error);
    return false;
  }
};

export const getStoredOrders = () => {
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    const orders = stored ? JSON.parse(stored) : [];
    
    // Filter out expired completed orders
    const now = new Date();
    const expiryTime = COMPLETED_ORDER_EXPIRY_MINUTES * 60 * 1000; // 24 minutes
    
    return orders.filter(order => {
      // Keep non-completed orders
      if (order.status !== 'completed' || order.paymentStatus !== 'paid') {
        return true;
      }
      
      // For completed+paid orders, check if they're expired
      const updatedAt = new Date(order.updatedAt || order.createdAt);
      const age = now - updatedAt;
      return age < expiryTime;
    });
  } catch (error) {
    console.error('Error reading orders from localStorage:', error);
    return [];
  }
};

export const getOrderById = (orderId) => {
  const orders = getStoredOrders();
  return orders.find(o => o.orderId === orderId);
};

export const getOrdersByTable = (tableId) => {
  const orders = getStoredOrders();
  return orders.filter(o => o.tableId === tableId);
};

export const getLatestOrder = () => {
  const orders = getStoredOrders();
  return orders.length > 0 ? orders[0] : null;
};

export const clearOrderHistory = () => {
  try {
    localStorage.removeItem(ORDER_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing order history:', error);
    return false;
  }
};

// Clean up expired completed orders from localStorage
export const cleanupExpiredOrders = () => {
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!stored) return true;
    
    const orders = JSON.parse(stored);
    const now = new Date();
    const expiryTime = COMPLETED_ORDER_EXPIRY_MINUTES * 60 * 1000; // 15 minutes
    
    // Filter out expired completed+paid orders
    const validOrders = orders.filter(order => {
      // Keep non-completed orders
      if (order.status !== 'completed' || order.paymentStatus !== 'paid') {
        return true;
      }
      
      // For completed+paid orders, check if they're expired
      const updatedAt = new Date(order.updatedAt || order.createdAt);
      const age = now - updatedAt;
      return age < expiryTime;
    });
    
    // Update localStorage with cleaned orders
    if (validOrders.length !== orders.length) {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(validOrders));
    }
    
    return true;
  } catch (error) {
    console.error('Error cleaning up expired orders:', error);
    return false;
  }
};

// Initialize cleanup on module load
if (typeof window !== 'undefined') {
  // Run cleanup immediately
  cleanupExpiredOrders();
  
  // Run cleanup every hour
  setInterval(cleanupExpiredOrders, 60 * 60 * 1000);
}

