import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { User, Briefcase, FileText, Users, Search, ChevronRight } from "lucide-react";
import Case from "../components/Case";

const base_url = "http://localhost:3000";

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const query = searchParams.get("q");
    const [results, setResults] = useState({
        users: [],
        groups: [],
        jobs: [],
        posts: [],
        blogs: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchInput, setSearchInput] = useState(query || "");

    // Refs for each section
    const usersRef = useRef(null);
    const groupsRef = useRef(null);
    const jobsRef = useRef(null);
    const postsRef = useRef(null);
    const blogsRef = useRef(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;

            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${base_url}/api/search?q=${encodeURIComponent(query)}&type=all&limit=10&offset=0`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const data = response.data.data;

                setResults({
                    users: data.users || [],
                    groups: data.groups || [],
                    jobs: data.jobs || [],
                    posts: data.posts || [],
                    blogs: data.blogs || []
                });

                console.log(results);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setError("Failed to fetch search results. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        console.log(query);

        fetchSearchResults();
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
        }
    };

    const handleJoinGroup = async (groupId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${base_url}/api/groups/${groupId}/join`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update the local state to reflect the change
            setResults(prev => ({
                ...prev,
                groups: prev.groups.map(group =>
                    group.id === groupId
                        ? { ...group, is_member: true, member_count: group.member_count + 1 }
                        : group
                )
            }));

        } catch (error) {
            console.error("Error joining group:", error);
            // You might want to show an error message to the user
        }
    };

    const handleConnect = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${base_url}/api/users/${userId}/connect`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update the local state to reflect the connection request
            setResults(prev => ({
                ...prev,
                users: prev.users.map(user =>
                    user.id === userId
                        ? { ...user, connection_status: "pending" }
                        : user
                )
            }));

        } catch (error) {
            console.error("Error sending connection request:", error);
        }
    };

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    };

    const totalResults =
        results.users.length +
        results.groups.length +
        results.jobs.length +
        results.posts.length +
        results.blogs.length;

    return (
        <Case>
            <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
                    {/* Enhanced Navigation Sidebar */}
                    <div className="w-full lg:w-80">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">In This Page </h2>
                            </div>

                            <div className="space-y-3">
                                {results.users.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(usersRef)}
                                        className="group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border-2 border-transparent hover:border-blue-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900">People</span>
                                                <p className="text-sm text-gray-500">{results.users.length} results</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                )}

                                {results.groups.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(groupsRef)}
                                        className="group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 border-2 border-transparent hover:border-green-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                                <Users className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900">Groups</span>
                                                <p className="text-sm text-gray-500">{results.groups.length} results</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                )}

                                {results.jobs.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(jobsRef)}
                                        className="group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border-2 border-transparent hover:border-purple-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                                <Briefcase className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900">Jobs</span>
                                                <p className="text-sm text-gray-500">{results.jobs.length} results</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                )}

                                {results.posts.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(postsRef)}
                                        className="group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 border-2 border-transparent hover:border-orange-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                                <FileText className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900">Posts</span>
                                                <p className="text-sm text-gray-500">{results.posts.length} results</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                )}

                                {results.blogs.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(blogsRef)}
                                        className="group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200 border-2 border-transparent hover:border-teal-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                                                <FileText className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900">Blogs</span>
                                                <p className="text-sm text-gray-500">{results.blogs.length} results</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                )}
                            </div>

                            {totalResults === 0 && !loading && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No sections to navigate</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-2xl font-bold mb-2">Search Results for "{query}"</h1>
                            <p className="text-gray-600 mb-6">{totalResults} results found</p>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                            ) : totalResults === 0 ? (
                                <div className="bg-white p-8 rounded-lg text-center">
                                    <p className="text-lg text-gray-600">No results found for "{query}"</p>
                                    <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
                                </div>
                            ) : (
                                <>
                                    {/* Tabs */}
                                    <div className="flex overflow-x-auto mb-6 bg-white rounded-lg p-2">
                                        <button
                                            onClick={() => setActiveTab("all")}
                                            className={`px-4 py-2 rounded-md ${activeTab === "all" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
                                        >
                                            All ({totalResults})
                                        </button>
                                        {results.users.length > 0 && (
                                            <button
                                                onClick={() => setActiveTab("users")}
                                                className={`px-4 py-2 rounded-md ${activeTab === "users" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
                                            >
                                                People ({results.users.length})
                                            </button>
                                        )}
                                        {results.groups.length > 0 && (
                                            <button
                                                onClick={() => setActiveTab("groups")}
                                                className={`px-4 py-2 rounded-md ${activeTab === "groups" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
                                            >
                                                Groups ({results.groups.length})
                                            </button>
                                        )}
                                        {results.jobs.length > 0 && (
                                            <button
                                                onClick={() => setActiveTab("jobs")}
                                                className={`px-4 py-2 rounded-md ${activeTab === "jobs" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
                                            >
                                                Jobs ({results.jobs.length})
                                            </button>
                                        )}
                                        {results.posts.length > 0 && (
                                            <button
                                                onClick={() => setActiveTab("posts")}
                                                className={`px-4 py-2 rounded-md ${activeTab === "posts" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
                                            >
                                                Posts ({results.posts.length})
                                            </button>
                                        )}

                                        {results.blogs.length > 0 && (
                                            <button
                                                onClick={() => setActiveTab("blogs")}
                                                className={`px-4 py-2 rounded-md ${activeTab === "blogs" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
                                            >
                                                Blogs ({results.blogs.length})
                                            </button>
                                        )}
                                    </div>

                                    {/* Results */}
                                    <div className="space-y-6">
                                        {/* People Results */}
                                        {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
                                            <div ref={usersRef} className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-semibold text-black flex items-center">
                                                        <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                                            <User className="w-5 h-5 text-blue-500" />
                                                        </div>
                                                        People ({results.users.length})
                                                    </h2>
                                                </div>
                                                <div className="p-6">
                                                    <div className="space-y-4">
                                                        {results.users.map(user => (
                                                            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-100 group">
                                                                <Link
                                                                    to={`/profile/${user.username}`}
                                                                    className="flex items-center flex-1"
                                                                >
                                                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4 ring-4 ring-white shadow-lg">
                                                                        {user.photo ? (
                                                                            <img
                                                                                src={`http://localhost:3000/${user.photo}`}
                                                                                alt={user.name}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => { }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl font-bold">
                                                                                {user.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</h3>
                                                                        <p className="text-gray-600 mt-1">{user.headline || "No headline available"}</p>
                                                                    </div>
                                                                </Link>

                                                                {/* Connection Button based on connection status */}
                                                                {user.is_connected ? (
                                                                    <button
                                                                        className="ml-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold border-2 border-gray-200"
                                                                        disabled
                                                                    >
                                                                        Connected
                                                                    </button>
                                                                ) : user.connection_status === "pending" ? (
                                                                    <button
                                                                        className="ml-4 px-6 py-2 bg-yellow-100 text-yellow-600 rounded-lg font-semibold border-2 border-yellow-200"
                                                                        disabled
                                                                    >
                                                                        Pending
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleConnect(user.id);
                                                                        }}
                                                                    >
                                                                        Connect
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Groups Results */}
                                        {(activeTab === "all" || activeTab === "groups") && results.groups.length > 0 && (
                                            <div ref={groupsRef} className="bg-white rounded-lg p-4">
                                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                                    <Users className="mr-2 text-green-500" size={20} />
                                                    Groups
                                                </h2>
                                                <div className="space-y-4">
                                                    {results.groups.map(group => {
                                                        return (
                                                            <div key={group.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                                <Link
                                                                    to={`/groups/${group.name}`}
                                                                    className="flex items-center flex-1"
                                                                >
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                                                                        {group.image ? (
                                                                            <img
                                                                                src={`${base_url}/${group.image}`}
                                                                                alt={group.name}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.src = "/default-group.png";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-500">
                                                                                {group.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-medium">{group.name}</h3>
                                                                        <p className="">{group.member_count || 0} members</p>
                                                                        <p className="text-sm text-gray-600">{group.description}</p>
                                                                    </div>
                                                                </Link>

                                                                {/* Join/Joined Button based on is_member status */}
                                                                {group.is_member ? (
                                                                    <button
                                                                        className="ml-4 px-4 py-1 bg-gray-200 text-gray-700 rounded-md font-medium"
                                                                        disabled
                                                                    >
                                                                        Joined
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="ml-4 px-4 py-1 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleJoinGroup(group.id);
                                                                        }}
                                                                    >
                                                                        Join
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Jobs Results */}
                                        {(activeTab === "all" || activeTab === "jobs") && results.jobs.length > 0 && (
                                            <div ref={jobsRef} className="bg-white rounded-lg p-4">
                                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                                    <Briefcase className="mr-2 text-purple-500" size={20} />
                                                    Jobs
                                                </h2>
                                                <div className="space-y-4">
                                                    {results.jobs.map(job => (
                                                        <Link
                                                            to={`/jobs/${job.id}`}
                                                            key={job.id}
                                                            className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 mr-4 flex items-center justify-center">
                                                                {job.company_logo ? (
                                                                    <img
                                                                        src={`${base_url}/${job.company_logo}`}
                                                                        alt={job.company_name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.src = "/default-company.png";
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Briefcase size={24} className="text-purple-500" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium">{job.title}</h3>
                                                                <p className="text-sm text-gray-600">{job.company_name}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{job.location}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Blogs Results */}
                                        {(activeTab === "all" || activeTab === "blogs") && results.blogs.length > 0 && (
                                            <div ref={blogsRef} className="bg-white rounded-lg p-4">
                                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                                    <FileText className="mr-2 text-green-500" size={20} />
                                                    Blogs
                                                </h2>
                                                <div className="space-y-4">
                                                    {results.blogs.map(blog => (
                                                        <Link
                                                            to={`/blog/${blog.id}`}
                                                            key={blog.id}
                                                            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <h3 className="font-medium">{blog.title}</h3>
                                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                                {blog.content}
                                                            </p>
                                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                <span>By {blog.user?.name || "Unknown"}</span>
                                                                <span className="mx-2">•</span>
                                                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Posts Results */}
                                        {(activeTab === "all" || activeTab === "posts") && results.posts.length > 0 && (
                                            <div ref={postsRef} className="bg-white rounded-lg p-4">
                                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                                    <FileText className="mr-2 text-orange-500" size={20} />
                                                    Posts
                                                </h2>
                                                <div className="space-y-4">
                                                    {results.posts.map(post => (
                                                        <Link
                                                            to={`/posts/${post.id}`}
                                                            key={post.id}
                                                            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <h3 className="font-medium">{post.title || "Post"}</h3>
                                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                                {post.content || "No content"}
                                                            </p>
                                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                <span>By {post.user?.name || "Unknown"}</span>
                                                                <span className="mx-2">•</span>
                                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Case>
    );
}