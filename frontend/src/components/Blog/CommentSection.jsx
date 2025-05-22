import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MoreVertical, Pencil, Trash2, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommentSection = ({ slug, blogId }) => {
          const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const navigate = useNavigate();
  const commentsEndRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editReplyContent, setEditReplyContent] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
  }, [blogId]);

  // Fungsi untuk menampilkan toast di bagian atas kanan
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchComments = async () => {
    if (!blogId) return;

    setLoadingComments(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingComments(false);
      return;
    }

    try {
      // Ambil komentar utama
      const res = await axios.get(
        `${apiUrl}/api/blog-comments/${blogId}?limit=100000&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Comments response:", res.data);

      let apiComments = [];
      if (res.data && res.data.data && res.data.data.comments) {
        apiComments = res.data.data.comments;
      } else if (Array.isArray(res.data)) {
        apiComments = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        apiComments = res.data.data;
      }

      apiComments = apiComments.map(comment => ({
        ...comment,
        replies: comment.replies || []
      }));

      const commentsWithReplies = await Promise.all(
        apiComments.map(async (comment) => {
          if (comment.id) {
            try {
              const repliesRes = await axios.get(
                `${apiUrl}/api/blog/comments/${comment.id}/replies`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              console.log(`Replies for comment ${comment.id}:`, repliesRes.data);

              let replies = [];
              if (repliesRes.data && repliesRes.data.data) {
                replies = repliesRes.data.data;
              } else if (Array.isArray(repliesRes.data)) {
                replies = repliesRes.data;
              }

              return {
                ...comment,
                replies: Array.isArray(replies) ? replies : []
              };
            } catch (error) {
              console.error(`Error fetching replies for comment ${comment.id}:`, error);
              return comment;
            }
          }
          return comment;
        })
      );

      console.log("Comments with replies:", commentsWithReplies);
      setComments(commentsWithReplies);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    }

    setLoadingComments(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !blogId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You need to be logged in.", "warning");
      navigate("/login");
      return;
    }

    setSubmittingComment(true);

    try {
      const res = await axios.post(
        `${apiUrl}/api/blog-comments/${blogId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const created = res.data?.data || res.data;

      setComments(prev => [created, ...prev]);
      setNewComment("");
      showToast("Comment submitted successfully!");
      scrollToBottom();
    } catch (error) {
      console.error("Error submitting comment:", error);
      showToast("Failed to submit comment.", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleEditReply = (commentId, replyId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply) {
        setEditingReplyId(replyId);
        setEditReplyContent(reply.content);
      }
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim() || !blogId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `${apiUrl}/api/blog/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update komentar di state
      const updated = comments.map(c =>
        c.id === commentId ? { ...c, content: editContent } : c
      );

      setComments(updated);
      setEditingCommentId(null);
      setEditContent("");
      showToast("Comment updated successfully!");
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast("Failed to update comment.", "error");
    }
  };

  const handleUpdateReply = async (commentId, replyId) => {
    if (!editReplyContent.trim() || !blogId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `${apiUrl}/api/blog/comments/${replyId}`,
        { content: editReplyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update balasan di state
      const updated = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === replyId ? { ...reply, content: editReplyContent } : reply
            )
          };
        }
        return comment;
      });

      setComments(updated);
      setEditingReplyId(null);
      setEditReplyContent("");
      showToast("Reply updated successfully!");
    } catch (error) {
      console.error("Error updating reply:", error);
      showToast("Failed to update reply.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditingReplyId(null);
    setEditReplyContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const confirm = window.confirm("Are you sure you want to delete this comment?");
    if (!confirm || !blogId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${apiUrl}/api/blog/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Hapus komentar dari state
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      showToast("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Failed to delete comment.", "error");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const confirm = window.confirm("Are you sure you want to delete this reply?");
    if (!confirm || !blogId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${apiUrl}/api/blog/comments/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Hapus balasan dari state
      const updated = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== replyId)
          };
        }
        return comment;
      });

      setComments(updated);
      showToast("Reply deleted successfully!");
    } catch (error) {
      console.error("Error deleting reply:", error);
      showToast("Failed to delete reply.", "error");
    }
  };

  const handleSubmitReply = async (commentId, content) => {
    if (!content.trim() || !blogId) return false;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You need to be logged in.", "warning");
      navigate("/login");
      return false;
    }

    try {
      const res = await axios.post(
        `${apiUrl}/api/blog/comments/${commentId}/replies`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Reply response:", res.data);

      const newReply = res.data?.data || res.data;

      // Update state comments dengan reply baru
      const updated = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });

      setComments(updated);
      setReplyingTo(null);

      // Pastikan balasan yang baru ditambahkan terlihat
      setExpandedReplies({
        ...expandedReplies,
        [commentId]: true
      });

      showToast("Reply submitted successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting reply:", error);
      showToast("Failed to submit reply.", "error");
      return false;
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast notification di bagian atas kanan */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${toastMessage.type === 'error' ? 'bg-red-500' :
            toastMessage.type === 'warning' ? 'bg-yellow-500' :
              'bg-green-500'
          } text-white font-medium`}>
          {toastMessage.message}
        </div>
      )}

      {/* Komentar List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          {loadingComments ? "Loading..." : `${comments.length} Comments`}
        </h3>
        <div className="space-y-4 max-h-72 overflow-y-auto overflow-x-hidden pr-4">
          {comments.length > 0 ? (
            comments.map((comment) => {
              return (
                <div key={comment.id} className="border-b pb-3">
                  {editingCommentId === comment.id ? (
                    <div className="mb-3">
                      <textarea
                        rows="3"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm mb-2"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="bg-sky-500 hover:bg-sky-400 text-white text-xs px-3 py-1 rounded"
                        >
                          Update
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="break-words overflow-hidden pr-2" style={{ maxWidth: "calc(100% - 30px)" }}>
                        <p className="font-medium">{comment.user?.name}</p>
                        <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                      </div>
                      <CommentDropdown
                        commentId={comment.id}
                        onEdit={() => handleEditComment(comment.id)}
                        onDelete={() => handleDeleteComment(comment.id)}
                        onReply={() => setReplyingTo(comment.id)}
                      />
                    </div>
                  )}

                  {/* Show replies button */}
                  {comment.replies && comment.replies.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="ml-6 mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        {expandedReplies[comment.id] ? (
                          <>
                            <ChevronUp size={14} className="mr-1" />
                            Hide replies
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} className="mr-1" />
                            View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                          </>
                        )}
                      </button>

                      {/* Replies section */}
                      {expandedReplies[comment.id] && (
                        <div className="mt-2">
                          {(comment.replies || [])
                            .filter(reply => reply && reply.id)
                            .map((reply) => (
                              <div key={reply.id} className="ml-6 mt-2 text-sm text-gray-600">
                                {editingReplyId === reply.id ? (
                                  <div className="mb-3">
                                    <textarea
                                      rows="2"
                                      value={editReplyContent}
                                      onChange={(e) => setEditReplyContent(e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm mb-2"
                                    />
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleUpdateReply(comment.id, reply.id)}
                                        className="bg-sky-500 hover:bg-sky-400 text-white text-xs px-3 py-1 rounded"
                                      >
                                        Update
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start">
                                    <div className="break-words overflow-hidden pr-2" style={{ maxWidth: "calc(100% - 30px)" }}>
                                      <p className="font-medium">{reply.user?.name}</p>
                                      <p className="break-words">{reply.content}</p>
                                    </div>
                                    <CommentDropdown
                                      commentId={comment.id}
                                      replyId={reply.id}
                                      onEdit={() => handleEditReply(comment.id, reply.id)}
                                      onDelete={() => handleDeleteReply(comment.id, reply.id)}
                                      isReply={true}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}

                  {replyingTo === comment.id && (
                    <ReplyForm
                      commentId={comment.id}
                      onCancel={() => setReplyingTo(null)}
                      onSubmit={handleSubmitReply}
                    />
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
          <div ref={commentsEndRef} />
        </div>
      </div>
      {/* Form Komentar */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            rows="5"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm mb-3"
            disabled={submittingComment}
            placeholder="Write your comment..."
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2 rounded"
            disabled={submittingComment}
          >
            {submittingComment ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

    </div>
  );
};

const CommentDropdown = ({ commentId, replyId, onEdit, onDelete, onReply, isReply = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === "edit") {
      onEdit();
    } else if (action === "delete") {
      onDelete();
    } else if (action === "reply" && !isReply) {
      onReply();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md py-1 z-50"
          style={{ zIndex: 9999 }}>
          <button
            onClick={() => handleAction("edit")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
          >
            <Pencil size={14} className="mr-2" />
            Edit
          </button>
          {!isReply && (
            <button
              onClick={() => handleAction("reply")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            >
              <Reply size={14} className="mr-2" />
              Reply
            </button>
          )}
          <button
            onClick={() => handleAction("delete")}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ReplyForm = ({ commentId, onCancel, onSubmit }) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmit(commentId, replyContent);

    if (success) {
      setReplyContent("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-3 ml-6">
      <form onSubmit={handleSubmit}>
        <textarea
          rows="3"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm mb-2"
          disabled={isSubmitting}
          placeholder="Write your reply..."
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-white text-xs px-3 py-1 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Reply"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
