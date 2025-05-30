import { Link } from "react-router-dom";
import { Trash2, LogOut } from "lucide-react";

const base_url =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function GroupCard({ group, isAdmin, onDelete, onLeave }) {
  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
        <img
          className="w-10 h-10 rounded-full"
          src={
            group.image ? `${base_url}/${group.image}` : "/default-group.png"
          }
          alt="Group"
          onError={(e) => {
            e.target.src = "/default-group.png";
          }}
        />
        <div className="flex-1 min-w-0">
          <Link to={`/groups/${group.id}`}>
            <p title={group.name} className="font-medium capitalize truncate">{group.name}</p>
          </Link>
          <div className="text-gray-500 text-xs sm:text-sm">
            {group.members_count || 0} Members
          </div>
          <span
            className={`text-xs ${
              isAdmin
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            } px-1.5 py-0.5 rounded whitespace-nowrap`}
          >
            {isAdmin
              ? `Created on ${group.createdDate}`
              : `Joined on ${group.joinedDate}`}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <Link
          to={`/groups/${group.id}`}
          className="text-xs sm:text-sm text-blue-600 hover:underline"
        >
          View Group
        </Link>
        <button
          onClick={() => (isAdmin ? onDelete(group.id) : onLeave(group.id))}
          className={`flex items-center ${
            isAdmin
              ? "text-red-600 hover:text-red-800"
              : "text-gray-600 hover:text-gray-800"
          } text-xs sm:text-sm`}
          title={isAdmin ? "Delete Group" : "Leave Group"}
        >
          {isAdmin ? (
            <>
              <Trash2 size={14} className="mr-1" /> Delete
            </>
          ) : (
            <>
              <LogOut size={14} className="mr-1" /> Leave
            </>
          )}
        </button>
      </div>
    </div>
  );
}
