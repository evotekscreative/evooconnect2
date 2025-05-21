import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MoreVertical, Pencil, Trash2, Reply } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommentSection = ({ slug }) => {
  const navigate = useNavigate();
  const commentsEndRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [slug]);

  // Fungsi untuk menampilkan toast di bagian atas kanan
  // type: "success" (hijau) - untuk operasi berhasil
  // type: "error" (merah) - untuk kesalahan
  // type: "warning" (kuning) - untuk peringatan atau operasi lokal
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveCommentsToLocalStorage = (slug, comments) => {
    try {
      const allComments = JSON.parse(localStorage.getItem("blogComments")) || {};
      allComments[slug] = comments;
      localStorage.setItem("blogComments", JSON.stringify(allComments));
    } catch (error) {
      console.error("Error saving comments:", error);
    }
  };

  const getCommentsFromLocalStorage = (slug) => {
    try {
      const allComments = JSON.parse(localStorage.getItem("blogComments")) || {};
      return allComments[slug] || [];
    } catch {
      return [];
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    const cachedComments = getCommentsFromLocalStorage(slug);
    setComments(cachedComments);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingComments(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/blog-comments/${article.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const apiComments = Array.isArray(res.data.data) ? res.data.data : [];
      
      const commentsWithReplies = await Promise.all(
        apiComments.map(async (comment) => {
          if (comment.id) {
            try {
              const repliesRes = await axios.get(
                `http://localhost:3000/api/blog/comments/${comment.id}/replies`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              return { ...comment, replies: repliesRes.data || [] };
            } catch (error) {
              console.error(`Error fetching replies for comment ${comment.id}:`, error);
              return { ...comment, replies: [] };
            }
          }
          return { ...comment, replies: [] };
        })
      );
      
      setComments(commentsWithReplies);
      saveCommentsToLocalStorage(slug, commentsWithReplies);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }

    setLoadingComments(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You need to be logged in.", "warning");
      navigate("/login");
      return;
    }

    setSubmittingComment(true);

    try {
      // endpoint untuk membuat komentar
      const res = await axios.post(
        `http://localhost:3000/api/blog-comments/${article.id}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const created = res.data?.data || res.data;
      
      const newCommentObj = {
        ...created,
        replies: []
      };
      
      const updated = [...comments, newCommentObj];
      setComments(updated);
      saveCommentsToLocalStorage(slug, updated);
      setNewComment("");
      showToast("Comment submitted successfully!"); 
      scrollToBottom();
    } catch (error) {
      console.error("Error submitting comment:", error);

      const localComment = {
        id: `local-${Date.now()}`,
        content: newComment,
        user: {
          name: "You",
          avatar: localStorage.getItem("userAvatar") || "/img/profile.jpg",
        },
        createdAt: new Date().toISOString(),
        isLocal: true,
        replies: []
      };
      
      const updated = [...comments, localComment];
      setComments(updated);
      saveCommentsToLocalStorage(slug, updated);
      setNewComment("");
      showToast("Comment saved locally.", "warning"); 
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

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // endpoint untuk mengedit komentar
      await axios.put(
        `http://localhost:3000/api/blog/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update komentar di state lokal
      const updated = comments.map(c => 
        c.id === commentId ? { ...c, content: editContent } : c
      );
      
      setComments(updated);
      saveCommentsToLocalStorage(slug, updated);
      setEditingCommentId(null);
      setEditContent("");
      showToast("Comment updated successfully!"); 
    } catch (error) {
      console.error("Error updating comment:", error);
      
      const updated = comments.map(c => 
        c.id === commentId ? { ...c, content: editContent } : c
      );
      
      setComments(updated);
      saveCommentsToLocalStorage(slug, updated);
      setEditingCommentId(null);
      setEditContent("");
      showToast("Comment updated locally.", "warning"); 
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const confirm = window.confirm("Are you sure you want to delete this comment?");
    if (!confirm) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`http://localhost:3000/api/blog/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showToast("Comment deleted successfully!"); 
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Comment removed locally.", "warning"); 
    }
    
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    saveCommentsToLocalStorage(slug, updated);
  };

  const handleSubmitReply = async (commentId, content) => {
    if (!content.trim()) return true;
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You need to be logged in.", "warning");
      navigate("/login");
      return false;
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/api/blog/comments/${commentId}/replies`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newReply = res.data?.data || res.data;
      
      // Update state comments with new reply
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
      saveCommentsToLocalStorage(slug, updated);
      setReplyingTo(null);
      showToast("Reply submitted successfully!"); 
      return true;
    } catch (error) {
      console.error("Error submitting reply:", error);
      
      const localReply = {
        id: `local-${Date.now()}`,
        content,
        user: {
          name: "You",
          avatar: localStorage.getItem("userAvatar") || "/img/profile.jpg",
        },
        createdAt: new Date().toISOString(),
        isLocal: true,
      };
      
      const updated = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), localReply]
          };
        }
        return comment;
      });
      
      setComments(updated);
      saveCommentsToLocalStorage(slug, updated);
      setReplyingTo(null);
      showToast("Reply saved locally.", "warning"); 
      return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification di bagian atas kanan */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
          toastMessage.type === 'error' ? 'bg-red-500' : 
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
        <div className="space-y-4 max-h-72 pr-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
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
                    <div>
                      <p className="font-medium">{comment.user?.name}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <CommentDropdown
                      commentId={comment.id}
                      onEdit={() => handleEditComment(comment.id)}
                      onDelete={handleDeleteComment}
                      onReply={() => setReplyingTo(comment.id)}
                    />
                  </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-6 mt-2 text-sm text-gray-600">
                        <p className="font-medium">{reply.user?.name}</p>
                        <p>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {replyingTo === comment.id && (
                  <ReplyForm
                    commentId={comment.id}
                    onCancel={() => setReplyingTo(null)}
                    onSubmit={handleSubmitReply}
                  />
                )}
              </div>
            ))
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

const CommentDropdown = ({ commentId, onEdit, onDelete, onReply }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === "edit") {
      onEdit(commentId);
    } else if (action === "delete") {
      onDelete(commentId);
    } else if (action === "reply") {
      onReply(commentId);
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
          <button
            onClick={() => handleAction("reply")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
          >
            <Reply size={14} className="mr-2" />
            Reply
          </button>
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
