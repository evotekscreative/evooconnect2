import React, { useState, useRef } from 'react';
import { MessageSquare, Heart, Share2, Image } from 'lucide-react';

const PostTab = ({ posts, onAddPost }) => {
    const [postContent, setPostContent] = useState('');
    const fileInputRef = useRef(null);

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (postContent.trim()) {
            onAddPost(postContent);
            setPostContent('');
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Selected file:", file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
            {/* Create Post Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Post</h2>

                <form onSubmit={handlePostSubmit}>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="What's on your mind?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                    />

                    <div className="flex justify-between items-center mt-4">
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                hidden
                            />
                            <button
                                type="button"
                                onClick={handlePhotoClick}
                                className="flex items-center text-gray-600 hover:text-blue-500"
                            >
                                <Image className="h-5 w-5 mr-1" />
                                Photo
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="bg-primary hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Post (1 Card) */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4">Recent Post</h2>

                {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No posts yet
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start mb-3">
                            <img
                                src="https://via.placeholder.com/40"
                                alt="User"
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <div className="font-medium">{posts[0].author}</div>
                                <div className="text-xs text-gray-500">{posts[0].date}</div>
                            </div>
                        </div>
                        <p className="text-gray-800 mb-3">{posts[0].content}</p>

                        <div className="text-xs text-gray-500 mb-3 border-b border-gray-200 pb-3">
                            {posts[0].likes} likes • {posts[0].comments} comments
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
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostTab;
