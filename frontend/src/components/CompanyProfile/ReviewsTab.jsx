import React from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

export default function ReviewsTab({
  userReviews,
  newComment,
  setNewComment,
  handleCommentSubmit,
  formatDate
}) {
  return (
    <div className="bg-white p-6 rounded-md shadow text-sm space-y-6">
      <div className="flex items-start mb-6">
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="User photo"
          className="w-10 h-10 rounded-full mr-4"
        />
        <div className="flex-1">
          <textarea
            placeholder="Add a public comment..."
            className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-400">{userReviews.length} Comments</span>
            <div>
              <button 
                className="px-4 py-1 mr-2 rounded-md bg-blue-100 text-blue-500 hover:bg-blue-200 text-sm"
                onClick={() => setNewComment("")}
              >
                CANCEL
              </button>
              <button 
                className="px-4 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-sm"
                onClick={handleCommentSubmit}
              >
                COMMENT
              </button>
            </div>
          </div>
        </div>
      </div>

      {userReviews.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        userReviews.map((review, index) => (
          <div key={review.id} className="flex items-start space-x-4">
            <img
              src={`https://randomuser.me/api/portraits/men/${index + 30}.jpg`}
              alt="Commenter photo"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="font-semibold text-blue-600 mr-2">{review.name}</span>
                <span className="text-gray-400 text-sm">{formatDate(review.date)}</span>
              </div>
              <p className="text-gray-700 mb-2">{review.description}</p>
              <div className="flex items-center text-gray-500 space-x-4">
                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                  <ThumbsUp size={20} strokeWidth={0.75} />
                  <p>{review.like}</p>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                  <ThumbsDown size={20} strokeWidth={0.75} />
                  <p>{review.unLike}</p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}