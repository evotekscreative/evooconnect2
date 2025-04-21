import React, { useState } from "react";
import Case from "../components/Case";
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function Groups() {
  const [showModal, setShowModal] = useState(false);
  const [showAllAdminGroups, setShowAllAdminGroups] = useState(false);
  const [showAllJoinedGroups, setShowAllJoinedGroups] = useState(false);
  const navigate = useNavigate(); 
  
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Web Developers",
      members: 12,
      isAdmin: true,
      createdDate: "2023-05-15"
    },
    {
      id: 2,
      name: "Design Community",
      members: 24,
      isAdmin: false,
      joinedDate: "2023-06-20"
    },
    {
      id: 3,
      name: "React Enthusiasts",
      members: 8,
      isAdmin: false,
      joinedDate: "2023-07-10"
    },
    {
      id: 4,
      name: "JavaScript Masters",
      members: 15,
      isAdmin: true,
      createdDate: "2023-08-05"
    },
    {
      id: 5,
      name: "Python Programmers",
      members: 18,
      isAdmin: true,
      createdDate: "2023-09-12"
    },
    {
      id: 6,
      name: "UX Designers",
      members: 9,
      isAdmin: false,
      joinedDate: "2023-10-15"
    },
    {
      id: 7,
      name: "Data Science Group",
      members: 22,
      isAdmin: false,
      joinedDate: "2023-11-01"
    },
  ]);

  // Memisahkan grup admin dan grup yang diikuti
  const adminGroups = groups.filter(group => group.isAdmin);
  const joinedGroups = groups.filter(group => !group.isAdmin);

  // Get first 3 groups for showcase
  const showcaseAdminGroups = showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3);
  const showcaseJoinedGroups = showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3);

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      setGroups(groups.filter(group => group.id !== groupId));
    }
  };

  const handleLeaveGroup = (groupId) => {
    if (window.confirm("Are you sure you want to leave this group? You'll need to be invited to join again.")) {
      setGroups(groups.filter(group => group.id !== groupId));
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    const form = e.target;
    const newGroup = {
      id: groups.length + 1,
      name: form.groupName.value,
      members: 1,
      isAdmin: true,
      createdDate: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    };
    setGroups([...groups, newGroup]);
    setShowModal(false);
  };

  const [activeTab, setActiveTab] = useState('myGroups');
const [invitations, setInvitations] = useState([
  {
    id: 1,
    group: {
      id: 101,
      name: "Web Development Group",
      members: 25,
      image: "/api/placeholder/80/80"
    },
    inviter: {
      id: 2,
      name: "Mike Johnson",
      profile_photo: "/api/placeholder/50/50"
    },
    status: "pending"
  },
  {
    id: 2,
    group: {
      id: 102,
      name: "React Enthusiasts",
      members: 8,
      image: "/api/placeholder/80/80"
    },
    inviter: {
      id: 3,
      name: "Sarah Williams",
      profile_photo: "/api/placeholder/50/50"
    },
    status: "pending"
  }
]);

const handleAcceptInvitation = (invitationId) => {
  // Update the invitation status
  const updatedInvitations = invitations.map(inv => 
    inv.id === invitationId ? {...inv, status: "accepted"} : inv
  );
  setInvitations(updatedInvitations);
  
  // Add to joined groups
  const acceptedInvitation = invitations.find(inv => inv.id === invitationId);
  const newGroup = {
    id: acceptedInvitation.group.id,
    name: acceptedInvitation.group.name,
    members: acceptedInvitation.group.members,
    isAdmin: false,
    joinedDate: new Date().toISOString().split('T')[0]
  };
  setGroups([...groups, newGroup]);
};

const handleRejectInvitation = (invitationId) => {
  // Update the invitation status
  const updatedInvitations = invitations.map(inv => 
    inv.id === invitationId ? {...inv, status: "rejected"} : inv
  );
  setInvitations(updatedInvitations);
};
  

  return (
    <Case>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Main Section */}
          <div className="md:col-span-3 space-y-4 bg-white rounded-xl shadow p-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <button 
                onClick={() => navigate(-1)} 
                className="mr-2 p-1 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold">Groups</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Group
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-4">
              <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                My Groups
              </button>
              <button className="px-4 py-2 text-gray-500">
                Group Invitations
              </button>
            </div>

            {/* Groups You Created */}
            {adminGroups.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Groups You Created</h3>
                  {adminGroups.length > 3 && (
                    <button
                      onClick={() => setShowAllAdminGroups(!showAllAdminGroups)}
                      className="text-blue-600 text-sm flex items-center"
                    >
                      {showAllAdminGroups ? (
                        <>
                          <ChevronUp size={16} className="mr-1" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" /> Show All ({adminGroups.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showcaseAdminGroups.map((group) => (
                    <div key={group.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3 border-b pb-4">
                        <div className="bg-blue-100 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                          <span className="text-blue-600 text-xl font-bold">
                            {group.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium capitalize text-blue-500">{group.name}</div>
                          <div className="text-gray-500 text-sm">{group.members} Members</div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Created on {group.createdDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <Link 
                          to={`/group-page`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Group
                        </Link>
                        <button 
                          onClick={() => handleDeleteGroup(group.id)}
                          className="flex items-center text-red-600 hover:text-red-800 text-sm"
                          title="Delete Group"
                        >
                          <Trash2 size={16} className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups You've Joined */}
            {joinedGroups.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Groups You've Joined</h3>
                  {joinedGroups.length > 3 && (
                    <button
                      onClick={() => setShowAllJoinedGroups(!showAllJoinedGroups)}
                      className="text-blue-600 text-sm flex items-center"
                    >
                      {showAllJoinedGroups ? (
                        <>
                          <ChevronUp size={16} className="mr-1" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" /> Show All ({joinedGroups.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showcaseJoinedGroups.map((group) => (
                    <div key={group.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3 border-b pb-4">
                        <div className="bg-gray-200 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                          <span className="text-gray-600 text-xl font-bold">
                            {group.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium capitalize text-blue-500">{group.name}</div>
                          <div className="text-gray-500 text-sm">{group.members} Members</div>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            Joined on {group.joinedDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <Link 
                          to={`/groups/${group.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Group
                        </Link>
                        <button 
                          onClick={() => handleLeaveGroup(group.id)}
                          className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
                          title="Leave Group"
                        >
                          <LogOut size={16} className="mr-1" /> Leave
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {groups.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">You haven't joined any groups yet.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Create your first group
                </button>
              </div>
            )}
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Group Statistics */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Group Statistics</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex justify-between border-b pb-4">
                  <span>Total Groups</span>
                  <span>{groups.length}</span>
                </li>
                <li className="flex justify-between border-b pb-4">
                  <span>Groups Created</span>
                  <span>{adminGroups.length}</span>
                </li>
                <li className="flex justify-between">
                  <span>Groups Joined</span>
                  <span>{joinedGroups.length}</span>
                </li>
              </ul>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Groups You Might Like</h3>
              {groups.length < 3 ? (
                <>
                  <p className="text-sm text-gray-500 mb-2">
                    Here are some suggestions for you:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span>JavaScript Developers</span>
                      <button className="text-blue-600 text-xs hover:underline">
                        Join
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span>UI/UX Designers</span>
                      <button className="text-blue-600 text-xs hover:underline">
                        Join
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 mb-2">
                  You've joined all available groups.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Create Group */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
              
              <form onSubmit={handleCreateGroup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Group Name</label>
                    <input
                      type="text"
                      name="groupName"
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
                      placeholder="Enter group description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Group Photo</label>
                    <input
                      type="file"
                      className="mt-1"
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Case>
  );
}