import React from 'react';

const LoadingSkeleton = ({ count = 1, height = '100px', className = '' }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div 
          key={index}
          className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
          style={{ height }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton; 