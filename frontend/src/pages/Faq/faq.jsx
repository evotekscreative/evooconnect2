import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { Search } from "lucide-react";

export default function Faq() {
    const [openIndexGeneral, setOpenIndexGeneral] = useState(null);

    const toggleOpen = (index, section) => {
        if (section === "General") {
            setOpenIndexGeneral(openIndexGeneral === index ? null : index);
        }
    };

    const General = [
        {
            question: "What is the user experience like on EVOConnect?",
            answer: (
                <div>
                    EVOConnect is designed to make it easy for you to find ideas, start conversations, and explore topics relevant to your professional life. When you log in, you will be taken directly to the homepage which contains:
                    <ul className="list-disc pl-5 mt-2">
                        <li className="mt-4">Feed: displays posts from your connections, companies you follow, and groups you belong to.</li>
                        <li className="mt-2">Main navigation: includes access to profile, connections, private messages and recent notifications.</li>
                        <li className="mt-2">Job Portal: users can directly open the Jobs tab from the navbar, view the latest job vacancies from companies, use search filters, and apply directly in just a few clicks.</li>
                    </ul>
                </div>
            ),
        },
        {
            question: "How to do a search in EVOConnect?",
            answer: (
                <div>
                    Use the search bar located in the navbar (top of the page). You can search for:
                    <ul className="list-disc pl-5 mt-2">
                        <li className="mt-4">User (person's name)</li>
                        <li className="mt-2">Company</li>
                        <li className="mt-2">Community groups</li>
                        <li className="mt-2">Job vacancy</li>
                        <li className="mt-2">Posts As you type, you'll see auto-suggestions, or press enter to see the full results.</li>
                    </ul>
                </div>
            ),
        },

        {
            question: "How do I access my profile?",
            answer: "Click your profile icon in the top right corner → select View Profile."
        },

        {
            question: "How do I edit my profile?",
            answer: 'Still on the profile page, click the "Edit Profile" button on your profile icon. You can change your photo, bio, work experience, education, and more.'
        },

        {
            question: "How to create posts and articles?",
            answer: (
                <div>
                    The create post feature is available at:
                    <ul className="list-disc pl-5 mt-2">
                        <li className="mt-4">Feed/homepage (main)</li>
                        <li className="mt-2">Your own profile page Simply click “Create Post”, enter content (text/image/video), then click “Submit”.</li>
                    </ul>
                </div>
            ),
        },

        {
            question: "How to apply for a job vacancy?",
            answer: 'Go to the Jobs / Job Vacancy menu in the navbar → select the vacancy you are interested in → click "Apply" → complete the form / upload CV.'
        },

        {
            question: "How to create or join a company?",
            answer: (
                <div>
                    Go to the Company menu in the Jobs portal →
                    <ul className="list-disc pl-5 mt-2">
                        <li className="mt-4">Click "Create Company" if you want to create a new company.</li>
                        <li className="mt-2">Or search for company name → click "Join" to submit a joining request.</li>
                    </ul>
                </div>
            ),
        },
    ];

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#0EA5E9' }} className="text-white text-center py-16 px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    How can we <span className="text-white font-extrabold">help?</span>
                </h1>

                <div className="flex justify-center">
                    <div className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Ask a question"
                            className="w-full pl-10 pr-4 py-3 rounded-md text-gray-800 text-sm focus:outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>

                <p className="text-xs mt-4 text-blue-200">
                    Popular help topics:{" "}
                    <a href="#" className="underline text-blue-100">
                        pricing
                    </a>
                </p>
            </div>

            <div className="bg-gray-100 py-10 px-8 md:px-40 lg:px-60 space-y-10">
                {/* General Section */}
                <Section
                    title="General"
                    data={General}
                    openIndex={openIndexGeneral}
                    toggleOpen={(i) => toggleOpen(i, "General")}
                />
            </div>
        </>
    );
}

function Section({ title, data, openIndex, toggleOpen }) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="bg-white rounded-md shadow-sm hover:shadow-md">
                        <button
                            className="w-full flex justify-between items-center py-3 px-4 cursor-pointer"
                            onClick={() => toggleOpen(index)}
                        >
                            <span className="text-sm text-gray-800 text-left">{item.question}</span>
                            <span className="text-gray-400 text-lg">
                                {openIndex === index ? "v" : ">"}
                            </span>
                        </button>
                        <div
                            className={`px-4 transition-all duration-300 ease-in-out text-sm text-gray-600 ${openIndex === index ? " pb-4" : "max-h-0"
                                }`}
                        >
                            {openIndex === index && <div>{item.answer}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
