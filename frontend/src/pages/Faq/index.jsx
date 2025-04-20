import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { Search } from "lucide-react";

export default function Faq() {
    const [openIndexBasics, setOpenIndexBasics] = useState(null);
    const [openIndexJobs, setOpenIndexJobs] = useState(null);
    const [openIndexAccount, setOpenIndexAccount] = useState(null);
    const [openIndexPrivacy, setOpenIndexPrivacy] = useState(null);

    const toggleOpen = (index, section) => {
        if (section === "basics") {
            setOpenIndexBasics(openIndexBasics === index ? null : index);
        } else if (section === "jobs") {
            setOpenIndexJobs(openIndexJobs === index ? null : index);
        } else if (section === "account") {
            setOpenIndexAccount(openIndexAccount === index ? null : index);
        } else if (section === "privacy") {
            setOpenIndexPrivacy(openIndexPrivacy === index ? null : index);
        }
    };

    const basics = [
        {
            question: "Is my data safe on this platform?",
            answer: "Yes, we are committed to keeping your data secure. We use a variety of protection measures to ensure that your personal information and data remain safe.",
        },
        {
            question: "What are the requirements for using this service?",
            answer: "You only need a device with an internet connection and a registered account to start using our services.",
        },
        {
            question: "How do I update my profile?",
            answer: "You can update your profile by going to edit profile, then editing information such as name, profile photo, and other details.",
        },
        {
            question: "Is this service free or paid?",
            answer: "We provide a free package with basic features, as well as paid packages with additional features for broader needs. You can choose the package that suits your needs.",
        },
    ];

    const jobs = [
        {
            question: "How to apply for a job on this website?",
            answer: 'Click the "Jobs" tab at the top of EVOConnect, use keywords or category filters, click on a job or save it for later, and enable the "Notifications" feature to receive updates from companies.',
        },
        {
            question: "How do I connect with other people on this website?",
            answer: "Search for the person's name you want to connect with, click 'Connect' and add a short message if needed. You can also follow someone without connecting.",
        },
        {
            question: "Do I need to create an account to apply for a job?",
            answer: "Yes, to access the full features, including applying for jobs, saving openings, and getting notifications, you need to create an account and log in to the platform.",
        },
        {
            question: "Is there a fee to apply for a job?",
            answer: "No, applying for jobs on this platform is completely free. However, beware of job scams that ask for payment.",
        },
        {
            question: "How do I know if I am qualified for a job?",
            answer: "Each job posting lists requirements, such as experience, skills, and education needed. Make sure you read the job description carefully before applying.",
        },
        {
            question: "How do I make my profile stand out to recruiters?",
            answer: "Use a professional photo, write an attractive profile summary, and add relevant work experience and skills.",
        },
    ];

    const account = [
        {
            question: "How do I reset my password?",
            answer: 'On the login page there is a text "Forgot Password". After that, the "Reset Password" page will appear with a column to enter an email. Next, the user will receive a message via email to reset the password.',
        },
        {
            question: "How to long out?",
            answer: 'Click "profile" then select the "logout" description, and after that you will return to the login page.',
        },
        {
            question: "How do i change my personal data?",
            answer: 'You just need to go to the "Edit Profile" page, then update your personal data.',
        },
        {
            question: "I forgot my password. How do i reset it?",
            answer: (
                <ol className="list-decimal ml-5 space-y-1">
                    <li>On the login page, click "Forgot Password".</li>
                    <li>Enter your registered email address, then click "Send".</li>
                    <li>Check your email, and click "Reset Password".</li>
                    <li>Enter your new password, then confirm the change.</li>
                    <li>Once done, try logging in again with the new password.</li>
                </ol>
            ),

        },
    ];

    const privacy = [
        {
            question: "Can i specify my own private key?",
            answer: 'On the login page there is a text "Forgot Password". After that, the "Reset Password" page will appear with a column to enter an email. Next, the user will receive a message via email to reset the password.',
        },
        {
            question: "How to long out?",
            answer: 'Click "profile" then select the "logout" description, and after that you will return to the login page.',
        },
        {
            question: "How do i change my personal data?",
            answer: 'You just need to go to the "Edit Profile" page, then update your personal data.',
        },
        {
            question: "I forgot my password. How do i reset it?",
            answer: (
                <ol className="list-decimal ml-5 space-y-1">
                    <li>On the login page, click "Forgot Password".</li>
                    <li>Enter your registered email address, then click "Send".</li>
                    <li>Check your email, and click "Reset Password".</li>
                    <li>Enter your new password, then confirm the change.</li>
                    <li>Once done, try logging in again with the new password.</li>
                </ol>
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
                {/* Basics Section */}
                <Section
                    title="Basics"
                    data={basics}
                    openIndex={openIndexBasics}
                    toggleOpen={(i) => toggleOpen(i, "basics")}
                />

                {/* Jobs Section */}
                <Section
                    title="Jobs"
                    data={jobs}
                    openIndex={openIndexJobs}
                    toggleOpen={(i) => toggleOpen(i, "jobs")}
                />

                {/* Account Section */}
                <Section
                    title="Account"
                    data={account}
                    openIndex={openIndexAccount}
                    toggleOpen={(i) => toggleOpen(i, "account")}
                />

                {/* Privacy Section */}
                <Section
                    title="Privacy"
                    data={privacy}
                    openIndex={openIndexPrivacy}
                    toggleOpen={(i) => toggleOpen(i, "privacy")}
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
                            className={`px-4 overflow-hidden transition-all duration-300 ease-in-out text-sm text-gray-600 ${openIndex === index ? "max-h-40 pb-4" : "max-h-0"
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
