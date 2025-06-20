"use client";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Case from "../../components/Case";
import Alert from "../../components/Auth/alert";
import ProfileSidebar from "../../components/Profile/ProfileSidebar";
import ProfileSkills from "../../components/Profile/ProfileSkills";
import ProfileSocialMedia from "../../components/Profile/ProfileSocialMedia";
import ProfileAbout from "../../components/Profile/ProfileAbout";
import ProfileExperience from "../../components/Profile/ProfileExperience";
import ProfileEducation from "../../components/Profile/ProfileEducation";
import ProfilePosts from "../../components/Profile/ProfilePosts";
import ContactModal from "../../components/Profile/ContactModal";
import {
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
import axios from "axios";

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

export default function ProfilePage() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditEducationModal, setEditShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [educations, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [editingExperience, setEditingExperience] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [profileViews, setProfileViews] = useState({
    thisWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
    dailyViews: [],
  });
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const showAlert = (type, message) => {
    setAlert({
      show: true,
      type,
      message,
    });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }));
  };
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

  // Education Form State
  const [educationForm, setEducationForm] = useState({
    major: "",
    institute_name: "",
    location: "",
    start_month: "Month",
    start_year: "Year",
    end_month: "Month",
    end_year: "Year",
    caption: "",
    schoolLogo: null,
  });

  // Experience Form State
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    start_month: "Month",
    start_year: "Year",
    end_month: "Month",
    end_year: "Year",
    caption: "",
    photo: null,
  });

  // Date options
  const months = [
    "Month",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [
    "Year",
    ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i),
  ];

  const fetchConnections = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const connectionsData = response.data.data.connections || [];
      setConnections(connectionsData);
      setConnectionsCount(response.data.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      showAlert("error", "Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileViews = async () => {
    try {
      const token = localStorage.getItem("token");
      const [thisWeekResponse, lastWeekResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/user/profile/views/this-week`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/api/user/profile/views/last-week`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const thisWeekData = thisWeekResponse.data.data || {};
      const lastWeekData = lastWeekResponse.data.data || {};

      const days = [];
      const dailyCounts = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        days.push(formattedDate);

        const dailyViews =
          thisWeekData.viewers?.filter(
            (viewer) =>
              new Date(viewer.viewed_at).toISOString().split("T")[0] ===
              formattedDate
          ) || [];

        dailyCounts.push(dailyViews.length);
      }

      const thisWeekTotal = thisWeekData.count || 0;
      const lastWeekTotal = lastWeekData.count || 0;

      let percentageChange = 0;
      if (lastWeekTotal > 0) {
        percentageChange =
          ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      } else if (thisWeekTotal > 0) {
        percentageChange = 100;
      }

      setProfileViews({
        thisWeek: thisWeekTotal,
        lastWeek: lastWeekTotal,
        percentageChange: Math.round(percentageChange),
        dailyViews: thisWeekData.viewers || [],
      });
    } catch (error) {
      console.error("Failed to fetch profile views:", error);
      showAlert("error", "Failed to load profile views");
    }
  };

  const fetchUserPosts = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${userId}/posts?limit=10&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserPosts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
      showAlert("error", "Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      setIsLoading(true);

      try {
        const response = await axios.get(apiUrl + "/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data.data;

        // Convert socials array to object
        const socialsObject = {};
        if (data.socials && Array.isArray(data.socials)) {
          data.socials.forEach((social) => {
            socialsObject[social.platform] = social.username;
          });
        }

        // Handle skills data
        let userSkills = [];
        if (data.skills) {
          if (Array.isArray(data.skills)) {
            userSkills = data.skills;
          } else if (data.skills.String) {
            userSkills = [data.skills.String];
          }
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

        // Record view when profile is loaded
        await recordProfileView();
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        showAlert("error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    const recordProfileView = async () => {
      const token = localStorage.getItem("token");
      try {
        await axios.post(
          `${apiUrl}/api/user/profile/views`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to record profile view:", error);
      }
    };

    fetchProfile();
  }, []);

  const fetchEducations = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/education`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEducation(response.data.data.educations);
    } catch (error) {
      console.error("Failed to fetch education:", error);
      showAlert("error", "Failed to load education data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExperiences = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/experience?limit=10&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExperiences(
        Array.isArray(response.data.data.experiences)
          ? response.data.data.experiences
          : []
      );
    } catch (error) {
      console.error("Failed to fetch experience:", error);
      showAlert("error", "Failed to load experience data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchConnections();
      fetchProfileViews();
      fetchEducations();
      fetchExperiences();
      fetchUserPosts();
    }
  }, [user.id]);
  // Handle Education Form Submission
  // Handle Experience Form Submission
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("job_title", experienceForm.job_title);
      formData.append("company_name", experienceForm.company_name);
      formData.append("location", experienceForm.location);
      formData.append("start_month", experienceForm.start_month);
      formData.append("start_year", experienceForm.start_year);
      formData.append("end_month", experienceForm.end_month);
      formData.append("end_year", experienceForm.end_year);
      formData.append("caption", experienceForm.caption);

      if (experienceForm.photo instanceof File) {
        formData.append("photo", experienceForm.photo);
      }

      // If editing, make PUT request
      if (editingExperience) {
        const response = await axios.put(
          `${apiUrl}/api/experience/${editingExperience.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === editingExperience.id ? response.data.data : exp
          )
        );
        toast.success("Experience updated successfully!");
        setEditingExperience(null);
      } else {
        // If adding new, make POST request
        const response = await axios.post(
          apiUrl + "/api/experience",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExperiences((prev) => [...prev, response.data.data]);
        showAlert("success", "Experience added successfully!");
      }

      // Reset form and close modal
      setShowExperienceModal(false);
      setExperienceForm({
        job_title: "",
        company_name: "",
        location: "",
        start_month: "Month",
        start_year: "Year",
        end_month: "Month",
        end_year: "Year",
        caption: "",
        photo: null,
      });
    } catch (error) {
      console.error("Failed to add/update experience:", error);
      showAlert(
        "error",
        `Failed to ${editingExperience ? "update" : "add"} experience. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Education Form Submission
  const handleEducationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("major", educationForm.major);
      formData.append("institute_name", educationForm.institute_name);
      formData.append("location", educationForm.location);
      formData.append("start_month", educationForm.start_month);
      formData.append("start_year", educationForm.start_year);
      formData.append("end_month", educationForm.end_month);
      formData.append("end_year", educationForm.end_year);
      formData.append("caption", educationForm.caption);

      if (educationForm.schoolLogo instanceof File) {
        formData.append("photo", educationForm.schoolLogo);
      }

      if (editingEducation) {
        // Edit existing education
        const response = await axios.put(
          `${apiUrl}/api/education/${editingEducation.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEducation((prev) =>
          prev.map((edu) =>
            edu.id === editingEducation.id ? response.data.data : edu
          )
        );
        showAlert("success", "Education updated successfully!");
        setEditingEducation(null);
      } else {
        // Add new education
        const response = await axios.post(apiUrl + "/api/education", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        setEducation((prev) => [...prev, response.data.data]);
        showAlert("success", "Education added successfully!");
      }

      setShowEducationModal(false);
      setEducationForm({
        major: "",
        institute_name: "",
        location: "",
        start_month: "Month",
        start_year: "Year",
        end_month: "Month",
        end_year: "Year",
        caption: "",
        schoolLogo: null,
      });
    } catch (error) {
      console.error("Failed to add/update education:", error);
      showAlert(
        "error",
        `Failed to ${editingEducation ? "update" : "add"} education. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditEducation = (education) => {
    setEditingEducation(education);

    // Parse start date
    let startMonth = "Month";
    let startYear = "Year";
    if (education.start_date) {
      const startParts = education.start_date.split(" ");
      if (startParts.length === 2) {
        startMonth = startParts[0];
        startYear = startParts[1];
      }
    }

    // Parse end date
    let endMonth = "Month";
    let endYear = "Year";
    if (education.end_date && education.end_date !== "Present") {
      const endParts = education.end_date.split(" ");
      if (endParts.length === 2) {
        endMonth = endParts[0];
        endYear = endParts[1];
      }
    }

    setEducationForm({
      major: education.major || "",
      institute_name: education.institute_name || "",
      location: education.location || "",
      start_month: startMonth,
      start_year: startYear,
      end_month: endMonth,
      end_year: endYear,
      caption: education.caption || "",
      schoolLogo: education.photo || null,
    });

    setShowEducationModal(true);
  };

  const deleteEducation = async (educationId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/education/${educationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEducation((prev) =>
        Array.isArray(prev) ? prev.filter((edu) => edu.id !== educationId) : []
      );
      showAlert("success", "Education deleted successfully!");
    } catch (error) {
      console.error("Failed to delete education:", error);
      showAlert("error", "Failed to delete education. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle Form Changes
  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setExperienceForm({
      ...experienceForm,
      [name]: value,
    });
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducationForm({
      ...educationForm,
      [name]: value,
    });
  };

  const handleExperienceFileChange = (e) => {
    setExperienceForm({
      ...experienceForm,
      photo: e.target.files[0],
    });
  };

  const handleEducationFileChange = (e) => {
    setEducationForm({
      ...educationForm,
      schoolLogo: e.target.files[0],
    });
  };

  // Format date for display
  const formatDate = (month, year) => {
    if (month === "Month" || year === "Year") return "";
    return `${month} ${year}`;
  };

  // Scroll handlers for post
  const scrollLeft = () => {
    document
      .getElementById("post-container")
      .scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    document
      .getElementById("post-container")
      .scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleEditExperience = (experience) => {
    setEditingExperience(experience);

    // Parse start date
    let startMonth = "Month";
    let startYear = "Year";
    if (experience.start_date) {
      const startParts = experience.start_date.split(" ");
      if (startParts.length === 2) {
        startMonth = startParts[0];
        startYear = startParts[1];
      }
    }

    // // Parse end date
    let endMonth = "Month";
    let endYear = "Year";
    if (experience.end_date && experience.end_date !== "Present") {
      const endParts = experience.end_date.split(" ");
      if (endParts.length === 2) {
        endMonth = endParts[0];
        endYear = endParts[1];
      }
    }

    setExperienceForm({
      job_title: experience.job_title || "",
      company_name: experience.company_name || "",
      location: experience.location || "",
      start_month: startMonth,
      start_year: startYear,
      end_month: endMonth,
      end_year: endYear,
      caption: experience.caption || "",
      photo: experience.photo || null,
    });

    setShowExperienceModal(true);
  };

  const deleteExperience = async (experienceId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/experience/${experienceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExperiences((prev) =>
        Array.isArray(prev) ? prev.filter((exp) => exp.id !== experienceId) : []
      );

      showAlert("success", "Experience deleted successfully!");
    } catch (error) {
      console.error("Failed to delete experience:", error);
      showAlert("error", "Failed to delete experience. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#EDF3F7] min-h-screen">
      <Case />
      <div className="w-full mx-auto py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-center">
          {alert.show && (
            <div className="fixed top-4 right-4 z-50">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={hideAlert}
              />
            </div>
          )}
          <div className="w-full md:w-1/3 space-y-4">
            <ProfileSidebar
              user={user}
              profileImage={profileImage}
              apiUrl={apiUrl}
              connectionsCount={connectionsCount}
              profileViews={profileViews}
              onShowContactModal={() => setShowContactModal(true)}
            />
            <ProfileSkills skills={user.skills} />
            <ProfileSocialMedia socials={user.socials} />
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <ProfileAbout about={user.about} />
            <ProfileExperience
              experiences={experiences}
              apiUrl={apiUrl}
              formatDate={formatDate}
              onAdd={() => {
                setEditingExperience(null);
                setExperienceForm({
                  job_title: "",
                  company_name: "",
                  location: "",
                  start_month: "Month",
                  start_year: "Year",
                  end_month: "Month",
                  end_year: "Year",
                  caption: "",
                  photo: null,
                });
                setShowExperienceModal(true);
              }}
              onEdit={handleEditExperience}
            />
            <ProfileEducation
              educations={educations}
              apiUrl={apiUrl}
              formatDate={formatDate}
              onAdd={() => setShowEducationModal(true)}
              onEdit={handleEditEducation}
            />
            <ProfilePosts
              userPosts={userPosts}
              user={user}
              profileImage={profileImage}
              apiUrl={apiUrl}
              scrollLeft={scrollLeft}
              scrollRight={scrollRight}
            />
          </div>
        </div>
      </div>
      <ContactModal
        show={showContactModal}
        user={user}
        setShowContactModal={setShowContactModal}
      />
      {/* Modal Experience, Education, EditEducation tetap di bawah, bisa dipecah juga */}
      {/* ...modal code lainnya tetap seperti sebelumnya... */}
    </div>
  );
}
