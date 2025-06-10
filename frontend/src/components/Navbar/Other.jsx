import { useState, useRef, useEffect } from 'react';
import { Grip } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link dari react-router-dom

const Other = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Grip />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <Link
            to="/company-management/company-detail"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)} // Menutup dropdown setelah diklik
          >
            Company Management
          </Link>
           <Link
            to="/groups"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)} // Menutup dropdown setelah diklik
          >
            Groups
          </Link>
        </div>
      )}
    </div>
  );
};

export default Other;