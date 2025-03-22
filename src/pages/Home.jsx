import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrReader } from 'react-qr-reader'; // Use named import

const Home = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated - in a real app, this would verify a token or session
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
  }, []);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      // Redirect to the menu page
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
      <h1 className="text-3xl font-bold mb-4">Welcome to Barcode App</h1>
      
      {!isAuthenticated ? (
        <div className="text-center">
          <p className="mb-4">Please log in to access all features</p>
          <div className="space-y-4">
            <button 
              onClick={handleLoginRedirect} 
              className="w-full md:w-1/2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
            <p>Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link></p>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4">Scan the QR code to view the menu.</p>
          <div className="flex justify-center">
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          </div>
          {scanResult && (
            <div className="mt-4">
              <p>Scanned Result: {scanResult}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;