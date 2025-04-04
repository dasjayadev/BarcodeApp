import React, { useState, useEffect } from 'react';
import { getQRCodes, deleteQRCode, createGlobalMenuQR } from '../../services/api';
import DashboardNav from '../../components/DashboardNav';

const QRCodeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Restaurant menu QR specific state
  const [restaurantQR, setRestaurantQR] = useState(null);

  useEffect(() => {
    fetchGlobalQRCode();
  }, []);

  const fetchGlobalQRCode = async () => {
    try {
      setLoading(true);
      // Only fetch global QR codes
      const response = await getQRCodes({ type: 'global' });
      
      // Find restaurant menu QR if it exists
      const menuQR = response.data.find(qr => 
        qr.section === 'Global Menu' || qr.section === 'Restaurant QR Code'
      );
      
      if (menuQR) {
        setRestaurantQR(menuQR);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch QR code');
      setLoading(false);
    }
  };

  const handleGenerateMenuQR = async () => {
    setError('');
    setSuccess('');
    setGenerating(true);
    
    try {
      // Get the base URL from the browser
      const baseUrl = window.location.origin;
      await createGlobalMenuQR(baseUrl);
      setSuccess('Restaurant Menu QR Code generated successfully');
      fetchGlobalQRCode(); // Refresh to show the new QR
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate restaurant menu QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        await deleteQRCode(id);
        setSuccess('QR Code deleted successfully');
        setRestaurantQR(null);
        fetchGlobalQRCode();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete QR code');
      }
    }
  };

  // Helper function to print a QR code
  const handlePrint = (qrCode) => {
    if (!qrCode) return;
    
    const printWindow = window.open('', '_blank');
    const API_BASE_URL = "http://localhost:5000"; // Adjust based on your setup
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Restaurant QR Code</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 300px; }
            .container { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${qrCode.section}</h2>
            <img src="${API_BASE_URL}${qrCode.code}" />
            <p>Scan to access our restaurant menu</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <h1 className="text-3xl font-bold text-center mb-6">Restaurant QR Code Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-lg mx-auto">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 max-w-lg mx-auto">
          {success}
        </div>
      )}
      
      {/* Restaurant Menu QR Code Section */}
      <div className="max-w-lg mx-auto p-6 border rounded-lg bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Global Restaurant Menu QR Code</h2>
        <p className="text-gray-600 mb-6 text-center">
          Generate a QR code that customers can scan to view your restaurant's full menu.
          This QR code can be printed and placed on tables or at the entrance.
        </p>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading QR code...</p>
          </div>
        ) : restaurantQR ? (
          <div className="text-center">
            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <img 
                src={restaurantQR.code.startsWith('/') ? `http://localhost:5000${restaurantQR.code}` : restaurantQR.code}
                alt="Restaurant Menu QR Code" 
                className="mx-auto w-64 h-64"
              />
            </div>
            <p className="text-gray-700 mb-5">
              This QR code will direct customers to your restaurant's full digital menu.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a 
                href={restaurantQR.code.startsWith('/') ? `http://localhost:5000${restaurantQR.code}` : restaurantQR.code}
                download="restaurant-menu-qr.png"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Download QR Code
              </a>
              <button
                onClick={() => handlePrint(restaurantQR)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Print QR Code
              </button>
              <button
                onClick={() => handleDelete(restaurantQR._id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete & Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <p className="mb-4">No restaurant menu QR code found. Generate one now!</p>
              <button 
                onClick={handleGenerateMenuQR}
                disabled={generating}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition"
              >
                {generating ? 'Generating...' : 'Generate Restaurant Menu QR'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeManagement;