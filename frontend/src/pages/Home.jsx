import { useState, useRef } from "react";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
  SquarePen,
  NotebookPen,
  ThumbsUp,
  MessageCircle,
  Share,
  Globe,
  CircleHelp,
  X,
  MapPin,
  LockKeyhole,
  Users,
  Copy,
  Image as ImageIcon,
  Menu,
  ChevronsLeft,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import Tooltip from "@mui/material/Tooltip";
import { Button } from "../components/Button";
import Trix from "trix";
import "trix/dist/trix.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Link } from "react-router-dom";

export default function SocialNetworkFeed() {
  const [postContent, setPostContent] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("update");
  const [articleImages, setArticleImages] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fileInputRef = useRef(null);
  const trixEditorRef = useRef(null);
  const [postVisibility, setPostVisibility] = useState("public");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);

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

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: "/api/placeholder/40/40",
        initials: "JD",
      },
      time: "2 hours ago",
      content: "Check out these photos from our last trip! So many great memories.",
      photos: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      ],
      likes: 0,
      comments: [
        {
          id: 1,
          user: {
            name: "Jane Smith",
            avatar: "/api/placeholder/40/40",
            initials: "JS",
          },
          text: "Looks amazing! Where was this taken?",
          time: "1 hour ago",
          replies: [
            {
              id: 1,
              user: {
                name: "John Doe",
                avatar: "/api/placeholder/40/40",
                initials: "JD",
              },
              text: "This was in Bali! The beaches are incredible.",
              time: "45 minutes ago",
            },
          ],
        },
        {
          id: 2,
          user: {
            name: "Alex Johnson",
            avatar: "/api/placeholder/40/40",
            initials: "AJ",
          },
          text: "Beautiful photos! 😍",
          time: "30 minutes ago",
          replies: [],
        },
      ],
    },
    {
      id: 2,
      user: {
        name: "Jane Smith",
        avatar: "/api/placeholder/40/40",
        initials: "JS",
      },
      time: "5 hours ago",
      content: "Beautiful sunset at the beach today!",
      photos: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      ],
      likes: 0,
      comments: [
        {
          id: 1,
          user: {
            name: "Mike Brown",
            avatar: "/api/placeholder/40/40",
            initials: "MB",
          },
          text: "Stunning view! What camera did you use?",
          time: "4 hours ago",
          replies: [],
        },
      ],
    },
    {
      id: 3,
      user: {
        name: "Alex Johnson",
        avatar: "/api/placeholder/40/40",
        initials: "AJ",
      },
      time: "1 day ago",
      content: "Working on some new projects with the team!",
      photos: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      ],
      likes: 0,
      comments: [],
    },
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
    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedPost.photos.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === selectedPost.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setArticleImages([...articleImages, ...imageUrls]);
  };

  const removeImage = (index) => {
    const newImages = [...articleImages];
    newImages.splice(index, 1);
    setArticleImages(newImages);
  };

  const handlePostSubmit = () => {
    if (activeTab === "update") {
      if (!postContent.trim() && articleImages.length === 0) return;
    } else {
      if (!articleContent.trim() && articleImages.length === 0) return;
    }
    
    const newPost = {
      id: posts.length + 1,
      user: {
        name: "PPLG EVOTEKS",
        avatar: "",
        initials: "PE",
      },
      time: "Just now",
      content: activeTab === "update" ? postContent : articleContent,
      photos: [...articleImages],
      likes: 0,
      comments: [],
      visibility: postVisibility,
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
    setArticleContent("");
    setArticleImages([]);
    setActiveTab("update");
    
    if (trixEditorRef.current) {
      trixEditorRef.current.editor.loadHTML("");
    }
  };

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
    setCommentText("");
    setReplyingTo(null);
    setReplyText("");
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const updatedPosts = posts.map((post) => {
      if (post.id === currentPostId) {
        const newComment = {
          id: Date.now(),
          user: {
            name: "PPLG EVOTEKS",
            avatar: "",
            initials: "PE",
          },
          text: commentText,
          time: "Just now",
          replies: [],
        };

        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setCommentText("");
  };

  const handleReply = (commentId, replyToUser = null) => {
    if (!replyText.trim()) return;
  
    const updatedPosts = posts.map((post) => {
      if (post.id === currentPostId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            const newReply = {
              id: Date.now(),
              user: {
                name: "PPLG EVOTEKS",
                avatar: "",
                initials: "PE",
              },
              text: replyText,
              time: "Just now",
              replyTo: replyToUser, // Simpan informasi user yang dibalas
            };
  
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
          return comment;
        });
  
        return {
          ...post,
          comments: updatedComments,
        };
      }
      return post;
    });
  
    setPosts(updatedPosts);
    setReplyText("");
    setReplyingTo(null);
  };

  const handleLikePost = (postId) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes + 1,
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
            className="w-full h-48 md:h-64 lg:h-96 object-cover cursor-pointer"
            alt="Post"
            onClick={() => openImageModal({ photos }, 0)}
          />
        </div>
      );
    } else if (photos.length === 2) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo}
                  className="w-full h-full object-cover cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ photos }, index)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (photos.length === 3) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            <div className="relative aspect-square row-span-2">
              <img
                src={photos[0]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 1"
                onClick={() => openImageModal({ photos }, 0)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={photos[1]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 2"
                onClick={() => openImageModal({ photos }, 1)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={photos[2]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 3"
                onClick={() => openImageModal({ photos }, 2)}
              />
            </div>
          </div>
        </div>
      );
    } else if (photos.length >= 4) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {photos.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo}
                  className="w-full h-full object-cover cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ photos }, index)}
                />
                {index === 3 && photos.length > 4 && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                    onClick={() => openImageModal({ photos }, 3)}
                  >
                    +{photos.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const currentPost = posts.find((post) => post.id === currentPostId);
  const shareUrl = "https://example.com";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link disalin!");
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleTrixChange = (e) => {
    setArticleContent(e.target.innerHTML);
  };

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

      {/* Left Sidebar - Profile Section */}
      <div
        className={`${
          showMobileMenu ? "block" : "hidden"
        } md:block w-full md:w-1/4 lg:w-1/4 mb-4 md:mb-0 md:pr-2 lg:pr-4`}
      >
        <div className="bg-white rounded-lg shadow mb-4 p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-gray-200 w-16 md:w-20 h-16 md:h-20 flex items-center justify-center text-2xl md:text-3xl text-gray-600">
              PE
            </div>
          </div>

          <h2 className="text-lg font-bold mb-4">PPLG EVOTEKS</h2>

          <div className="flex border-t pt-3">
            <div className="flex-1 text-center border-r">
              <div className="text-base font-semibold">358</div>
              <div className="text-gray-500 text-xs">Connections</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-base font-semibold">85</div>
              <div className="text-gray-500 text-xs">Views</div>
            </div>
          </div>

          <button className="mt-3 text-blue-500 text-sm font-medium">
            View my profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="font-medium text-sm mb-3">Profile Views</h3>

          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-xl font-semibold text-cyan-400">08</div>
              <div className="text-gray-500 text-xs">last 7 days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-500">+ 43%</div>
              <div className="text-gray-500 text-xs">Since last week</div>
            </div>
          </div>

          <div className="h-16 md:h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      

      {/* Main Content - Feed */}
      <div
        className={`w-full ${
          showMobileMenu ? "hidden" : "block"
        } md:block md:w-full lg:w-1/2 px-0 md:px-1`}
      >
        {/* Post creation box */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <div className="flex items-center mb-3">
            <div className="tabs w-full flex border-b">
              <button
                className={`tab flex-1 py-1 text-center flex items-center justify-center text-xs md:text-sm ${
                  activeTab === "update"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("update")}
              >
                <SquarePen size={14} className="mr-1" />
                <span className="hidden sm:inline">Share an update</span>
                <span className="sm:hidden">Update</span>
              </button>
              <button
                className={`tab flex-1 py-1 text-center flex items-center justify-center text-xs md:text-sm ${
                  activeTab === "article"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("article")}
              >
                <NotebookPen size={14} className="mr-1" />
                <span className="hidden sm:inline">Write an article</span>
                <span className="sm:hidden">Article</span>
              </button>
            </div>
          </div>

          {activeTab === "update" ? (
            <>
              <div className="border-b mb-3">
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

                {/* Icon buttons */}
                <div className="flex mb-3 ml-2 sm:ml-10">
                  <div className="flex space-x-1">
                    <Tooltip title="Public">
                      <span 
                        className={`${postVisibility === "public" ? "bg-blue-600" : "bg-gray-600"} hover:bg-blue-500 rounded-full p-1 text-white cursor-pointer`}
                        onClick={() => handleVisibilityChange("public")}
                      >
                        <Globe size={12} className="sm:mr-0" />
                      </span>
                    </Tooltip>
                    <Tooltip title="Private">
                      <span 
                        className={`${postVisibility === "private" ? "bg-blue-600" : "bg-gray-600"} hover:bg-gray-500 rounded-full p-1 text-white cursor-pointer`}
                        onClick={() => handleVisibilityChange("private")}
                      >
                        <LockKeyhole size={12} className="sm:mr-0" />
                      </span>
                    </Tooltip>
                    <Tooltip title="Only Connection">
                      <span 
                        className={`${postVisibility === "connection" ? "bg-blue-600" : "bg-gray-600"} hover:bg-green-500 rounded-full p-1 text-white cursor-pointer`}
                        onClick={() => handleVisibilityChange("connection")}
                      >
                        <Users size={12} className="sm:mr-0" />
                      </span>
                    </Tooltip>
                  </div>
                  <Tooltip
                    title={
                      <>
                        Menentukan siapa yang bisa melihat postingan Anda:<br />
                        • Publik – Semua orang<br />
                        • Private – Hanya Anda<br />
                        • Only Connection – Hanya koneksi Anda
                      </>
                    }
                  >
                    <button className="ml-2 text-gray-500">
                      <CircleHelp size={12} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Image preview for update */}
              {articleImages.length > 0 && (
                <div className="mb-3">
                  {renderPhotoGrid(articleImages)}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  className="flex items-center text-blue-500 text-xs md:text-sm"
                  onClick={() => fileInputRef.current.click()}
                >
                  <ImageIcon size={16} className="mr-1" />
                  Add photos
                </button>
                <Button
                  className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm"
                  onClick={handlePostSubmit}
                >
                  Share an update
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <div className="border rounded-md overflow-hidden text-black ck-editor-mode">
                  <CKEditor
                    editor={ClassicEditor}
                    data={articleContent}
                    onChange={(event, editor) => setArticleContent(editor.getData())}
                    config={{
                      toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                    }}
                  />
                </div>
              </div>

              <div className="mb-3">
                {articleImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                    {articleImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          className="w-full h-16 md:h-24 object-cover rounded border"
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
                  className="flex items-center text-blue-500 text-xs md:text-sm"
                  onClick={() => fileInputRef.current.click()}
                >
                  <ImageIcon size={16} className="mr-1" />
                  Add photos
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  <Tooltip title="Public">
                    <span 
                      className={`${postVisibility === "public" ? "bg-blue-600" : "bg-gray-600"} hover:bg-blue-500 rounded-full p-1 text-white cursor-pointer`}
                      onClick={() => handleVisibilityChange("public")}
                    >
                      <Globe size={12} className="sm:mr-0" />
                    </span>
                  </Tooltip>
                  <Tooltip title="Private">
                    <span 
                      className={`${postVisibility === "private" ? "bg-blue-600" : "bg-gray-600"} hover:bg-gray-500 rounded-full p-1 text-white cursor-pointer`}
                      onClick={() => handleVisibilityChange("private")}
                    >
                      <LockKeyhole size={12} className="sm:mr-0" />
                    </span>
                  </Tooltip>
                  <Tooltip title="Only Connection">
                    <span 
                      className={`${postVisibility === "connection" ? "bg-blue-600" : "bg-gray-600"} hover:bg-green-500 rounded-full p-1 text-white cursor-pointer`}
                      onClick={() => handleVisibilityChange("connection")}
                    >
                      <Users size={12} className="sm:mr-0" />
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        Menentukan siapa yang bisa melihat postingan Anda:<br />
                        • Publik – Semua orang<br />
                        • Private – Hanya Anda<br />
                        • Only Connection – Hanya koneksi Anda
                      </>
                    }
                  >
                    <button className="ml-2 text-gray-500">
                      <CircleHelp size={12} />
                    </button>
                  </Tooltip>
                </div>

                <Button
                  className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm"
                  onClick={handlePostSubmit}
                >
                  Publish
                </Button>
              </div>
            </>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Posts */}
        <div className="p-0">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow mb-4 border-b p-3"
            >
              <div className="border-b pb-3 flex items-center mb-3">
                {post.user.avatar ? (
                  <img
                    src={post.user.avatar}
                    className="rounded-full mr-2 w-8 md:w-10 h-8 md:h-10"
                    alt="User"
                  />
                ) : (
                  <div className="rounded-full bg-gray-200 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-xs md:text-sm mr-2">
                    {post.user.initials}
                  </div>
                )}
                <div>
                  <h6 className="font-bold mb-0 text-sm md:text-base">
                    {post.user.name}
                  </h6>
                  <small className="text-gray-500 text-xs">{post.time}</small>
                </div>
                <div className="ml-auto relative group">
                  <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-1">
                    {post.visibility === "public" && <Globe size={14} />}
                    {post.visibility === "private" && <LockKeyhole size={14} />}
                    {post.visibility === "connection" && <Users size={14} />}
                  </button>
                </div>
              </div>

              <div 
                className="mb-3 text-sm md:text-base ck-editor-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {post.photos &&
                post.photos.length > 0 &&
                renderPhotoGrid(post.photos)}

              <div className="flex flex-wrap justify-between border-t pt-3">
                <div className="flex flex-wrap gap-2 text-blue-500 mb-2 md:mb-0">
                  <button
                    className="bg-sky-100 hover:bg-sky-200 px-2 md:px-3 py-1 rounded text-xs md:text-sm flex items-center"
                    onClick={() => handleLikePost(post.id)}
                  >
                    <ThumbsUp size={12} className="mr-1" />
                    <span className="mr-1">Like</span> ({post.likes})
                  </button>
                  <button
                    className="bg-sky-100 hover:bg-sky-200 px-2 md:px-3 py-1 rounded text-xs md:text-sm flex items-center"
                    onClick={() => openCommentModal(post.id)}
                  >
                    <MessageCircle size={12} className="mr-1" />
                    <span className="mr-1">Comment</span> (
                    {post.comments.length})
                  </button>
                </div>
                <div className="relative inline-block">
                  <button
                    className="bg-sky-100 hover:bg-sky-200 px-2 md:px-3 py-1 rounded text-xs md:text-sm flex items-center text-blue-500"
                    onClick={() => setSharePostId(post.id)}
                  >
                    <Share size={12} className="mr-1" /> Share
                  </button>

                  {/* Share dropdown */}
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
      </div>

      {/* Right Sidebar */}
      <div
        className={`${
          showMobileMenu ? "block" : "hidden"
        } md:block w-full md:w-1/4 lg:w-1/4 mt-4 md:mt-0 md:pl-2 lg:pl-4`}
      >
        {/* People You Might Know */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <h3 className="font-medium text-sm mb-3">People you might know</h3>

          <div className="flex items-center mb-3">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-200 overflow-hidden mr-2">
              <img
                src="/api/placeholder/40/40"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-xs md:text-sm">
                Bintang Asydqi
              </div>
              <div className="text-gray-500 text-xs">Student at Alexander</div>
            </div>
            <div className="text-blue-500">
              <svg
                className="w-4 md:w-5 h-4 md:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Premium Banner */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <div className="mb-2">
            <img src="/" alt="Premium" className="w-full rounded" />
          </div>
          <h3 className="font-bold text-sm md:text-base text-yellow-500 text-center mb-1">
            EVOConnect Premium
          </h3>
          <p className="text-gray-600 text-xs text-center mb-3">
            Grow & nurture your network
          </p>
          <button 
            className="w-full border border-yellow-500 text-yellow-500 py-1 md:py-1.5 rounded-lg font-medium text-xs md:text-sm"
            onClick={openPremiumModal}
          >
            ACTIVATE
          </button>
        </div>

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
              <div className="relative">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold text-yellow-600">EVOConnect Premium</h3>
                  <button onClick={closePremiumModal} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold mb-2">Unlock Premium Features</h4>
                    <p className="text-gray-600 mb-4">Upgrade your account to access exclusive features:</p>
                    
                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Unlimited connections and messaging</span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Advanced analytics for your posts</span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Priority support 24/7</span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Custom profile badge</span>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h5 className="font-bold text-yellow-700 mb-2">Premium Plan</h5>
                      <p className="text-2xl font-bold text-yellow-600 mb-1">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                      <p className="text-sm text-gray-600">Billed annually or $12.99 month-to-month</p>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t flex justify-between">
                  <button 
                    onClick={closePremiumModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="font-medium text-sm mb-3">Jobs</h3>
          <div className="mb-4">
            <div className="bg-gray-100 p-3 md:p-4 rounded-lg">
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-xs md:text-sm">
                  Product Director
                </h3>
                <div className="bg-white rounded-full p-1 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center">
                  <img
                    src="/api/placeholder/24/24"
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-blue-500 text-xs md:text-sm">Spotify Inc.</p>
              <div className="flex items-center text-gray-600 text-xs">
                <MapPin size={12} className="mr-1" />
                <span>India, Punjab</span>
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex -space-x-1 md:-space-x-2">
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                </div>
                <span className="text-gray-600 text-xs ml-2">
                  18 connections
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              className="absolute top-2 md:top-4 right-2 md:right-4 text-white bg-black bg-opacity-50 rounded-full p-1 md:p-2 z-10"
              onClick={closeImageModal}
            >
              <X size={20} />
            </button>

            <div className="relative">
              <img
                src={selectedPost.photos[selectedImageIndex]}
                className="w-full max-h-[80vh] object-contain"
                alt={`Post ${selectedImageIndex + 1}`}
              />

              {selectedPost.photos.length > 1 && (
                <>
                  <button
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 md:p-2"
                    onClick={() => navigateImage("prev")}
                  >
                    <svg
                      className="w-4 md:w-6 h-4 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      ></path>
                    </svg>
                  </button>

                  <button
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 md:p-2"
                    onClick={() => navigateImage("next")}
                  >
                    <svg
                      className="w-4 md:w-6 h-4 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center">
              <div className="flex space-x-1 md:space-x-2">
                {selectedPost.photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                      selectedImageIndex === index ? "bg-white" : "bg-gray-500"
                    }`}
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
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
            <div className="p-3 md:p-4 border-b flex justify-between items-center">
              <h3 className="text-base md:text-lg font-semibold">Comments</h3>
              <button onClick={closeCommentModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-3 md:p-4 overflow-y-auto flex-1">
              {currentPost.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                currentPost.comments.map((comment) => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex items-start mb-2">
                      {comment.user.avatar ? (
                        <img
                          src={comment.user.avatar}
                          className="rounded-full mr-2 w-6 md:w-8 h-6 md:h-8"
                          alt="User"
                        />
                      ) : (
                        <div className="rounded-full bg-gray-200 w-6 md:w-8 h-6 md:h-8 flex items-center justify-center text-xs mr-2">
                          {comment.user.initials}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                          <div className="font-semibold text-xs md:text-sm">
                            {comment.user.name}
                          </div>
                          <p className="text-xs md:text-sm">{comment.text}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {comment.time}
                        </div>
                        <button
                          className="text-xs text-blue-500 mt-1"
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setReplyToUser(comment.user);
                          }}
                        >
                          Reply
                        </button>

                        {replyingTo === comment.id && (
                          <div className="mt-2 flex">
                            <input
                              type="text"
                              className="flex-1 border rounded-l-lg p-2 text-xs md:text-sm"
                              placeholder={`Reply to ${comment.user.name}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                              className="bg-blue-500 text-white px-2 md:px-3 rounded-r-lg text-xs md:text-sm"
                              onClick={() => handleReply(comment.id, comment.user)}
                            >
                              Post
                            </button>
                          </div>
                        )}

                        {comment.replies.length > 0 && (
                          <div className="mt-2 ml-4 md:ml-6 pl-2 md:pl-4 border-l-2 border-gray-200">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="mb-3">
                                <div className="flex items-start">
                                  {reply.user.avatar ? (
                                    <img
                                      src={reply.user.avatar}
                                      className="rounded-full mr-2 w-5 md:w-6 h-5 md:h-6"
                                      alt="User"
                                    />
                                  ) : (
                                    <div className="rounded-full bg-gray-200 w-5 md:w-6 h-5 md:h-6 flex items-center justify-center text-xxs md:text-xs mr-2">
                                      {reply.user.initials}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="bg-gray-100 rounded-lg p-1 md:p-2">
                                      <div className="font-semibold text-xxs md:text-xs items-center flex">
                                        {reply.user.name}
                                        {reply.replyTo && (
                                          <span className="text-gray-500 ml-1 items-center flex">
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              width="10" 
                                              height="10" 
                                              fill="currentColor" 
                                              className="mr-1" 
                                              viewBox="0 0 16 16"
                                            >
                                              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                                            </svg> 
                                            {reply.replyTo.name}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xxs md:text-xs">
                                        {reply.text}
                                      </p>
                                    </div>
                                    <div className="text-xxs md:text-xs text-gray-500 mt-1">
                                      {reply.time}
                                    </div>
                                    <button
                                      className="text-xxs text-blue-500 mt-1 md:text-xs"
                                      onClick={() => {
                                        setReplyingTo(reply.id);
                                        setReplyToUser(reply.user);
                                      }}
                                    >
                                      Reply
                                    </button>

                                    {replyingTo === reply.id && (
                                      <div className="mt-2 flex ml-4">
                                        <input
                                          type="text"
                                          className="flex-1 border rounded-l-lg p-2 text-xxs md:text-xs"
                                          placeholder={`Reply to ${reply.user.name}...`}
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <button
                                          className="bg-blue-500 text-white px-2 md:px-3 rounded-r-lg text-xxs md:text-xs"
                                          onClick={() => handleReply(comment.id, replyToUser)}
                                        >
                                          Post
                                        </button>
                                      </div>
                                    )}
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

            <div className="p-3 md:p-4 border-t">
              <div className="flex items-center mb-2">
                <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-xxs md:text-xs mr-2 md:mr-3">
                  PE
                </div>
                <input
                  type="text"
                  className="flex-1 border rounded-lg p-2 text-xs md:text-sm"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 text-white px-3 md:px-4 py-1 rounded-lg text-xs md:text-sm"
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