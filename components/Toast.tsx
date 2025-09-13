import React from 'react';

const Toast = ({ message, show }) => {
  if (!message) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600/90 text-white font-semibold py-3 px-6 rounded-lg shadow-2xl transition-all duration-500 ease-in-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      {message}
    </div>
  );
};

export default Toast;