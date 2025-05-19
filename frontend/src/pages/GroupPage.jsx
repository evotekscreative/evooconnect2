import { useState, useEffect } from "react";
import Case from "../components/Case";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Image,
  Video,
  ThumbsUp,
  MessageCircle,
  Share,
  ArrowRight,
  ArrowDown,
  X,
  Copy,
  Check,
  UserPlus,
  UserMinus,
} from "lucide-react";
import GroupCover from "../assets/img/cover.jpg";

export default function GroupPage() {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [postContent, setPostContent] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [commentModalPostId, setCommentModalPostId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [invitedUserName, setInvitedUserName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { groupId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    id: 1,
    name: "John Doe",
    profile_photo: "/api/placeholder/80/80",
    following_count: 42,
  });

  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const groupData = response.data.data;
      setGroup(groupData);

      // Check if current user is admin
      if (groupData.creator && user && groupData.creator.id === user.id) {
        setIsCurrentUserAdmin(true);
      } else if (groupData.members) {
        const currentUserMember = groupData.members.find(
          member => member.user.id === user.id && member.role === "admin"
        );
        setIsCurrentUserAdmin(!!currentUserMember);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to load group data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found for fetching members");
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/members`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
          timeout: 5000
        }
      );

      const members = Array.isArray(response.data.data) ? response.data.data : [];

      setGroup(prevGroup => ({
        ...prevGroup,
        members: members,
      }));

    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const fetchUserConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        console.warn("No authentication token or user data found");
        setConnections([
          { id: 1, user: { id: 3, name: "Alice Cooper", profile_photo: "/api/placeholder/40/40" } },
          { id: 2, user: { id: 4, name: "Bob Johnson", profile_photo: "/api/placeholder/40/40" } },
        ]);
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/users/${user.id}/connections`,
        {
          params: {
            limit: 10,
            offset: 0
          },
          headers: {
            Authorization: "Bearer " + token,
          },
          timeout: 5000
        }
      );

      setConnections(response.data.data.connections || []);
    } catch (error) {
      console.error("Error fetching user connections:", error);
      setConnections([
        { id: 1, user: { id: 3, name: "Alice Cooper", profile_photo: "/api/placeholder/40/40" } },
        { id: 2, user: { id: 4, name: "Bob Johnson", profile_photo: "/api/placeholder/40/40" } },
      ]);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    } else {
      toast.error("Invalid group ID.");
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId && !isLoading && group) {
      fetchGroupMembers(groupId);
    }
  }, [groupId, isLoading]);

  const handleOpenInviteModal = () => {
    fetchUserConnections();
    setInviteModalOpen(true);
  };

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        id: 1,
        name: "John Doe",
        profile_photo: "/api/placeholder/40/40",
      },
      content:
        "This is a sample post content. Looking forward to our next group meeting!",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      createdAt: "2 hours ago",
      likes: 5,
      comments: [
        { id: 1, user: "Alice", text: "Great post!" },
        { id: 2, user: "Bob", text: "Looking forward to it!" },
      ],
    },
    {
      id: 2,
      user: {
        id: 2,
        name: "Jane Smith",
        profile_photo: "/api/placeholder/40/40",
      },
      content: "Just shared a new tutorial on React hooks. Check it out!",
      createdAt: "5 hours ago",
      likes: 12,
      comments: [{ id: 1, user: "Charlie", text: "Very helpful!" }],
    },
  ]);

  const handleUpdateMemberRole = async (userId) => {
    // Tambahkan pengecekan untuk memastikan tidak mengubah diri sendiri
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:3000/api/groups/${groupId}/members/${userId}/role`,
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setGroup(prevGroup => ({
        ...prevGroup,
        members: prevGroup.members.map(member =>
          member.user.id === userId
            ? { ...member, role: selectedRole }
            : member
        )
      }));

      toast.success(`Successfully updated user role to ${selectedRole}`);
      setShowRoleModal(false);
      setEditingMemberId(null);

    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error(error.response?.data?.message || "Failed to update role. Please try again.");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/api/groups/${groupId}/members/${memberToRemove.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      // Update local state
      setGroup(prevGroup => ({
        ...prevGroup,
        members: prevGroup.members.filter(m => m.user.id !== memberToRemove.user.id),
        members_count: prevGroup.members_count - 1
      }));

      toast.success(`Successfully removed ${memberToRemove.user.name} from the group`);
      setShowRemoveModal(false);
      setMemberToRemove(null);

    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.message || "Failed to remove member. Please try again.");
    }
  };

  const openRemoveConfirmation = (member) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userData);
  }, []);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrl(e.target.result);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setShowImagePreview(false);
    setImagePreviewUrl("");
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const newPost = {
      id: posts.length + 1,
      user: {
        id: user.id,
        name: user.name,
        profile_photo: user.profile_photo,
      },
      content: postContent,
      image: imagePreviewUrl,
      createdAt: "Just now",
      likes: 0,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
    setShowImagePreview(false);
    setImagePreviewUrl("");
  };

  const handleInvite = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      // Validation checks
      if (!token || !currentUser) {
        toast.error("You need to be logged in to invite users");
        return;
      }

      if (!isCurrentUserAdmin) {
        toast.error("Only group admins can invite members");
        return;
      }

      // Check if user is already a member
      const isAlreadyMember = group.members?.some(member => member.user.id === userId);
      if (isAlreadyMember) {
        toast.error("This user is already a group member");
        return;
      }

      // Check for pending invitations
      const hasPendingInvite = group.invitations?.some(
        inv => inv.user_id === userId && inv.status === "pending"
      );
      if (hasPendingInvite) {
        toast.error("An invitation has already been sent to this user");
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/invitations/${userId}`,
        {}, // Empty payload if your API accepts it
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Success handling
      const invitedUser = connections.find(conn => conn.user.id === userId)?.user;
      if (invitedUser) {
        setInvitedUserName(invitedUser.name);
        setShowInviteSuccess(true);
        setTimeout(() => setShowInviteSuccess(false), 3000);

        // Update local state to reflect the new invitation
        setGroup(prevGroup => ({
          ...prevGroup,
          invitations: [
            ...(prevGroup.invitations || []),
            {
              user_id: userId,
              status: "pending",
              user: invitedUser
            }
          ]
        }));
      }
      toast.success(`Invitation sent to ${invitedUser?.name || 'user'}`);

    } catch (error) {
      console.error("Error inviting user:", error);
      if (error.response) {
        if (error.response.status === 400 &&
          error.response.data?.data === 'invitation already sent to this user') {
          toast.error("An invitation has already been sent to this user");
        } else {
          toast.error(error.response.data?.message || `Error: ${error.response.status}`);
        }
      } else {
        toast.error("Network error - please check your connection");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => fetchGroupData(groupId)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  return (
    <Case>
      <div className="bg-gray-100 min-h-screen pb-8">
        {showInviteSuccess && (
          <div className="fixed top-5 right-5 z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
              <Check className="mr-2" />
              <span>Successfully invited {invitedUserName} to the group!</span>
            </div>
          </div>
        )}

        {/* Cover Photo */}
        <div className="h-32 sm:h-48 w-full bg-gray-300">
          <img
            className="h-full w-full object-cover"
            src={GroupCover}
            alt="Cover"
          />
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Left Sidebar */}
            <aside className="lg:block lg:w-1/4">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 text-center">
                  <div className="profile-photo-container">
                    <img
                      src="#"
                      className="rounded-full w-20 h-20 mx-auto"
                      alt="Profile"
                    />
                    <h5 className="font-bold text-gray-800 mt-3">
                      {group.creator?.name || "Admin"}
                    </h5>
                    <small className="text-gray-500">Group Admin</small>
                  </div>

                  <div className="mt-4 p-2">
                    <div className="flex items-center justify-between py-2">
                      <p className="text-gray-500">Members</p>
                      <p className="font-bold text-gray-800">
                        {group.members_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="w-full lg:w-2/4">
              {/* Group Info */}
              <div className="rounded-lg border bg-white shadow-sm mb-4">
                <div className="p-4">
                  <div className="flex items-center">
                    <img
                      className="rounded-full w-16 h-16"
                      src={group.image ? `http://localhost:3000/${group.image}` : "/default-group.png"}
                      alt={group.name}
                    />
                    <div className="ml-4">
                      <h5 className="font-bold text-gray-800">{group.name}</h5>
                      <p className="text-gray-500 text-sm">{group.description}</p>
                      <p className="text-gray-500 text-sm">{group.members_count || 0} Members</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Post Box */}
              <div className="rounded-lg border bg-white shadow-sm mb-4">
                <div className="border-b p-3">
                  <h6 className="font-medium">Create New Post</h6>
                </div>
                <div className="p-3">
                  <form onSubmit={handleSubmitPost}>
                    <div className="mb-3">
                      <div className="flex items-center mb-3">
                        <img
                          src={user.profile_photo}
                          className="rounded-full mr-2 w-10 h-10"
                          alt=""
                        />
                        <span className="font-bold">{user.name}</span>
                      </div>
                      <textarea
                        className="w-full p-2 border rounded text-sm sm:text-base"
                        rows="3"
                        placeholder="What's on your mind?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                      ></textarea>
                    </div>

                    {showImagePreview && (
                      <div className="mb-3 relative">
                        <img
                          src={imagePreviewUrl || "#"}
                          alt="Preview"
                          className="w-full rounded max-h-64 object-contain"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={removeImage}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="flex gap-3 w-full sm:w-auto">
                        <label
                          htmlFor="post-image"
                          className="text-blue-500 cursor-pointer flex items-center text-sm"
                        >
                          <Image size={16} className="mr-1" /> Photo
                        </label>
                        <input
                          type="file"
                          id="post-image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Posts Display */}
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-3">
                  <h6 className="font-medium">Recent Posts</h6>
                </div>
                <div>
                  {posts.map((post) => (
                    <div key={post.id} className="border-b p-3">
                      <div className="flex items-center mb-3">
                        <img
                          src={post.user.profile_photo}
                          className="rounded-full mr-2 w-10 h-10"
                          alt="User"
                        />
                        <div className="flex-1">
                          <h6 className="font-bold">{post.user.name}</h6>
                          <small className="text-gray-500">
                            {post.createdAt}
                          </small>
                        </div>
                      </div>
                      <p className="mb-3 text-sm sm:text-base">
                        {post.content}
                      </p>
                      {post.image && (
                        <div className="mb-3 rounded-lg overflow-hidden border">
                          <img
                            src={post.image}
                            className="w-full h-auto object-cover"
                            alt="Posted content"
                          />
                        </div>
                      )}
                      <div className="border-t px-4 py-2 flex justify-between">
                        <button className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50">
                          <ThumbsUp size={14} className="mr-2" />
                          Like ({post.likes || 0})
                        </button>

                        <button
                          className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          onClick={() => setCommentModalPostId(post.id)}
                        >
                          <MessageCircle size={14} className="mr-2" />
                          Comment ({post.comments.length || 0})
                        </button>

                        <button
                          className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          onClick={() => setSharePostId(post.id)}
                        >
                          <Share size={14} className="mr-2" />
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Update Modal */}
              {showRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-bold">Change Member Role</h5>
                      <button
                        onClick={() => {
                          setShowRoleModal(false);
                          setEditingMemberId(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {editingMemberId === currentUser?.id ? (
                      <div className="text-red-500 mb-4">
                        You cannot change your own role.
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Role
                          </label>
                          <select
                            className="w-full p-2 border rounded"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            className="px-4 py-2 border rounded text-gray-700"
                            onClick={() => {
                              setShowRoleModal(false);
                              setEditingMemberId(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => handleUpdateMemberRole(editingMemberId)}
                          >
                            Update Role
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Remove Member Confirmation Modal */}
              {showRemoveModal && memberToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-bold">Remove Member</h5>
                      <button
                        onClick={() => {
                          setShowRemoveModal(false);
                          setMemberToRemove(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <p>Are you sure you want to remove <span className="font-semibold">{memberToRemove.user.name}</span> from this group?</p>
                      {memberToRemove.role === 'admin' && (
                        <p className="text-yellow-600 mt-2">This user is an admin. Removing them will revoke their admin privileges.</p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 border rounded text-gray-700"
                        onClick={() => {
                          setShowRemoveModal(false);
                          setMemberToRemove(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        onClick={handleRemoveMember}
                      >
                        Remove Member
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="lg:block lg:w-1/4">
              {/* Members Box */}
              <div className="rounded-xl border bg-white shadow mb-6">
                <div className="border-b p-4 flex items-center justify-between">
                  <h6 className="font-semibold text-gray-800">
                    {group.members?.length || 0} Members
                  </h6>
                  {isCurrentUserAdmin && (
                    <button
                      className="text-sm font-medium px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                      onClick={handleOpenInviteModal}
                    >
                      + Invite Connection
                    </button>
                  )}
                </div>
                <div className="p-4">
                  {group?.members?.length > 0 ? (
                    <ul className="space-y-4">
                      {group.members.map((member) => (
                        <li key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.user.photo
                                ? member.user.photo.startsWith('http')
                                  ? member.user.photo
                                  : `http://localhost:3000/${member.user.photo}`
                                : "/default-user.png"}
                              className="rounded-full w-10 h-10 object-cover"
                              alt={member.user.name}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{member.user.name}</p>
                              <div className="text-sm text-gray-500 flex gap-1 items-center">
                                {member.role === "admin" && (
                                  <span className="text-blue-600 font-medium">Admin</span>
                                )}
                                {member.user.id === currentUser?.id && (
                                  <span className="text-gray-400">(You)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isCurrentUserAdmin && member.user.id !== currentUser?.id && (
                            <div className="flex gap-2">
                              <button
                                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition"
                                onClick={() => {
                                  setEditingMemberId(member.user.id);
                                  setSelectedRole(member.role);
                                  setShowRoleModal(true);
                                }}
                              >
                                Edit Role
                              </button>
                              <button
                                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                                onClick={() => openRemoveConfirmation(member)}
                              >
                                <UserMinus size={16} />
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No members found.</p>
                  )}
                </div>
              </div>

              {/* Invite Modal */}
              {inviteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center border-b p-4">
                      <h5 className="font-bold text-gray-800">Invite Connection</h5>
                      <button
                        onClick={() => setInviteModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {connections.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No connections found</div>
                      ) : (
                        <ul className="divide-y">
                          {connections.map((connection) => {
                            const friend = connection.user;
                            const isActiveMember = group.members?.some(
                              member => member.user.id === friend.id
                            );
                            const isInvited = group.invitations?.some(
                              inv => inv.user_id === friend.id && inv.status === "pending"
                            );

                            return (
                              <li key={friend.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <img src={friend.photo || "/default-user.png"} className="w-10 h-10 rounded-full object-cover" alt={friend.name} />
                                  <span className="text-gray-800 font-medium">{friend.name}</span>
                                </div>
                                {isActiveMember ? (
                                  <span className="text-sm text-gray-400">Already a member</span>
                                ) : isInvited ? (
                                  <span className="text-sm text-yellow-500">Invitation sent</span>
                                ) : (
                                  <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition"
                                    onClick={() => handleInvite(friend.id)}
                                  >
                                    Invite
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {group.creator && (
                <div className="rounded-lg border bg-white shadow-sm mb-4">
                  <div className="border-b p-3">
                    <h6 className="font-medium">Group Admin</h6>
                  </div>
                  <div className="p-4 text-center">
                    <img
                      src={'http://localhost:3000/' + group.creator.photo || "/default-user.png"}
                      className="rounded-full w-20 h-20 mx-auto mb-2"
                      alt={group.creator.name}
                    />
                    <h5 className="font-bold text-gray-800">{group.creator.name}</h5>
                    <p className="text-gray-500 text-sm mt-1">{group.creator.headline || "No headline available"}</p>
                    {group.creator.about && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{group.creator.about}</p>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Case>
  );
}