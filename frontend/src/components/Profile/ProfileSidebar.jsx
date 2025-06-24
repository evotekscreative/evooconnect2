import { Users, Eye, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileSidebar({
  user,
  profileImage,
  apiUrl,
  connectionsCount,
  profileViews,
  onShowContactModal,
  socialPlatforms,
}) {
  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6 text-center mb-4">
        <div className="relative flex items-center justify-center mx-auto overflow-hidden bg-gray-200 rounded-full w-28 h-28">
          {profileImage ? (
            <img
              src={apiUrl + "/" + profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-lg font-bold text-gray-600">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
          )}
        </div>
        <h2 className="font-bold text-xl mt-4">{user.name}</h2>
        <p className="text-base text-gray-500">
          {user.headline || "No headline yet"}
        </p>
        <div className="mt-2">
          <button
            onClick={onShowContactModal}
            className="text-blue-600 hover:underline text-sm"
          >
            Contact Information
          </button>
        </div>
        <div className="mt-5 space-y-2 text-left">
          <Link
            to="/list-connection"
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
          >
            <span className="flex items-center gap-2 text-base">
              <Users size={18} /> Connections
            </span>
            <span className="font-bold text-lg">{connectionsCount}</span>
          </Link>
          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
            <span className="flex items-center gap-2 text-base">
              <Eye size={18} /> Views
            </span>
            <span className="font-bold text-lg">
              {profileViews.thisWeek}
            </span>
          </div>
          <Link
            to="/job-saved"
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
          >
            <span className="flex items-center gap-2 text-base">
              <Bookmark size={18} /> Job Saved
            </span>
            <span className="font-bold text-lg">120</span>
          </Link>
        </div>
        <button className="text-blue-600 text-base mt-5">Log Out</button>
      </div>
    </div>
  );
}