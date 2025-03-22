import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to requests
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

// Auth services
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

// Menu services
export const getMenuItems = () => api.get('/menu');
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const createMenuItem = (menuItem) => {
  const formData = new FormData();
  
  // Append text fields
  Object.keys(menuItem).forEach(key => {
    if (key !== 'image') {
      formData.append(key, menuItem[key]);
    }
  });
  
  // Append image if exists
  if (menuItem.image instanceof File) {
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
    if (key !== 'image') {
      formData.append(key, menuItem[key]);
    }
  });
  
  // Append image if exists
  if (menuItem.image instanceof File) {
    formData.append('image', menuItem.image);
  }
  
  return api.put(`/menu/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

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
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// QR Code services
export const getQRCodes = () => api.get('/qrcodes');
export const getQRCode = (id) => api.get(`/qrcodes/${id}`);
export const createQRCode = (qrCode) => api.post('/qrcodes', qrCode);
export const deleteQRCode = (id) => api.delete(`/qrcodes/${id}`);

export default api;