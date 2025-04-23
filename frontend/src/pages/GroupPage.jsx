import { useState } from 'react';
import Case from '../components/Case';
import { MoreHorizontal, Image, Video, ThumbsUp, MessageCircle, Share, ArrowRight, ArrowDown, X, Copy } from 'lucide-react';
import GroupCover from '../assets/img/cover.jpg';

export default function GroupPage() {
  const [group, setGroup] = useState({
    name: "Web Development Group",
    description: "A community for web developers to share knowledge and tips",
    image: "/api/placeholder/80/80",
    members: [
      { id: 1, user: { id: 1, name: "Jane Smith", profile_photo: "/api/placeholder/50/50", role: "admin" } },
      { id: 2, user: { id: 2, name: "Mike Johnson", profile_photo: "/api/placeholder/50/50" } },
      { id: 3, user: { id: 3, name: "Sarah Williams", profile_photo: "/api/placeholder/50/50" } },
      { id: 4, user: { id: 4, name: "David Brown", profile_photo: "/api/placeholder/50/50" } },
      { id: 5, user: { id: 5, name: "Linda Davis", profile_photo: "/api/placeholder/50/50" } },
    ]
  });

  const [user, setUser] = useState({
    id: 1,
    name: "John Doe",
    profile_photo: "/api/placeholder/80/80",
    following_count: 42
  });

  const [connections, setConnections] = useState([
    { id: 1, from_user_id: 1, toUser: { id: 6, name: "Robert Wilson", profile_photo: "/api/placeholder/40/40" } },
    { id: 2, from_user_id: 1, toUser: { id: 7, name: "Emily Clark", profile_photo: "/api/placeholder/40/40" } },
    { id: 3, from_user_id: 1, toUser: { id: 8, name: "Michael Lee", profile_photo: "/api/placeholder/40/40" } },
    { id: 4, from_user_id: 3, fromUser: { id: 9, name: "Jessica Taylor", profile_photo: "/api/placeholder/40/40" } }
  ]);

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        id: 1,
        name: "John Doe",
        profile_photo: "/api/placeholder/40/40"
      },
      content: "This is a sample post content. Looking forward to our next group meeting!",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      createdAt: "2 hours ago",
      likes: 5,
      comments: [
        { id: 1, user: "Alice", text: "Great post!" },
        { id: 2, user: "Bob", text: "Looking forward to it!" }
      ]
    },
    {
      id: 2,
      user: {
        id: 2,
        name: "Jane Smith",
        profile_photo: "/api/placeholder/40/40"
      },
      content: "Just shared a new tutorial on React hooks. Check it out!",
      createdAt: "5 hours ago",
      likes: 12,
      comments: [
        { id: 1, user: "Charlie", text: "Very helpful!" }
      ]
    }
  ]);

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [postContent, setPostContent] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [commentModalPostId, setCommentModalPostId] = useState(null);

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
    setImagePreviewUrl('');
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const newPost = {
      id: posts.length + 1,
      user: {
        id: user.id,
        name: user.name,
        profile_photo: user.profile_photo
      },
      content: postContent,
      image: imagePreviewUrl,
      createdAt: "Just now",
      likes: 0,
      comments: []
    };
    
    setPosts([newPost, ...posts]);
    setPostContent('');
    setShowImagePreview(false);
    setImagePreviewUrl('');
  };

  const handleInvite = (userId) => {
    console.log("Inviting user with ID:", userId);
    setInviteModalOpen(false);
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const openCommentModal = (postId) => {
    setCommentModalPostId(postId);
  };

  const closeCommentModal = () => {
    setCommentModalPostId(null);
  };

  const shareUrl = window.location.href;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <Case>
      <div className="bg-gray-100 min-h-screen pb-8">
        {/* Cover Photo - Full width on all screens */}
        <div className="h-32 sm:h-48 w-full bg-gray-300">
          <img className="h-full w-full object-cover" src={GroupCover} alt="Cover" />
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Left Sidebar - Hidden on mobile, shown on lg+ */}
            <aside className="hidden lg:block lg:w-1/4">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 text-center">
                  <div className="profile-photo-container">
                    <img 
                      src={user.profile_photo}
                      className="rounded-full w-20 h-20 mx-auto" 
                      alt="Profile" 
                    />
                    <h5 className="font-bold text-gray-800 mt-3">{user.name}</h5>
                    <small className="text-gray-500">Group Admin</small>
                  </div>

                  <div className="mt-4 p-2">
                    <div className="flex items-center justify-between py-2">
                      <p className="text-gray-500">Request Join</p>
                      <p className="font-bold text-gray-800">{user.following_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - Full width on mobile, 2/4 on lg+ */}
            <main className="w-full lg:w-2/4">
              {/* Group Info Box - Stacked on mobile */}
              <div className="rounded-lg border bg-white shadow-sm mb-4">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row items-center">
                    <img 
                      className="rounded-full w-16 h-16 sm:w-20 sm:h-20" 
                      src={group.image} 
                      alt="Group" 
                    />
                    <div className="mt-3 sm:mt-0 sm:ml-4 text-center sm:text-left">
                      <h5 className="font-bold text-gray-800">{group.name}</h5>
                      <p className="text-gray-500 text-sm">{group.description}</p>
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
                        <label htmlFor="post-image" className="text-blue-500 cursor-pointer flex items-center text-sm">
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
                  {posts.map(post => (
                    <div key={post.id} className="border-b p-3">
                      <div className="flex items-center mb-3">
                        <img 
                          src={post.user.profile_photo} 
                          className="rounded-full mr-2 w-10 h-10" 
                          alt="User" 
                        />
                        <div className="flex-1">
                          <h6 className="font-bold">{post.user.name}</h6>
                          <small className="text-gray-500">{post.createdAt}</small>
                        </div>
                        <div className="relative group">
                          <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-1">
                            <MoreHorizontal size={16} />
                          </button>
                          <div className="hidden group-hover:block absolute right-0 bg-white border rounded shadow-lg z-10 w-32">
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Edit</button>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Delete</button>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Report</button>
                          </div>
                        </div>
                      </div>
                      <p className="mb-3 text-sm sm:text-base">{post.content}</p>
                      {post.image && (
                        <div className="mb-3 rounded-lg overflow-hidden border">
                          <img 
                            src={post.image} 
                            className="w-full h-auto object-cover" 
                            alt="Posted content" 
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap justify-between border-t pt-3 gap-2">
                        <div className="flex gap-2">
                          <button
                            className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center"
                            onClick={() => handleLikePost(post.id)}
                          >
                            <ThumbsUp size={14} className="mr-1" />
                            Like ({post.likes})
                          </button>
                          <button
                            className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center"
                            onClick={() => openCommentModal(post.id)}
                          >
                            <MessageCircle size={14} className="mr-1" />
                            Comment ({post.comments.length})
                          </button>
                        </div>
                        <div className="relative">
                          <button
                            className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center text-blue-500"
                            onClick={() => setSharePostId(post.id)}
                          >
                            <Share size={14} className="mr-1" /> Share
                          </button>

                          {sharePostId === post.id && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl border rounded-lg z-50 p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold text-gray-700 text-sm">
                                  Share
                                </h2>
                                <button onClick={() => setSharePostId(null)}>
                                  <X size={16} />
                                </button>
                              </div>
                              <div className="mb-3">
                                <label className="text-xs text-gray-500">Link</label>
                                <div className="flex items-center mt-1 bg-gray-100 px-2 py-1 rounded">
                                  <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="text-xs w-full bg-transparent focus:outline-none"
                                  />
                                  <button onClick={copyToClipboard}>
                                    <Copy size={14} className="text-gray-500 ml-2" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-3 text-sm mt-2">
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(
                                    shareUrl
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
                                </a>

                                <a
                                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                    shareUrl
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
                                </a>

                                <a
                                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                    shareUrl
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-400 hover:underline"
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M23.953 4.57a10.004 10.004 0 01-2.825.775 4.933 4.933 0 002.163-2.724 10.038 10.038 0 01-3.127 1.195 4.918 4.918 0 00-8.38 4.482C7.69 8.095 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475 4.902 4.902 0 002.188 4.084 4.897 4.897 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.085c.63 1.953 2.445 3.376 4.6 3.418A9.867 9.867 0 010 19.54 13.94 13.94 0 007.548 22c9.142 0 14.307-7.721 13.995-14.646a10.006 10.006 0 002.41-2.584z" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="font-bold block text-blue-500 w-full bg-transparent p-3 text-center border-t">
                  Load More <ArrowDown size={16} className="inline ml-1" />
                </button>
              </div>
            </main>

            {/* Right Sidebar - Hidden on mobile, shown on lg+ */}
            <aside className="hidden lg:block lg:w-1/4">
              {/* Members Box */}
              <div className="rounded-lg border bg-white shadow-sm mb-4">
                <div className="border-b p-3">
                  <h6 className="font-medium">{group.members.length} Members</h6>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {group.members.map(member => (
                      <div key={member.id} className="text-center">
                        <img 
                          src={member.user.profile_photo} 
                          className="rounded-full w-12 h-12" 
                          alt={member.user.name}
                        />
                        <p className="text-xs mt-1">{member.user.name}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="mt-3 border border-blue-500 text-blue-500 hover:bg-blue-50 px-3 py-2 rounded text-sm w-full"
                    onClick={() => setInviteModalOpen(true)}
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
                  {group.members.filter(member => member.user.role === 'admin').map(admin => (
                    <div key={admin.id} className="flex items-center mb-3">
                      <img 
                        src={admin.user.profile_photo} 
                        className="rounded-full mr-3 w-12 h-12" 
                        alt={admin.user.name}
                      />
                      <div>
                        <h6 className="font-bold">{admin.user.name}</h6>
                        <small className="text-blue-500">Group Admin</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Invite Modal - Responsive */}
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
                <ul className="divide-y">
                  {connections.map(connection => {
                    const friend = connection.from_user_id === user.id ? connection.toUser : connection.fromUser;
                    if (!friend) return null;
                    
                    return (
                      <li key={connection.id} className="py-3 px-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <img 
                            src={friend.profile_photo} 
                            className="rounded-full mr-3 w-10 h-10" 
                            alt=""
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
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal - Responsive */}
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
                {posts.find(p => p.id === commentModalPostId)?.comments.map(comment => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex items-start">
                      <div className="mr-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <h6 className="font-bold text-sm">{comment.user}</h6>
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