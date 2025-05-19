import React, { useState } from "react";
import { MoreVertical, Pencil, Reply, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const CommentDropdown = ({ commentId, onDelete, onReply }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("gada token woi");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/api/blog/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onDelete(commentId); // Call onDelete prop to update parent state
      toast.success("Comment deleted successfully");
    } catch (apiError) {
      console.error("API delete failed, deleting locally:", apiError);
      toast.error("Failed to delete comment.");
    }
  };

  const handleReply = () => {
    onReply(commentId); // Call onReply prop to update parent state
    setIsOpen(false); // Close the dropdown after replying
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
            onClick={() => {}}
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
            onClick={() => handleDeleteComment(commentId)}
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

export default CommentDropdown;
