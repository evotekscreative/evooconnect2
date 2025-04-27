import React from "react";
import { useState } from "react";
import { MessageCircle, Share2, Send, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
    Users, Clock, Bookmark, GraduationCap, Building,
    Facebook, Twitter, Linkedin, Github, Instagram, MapPin
} from "lucide-react";
import Case from "../components/Case.jsx";

const PostPage = () => {
    // Mock data for the sidebar (you can replace with actual data from props or state)
    const [profileImage] = useState("https://i.pravatar.cc/48");
    const [fullName] = useState("Muhammad Bintang Asyidqy");
    const [headline] = useState("Internship at PT.Evolusi Teknologi Solusi | Fullstack Web Developer");
    const [skills] = useState(["JavaScript", "React", "Node.js", "HTML", "CSS"]);
    const [socialMedia] = useState({
        instagram: "bintang_asyidqy",
        github: "bintangasyidqy",
        linkedin: "bintangasyidqy"
    });

    return (
        <div className="bg-[#EDF3F7] min-h-screen">
            {/* Navbar would be here if you have one */}
            <Case />

            {/* Header */}

            {/* Content */}
            <div className="w-full mx-auto py-6 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-center">
                    {/* Left Sidebar - Perbesar */}
                    <div className="w-full md:w-2/5 space-y-4">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="relative w-28 h-28 mx-auto bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="font-bold text-xl mt-4">{fullName}</h2>
                            <p className="text-base text-gray-500">{headline}</p>

                            <div className="mt-5 space-y-2 text-left">
                                <Link to="/list-connection" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                    <span className="flex items-center gap-2 text-base"><Users size={18} /> Connections</span>
                                    <span className="font-bold text-lg">358</span>
                                </Link>
                                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                    <span className="flex items-center gap-2 text-base"><Clock size={18} /> Views</span>
                                    <span className="font-bold text-lg">85</span>
                                </div>
                                <Link to="/job-saved" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                    <span className="flex items-center gap-2 text-base"><Bookmark size={18} /> Job Saved</span>
                                    <span className="font-bold text-lg">120</span>
                                </Link>
                            </div>

                            <button className="text-blue-600 text-base mt-5">Log Out</button>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-semibold text-lg">Skills</h3>
                            {skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-base text-gray-500 mt-1">No skills added yet.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-semibold text-lg mb-2">Social Media</h3>
                            {Object.keys(socialMedia).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(socialMedia).map(([platform, username]) => (
                                        <div key={platform} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-md">
                                            {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                                            {platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-500" />}
                                            {platform === 'twitter' && <Twitter className="w-5 h-5 text-blue-400" />}
                                            {platform === 'linkedin' && <Linkedin className="w-5 h-5 text-blue-700" />}
                                            {platform === 'github' && <Github className="w-5 h-5 text-black" />}
                                            <span className="text-base">@{username}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-base text-gray-500">No social media added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Main Post Content */}
                    <div className="w-full md:w-2/5">
                        <div className="bg-white border rounded-lg shadow-sm p-4">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                <img
                                    src="https://i.pravatar.cc/48"
                                    alt="profile"
                                    className="rounded-full w-12 h-12"
                                />
                                <div>
                                    <h2 className="font-semibold text-sm">Muhammad Bintang Asyidqy</h2>
                                    <p className="text-xs text-gray-500">
                                        Pt Evolusi Teknologi Solusi | Fullstack Web Developer
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">2mgg • 🌐</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="mt-3 text-sm">
                                <p className="text-gray-700">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                                    <img
                                        src="https://i.imgur.com/jR3yN6J.png"
                                        alt="Code example"
                                        className="mt-2 w-full rounded-lg border"
                                    />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-4 text-gray-600 text-sm mt-3">
                                <button className="flex items-center gap-1 hover:text-blue-600">
                                    <ThumbsUp size={16} /> Suka
                                </button>
                                <button className="flex items-center gap-1 hover:text-blue-600">
                                    <MessageCircle size={16} /> Komentar
                                </button>
                                <button className="flex items-center gap-1 hover:text-blue-600">
                                    <Share2 size={16} /> Bagikan
                                </button>
                            </div>
                        </div>

                    </div>
                    {/* Right Sidebar */}
                    <div className="w-full md:w-1/3 pl-4">
                        {/* People You Might Know */}
                        <div className="bg-white rounded-lg shadow mb-4 p-3">
                            <h3 className="font-medium text-sm mb-3">People you might know</h3>

                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-2">
                                    <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">Bintang Asydqi</div>
                                    <div className="text-gray-500 text-xs">Student at Alexander</div>
                                </div>
                                <div className="text-blue-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Premium Banner */}
                        <div className="bg-white rounded-lg shadow mb-4 p-3">
                            <div className="mb-2">
                                <img src="/" alt="Premium" className="w-full rounded" />
                            </div>
                            <h3 className="font-bold text-base text-yellow-500 text-center mb-1">EVOConnect Premium</h3>
                            <p className="text-gray-600 text-xs text-center mb-3">Grow & nurture your network</p>
                            <button className="w-full border border-yellow-500 text-yellow-500 py-1.5 rounded-lg font-medium text-sm">
                                ACTIVATE
                            </button>
                        </div>
                        {/* Jobs */}
                        <div className="bg-white rounded-lg shadow p-3">
                            <h3 className="font-medium text-sm mb-3">Jobs</h3>
                            <div className="mb-4">
                                <div className='bg-gray-100 p-4 rounded-lg '>
                                    <div className="flex justify-between mb-1">
                                        <h3 className="font-semibold">Product Director</h3>
                                        <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                                            <img src="/api/placeholder/24/24" alt="Company Logo" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <p className="text-blue-500">Spotify Inc.</p>
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <MapPin size={14} className="mr-1" />
                                        <span>India, Punjab</span>
                                    </div>
                                    <div className="mt-2 flex items-center">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                                        </div>
                                        <span className="text-gray-600 text-sm ml-2">18 connections</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;