import React, { useState } from "react";
import {
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Image,
  Paperclip,
  Camera,
  Send,
  ArrowLeft,
} from "lucide-react";
import Case from "../components/Case";
import { Link, useNavigate } from 'react-router-dom';


// Fungsi untuk memformat tanggal

const formatDate = (dateString) => {
  const today = new Date();
  const messageDate = new Date(dateString);
  
  // Set waktu ke 00:00:00 untuk perbandingan tanggal saja
  today.setHours(0, 0, 0, 0);
  messageDate.setHours(0, 0, 0, 0);
  
  const diffTime = today - messageDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

const dummyUsers = [
  {
    id: 1,
    name: "Muhamad Afghan Alzena",
    email: "muhamadafghanalzena@gmail.com",
    initials: "MA",
    messages: [
      { 
        from: "them", 
        text: "Halo, ada waktu buat ngobrol?", 
        time: "08:00",
        date: new Date().toISOString() // Hari ini
      },
      { 
        from: "me", 
        text: "Boleh, ayo!", 
        time: "08:01",
        date: new Date().toISOString() // Hari ini
      },
      { 
        from: "them", 
        text: "Oke, aku tunggu ya.", 
        time: "08:03",
        date: new Date().toISOString() // Hari ini
      },
      { 
        from: "them", 
        text: "Pesan kemarin", 
        time: "14:30",
        date: new Date(Date.now() - 86400000).toISOString() // Kemarin
      },
      { 
        from: "me", 
        text: "Pesan minggu lalu", 
        time: "10:15",
        date: new Date(Date.now() - 7 * 86400000).toISOString() // 7 hari lalu
      }
    ],
    lastTime: "08:01 AM"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    initials: "SN",
    messages: [
      { 
        from: "them", 
        text: "Halo, ada waktu buat ngobrol?", 
        time: "08:00",
        date: new Date().toISOString() // Hari ini
      },
      { 
        from: "me", 
        text: "Boleh, ayo!", 
        time: "08:01",
        date: new Date().toISOString() // Hari ini
      },
      { 
        from: "them", 
        text: "Oke, aku tunggu ya.", 
        time: "08:03",
        date: new Date().toISOString() // Hari ini
      }
    ],
    lastTime: "09:12 AM"
  }
];

export const Messages = () => {
  const [activeUser, setActiveUser] = useState(null);
  const navigate = useNavigate();

  // Fungsi untuk mengelompokkan pesan berdasarkan tanggal
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    
    messages.forEach(message => {
      const dateKey = formatDate(message.date);
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(message);
    });
    
    return grouped;
  };

  return (
    <Case>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex flex-1 max-w-7xl mx-auto">
          {/* Main Messaging Panel */}
          <div className="bg-white w-full md:w-3/4 border shadow">
            {/* Header */}
            <div className="p-2 border-b flex items-center">
            <button 
            onClick={() => navigate(-1)} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
              <h1 className="text-xl font-medium">Nama User</h1>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Sidebar - User List */}
              <div className="w-full md:w-1/3 border-r">
                {/* Search Input */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search messages"
                      className="pl-10 pr-4 py-2 w-full border rounded-md"
                    />
                  </div>
                </div>

                {/* User List */}
                <div className="border-t">
                  {dummyUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setActiveUser(user)}
                      className={`p-4 hover:bg-gray-100 cursor-pointer ${
                        activeUser?.id === user.id ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-gray-700">
                          {user.initials}
                        </div>
                        <div className="ml-3">
                          <p className="text-blue-500 font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">No messages yet</p>
                        </div>
                        <div className="ml-auto text-xs text-gray-500">
                          {user.lastTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Panel */}
              <div className="w-full md:w-2/3 p-4 flex flex-col h-[80vh]">
                {activeUser ? (
                  <div className="flex flex-col h-full">
                    {/* Chat Header */}
                    <div className="flex items-center border-b pb-2 mb-4">
                      <div className="ml-3">
                        <p className="text-blue-500 font-medium">{activeUser.name}</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto p-2 bg-gray-100 rounded-lg">
                      {/* Centered Profile Section */}
                      <div className="flex flex-col items-center border-b pb-4 mb-4">
                        <div className="bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center text-gray-700 m-3">
                          {activeUser.initials}
                        </div>
                        <div className="text-center">
                          <p className="text-blue-500 font-medium">{activeUser.name}</p>
                          <p className="text-xs text-gray-500">{activeUser.email}</p>
                          <button className="border bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded-lg mt-2 text-sm">
                            View Profile
                          </button>
                        </div>
                      </div>

                      {/* Messages Section */}
                      {Object.entries(groupMessagesByDate(activeUser.messages)).map(([date, messages]) => (
                        <div key={date}>
                          <div className="flex flex-col items-center text-sm text-gray-500 my-2">
                            {date}
                          </div>
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex flex-col ${
                                message.from === "me" ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`rounded-lg p-2 max-w-xs ${
                                  message.from === "me"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {message.text}
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {message.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="border-t pt-2">
                      <div className="flex items-center mb-2">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          className="flex-grow border rounded-md px-4 py-2 mr-2"
                        />
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex space-x-2 text-blue-500">
                        <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center">
                          <Image className="h-5 w-5" />
                        </button>
                        <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center">
                          <Paperclip className="h-5 w-5" />
                        </button>
                        <button className="bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded text-sm flex items-center">
                          <Camera className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Select a user to start chatting.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Network Info */}
          <div className="hidden md:block md:w-1/4 ml-4 space-y-4">
            {/* Manage Network */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Manage my network</h2>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="border-b pb-4">
                  <Link to="/list-connection" className="flex justify-between">
                    <span>Connections</span> <span>0</span>
                  </Link>
                </li>
                <li className="border-b pb-4">
                  <Link to="/messages" className="flex justify-between">
                    <span>Contacts</span> <span>869</span>
                  </Link>
                </li>
                <li className="border-b pb-4">
                  <Link to="/groups" className="flex justify-between">
                    <span>Groups</span> <span>0</span>
                  </Link>
                </li>
                <li>
                  <Link to="/hashtags" className="flex justify-between">
                    <span>Hashtag</span> <span>8</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Profile Suggestion */}
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="flex justify-center space-x-1 mb-2">
                <img src="/api/placeholder/50/50" alt="profile" className="h-6" />
                <img src="/api/placeholder/50/50" alt="profile" className="h-6" />
              </div>
              <h3 className="font-medium text-sm mb-1">
                Gurdeep, grow your career by following <span className="font-bold">Askbootsrap</span>
              </h3>
              <p className="text-xs text-gray-500 mb-4">Stay up-to industry trends!</p>
              <button className="border border-blue-500 text-blue-500 px-4 py-1 rounded font-medium">
                FOLLOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </Case>
  );
};