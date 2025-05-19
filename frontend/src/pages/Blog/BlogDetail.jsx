import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Case from "../../components/Case";
import { MoreVertical, Pencil, Reply, Trash2, ChevronUp, ChevronDown, Flag } from "lucide-react";
import { categories } from "../../components/Blog/CategoryStep";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import RandomPosts from "../../components/Blog/RandomPosts";
import EditBlog from "../../components/Blog/EditBlog";
import deleteBlog from "../../components/Blog/DeleteBlog";
import Toast from "../../components/Blog/Toast";
import { useLocation } from "react-router-dom";
import BlogMenu from "../../components/Blog/BlogMenu";
import ReportModal from "../../components/Blog/ReportModal";
import CommentSection from "../../components/Blog/CommentSection";
import DeleteComment from "../../components/Blog/DeleteComment";
import CommentDropdown from "../../components/Blog/CommentDropdown";


const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
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
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const saveCommentsToLocalStorage = (slug, comments) => {
    try {
      const allComments = JSON.parse(localStorage.getItem('blogComments')) || {};
      allComments[slug] = comments;
      localStorage.setItem('blogComments', JSON.stringify(allComments));
    } catch (error) {
      console.error("Error saving comments to localStorage:", error);
    }
  };

  const getCommentsFromLocalStorage = (slug) => {
    try {
      const allComments = JSON.parse(localStorage.getItem('blogComments')) || {};
      return allComments[slug] || [];
    } catch (error) {
      console.error("Error reading comments from localStorage:", error);
      return [];
    }
  };

  const syncCommentsWithLocalStorage = async () => {
    try {
      setLoadingComments(true);

      const cachedComments = getCommentsFromLocalStorage(slug);
      if (cachedComments.length > 0) {
        setComments(cachedComments);
      }

      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(
          `http://localhost:3000/api/blog-comments/${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const apiComments = Array.isArray(response.data) ? response.data : [];

        const mergedComments = mergeComments(cachedComments, apiComments);
        const commentsWithReplies = await Promise.all(
          mergedComments.map(async (comment) => {
            let replies = comment.replies || [];

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

        setComments(commentsWithReplies);
        saveCommentsToLocalStorage(slug, commentsWithReplies);
      }
    } catch (error) {
      console.error("Error syncing comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const mergeComments = (localComments, apiComments) => {
    const merged = [...apiComments];

    localComments.forEach(localComment => {
      if (!localComment.id || typeof localComment.id !== 'number') {
        merged.push(localComment);
      } else {
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
      saveCommentsToLocalStorage(slug, updatedComments);
      toast.success("Reply posted successfully!");
    } catch (error) {
      console.error("Reply submission error:", error);
      toast.error("Failed to post reply.");
    }
  };

  const CommentDropdown = () => {
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);

    const handleDeleteComment = (commentId) => {
      const updatedComments = comments.filter((comment) => comment.id !== commentId);
      setComments(updatedComments);
    };

    const handleReply = (commentId) => {
      setReplyingTo(commentId);
    };


    return (
      <div>
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div>{comment.text}</div>
            <CommentDropdown
              commentId={comment.id}
              onDelete={handleDeleteComment}
              onReply={handleReply}
            />
          </div>
        ))}
      </div>
    );
  };

  const cleanHTML = (html) => {
    return html
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  };

  useEffect(() => {
    if (!slug) {
      showToast("Undefined Blog", "error");
      navigate("/blog");
      return;
    }

    const fetchBlogDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/blogs/slug/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setArticle(response.data.data);
      } catch (error) {
        console.error("Failed to load blog:", error);
        showToast("Undefined Blog", "error");
        navigate("/blog");
      }
    };

    fetchBlogDetail();
  }, [slug, navigate]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/blogs/${article.slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Blog has been deleted.");
      navigate("/blog");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      showToast("Failed to delete blog.", "error");
    }
    setShowDeleteModal(false);
  };

  const handleReportClick = (userId, targetType, targetId) => {
    setReportTarget({ userId, targetType, targetId });
    setShowReportModal(true);
  };

  const location = useLocation();
  useEffect(() => {
    if (location.state?.showPublishedToast) {
      showToast("Blog has been published successfully.", "success");
    }
  }, [location.state]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReportSubmit = async () => {
    if (!reportTarget || !selectedReason) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to report.", "error");
      return;
    }
    const reason = selectedReason === "Other" ? customReason : selectedReason;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/reports/${reportTarget.userId}/${reportTarget.targetType}/${reportTarget.targetId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Report successfully submitted");
    } catch (err) {
      console.error("Failed to submit report:", err.response.data.error);
      showToast(err.response.data.error, "error");
    }


    setShowReportModal(false);
    setSelectedReason("");
    setCustomReason("");
    setReportTarget(null);
  };

  if (!article) {
    return <div className="text-center py-10">Loading blog detail...</div>;
  }

  return (
    <Case>
      <div className="relative py-10 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6 relative">
              <div className="bg-white shadow-md rounded-lg relative">
                <div className="relative h-[400px]">
                  {article.images?.[0] && (
                    <img
                      src={article.images[0]}
                      alt="Blog"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <BlogMenu
                      onEdit={() => setShowEdit(true)}
                      onDelete={openDeleteModal}
                      onReport={() => handleReportClick(article.user?.id, "blog", article.id)}
                    />
                  </div>

                  <h2 className="text-2xl font-semibold mt-3">{article.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">{article.date}</p>
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              </div>

              {/* Comment Form */}
              <CommentSection slug={slug} />
            </div>

            <div className="space-y-6">
              <RandomPosts excludeSlug={slug} />
            </div>
          </div>
        </div>

        {/* bagian aku */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white max-w-3xl w-full p-6 rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Edit Blog</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) =>
                      setArticle({ ...article, title: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={article.category}
                    onChange={(e) =>
                      setArticle({ ...article, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border bg-white"
                  >
                    <option value="" disabled>
                      Pilih kategori
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const token = localStorage.getItem("token");
                      const formData = new FormData();
                      formData.append("photo", file);

                      try {
                        const res = await fetch(
                          `http://localhost:3000/api/blogs/${article.id}/upload-photo`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                          }
                        );

                        const result = await res.json();
                        setArticle({ ...article, images: [result.imageUrl] });
                        setToast({ message: "Gambar berhasil diunggah!", type: "success" });
                      } catch {
                        setToast({ message: "Gagal upload gambar.", type: "error" });
                      }
                    }}
                    className="w-full px-3 py-2 rounded border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    rows={6}
                    value={cleanHTML(article.content)}
                    onChange={(e) =>
                      setArticle({
                        ...article,
                        content: cleanHTML(e.target.value),
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
              <div className="text-right mt-6">
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                      await axios.put(
                        `http://localhost:3000/api/blogs/${article.id}`,
                        article,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      setShowEdit(false);
                      setToast({ message: "Blog berhasil diperbarui!", type: "success" });
                    } catch {
                      setToast({ message: "Gagal update blog.", type: "error" });
                    }
                  }}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        <ReportModal
          show={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReason("");
            setCustomReason("");
          }}
          onSubmit={handleReportSubmit}
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          customReason={customReason}
          setCustomReason={setCustomReason}
        />
      </div>
    </Case>
  );
}
export default BlogDetail;