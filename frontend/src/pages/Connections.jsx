import React, { useState } from "react";
import Case from "../components/Case";
import { Link, useNavigate } from "react-router-dom";
import Profile from "../assets/img/logo-evo-2.png";

import { Briefcase, MapPin, Mail, Check, X, Clock, ArrowLeft } from "lucide-react";

export default function ConnectionSuggestions() {
  const [activeTab, setActiveTab] = useState("people"); // 'people' or 'invitations'
  const navigate = useNavigate();
  const [connections, setConnections] = useState([
    {
      id: 1,
      name: "Fazrie & Mita",
      role: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco",
      email: "john@example.com",
      status: "connect",
      profile: Profile
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Product Manager",
      company: "Design Co",
      location: "New York",
      email: "jane@example.com",
      status: "connect",
      profile: Profile
    },
    {
      id: 3,
      name: "Alex Johnson",
      role: "UX Designer",
      company: "Creative Labs",
      location: "Chicago",
      email: "alex@example.com",
      status: "connect",
      profile: Profile
    },
    {
      id: 4,
      name: "Alex Johnson",
      role: "UX Designer",
      company: "Creative Labs",
      location: "Chicago",
      email: "alex@example.com",
      status: "connect",
      profile: Profile
    },
  ]);

  const [invitations, setInvitations] = useState([
    {
      id: 4,
      name: "Sarah Williams",
      role: "Marketing Director",
      company: "Brand Solutions",
      location: "Boston",
      email: "sarah@example.com",
      status: "pending",
      profile: Profile
    },
    {
      id: 5,
      name: "Michael Brown",
      role: "Data Scientist",
      company: "Analytics Pro",
      location: "Seattle",
      email: "michael@example.com",
      status: "pending",
      profile: Profile
    }
  ]);

  const handleConnect = (id) => {
    setConnections(connections.map(conn => {
      if (conn.id === id) {
        const newStatus = conn.status === "pending" ? "connect" : "pending";
        
        if (newStatus === "connect") {
          setInvitations(invitations.filter(inv => inv.id !== id));
        } else {
          const connection = connections.find(conn => conn.id === id);
          setInvitations([...invitations, { ...connection, status: "pending" }]);
        }
        
        return { ...conn, status: newStatus };
      }
      return conn;
    }));
  };

  const handleAccept = (id) => {
    setInvitations(invitations.map(inv => 
      inv.id === id ? { ...inv, status: "connected" } : inv
    ));
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, status: "connected" } : conn
    ));
  };

  const handleReject = (id) => {
    setInvitations(invitations.filter(inv => inv.id !== id));
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, status: "connect" } : conn
    ));
  };

  return (
    <Case>
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left side - People suggestions */}
          <div className="lg:col-span-3 space-y-4 bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center border-b pb-4">
              <button 
                onClick={() => navigate(-1)} 
                className="mr-2 p-1 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold">More Suggestions for you</h2>
            </div>
            
            <div className="border-b border-gray-300 overflow-x-auto">
              <div className="flex min-w-max">
                <button 
                  onClick={() => setActiveTab("people")}
                  className={`px-4 py-2 border-b-2 ${activeTab === "people" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"} font-medium`}
                >
                  People
                </button>
                <button 
                  onClick={() => setActiveTab("invitations")}
                  className={`px-4 py-2 border-b-2 ${activeTab === "invitations" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"} font-medium`}
                >
                  Invitations
                </button>
              </div>
            </div>

            {activeTab === "people" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {connections.map((person) => (
                  <div key={person.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6 text-left">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-gray-300 shadow">
                            <img
                              src={person.profile}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-blue-500 text-sm sm:text-base">{person.name}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">{person.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="flex-shrink-0" />
                          <span className="truncate">{person.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="flex-shrink-0" />
                          <span className="truncate">{person.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="flex-shrink-0" />
                          <span className="text-blue-600 hover:underline truncate">{person.email}</span>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <div className="flex justify-center mb-2 sm:mb-4">
                          {person.status === "connect" && (
                            <button 
                              onClick={() => handleConnect(person.id)}
                              className="w-full border border-blue-500 text-blue-500 rounded py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-blue-50 transition"
                            >
                              Connect
                            </button>
                          )}
                          {person.status === "pending" && (
                            <button 
                              onClick={() => handleConnect(person.id)}
                              className="w-full border bg-yellow-200 rounded py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-yellow-100 transition"
                            >
                              Pending
                            </button>
                          )}
                          {person.status === "connected" && (
                            <button className="w-full border bg-blue-500 text-white rounded py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-blue-500 transition">
                              Connected
                            </button>
                          )}  
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.length > 0 ? (
                  invitations.map(invitation => (
                    <div key={invitation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b">
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow">
                          <img
                            src={invitation.profile}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-500 text-sm sm:text-base">{invitation.name}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm">{invitation.role}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>Pending connection</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-auto">
                        <button 
                          onClick={() => handleAccept(invitation.id)}
                          className="px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleReject(invitation.id)}
                          className="px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-600 border border-gray-600 hover:bg-gray-100 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You have no pending invitations
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Manage network */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-3 text-sm sm:text-base">Manage my network</h3>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li className="border-b pb-3">
                  <Link to="/list-connection" className="flex justify-between">
                    <span>Connections</span> 
                    <span>{[...connections, ...invitations].filter(c => c.status === "connected").length}</span>
                  </Link>
                </li>
                <li className="border-b pb-3">
                  <Link to="/messages" className="flex justify-between">
                    <span>Contacts</span> <span>869</span>
                  </Link>
                </li>
                <li className="border-b pb-3">
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

            <div className="bg-white rounded-xl shadow p-4 text-center">
              <img src="/mnt/data/image.png" alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover" />
              <p className="text-xs sm:text-sm font-medium mb-1">
                Gurdeep, grow your career by following <span className="text-blue-600">Askbootsrap</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">Stay up-to industry trends!</p>
              <button className="border border-blue-500 text-blue-500 rounded px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium">
                FOLLOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </Case>
  );
}