/* eslint-disable no-constant-binary-expression */
// API configuration with environment-aware base URL
export const API_CONFIG = {
  // In production environments:
  // - First try using VITE_API_URL environment variable
  // - Then try using the deployed Vercel URL
  // - Finally fall back to same-origin (empty string) if using same domain
  //
  // In development environments:
  // - First try using VITE_API_URL environment variable
  // - Then fall back to localhost:5000
  // !uncomment the line below to use the Vercel URL
  // BASE_URL: import.meta.env.PROD 
  //   ? (import.meta.env.VITE_API_URL || 'https://barcode-app-backend.vercel.app' || '')
  //   : (import.meta.env.VITE_API_URL || 'http://localhost:5000'),
    
  // in Local client Development:
  BASE_URL: 'https://barcode-app-backend.vercel.app',
  // Add API path prefix
  API_PATH: '/api',
  
  // Helper method to get full API URL
  getApiUrl: function() {
    return this.BASE_URL + this.API_PATH;
  }
};