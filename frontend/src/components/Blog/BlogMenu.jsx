import React, { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiEdit, FiTrash2, FiFlag } from "react-icons/fi";

const BlogMenu = ({ onEdit, onDelete, onReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Tutup menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!menuRef.current?.matches(':hover')) {
              setIsOpen(false);
            }
          }, 100);
        }}
      >
        <FiMoreVertical className="text-gray-500" size={20} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiEdit className="mr-2" size={16} />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <FiTrash2 className="mr-2" size={16} />
              Delete
            </button>
            <button
              onClick={() => {
                onReport();
                setIsOpen(false);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiFlag className="mr-2" size={16} />
              Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogMenu;
