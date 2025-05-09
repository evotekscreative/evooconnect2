import React, { useState } from "react";
import { categories } from "./CategoryStep";

const cleanHTML = (html) => {
  return html
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
};

const EditBlog = ({ article, setArticle, onClose, onSuccess, showToast }) => {
  const [loading, setLoading] = useState(false);

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(
        `http://localhost:3000/api/blogs/${article.id}/upload-photo`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await res.json();
      setArticle({ ...article, images: [result.imageUrl] });
      showToast("Gambar berhasil diunggah!", "success");
    } catch {
      showToast("Gagal upload gambar.", "error");
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/blogs/${article.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      });
      showToast("Blog berhasil diperbarui!", "success");
      onSuccess();
    } catch {
      showToast("Gagal update blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white max-w-3xl w-full p-6 rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Blog</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={article.category}
              onChange={(e) => setArticle({ ...article, category: e.target.value })}
              className="w-full px-3 py-2 rounded border bg-white"
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="w-full px-3 py-2 rounded border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              rows={6}
              value={cleanHTML(article.content)}
              onChange={(e) =>
                setArticle({ ...article, content: cleanHTML(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div className="text-right mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
