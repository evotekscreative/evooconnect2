import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const UserDropdown = ({ user, handleLogout, onClose }) => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const dropdownRef = useRef(null);

  // Tambahkan useEffect untuk handle klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef} 
      className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50"
    >
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
          {user.photo ? (
            <img
              src={`${apiUrl}/${user.photo}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-sm font-bold text-gray-600">
  {user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")}
</span>

            </div>
          )}
        </div>
       <div>
  <p className="font-bold">{user.name}</p>
  {user.headline ? (
    <p className="text-gray-500 text-sm">{user.headline}</p>
  ) : (
    <p className="text-gray-500 text-sm italic">No headline</p>
  )}
  <span className="text-green-500 text-sm">● Online</span>
</div>

      </div>
      <ul className="flex flex-col divide-y">
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 w-full"
            onClick={onClose}
          >
            My Account
          </Link>
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <Link 
            to="/edit-profile" 
            className="flex items-center gap-2 w-full"
            onClick={onClose}
          >
            Edit Profile
          </Link>
        </li>
        <li
          onClick={() => {
            handleLogout();
            onClose();
          }}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default UserDropdown;