import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Check,
  X,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import Alert from "../components/Auth/alert";

export default function ApprovePost() {
  const { groupId } = useParams();
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [pendingPosts, setPendingPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showAlert = (type, message) => {
    setAlertInfo({
      show: true,
      type,
      message,
    });
    setTimeout(() => {
      setAlertInfo((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const fetchPendingPosts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/pending-posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Add proper fallback for user data
      const formattedPosts = response.data.data.map((data) => ({
        ...data,
        user: data.post.user || {
          name: "Unknown User",
          photo: null,
          username: "unknown",
        },
        images:
          data.post.images?.map((img) =>
            img.startsWith("http") ? img : `${apiUrl}/${img}`
          ) || [],
        content: data.post.content || "",
        created_at: data.post.created_at || "Unknown date",
      }));

      
      setPendingPosts(formattedPosts || []);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      showAlert("error", "Failed to load pending posts");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short", // Jan, Feb, etc.
  });
};

  const handleApprovePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/groups/${groupId}/posts/${postId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      showAlert("success", "Post approved successfully");
    } catch (error) {
      console.error("Error approving post:", error);
      showAlert("error", "Failed to approve post");
    }
  };

  const handleRejectPost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${apiUrl}/api/groups/${groupId}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      showAlert("success", "Post rejected successfully");
    } catch (error) {
      console.error("Error rejecting post:", error);
      showAlert("error", "Failed to reject post");
    }
  };

  const renderPhotoGrid = (images) => {
    if (!images || !Array.isArray(images)) return null;

    const validImages = images
      .map((img) => {
        if (typeof img === "string") {
          return img.startsWith("http") ? img : `${apiUrl}/${img}`;
        }
        return "";
      })
      .filter((img) => img);

    if (validImages.length === 0) return null;

    if (validImages.length === 1) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <img
            src={validImages[0]}
            className="w-full h-48 object-cover"
            alt="Post"
          />
        </div>
      );
    }
    // Add more cases for multiple images if needed
    return null;
  };

  useEffect(() => {
    fetchPendingPosts();
  }, [groupId]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="fixed top-5 right-5 z-50">
        {alertInfo.show && (
          <Alert
            type={alertInfo.type}
            message={alertInfo.message}
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          />
        )}
      </div>

      <div className="flex items-center mb-6">
        <Link
          to={`/groups/${groupId}`}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Posts Pending Approval</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No posts pending approval</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
<div className="flex items-center">
  {post.user?.photo ? (
    <img
      className="rounded-full w-8 h-8 object-cover mr-2"
      src={
        post.user.photo.startsWith("http")
          ? post.user.photo
          : `${apiUrl}/${post.user.photo}`
      }
      alt={post.user.name}
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
      <span className="text-xs font-bold text-gray-600">
        {post.user?.name?.charAt(0) || "U"}
      </span>
    </div>
  )}

  <div className="flex flex-col">
    <span className="font-medium">
      {post.user?.name || "Unknown User"}
    </span>
    <p className="text-xs text-gray-500">
  {formatDate(post.created_at)}
</p>

  </div>
</div>

                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {post.content && <p className="mb-3">{post.content}</p>}

                {post.images && renderPhotoGrid(post.images)}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => handleRejectPost(post.id)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white"
                  >
                    <X size={16} className="mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprovePost(post.id)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white"
                  >
                    <Check size={16} className="mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}