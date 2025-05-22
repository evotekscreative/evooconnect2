import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Case from "../components/Case";
import {
  MoreHorizontal,
  UserPlus,
  UserMinus,
  ArrowLeft,
  X,
  ChevronDown,
} from "lucide-react";

export default function MemberList() {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const { groupId } = useParams();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUserId(user.id);
    }
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(response.data.data || []);

      // Check if current user is admin
      const user = JSON.parse(localStorage.getItem("user"));
      const creator = response.data.data.find(
        (member) => member.user.id === user?.id && member.role === "admin"
      );
      setIsAdmin(!!creator);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to load members");
      toast.error("Failed to load group members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/groups/${groupId}/members/${selectedMember.user.id}/role`,
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers((prev) =>
        prev.map((member) =>
          member.user.id === selectedMember.user.id
            ? { ...member, role: selectedRole }
            : member
        )
      );
      toast.success("Role updated successfully");
      setShowRoleModal(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${apiUrl}/api/groups/${groupId}/members/${selectedMember.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers((prev) =>
        prev.filter((member) => member.user.id !== selectedMember.user.id)
      );
      toast.success("Member removed successfully");
      setShowRemoveModal(false);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const openOptionsMenu = (memberId, e) => {
    e.stopPropagation();
    setShowOptionsMenu(showOptionsMenu === memberId ? null : memberId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={fetchMembers}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Case>
    <div className="bg-gray-100 min-h-screen pb-20"> {/* Tambahkan pb-20 untuk padding bottom yang besar */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[70vh]">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <Link
              to={`/groups/${groupId}`}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Group
            </Link>
            <h2 className="text-xl font-bold text-gray-800">Group Members</h2>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>

          {/* Member List */}
          <div className="divide-y">
            {members.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No members found
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.user.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        member.user.photo
                          ? member.user.photo.startsWith("http")
                            ? member.user.photo
                            : `${apiUrl}/${member.user.photo}`
                          : "/default-user.png"
                      }
                      className="w-12 h-12 rounded-full object-cover"
                      alt={member.user.name}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {member.user.name}
                        {member.user.id === currentUserId && (
                          <span className="ml-2 text-gray-400">(You)</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {member.role === "admin" ? "Admin" : "Member"}
                      </p>
                    </div>
                  </div>

                  {isAdmin && member.user.id !== currentUserId && (
                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-200"
                        onClick={(e) => openOptionsMenu(member.user.id, e)}
                      >
                        <MoreHorizontal size={18} className="text-gray-500 z-10" />
                      </button>

                      {showOptionsMenu === member.user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              onClick={() => {
                                setSelectedMember(member);
                                setSelectedRole(member.role);
                                setShowRoleModal(true);
                                setShowOptionsMenu(null);
                              }}
                            >
                              <UserPlus size={16} className="mr-2" />
                              Change Role
                            </button>
                            <button
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              onClick={() => {
                                setSelectedMember(member);
                                setShowRemoveModal(true);
                                setShowOptionsMenu(null);
                              }}
                            >
                              <UserMinus size={16} className="mr-2" />
                              Remove Member
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Change {selectedMember.user.name}'s Role
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleUpdateRole}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Remove Member</h3>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-semibold">{selectedMember.user.name}</span>{" "}
                from the group?
              </p>
              {selectedMember.role === "admin" && (
                <p className="mt-2 text-yellow-600 text-sm">
                  Note: This user is an admin. Removing them will revoke their
                  admin privileges.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleRemoveMember}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Case>
  );
  
}