import React, { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
// Import directly from assets (assuming you have this file)
import notificationSound from "../assets/sounds/notification.mp3";

const NotificationSound = () => {
    const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  console.log("NotificationSound component mounted");
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);

  // Create audio on component mount
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();

    // Set the source to the imported sound file
    audioRef.current.src = notificationSound;

    // Add event listeners for better debugging
    audioRef.current.addEventListener("canplaythrough", () => {
      console.log("Audio is ready to play");
      setAudioReady(true);
    });

    audioRef.current.addEventListener("error", (e) => {
      console.error("Audio error:", e);
    });

    // Preload the audio
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("canplaythrough", () => {});
        audioRef.current.removeEventListener("error", () => {});
      }
    };
  }, []);

  useEffect(() => {
    // Enable audio playback through user interaction
    const enableAudio = () => {
      // This empty play/pause sequence helps to enable audio on some browsers
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current
          .play()
          .then(() => {
            audioRef.current.pause();
            audioRef.current.volume = 1;
            console.log("Audio playback enabled");
          })
          .catch((err) => {
            console.log("Audio initialization failed:", err);
          });
      }
    };

    // Add event listener for user interaction
    document.addEventListener("click", enableAudio, { once: true });

    return () => {
      document.removeEventListener("click", enableAudio);
    };
  }, []);

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
      authorizer: (channel) => {
        return {
          authorize: (socketId, callback) => {
            const formData = new FormData();
            formData.append("socket_id", socketId);
            formData.append("channel_name", channel.name);

            fetch(`${apiUrl}/api/pusher/auth`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                callback(null, data);
              })
              .catch((error) => {
                callback(error, null);
              });
          },
        };
      },
    });

    // Subscribe to user's private channel
    const userChannel = pusherClient.subscribe(`private-user-${userId}`);

    // Play sound when receiving a new message notification
    userChannel.bind("new-message-notification", (data) => {
      playNotificationSound();
    });

    return () => {
      userChannel.unbind_all();
      pusherClient.unsubscribe(`private-user-${userId}`);
      pusherClient.disconnect();
    };
  }, []);

  const playNotificationSound = () => {
    if (!audioRef.current) return;

    console.log("Attempting to play notification sound");
    audioRef.current.currentTime = 0;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("Failed to play notification sound:", err);
      });
    }
  };

  // Add a debug button in development
  return null;
};

export default NotificationSound;
