import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrReader from 'react-qr-reader';

const Home = () => {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Barcode App</h1>
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
    </div>
  );
};

export default Home;