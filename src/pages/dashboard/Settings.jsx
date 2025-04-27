import React, { useState, useEffect } from 'react';
import DashboardNav from '../../components/DashboardNav';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../services/api';

const Settings = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!profile.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) {
      setError('Valid email is required');
      return;
    }
    
    if (profile.password && profile.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (profile.password && profile.password !== profile.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create update object (only include password if provided)
      const updateData = {
        name: profile.name,
        email: profile.email
      };
      
      if (profile.password) {
        updateData.password = profile.password;
      }
      console.log(currentUser.id, updateData);
      await updateUser(currentUser.id, updateData);
      setSuccess('Profile updated successfully');
      
      // Clear password fields after successful update
      setProfile(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardNav />
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      
      {error && (
        <div className="max-w-md mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="max-w-md mx-auto bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password (leave blank to keep current)</label>
          <input
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={profile.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;