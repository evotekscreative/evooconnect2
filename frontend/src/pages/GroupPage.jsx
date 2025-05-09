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
  const [group, setGroup] = useState({
    name: "Web Development Group",
    description: "A community for web developers to share knowledge and tips",
    image: "/api/placeholder/80/80",
    members: [],
  });
  const [user, setUser] = useState({
    id: 1,
    name: "John Doe",
    profile_photo: "/api/placeholder/80/80",
    following_count: 42,
  });


  const fetchGroupMembers = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/members`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      // Ensure response.data is an array before setting it
      const members = Array.isArray(response.data) ? response.data : [];

      setGroup((prevGroup) => ({
        ...prevGroup,
        members: members,
      }));
    } catch (error) {
      console.error("Error fetching group members:", error);
      // Set members to empty array on error
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: [],
      }));
    }
  };

  useEffect(() => {
    // Ganti '1' dengan ID grup yang sebenarnya atau dari props/route
    const groupId = 1;
    fetchGroupMembers(groupId);
  }, []); // Empty dependency array berarti hanya dijalankan sekali saat mount

  const fetchUserConnections = async (userId) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await axios.get(
        `http://localhost:3000/api/users/${(user.id)}/connections`,
        {
          params: {
            limit: 10,
            offset: 0
          },
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setConnections(response.data.data.connections);
    } catch (error) {
      console.error("Error fetching user connections:", error);
    }
  };

  const handleOpenInviteModal = () => {
    fetchUserConnections(user.id); 
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
      content: "This is a sample post content. Looking forward to our next group meeting!",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
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

  const handleLikePost = (postId, isLiked) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !isLiked,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleOpenShareModal = (postId) => {
    setSharePostId(postId === sharePostId ? null : postId);
  };

  const handleInvite = async (userId) => {
    try {
      const groupId = 1; // Replace with actual group ID
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("No authentication token found");
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
      
      // Find the invited user's name
      const invitedUser = connections.find(conn => {
        const friend = conn.user || conn.friend;
        return friend && friend.id === userId;
      });

      if (invitedUser) {
        const friend = invitedUser.user || invitedUser.friend;
        setInvitedUserName(friend.name);
      }

      setShowInviteSuccess(true);
      setInviteModalOpen(false);
      
      // Hide the success alert after 3 seconds
      setTimeout(() => {
        setShowInviteSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Failed to invite user. Please try again.");
    }
  };

  const openCommentModal = (postId) => {
    setCommentModalPostId(postId);
  };

  const closeCommentModal = () => {
    setCommentModalPostId(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

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
        {/* Cover Photo - Full width on all screens */}
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
            {/* Left Sidebar  Hidden on mobile, shown on lg+ */}
            <aside className=" lg:block lg:w-1/4">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 text-center">
                  <div className="profile-photo-container">
                    <img
                      src={group.creator.photo}
                      className="rounded-full w-20 h-20 mx-auto"
                      alt="Profile"
                    />
                    <h5 className="font-bold text-gray-800 mt-3">
                      {group.creator.name}
                    </h5>
                    <small className="text-gray-500">Group Admin</small>
                  </div>

                  <div className="mt-4 p-2">
                    <div className="flex items-center justify-between py-2">
                      <p className="text-gray-500">Members</p>
                      <p className="font-bold text-gray-800">
                        {group.members_count}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="w-full lg:w-2/4">
              {/* Group Info Box - Stacked on mobile */}
              <div className="rounded-lg border bg-white shadow-sm mb-4">
                <div className="p-4">
                  <div className="flex items-center">
                    <img
                      className="rounded-full w-16 h-16"
                      src={"http://localhost:3000/" + group.image || "/placeholder.png"} 
                      alt={group.name || "Group"}
                    />
                    <div className="ml-4">
                      <h5 className="font-bold text-gray-800">{group.name}</h5>
                      <p className="text-gray-500 text-sm">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Members</p>
                      <p className="font-bold">25</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Posts</p>
                      <p className="font-bold">120</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="rounded-lg border bg-white shadow-sm p-4">
                <h3 className="font-bold text-lg mb-4">Members</h3>
                {group?.members?.length > 0 ? (
                  <ul>
                    {group.members.map((member) => (
                      <li key={member.id} className="text-gray-700">
                        {member.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No members found.</p>
                )}
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
                        required
                      ></textarea>
                    </div>

                    {showImagePreview && (
                      <div className="mb-3 relative">
                        <img
                          src={imagePreviewUrl}
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

                        <span className="text-blue-500 cursor-pointer flex items-center text-sm">
                          <Video size={16} className="mr-1" /> Video
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                        disabled={!postContent.trim()}
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
                        <div className="relative group">
                          <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-1">
                            <MoreHorizontal size={16} />
                          </button>
                          <div className="hidden group-hover:block absolute right-0 bg-white border rounded shadow-lg z-10 w-32">
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                              Edit
                            </button>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                              Delete
                            </button>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                              Report
                            </button>
                          </div>
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
                        <button
                          className={`flex items-center justify-center w-1/3 py-2 rounded-lg ${post.isLiked
                            ? "text-blue-600 bg-blue-50"
                            : "text-blue-600 hover:bg-blue-100"
                            }`}
                        >
                          <ThumbsUp size={14} className="mr-2" />
                          Like ({post.likes_count || 0})
                        </button>

                        <button
                          className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          onClick={() => openCommentModal(post.id)}
                        >
                          <MessageCircle size={14} className="mr-2" />
                          Comment ({post.comments_count || 0})
                        </button>

                        <button
                          className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          onClick={() => setSharePostId(post.id)}
                        >
                          <Share size={14} className="mr-2" />
                          Share
                        </button>
                      </div>
                      {sharePostId === post.id && (
                        <div className="border-t pt-3">
                          <div className="bg-white shadow-xl border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h2 className="font-semibold text-gray-700 text-sm">
                                Share
                              </h2>
                              <button onClick={() => setSharePostId(null)}>
                                <X size={16} />
                              </button>
                            </div>
                            <div className="mb-3">
                              <label className="text-xs text-gray-500">
                                Link
                              </label>
                              <div className="flex items-center mt-1 bg-gray-100 px-2 py-1 rounded">
                                <input
                                  type="text"
                                  readOnly
                                  value={window.location.href}
                                  className="text-xs w-full bg-transparent focus:outline-none"
                                />
                                <button onClick={copyToClipboard}>
                                  <Copy
                                    size={14}
                                    className="text-gray-500 ml-2"
                                  />
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3 text-sm mt-2">
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(
                                  window.location.href
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-green-500 hover:underline"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.52 3.48A11.77 11.77 0 0012 0C5.37 0 .13 6.41.13 12.72c0 2.01.52 3.97 1.5 5.69L0 24l5.81-1.52a11.91 11.91 0 006.2 1.71h.01c6.63 0 11.87-6.42 11.87-12.73 0-2.8-1.12-5.44-3.17-7.47zm-8.5 17.6c-1.79 0-3.55-.47-5.08-1.35l-.36-.21-3.45.91.92-3.36-.23-.35a9.4 9.4 0 01-1.42-5c0-5.05 4.07-9.72 9.1-9.72a9.4 9.4 0 019.23 9.46c0 5.15-4.07 9.62-9.7 9.62zm5.3-7.27c-.29-.14-1.71-.84-1.97-.93-.26-.1-.45-.14-.64.15-.19.28-.74.93-.91 1.12-.17.19-.34.22-.63.07-.29-.14-1.23-.46-2.34-1.47-.86-.77-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.28.29-.47.1-.19.05-.36-.02-.51-.07-.14-.64-1.53-.88-2.1-.23-.56-.47-.49-.64-.5-.16 0-.36 0-.55 0-.19 0-.5.07-.76.35-.26.28-1 1-1 2.43 0 1.42 1.02 2.8 1.16 3 .14.19 2 3.15 4.87 4.42.68.29 1.21.46 1.62.59.68.21 1.3.18 1.79.11.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.13-.26-.2-.55-.34z" />
                                </svg>
                                WhatsApp
                              </a>

                              <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                  window.location.href
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.343v21.314C0 23.4.6 24 1.343 24H12.82V14.706h-3.3v-3.622h3.3V8.413c0-3.26 1.993-5.034 4.902-5.034 1.393 0 2.593.104 2.942.15v3.412l-2.02.001c-1.582 0-1.89.752-1.89 1.854v2.43h3.78l-.492 3.622h-3.288V24h6.453C23.4 24 24 23.4 24 22.657V1.343C24 .6 23.4 0 22.675 0z" />
                                </svg>
                                Facebook
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="font-bold block text-blue-500 w-full bg-transparent p-3 text-center border-t">
                  Load More <ArrowDown size={16} className="inline ml-1" />
                </button>
              </div>
            </main>

            {/* Right Sidebar - Hidden on mobile, shown on lg+ */}
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
                    {group.members.map((member) => (
                      <div key={member.id} className="text-center">
                        <img
                          src={member.profile_photo} // Sesuaikan dengan struktur data API
                          className="rounded-full w-12 h-12"
                          alt={member.name}
                        />
                        <p className="text-xs mt-1 truncate w-12">{member.name}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-3 border border-blue-500 text-blue-500 hover:bg-blue-50 px-3 py-2 rounded text-sm w-full"
                    onClick={handleOpenInviteModal}
                  >
                    Invite Connection
                  </button>
                </div>
                <button className="font-bold block text-blue-500 w-full bg-transparent p-3 text-center border-t">
                  Show all <ArrowRight size={16} className="inline ml-1" />
                </button>
              </div>

              {/* Admin Box */}
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-3">
                  <h6 className="font-medium">Admin</h6>
                </div>
                <div className="p-3">
                  {Array.isArray(group.members) &&
                    group.members
                      .filter((member) => member.role === "admin") // Changed from member.user.role
                      .map((admin) => (
                        <div key={admin.id} className="flex items-center mb-3">
                          <img
                            src={admin.profile_photo} // Changed from admin.user.profile_photo
                            className="rounded-full mr-3 w-12 h-12"
                            alt={admin.name} // Changed from admin.user.name
                          />
                          <div>
                            <h6 className="font-bold">{admin.name}</h6>{" "}
                            {/* Changed from admin.user.name */}
                            <small className="text-blue-500">Group Admin</small>
                          </div>
                        </div>
                      ))}
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
                    Loading connections...
                  </div>
                ) : (
                  <ul className="divide-y">
                    {connections.map((connection) => {
                      // Assuming API returns connections in format where the friend is either in 'user' or 'friend' property
                      const friend = connection.user || connection.friend;
                      if (!friend) return null;

                      return (
                        <li
                          key={connection.id}
                          className="py-3 px-4 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <img
                              src={
                                friend.profile_photo || "/api/placeholder/40/40"
                              }
                              className="rounded-full mr-3 w-10 h-10"
                              alt={friend.name}
                            />
                            <span>{friend.name}</span>
                          </div>
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleInvite(friend.id)}
                          >
                            Invite
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {commentModalPostId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center border-b p-4">
                <h5 className="font-bold">Comments</h5>
                <button
                  onClick={closeCommentModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                {posts
                  .find((p) => p.id === commentModalPostId)
                  ?.comments.map((comment) => (
                    <div key={comment.id} className="mb-4">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <h6 className="font-bold text-sm">
                              {comment.user}
                            </h6>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="border-t p-4">
                <textarea
                  className="w-full p-2 border rounded text-sm"
                  rows="3"
                  placeholder="Write a comment..."
                ></textarea>
                <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Case>
  );
}