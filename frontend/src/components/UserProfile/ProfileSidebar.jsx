import { Link } from "react-router-dom";
import { Users, UserPlus, Check } from "lucide-react";

const socialPlatforms = [
  { name: "instagram", color: "text-pink-500" },
  { name: "facebook", color: "text-blue-500" },
  { name: "twitter", color: "text-blue-400" },
  { name: "linkedin", color: "text-blue-700" },
  { name: "github", color: "text-black" },
];

export default function ProfileSidebar({
  user,
  profileImage,
  apiUrl,
  username,
  connectionsCount,
  isConnected,
  connectionStatus,
  loadingConnection,
  handleConnectWithUser,
  setShowContactModal,
}) {
  return (
    <div className="w-full space-y-4 md:w-1/3">
      <div className="p-6 text-center bg-white rounded-lg shadow-md">
        <div className="relative flex items-center justify-center mx-auto overflow-hidden bg-gray-200 rounded-full w-28 h-28">
          {profileImage ? (
            <img
              src={apiUrl + "/" + profileImage}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-300">
              <span className="text-lg font-bold text-gray-600">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
          )}
        </div>
        <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
        <p className="text-base text-gray-500">
          {user.headline || "No headline yet"}
        </p>
        <div className="mt-2">
          <button
            onClick={() => setShowContactModal(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Contact Information
          </button>
        </div>
        <div className="mt-5 space-y-2 text-left">
          <Link
            to={`/list-connection/${username}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
          >
            <span className="flex items-center gap-2 text-base">
              <Users size={18} /> Connections
            </span>
            <span className="text-lg font-bold">{connectionsCount}</span>
          </Link>
        </div>
        <div className="mt-2">
          <button
            onClick={handleConnectWithUser}
            disabled={
              isConnected ||
              connectionStatus === "pending" ||
              loadingConnection
            }
            className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${isConnected
              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white"
              : connectionStatus === "pending"
                ? "bg-blue-100 text-blue-800 cursor-default"
                : "border border-blue-500 text-blue-500"
              } flex items-center justify-center`}
          >
            {loadingConnection ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Processing...
              </>
            ) : isConnected ? (
              <>
                <Check className="w-4 h-4 mr-1" /> Connected
              </>
            ) : connectionStatus === "pending" ? (
              "Request Sent"
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" /> Connect
              </>
            )}
          </button>
        </div>
      </div>
      {/* Skills */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Skills</h3>
        {user.skills && user.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-base text-gray-500 mt-1">
            No skills added yet
          </p>
        )}
      </div>
      {/* Social Media */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-lg font-semibold">Social Media</h3>
        {Object.keys(user.socials).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(user.socials).map(([platform, username]) => {
              const platformInfo = socialPlatforms.find(
                (p) => p.name === platform
              );
              return (
                <div
                  key={platform}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                >
                  {platformInfo && (
                    <div
                      className={`p-2 rounded-full ${platformInfo.color} bg-gray-50`}
                    >
                      {/* You can add icon here if needed */}
                    </div>
                  )}
                  <span className="text-base truncate">@{username}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-base text-gray-500">
            No social media added yet.
          </p>
        )}
      </div>
    </div>
  );
}