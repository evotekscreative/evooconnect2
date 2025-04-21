import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import companyProfile from "../../assets/img/company-profile.jpg";
import job1 from "../../assets/img/job1.png";

export default function CompanyProfile() {
    const [activeTab, setActiveTab] = useState("About");

    // State buat tombol Follow di Company Header
    const [isFollowingMain, setIsFollowingMain] = useState(false);

    // State untuk Follow di Similar Pages
    const [isFollowingAmazon, setIsFollowingAmazon] = useState(false);

    // State untuk Connect di People Also Viewed
    const [isConnectedSophia, setIsConnectedSophia] = useState(false);

    const tabs = ["About", "Update", "Jobs", "Reviews"];

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen">
                {/* Header Gambar */}
                <div className="relative">
                    <img
                        src={companyProfile}
                        alt="Company Header"
                        className="w-full h-60 object-cover"
                    />
                </div>

                {/* Company Info Section */}
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 bg-white rounded-md shadow -mt-8 relative z-10">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                            React Company
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                                alt="React Icon"
                                className="w-5 h-5"
                            />
                        </h1>
                        <p className="text-gray-500">
                            Informatika | Los Santos | 14,128,005 followers
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
                            Visit Website
                        </button>
                        <button
                            onClick={() => setIsFollowingMain(true)}
                            className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${
                                isFollowingMain
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {isFollowingMain ? " Followed" : "+ Follow"}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-md shadow px-6 py-4 max-w-screen-xl mx-auto mt-8">
                    <div className="flex space-x-8 border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-lg font-medium transition ${
                                    activeTab === tab
                                        ? "border-b-2 border-blue-500 text-blue-500"
                                        : "text-gray-600 hover:text-blue-500"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="mt-8 max-w-7xl mx-auto px-4">
                    {activeTab === "About" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Sidebar */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="flex flex-col items-center bg-white p-6 rounded-md shadow">
                                    <img
                                        src={job1}
                                        alt="Company Logo"
                                        className="w-40 h-40"
                                    />
                                    <h2 className="text-lg font-bold mt-4">Overview</h2>
                                    <p className="text-gray-600 text-center p-4">Pppppppppppp</p>
                                    <hr className="border-t-2 border-gray-300 my-4 w-full" />
                                    <div className="text-sm text-gray-800 mt-4 space-y-2 px-4 w-full">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">Common Connections:</span>
                                            <span className="text-cyan-400 font-semibold">358</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold">All Employees:</span>
                                            <span className="text-cyan-400 font-semibold">191,895</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-6 space-y-8">
                                {/* About */}
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-2xl font-semibold mb-4">About</h2>
                                    <hr className="py-2" />
                                    <p className="text-gray-700">Hallo</p>
                                </div>

                                {/* Overview */}
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                                    <hr className="py-2" />
                                    <ul className="space-y-2 text-gray-700">
                                        <li>
                                            <strong>Website:</strong>{" "}
                                            <a
                                                href="http://evoconnect.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                evoconnect.com
                                            </a>
                                        </li>
                                        <hr className="py-2" />
                                        <li><strong>Industry:</strong> Informatika</li>
                                        <hr className="py-2" />
                                        <li><strong>Company Size:</strong> 70 employees</li>
                                        <hr className="py-2" />
                                        <li><strong>Headquarters:</strong> Los Santos</li>
                                        <hr className="py-2" />
                                        <li><strong>Type:</strong> Public</li>
                                        <hr className="py-2" />
                                        <li><strong>Founded:</strong> 2025-03-14</li>
                                        <hr className="py-2" />
                                        <li><strong>Specialties:</strong> Speeeeeeeeeee</li>
                                    </ul>
                                </div>

                                {/* Location */}
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-2xl font-semibold mb-4">Location</h2>
                                    <hr className="py-2" />
                                    <div className="space-y-4">
                                        <div className="overflow-hidden rounded-md shadow">
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.0465791925447!2d74.3587!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483c8ebd7e5%3A0xe2c1dc0ed6f3dc47!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2sus!4v1614592644921!5m2!1sen!2sus"
                                                width="100%"
                                                height="200"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Location Map"
                                            ></iframe>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Postal Address</h3>
                                            <p className="text-gray-700">Karang Tengah</p>
                                        </div>
                                        <div>
                                            <a
                                                href="https://www.google.com/maps/dir/?api=1&destination=Karang%20Tengah"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M17.657 16.657L13.414 12.414l4.243-4.243m1.414 1.414L16.243 12l2.828 2.828M6 12h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z"
                                                    ></path>
                                                </svg>
                                                Get Directions
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="lg:col-span-3 space-y-10">
                                {/* Similar Pages */}
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-lg font-semibold mb-4">Similar Pages</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src="https://via.placeholder.com/40"
                                                    alt="Amazon"
                                                    className="w-10 h-10 rounded bg-gray-200"
                                                />
                                                <div>
                                                    <p className="font-medium">Amazon</p>
                                                    <p className="text-sm text-gray-400">Internet</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsFollowingAmazon(true)}
                                                className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${
                                                    isFollowingAmazon
                                                        ? "bg-green-500 hover:bg-green-600"
                                                        : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                            >
                                                {isFollowingAmazon ? " Followed" : "+ Follow"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* People Also Viewed */}
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-lg font-semibold mb-4">People Also Viewed</h2>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full bg-gray-200"
                                            />
                                            <div>
                                                <p className="font-medium">Sophia Lee</p>
                                                <p className="text-sm text-gray-400">@Harvard</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsConnectedSophia(true)}
                                            className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${
                                                isConnectedSophia
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : "bg-blue-500 hover:bg-blue-600"
                                            }`}
                                        >
                                            {isConnectedSophia ? " Connected" : "Connect"}
                                        </button>
                                    </div>
                                </div>

                                {/* Premium */}
                                <div className="bg-yellow-100 p-4 rounded-md text-center">
                                    <p className="font-bold text-lg mb-1">EVOConnect Premium</p>
                                    <p className="text-sm text-gray-700">Grow & nurture your network</p>
                                    <button className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-4 rounded">
                                        ACTIVATE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Tabs */}
                    {["Update", "Jobs", "Reviews"].includes(activeTab) && (
                        <div className="bg-white p-6 rounded-md shadow text-center text-gray-500">
                            No {activeTab} Yet.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
