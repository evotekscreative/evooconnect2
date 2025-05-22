import React, { useState } from "react";
import axios from "axios";

const DeleteBlog = ({ articleId, onSuccess, onCancel }) => {
          const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [isLoading, setIsLoading] = useState(false);

  const deleteBlog = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/blogs/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert(error.response?.data?.message || "Failed to delete blog.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <p className="text-center mb-4">Are you sure you want to delete this blog?</p>
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={deleteBlog}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBlog;
