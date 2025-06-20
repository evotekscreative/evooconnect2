import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Reply,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "../Auth/alert";

const CommentSection = ({ slug, blogId }) => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
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
  const [alert, setAlert] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetId: null,
    targetType: null,
    userId: null,
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // NEW

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUserId(user.id);
  }, []);

  useEffect(() => {
    if (blogId) {
      fetchComments();
    } 
  }, [blogId]);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
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
      const res = await axios.get(
        `${apiUrl}/api/blog-comments/${blogId}?limit=100000&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let apiComments = [];
      if (res.data && res.data.data && res.data.data.comments) {
        apiComments = res.data.data.comments;
      } else if (Array.isArray(res.data)) {
        apiComments = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        apiComments = res.data.data;
      }

      apiComments = apiComments.map((comment) => ({
        ...comment,
        replies: Array.isArray(comment.replies) ? comment.replies : [],
      }));

      setComments(apiComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    }

    setLoadingComments(false);
  };

  const fetchReplies = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token || !commentId) return;

    try {
      const res = await axios.get(
        `${apiUrl}/api/blog/comments/${commentId}/replies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiReplies = Array.isArray(res.data?.data.comments)
        ? res.data.data.comments
        : Array.isArray(res.data)
          ? res.data
          : [];

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: apiReplies }
            : comment
        )
      );

      return apiReplies;
    } catch (error) {
      console.error("Error fetching replies:", error);
      showAlert("Failed to load replies.", "error");
      return [];
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !blogId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("You need to be logged in.", "warning");
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

      setComments((prev) => [created, ...prev]);
      setNewComment("");
      showAlert("Comment submitted successfully!");
      scrollToBottom();
    } catch (error) {
      console.error("Error submitting comment:", error);
      showAlert("Failed to submit comment.", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleEditReply = (commentId, replyId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      const reply = comment.replies.find((r) => r.id === replyId);
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

      const updated = comments.map((c) =>
        c.id === commentId ? { ...c, content: editContent } : c
      );

      setComments(updated);
      setEditingCommentId(null);
      setEditContent("");
      showAlert("Comment updated successfully!");
    } catch (error) {
      console.error("Error updating comment:", error);
      showAlert("Failed to update comment.", "error");
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

      const updated = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === replyId
                ? { ...reply, content: editReplyContent }
                : reply
            ),
          };
        }
        return comment;
      });

      setComments(updated);
      setEditingReplyId(null);
      setEditReplyContent("");
      showAlert("Reply updated successfully!");
    } catch (error) {
      console.error("Error updating reply:", error);
      showAlert("Failed to update reply.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditingReplyId(null);
    setEditReplyContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${apiUrl}/api/blog/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      showAlert("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showAlert("Failed to delete comment.", "error");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${apiUrl}/api/blog/comments/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          };
        }
        return comment;
      });

      setComments(updated);
      showAlert("Reply deleted successfully!");
    } catch (error) {
      console.error("Error deleting reply:", error);
      showAlert("Failed to delete reply.", "error");
    }
  };

  const handleSubmitReply = async (commentId, content) => {
    if (!content.trim() || !blogId) return false;

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("You need to be logged in.", "warning");
      navigate("/login");
      return false;
    }

    try {
      const res = await axios.post(
        `${apiUrl}/api/blog/comments/${commentId}/replies`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newReply = res.data?.data || res.data;

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
              ...comment,
              replies: Array.isArray(comment.replies)
                ? [...comment.replies, newReply]
                : [newReply],
              replies_count: (comment.replies_count || 0) + 1,
            }
            : comment
        )
      );

      setReplyingTo(null);
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      showAlert("Reply submitted successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting reply:", error);
      showAlert("Failed to submit reply.", "error");
      return false;
    }
  };

  const toggleReplies = async (commentId) => {
    if (
      !expandedReplies[commentId] &&
      (!comments.find((c) => c.id === commentId)?.replies ||
        comments.find((c) => c.id === commentId)?.replies.length === 0)
    ) {
      await fetchReplies(commentId);
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReport = async (reason) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("You need to be logged in to report.", "warning");
      return;
    }

    try {
      await axios.post(
        `${apiUrl}/api/reports/${reportModal.userId}/${reportModal.targetType}/${reportModal.targetId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("Report submitted successfully!");
    } catch (error) {
      console.error("Error submitting report:", error);
      showAlert("Failed to submit report.", "error");
    } finally {
      setReportModal({ isOpen: false, targetId: null, targetType: null, userId: null });
    }
  };

  return (
    <div className="space-y-6">
      {alert && (
        <div className="fixed top-4 right-4 z-50">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

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
                      <div
                        className="break-words overflow-hidden pr-2"
                        style={{ maxWidth: "calc(100% - 30px)" }}
                      >
                        <p className="font-medium">{comment.user?.name}</p>
                        <p className="text-sm text-gray-700 break-words">
                          {comment.content}
                        </p>
                      </div>
                      <CommentDropdown
                        commentId={comment.id}
                        isOpen={openDropdown === `comment-${comment.id}`}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === `comment-${comment.id}`
                              ? null
                              : `comment-${comment.id}`
                          )
                        }
                        onEdit={() => {
                          setOpenDropdown(null);
                          handleEditComment(comment.id);
                        }}
                        onDelete={() => {
                          setOpenDropdown(null);
                          handleDeleteComment(comment.id);
                        }}
                        onReply={() => {
                          setOpenDropdown(null);
                          setReplyingTo(comment.id);
                        }}
                        onReport={() => {
                          setOpenDropdown(null);
                          setReportModal({
                            isOpen: true,
                            targetId: comment.id,
                            targetType: "comment",
                            userId: comment.user?.id,
                          });
                        }}
                        currentUserId={currentUserId}
                        commentUserId={comment.user?.id}
                      />
                    </div>
                  )}

                  {comment.replies &&
                    (comment.replies_count || comment.replies.length) > 0 && (
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
                              View{" "}
                              {comment.replies_count ||
                                comment.replies.length}{" "}
                              {(comment.replies_count ||
                                comment.replies.length) === 1
                                ? "reply"
                                : "replies"}
                            </>
                          )}
                        </button>

                        {expandedReplies[comment.id] && (
                          <div className="mt-2">
                            {(Array.isArray(comment.replies)
                              ? comment.replies
                              : []
                            )
                              .filter((reply) => reply && reply.id)
                              .map((reply) => (
                                <div
                                  key={reply.id}
                                  className="ml-6 mt-2 text-sm text-gray-600"
                                >
                                  {editingReplyId === reply.id ? (
                                    <div className="mb-3">
                                      <textarea
                                        rows="2"
                                        value={editReplyContent}
                                        onChange={(e) =>
                                          setEditReplyContent(e.target.value)
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm mb-2"
                                      />
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() =>
                                            handleUpdateReply(
                                              comment.id,
                                              reply.id
                                            )
                                          }
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
                                      <div
                                        className="break-words overflow-hidden pr-2"
                                        style={{
                                          maxWidth: "calc(100% - 30px)",
                                        }}
                                      >
                                        <p className="font-medium">
                                          {reply.user?.name}
                                        </p>
                                        <p className="break-words">
                                          {reply.content}
                                        </p>
                                      </div>
                                      <CommentDropdown
                                        commentId={comment.id}
                                        replyId={reply.id}
                                        isReply={true}
                                        isOpen={openDropdown === `reply-${reply.id}`}
                                        onToggle={() =>
                                          setOpenDropdown(
                                            openDropdown === `reply-${reply.id}`
                                              ? null
                                              : `reply-${reply.id}`
                                          )
                                        }
                                        onEdit={() => {
                                          setOpenDropdown(null);
                                          handleEditReply(comment.id, reply.id);
                                        }}
                                        onDelete={() => {
                                          setOpenDropdown(null);
                                          handleDeleteReply(comment.id, reply.id);
                                        }}
                                        onReport={() => {
                                          setOpenDropdown(null);
                                          setReportModal({
                                            isOpen: true,
                                            targetId: reply.id,
                                            targetType: "reply",
                                            userId: reply.user?.id,
                                          });
                                        }}
                                        currentUserId={currentUserId}
                                        commentUserId={reply.user?.id}
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
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
          <div ref={commentsEndRef} />
        </div>
      </div>

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

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, targetId: null, targetType: null, userId: null })}
        onSubmit={handleReport}
      />
    </div>
  );
};

// Ubah CommentDropdown agar tidak punya state isOpen sendiri
const CommentDropdown = ({
  commentId,
  replyId,
  onEdit,
  onDelete,
  onReply,
  onReport,
  isReply = false,
  currentUserId,
  commentUserId,
  isOpen,
  onToggle,
}) => {
  const isCurrentUserComment = currentUserId == commentUserId;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md py-1 z-50">
          {/* Options for our own comment */}
          {isCurrentUserComment && (
            <>
              <button
                onClick={onEdit}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
              >
                <Pencil size={14} className="mr-2" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </button>
            </>
          )}

          {/* Options for other users' comments */}
          {!isCurrentUserComment && (
            <button
              onClick={onReport}
              className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Report
            </button>
          )}

          {/* Reply option (shown for all comments except replies) */}
          {!isReply && (
            <button
              onClick={onReply}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            >
              <Reply size={14} className="mr-2" />
              Reply
            </button>
          )}
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

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    onSubmit(reason);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Report Content</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
              required
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;