import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdBox() {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-3 overflow-hidden text-center">
      {!imageError ? (
        <img 
          src="/img/ads1.png" 
          className="w-full" 
          alt="Premium subscription advertisement" 
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
          <h4 className="font-bold mb-2">EVOConnect Premium</h4>
          <p className="text-white/80 text-sm">Unlock premium features</p>
        </div>
      )}
      
      <div className="border-b p-3">
        <h6 className="font-bold text-yellow-600">EVOConnect Premium</h6>
        <p className="text-gray-500 mb-0 text-sm">Grow & nurture your network</p>
      </div>
      
      <div className="p-3">
        <Link to="/pricing">
          <button 
            type="button" 
            className="px-6 py-2 border border-yellow-600 text-yellow-600 font-medium rounded-md hover:bg-yellow-50 transition"
          >
            ACTIVATE
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AdBox;