import axios from "axios";

const DeleteBlog = async (blogId, navigate) => {
  const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus blog ini?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token"); // ambil JWT token
    const apiUrl = `http://localhost:3000/api/blogs/${blogId}`;
    
    // Mengirim request delete ke API
    await axios.delete(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Hapus dari localStorage
    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
    const filteredBlogs = blogs.filter((b) => b.id !== blogId);

    // Update localStorage dengan data yang sudah difilter
    localStorage.setItem("blogs", JSON.stringify(filteredBlogs));

    alert("Blog telah dihapus.");
    
    // Arahkan kembali ke halaman Blog
    navigate("/blog");
  } catch (error) {
    console.error("Gagal menghapus blog:", error);
    alert("Error: Gagal menghapus blog.");
  }
};

export default DeleteBlog;
