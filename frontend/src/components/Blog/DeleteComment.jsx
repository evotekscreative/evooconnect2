// components/Blog/DeleteComment.jsx
import React, { useState } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Reply, Trash2 } from "lucide-react";

const DeleteComment = ({ commentId, onDelete, onReply }) => {
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
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
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

export default DeleteComment;
