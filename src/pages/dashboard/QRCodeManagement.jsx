import React, { useState } from 'react';

const QRCodeManagement = () => {
  const [qrCode, setQRCode] = useState({
    section: '',
    url: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQRCode((prevQRCode) => ({
      ...prevQRCode,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to generate QR code
    console.log('QR code generated:', qrCode);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">QR Code Management</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700">Section</label>
          <input
            type="text"
            name="section"
            value={qrCode.section}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">URL</label>
          <input
            type="text"
            name="url"
            value={qrCode.url}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded">
            Generate QR Code
          </button>
        </div>
      </form>
    </div>
  );
};

export default QRCodeManagement;