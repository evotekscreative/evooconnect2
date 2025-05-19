import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MoreVertical, Pencil, Trash2, Reply } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "../Blog/Toast";

const CommentSection = ({ slug }) => {
  const navigate = useNavigate();
  const commentsEndRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    syncCommentsWithLocalStorage();
  }, [slug]);

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

  const mergeComments = (localComments, apiComments) => {
    const merged = [...apiComments];
    localComments.forEach((local) => {
      const exists = apiComments.some((api) => api.id === local.id);
      if (!exists || !local.id || typeof local.id !== "number") {
        merged.push(local);
      }
    });
    return merged;
  };

  const syncCommentsWithLocalStorage = async () => {
    setLoadingComments(true);
    const cachedComments = getCommentsFromLocalStorage(slug);
    setComments(cachedComments);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingComments(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3000/api/blog-comments/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiComments = Array.isArray(res.data) ? res.data : [];
      const merged = mergeComments(cachedComments, apiComments);

      const repliesRequests = merged.map((comment) => {
        if (comment.id && typeof comment.id === "number") {
          return axios
            .get(`http://localhost:3000/api/blog/comments/${comment.id}/replies`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => ({ ...comment, replies: res.data }))
            .catch(() => comment);
        }
        return Promise.resolve(comment);
      });

      const commentsWithReplies = await Promise.all(repliesRequests);
      setComments(commentsWithReplies);
      saveCommentsToLocalStorage(slug, commentsWithReplies);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.warning("Session expired. Please login again.");
        navigate("/login");
      } else {
        console.error("Error syncing comments:", err);
      }
    }

    setLoadingComments(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("You need to be logged in.");
      navigate("/login");
      return;
    }

    setSubmittingComment(true);
    let created;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/blog-comments/${slug}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      created = res.data?.data || res.data;
    } catch {
      created = {
        id: Date.now(),
        content: newComment,
        user: {
          name: "You",
          avatar: localStorage.getItem("userAvatar") || "/img/profile.jpg",
        },
        createdAt: new Date().toISOString(),
        isLocal: true,
        replies: [],
      };
    }

    const updated = [...comments, created];
    setComments(updated);
    saveCommentsToLocalStorage(slug, updated);
    setNewComment("");
    setSubmittingComment(false);
    toast.success("Comment submitted!");
    scrollToBottom();
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
    } catch {
      console.warn("Comment deletion failed, removed locally.");
    }

    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    saveCommentsToLocalStorage(slug, updated);
    toast.success("Comment deleted.");
  };

  const handleSubmitReply = async (commentId, content) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("You need to be logged in.");
      navigate("/login");
      return;
    }

    let reply;
    try {
      const res = await axios.post(
        `http://localhost:3000/api/blog/comments/${commentId}/replies`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      reply = res.data?.data || res.data;
    } catch {
      reply = {
        id: Date.now(),
        content,
        user: {
          name: "You",
          avatar: localStorage.getItem("userAvatar") || "/img/profile.jpg",
        },
        createdAt: new Date().toISOString(),
        isLocal: true,
      };
    }

    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c
    );
    setComments(updated);
    saveCommentsToLocalStorage(slug, updated);
    setReplyingTo(null);
    toast.success("Reply submitted!");
    scrollToBottom();
  };

  return (
    <div className="space-y-6">
      {/* Komentar List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          {loadingComments ? "Loading..." : `${comments.length} Comments`}
        </h3>
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-b pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{comment.user?.name}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <CommentDropdown
                    commentId={comment.id}
                    onDelete={handleDeleteComment}
                    onReply={() => setReplyingTo(comment.id)}
                  />
                </div>
                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="ml-6 mt-2 text-sm text-gray-600">
                    <p className="font-medium">{reply.user?.name}</p>
                    <p>{reply.content}</p>
                  </div>
                ))}
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

const CommentDropdown = ({ commentId, onDelete, onReply }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-gray-500 hover:text-gray-700">
        <MoreVertical className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </button>
          <button
            onClick={onReply}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <Reply className="w-4 h-4 mr-2" /> Reply
          </button>
          <button
            onClick={() => onDelete(commentId)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ReplyForm = ({ commentId, onCancel, onSubmit }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    await onSubmit(commentId, content);
    setContent("");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 ml-12 pl-4 border-l-2 border-gray-200">
      <textarea
        rows="3"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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

export default CommentSection;
