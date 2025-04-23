import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Image as ImageIcon,
  Paperclip,
  Camera,
  Send,
  ArrowLeft,
  X,
  Trash2,
  Reply,
  File,
  MessageCircle,
  Menu,
  ChevronDown,
  Smile,
  Mic,
} from "lucide-react";
import Case from "../components/Case";
import { Link, useNavigate } from "react-router-dom";

// Format date function
const formatDate = (dateString) => {
  const today = new Date();
  const messageDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  messageDate.setHours(0, 0, 0, 0);

  const diffTime = today - messageDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

// Format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/^0/, ""); // Remove leading zero
};

const dummyUsers = [
  {
    id: 1,
    name: "Muhamad Afghan Alzena",
    email: "muhamadafghanalzena@gmail.com",
    initials: "MA",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "online",
    messages: [
      {
        id: 1,
        from: "them",
        text: "Halo, ada waktu buat ngobrol?",
        time: "8:00 AM",
        date: new Date().toISOString(),
      },
      {
        id: 2,
        from: "me",
        text: "Boleh, ayo!",
        time: "8:01 AM",
        date: new Date().toISOString(),
      },
      {
        id: 3,
        from: "them",
        text: "Oke, aku tunggu ya.",
        time: "8:03 AM",
        date: new Date().toISOString(),
        attachments: [
          {
            id: 1,
            type: "image",
            url: "https://picsum.photos/200/300",
            name: "sample-image.jpg",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    initials: "SN",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "last seen today at 9:12 AM",
    messages: [
      {
        id: 1,
        from: "them",
        text: "Halo, ada waktu buat ngobrol?",
        time: "8:00 AM",
        date: new Date().toISOString(),
      },
      {
        id: 2,
        from: "me",
        text: "Boleh, ayo!",
        time: "8:01 AM",
        date: new Date().toISOString(),
      },
      {
        id: 3,
        from: "them",
        text: "Oke, aku tunggu ya.",
        time: "8:03 AM",
        date: new Date().toISOString(),
      },
    ],
  },
];

export const Messages = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [activeUser, showSidebar]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {};

    messages.forEach((message) => {
      const dateKey = formatDate(message.date);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(message);
    });

    return grouped;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    const newAttachments = files.map((file) => {
      return {
        id: Date.now() + Math.random(),
        file,
        type: file.type.startsWith("image/") ? "image" : "document",
        name: file.name,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      };
    });

    setAttachments([...attachments, ...newAttachments]);
  };

  // Handle camera capture
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newAttachment = {
        id: Date.now(),
        file,
        type: "image",
        name: `capture-${Date.now()}.jpg`,
        preview: URL.createObjectURL(file),
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    if (!activeUser) return;

    const newMessage = {
      id: Date.now(),
      from: "me",
      text: messageInput,
      time: formatTime(new Date()),
      date: new Date().toISOString(),
      replyTo: replyTo,
      attachments: attachments.map((att) => ({
        id: att.id,
        type: att.type,
        name: att.name,
        url: att.preview || "#",
      })),
    };

    // Update user messages
    const updatedUser = {
      ...activeUser,
      messages: [...activeUser.messages, newMessage],
    };

    setActiveUser(updatedUser);

    // Update dummyUsers array
    const userIndex = dummyUsers.findIndex((u) => u.id === activeUser.id);
    if (userIndex !== -1) {
      dummyUsers[userIndex] = updatedUser;
    }

    // Reset form
    setMessageInput("");
    setReplyTo(null);
    setAttachments([]);

    // Scroll to bottom after sending
    setTimeout(scrollToBottom, 100);

    // Focus input after sending
    inputRef.current?.focus();
  };

  // Delete message
  const deleteMessage = (messageId) => {
    if (!activeUser) return;

    const updatedMessages = activeUser.messages.filter(
      (msg) => msg.id !== messageId
    );
    const updatedUser = {
      ...activeUser,
      messages: updatedMessages,
    };

    setActiveUser(updatedUser);

    // Update dummyUsers array
    const userIndex = dummyUsers.findIndex((u) => u.id === activeUser.id);
    if (userIndex !== -1) {
      dummyUsers[userIndex] = updatedUser;
    }
  };

  // Filter users based on search query
  const filteredUsers = dummyUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // WhatsApp-like message bubble styles
  const messageBubbleStyles = {
    me: {
      backgroundColor: "#DCF8C6",
      color: "#000",
      borderRadius: "7.5px 0 7.5px 7.5px",
      marginLeft: "auto",
    },
    them: {
      backgroundColor: "#FFFFFF",
      color: "#000",
      borderRadius: "0 7.5px 7.5px 7.5px",
      marginRight: "auto",
    },
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Mobile header */}
      <div className="md:hidden bg-blue-500 text-white p-3 flex items-center justify-between">
        {activeUser && !showSidebar ? (
          <>
            <div className="flex items-center">
              <button onClick={() => setShowSidebar(true)} className="mr-2">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-medium">{activeUser.name}</p>
                  <p className="text-xs opacity-80">{activeUser.status}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={18} />
              <Video size={18} />
              <MoreHorizontal size={18} />
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-medium">Message</h1>
            </div>
            {!activeUser && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-full hover:bg-gray-100 hover:bg-opacity-20"
              >
                <Menu size={20} className="text-white" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto h-[calc(100vh-56px)] md:h-screen">
        {/* Sidebar - User List */}
        <div
          className={`${
            showSidebar ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-96 bg-white border-r`}
        >
          {/* Search Input */}
          <div className="p-3 bg-blue-500">
            <div className="relative flex">
            <button
                onClick={() => navigate(-1)}
                className="mr-2 p-1 rounded-full  hover:bg-opacity-20"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-10">
              
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search or start new chat"
                className="pl-10 pr-4 py-2 w-full bg-white rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setActiveUser(user);
                  if (window.innerWidth < 768) {
                    setShowSidebar(false);
                  }
                }}
                className={`flex items-center p-3 border-b hover:bg-gray-50 cursor-pointer ${
                  activeUser?.id === user.id ? "bg-gray-100" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  {user.status === "online" && (
                    <div className="absolute bottom-0 right-3 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{user.name}</p>
                    <span className="text-xs text-gray-500">
                      {user.messages.length > 0
                        ? formatTime(
                            user.messages[user.messages.length - 1].date
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate max-w-[180px]">
                      {user.messages.length > 0
                        ? user.messages[user.messages.length - 1].text
                        : "No messages yet"}
                    </p>
                    {user.messages.length > 0 && (
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {user.messages.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div
          className={`${
            !showSidebar ? "flex" : "hidden"
          } md:flex flex-col flex-1 bg-gray-100`}
        >
          {activeUser ? (
            <div className="flex flex-col h-full">
              {/* Chat Header - Desktop */}
              <div className="hidden md:flex items-center justify-between p-3 bg-blue-500 border-b">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={activeUser.avatar}
                      alt={activeUser.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    {activeUser.status === "online" && (
                      <div className="absolute bottom-0 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{activeUser.name}</p>
                    <p className="text-xs text-white">{activeUser.status}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="text-white">
                    <Phone size={20} />
                  </button>
                  <button className="text-white">
                    <Video size={20} />
                  </button>
                  <button className="text-white">
                    <Search size={20} />
                  </button>
                  <button className="text-white">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] bg-opacity-30 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')]"
                style={{ backgroundSize: "412.5px 749.25px" }}
              >
                {Object.entries(groupMessagesByDate(activeUser.messages)).map(
                  ([date, messages]) => (
                    <div key={date}>
                      <div className="flex justify-center my-3">
                        <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                          {date}
                        </div>
                      </div>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex mb-2 px-2 ${
                            message.from === "me"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* Message container */}
                          <div className="group relative max-w-[70%]">
                            {/* Reply indicator */}
                            {message.replyTo && (
                              <div
                                className={`text-xs p-2 mb-1 rounded-t-lg ${
                                  message.from === "me"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <div className="flex items-center">
                                  <Reply size={12} className="mr-1" />
                                  <span className="font-medium">
                                    {message.from === "me"
                                      ? "You"
                                      : activeUser.name}
                                  </span>
                                </div>
                                <p className="truncate">
                                  {message.replyTo.text}
                                </p>
                              </div>
                            )}

                            {/* Message bubble */}
                            <div
                              className={`p-2 ${
                                message.replyTo ? "rounded-b-lg" : "rounded-lg"
                              } shadow`}
                            >
                              {message.text}

                              {/* Attachments */}
                              {message.attachments &&
                                message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {message.attachments.map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="rounded overflow-hidden"
                                      >
                                        {attachment.type === "image" ? (
                                          <img
                                            src={attachment.url}
                                            alt={attachment.name}
                                            className="max-w-full h-auto rounded"
                                          />
                                        ) : (
                                          <div className="flex items-center p-2 bg-white rounded">
                                            <File
                                              size={16}
                                              className="mr-2 text-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 truncate">
                                              {attachment.name}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                              {/* Message time */}
                              <div
                                className={`flex justify-end items-center mt-1 space-x-1 ${
                                  message.from === "me"
                                    ? "text-gray-800"
                                    : "text-gray-500"
                                }`}
                              >
                                <span className="text-xs">{message.time}</span>
                                {message.from === "me" && (
                                  <span className="text-green-800">✓✓</span>
                                )}
                              </div>
                            </div>

                            {/* Message actions */}
                            <div
                              className={`absolute ${
                                message.from === "me"
                                  ? "left-0 -translate-x-8"
                                  : "right-0 translate-x-8"
                              } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex space-x-1`}
                            >
                              <button
                                onClick={() => setReplyTo(message)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                                title="Reply"
                              >
                                <Reply size={16} />
                              </button>
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )
                )}
              </div>

              {/* Reply preview */}
              {replyTo && (
                <div
                  className={`px-4 py-2 bg-gray-50 flex justify-between items-center ${
                    attachments.length > 0 ? "border-t" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Replying to{" "}
                      {replyTo.from === "me" ? "yourself" : activeUser.name}
                    </p>
                    <p className="text-sm text-gray-700 truncate">
                      {replyTo.text}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* File preview */}
              {attachments.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t flex overflow-x-auto space-x-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="relative flex-shrink-0">
                      {attachment.preview ? (
                        <div className="relative">
                          <img
                            src={attachment.preview}
                            alt={attachment.name}
                            className="h-16 w-auto object-cover rounded"
                          />
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="absolute -top-2 -right-2 bg-gray-300 rounded-full p-1 hover:bg-gray-400"
                          >
                            <X size={12} className="text-gray-700" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative flex items-center p-2 bg-gray-200 rounded">
                          <File size={16} className="mr-2 text-gray-600" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {attachment.name}
                          </span>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="absolute -top-2 -right-2 bg-gray-300 rounded-full p-1 hover:bg-gray-400"
                          >
                            <X size={12} className="text-gray-700" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="bg-gray-50 p-2 border-t">
                <div className="flex items-center bg-white rounded-lg px-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Smile size={20} />
                  </button>

                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message"
                    className="flex-grow py-2 px-2 outline-none"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />

                  {messageInput || attachments.length > 0 ? (
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                    >
                      <Send size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => cameraInputRef.current.click()}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Mic size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleCameraCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500 p-4">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-medium mb-2">Message</h2>
              <p className="text-center max-w-md mb-6">
                Send and receive messages without keeping your phone online. Use
                WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
              <p className="text-sm text-gray-400">
                Select a chat to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};