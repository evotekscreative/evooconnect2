import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { User, Briefcase, FileText, Users } from "lucide-react";
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
                    {/* Navigation Card */}
                    <div className="w-full md:w-1/4 ">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-16">
                            <h2 className="font-semibold text-lg mb-4">Jump to Section</h2>
                            <nav className="space-y-2">
                                {results.users.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(usersRef)}
                                        className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                                    >
                                        <User className="mr-2 text-blue-500" size={16} />
                                        People ({results.users.length})
                                    </button>
                                )}
                                {results.groups.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(groupsRef)}
                                        className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                                    >
                                        <Users className="mr-2 text-green-500" size={16} />
                                        Groups ({results.groups.length})
                                    </button>
                                )}
                                {results.jobs.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(jobsRef)}
                                        className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                                    >
                                        <Briefcase className="mr-2 text-purple-500" size={16} />
                                        Jobs ({results.jobs.length})
                                    </button>
                                )}
                                {results.posts.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(postsRef)}
                                        className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                                    >
                                        <FileText className="mr-2 text-orange-500" size={16} />
                                        Posts ({results.posts.length})
                                    </button>
                                )}
                                {results.blogs.length > 0 && (
                                    <button
                                        onClick={() => scrollToSection(blogsRef)}
                                        className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                                    >
                                        <FileText className="mr-2 text-green-500" size={16} />
                                        Blogs ({results.blogs.length})
                                    </button>
                                )}
                            </nav>
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
                                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                                    <User className="mr-2 text-blue-500" size={20} />
                                                    People
                                                </h2>
                                                <div className="space-y-4">
                                                    {results.users.map(user => {
                                                        console.log(user);
                                                        return (
                                                            (
                                                                <Link
                                                                    to={`/profile/${user.username}`}
                                                                    key={user.id}
                                                                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                                >
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                                                                        {user.photo ? (
                                                                            <img
                                                                                src={`http://localhost:3000/${user.photo}`}
                                                                                alt={user.name}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {

                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                                                                {user.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-medium">{user.name}</h3>
                                                                        <p className="text-sm text-gray-600">{user.headline ?? "-"}</p>
                                                                    </div>
                                                                </Link>
                                                            )
                                                        )
                                                    })}
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
                                                        console.log(group)
                                                        return (
                                                            (
                                                                <Link
                                                                    to={`/groups/${group.id}`}
                                                                    key={group.id}
                                                                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
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
                                                            )
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