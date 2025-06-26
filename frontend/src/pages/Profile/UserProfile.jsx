import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Case from "../../components/Case";
import axios from "axios";
import Alert from "../../components/Auth/alert";
import ProfileSidebar from "../../components/UserProfile/ProfileSidebar";
import ProfileAbout from "../../components/UserProfile/ProfileAbout";
import ProfileExperience from "../../components/UserProfile/ProfileExperience";
import ProfileEducation from "../../components/UserProfile/ProfileEducation";
import ProfilePosts from "../../components/UserProfile/ProfilePosts";
import ContactModal from "../../components/UserProfile/ContactModal";
import ProfileContactModal from "../../components/UserProfile/ProfileContactModal";
import ProfileSocialMedia from "@/components/Profile/ProfileSocialMedia";
import {
  User,
  Calendar,
  Briefcase,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bookmark,
  GraduationCap,
  Pencil,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  ThumbsUp,
  MessageCircle,
  Share2,
  Mail,
  Phone,
  MapPin,
  Building,
  Link2,
  X,
} from "lucide-react";

const socialPlatforms = [
  {
    name: "instagram",
    icon: <Instagram className="w-5 h-5" />,
    color: "text-pink-500",
  },
  {
    name: "facebook",
    icon: <Facebook className="w-5 h-5" />,
    color: "text-blue-500",
  },
  {
    name: "twitter",
    icon: <Twitter className="w-5 h-5" />,
    color: "text-blue-400",
  },
  {
    name: "linkedin",
    icon: <Linkedin className="w-5 h-5" />,
    color: "text-blue-700",
  },
  { name: "github", icon: <Github className="w-5 h-5" />, color: "text-black" },
];

export default function UserProfile() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const { username } = useParams();
  const [profileImage, setProfileImage] = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [showContactModal, setShowContactModal] = useState(false);
  // Experience, Education, Posts
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // State
  const [user, setUser] = useState({
    id: "",
    name: "",
    headline: "",
    about: "",
    skills: [],
    socials: {},
    photo: null,
    email: "",
    phone: "",
    location: "",
    organization: "",
    website: "",
    birthdate: "",
    gender: "",
  });

  // Alert helper
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ ...alert, show: false }), 4000);
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/api/user-profile/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        const socialsObject = {};
        if (data.socials && Array.isArray(data.socials)) {
          data.socials.forEach((social) => {
            socialsObject[social.platform] = social.username;
          });
        }
        let userSkills = [];
        if (data.skills) {
          if (Array.isArray(data.skills)) userSkills = data.skills;
          else if (data.skills.String) userSkills = [data.skills.String];
        }
        setUser({
          id: data.id || "",
          name: data.name || "",
          headline: data.headline || "",
          about: data.about || "",
          skills: userSkills,
          socials: socialsObject,
          photo: data.photo || null,
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          organization: data.organization || "",
          website: data.website || "",
          birthdate: data.birthdate || "",
          gender: data.gender || "",
        });
        setProfileImage(data.photo || null);
        setIsConnected(data.is_connected);
      } catch (error) {
        showAlert("error", "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // Fetch connections count & status
  const fetchConnections = useCallback(async () => {
    if (!user.id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/api/users/${user.id}/connections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConnectionsCount(res.data.data.total || 0);
      setConnectionStatus(res.data.data.connection_status);
    } catch {
      setIsConnected(false);
      setConnectionStatus(null);
    }
  }, [user.id, apiUrl]);

  // Fetch experience, education, posts
  useEffect(() => {
    if (!user.id) return;
    fetchConnections();
    const token = localStorage.getItem("token");
    // Experience
    axios
      .get(`${apiUrl}/api/users/${user.id}/experience?limit=10&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExperiences(res.data.data.experiences || []))
      .catch(() => setExperiences([]));
    // Education
    axios
      .get(`${apiUrl}/api/users/${user.id}/education`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEducations(res.data.data.educations || []))
      .catch(() => setEducations([]));
    // Posts
    axios
      .get(`${apiUrl}/api/users/${user.id}/posts?limit=10&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserPosts(res.data.data || []))
      .catch(() => setUserPosts([]));
  }, [user.id, fetchConnections, apiUrl]);

  // Connect handler
  // ...existing code...
  // ...existing code...
  const handleConnectWithUser = async () => {
    if (!user.id) return;
    setLoadingConnection(true);
    // Optimistic update: langsung set pending agar tombol berubah
    setConnectionStatus("pending");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${apiUrl}/api/users/${user.id}/connect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Ambil status dari response, fallback ke "pending" jika tidak ada
      const newStatus = res.data.data?.status || "pending";
      setConnectionStatus(newStatus);
      if (newStatus === "connected") {
        showAlert("success", "Connected successfully!");
      } else if (newStatus === "pending") {
        showAlert("success", "Connection request sent!");
      } else {
        showAlert("success", "Request sent!");
      }
      await fetchConnections();
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus(null);
      showAlert(
        "error",
        error.response?.data?.data || "Users are already connected"
      );
    } finally {
      setLoadingConnection(false);
    }
  };
  // ...existing code...
  // ...existing code...

  const handleDisconnect = async () => {
    console.log("Tombol Disconnect diklik untuk user:", user.id, user.name);
    setDisconnectLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/users/${user.id}/connect`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorData = {};
        // Hanya parse JSON jika ada body
        const text = await res.text();
        if (text) {
          try {
            errorData = JSON.parse(text);
          } catch {}
        }
        showAlert("error", errorData.message || "Failed to disconnect");
        console.error("Disconnect error:", errorData);
        return;
      }

      setShowDisconnectModal(false);
      showAlert("success", "Disconnected successfully!");
    } catch (err) {
      showAlert("error", "Failed to disconnect");
      console.error("Disconnect error:", err);
    } finally {
      setDisconnectLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#EDF3F7] min-h-screen pb-10">
      <Case />
      <div className="w-full px-4 py-6 mx-auto sm:px-6">
        <div className="flex flex-col justify-center max-w-6xl gap-6 mx-auto md:flex-row">
          <div className="fixed top-4 right-4 z-50">
            <Alert
              type={alert.type}
              message={alert.message}
              isVisible={alert.show}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          </div>
          {/* Sidebar */}
          <ProfileSidebar
            user={user}
            profileImage={profileImage}
            apiUrl={apiUrl}
            username={username}
            connectionsCount={connectionsCount}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            loadingConnection={loadingConnection}
            handleConnectWithUser={handleConnectWithUser}
            setShowContactModal={setShowContactModal}
            handleDisconnect={handleDisconnect}
            disconnectLoading={disconnectLoading}
            setShowDisconnectModal={setShowDisconnectModal}
            showDisconnectModal={showDisconnectModal}
          />
          {/* Main Content */}
          <div className="w-full space-y-4 md:w-2/3">
            <ProfileAbout user={user} />
            <ProfileExperience experiences={experiences} apiUrl={apiUrl} />
            <ProfileEducation educations={educations} apiUrl={apiUrl} />
            <ProfilePosts
              userPosts={userPosts}
              user={user}
              profileImage={profileImage}
              apiUrl={apiUrl}
              username={username}
            />
          </div>
        </div>
      </div>
      <ProfileContactModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        user={user}
      />
    </div>
  );
}
