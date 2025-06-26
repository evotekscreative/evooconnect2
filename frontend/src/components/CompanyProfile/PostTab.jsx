import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Share2, Image, Globe, Users, CircleHelp, EllipsisVertical } from 'lucide-react';

const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const PostTab = ({ companyId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(null);

    // Edit state
    const [editPostId, setEditPostId] = useState(null);
    const [editContent, setEditContent] = useState('');

    // Form state
    const [postContent, setPostContent] = useState('');
    const [postVisibility, setPostVisibility] = useState('public');
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, [companyId]);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${apiUrl}/api/companies/${companyId}/posts?limit=10&offset=0`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch posts');
            const data = await response.json();
            let postsArr = [];
            if (Array.isArray(data?.data?.posts)) postsArr = data.data.posts;
            else if (Array.isArray(data?.data)) postsArr = data.data;
            else if (Array.isArray(data)) postsArr = data;
            else postsArr = [];
            const formattedPosts = postsArr.map(post => ({
                id: post.id || Math.random().toString(36).substring(2, 9),
                content: post.content || '',
                author: post.creator
                    ? {
                        name: post.creator.name || "Anonymous",
                        avatar: post.creator.photo
                            ? (post.creator.photo.startsWith("http") ? post.creator.photo : `${apiUrl}/${post.creator.photo}`)
                            : "https://via.placeholder.com/40"
                    }
                    : {
                        name: "Anonymous",
                        avatar: "https://via.placeholder.com/40"
                    },
                createdAt: post.created_at || post.createdAt || new Date().toISOString(),
                images: post.images || [],
                likesCount: post.likes_count || post.likesCount || 0,
                commentsCount: post.comments_count || post.commentsCount || 0,
                visibility: post.visibility || 'public',
                status: post.status || 'published'
            }));
            setPosts(formattedPosts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!postContent.trim()) return;
        setPosting(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('content', postContent);
            formData.append('visibility', postVisibility);
            formData.append('status', 'published');
            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await fetch(
                `${apiUrl}/api/companies/${companyId}/posts`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            fetchPosts();
            setPostContent('');
            setImages([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setPosting(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleVisibilityChange = (visibility) => {
        setPostVisibility(visibility);
    };

    const getVisibilityLabel = (type) => {
        switch (type) {
            case 'public': return 'Public';
            case 'connections': return 'Connections';
            default: return '';
        }
    };

    // EDIT handler
    const handleEdit = (postId) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            setEditPostId(postId);
            setEditContent(post.content);
            setShowMenu(null);
        }
    };

    const handleEditCancel = () => {
        setEditPostId(null);
        setEditContent('');
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) return;
        setPosting(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const post = posts.find(p => p.id === editPostId);

            const formData = new FormData();
            formData.append('content', editContent);
            formData.append('visibility', post?.visibility || 'public');
            formData.append('status', post?.status || 'published');
            // Jika ingin edit gambar juga, tambahkan images baru di sini
            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await fetch(
                `${apiUrl}/api/company-posts/${editPostId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // Jangan pakai Content-Type, biarkan browser set otomatis untuk FormData
                    },
                    body: formData
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to edit post');
            }
            setEditPostId(null);
            setEditContent('');
            fetchPosts();
        } catch (err) {
            setError(err.message);
        } finally {
            setPosting(false);
        }
    };

    // DELETE handler 
    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            setShowMenu(null);
            return;
        }
        setPosting(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${apiUrl}/api/company-posts/${postId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete post');
            }
            fetchPosts();
        } catch (err) {
            setError(err.message);
        } finally {
            setPosting(false);
            setShowMenu(null);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
            {/* Create Post Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Post</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handlePostSubmit}>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="What's on your mind?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        disabled={posting}
                    />

                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-4">
                            {/* Visibility Options */}
                            <div className="flex items-center space-x-2">
                                {[
                                    ["public", <Globe size={14} />],
                                    ["connections", <Users size={14} />],
                                ].map(([type, icon]) => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => handleVisibilityChange(type)}
                                        className={`p-1 rounded-full cursor-pointer transition ${postVisibility === type
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-600"
                                            }`}
                                        aria-label={getVisibilityLabel(type)}
                                        disabled={posting}
                                    >
                                        {icon}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-blue-500"
                                    aria-label="Visibility help"
                                >
                                    <CircleHelp size={14} />
                                </button>
                            </div>

                            {/* Photo Upload Button */}
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    multiple
                                    hidden
                                    accept="image/*"
                                    disabled={posting}
                                />
                                <button
                                    type="button"
                                    onClick={handlePhotoClick}
                                    className="flex items-center text-gray-600 hover:text-blue-500"
                                    disabled={posting}
                                >
                                    <Image className="h-5 w-5 mr-1" />
                                    Photo
                                </button>
                                {images.length > 0 && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        {images.length} image{images.length > 1 ? 's' : ''} selected
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-primary hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition duration-200"
                            disabled={posting || !postContent.trim()}
                        >
                            {posting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>

                {loading && posts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Loading posts...</div>
                )}

                {posts.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        No posts yet. Be the first to share!
                    </div>
                )}

                {posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 mb-4 relative">
                        {/* EllipsisVertical menu */}
                        <div className="absolute top-2 right-2">
                            <button
                                className="p-1 rounded-full hover:bg-gray-200"
                                onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                            >
                                <EllipsisVertical size={20} />
                            </button>
                            {showMenu === post.id && (
                                <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                        onClick={() => handleEdit(post.id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                        onClick={() => handleDelete(post.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-start mb-3">
                            {post.author.avatar && post.author.avatar !== "https://via.placeholder.com/40" ? (
                                <img
                                    src={post.author.avatar.startsWith("http") ? post.author.avatar : `${apiUrl}/${post.author.avatar}`}
                                    alt={post.author.name}
                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-grey-600 font-semibold text-lg uppercase select-none">
                                    {post.author.name
                                        ? post.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                                        : "U"}
                                </div>
                            )}
                            <div>
                                <div className="font-medium">{post.author.name}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(post.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        {editPostId === post.id ? (
                            <div>
                                <textarea
                                    className="w-full p-2 border rounded mb-2"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    disabled={posting}
                                />
                                <div className="flex gap-2">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                        onClick={handleEditSave}
                                        disabled={posting}
                                        type="button"
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                                        onClick={handleEditCancel}
                                        disabled={posting}
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-800 mb-3 whitespace-pre-line">
                                    {post.content}
                                </p>
                                {post.images && post.images.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto">
                                        {post.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={
                                                    image.url
                                                        ? (image.url.startsWith("http") ? image.url : `${apiUrl}/${image.url}`)
                                                        : (typeof image === "string"
                                                            ? (image.startsWith("http") ? image : `${apiUrl}/${image}`)
                                                            : "")
                                                }
                                                alt={`Post ${index}`}
                                                className="h-32 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        <div className="text-xs text-gray-500 mb-3 border-b border-gray-200 pb-3">
                            {post.likesCount} likes • {post.commentsCount} comments
                        </div>
                        <div className="flex justify-between">
                            <button className="flex items-center text-gray-500 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-100">
                                <Heart className="h-4 w-4 mr-1" />
                                Like
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-100">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Comment
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-100">
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostTab;