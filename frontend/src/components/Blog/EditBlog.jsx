import React, { useState, useEffect } from "react";
import { categories } from "./CategoryStep";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const MAX_CHARACTERS = 1500;

const EditBlog = ({ article, setArticle, onClose, onSuccess, showToast }) => {
          const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  
  // Tambahkan style untuk menyembunyikan "Powered by CKEditor"
  useEffect(() => {
    // Tambahkan style untuk menyembunyikan "Powered by CKEditor"
    const style = document.createElement('style');
    style.innerHTML = `
      .ck-powered-by {
        display: none !important;
      }
      .ck-editor__editable {
        min-height: 200px;
      }
    `;
    document.head.appendChild(style);
    
    if (article) {
      setContent(article.content || "");
      // Hitung jumlah karakter awal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.content || "";
      setCharCount(tempDiv.textContent.length);
    }
    
    // Cleanup style saat komponen unmount
    return () => {
      document.head.removeChild(style);
    };
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
    // Validasi jumlah karakter sebelum menyimpan
    if (charCount > MAX_CHARACTERS) {
      showToast(`Content exceeds maximum ${MAX_CHARACTERS} characters limit.`, "error");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", article.title);
      formData.append("category", article.category);
      
      // Gunakan konten langsung dari CKEditor
      formData.append("content", content);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${apiUrl}/api/blogs/${article.id}`, {
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

  // Fungsi untuk menghitung jumlah karakter dari HTML
  const countCharacters = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent.length;
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
              <div className="aspect-[4/3] w-full max-h-[400px] rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                ) : article.photo ? (
                  <img
                    src={article.photo}
                    alt="Current Image"
                    className="rounded w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <div className="border rounded">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  const count = countCharacters(data);
                  setCharCount(count);
                  setContent(data);
                  
                  // Tampilkan peringatan jika melebihi batas
                  if (count > MAX_CHARACTERS) {
                    showToast(`Content exceeds maximum ${MAX_CHARACTERS} characters limit.`, "warning");
                  }
                }}
                config={{
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'blockQuote',
                    '|',
                    'undo',
                    'redo'
                  ]
                }}
              />
            </div>
            <div className={`text-sm mt-1 text-right ${charCount > MAX_CHARACTERS ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {charCount}/{MAX_CHARACTERS} characters
            </div>
          </div>
        </div>
        <div className="text-right mt-6">
          <button
            onClick={handleSave}
            disabled={loading || charCount > MAX_CHARACTERS}
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
