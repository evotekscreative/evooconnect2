import { Link } from "react-router-dom";

const UserDropdown = ({ user, handleLogout }) => {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
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
                  .join("")}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="font-bold">{user.name}</p>
          <span className="text-gray-500 text-sm">{user.headline ?? ''}</span>
          <span className="text-green-500 text-sm">● Online</span>
        </div>
      </div>
      <ul className="flex flex-col divide-y">
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <Link to="/profile" className="flex items-center gap-2">
            My Account
          </Link>
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <Link to="/edit-profile" className="flex items-center gap-2">
            Edit Profile
          </Link>
        </li>
        <li
          onClick={handleLogout}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default UserDropdown;