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
    showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Create New Group</h3>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <input
                type="text"
                name="name"
                value={groupForm.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={groupForm.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rules</label>
              <textarea
                name="rule"
                value={groupForm.rule}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Level *</label>
              <select
                name="privacy_level"
                value={groupForm.privacy_level}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public (Anyone can see and request to join)</option>
                <option value="private">Private (Only visible to members)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Policy *</label>
              <select
                name="invite_policy"
                value={groupForm.invite_policy}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin Only (Only admins can invite new members)</option>
                <option value="member">All Members (Any member can invite new members)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Photo *
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}