import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create a public API instance (no auth required)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to requests (only for authenticated api)
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle unauthorized errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access detected');
      // Only redirect to login for non-public routes
      const path = window.location.pathname;
      if (!path.startsWith('/menu') && 
          !path.startsWith('/login') && 
          !path.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

// Menu services
export const getMenuItems = () => api.get('/menu');
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const getCategories = () => api.get('/menu/categories');  // Updated path
export const createMenuItem = (menuItem) => {
  const formData = new FormData();
  
  // Append text fields
  Object.keys(menuItem).forEach(key => {
    if (key !== 'image' && key !== 'dietaryInfo') {
      formData.append(key, menuItem[key] !== undefined && menuItem[key] !== null ? menuItem[key] : '');
    }
  });

  // Handle dietary info specifically - convert from nested object to flat fields
  if (menuItem.dietaryInfo) {
    Object.keys(menuItem.dietaryInfo).forEach(dietKey => {
      formData.append(dietKey, menuItem.dietaryInfo[dietKey] ? 'true' : 'false');
    });
  }
  
  // Append image if exists
  if (menuItem.image) {
    formData.append('image', menuItem.image);
  }
  
  return api.post('/menu', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const updateMenuItem = (id, menuItem) => {
  const formData = new FormData();
  
  // Append text fields
  Object.keys(menuItem).forEach(key => {
    if (key !== 'image' && key !== 'dietaryInfo') {
      formData.append(key, menuItem[key] !== undefined && menuItem[key] !== null ? menuItem[key] : '');
    }
  });

  // Handle dietary info specifically - convert from nested object to flat fields
  if (menuItem.dietaryInfo) {
    Object.keys(menuItem.dietaryInfo).forEach(dietKey => {
      formData.append(dietKey, menuItem.dietaryInfo[dietKey] ? 'true' : 'false');
    });
  }
  
  // Append image if exists
  if (menuItem.image) {
    formData.append('image', menuItem.image);
  }
  
  return api.put(`/menu/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Public endpoints (no authentication required)
export const getPublicMenuItems = () => publicApi.get('/public/menu');
export const getPublicMenuItem = (id) => publicApi.get(`/public/menu/${id}`);
export const getPublicCategories = () => publicApi.get('/public/menu/categories');
export const getPublicTable = (id) => publicApi.get(`/public/tables/${id}`);
export const getPublicTableMenu = (id) => publicApi.get(`/public/tables/${id}/menu`);
// Add public order endpoint for guests
export const createPublicOrder = (order) => publicApi.post('/public/orders', order);

// Offers services
export const getOffers = () => api.get('/offers');
export const getActiveOffers = () => api.get('/offers/status/active');
export const getOffer = (id) => api.get(`/offers/${id}`);
export const createOffer = (offer) => api.post('/offers', offer);
export const updateOffer = (id, offer) => api.put(`/offers/${id}`, offer);
export const deleteOffer = (id) => api.delete(`/offers/${id}`);

// User services
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, userData) => {
  if (!id) {
    throw new Error('User ID is required for update');
  }
  return api.put(`/users/${id}`, userData);
};

export const deleteUser = (id) => api.delete(`/users/${id}`);

// QR Code services
export const getQRCodes = (query = {}) => api.get('/qrcodes', { params: query });
export const getQRCode = (id) => api.get(`/qrcodes/${id}`);
export const createQRCode = (qrCode) => api.post('/qrcodes', qrCode);
export const createGlobalMenuQR = (baseUrl) => api.post('/qrcodes/global-menu', { baseUrl });
export const deleteQRCode = (id) => api.delete(`/qrcodes/${id}`);

// Table services
export const getTables = () => api.get('/tables');
export const getTable = (id) => publicApi.get(`/tables/public/${id}`);
export const createTable = (table) => api.post('/tables', table);
export const updateTable = (id, table) => api.put(`/tables/${id}`, table);
export const deleteTable = (id) => api.delete(`/tables/${id}`);
export const generateTableQR = (id, baseUrl) => api.post(`/tables/${id}/qrcode`, { baseUrl });

// Order services
export const getOrders = (query = {}) => api.get('/orders', { params: query });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (order) => api.post('/orders', order);
// For guest orders, use this helper to choose the right API
export const placeOrder = (order, isGuest = false) => 
  isGuest ? createPublicOrder(order) : createOrder(order);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const updateOrderPayment = (id, paymentStatus) => api.put(`/orders/${id}/payment`, { paymentStatus });

export default api;