import React from 'react';

export function Button({ children, className = '', ...props }) {
  return (
    <button
    className={`bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-md hover:opacity-90 transition ${className}`}
    {...props}
    >
      {children}
    </button>
  );  
}
