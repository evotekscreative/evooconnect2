// BlogDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Case from "../../components/Case";
import { MoreVertical, Pencil, Reply, Trash2, ChevronUp, ChevronDown, } from "lucide-react";
import { categories } from "../../components/Blog/CategoryStep";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [article, setArticle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [randomPosts, setRandomPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedComments, setExpandedComments] = useState({});

  // Helper functions for localStorage comments
  const saveCommentsToLocalStorage = (blogId, comments) => {
    try {
      const allComments = JSON.parse(localStorage.getItem('blogComments')) || {};
      allComments[blogId] = comments;
      localStorage.setItem('blogComments', JSON.stringify(allComments));
    } catch (error) {
      console.error("Error saving comments to localStorage:", error);
    }
  };

  const getCommentsFromLocalStorage = (blogId) => {
    try {
      const allComments = JSON.parse(localStorage.getItem('blogComments')) || {};
      return allComments[blogId] || [];
    } catch (error) {
      console.error("Error reading comments from localStorage:", error);
      return [];
    }
  };

  // Enhanced comment sync function
  const syncCommentsWithLocalStorage = async () => {
    try {
      setLoadingComments(true);

      // Always load from localStorage first for instant display
      const cachedComments = getCommentsFromLocalStorage(id);
      if (cachedComments.length > 0) {
        setComments(cachedComments);
      }

      // Then try to sync with API
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(
          `http://localhost:3000/api/blog-comments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const apiComments = Array.isArray(response.data) ? response.data : [];

        // Merge API comments with local comments
        const mergedComments = mergeComments(cachedComments, apiComments);

        // Fetch replies for each comment
        const commentsWithReplies = await Promise.all(
          mergedComments.map(async (comment) => {
            let replies = comment.replies || [];

            // Try to get replies from API if we have a comment ID from API
            if (comment.id && typeof comment.id === 'number') {
              try {
                const apiReplies = await axios.get(
                  `http://localhost:3000/api/blog/comments/${comment.id}/replies`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                replies = apiReplies.data || replies;
              } catch (error) {
                console.error("Error fetching replies:", error);
              }
            }

            return {
              ...comment,
              replies: replies || []
            };
          })
        );

        // Update state and localStorage with merged data
        setComments(commentsWithReplies);
        saveCommentsToLocalStorage(id, commentsWithReplies);
      }
    } catch (error) {
      console.error("Error syncing comments:", error);
      // If API fails, keep using the cached comments
    } finally {
      setLoadingComments(false);
    }
  };

  // Merge function to combine API and local comments
  const mergeComments = (localComments, apiComments) => {
    const merged = [...apiComments];

    // Add local comments that don't exist in API
    localComments.forEach(localComment => {
      if (!localComment.id || typeof localComment.id !== 'number') {
        // This is a local-only comment (has temporary ID)
        merged.push(localComment);
      } else {
        // Check if this comment exists in API
        const existsInApi = apiComments.some(apiComment => apiComment.id === localComment.id);
        if (!existsInApi) {
          merged.push(localComment);
        }
      }
    });

    return merged;
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Comment dropdown component
  const CommentDropdown = ({ commentId, onDelete, onReply }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = () => {
      toast.info(
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '10px' }}>
          <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>
            Are you sure you want to delete this comment?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                onDelete(commentId);
                toast.dismiss();
                setIsOpen(false);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e11d48',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e5e7eb',
                color: '#111827',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: false,
          position: 'top-center',
        }
      );
      setIsOpen(false);
    };

    const handleReply = () => {
      onReply(commentId);
      setIsOpen(false);
    };

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <button              
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"  
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleReply}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  // Reply form component
  const ReplyForm = ({ commentId, onCancel, onSubmit }) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!content.trim()) {
        toast.warning("Reply cannot be empty!");
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmit(commentId, content);
        setContent("");
        onCancel();
      } catch (error) {
        console.error("Error submitting reply:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mt-3 ml-12 pl-4 border-l-2 border-gray-200">
        <textarea
          rows="3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
          placeholder="Write your reply..."
          disabled={isSubmitting}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-1 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const handleSubmitReply = async (commentId, content) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("You need to be logged in to post comments.");
        navigate("/login");
        return;
      }

      let newReply;

      try {
        // Try to submit to API first
        const response = await axios.post(
          `http://localhost:3000/api/blog/comments/${commentId}/replies`,
          { content },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        newReply = response.data?.data || response.data;
      } catch (apiError) {
        console.error("API reply submission failed, saving locally:", apiError);
        newReply = {
          id: Date.now(),
          content,
          user: {
            name: "You",
            avatar: "/img/profile.jpg"
          },
          createdAt: new Date().toISOString(),
          isLocal: true
        };
      }

      if (!newReply) {
        throw new Error("Invalid reply data received.");
      }

      const formattedReply = {
        id: newReply.id || Date.now(),
        content: newReply.content || content,
        user: newReply.user || {
          name: "You",
          avatar: "/img/profile.jpg"
        },
        createdAt: newReply.createdAt || new Date().toISOString(),
        isLocal: newReply.isLocal || false
      };

      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), formattedReply]
          };
        }
        return comment;
      });

      setComments(updatedComments);
      saveCommentsToLocalStorage(id, updatedComments);
      toast.success("Reply posted successfully!");
    } catch (error) {
      console.error("Reply submission error:", error);
      toast.error("Failed to post reply.");
    }
  };

  useEffect(() => {
    const loadBlogData = async () => {
      const cachedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
      const foundBlog = cachedBlogs.find((blog) => blog.id === id);

      if (foundBlog) {
        setArticle(foundBlog);

        // Load random posts
        const otherBlogs = cachedBlogs.filter((b) => b.id !== id);
        const shuffled = otherBlogs.sort(() => 0.5 - Math.random());
        setRandomPosts(shuffled.slice(0, 3));

        // Load and sync comments
        await syncCommentsWithLocalStorage();
      } else {
        toast.error("Blog not found!");
        navigate("/blog");
      }
    };

    loadBlogData();
  }, [id, navigate]);

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    if (!token){
      console.log("gada token woi")
    }
    try {
      await axios.delete(
        `http://localhost:3000/api/blog/comments/${commentId}`,
        {
          Authorization: `Bearer ${token}`
        }
      );
    } catch (apiError) {
      console.error("API delete failed, deleting locally:", apiError);
    }
    
    try {


      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
      saveCommentsToLocalStorage(id, updatedComments);
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment.");
    }
  };

  const handlePrev = () => {
    if (article?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? article.images.length - 1 : prev - 1
      );
    }
  };

  const handleNext = () => {
    if (article?.images) {
      setCurrentImageIndex((prev) =>
        prev === article.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/blogs/${article.id}`;
      await axios.delete(apiUrl).catch(() => { });

      const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
      const filtered = blogs.filter((b) => b.id !== article.id);
      localStorage.setItem("blogs", JSON.stringify(filtered));

      // Also remove comments for this blog
      const allComments = JSON.parse(localStorage.getItem('blogComments')) || {};
      delete allComments[id];
      localStorage.setItem('blogComments', JSON.stringify(allComments));

      toast.success("Blog has been deleted.");
      navigate("/blog");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Error: Failed to delete blog.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.warning("Comments cannot be empty!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("You need to be logged in to post comments.");
      navigate("/login");
      return;
    }

    try {
      setSubmittingComment(true);
      let newCommentData;

      try {
        // Try to submit to API first
        const response = await axios.post(
          `http://localhost:3000/api/blog-comments/${id}`,
          { content: newComment },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        newCommentData = response.data?.data || response.data;
      } catch (apiError) {
        console.error("API comment submission failed, saving locally:", apiError);
        // If API fails, create a local comment
        newCommentData = {
          id: Date.now(), // Temporary ID
          content: newComment,
          user: {
            name: "You",
            avatar: "/img/profile.jpg"
          },
          createdAt: new Date().toISOString(),
          replies: [],
          isLocal: true // Mark as local for future sync
        };
      }

      const formattedComment = {
        id: newCommentData.id || Date.now(),
        content: newCommentData.content || newComment,
        user: newCommentData.user || {
          name: "You",
          avatar: "/img/profile.jpg"
        },
        createdAt: newCommentData.createdAt || new Date().toISOString(),
        replies: [],
        isLocal: newCommentData.isLocal || false
      };

      // Update state and localStorage
      const updatedComments = [...comments, formattedComment];
      setComments(updatedComments);
      saveCommentsToLocalStorage(id, updatedComments);
      setNewComment("");

      toast.success("Comment posted successfully!");
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderComment = (comment, isReply = false) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments[comment.id] !== false;

    return (
      <div key={comment.id} className={`border-b pb-4 ${isReply ? 'ml-12 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="flex items-start gap-4">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={comment.user?.avatar || "/img/profile.jpg"}
            alt={comment.user?.name || "User"}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h5 className="font-semibold text-sm">
                {comment.user?.name || "Anonymous"}
                {comment.isLocal && <span className="text-xs text-gray-500 ml-1">(local)</span>}
                <span className="text-gray-400 text-xs ml-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </h5>
              {!isReply && localStorage.getItem("token") && (
                <CommentDropdown
                  commentId={comment.id}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onReply={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyContent("");
                  }}
                />
              )}
            </div>
            <p className="text-gray-700 text-sm mt-1">
              {comment.content}
            </p>

            {!isReply && (
              <div className="flex items-center mt-2 space-x-4">
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyContent("");
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </button>

                {hasReplies && (
                  <button
                    onClick={() => toggleCommentExpansion(comment.id)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Hide replies
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        Show replies ({comment.replies.length})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reply form */}
        {!isReply && replyingTo === comment.id && (
          <ReplyForm
            commentId={comment.id}
            onCancel={() => setReplyingTo(null)}
            onSubmit={handleSubmitReply}
          />
        )}

        {/* Replies */}
        {hasReplies && isExpanded && !isReply && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (!article) {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center py-20 text-xl text-gray-700">
          <p className="mb-6">Blog not found</p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </div>
      </Case>
    );
  }

  return (
    <Case>
      <div className="relative py-10 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Article Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white shadow-md rounded-lg overflow-hidden relative">
                {/* Image carousel */}
                <div className="relative h-[400px]">
                  {article?.images?.[currentImageIndex] && (
                    <img
                      className="w-full h-full object-cover"
                      src={article.images[currentImageIndex]?.base64 || article.images[currentImageIndex]}
                      alt="Blog"
                    />
                  )}
                  {article?.images?.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow hover:bg-white"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow hover:bg-white"
                      >
                        &gt;
                      </button>
                    </>
                  )}
                </div>

                <div className="p-6">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <h2 className="text-2xl font-semibold mt-3">{article.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">{article.date}</p>
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold">
                  {loadingComments ? "Loading..." : `${comments.length} Comments`}
                </h3>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {loadingComments ? "Loading..." : "No comments yet. Be the first to comment!"}
                    </p>
                  )}
                </div>
              </div>

              {/* Comment Form */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
                <form onSubmit={handleCommentSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="5"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
                      disabled={submittingComment}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2 rounded transition"
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Random Posts */}
            <div className="space-y-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h5 className="text-lg font-semibold mb-4">Random Post</h5>
                <div className="space-y-3">
                  {randomPosts.map((post) => (
                    <div key={post.id}>
                      <a
                        href={`/detail-blog/${post.id}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {post.title}
                      </a>
                      <p className="text-gray-500 text-sm">{post.date}</p>
                      <hr />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          className="fixed bottom-24 right-6 bg-red-500 hover:bg-red-400 text-white p-3 rounded-full shadow-lg transition"
          onClick={handleDelete}
        >
          <Trash2 className="w-5 h-5" />
        </button>

        {/* Edit Button */}
        <button
          className="fixed bottom-6 right-6 bg-sky-500 hover:bg-blue-400 text-white p-3 rounded-full shadow-lg transition"
          onClick={() => setShowEdit(true)}
        >
          <Pencil className="w-5 h-5" />
        </button>

        {/* Edit Popup */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white max-w-3xl w-full p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setShowEdit(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Blog</h2>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={article.category}
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setArticle({ ...article, images: [{ base64: reader.result }] });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                    Content
                  </label>
                  <textarea
                    rows={6}
                    value={article.content}
                    onChange={(e) => {
                      const cleanedContent = e.target.value.replace(/<\/?p>/g, "");
                      setArticle({ ...article, content: cleanedContent });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
                  />
                </div>
              </div>
              <div className="text-right mt-6">
                <button
                  onClick={() => {
                    const confirmSave = window.confirm("Do you want to save changes?");
                    if (!confirmSave) return;
                    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
                    const updated = blogs.map((b) => (b.id === article.id ? article : b));
                    localStorage.setItem("blogs", JSON.stringify(updated));
                    setShowEdit(false);
                    toast.success("Blog has been updated!");
                  }}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Case>
  );
};

export default BlogDetail;