export default function GroupsTabs({ activeTab, setActiveTab }) {
  return (
    <div className="border-b border-gray-300 mb-4">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('myGroups')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'myGroups' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} font-medium whitespace-nowrap`}
        >
          My Groups
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'invitations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} font-medium whitespace-nowrap`}
        >
          Group Invitations
        </button>
      </div>
    </div>
  );
}