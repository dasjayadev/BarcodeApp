import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';

const Home = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data?.text || data);
      // Redirect to the menu page after successful scan
      navigate('/menu');
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Barcode App</h1>
          <p className="text-xl text-gray-600 mb-6">Scan QR codes to view our digital menu and special offers</p>
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
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">QR Code Scanner</h2>
                <p className="text-gray-600 mb-6">Scan a QR code to view our menu</p>
                
                {!showScanner && (
                  <button
                    onClick={() => setShowScanner(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition duration-300"
                  >
                    Start Scanner
                  </button>
                )}
              </div>
              
              {showScanner && (
                <div className="max-w-md mx-auto">
                  <QrReader
                    constraints={{ facingMode: 'environment' }}
                    delay={300}
                    onError={handleError}
                    onResult={handleScan}
                    style={{ width: '100%' }}
                  />
                  <button
                    onClick={() => setShowScanner(false)}
                    className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition duration-300"
                  >
                    Cancel Scanning
                  </button>
                </div>
              )}
              
              {scanResult && (
                <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  <p className="font-semibold">Successfully scanned!</p>
                  <p>Redirecting to menu...</p>
                </div>
              )}
            </>
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