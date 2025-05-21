import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Pusher from "pusher-js";
import {
  Check,
  ChevronLeft,
  Paperclip,
  Send,
  Smile,
  X,
  Image,
  FileText,
  File as FileIcon,
  Music,
  Mic,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export const Messages = () => {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pusher, setPusher] = useState(null);
  const [channels, setChannels] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);

  // Add this function to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the menu button itself
      if (event.target.closest("[data-menu-button]")) {
        return;
      }

      // Close the menu if clicking outside the menu content
      if (activeMenu && !event.target.closest("[data-menu-content]")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const messagesContainerRef = useRef(null);

  // Format date function
  // Format date function with error handling
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    try {
      const today = new Date();
      const messageDate = new Date(dateString);

      // Check if date is valid
      if (isNaN(messageDate.getTime())) {
        console.warn("Invalid date:", dateString);
        return "Unknown date";
      }

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
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  // Format time with error handling
  const formatTime = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid time:", dateString);
        return "";
      }

      return date
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/^0/, ""); // Remove leading zero
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  // Updated groupMessagesByDate with error handling
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    if (!Array.isArray(messages)) {
      console.warn("Messages is not an array:", messages);
      return groups;
    }

    messages.forEach((message) => {
      if (!message || !message.created_at) {
        console.warn("Invalid message or missing created_at:", message);
        return;
      }

      try {
        const date = new Date(message.created_at);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn("Invalid message date:", message.created_at);
          return;
        }

        const dateKey = formatDate(message.created_at);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      } catch (error) {
        console.error("Error processing message date:", error, message);
      }
    });

    return groups;
  };

  // Initialize Pusher
  // Update the Pusher initialization code
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    console.log("Initializing Pusher connection...");
    const pusherClient = new Pusher("a579dc17c814f8b723ea", {
      cluster: "ap1",
      // Customize the auth endpoint to explicitly handle channel_name
      authorizer: (channel) => {
        return {
          authorize: (socketId, callback) => {
            console.log(
              `Authorizing channel: ${channel.name}, socketId: ${socketId}`
            );

            // The backend expects form data with socket_id and channel_name parameters
            const formData = new FormData();
            formData.append("socket_id", socketId);
            formData.append("channel_name", channel.name);

            axios
              .post(
                "http://localhost:3000/api/pusher/auth",
                formData, // Send as FormData instead of JSON
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type, let axios set it with the boundary for FormData
                  },
                }
              )
              .then((response) => {
                console.log("✅ Auth successful for channel:", channel.name);
                callback(null, response.data);
              })
              .catch((error) => {
                console.error(
                  `Auth error: ${error.response?.statusText || error.message}`,
                  error
                );
                callback(error, null);
              });
          },
        };
      },
    });

    // Add connection status events
    pusherClient.connection.bind("connected", () => {
      console.log("✅ Pusher connected successfully");
    });

    pusherClient.connection.bind("connecting", () => {
      console.log("⏳ Attempting to connect to Pusher...");
    });

    pusherClient.connection.bind("disconnected", () => {
      console.log("❌ Disconnected from Pusher");
    });

    pusherClient.connection.bind("error", (err) => {
      console.error("Pusher connection error:", err);
    });

    // Set pusher state
    setPusher(pusherClient);

    // Get current user ID from token
    const userId = getUserIdFromToken(token);
    console.log("Subscribing to user channel:", `private-user-${userId}`);

    // Subscribe to user's private channel with proper error handling
    try {
      const userChannel = pusherClient.subscribe(`private-user-${userId}`);

      // Debug channel subscription
      userChannel.bind("pusher:subscription_succeeded", () => {
        console.log("✅ Successfully subscribed to user channel");
      });

      userChannel.bind("pusher:subscription_error", (error) => {
        console.error("❌ Error subscribing to user channel:", error);
      });

      // Bind to events
      userChannel.bind("new-conversation", (data) => {
        console.log("📬 Received new conversation:", data);
        handleNewConversation(data);
      });

      setChannels((prev) => ({
        ...prev,
        user: userChannel,
      }));
    } catch (error) {
      console.error("Error subscribing to user channel:", error);
    }

    return () => {
      console.log("Cleaning up Pusher connection");
      if (pusherClient) {
        pusherClient.disconnect();
      }
    };
  }, []);

  // Function to extract user ID from JWT token
  const getUserIdFromToken = (token) => {
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/conversations?limit=20&offset=0`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setConversations(response.data.data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationById = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/conversations/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.data) {
        setActiveConversation(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      // First try to find in existing conversations
      if (conversations.length > 0) {
        const conversation = conversations.find(
          (conv) =>
            conv.id === parseInt(conversationId) || conv.id === conversationId
        );

        if (conversation) {
          // Only update activeConversation if it's different
          if (
            !activeConversation ||
            activeConversation.id !== conversation.id
          ) {
            setActiveConversation(conversation);
          }
        } else {
          // If not found locally, fetch it
          fetchConversationById(conversationId);
        }
      } else {
        // If conversations not loaded yet, fetch the specific conversation
        fetchConversationById(conversationId);
      }
    }
  }, [conversationId, conversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      // Reset pagination when conversation changes
      setPage(0);
      setHasMore(true);
      fetchMessages();
      subscribeToConversation(activeConversation.id);
      markConversationAsRead(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (page > 0 && activeConversation) {
      fetchMessages();
    }
  }, [page]);

  // Update the subscribeToConversation function
  const subscribeToConversation = (conversationId) => {
    if (!pusher) {
      console.warn(
        "⚠️ Cannot subscribe to conversation - Pusher not initialized"
      );
      return;
    }

    // Unsubscribe from previous conversation channel if exists
    if (channels.conversation) {
      console.log("Unsubscribing from previous conversation channel");
      try {
        channels.conversation.unbind_all();
        pusher.unsubscribe(`private-conversation-${channels.conversationId}`);
      } catch (error) {
        console.error("Error unsubscribing from previous channel:", error);
      }
    }

    // Subscribe to new conversation channel with error handling
    try {
      console.log(
        "Subscribing to conversation channel:",
        `private-conversation-${conversationId}`
      );
      const conversationChannel = pusher.subscribe(
        `private-conversation-${conversationId}`
      );

      // Debug channel subscription
      conversationChannel.bind("pusher:subscription_succeeded", () => {
        console.log(
          `✅ Successfully subscribed to conversation ${conversationId}`
        );
      });

      conversationChannel.bind("pusher:subscription_error", (error) => {
        console.error(
          `❌ Error subscribing to conversation ${conversationId}:`,
          error
        );
      });

      // Bind events with debug logging
      conversationChannel.bind("new-message", (message) => {
        console.log("📨 Received new message:", message);
        handleNewMessage(message);
      });

      conversationChannel.bind("message-updated", (message) => {
        console.log("✏️ Message updated:", message);
        handleMessageUpdated(message);
      });

      conversationChannel.bind("message-deleted", (data) => {
        console.log("🗑️ Message deleted:", data);
        handleMessageDeleted(data);
      });

      conversationChannel.bind("messages-read", (data) => {
        console.log("👀 Messages marked as read:", data);
        handleMessagesRead(data);
      });

      setChannels((prev) => ({
        ...prev,
        conversation: conversationChannel,
        conversationId: conversationId,
      }));
    } catch (error) {
      console.error(
        `Error subscribing to conversation ${conversationId}:`,
        error
      );
    }
  };

  const fetchMessages = async () => {
    if (!activeConversation) return;

    setMessagesLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/conversations/${
          activeConversation.id
        }/messages?limit=20&offset=${page * 20}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Add a null check here
      const newMessages = response.data.data?.messages || [];

      // If this is the first page, replace messages
      // For additional pages (scrolling up), add to beginning
      if (page === 0) {
        // For initial load, reverse to show oldest first
        setMessages([...newMessages].reverse());
      } else {
        // For pagination, add older messages before current ones
        setMessages((prev) => [...[...newMessages].reverse(), ...prev]);
      }

      setHasMore(newMessages.length === 20);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchReplyMessage = async (message) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/messages/${message.reply_to_id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.data) {
        // Update the message with reply_to data
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, reply_to: response.data.data }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch replied message:", error);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/conversations/${conversationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update local state to reflect read status
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  };

  // Add this new function
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop < 50 && !messagesLoading && hasMore) {
      // Load more messages when user scrolls to the top
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Pusher event handlers
  const handleNewConversation = (data) => {
    setConversations((prev) => [data, ...prev]);
  };

  const handleNewMessage = (message) => {
    // If the message has a reply_to_id, fetch the replied message data
    if (message.reply_to_id) {
      fetchReplyMessage(message);
    }

    const currentUserId = getUserIdFromToken(localStorage.getItem("token"));
    const isFromCurrentUser = message.sender_id === currentUserId;

    // Add new message to current conversation (at the END for proper display)
    if (
      activeConversation &&
      activeConversation.id === message.conversation_id
    ) {
      setMessages((prev) => [...prev, message]);
      // Auto scroll to bottom when new message arrives
      setTimeout(() => scrollToBottom(), 100);
    }

    // Update conversation list with new last message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            last_message: message,
            unread_count: isFromCurrentUser
              ? conv.unread_count
              : conv.unread_count + 1,
          };
        }
        return conv;
      })
    );
  };

  const handleMessageUpdated = (updatedMessage) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
    );
  };

  const handleMessageDeleted = (data) => {
    // decrement unread count
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === data.conversation_id) {
          return {
            ...conv,
            unread_count: Math.max(conv.unread_count - 1, 0),
          };
        }
        return conv;
      })
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.message_id
          ? { ...msg, deleted: true, content: "" }
          : msg
      )
    );

    setConversations((prev) =>
      prev.map((conv) => {
        if (
          conv.id === data.conversation_id &&
          conv.last_message.id === data.message_id
        ) {
          return {
            ...conv,
            last_message: {
              ...conv.last_message,
              deleted: true,
              content: "Pesan telah dihapus",
            },
          };
        }
        return conv;
      })
    );
  };

  const handleMessagesRead = ({ user_id }) => {
    // Update read status in the UI when someone else reads messages
    const currentUserId = getUserIdFromToken(localStorage.getItem("token"));
    if (user_id !== currentUserId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id === currentUserId ? { ...msg, is_read: true } : msg
        )
      );
    }
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation, showSidebar]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      console.log(`📎 Selected ${files.length} files`);

      // Create an array to store the attachments
      const newAttachments = [];

      // Process each file
      files.forEach((file) => {
        // Determine the file type
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("audio/")
          ? "audio"
          : "document";

        // Create attachment object
        const attachment = {
          id: Date.now() + Math.random(), // Ensure unique ID
          file: file,
          type: fileType,
          name: file.name,
          // For images, we'll generate previews
          preview: fileType === "image" ? null : null,
        };

        // Add to attachments array
        newAttachments.push(attachment);

        // Generate preview for images
        if (fileType === "image") {
          const reader = new FileReader();
          reader.onload = () => {
            // Update the specific attachment with the preview
            const index = newAttachments.findIndex(
              (a) => a.id === attachment.id
            );
            if (index !== -1) {
              newAttachments[index].preview = reader.result;
              setAttachments([...newAttachments]);

              // If it's the first image, set it as the main preview
              if (index === 0) {
                setFilePreview(reader.result);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      });

      // Set attachments state
      setAttachments(newAttachments);

      // If there are no images for preview, clear the preview
      if (!newAttachments.some((att) => att.type === "image")) {
        setFilePreview(null);
      }
    }
  };

  // Remove attachment
  const removeAttachment = (id) => {
    if (!id) {
      // Remove all attachments if no ID is provided
      setAttachments([]);
      setFilePreview(null);
      return;
    }

    // Remove specific attachment
    const updatedAttachments = attachments.filter((att) => att.id !== id);
    setAttachments(updatedAttachments);

    // Update preview if needed
    if (updatedAttachments.length === 0) {
      setFilePreview(null);
    } else if (
      filePreview &&
      !updatedAttachments.some((att) => att.preview === filePreview)
    ) {
      // If current preview was removed, set first available image as preview
      const firstImageAtt = updatedAttachments.find(
        (att) => att.type === "image"
      );
      setFilePreview(firstImageAtt ? firstImageAtt.preview : null);
    }
  };

  // Send message
  // Update fungsi sendMessage untuk menyertakan replyTo
  const sendMessage = async () => {
    if (
      (!messageInput.trim() && attachments.length === 0) ||
      !activeConversation
    )
      return;

    try {
      // Store message input and clear it immediately for better UX
      const textToSend = messageInput.trim();
      setMessageInput("");

      // Store reply info and clear it
      const replyToInfo = replyTo;
      setReplyTo(null);

      // Step 1: Send all file attachments first
      if (attachments.length > 0) {
        // Create an array of promises for sending each file
        const filePromises = attachments.map(async (attachment) => {
          const formData = new FormData();
          formData.append("file", attachment.file);
          formData.append("message_type", attachment.type);

          // Add reply_to_id if replying (only for the first file)
          if (replyToInfo && replyToInfo.mode === "reply") {
            formData.append("reply_to_id", replyToInfo.id);
          }

          return axios.post(
            `http://localhost:3000/api/conversations/${activeConversation.id}/files`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        });

        // Send all files in parallel
        await Promise.all(filePromises);
      }

      // Step 2: Send text message if there is any
      if (textToSend) {
        await axios.post(
          `http://localhost:3000/api/conversations/${activeConversation.id}/messages`,
          {
            content: textToSend,
            message_type: "text",
            reply_to_id:
              // Only include reply_to_id if we didn't already use it for file uploads
              replyToInfo &&
              replyToInfo.mode === "reply" &&
              attachments.length === 0
                ? replyToInfo.id
                : null,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Clear attachments
      setAttachments([]);
      setFilePreview(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally restore the message input if sending failed
      // setMessageInput(textToSend);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:3000/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Actual state update will happen through Pusher event
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Edit message
  const startEditingMessage = (message) => {
    setReplyTo({ id: message.id, mode: "edit", text: message.content });
    setMessageInput(message.content);
    inputRef.current?.focus();
  };

  const cancelEdit = () => {
    setReplyTo(null);
    setMessageInput("");
  };

  const saveMessageEdit = async () => {
    if (!replyTo || !messageInput.trim()) return;

    try {
      await axios.put(
        `http://localhost:3000/api/messages/${replyTo.id}`,
        {
          content: messageInput,
          message_type: "text",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setReplyTo(null);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === "Escape" && replyTo) {
      // Cancel reply/edit on Escape key
      setReplyTo(null);
      if (replyTo.mode === "edit") {
        setMessageInput("");
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (replyTo?.mode === "edit") {
        saveMessageEdit();
      } else {
        sendMessage();
      }
    }
  };

  // Filter users/conversations based on search query
  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter((conv) => {
        if (!conv || !Array.isArray(conv.participants)) {
          return false;
        }

        // Find participant that's not current user
        const otherParticipants = conv.participants.filter(
          (p) =>
            p &&
            p.user &&
            p.user_id !== getUserIdFromToken(localStorage.getItem("token"))
        );

        // Check if any participant names match search query
        return otherParticipants.some(
          (p) =>
            p.user &&
            p.user.name &&
            p.user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  // Start a new conversation
  const startNewConversation = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/conversations",
        {
          participant_ids: [userId],
          initial_message: "Hello!",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const newConversation = response.data.data;
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const startReplyToMessage = (message) => {
    console.log("Replying to message:", message);
    setReplyTo({
      id: message.id,
      mode: "reply",
      text: message.content,
      sender: message.sender.name || "User",
    });
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (messages.length > 0 && page === 0) {
      scrollToBottom();
    }
  }, [messages, page]);

  // WhatsApp-like message bubble styles - keep your existing styles
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#00AEEF] text-white p-4 shadow-md">
        <div className="container flex items-center justify-between mx-auto">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - conversation list */}
        <div
          className={`${
            showSidebar || !conversationId ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-1/3 lg:w-1/4 bg-white border-r`}
        >
          {/* Search bar */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full p-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : !filteredConversations || filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                // Skip if conversation has no participants array
                if (
                  !conversation ||
                  !conversation.participants ||
                  !Array.isArray(conversation.participants)
                ) {
                  console.warn("Invalid conversation structure:", conversation);
                  return null;
                }

                // Get the other participant(s) - in a group chat there could be multiple
                const otherParticipants = conversation.participants.filter(
                  (p) =>
                    p &&
                    p.user_id &&
                    p.user_id !==
                      getUserIdFromToken(localStorage.getItem("token"))
                );

                // For simplicity, we'll just use the first other participant for display
                const otherParticipant = otherParticipants[0]?.user;

                // Skip rendering if we don't have a valid other participant
                if (!otherParticipant) {
                  console.warn(
                    "No valid other participant found:",
                    conversation
                  );
                  return null;
                }

                return (
                  // <div
                  //   key={conversation.id}
                  //   className={`p-4 border-b flex items-start gap-3 cursor-pointer hover:bg-gray-50 ${
                  //     activeConversation?.id === conversation.id
                  //       ? "bg-blue-50"
                  //       : ""
                  //   }`}
                  //   onClick={() => setActiveConversation(conversation)}
                  // >
                  <div
                    key={conversation.id}
                    className={`p-4 border-b flex items-start gap-3 cursor-pointer hover:bg-gray-50 ${
                      activeConversation?.id === conversation.id
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => navigate(`/messages/${conversation.id}`)}
                  >
                    {/* Avatar */}
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-300 rounded-full">
                      {otherParticipant?.photo ? (
                        <img
                          src={`http://localhost:3000/${otherParticipant.photo}`}
                          alt={otherParticipant.name || "User"}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-lg font-semibold">
                          {(otherParticipant?.name || "?")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* User info & last message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {otherParticipant?.name || "Unknown User"}
                        </p>
                        <span className="text-xs text-gray-500">
                          {conversation.last_message
                            ? formatTime(conversation.last_message.created_at)
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate max-w-[180px]">
                          {conversation.last_message
                            ? conversation.last_message.deleted ||
                              conversation.last_message.deleted_at
                              ? "Pesan telah dihapus"
                              : conversation.last_message.message_type ===
                                "text"
                              ? conversation.last_message.content
                              : `[${conversation.last_message.message_type}]`
                            : "No messages yet"}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div
          className={`${
            !showSidebar ? "flex" : "hidden"
          } md:flex flex-col flex-1 bg-gray-100`}
        >
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-2 p-3 bg-white border-b">
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-full md:hidden hover:bg-gray-200"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Active conversation participant info */}
                {activeConversation.participants
                  .filter(
                    (p) =>
                      p.user_id !==
                      getUserIdFromToken(localStorage.getItem("token"))
                  )
                  .slice(0, 1)
                  .map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-300 rounded-full">
                        {participant.user.photo ? (
                          <img
                            src={`http://localhost:3000/${participant.user.photo}`}
                            alt={participant.user.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="font-semibold">
                            {participant.user.name
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{participant.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {participant.last_read_at
                            ? `Last seen ${formatTime(
                                participant.last_read_at
                              )}`
                            : "Online"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Message list */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-[#E5DDD5]"
                onScroll={handleScroll}
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="p-4 text-center bg-white rounded-lg shadow-sm">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  Object.entries(groupMessagesByDate(messages || []))
                    // Sort date groups with oldest first
                    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                    .map(([date, dateMessages]) => (
                      <div key={date}>
                        {/* Date separator */}
                        <div className="flex justify-center my-2">
                          <span className="px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded-full">
                            {date}
                          </span>
                        </div>
                        {/* Messages for this date */}
                        {[...dateMessages].map((message) => {
                          const isMe =
                            message.sender_id ===
                            getUserIdFromToken(localStorage.getItem("token"));
                          return (
                            <div
                              key={message.id}
                              id={message.id}
                              className={`flex group mb-2 ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[75%] p-2 rounded shadow-sm relative `}
                                style={
                                  isMe
                                    ? messageBubbleStyles.me
                                    : messageBubbleStyles.them
                                }
                              >
                                {message.reply_to && (
                                  <div className="p-1 mb-1 text-xs bg-gray-100 border-l-2 border-gray-400 rounded">
                                    <p className="font-medium text-gray-700">
                                      {message.reply_to.sender.name || "User"}
                                    </p>
                                    <p className="text-gray-600 truncate">
                                      {/* {message.reply_to.message_type === "text"
                                        ? message.reply_to.content
                                        : `[${message.reply_to.message_type}]`} */}

                                      {message.reply_to.deleted_at ? (
                                        <span className="italic text-gray-500">
                                          Pesan ini dihapus
                                        </span>
                                      ) : message.reply_to.message_type ==
                                        "text" ? (
                                        message.reply_to.content
                                      ) : (
                                        `[${message.reply_to.message_type}]`
                                      )}
                                    </p>
                                  </div>
                                )}
                                {/* Message content based on type */}
                                {/* Inside the message rendering section where you display the message content */}
                                {message.deleted || message.deleted_at ? (
                                  // Show "message deleted" placeholder for deleted messages
                                  <p className="italic text-gray-500">
                                    Pesan ini dihapus
                                  </p>
                                ) : message.message_type === "text" ? (
                                  // Regular text message
                                  <p className="whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                ) : message.message_type === "image" ? (
                                  // Image message
                                  <div>
                                    <img
                                      src={`http://localhost:3000/${message.file_path}`}
                                      alt="Image"
                                      className="max-w-full rounded"
                                    />
                                    {message.content && (
                                      <p className="mt-1 text-sm">
                                        {message.content}
                                      </p>
                                    )}
                                  </div>
                                ) : message.message_type === "document" ? (
                                  // Document message
                                  <div className="flex items-center gap-2">
                                    <FileText size={24} />
                                    <a
                                      href={`http://localhost:3000/${message.file_path}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline"
                                    >
                                      {message.file_name || "Document"}
                                    </a>
                                  </div>
                                ) : message.message_type === "audio" ? (
                                  // Audio message
                                  <div>
                                    <audio
                                      controls
                                      src={`http://localhost:3000/${message.file_path}`}
                                      className="max-w-full"
                                    >
                                      Your browser does not support audio
                                      playback.
                                    </audio>
                                  </div>
                                ) : null}

                                {/* Message metadata */}
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  {/* Add edited indicator */}
                                  {!message.deleted &&
                                    !message.deleted_at &&
                                    message.updated_at &&
                                    message.created_at &&
                                    message.updated_at !==
                                      message.created_at && (
                                      <span className="mr-1 text-xs italic text-gray-500">
                                        edited
                                      </span>
                                    )}
                                  <span className="text-xs text-gray-500">
                                    {formatTime(message.created_at)}
                                  </span>
                                  {isMe &&
                                    !message.deleted &&
                                    !message.deleted_at && (
                                      <Check
                                        size={14}
                                        className={
                                          message.is_read
                                            ? "text-blue-500"
                                            : "text-gray-500"
                                        }
                                      />
                                    )}
                                </div>

                                {/* Message actions menu */}
                                <div
                                  className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                    isMe ? "-left-10" : "-right-10"
                                  } top-3`}
                                >
                                  {!isMe &&
                                  !message.deleted &&
                                  !message.deleted_at ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        console.log("Reply clicked", message);
                                        startReplyToMessage(message);
                                        setActiveMenu(null);
                                      }}
                                      className="p-1.5 text-gray-500 bg-white rounded-full shadow-md hover:text-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="9 17 4 12 9 7"></polyline>
                                        <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                                      </svg>
                                    </button>
                                  ) : (
                                    !message.deleted &&
                                    !message.deleted_at && (
                                      <div className="relative">
                                        <button
                                          data-menu-button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const rect =
                                              e.currentTarget.getBoundingClientRect();
                                            setActiveMenu({
                                              id: message.id,
                                              position: {
                                                top: rect.bottom + 15,
                                                left: isMe
                                                  ? rect.left
                                                  : rect.right - 160,
                                              },
                                            });
                                          }}
                                          className="p-1.5 text-gray-500 bg-white rounded-full shadow-md hover:text-blue-500 hover:bg-blue-50 transition-all"
                                          title="Message actions"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <circle
                                              cx="12"
                                              cy="12"
                                              r="1"
                                            ></circle>
                                            <circle
                                              cx="12"
                                              cy="5"
                                              r="1"
                                            ></circle>
                                            <circle
                                              cx="12"
                                              cy="19"
                                              r="1"
                                            ></circle>
                                          </svg>
                                        </button>

                                        {activeMenu &&
                                          activeMenu.id === message.id && (
                                            <div
                                              data-menu-content
                                              className="fixed z-[100] py-2 mt-1 bg-white rounded-lg shadow-xl w-40"
                                              style={{
                                                // Position near the menu button but as fixed to avoid overflow issues
                                                top: `${activeMenu.position.top}px`,
                                                left: `${activeMenu.position.left}px`,
                                              }}
                                            >
                                              {/* Reply button */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  console.log(
                                                    "Reply clicked",
                                                    message
                                                  );
                                                  startReplyToMessage(message);
                                                  setActiveMenu(null);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="mr-2"
                                                >
                                                  <polyline points="9 17 4 12 9 7"></polyline>
                                                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                                                </svg>
                                                Reply
                                              </button>

                                              {/* Edit button (only for own text messages) */}
                                              {isMe &&
                                                message.message_type ===
                                                  "text" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      console.log(
                                                        "Edit clicked",
                                                        message
                                                      );
                                                      startEditingMessage(
                                                        message
                                                      );
                                                      setActiveMenu(null);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                  >
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      width="14"
                                                      height="14"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      className="mr-2"
                                                    >
                                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    Edit
                                                  </button>
                                                )}

                                              {/* Delete button (only for own messages) */}
                                              {isMe && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    console.log(
                                                      "Delete clicked",
                                                      message
                                                    );
                                                    if (
                                                      confirm(
                                                        "Are you sure you want to delete this message?"
                                                      )
                                                    ) {
                                                      deleteMessage(message.id);
                                                    }
                                                    setActiveMenu(null);
                                                  }}
                                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mr-2"
                                                  >
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                  </svg>
                                                  Delete
                                                </button>
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                )}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Message input */}
              <div className="p-3 bg-white border-t">
                {/* Reply/Edit indicator */}
                {replyTo && (
                  <div className="flex items-center justify-between p-2 mb-2 bg-gray-100 rounded">
                    <div>
                      <span className="text-sm font-medium text-blue-600">
                        {replyTo.mode === "edit"
                          ? "Editing message"
                          : `Replying to ${replyTo.sender}`}
                      </span>
                      <p className="text-sm text-gray-600 truncate">
                        {replyTo.text}
                      </p>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* File preview */}
                {/* File previews */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative inline-block"
                      >
                        {attachment.type === "image" && attachment.preview ? (
                          <img
                            src={attachment.preview}
                            alt="Upload preview"
                            className="object-cover w-20 h-20 border rounded"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-20 h-20 bg-gray-100 border rounded">
                            {attachment.type === "document" ? (
                              <FileText size={24} className="text-gray-500" />
                            ) : attachment.type === "audio" ? (
                              <Music size={24} className="text-gray-500" />
                            ) : (
                              <FileIcon size={24} className="text-gray-500" /> // Use FileIcon instead
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute p-1 bg-white rounded-full shadow top-1 right-1"
                        >
                          <X size={12} />
                        </button>
                        <span className="block text-xs truncate max-w-[80px]">
                          {attachment.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Attachment button */}
                  <div className="relative">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 text-gray-500 rounded-full hover:text-blue-500 hover:bg-gray-100"
                    >
                      <Paperclip size={20} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                  </div>

                  {/* Message input */}
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message"
                      className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32 min-h-[48px] resize-y"
                      rows={1}
                    ></textarea>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute text-gray-500 right-3 bottom-3 hover:text-blue-500"
                    >
                      <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute right-0 mb-2 bottom-full">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setMessageInput((prev) => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Send button */}
                  <button
                    onClick={
                      replyTo?.mode === "edit" ? saveMessageEdit : sendMessage
                    }
                    disabled={!messageInput.trim() && attachments.length === 0}
                    className={`p-2 rounded-full ${
                      !messageInput.trim() && attachments.length === 0
                        ? "bg-gray-200 text-gray-400"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No active conversation
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
                <h2 className="mb-2 text-xl font-semibold">
                  No conversation selected
                </h2>
                <p className="mb-4 text-gray-600">
                  Select a conversation from the list or start a new one to
                  begin chatting.
                </p>
                <button
                  onClick={toggleSidebar}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg md:hidden hover:bg-blue-600"
                >
                  View Conversations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
