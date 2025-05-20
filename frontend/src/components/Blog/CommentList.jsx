import React from 'react';
import Comment from './Comment';
import CommentDropdown from './CommentDropdown';

const CommentList = ({ comments, onDelete, onReply, toggleCommentExpansion, expandedComments }) => {
  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id} className="border-b py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-semibold">{comment.author}</p>
              <p>{comment.content}</p>
              <button
                onClick={() => toggleCommentExpansion(comment.id)}
                className="text-sm text-blue-500 hover:underline"
              >
                {expandedComments[comment.id] ? 'Show Less' : 'Show More'}
              </button>
            </div>
            <CommentDropdown commentId={comment.id} onDelete={onDelete} onReply={onReply} />
          </div>

          {expandedComments[comment.id] && comment.replies && comment.replies.length > 0 && (
            <div className="ml-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="border-b py-2">
                  <p className="font-semibold">{reply.author}</p>
                  <p>{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
