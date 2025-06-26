import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  Image as ImageIcon,
  Calendar,
  Users,
  Globe,
  Heart,
  MessageCircle,
  User,
  Badge,
} from "lucide-react";
import { toast } from "sonner";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

// Create/Edit Post Modal Component
const PostModal = ({ isOpen, onClose, post = null, companyId, onRefresh }) => {
  const [formData, setFormData] = useState({
    content: "",
    visibility: "public",
    is_announcement: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        content: post.content || "",
        visibility: post.visibility || "public",
        is_announcement: post.is_announcement || false,
      });
      setExistingImages(post.images || []);
    } else {
      setFormData({
        content: "",
        visibility: "public",
        is_announcement: false,
      });
      setExistingImages([]);
    }
    setImages([]);
    setRemovedImages([]);
  }, [post, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setRemovedImages((prev) => [...prev, imageUrl]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Post content is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("content", formData.content);
      formDataToSend.append("visibility", formData.visibility);
      formDataToSend.append("is_announcement", formData.is_announcement);

      if (post) {
        // Update existing post
        formDataToSend.append(
          "existing_images",
          JSON.stringify(existingImages)
        );
        formDataToSend.append("removed_images", JSON.stringify(removedImages));

        images.forEach((image) => {
          formDataToSend.append("new_images", image);
        });

        const response = await fetch(
          `${BASE_URL}/api/company-posts/${post.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formDataToSend,
          }
        );

        const result = await response.json();
        if (response.ok && result.code === 200) {
          toast.success("Post updated successfully!");
          onRefresh();
          onClose();
        } else {
          throw new Error(result.message || "Failed to update post");
        }
      } else {
        // Create new post
        formDataToSend.append("company_id", companyId);

        images.forEach((image) => {
          formDataToSend.append("images", image);
        });

        const response = await fetch(
          `${BASE_URL}/api/companies/${companyId}/posts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formDataToSend,
          }
        );

        const result = await response.json();
        if (response.ok && result.code === 201) {
          toast.success("Post created successfully!");
          onRefresh();
          onClose();
        } else {
          throw new Error(result.message || "Failed to create post");
        }
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(error.message || "Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {post ? "Edit Post" : "Create New Post"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Post Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="What would you like to share with your audience?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="members_only">Members Only</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_announcement"
                  checked={formData.is_announcement}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Mark as Announcement
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Current Images
                </label>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((imageUrl, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={`${BASE_URL}/${imageUrl.replace(/^\/+/, "")}`}
                        alt={`Post image ${idx + 1}`}
                        className="object-cover w-20 h-20 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(imageUrl)}
                        className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : post
                  ? "Update Post"
                  : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function TablePost({ companyId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/companies/${companyId}/posts?limit=${pagination.limit}&offset=${pagination.offset}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200) {
          setPosts(result.data.posts || []);
          setPagination((prev) => ({ ...prev, total: result.data.total || 0 }));
        }
      } else {
        toast.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/company-posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast.success("Post deleted successfully!");
        fetchPosts();
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setShowPostModal(true);
  };

  useEffect(() => {
    fetchPosts();
  }, [companyId, pagination.offset]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "moderator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative flex flex-col w-full mb-6 bg-white rounded shadow-lg">
      <div className="px-4 py-3 mb-0 border-b rounded-t border-sky-700 bg-sky-800">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex-1 flex-grow w-full max-w-full px-4">
            <h3 className="text-lg font-semibold text-white">Manage Posts</h3>
          </div>
          <button
            onClick={handleCreatePost}
            className="flex items-center px-4 py-2 text-sm font-medium bg-white rounded-md text-sky-800 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      <div className="block w-full overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 rounded-full border-sky-600 border-t-transparent animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-4 text-gray-500">No posts found</p>
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 text-white rounded-md bg-sky-600 hover:bg-sky-700"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Post Details
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Creator
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Settings
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Engagement
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Media
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Dates
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  {/* Post Details */}
                  <td className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col max-w-xs">
                      <p className="mb-2 text-sm font-medium text-gray-900">
                        {truncateContent(post.content)}
                      </p>
                      <p className="font-mono text-xs text-gray-500">
                        ID: {post.id}
                      </p>
                    </div>
                  </td>

                  {/* Creator */}
                  <td className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {post.creator?.photo ? (
                          <img
                            src={post.creator.photo}
                            alt={post.creator.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.creator?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{post.creator?.username || "unknown"}
                        </p>
                        {post.creator?.role && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              post.creator.role
                            )}`}
                          >
                            <Badge className="w-3 h-3 mr-1" />
                            {post.creator.role.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Settings */}
                  <td className="px-6 py-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {post.visibility === "public" ? (
                          <Globe className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Users className="w-4 h-4 mr-2 text-blue-500" />
                        )}
                        <span className="text-sm capitalize">
                          {post.visibility.replace("_", " ")}
                        </span>
                      </div>
                      {post.is_announcement && (
                        <div className="flex items-center">
                          <Megaphone className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-sm text-red-600">
                            Announcement
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Engagement */}
                  <td className="px-6 py-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            post.is_liked ? "text-red-500" : "text-gray-400"
                          }`}
                        />
                        <span className="text-sm">{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Media */}
                  <td className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        {post.images?.length || 0}
                      </span>
                    </div>
                    {post.images && post.images.length > 0 && (
                      <div className="flex mt-2 space-x-1">
                        {post.images.slice(0, 3).map((image, idx) => (
                          <img
                            key={idx}
                            src={`${BASE_URL}/${image.replace(/^\/+/, "")}`}
                            alt={`Post image ${idx + 1}`}
                            className="object-cover w-6 h-6 border rounded"
                          />
                        ))}
                        {post.images.length > 3 && (
                          <div className="flex items-center justify-center w-6 h-6 bg-gray-200 border rounded">
                            <span className="text-xs text-gray-500">
                              +{post.images.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4 text-sm text-gray-600 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm">
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>
                      {post.updated_at !== post.created_at && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-500">Updated</p>
                            <p className="text-sm">
                              {formatDate(post.updated_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-blue-600 rounded hover:bg-blue-50"
                        title="Edit Post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-600 rounded hover:bg-red-50"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {posts.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {pagination.offset + 1} to{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            of {pagination.total} posts
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
              disabled={pagination.offset === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
              disabled={
                pagination.offset + pagination.limit >= pagination.total
              }
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        post={selectedPost}
        companyId={companyId}
        onRefresh={fetchPosts}
      />
    </div>
  );
}
