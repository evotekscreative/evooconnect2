import React, { useState } from "react";
import {
  Bell,
  User,
  Briefcase,
  Users,
  Pen,
  MessageSquare,
  Facebook,
  Twitter,
  Github,
  Youtube,
} from "lucide-react";
import logo from "../assets/img/logo1.png";

 const HelpPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.submit(); // tetap kirim form
    setSubmitted(true); // lalu tampilkan pesan
  };

  return (
    <div className="bg-[#EDF3F7] min-h-screen p-6">
      {/* Navbar */}
      <div className="bg-[#00AEEF] text-white py-4 w-full rounded-none shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-4 px-6">
          {/* Kiri - Logo + Search */}
          <div className="flex items-center gap-6 flex-wrap">
            <img src={logo} alt="EvoConnect Logo" className="h-8 w-90" />
            <input
              type="text"
              placeholder="Search people, jobs & more"
              className="px-4 py-2 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 w-64 max-w-full"
            />
          </div>

          {/* Kanan - Menu Navigasi */}
          <div className="flex items-center gap-5 flex-wrap">
            <a href="#" className="flex items-center gap-1 hover:text-yellow-300 transition">
              <Briefcase size={18} /> <span className="hidden md:inline">Jobs</span>
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-yellow-300 transition">
              <Users size={18} /> <span className="hidden md:inline">Connections</span>
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-yellow-300 transition">
              <Pen size={18} /> <span className="hidden md:inline">Blog</span>
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <MessageSquare size={20} />
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <Bell size={20} />
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <User size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row gap-8">
        {/* Left - Map + Text */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-blue-700">
            How can <span className="text-yellow-500">EVOConnect</span> assistants <br />
            <span className="text-blue-700">help You?</span>
          </h1>
          <p className="text-gray-600">We’d love to talk about how we can help you.</p>
          <iframe
            src="https://maps.google.com/maps?width=720&amp;height=600&amp;hl=en&amp;coord=30.9090157&amp;q=E17%20Course&amp;ie=UTF8&amp;t=p&amp;z=16&amp;iwloc=B&amp;output=embed"
            width="100%"
            height="455"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="EVOConnect Location"
          ></iframe>
        </div>

        {/* Right - Form / Thank You */}
        <div className="md:w-1/2 space-y-4">
          {!submitted ? (
            <>
              <h2 className="text-xl font-bold">Tell us about yourself</h2>
              <form
                action="https://formsubmit.co/youremail@example.com"
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-2"
              >
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="box" />

                <div>
                  <label className="block text-sm">YOUR NAME :</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    className="w-full border px-3 py-2 rounded-md"
                    defaultValue="Muhammad Bintang Asyidqy"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">YOUR EMAIL ADDRESS :</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@mail.com"
                    className="w-full border px-3 py-2 rounded-md"
                    defaultValue="bintangasyidqy07@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">SUBJECT :</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="w-full border px-3 py-2 rounded-md"
                    defaultValue="UI/UX Design"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">YOUR PHONE NUMBER :</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+62"
                    className="w-full border px-3 py-2 rounded-md"
                    defaultValue="+62-8540243-4200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">HOW CAN WE HELP YOU? :</label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Hi there, I would like to..."
                    className="w-full border px-3 py-2 rounded-md"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  SUBMIT
                </button>
                <p className="text-sm text-gray-500">We’ll get back to you in 1–2 business days.</p>
              </form>
            </>
          ) : (
            <div className="text-center text-green-600 space-y-4">
              <h2 className="text-2xl font-semibold">Thank you!</h2>
              <p>Please check your email to confirm your submission.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-8">
        <p>© EVOConnect, 2025. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#"><Facebook size={16} /></a>
          <a href="#"><Youtube size={16} /></a>
          <a href="#"><Twitter size={16} /></a>
          <a href="#"><Github size={16} /></a>
        </div>
      </footer>
    </div>
  );
}
export default HelpPage;
 