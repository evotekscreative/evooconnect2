import { useState } from 'react';
import Case from '../components/Case';
import { MoreHorizontal, Image, Video, ThumbsUp, MessageCircle, Share, ArrowRight, ArrowDown, X } from 'lucide-react';
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

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [postContent, setPostContent] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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
    // Here you would handle the post submission
    console.log("Post submitted:", { content: postContent, image: imagePreviewUrl });
    setPostContent('');
    setShowImagePreview(false);
    setImagePreviewUrl('');
  };

  const handleInvite = (userId) => {
    console.log("Inviting user with ID:", userId);
    // Here you would handle the invitation logic
    setInviteModalOpen(false);
  };

  return (
    <Case>
    <div className="bg-gray-100 min-h-screen pb-8">
      {/* Cover Photo */}
      <div className="h-48 w-full bg-gray-300 text-center">
        <img className="h-full w-full object-cover" src={GroupCover} alt="Cover" />
      </div>

      {/* Main Content Area */}
      <div className="border-b bg-white shadow-sm mb-4">
        <div className="container mx-auto">
          <div className="w-full">
            {/* Placeholder for additional content */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-1/4 lg:pr-4 mb-4 lg:mb-0">
            <div className="rounded border bg-white shadow-sm text-center mb-4">
              <div className="p-4 text-center">
                <div>
                  {/* Profile Photo */}
                  <div className="profile-photo-container">
                    <img 
                      src={user.profile_photo}
                      className="rounded-full w-24 h-24 mx-auto mt-4" 
                      alt="Profile" 
                    />
                    <h5 className="font-bold text-gray-800 mb-1 mt-3">{user.name}</h5>
                    <small className="text-gray-500">Group Created:</small>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-500 mb-0">Request Join</p>
                      <p className="font-bold text-gray-800 mb-0">{user.following_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-2/4 lg:px-4 mb-4 lg:mb-0">
            {/* Group Info Box */}
            <div className="rounded border bg-white shadow-sm mb-4">
              <div className="p-4">
                <div className="border-b flex flex-col items-center justify-center p-3 text-center">
                  <div className="flex items-center">
                    <img 
                      className="rounded-full w-20 h-20" 
                      src={group.image} 
                      alt="Group" 
                    />
                  </div>
                  <h5 className="font-bold text-gray-800 mb-2 mt-3">{group.name}</h5>
                  <p className="text-gray-500 mb-0">{group.description}</p>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-gray-500 mb-0">Members</p>
                    <p className="font-bold text-gray-800 mb-0">25</p>
                  </div>
                  <div className="flex items-start justify-between">
                    <p className="text-gray-500 mb-0">Posts</p>
                    <p className="font-bold text-gray-800 mb-0">120</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Post Box */}
            <div className="rounded border bg-white shadow-sm mb-4">
              <div className="border-b p-3">
                <h6 className="m-0 font-medium">Create New Post</h6>
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
                      className="w-full p-2 border rounded" 
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

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <label htmlFor="post-image" className="text-blue-500 cursor-pointer flex items-center">
                        <Image size={18} className="mr-1" /> Photo
                      </label>
                      <input 
                        type="file" 
                        id="post-image" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleImageUpload}
                      />

                      <span className="text-blue-500 cursor-pointer flex items-center">
                        <Video size={18} className="mr-1" /> Video
                      </span>
                    </div>

                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">Post</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Posts Display */}
            <div className="rounded border bg-white shadow-sm mb-4">
              <div className="border-b p-3">
                <h6 className="m-0 font-medium">Recent Posts</h6>
              </div>
              <div className="p-0">
                {/* Sample Post */}
                <div className="border-b p-3">
                  <div className="flex items-center mb-3">
                    <img 
                      src="/api/placeholder/40/40" 
                      className="rounded-full mr-2 w-10 h-10" 
                      alt="" 
                    />
                    <div>
                      <h6 className="font-bold mb-0">John Doe</h6>
                      <small className="text-gray-500">2 hours ago</small>
                    </div>
                    <div className="ml-auto relative group">
                      <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-1">
                        <MoreHorizontal size={16} />
                      </button>
                      <div className="hidden group-hover:block absolute right-0 bg-white border rounded shadow-lg z-10 w-32">
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 text-sm">Edit</a>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 text-sm">Delete</a>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 text-sm">Report</a>
                      </div>
                    </div>
                  </div>
                  <p>This is a sample post content. Looking forward to our next group meeting!</p>
                  <img src="/api/placeholder/600/400" className="w-full mb-3 rounded" alt="" />
                  <div className="flex justify-between">
                    <div className="flex space-x-2 text-blue-500">
                      <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center">
                        <ThumbsUp size={14} className="mr-1" /> Like (24)
                      </button>
                      <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center">
                        <MessageCircle size={14} className="mr-1" /> Comment (8)
                      </button>
                    </div>
                    <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center text-blue-500">
                      <Share size={14} className="mr-1" /> Share
                    </button>
                  </div>
                </div>
              </div>
              <a href="#" className="font-bold block text-blue-500 w-full bg-transparent p-3 text-center">
                Load More <ArrowDown size={16} className="inline ml-1" />
              </a>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-1/4 lg:pl-4">
            {/* Members Box */}
            <div className="rounded border bg-white shadow-sm mb-4">
              <div className="border-b p-3">
                <h6 className="m-0 font-medium">{group.members.length} Members</h6>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap">
                  {group.members.map(member => (
                    <div key={member.id} className="m-2 text-center">
                      <img 
                        src={member.user.profile_photo} 
                        className="rounded-full w-12 h-12" 
                        alt={member.user.name}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  className="mt-3 border border-blue-500 text-blue-500 hover:bg-blue-50 px-3 py-1 rounded text-sm"
                  onClick={() => setInviteModalOpen(true)}
                >
                  Invite Connection
                </button>
              </div>
              <a href="#" className="font-bold block text-blue-500 w-full bg-transparent p-3 text-center border-t">
                Show all <ArrowRight size={16} className="inline ml-1" />
              </a>
            </div>

            {/* Admin Box */}
            <div className="rounded border bg-white shadow-sm mb-4">
              <div className="border-b p-3">
                <h6 className="m-0 font-medium">Admin</h6>
              </div>
              <div className="p-3">
                {group.members.filter(member => member.user.role === 'admin').map(admin => (
                  <div key={admin.id} className="flex items-center mb-2">
                    <img 
                      src={admin.user.profile_photo} 
                      className="rounded-full mr-3 w-12 h-12" 
                      alt={admin.user.name}
                    />
                    <div>
                      <h6 className="font-bold mb-0">{admin.user.name}</h6>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b p-4">
              <h5 className="font-bold">Invite Connection</h5>
              <button 
                onClick={() => setInviteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <ul className="divide-y">
                {connections.map(connection => {
                  const friend = connection.from_user_id === user.id ? connection.toUser : connection.fromUser;
                  if (!friend) return null;
                  
                  return (
                    <li key={connection.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src={friend.profile_photo} 
                          className="rounded-full mr-2 w-10 h-10" 
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
    </div>
    </Case> 
    );
}