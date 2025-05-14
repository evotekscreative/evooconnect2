import React from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteBlog = ({ articleId, onSuccess }) => {
  const navigate = useNavigate();

  const deleteBlog = async () => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus blog ini?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/blogs/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (onSuccess) onSuccess();
      else navigate("/blog");
    } catch (error) {
      console.error("Gagal menghapus blog:", error);
      alert("Gagal menghapus blog.");
    }
  };

  return (
    <button
      className="fixed bottom-20 right-6 bg-red-500 hover:bg-red-400 text-white p-3 rounded-full shadow-lg"
      onClick={deleteBlog}
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
};

export default DeleteBlog;
