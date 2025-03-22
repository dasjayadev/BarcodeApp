import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // In a real app, this would send a request to your backend
    // to generate a reset token and send an email
    console.log('Password reset requested for:', email);
    
    // Show success message
    setIsSubmitted(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
      
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <p className="mb-4">Enter your email address and we'll send you a link to reset your password.</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send Reset Link
            </button>
          </div>
          
          <div className="text-center">
            <Link to="/login" className="text-blue-500 hover:underline">Back to Login</Link>
          </div>
        </form>
      ) : (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Check your email for reset instructions
          </div>
          <Link to="/login" className="text-blue-500 hover:underline">Back to Login</Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
