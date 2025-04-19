import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import companyProfile from "../../assets/img/company-profile.jpg";
import { Search } from "lucide-react";

export default function CompanyProfile() {
    const [activeTab, setActiveTab] = useState("About");

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
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-4 bg-white rounded-md shadow -mt-8 relative z-10">
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
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">
                            + Follow
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-md shadow px-6 py-4 max-w-6xl mx-auto mt-8">
                    <div className="flex space-x-8 border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-lg font-medium transition ${activeTab === tab
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
                                        src="https://via.placeholder.com/100"
                                        alt="Company Logo"
                                        className="w-24 h-24"
                                    />
                                    <h2 className="text-lg font-bold mt-4">Overview</h2>
                                    <p className="text-gray-600 text-center">
                                        Ppppppppppppppppppppppppppppppp
                                    </p>
                                    <div className="text-sm text-gray-500 mt-4">
                                        <p><strong>Common Connections:</strong> 358</p>
                                        <p><strong>All Employees:</strong> 191,895</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-6 space-y-8">
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-2xl font-semibold mb-4">About</h2>
                                    <p className="text-gray-700">Hallo</p>
                                </div>
                                <div className="bg-white p-6 rounded-md shadow">
                                    <h2 className="text-2xl font-semibold mb-4">Overview</h2>
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
                                        <li><strong>Industry:</strong> Informatika</li>
                                        <li><strong>Company Size:</strong> 70 employees</li>
                                        <li><strong>Headquarters:</strong> Los Santos</li>
                                        <li><strong>Type:</strong> Public</li>
                                        <li><strong>Founded:</strong> 2025-03-14</li>
                                        <li><strong>Specialties:</strong> Speeeeeeeeeee</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="lg:col-span-3 space-y-10">
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
                                            <button className="text-blue-500 hover:underline text-sm">
                                                + Follow
                                            </button>
                                        </div>
                                    </div>
                                </div>

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
                                        <button className="text-blue-500 hover:underline text-sm">
                                            Connect
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-yellow-100 p-4 rounded-md text-center">
                                    <p className="font-bold text-lg mb-1">EVOConnect Premium</p>
                                    <p className="text-sm text-gray-700">
                                        Grow & nurture your network
                                    </p>
                                    <button className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-4 rounded">
                                        ACTIVATE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs Lain */}
                    {activeTab === "Update" && (
                        <div className="bg-white p-6 rounded-md shadow text-center text-gray-500">
                            No Updates Yet.
                        </div>
                    )}
                    {activeTab === "Jobs" && (
                        <div className="bg-white p-6 rounded-md shadow text-center text-gray-500">
                            No Jobs Available.
                        </div>
                    )}
                    {activeTab === "Reviews" && (
                        <div className="bg-white p-6 rounded-md shadow text-center text-gray-500">
                            No Reviews Yet.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
