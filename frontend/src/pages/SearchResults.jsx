import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  User,
  Briefcase,
  FileText,
  Users,
  Search,
  ChevronRight,
} from "lucide-react";
import Case from "../components/Case";

const base_url =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get("q");
  const [results, setResults] = useState({
    users: [],
    groups: [],
    jobs: [],
    posts: [],
    blogs: [],
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

  // Tambahkan state untuk loading dan requested pada grup
  const [groupLoading, setGroupLoading] = useState({});
  const [groupRequested, setGroupRequested] = useState({});

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${base_url}/api/search?q=${encodeURIComponent(
            query
          )}&type=all&limit=10&offset=0`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data.data;

        setResults({
          users: data.users || [],
          groups: data.groups || [],
          jobs: data.jobs || [],
          posts: data.posts || [],
          blogs: data.blogs || [],
        });

        // console.log("Search Results:", data);
        // console.log(results);
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

  // Update handleJoinGroup to only handle API, not UI state
  const handleJoinGroup = async (groupId) => {
    setGroupLoading((prev) => ({ ...prev, [groupId]: true }));
    // Simulasi loading 2 detik
    setTimeout(() => {
      setGroupLoading((prev) => ({ ...prev, [groupId]: false }));
      setGroupRequested((prev) => ({ ...prev, [groupId]: true }));
    }, 2000);
    // Jika ingin request ke API, bisa tambahkan di sini
    // await axios.post(...);
  };

  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${base_url}/api/users/${userId}/connect`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the local state to reflect the connection request
      setResults((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === userId ? { ...user, connection_status: "pending" } : user
        ),
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Search Results
                </h1>
                <p className="text-gray-600 mt-1 text-s">
                  Found{" "}
                  <span className="font-semibold text-blue-600">
                    {totalResults}
                  </span>{" "}
                  results for
                  <span className="font-semibold text-gray-900">
                    {" "}
                    "{query}"
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Enhanced Navigation Sidebar */}
            <div className="w-full lg:w-80">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Quick Navigation
                  </h2>
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
                          <span className="font-semibold text-gray-900">
                            People
                          </span>
                          <p className="text-sm text-gray-500">
                            {results.users.length} results
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                    </button>
                  )}

                  {results.groups.length > 0 && (
                    <button
                      onClick={() => scrollToSection(groupsRef)}
                      className="group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50 transition-all duration-200 border-2 border-transparent hover:border-blue-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            Groups
                          </span>
                          <p className="text-sm text-gray-500">
                            {results.groups.length} results
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-sky-500 transform group-hover:translate-x-1 transition-all" />
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
                          <span className="font-semibold text-gray-900">
                            Jobs
                          </span>
                          <p className="text-sm text-gray-500">
                            {results.jobs.length} results
                          </p>
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
                          <span className="font-semibold text-gray-900">
                            Posts
                          </span>
                          <p className="text-sm text-gray-500">
                            {results.posts.length} results
                          </p>
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
                          <span className="font-semibold text-gray-900">
                            Blogs
                          </span>
                          <p className="text-sm text-gray-500">
                            {results.blogs.length} results
                          </p>
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
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                  <p className="text-gray-600 text-lg">
                    Searching for results...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No results found
                  </h3>
                  <p className="text-gray-600 text-lg mb-2">
                    We couldn't find anything for "{query}"
                  </p>
                  <p className="text-gray-500">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : (
                <>
                  {/* Enhanced Tabs */}
                  <div className="bg-white rounded-xl shadow-lg p-2 mb-8 overflow-x-auto">
                    <div className="flex space-x-2 min-w-max">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          activeTab === "all"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        All ({totalResults})
                      </button>
                      {results.users.length > 0 && (
                        <button
                          onClick={() => setActiveTab("users")}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === "users"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          People ({results.users.length})
                        </button>
                      )}
                      {results.groups.length > 0 && (
                        <button
                          onClick={() => setActiveTab("groups")}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === "groups"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Groups ({results.groups.length})
                        </button>
                      )}
                      {results.jobs.length > 0 && (
                        <button
                          onClick={() => setActiveTab("jobs")}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === "jobs"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Jobs ({results.jobs.length})
                        </button>
                      )}
                      {results.posts.length > 0 && (
                        <button
                          onClick={() => setActiveTab("posts")}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === "posts"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Posts ({results.posts.length})
                        </button>
                      )}
                      {results.blogs.length > 0 && (
                        <button
                          onClick={() => setActiveTab("blogs")}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === "blogs"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Blogs ({results.blogs.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results Sections */}
                  <div className="space-y-8">
                    {/* People Results */}
                    {(activeTab === "all" || activeTab === "users") &&
                      results.users.length > 0 && (
                        <div
                          ref={usersRef}
                          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              People ({results.users.length})
                            </h2>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              {results.users.map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-100 group"
                                >
                                  <Link
                                    to={`/user-profile/${user.username}`}
                                    className="flex items-center flex-1"
                                  >
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4 ring-4 ring-white shadow-lg">
                                      {user.photo ? (
                                        <img
                                          src={`${base_url}/${user.photo}`}
                                          alt={user.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {}}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white text-xl font-bold">
                                          {user.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {user.name}
                                      </h3>
                                      <p className="text-gray-600 mt-1">
                                        {user.headline ||
                                          "No headline available"}
                                      </p>
                                    </div>
                                  </Link>

                                  {/* Connection Button based on connection status */}
                                  {user.is_connected ? (
                                    <button
                                      className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:bg-blue-700 text-white  rounded-lg font-semibold border-2 border-gray-200"
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
                                      className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white rounded-lg font-semibold hover:from-blue-600 to-cyan-500 hover:bg transform hover:scale-105 transition-all duration-200 shadow-lg"
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
                    {(activeTab === "all" || activeTab === "groups") &&
                      results.groups.length > 0 && (
                        <div
                          ref={groupsRef}
                          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              Groups ({results.groups.length})
                            </h2>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              {results.groups.map((group) => (
                                <div
                                  key={group.id}
                                  className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-100 group"
                                >
                                  <Link
                                    to={`/groups/${group.id}`}
                                    className="flex items-center flex-1"
                                  >
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4 ring-4 ring-white shadow-lg">
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
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white text-xl font-bold">
                                          {group.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg text-gray-900 group-hover:text--600 transition-colors">
                                        {group.name}
                                      </h3>
                                      <p className="text-sky-600 font-semibold">
                                        {group.member_count || 0} members
                                      </p>
                                      <p className="text-gray-600 mt-1 line-clamp-2">
                                        {group.description}
                                      </p>
                                    </div>
                                  </Link>

                                  {/* Button logic */}
                                  {groupRequested[group.id] ? (
                                    <button
                                      className="ml-4 px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold border-2 border-gray-200 cursor-not-allowed"
                                      disabled
                                    >
                                      Requested
                                    </button>
                                  ) : groupLoading[group.id] ? (
                                    <button
                                      className="ml-4 px-6 py-2 bg-gray-100 text-gray-500 rounded-lg font-semibold border-2 border-gray-200 flex items-center gap-2 cursor-wait"
                                      disabled
                                    >
                                      <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                      </svg>
                                      Joining Group...
                                    </button>
                                  ) : (
                                    <button
                                      className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleJoinGroup(group.id);
                                      }}
                                    >
                                      Join Group
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Jobs Results */}
                    {(activeTab === "all" || activeTab === "jobs") &&
                      results.jobs.length > 0 && (
                        <div
                          ref={jobsRef}
                          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                <Briefcase className="w-5 h-5 text-white" />
                              </div>
                              Jobs ({results.jobs.length})
                            </h2>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              {results.jobs.map((job) => (
                                <Link
                                  to={`/jobs/${job.id}`}
                                  key={job.id}
                                  className="flex items-center p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-purple-100 group"
                                >
                                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 mr-4 flex items-center justify-center ring-4 ring-white shadow-lg">
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
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                                        <Briefcase
                                          size={24}
                                          className="text-white"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                                      {job.title}
                                    </h3>
                                    <p className="text-purple-600 font-semibold">
                                      {job.company_name}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                      {job.location}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Blogs Results */}
                    {(activeTab === "all" || activeTab === "blogs") &&
                      results.blogs.length > 0 && (
                        <div
                          ref={blogsRef}
                          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              Blogs ({results.blogs.length})
                            </h2>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              {results.blogs.map((blog) => (
                                <Link
                                  to={`/blog-detail/${blog.slug}`}
                                  key={blog.id}
                                  className="block p-4 bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-100 group"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                        {blog.title}
                                      </h3>
                                      <p className="text-gray-600 line-clamp-3 mb-3 leading-relaxed ">
                                        {blog.content
                                          ? blog.content.length > 100
                                            ? blog.content
                                                .substring(0, 100)
                                                .replace(/<[^>]*>/g, "") + "..."
                                            : blog.content.replace(
                                                /<[^>]*>/g,
                                                ""
                                              )
                                          : "No content"}
                                      </p>
                                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                                        <span className="flex items-center">
                                          <User className="w-4 h-4 mr-1" />
                                          {blog.user?.name || "Unknown"}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          {new Date(
                                            blog.created_at
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all ml-4" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Posts Results */}
                    {(activeTab === "all" || activeTab === "posts") &&
                      results.posts.length > 0 && (
                        <div
                          ref={postsRef}
                          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              Posts ({results.posts.length})
                            </h2>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              {results.posts.map((post) => (
                                <Link
                                  to={`/post/${post.id}`}
                                  key={post.id}
                                  className="block p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-sky-100 group"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-sky-600 transition-colors mb-2">
                                        {post.title || "Post"}
                                      </h3>
                                      <p className="text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                                        {post.content
                                          ? post.content.length > 100
                                            ? post.content
                                                .substring(0, 100)
                                                .replace(/<[^>]*>/g, "") + "..."
                                            : post.content.replace(
                                                /<[^>]*>/g,
                                                ""
                                              )
                                          : "No content"}
                                      </p>
                                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                                        <span className="flex items-center">
                                          <User className="w-4 h-4 mr-1" />
                                          {post.user?.name || "Unknown"}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          {new Date(
                                            post.created_at
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all ml-4" />
                                  </div>
                                </Link>
                              ))}
                            </div>
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
