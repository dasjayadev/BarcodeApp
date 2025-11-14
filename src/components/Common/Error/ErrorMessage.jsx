import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ 
  message, 
  onDismiss, 
  variant = 'error',
  className = '' 
}) => {
  const variants = {
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  if (!message) return null;

  return (
    <div className={`border-l-4 rounded-lg px-4 py-3 mb-4 flex items-start gap-3 ${variants[variant]} ${className}`}>
      <AlertCircle className={`${iconColors[variant]} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${iconColors[variant]} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Dismiss error"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

