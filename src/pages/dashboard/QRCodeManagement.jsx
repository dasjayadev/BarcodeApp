import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQRCodes, createQRCode, deleteQRCode } from '../../services/api';
import DashboardNav from '../../components/DashboardNav';

const QRCodeManagement = () => {
  const [qrCode, setQRCode] = useState({
    section: '',
    url: ''
  });
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      // Only fetch global QR codes here - table QR codes are managed in TableManagement
      const response = await getQRCodes({ type: 'global' });
      setQRCodes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch QR codes');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQRCode((prevQRCode) => ({
      ...prevQRCode,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await createQRCode(qrCode);
      setSuccess('QR Code generated successfully');
      setQRCode({ section: '', url: '' });
      fetchQRCodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR code');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        await deleteQRCode(id);
        setSuccess('QR Code deleted successfully');
        fetchQRCodes();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete QR code');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <h1 className="text-3xl font-bold mb-4">QR Code Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-lg font-medium mb-2">Table QR Codes</h2>
        <p className="mb-4">Want to generate QR codes for restaurant tables? Go to Table Management to create table-specific QR codes.</p>
        <Link to="/dashboard/tables" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Table Management
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Custom QR Code</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Section/Purpose</label>
          <input
            type="text"
            name="section"
            value={qrCode.section}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. Front Door, Instagram Page"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">URL</label>
          <input
            type="text"
            name="url"
            value={qrCode.url}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="https://your-website.com"
            required
          />
        </div>
        <div className="mb-4">
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate QR Code
          </button>
        </div>
      </form>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Generated Custom QR Codes</h2>
        
        {loading ? (
          <p>Loading QR codes...</p>
        ) : qrCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrCodes.map(qrCode => (
              <div key={qrCode._id} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg mb-2">{qrCode.section}</h3>
                <p className="text-gray-600 mb-2 truncate">{qrCode.url}</p>
                
                {qrCode.code && (
                  <div className="mb-3">
                    <img 
                      src={qrCode.code.startsWith('/') ? `http://localhost:5000${qrCode.code}` : qrCode.code}
                      alt="QR Code" 
                      className="mx-auto w-48 h-48"
                    />
                  </div>
                )}
                
                <div className="flex justify-between">
                  <a 
                    href={qrCode.code.startsWith('/') ? `http://localhost:5000${qrCode.code}` : qrCode.code}
                    download={`qr-${qrCode.section}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(qrCode._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No custom QR codes generated yet</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeManagement;