import React, { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import notificationMessageSound from "../assets/sounds/notification.mp3";
import notificationSound from "../assets/sounds/notification-2.wav";

const NotificationSound = () => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [audioReady, setAudioReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const messageAudioRef = useRef(null);
  const notificationAudioRef = useRef(null);
  
  // Create audio elements on component mount
  useEffect(() => {
    // Check if notifications are enabled in localStorage
    const savedPreference = localStorage.getItem("notificationsEnabled");
    if (savedPreference !== null) {
      setNotificationsEnabled(savedPreference === "true");
    }
    
    // Create audio elements
    messageAudioRef.current = new Audio(notificationMessageSound);
    notificationAudioRef.current = new Audio(notificationSound);
    
    // Add event listeners
    const handleCanPlay = () => {
      console.log("Audio is ready to play");
      setAudioReady(true);
    };
    
    const handleError = (e) => {
      console.error("Audio error:", e);
    };
    
    messageAudioRef.current.addEventListener("canplaythrough", handleCanPlay);
    messageAudioRef.current.addEventListener("error", handleError);
    notificationAudioRef.current.addEventListener("canplaythrough", handleCanPlay);
    notificationAudioRef.current.addEventListener("error", handleError);
    
    // Preload audio
    messageAudioRef.current.load();
    notificationAudioRef.current.load();
    
    return () => {
      if (messageAudioRef.current) {
        messageAudioRef.current.removeEventListener("canplaythrough", handleCanPlay);
        messageAudioRef.current.removeEventListener("error", handleError);
      }
      if (notificationAudioRef.current) {
        notificationAudioRef.current.removeEventListener("canplaythrough", handleCanPlay);
        notificationAudioRef.current.removeEventListener("error", handleError);
      }
    };
  }, []);
  
  // Enable audio playback through user interaction
  useEffect(() => {
    const enableAudio = () => {
      const enableWithVolume = async (audioRef) => {
        if (!audioRef.current) return;
        
        audioRef.current.volume = 0;
        try {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.volume = 1;
        } catch (err) {
          console.log("Audio initialization failed:", err);
        }
      };
      
      enableWithVolume(messageAudioRef);
      enableWithVolume(notificationAudioRef);
    };
    
    document.addEventListener("click", enableAudio, { once: true });
    return () => document.removeEventListener("click", enableAudio);
  }, []);
  
  // Set up Pusher for notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
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
    
    const userId = getUserIdFromToken(token);
    if (!userId) return;
    
    // Initialize Pusher
    const pusherClient = new Pusher("a579dc17c814f8b723ea", {
      cluster: "ap1",
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          const formData = new FormData();
          formData.append("socket_id", socketId);
          formData.append("channel_name", channel.name);
          
          fetch(`${apiUrl}/api/pusher/auth`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => callback(null, data))
            .catch((error) => callback(error, null));
        },
      }),
    });
    
    // Subscribe to user's private channel
    const userChannel = pusherClient.subscribe(`private-user-${userId}`);
    
    // Set up notification handlers
    userChannel.bind("new-message-notification", () => {
      playSound(messageAudioRef);
    });
    
    userChannel.bind("new-notification", () => {
      playSound(notificationAudioRef);
    });
    
    return () => {
      userChannel.unbind_all();
      pusherClient.unsubscribe(`private-user-${userId}`);
      pusherClient.disconnect();
    };
  }, [notificationsEnabled]);
  
  // Generic function to play notification sounds
  const playSound = (audioRef) => {
    if (!audioRef.current || !notificationsEnabled) return;
    
    console.log("Playing notification sound");
    audioRef.current.currentTime = 0;
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("Failed to play notification sound:", err);
      });
    }
  };
  
  // Toggle notifications function - can be exposed to parent components
  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem("notificationsEnabled", newState.toString());
  };
  
  return null;
};

export default NotificationSound;