import { useState, useRef } from 'react';
import { 
  SquarePen,
  NotebookPen,
  ThumbsUp,
  MessageCircle,
  MoreHorizontal,
  Share,
  Globe,
  CircleHelp,
  X,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/Button';

export default function SocialNetworkFeed() {
  const [postContent, setPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('update'); // 'update' or 'article'
  const [articleImages, setArticleImages] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false); 
  const fileInputRef = useRef(null);

  const openPremiumModal = () => {
    setShowPremiumModal(true);
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleVisibilityChange = (visibility) => {
    setPostVisibility(visibility);
  };

  const data = [
    { name: 'Day 1', views: 2 },
    { name: 'Day 2', views: 1 },
    { name: 'Day 3', views: 3 },
    { name: 'Day 4', views: 1 },
    { name: 'Day 5', views: 1 },
  ];

  // Simulate successful registration
  const simulateRegistrationSuccess = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000); // Hide notification after 5 seconds
  };

  // Sample posts data with comments
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: "/api/placeholder/40/40",
        initials: "JD"
      },
      time: "2 hours ago",
      content: "Check out these photos from our last trip! So many great memories.",
      photos: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      likes: 0,
      comments: [
        {
          id: 1,
          user: {
            name: "Jane Smith",
            avatar: "/api/placeholder/40/40",
            initials: "JS"
          },
          text: "Looks amazing! Where was this taken?",
          time: "1 hour ago",
          replies: [
            {
              id: 1,
              user: {
                name: "John Doe",
                avatar: "/api/placeholder/40/40",
                initials: "JD"
              },
              text: "This was in Bali! The beaches are incredible.",
              time: "45 minutes ago"
            }
          ]
        },
        {
          id: 2,
          user: {
            name: "Alex Johnson",
            avatar: "/api/placeholder/40/40",
            initials: "AJ"
          },
          text: "Beautiful photos! 😍",
          time: "30 minutes ago",
          replies: []
        }
      ]
    },
    {
      id: 2,
      user: {
        name: "Jane Smith",
        avatar: "/api/placeholder/40/40",
        initials: "JS"
      },
      time: "5 hours ago",
      content: "Beautiful sunset at the beach today!",
      photos: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      likes: 0,
      comments: [
        {
          id: 1,
          user: {
            name: "Mike Brown",
            avatar: "/api/placeholder/40/40",
            initials: "MB"
          },
          text: "Stunning view! What camera did you use?",
          time: "4 hours ago",
          replies: []
        }
      ]
    },
    {
      id: 3,
      user: {
        name: "Alex Johnson",
        avatar: "/api/placeholder/40/40",
        initials: "AJ"
      },
      time: "1 day ago",
      content: "Working on some new projects with the team!",
      photos: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      likes: 0,
      comments: []
    }
  ]);

  const openImageModal = (post, index) => {
    setSelectedPost(post);
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedPost(null);
    setSelectedImageIndex(0);
  };

  const navigateImage = (direction) => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? selectedPost.photos.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === selectedPost.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setArticleImages([...articleImages, ...imageUrls]);
  };

  const removeImage = (index) => {
    const newImages = [...articleImages];
    newImages.splice(index, 1);
    setArticleImages(newImages);
  };

  const handlePostSubmit = () => {
    if (!postContent.trim() && articleImages.length === 0) return;
    
    const newPost = {
      id: posts.length + 1,
      user: {
        name: "PPLG EVOTEKS",
        avatar: "",
        initials: "PE"
      },
      time: "Just now",
      content: postContent,
      photos: [...articleImages],
      likes: 0,
      comments: []
    };
    
    setPosts([newPost, ...posts]);
    setPostContent('');
    setArticleImages([]);
    setActiveTab('update');
  };

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
    setCommentText('');
    setReplyingTo(null);
    setReplyText('');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const updatedPosts = posts.map(post => {
      if (post.id === currentPostId) {
        const newComment = {
          id: Date.now(), // Using timestamp as ID for simplicity
          user: {
            name: "PPLG EVOTEKS",
            avatar: "",
            initials: "PE"
          },
          text: commentText,
          time: "Just now",
          replies: []
        };
        
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setCommentText('');
  };

  const handleReply = (commentId) => {
    if (!replyText.trim()) return;

    const updatedPosts = posts.map(post => {
      if (post.id === currentPostId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
            const newReply = {
              id: Date.now(), // Using timestamp as ID for simplicity
              user: {
                name: "PPLG EVOTEKS",
                avatar: "",
                initials: "PE"
              },
              text: replyText,
              time: "Just now"
            };
            
            return {
              ...comment,
              replies: [...comment.replies, newReply]
            };
          }
          return comment;
        });
        
        return {
          ...post,
          comments: updatedComments
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleLikePost = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };

  const renderPhotoGrid = (photos) => {
    if (photos.length === 1) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <img 
            src={photos[0]} 
            className="w-full h-96 object-cover cursor-pointer" 
            alt="Post" 
            onClick={() => openImageModal({photos}, 0)}
          />
        </div>
      );
    } else if (photos.length === 2) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {photos.map((photo, index) => (
              <img 
                key={index}
                src={photo} 
                className="w-full h-48 object-cover cursor-pointer" 
                alt={`Post ${index + 1}`}
                onClick={() => openImageModal({photos}, index)}
              />
            ))}
          </div>
        </div>
      );
    } else if (photos.length === 3) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-3 gap-1">
            <img 
              src={photos[0]} 
              className="w-full h-96 object-cover col-span-2 cursor-pointer" 
              alt="Post 1"
              onClick={() => openImageModal({photos}, 0)}
            />
            <div className="flex flex-col gap-1">
              <img 
                src={photos[1]} 
                className="w-full h-48 object-cover cursor-pointer" 
                alt="Post 2"
                onClick={() => openImageModal({photos}, 1)}
              />
              <img 
                src={photos[2]} 
                className="w-full h-48 object-cover cursor-pointer" 
                alt="Post 3"
                onClick={() => openImageModal({photos}, 2)}
              />
            </div>
          </div>
        </div>
      );
    } else if (photos.length >= 4) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-4 gap-1">
            <img 
              src={photos[0]} 
              className="w-full h-96 object-cover col-span-3 cursor-pointer" 
              alt="Post 1"
              onClick={() => openImageModal({photos}, 0)}
            />
            <div className="flex flex-col gap-1">
              {photos.slice(1, 4).map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    className="w-full h-32 object-cover cursor-pointer" 
                    alt={`Post ${index + 2}`}
                    onClick={() => openImageModal({photos}, index + 1)}
                  />
                  {index === 2 && photos.length > 4 && (
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                      onClick={() => openImageModal({photos}, 3)}
                    >
                      +{photos.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentPost = posts.find(post => post.id === currentPostId);

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 px-4 md:px-6 lg:px-12 xl:px-32 py-4 md:py-6">
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow">
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center text-lg text-gray-600 mr-3">
            PE
          </div>
          <h2 className="font-bold">PPLG EVOTEKS</h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>
      {/* Notification Alert */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Registration successful! Welcome to EVOConnect.
        </div>
      )}

      {/* Left Sidebar - Profile Section */}
      <div className="w-1/4 pr-4">
        <div className="bg-white rounded-lg shadow mb-4 p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-gray-200 w-20 h-20 flex items-center justify-center text-3xl text-gray-600">
              PE
            </div>
          </div>
          
          <h2 className="text-lg font-bold mb-4">PPLG EVOTEKS</h2>
          
          <div className="flex border-t pt-3">
            <div className="text-center border-r pr-10">
              <div className="text-base font-semibold">358</div>
              <div className="text-gray-500 text-xs">Connections</div>
            </div>
            <div className="text-center pl-12">
              <div className="text-base font-semibold">85</div>
              <div className="text-gray-500 text-xs">Views</div>
            </div>
          </div>
          
          <button className="mt-3 text-blue-500 text-sm font-medium">View my profile</button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="font-medium text-sm mb-3">Profile Views</h3>
          
          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-xl font-semibold text-cyan-400">08</div>
              <div className="text-gray-500 text-xs">last 5 days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-500">+ 43%</div>
              <div className="text-gray-500 text-xs">Since last week</div>
            </div>
          </div>
          
          <div className="h-20 mt-2">
            {/* Chart placeholder */}
            <div className="w-full h-full bg-gradient-to-r from-cyan-300 to-cyan-400 rounded-md"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Feed */}
      <div
        className={`w-full ${
          showMobileMenu ? "hidden" : "block"
        } md:block md:w-full lg:w-1/2 px-0 md:px-1`}
      >
        {/* Simulate Registration Success Button */}
        <div className="mb-4">
          <button
            onClick={simulateRegistrationSuccess}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Simulate Registration Success
          </button>
        </div>

        {/* Post creation box */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <div className="flex items-center mb-3">
            <div className="tabs w-full flex border-b">
              <button 
                className={`tab flex-1 py-1 text-center flex items-center justify-center text-sm ${activeTab === 'update' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('update')}
              >
                <SquarePen size={14} className="mr-1" />
                Share an update
              </button>
              <button 
                className={`tab flex-1 py-1 text-center flex items-center justify-center text-sm ${activeTab === 'article' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('article')}
              >
                <NotebookPen size={14} className="mr-1" />
                Write an article
              </button>
            </div>
          </div>
          
          {activeTab === 'update' ? (
            <>
              <div className='border-b mb-3'>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                    PE
                  </div>
                  <input 
                    type="text" 
                    className="flex-1 border-0 outline-none bg-transparent text-sm"
                    placeholder="Write your thoughts..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                </div>
                
                <div className="flex mb-3 ml-10">
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">Public</span>
                  <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">Private</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Only Connection</span>
                  <button className="ml-2 text-gray-500">
                    <CircleHelp size={14} />
                  </button>
                </div>
              </div>
              
              <Button className="px-[12px] py-[6px] text-sm" onClick={handlePostSubmit}>
                Share an update
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <input 
                  type="text" 
                  className="w-full border rounded p-2 mb-3 min-h-[100px] text-sm"
                placeholder="Write your article here..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>
              
              
              <div className="mb-3">
                {articleImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {articleImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img} 
                          className="w-full h-24 object-cover rounded border"
                          alt={`Upload ${index + 1}`}
                        />
                        <button 
                          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                          onClick={() => removeImage(index)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  className="flex items-center text-blue-500 text-sm"
                  onClick={() => fileInputRef.current.click()}
                >
                  <ImageIcon size={16} className="mr-1" />
                  Add photos
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">Public</span>
                  <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">Private</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Only Connection</span>
                  <button className="ml-2 text-gray-500">
                    <CircleHelp size={14} />
                  </button>
                </div>
                
                <Button className="px-[12px] py-[6px] text-sm" onClick={handlePostSubmit}>
                  Publish article
                </Button>
              </div>
            </>
          )}
        </div>
        
        {/* Posts */}
        <div className="p-0">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow mb-4 border-b p-3">
              <div className="border-b pb-3 flex items-center mb-3">
                {post.user.avatar ? (
                  <img 
                    src={post.user.avatar} 
                    className="rounded-full mr-2 w-10 h-10" 
                    alt="User" 
                  />
                ) : (
                  <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center text-sm mr-2">
                    {post.user.initials}
                  </div>
                )}
                <div>
                  <h6 className="font-bold mb-0">{post.user.name}</h6>
                  <small className="text-gray-500">{post.time}</small>
                </div>
                <div className="ml-auto relative group">
                  <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-1">
                    <Globe size={16} />
                  </button>
                </div>
              </div>
              
              <p className="mb-3">{post.content}</p>
              
              {post.photos && post.photos.length > 0 && renderPhotoGrid(post.photos)}
              
              <div className="flex justify-between border-t pt-3">
                <div className="flex space-x-2 text-blue-500">
                  <button 
                    className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center"
                    onClick={() => handleLikePost(post.id)}
                  >
                    <ThumbsUp size={14} className="mr-1" /> Like ({post.likes})
                  </button>
                  <button 
                    className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center"
                    onClick={() => openCommentModal(post.id)}
                  >
                    <MessageCircle size={14} className="mr-1" /> Comment ({post.comments.length})
                  </button>
                </div>
                <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center text-blue-500">
                  <Share size={14} className="mr-1" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-1/4 pl-4">
        {/* People You Might Know */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <h3 className="font-medium text-sm mb-3">People you might know</h3>
          
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-2">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Bintang Asydqi</div>
              <div className="text-gray-500 text-xs">Student at Alexander</div>
            </div>
            <div className="text-blue-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Premium Banner */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <div className="mb-2">
            <img src="/" alt="Premium" className="w-full rounded" />
          </div>
          <h3 className="font-bold text-base text-yellow-500 text-center mb-1">EVOConnect Premium</h3>
          <p className="text-gray-600 text-xs text-center mb-3">Grow & nurture your network</p>
          <button className="w-full border border-yellow-500 text-yellow-500 py-1.5 rounded-lg font-medium text-sm">
            ACTIVATE
          </button>
        </div>
        
        {/* Jobs */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="font-medium text-sm mb-3">Jobs</h3>
          <div className="mb-4">
                <div className='bg-gray-100 p-4 rounded-lg '>
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold">Product Director</h3>
                  <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                    <img src="/api/placeholder/24/24" alt="Company Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <p className="text-blue-500">Spotify Inc.</p>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin size={14} className="mr-1" />
                  <span>India, Punjab</span>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                  </div>
                  <span className="text-gray-600 text-sm ml-2">18 connections</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full">
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={closeImageModal}
            >
              <X size={24} />
            </button>
            
            <div className="relative">
              <img 
                src={selectedPost.photos[selectedImageIndex]} 
                className="w-full max-h-screen object-contain" 
                alt={`Post ${selectedImageIndex + 1}`}
              />
              
              {selectedPost.photos.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                    onClick={() => navigateImage('prev')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                    onClick={() => navigateImage('next')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="flex space-x-2">
                {selectedPost.photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${selectedImageIndex === index ? 'bg-white' : 'bg-gray-500'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && currentPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button onClick={closeCommentModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {currentPost.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                currentPost.comments.map(comment => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex items-start mb-2">
                      {comment.user.avatar ? (
                        <img 
                          src={comment.user.avatar} 
                          className="rounded-full mr-2 w-8 h-8" 
                          alt="User" 
                        />
                      ) : (
                        <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center text-xs mr-2">
                          {comment.user.initials}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="font-semibold text-sm">{comment.user.name}</div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{comment.time}</div>
                        <button 
                          className="text-xs text-blue-500 mt-1"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          Reply
                        </button>
                        
                        {replyingTo === comment.id && (
                          <div className="mt-2 flex">
                            <input
                              type="text"
                              className="flex-1 border rounded-l-lg p-2 text-sm"
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                              className="bg-blue-500 text-white px-3 rounded-r-lg text-sm"
                              onClick={() => handleReply(comment.id)}
                            >
                              Post
                            </button>
                          </div>
                        )}
                        
                        {comment.replies.length > 0 && (
                          <div className="mt-2 ml-6 pl-4 border-l-2 border-gray-200">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="mb-3">
                                <div className="flex items-start">
                                  {reply.user.avatar ? (
                                    <img 
                                      src={reply.user.avatar} 
                                      className="rounded-full mr-2 w-6 h-6" 
                                      alt="User" 
                                    />
                                  ) : (
                                    <div className="rounded-full bg-gray-200 w-6 h-6 flex items-center justify-center text-xs mr-2">
                                      {reply.user.initials}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="bg-gray-100 rounded-lg p-2">
                                      <div className="font-semibold text-xs">{reply.user.name}</div>
                                      <p className="text-xs">{reply.text}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{reply.time}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                  PE
                </div>
                <input
                  type="text"
                  className="flex-1 border rounded-lg p-2 text-sm"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg text-sm"
                  onClick={handleAddComment}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}