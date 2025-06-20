export default function CreateGroupModal({
  showModal,
  setShowModal,
  groupForm,
  error,
  isLoading,
  handleInputChange,
  handleFileChange,
  handleCreateGroup
}) {
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-blue-200/50 shadow-2xl shadow-blue-500/10 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-blue-200/50 p-4 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-t-2xl sticky top-0 backdrop-blur-sm">
              <h3 className="text-lg font-bold bg-white bg-clip-text text-transparent">
                Create New Group
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-4 space-y-4">
              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={groupForm.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white/80 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={groupForm.description}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white/80 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 resize-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rules
                </label>
                <textarea
                  name="rule"
                  value={groupForm.rule}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white/80 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 resize-none"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Privacy Level
                  </label>
                  <select
                    name="privacy_level"
                    value={groupForm.privacy_level}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-white/80 border border-blue-200 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 cursor-pointer"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Invite Policy
                  </label>
                  <select
                    name="invite_policy"
                    value={groupForm.invite_policy}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-white/80 border border-blue-200 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 cursor-pointer"
                  >
                    <option value="admin">Admins Only</option>
                    <option value="all_members">All Members</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Post Approval
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="post_approval"
                    checked={groupForm.post_approval}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {groupForm.post_approval ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>

              <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Group Image <span className="text-red-500">*</span>
  </label>
  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-sky-500 file:to-cyan-400 file:text-white hover:file:cursor-pointer"
      required
    />
  </div>
</div>


              <div className="flex justify-end gap-3 pt-4 border-t border-blue-200/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-500 font-medium disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}