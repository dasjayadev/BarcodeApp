import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessMessage = ({ 
  message, 
  onDismiss,
  className = '' 
}) => {
  if (!message) return null;

  return (
    <div className={`bg-green-50 border-l-4 border-green-500 text-green-800 rounded-lg px-4 py-3 mb-4 flex items-start gap-3 ${className}`}>
      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-500 hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Dismiss success message"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;

