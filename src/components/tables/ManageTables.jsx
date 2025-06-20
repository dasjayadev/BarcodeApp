import React, { useEffect, useState } from 'react';
import DashboardNav from '../../components/DashboardNav';
import { getTables, createTable, updateTable, deleteTable, generateTableQR } from '../../services/api';
import { API_CONFIG } from '../../config/api';
import { ErrorToast, SuccessToast } from '../Common/Toast/Toast';
import TransparentWrapper from '../Common/DIalog/TransparentWrapper';

// Replace the hardcoded URL with the config
const API_BASE_URL = API_CONFIG.BASE_URL;

const ManageTables = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTableId, setCurrentTableId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState(null);
  const [currentQRTable, setCurrentQRTable] = useState(null);
  
  // Table form state
  const [tableForm, setTableForm] = useState({
    tableNumber: '',
    capacity: '',
    section: '',
    isActive: true
  });

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const response = await getTables();
      setTables(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError(err.response?.data?.message || 'Failed to load tables');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTable = () => {
    setIsEditing(false);
    setTableForm({
      tableNumber: '',
      capacity: '',
      section: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditTable = (table) => {
    setIsEditing(true);
    setCurrentTableId(table._id);
    setTableForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      section: table.section || '',
      isActive: table.isActive
    });
    setShowModal(true);
  };

  const handleDeleteClick = (tableId) => {
    setCurrentTableId(tableId);
    setShowDeleteConfirm(true);
  };

  const handleGenerateQR = async (tableId) => {
    try {
      setIsLoading(true);
      // Get the base URL from the browser
      const baseUrl = window.location.origin;
      await generateTableQR(tableId, baseUrl);
      
      // setSuccess('QR code generated successfully!');
      SuccessToast('QR code generated successfully!');
      fetchTables(); // Refresh tables to show QR code
      
    } catch (err) {
      ErrorToast(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQR = (table) => {
    setCurrentQRTable(table);
    setCurrentQRCode(table.qrCode);
    setShowQRPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (isEditing) {
        await updateTable(currentTableId, tableForm);
        SuccessToast('Table updated successfully!');
      } else {
        await createTable(tableForm);
        SuccessToast('Table created successfully!');
      }
      
      setShowModal(false);
      fetchTables();
    } catch (err) {
      // setError(err.response?.data?.message || 'Failed to save table');
      ErrorToast(err.response?.data?.message || 'Failed to save table');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await deleteTable(currentTableId);
      
      SuccessToast('Table deleted successfully!');
      setShowDeleteConfirm(false);
      fetchTables();
    } catch (err) {
      ErrorToast(err.response?.data?.message || 'Failed to delete table');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && tables.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <DashboardNav />
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-2">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Table Management</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
            <button 
              className="text-red-700 font-bold" 
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl">Tables ({tables.length})</h2>
          <button 
            className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded"
            onClick={handleAddTable}
          >
            Add New Table
          </button>
        </div>

        {tables.length === 0 ? (
          <p className="text-gray-500">No tables found. Add a table to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Table Number</th>
                  <th className="py-2 px-4 border-b text-left">Capacity</th>
                  <th className="py-2 px-4 border-b text-left">Section</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">QR Code</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map(table => (
                  <tr key={table._id}>
                    <td className="py-2 px-4 border-b">{table.tableNumber}</td>
                    <td className="py-2 px-4 border-b">{table.capacity}</td>
                    <td className="py-2 px-4 border-b">{table.section || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded text-xs 
                        ${table.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {table.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {table.qrCode ? (
                        <button 
                          onClick={() => handleViewQR(table)}
                          className="text-orange-500 hover:text-orange-400"
                        >
                          View QR
                        </button>
                      ) : (
                        <button 
                          className="text-orange-500 hover:text-orange-400"
                          onClick={() => handleGenerateQR(table._id)}
                        >
                          Generate QR
                        </button>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button 
                        className="text-emerald-500 hover:text-emerald-700 mr-2"
                        onClick={() => handleEditTable(table)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteClick(table._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Table Modal */}
      {showModal && (
        <TransparentWrapper>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl mb-4">{isEditing ? 'Edit Table' : 'Add New Table'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tableNumber">
                  Table Number
                </label>
                <input
                  type="text"
                  id="tableNumber"
                  name="tableNumber"
                  value={tableForm.tableNumber}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={tableForm.capacity}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="section">
                  Section (optional)
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={tableForm.section}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              {/* Add isActive field to the form */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={tableForm.isActive !== false}
                      onChange={(e) => setTableForm(prev => ({
                        ...prev,
                        isActive: e.target.checked
                      }))}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </TransparentWrapper>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <TransparentWrapper>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this table? This action cannot be undone.</p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </TransparentWrapper>
      )}

      {/* QR Code Preview Modal */}
      {showQRPreview && currentQRCode && (
        <TransparentWrapper>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl mb-4">QR Code for Table {currentQRTable?.tableNumber}</h2>
            
            <div className="flex flex-col items-center justify-center mb-4">
              {/* Use the complete URL path for the QR code image */}
              <img 
                src={currentQRCode.code.startsWith('/') 
                  ? `${API_BASE_URL}${currentQRCode.code}` 
                  : currentQRCode.code}
                alt={`QR Code for Table ${currentQRTable?.tableNumber}`}
                className="w-64 h-64 mb-4"
              />
              <p className="text-sm text-gray-600 mb-2">Scan to access the menu for this table</p>
              <p className="text-xs text-gray-500">URL: {currentQRCode.url}</p>
            </div>

            <div className="flex justify-between mt-4">
              <a
                href={currentQRCode.code.startsWith('/') 
                  ? `${API_BASE_URL}${currentQRCode.code}` 
                  : currentQRCode.code}
                download={`table-${currentQRTable?.tableNumber}-qr-code.png`}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
              <button
                onClick={() => setShowQRPreview(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </TransparentWrapper>
      )}
    </div>
  );
};

export default ManageTables;
