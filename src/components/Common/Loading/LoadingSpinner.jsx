import React from 'react';
import { CircleDashed } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <CircleDashed 
        size={sizeClasses[size] === 'h-6 w-6' ? 24 : sizeClasses[size] === 'h-12 w-12' ? 48 : sizeClasses[size] === 'h-16 w-16' ? 64 : 96}
        className="animate-spin text-orange-500 mb-4"
      />
      {text && <p className="text-gray-600 text-sm md:text-base">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

