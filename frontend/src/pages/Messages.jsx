import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Pusher from "pusher-js";
import EmojiPicker from "emoji-picker-react";
import {
  Send,
  Paperclip,
  Smile,
  ChevronLeft,
  Check,
  FileText,
  Music,
  File as FileIcon,
  X,
} from "lucide-react";

export const Messages = () => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [connections, setConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const isUserScrolling = useRef(false);
  const isInitialRenderRef = useRef(true);
  const lastScrollHeightRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeMenu &&
        !e.target.closest("[data-menu-button]") &&
        !e.target.closest("[data-menu-content]")
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollPositionRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Format date function with error handling
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      if (date.toDateString() === now.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  // Format time with error handling
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "";
    }
  };

  // Updated groupMessagesByDate with error handling
  const groupMessagesByDate = (messages) => {
    if (!Array.isArray(messages)) return {};

    try {
      // First, ensure messages are sorted by created_at timestamp
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      // Group by date
      return sortedMessages.reduce((groups, message) => {
        try {
          if (!message.created_at) return groups;

          const date = formatDate(message.created_at);
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(message);
          return groups;
        } catch (error) {
          console.error("Error processing message in group:", error);
          return groups;
        }
      }, {});
    } catch (error) {
      console.error("Error grouping messages by date:", error);
      return {};
    }
  };

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

  // Initialize Pusher
  useEffect(() => {
    if (!token) return;

    console.log("Initializing Pusher connection...");
    const pusherClient = new Pusher("a579dc17c814f8b723ea", {
      cluster: "ap1",
      authorizer: (channel) => {
        return {
          authorize: (socketId, callback) => {
            const formData = new FormData();
            formData.append("socket_id", socketId);
            formData.append("channel_name", channel.name);

            fetch(apiUrl + "/api/pusher/auth", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => callback(null, data))
              .catch((error) => callback(error, null));
          },
        };
      },
    });

    // Add connection status events
    pusherClient.connection.bind("connected", () => {
      console.log("✅ Connected to Pusher");
    });

    pusherClient.connection.bind("connecting", () => {
      console.log("⏳ Connecting to Pusher...");
    });

    pusherClient.connection.bind("disconnected", () => {
      console.log("❌ Disconnected from Pusher");
    });

    pusherClient.connection.bind("error", (err) => {
      console.error("❌ Pusher connection error:", err);
    });

    // Set pusher state
    setPusher(pusherClient);

    // Get current user ID from token
    const userId = getUserIdFromToken(token);
    console.log("Subscribing to user channel:", `private-user-${userId}`);

    // Subscribe to user's private channel with proper error handling
    try {
      const userChannel = pusherClient.subscribe(`private-user-${userId}`);

      userChannel.bind("pusher:subscription_succeeded", () => {
        console.log("✅ Successfully subscribed to user channel");
      });

      userChannel.bind("pusher:subscription_error", (error) => {
        console.error("❌ Error subscribing to user channel:", error);
      });

      // Handle new conversation
      userChannel.bind("new-conversation", (data) => {
        console.log("📩 New conversation received:", data);
        handleNewConversation(data);
      });

      setChannels((prev) => ({ ...prev, user: userChannel }));
    } catch (error) {
      console.error("Error subscribing to user channel:", error);
    }

    return () => {
      if (pusherClient) {
        if (channels.user) {
          channels.user.unbind_all();
          pusherClient.unsubscribe(`private-user-${userId}`);
        }
        if (channels.conversation) {
          channels.conversation.unbind_all();
          pusherClient.unsubscribe(
            `private-conversation-${channels.conversationId}`
          );
        }
        pusherClient.disconnect();
      }
    };
  }, []);

  const openNewConversationModal = () => {
    fetchConnections();
    setShowNewConversationModal(true);
  };

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConnections = async () => {
    setConnectionsLoading(true);
    try {
      const userId = getUserIdFromToken(token);
      const response = await axios.get(
        `${apiUrl}/api/users/${userId}/connections?limit=50&offset=0`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.connections
      ) {
        setConnections(response.data.data.connections);
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl + "/api/conversations?limit=40&offset=0",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.conversations
      ) {
        // Sort by last message timestamp (newest first)
        const sortedConversations = response.data.data.conversations.sort(
          (a, b) => {
            const aTime = a.last_message?.created_at || a.updated_at;
            const bTime = b.last_message?.created_at || b.updated_at;
            return new Date(bTime) - new Date(aTime);
          }
        );

        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationById = async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data) {
        setActiveConversation(response.data.data);
        setIsInitialLoad(true);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      // First try to find in existing conversations
      if (conversations.length > 0) {
        const found = conversations.find(
          (c) => c.id === parseInt(conversationId)
        );
        if (found) {
          setActiveConversation(found);
          setIsInitialLoad(true);
        } else {
          fetchConversationById(conversationId);
        }
      } else {
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
      setShouldScrollToBottom(true);
      setIsInitialLoad(true);
      isInitialRenderRef.current = true;

      fetchMessages();
      subscribeToConversation(activeConversation.id);
      markConversationAsRead(activeConversation.id);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeConversation?.id]); // Only depend on conversation ID, not the entire object

  // Load more messages when page changes (but only if it's not the initial page)
  useEffect(() => {
    if (page > 0 && activeConversation) {
      // Save current scroll position before loading more messages
      if (messagesContainerRef.current) {
        lastScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
        scrollPositionRef.current = {
          scrollTop: messagesContainerRef.current.scrollTop,
          scrollHeight: messagesContainerRef.current.scrollHeight,
        };
      }

      setShouldScrollToBottom(false);
      fetchMessages();
    }
  }, [page]);

  // Update scroll position after loading more messages (for pagination)
  useEffect(() => {
    if (messagesLoading) {
      return;
    }

    // Only run after messages have loaded
    if (
      !isInitialLoad &&
      !shouldScrollToBottom &&
      scrollPositionRef.current &&
      messagesContainerRef.current
    ) {
      const container = messagesContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const oldScrollHeight = scrollPositionRef.current.scrollHeight;
      const oldScrollTop = scrollPositionRef.current.scrollTop;

      // Calculate new position: maintain the same relative position
      const newPosition = newScrollHeight - oldScrollHeight + oldScrollTop;

      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        container.scrollTop = newPosition;
        // Reset user scrolling after programmatic scroll
        isUserScrolling.current = false;
      }, 10);
    } else if (shouldScrollToBottom && messagesEndRef.current) {
      // Scroll to bottom for new messages or initial load
      setTimeout(() => {
        scrollToBottom();
        isInitialRenderRef.current = false;
      }, 100);
    }
  }, [messages, messagesLoading, isInitialLoad, shouldScrollToBottom]);

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
        console.log("✅ Successfully subscribed to conversation channel");
      });

      conversationChannel.bind("pusher:subscription_error", (error) => {
        console.error("❌ Error subscribing to conversation channel:", error);
      });

      // Bind events with debug logging
      conversationChannel.bind("new-message", (message) => {
        console.log("📩 New message received:", message);
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
        `${apiUrl}/api/conversations/${
          activeConversation.id
        }/messages?limit=40&offset=${page * 40}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add a null check here
      const newMessages = response.data.data?.messages || [];

      // Sort the newly fetched messages by created_at timestamp
      const sortedNewMessages = [...newMessages].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      // If this is the first page, replace messages
      if (page === 0) {
        setMessages(sortedNewMessages);
      } else {
        // For additional pages (scrolling up), add to beginning and ensure order is maintained
        setMessages((prevMessages) => {
          // Combine all messages and sort them chronologically
          const allMessages = [...sortedNewMessages, ...prevMessages];
          return allMessages.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        });
      }

      setHasMore(newMessages.length === 40);
      setIsInitialLoad(page === 0);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchReplyMessage = async (message) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/messages/${message.reply_to_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data) {
        // Add reply_to data to the message
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
        `${apiUrl}/api/conversations/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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

  // Add this new function with improved scroll detection
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user is near bottom (within 300px of the bottom)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      300;

    // Show/hide scroll button based on position
    setShowScrollBottom(!isNearBottom);

    // Rest of your existing scroll handler...
    if (messagesLoading || !hasMore || isUserScrolling.current) return;

    // Clear any pending timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set debounced scroll handler for pagination
    scrollTimeoutRef.current = setTimeout(() => {
      if (container.scrollTop <= 100) {
        // Only load more if we're near the top
        setPage((prevPage) => prevPage + 1);
      }
      isUserScrolling.current = false;
    }, 200);
  };

  const scrollToBottomButton = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollBottom(false);
    }
  };

  // Pusher event handlers
  const handleNewConversation = (data) => {
    setConversations((prev) => [data, ...prev]);
  };

  // Update the handleNewMessage function to move conversations with new messages to the top
  const handleNewMessage = (message) => {
    // If the message has a reply_to_id, fetch the replied message data
    if (message.reply_to_id) {
      fetchReplyMessage(message);
    }

    const currentUserId = getUserIdFromToken(token);
    const isFromCurrentUser = message.sender_id === currentUserId;

    // Add new message to current conversation
    if (
      activeConversation &&
      activeConversation.id === message.conversation_id
    ) {
      setMessages((prev) => {
        // Add new message and ensure chronological sorting
        const updatedMessages = [...prev, message];
        return updatedMessages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      });

      // For new messages, trigger a scroll to bottom
      if (!isFromCurrentUser || isFromCurrentUser) {
        setShouldScrollToBottom(true);
      }

      // Auto-mark as read if the message is not from the current user
      if (!isFromCurrentUser) {
        markConversationAsRead(message.conversation_id);
      }
    }

    // Update conversation list with new last message and move to top
    setConversations((prev) => {
      // Find the conversation that received the new message
      const updatedConversations = [...prev];
      const conversationIndex = updatedConversations.findIndex(
        (conv) => conv.id === message.conversation_id
      );

      if (conversationIndex > -1) {
        // Get the conversation
        const conversation = updatedConversations[conversationIndex];

        // Update the conversation with the new message
        const updatedConversation = {
          ...conversation,
          last_message: message,
          updated_at: message.created_at,
          unread_count:
            isFromCurrentUser ||
            (activeConversation &&
              activeConversation.id === message.conversation_id)
              ? 0
              : (conversation.unread_count || 0) + 1,
        };

        // Remove the conversation from its current position
        updatedConversations.splice(conversationIndex, 1);

        // Add it to the beginning of the array (top of the list)
        updatedConversations.unshift(updatedConversation);

        return updatedConversations;
      }

      return prev; // If conversation not found, return unchanged
    });
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
          ? { ...msg, deleted_at: new Date().toISOString(), content: "" }
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
              deleted_at: new Date().toISOString(),
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
    const currentUserId = getUserIdFromToken(token);
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

  // Scroll to bottom of messages - simplified to avoid unnecessary calls
  const scrollToBottom = () => {
    if (messagesEndRef.current && !isUserScrolling.current) {
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
          id: Date.now() + Math.random(),
          file: file,
          type: fileType,
          name: file.name,
          preview: fileType === "image" ? null : null,
        };

        // Add to attachments array
        newAttachments.push(attachment);

        // Generate preview for images
        if (fileType === "image") {
          const reader = new FileReader();
          reader.onload = (e) => {
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === attachment.id
                  ? { ...att, preview: e.target.result }
                  : att
              )
            );
            // Set as file preview if first image
            if (!filePreview) {
              setFilePreview(e.target.result);
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
            `${apiUrl}/api/conversations/${activeConversation.id}/files`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
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
          `${apiUrl}/api/conversations/${activeConversation.id}/messages`,
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
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Clear attachments and enable scroll to bottom for the new message
      setAttachments([]);
      setFilePreview(null);
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${apiUrl}/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        `${apiUrl}/api/messages/${replyTo.id}`,
        {
          content: messageInput,
          message_type: "text",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
          (p) => p && p.user && p.user_id !== getUserIdFromToken(token)
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
  const startNewConversation = async (userId, initialMessage = "Hello!") => {
    try {
      // First, check if a conversation with this user already exists
      const existingConversation = conversations.find((conversation) => {
        // Make sure the conversation has participants
        if (
          !conversation.participants ||
          !Array.isArray(conversation.participants)
        ) {
          return false;
        }

        // Check if the selected user is a participant in this conversation
        return conversation.participants.some(
          (participant) => participant.user_id === userId
        );
      });

      // If conversation exists, navigate to it
      if (existingConversation) {
        console.log("Conversation already exists, redirecting...");
        setActiveConversation(existingConversation);
        navigate(`/messages/${existingConversation.id}`);
        setShowNewConversationModal(false);
        return;
      }

      // Otherwise, create a new conversation
      const response = await axios.post(
        apiUrl + "/api/conversations",
        {
          participant_ids: [userId],
          initial_message: initialMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newConversation = response.data.data;
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      navigate(`/messages/${newConversation.id}`);
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

  useEffect(() => {
    const handleResize = () => {
      // On mobile, hide sidebar when conversation is active
      // On larger screens, always show sidebar
      if (window.innerWidth < 768 && conversationId) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    // Run once on component mount and when conversationId changes
    handleResize();

    // Also respond to window resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [conversationId]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div
        className={`bg-[#00AEEF] text-white p-4 shadow-md ${
          window.innerWidth < 768 && conversationId ? "hidden md:block" : ""
        }`}
      >
        <div className="container flex items-center justify-between mx-auto">
          {!conversationId && (
            <button
              onClick={() => navigate("/")}
              className="p-2 -ml-2 rounded-full hover:bg-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="w-8"></div> {/* Spacer for alignment */}
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
          <div className="flex items-center gap-2 p-4 border-b">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full p-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={openNewConversationModal}
              className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
              title="New conversation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
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
                    p && p.user_id && p.user_id !== getUserIdFromToken(token)
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
                          src={`${apiUrl}/${otherParticipant.photo}`}
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
                          {conversation.last_message ? (
                            conversation.last_message.deleted ||
                            conversation.last_message.deleted_at ? (
                              <span className="italic">
                                Pesan telah dihapus
                              </span>
                            ) : conversation.last_message.message_type ===
                              "text" ? (
                              <>
                                {conversation.last_message.sender_id ===
                                getUserIdFromToken(token)
                                  ? "You: "
                                  : ""}
                                {conversation.last_message.content}
                              </>
                            ) : (
                              `[${conversation.last_message.message_type}]`
                            )
                          ) : (
                            "No messages yet"
                          )}
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
                  .filter((p) => p.user_id !== getUserIdFromToken(token))
                  .slice(0, 1)
                  .map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-300 rounded-full">
                        {participant.user.photo ? (
                          <img
                            src={`${apiUrl}/${participant.user.photo}`}
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
                {messagesLoading && page > 0 && (
                  <div className="flex items-center justify-center h-12 mb-2">
                    <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}

                {messagesLoading && page === 0 ? (
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
                        <div className="sticky top-0 z-10 flex justify-center my-2">
                          <span className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded-full shadow-sm">
                            {date}
                          </span>
                        </div>
                        {/* Messages for this date */}
                        {[...dateMessages].map((message) => {
                          const isMe =
                            message.sender_id === getUserIdFromToken(token);
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
                                      {message.reply_to.deleted_at ? (
                                        <span className="italic text-gray-500">
                                          Pesan ini dihapus
                                        </span>
                                      ) : message.reply_to.message_type ===
                                        "text" ? (
                                        message.reply_to.content
                                      ) : (
                                        `[${message.reply_to.message_type}]`
                                      )}
                                    </p>
                                  </div>
                                )}
                                {/* Message content based on type */}
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
                                      src={`${apiUrl}/${message.file_path}`}
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
                                      href={`${apiUrl}/${message.file_path}`}
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
                                      src={`${apiUrl}/${message.file_path}`}
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
                                                top: `${activeMenu.position.top}px`,
                                                left: `${activeMenu.position.left}px`,
                                              }}
                                            >
                                              {/* Reply button */}
                                              <button
                                                type="button"
                                                onClick={() => {
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

                {showScrollBottom && (
                  <button
                    onClick={scrollToBottomButton}
                    className="fixed z-50 flex items-center justify-center p-3 transition-all duration-200 bg-white rounded-full shadow-lg bottom-24 right-8 hover:bg-gray-100"
                    aria-label="Scroll to newest messages"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-700"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                  </button>
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
                              <FileIcon size={24} className="text-gray-500" />
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

      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">New Conversation</h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {connectionsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : connections.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="mb-2">You don't have any connections yet.</p>
                <p>Connect with people first to start a conversation.</p>
                <button
                  onClick={() => {
                    setShowNewConversationModal(false);
                    navigate("/connections");
                  }}
                  className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Find Connections
                </button>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search connections..."
                    className="w-full p-2 border rounded-lg"
                    onChange={(e) => {
                      /* Add search function if needed */
                    }}
                  />
                </div>
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        startNewConversation(connection.user.id);
                        setShowNewConversationModal(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-12 h-12 mr-3 overflow-hidden bg-gray-300 rounded-full">
                        {connection.user.photo ? (
                          <img
                            src={`${apiUrl}/${connection.user.photo}`}
                            alt={connection.user.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {connection.user.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{connection.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {connection.user.headline || connection.user.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
