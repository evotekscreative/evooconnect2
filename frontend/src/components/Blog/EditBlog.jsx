import React, { useState, useEffect } from "react";
import { categories } from "./CategoryStep";

// Perbaikan fungsi cleanHTML agar tidak menghapus spasi
const cleanHTML = (html) => {
  if (!html) return "";
  return html
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, "\n\n") // Ganti </p> dengan double newline untuk mempertahankan paragraf
    .replace(/<br\s*\/?>/g, "\n") // Ganti <br> dengan newline
    .replace(/<[^>]+>/g, "")
    .trim();
};

// Fungsi untuk memformat teks biasa menjadi HTML sederhana
const formatToHTML = (text) => {
  if (!text) return "";
  return text
    .split("\n\n") // Pisahkan berdasarkan paragraf (double newline)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`) // Ubah newline menjadi <br>
    .join("");
};

const EditBlog = ({ article, setArticle, onClose, onSuccess, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [content, setContent] = useState("");
  
  useEffect(() => {
    if (article) {
      // Inisialisasi content dengan konten artikel yang sudah dibersihkan
      setContent(cleanHTML(article.content));
    }
  }, [article]);

  const handleUploadImagePreview = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("File harus berupa gambar.", "error");
      return;
    }

    setImageFile(file);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", article.title);
      formData.append("category", article.category);
      
      // Format konten teks menjadi HTML sebelum mengirim
      const formattedContent = formatToHTML(content);
      formData.append("content", formattedContent);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`http://localhost:3000/api/blogs/${article.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Bad request");
      }

      // Panggil onSuccess untuk memicu refresh di BlogDetail
      onSuccess();
    } catch (err) {
      showToast(err.message || "Gagal update blog.", "error");
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
              onChange={handleUploadImagePreview}
              className="w-full px-3 py-2 rounded border"
            />
            <div className="mt-3">
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="rounded max-h-60 object-cover"
                />
              ) : article.photo ? (
                <img
                  src={article.photo}
                  alt="Current Image"
                  className="rounded max-h-60 object-cover"
                />
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
