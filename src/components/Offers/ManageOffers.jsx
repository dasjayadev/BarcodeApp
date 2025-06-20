import React, { useState, useEffect } from 'react';
import DashboardNav from '../../components/DashboardNav';
import { getOffers, createOffer, updateOffer, deleteOffer } from '../../services/api';

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [offer, setOffer] = useState({
    name: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: ''
  });
  const [currentOfferId, setCurrentOfferId] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await getOffers();
      setOffers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load offers');
      setLoading(false);
      console.error(err);
    }
  };

  const resetForm = () => {
    setOffer({
      name: '',
      description: '',
      discount: '',
      startDate: '',
      endDate: ''
    });
    setIsEditing(false);
    setCurrentOfferId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer((prevOffer) => ({
      ...prevOffer,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateOffer(currentOfferId, offer);
        setSuccess('Offer updated successfully!');
      } else {
        await createOffer(offer);
        setSuccess('Offer created successfully!');
      }
      
      fetchOffers();
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save offer');
      console.error(err);
    }
  };

  const handleEdit = (offerToEdit) => {
    setOffer({
      name: offerToEdit.name,
      description: offerToEdit.description,
      discount: offerToEdit.discount,
      startDate: offerToEdit.startDate ? new Date(offerToEdit.startDate).toISOString().split('T')[0] : '',
      endDate: offerToEdit.endDate ? new Date(offerToEdit.endDate).toISOString().split('T')[0] : ''
    });
    setIsEditing(true);
    setCurrentOfferId(offerToEdit._id);
  };

  const handleDelete = async (offerId) => {
    try {
      await deleteOffer(offerId);
      setSuccess('Offer deleted successfully!');
      fetchOffers();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete offer');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <h1 className="text-3xl font-bold mb-4">Special Offers Management</h1>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Offer' : 'Create New Offer'}</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={offer.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={offer.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={offer.discount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min="0"
                max="100"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={offer.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={offer.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditing ? 'Update Offer' : 'Create Offer'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Offers</h2>
          {loading ? (
            <p className="text-center py-4">Loading offers...</p>
          ) : offers.length > 0 ? (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer._id} className="bg-white p-4 rounded shadow-md">
                  <h3 className="text-lg font-bold">{offer.name}</h3>
                  <p className="text-gray-600 mb-2">{offer.description}</p>
                  <p className="font-semibold">Discount: {offer.discount}%</p>
                  <p>
                    Valid: {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 bg-gray-50 rounded">No offers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOffers;