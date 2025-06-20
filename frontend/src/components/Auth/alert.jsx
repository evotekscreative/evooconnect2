import { useEffect, useState } from 'react';

function Alert({ type = 'success', message, onClose, isVisible = true, autoClose = true, duration = 5000 }) {
  const [show, setShow] = useState(false);
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure the component renders before starting animation
      setTimeout(() => {
        setShow(true);
      }, 10);
    } else {
      setShow(false);
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match this with the CSS transition duration
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);
  
  useEffect(() => {
    if (autoClose && show) {
      const timer = setTimeout(() => {
        setShow(false);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
          setShouldRender(false);
          if (onClose) onClose();
        }, 300); // Match this with the CSS transition duration
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      setShouldRender(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!shouldRender) return null;

 // In Alert.jsx, update the alertClasses object
const alertClasses = {
  success: 'bg-green-100 border-l-4 border-green-500 text-green-700',
  error: 'bg-red-100 border-l-4 border-red-500 text-red-700',
  warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
  info: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700', // Add this line
};


  const transitionClasses = show 
    ? 'opacity-100 translate-y-0' 
    : 'opacity-0 -translate-y-4';

  return (
    <div 
      className={`${alertClasses[type] || alertClasses.success} ${transitionClasses} transform transition-all duration-300 ease-in-out p-4 rounded shadow-md mb-3`} 
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2">
          {type === 'success' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          )}
          {type === 'error' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          )}
          {type === 'warning' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          )}
        </div>
{type === 'info' && (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
  </svg>
)}

        <div>
          <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}!</p>
          <p>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Alert;