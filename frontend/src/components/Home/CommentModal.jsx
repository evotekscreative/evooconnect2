import { useState, useEffect } from 'react';
import axios from 'axios';

function CommentModal({ postId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load comments
  useEffect(() => {
    if (postId && isOpen) {
      loadComments();
    }
  }, [postId, isOpen]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`);
      if (response.data.status === 'success') {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send comment
  const handleSendComment = async () => {
    if (!commentContent.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${postId}/comment`, {
        content: commentContent.trim()
      });
      
      if (response.data.status === 'success') {
        setCommentContent('');
        loadComments(); // Reload comments to include the new one
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  // Handle reply actions
  const handleReplyClick = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, showReplyForm: !comment.showReplyForm };
      }
      return comment;
    }));
  };

  const handleSendReply = async (commentId, replyContent) => {
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post(`/api/comments/${commentId}/reply`, {
        content: replyContent.trim()
      });
      
      if (response.data.status === 'success') {
        loadComments(); // Reload comments to include the new reply
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  // Render comments recursively
  const renderComment = (comment) => (
    <div key={comment.id} className="mb-3">
      <div className="flex items-start">
        <div className="mr-3 relative">
          <img 
            className="w-10 h-10 rounded-full" 
            src={comment.user.profile_photo_url || '/img/default-photo.png'} 
            alt={comment.user.name} 
          />
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${
            comment.user.is_online ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
        </div>
        <div className="flex-1">
          <div className="font-bold">{comment.user.name}</div>
          <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
          <p className="mt-1">{comment.content}</p>
          
          <div className="mt-2">
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => handleReplyClick(comment.id)}
            >
              Reply
            </button>
            
            {comment.showReplyForm && (
              <div className="mt-2">
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Write a reply..."
                  value={comment.replyContent || ''}
                  onChange={(e) => {
                    setComments(comments.map(c => {
                      if (c.id === comment.id) {
                        return { ...c, replyContent: e.target.value };
                      }
                      return c;
                    }));
                  }}
                  rows="2"
                ></textarea>
                <button 
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
                  onClick={() => handleSendReply(comment.id, comment.replyContent)}
                >
                  Send
                </button>
              </div>
            )}
          </div>
          
          {/* Display replies if any */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-6 mt-3 border-l-2 border-gray-200 pl-3">
              {comment.replies.map(reply => renderComment(reply))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Modal Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <h5 className="font-medium">Comments</h5>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Comments List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="loader"></div>
            </div>
          ) : comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
          )}
        </div>
        
        {/* Add Comment Form */}
        <div className="border-t p-4">
          <textarea 
            className="w-full border border-gray-300 rounded-md p-3"
            placeholder="Add a comment..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows="3"
          ></textarea>
          <div className="flex justify-end mt-3">
            <button 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn-primary text-white font-medium py-2 px-4 rounded-md"
              onClick={handleSendComment}
              disabled={!commentContent.trim()}
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;