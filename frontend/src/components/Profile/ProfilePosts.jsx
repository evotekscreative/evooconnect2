import React from "react";
import { Globe, LockKeyhole, Users } from "lucide-react";

export default function ProfilePosts({ userPosts, apiUrl }) {
  // Fungsi untuk menentukan ikon visibilitas berdasarkan status
  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return <Globe size={16} className="text-blue-600" />;
      case "private":
        return <LockKeyhole size={16} className="text-gray-600" />;
      case "connections":
        return <Users size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-lg mb-4">Your Posts</h3>
      {userPosts && userPosts.length > 0 ? (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="border rounded-lg p-4 shadow-sm bg-gray-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      post.user?.photo
                        ? `${apiUrl}/${post.user.photo}`
                        : "/default-user.png"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">
                      {post.user?.name || "Unknown User"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {/* Visibility Icon */}
                <div>{getVisibilityIcon(post.visibility)}</div>
              </div>
              {/* Content */}
              <p className="text-sm text-gray-700 mb-3">{post.content}</p>
              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={`${apiUrl}/${image}`}
                      alt={`Post Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No posts available.</p>
      )}
    </div>
  );
}