export default function GroupsSidebar({
  adminGroups,
  joinedGroups,
  suggestedGroups,
  loadingSuggestions,
  handleJoinGroup,
  base_url
}) {
  return (
    <div className="space-y-4">
      {/* Group Statistics */}
      
      <div className="bg-white rounded-xl shadow p-5">
  <h3 className="font-semibold mb-4 border-b pb-3 text-base sm:text-lg">
    Group Statistics
  </h3>
  <ul className="text-sm sm:text-base text-gray-800 space-y-2">
    <li className="border-b pb-3">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Groups</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
          {adminGroups.length + joinedGroups.length}
        </span>
      </div>
    </li>
    <li className="border-b pb-3">
      <div className="flex justify-between items-center">
        <span className="font-medium">Groups Created</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
          {adminGroups.length}
        </span>
      </div>
    </li>
    <li>
      <div className="flex justify-between items-center">
        <span className="font-medium">Groups Joined</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
          {joinedGroups.length}
        </span>
      </div>
    </li>
  </ul>
</div>


      {/* Suggested Groups */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-medium mb-2 border-b pb-4">Groups You Might Like</h3>
        {loadingSuggestions ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : suggestedGroups.length > 0 ? (
          <div className="space-y-3">
            {suggestedGroups.map((group) => (
              <div key={`suggested-${group.id}`} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={group.image ? `${base_url}/${group.image}` : "/default-group.png"}
                    alt="Group"
                    onError={(e) => {
                      e.target.src = "/default-group.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{group.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{group.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{group.members_count} members</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {group.privacy_level === "public" ? "Public Group" : "Private Group"}
                  </p>
                </div>
                {group.privacy_level === "public" && (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded whitespace-nowrap"
                  >
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No group suggestions available.</p>
        )}
      </div>
    </div>
  );
}