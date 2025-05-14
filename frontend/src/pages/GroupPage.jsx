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
  const [invitedUserName, setInvitedUserName] = useState("");
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
      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroup(response.data.data);
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

      if (!token || !currentUser) {
        console.error("No authentication token or user data found");
        toast.error("You need to be logged in to invite users");
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/invitations/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const invitedUser = connections.find(conn => conn.user?.id === userId);
      if (invitedUser) {
        setInvitedUserName(invitedUser.user.name);
      }

      setShowInviteSuccess(true);
      setInviteModalOpen(false);
      setTimeout(() => setShowInviteSuccess(false), 3000);
      toast.success(`Invitation sent to ${invitedUser?.user?.name || 'user'}`);

    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error(error.response?.data?.message || "Failed to invite user. Please try again.");
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
            </main>

            {/* Right Sidebar */}
            <aside className="lg:block lg:w-1/4">
              {/* Members Box */}
              <div className="rounded-lg border bg-white shadow-sm mb-4">
                <div className="border-b p-3">
                  <h6 className="font-medium">
                    {group.members?.length || 0} Members
                  </h6>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {group?.members?.length > 0 ? (
                      <ul className="space-y-3">
                        {group.members.map((member) => (
                          <li key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={'http://localhost:3000/' + member.user.photo}
                                className="rounded-full mr-3 w-10 h-10"
                                alt={member.name}
                              />
                              <div>
                                <h6 className="font-bold text-gray-800">{member.user.name}</h6>
                                {member.role === "admin" && (
                                  <small className="text-blue-500">Admin</small>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No members found.</p>
                    )}
                  </div>
                  <button
                    className="mt-3 border border-blue-500 text-blue-500 hover:bg-blue-50 px-3 py-2 rounded text-sm w-full"
                    onClick={handleOpenInviteModal}
                  >
                    Invite Connection
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Invite Modal */}
        {inviteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center border-b p-4">
                <h5 className="font-bold">Invite Connection</h5>
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {connections.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No connections found
                  </div>
                ) : (
                  <ul className="divide-y">
                    {connections.map((connection) => {
                      const friend = connection.user;
                      const isMember = group.members?.some((member) => member.user.id === friend.id);

                      return (
                        <li
                          key={connection.id}
                          className="py-3 px-4 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <img
                              src={friend.profile_photo || "/default-user.png"}
                              className="rounded-full mr-3 w-10 h-10"
                              alt={friend.name}
                            />
                            <span>{friend.name}</span>
                          </div>
                          {isMember ? (
                            <span className="text-gray-500 text-sm">Already a member</span>
                          ) : (
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
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
      </div>
    </Case>
  );
}