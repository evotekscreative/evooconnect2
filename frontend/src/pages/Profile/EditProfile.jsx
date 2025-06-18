import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Case from "../../components/Case";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  X,
  User,
  Bookmark,
  Link2,
  Upload,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building,
  AlignLeft,
} from "lucide-react";
import Alert from "@/components/Auth/alert";
import axios from "axios";

const base_url =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const socialPlatforms = [
  {
    name: "Facebook",
    platform: "facebook",
    icon: <Facebook />,
    color: "text-blue-600",
  },
  {
    name: "Twitter",
    platform: "twitter",
    icon: <Twitter />,
    color: "text-blue-400",
  },
  {
    name: "Instagram",
    platform: "instagram",
    icon: <Instagram />,
    color: "text-pink-500",
  },
  {
    name: "LinkedIn",
    platform: "linkedin",
    icon: <Linkedin />,
    color: "text-blue-700",
  },
  {
    name: "GitHub",
    platform: "github",
    icon: <Github />,
    color: "text-gray-800",
  },
];

export default function EditProfile() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [about, setAbout] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const fileInputRef = useRef(null);
  const [socialLinks, setSocialLinks] = useState({});
  const [activePlatforms, setActivePlatforms] = useState([]);
  
  // Alert states
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  const showAlert = (type, message) => {
    setAlert({
      show: true,
      type,
      message,
    });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");

    // Prepare the profile data
    const profileData = {
      name: fullName,
      username,
      headline,
      about,
      skills: skills.length > 0 ? skills : null, // Send null if empty array
      socials:
        Object.keys(socialLinks).length > 0
          ? Object.keys(socialLinks).map((platform) => ({
              platform,
              username: socialLinks[platform],
            }))
          : null, // Send null if empty
      birthdate: birthdate || null,
      gender: gender || null,
      email: email || null,
      location: location || null,
      organization: organization || null,
      website: website || null,
      phone: phone || null,
      photo: profileImage || null,
    };

    try {
      const response = await axios.put(
        `${base_url}/api/user/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showAlert('success', "Profile updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert('error', error.response?.data?.message || "Failed to update profile");
      throw error;
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showAlert('error', "Token not found, please login again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(`${base_url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data;

      // Handle skills
      const userSkills = Array.isArray(data.skills) ? data.skills : [];

      // Handle socials
      const socialsObject = {};
      if (Array.isArray(data.socials)) {
        data.socials.forEach((social) => {
          socialsObject[social.platform.toLowerCase()] = social.username;
        });
      }

      let formattedBirthdate = "";
      if (data.birthdate && new Date(data.birthdate).getFullYear() > 1900) {
        const date = new Date(data.birthdate);
        formattedBirthdate = date.toISOString().split("T")[0];
      }

      setFullName(data.name || "");
      setHeadline(data.headline || "");
      setAbout(data.about || "");
      setSkills(userSkills);
      setSocialLinks(socialsObject);
      setActivePlatforms(Object.keys(socialsObject));
      setProfileImage(data.photo || null);
      setBirthdate(formattedBirthdate);
      setGender(data.gender || "");
      setEmail(data.email || "");
      setLocation(data.location || "");
      setOrganization(data.organization || "");
      setWebsite(data.website || "");
      setPhone(data.phone || "");
      setUsername(data.username || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showAlert('error', error.response?.data?.message || "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");
      setShowInput(false);
      showAlert('success', "Skill added successfully");
    }
  };

  const handleRemoveSkill = (index) => {
    const updated = [...skills];
    updated.splice(index, 1);
    setSkills(updated);
    showAlert('info', "Skill removed");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.match("image.*")) {
      showAlert('error', "Please select an image file");
      return;
    }

    // Check file size (e.g., limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', "Image size should be less than 5MB");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert('error', "You need to login first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.post(
        `${base_url}/api/user/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the profile image in state
      setProfileImage(response.data?.data?.photo || URL.createObjectURL(file));
      showAlert('success', "Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      showAlert('error', error.response?.data?.message || "Failed to upload profile photo");

      // Fallback to client-side preview if API fails
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert('error', "You need to login first");
      return;
    }

    try {
      await axios.delete(`${base_url}/api/user/photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      showAlert('success', "Profile image removed successfully");
    } catch (error) {
      console.error("Error removing profile photo:", error);
      showAlert('error', error.response?.data?.message || "Failed to remove profile photo");

      // Fallback to client-side removal if API fails
      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      showAlert('info', "Profile image removed locally");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile();
      showAlert('success', "Your profile information saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleSaveAbout = async () => {
    try {
      await updateProfile();
      showAlert('success', "About section saved successfully");
    } catch (error) {
      console.error("Error saving about:", error);
    }
  };

  const handleSaveSkills = async () => {
    try {
      await updateProfile();
      showAlert('success', "Skills and social media saved successfully");
    } catch (error) {
      console.error("Error saving skills:", error);
    }
  };

  const handleIconClick = (platform) => {
    if (!activePlatforms.includes(platform)) {
      setActivePlatforms([...activePlatforms, platform]);
      setSocialLinks({ ...socialLinks, [platform]: "" });
      showAlert('info', 
        `${socialPlatforms.find((p) => p.platform === platform)?.name} added`
      );
    }
  };

  const handleInputChange = (platform, value) => {
    setSocialLinks({ ...socialLinks, [platform]: value });
  };

  const handleRemove = (platform) => {
    setActivePlatforms(activePlatforms.filter((p) => p !== platform));
    const updatedLinks = { ...socialLinks };
    delete updatedLinks[platform];
    setSocialLinks(updatedLinks);
    showAlert('info', 
      `${socialPlatforms.find((p) => p.platform === platform)?.name} removed`
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Case>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
        {/* Alert component */}
        <div className="fixed top-4 right-4 z-50">
          <Alert 
            type={alert.type}
            message={alert.message}
            isVisible={alert.show}
            onClose={() => setAlert(prev => ({ ...prev, show: false }))}
          />
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left Column - About and Skills */}
          <div className="lg:w-2/5 space-y-6">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    About You
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6 pb-6 space-y-5">
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-md hover:shadow-lg transition-shadow">
                    {profileImage ? (
                      <img
                        src={apiUrl + "/" + profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-500">
                          {fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex space-x-2 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-1 border-gray-300 hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" /> Upload Photo
                    </Button>
                    {profileImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1 border-red-200 hover:bg-red-50 text-red-500"
                      >
                        <X className="w-4 h-4" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlignLeft className="w-4 h-4 text-blue-500" />
                    <label className="text-sm font-medium text-gray-700">
                      About Me
                    </label>
                  </div>
                  <textarea
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    rows={5}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveAbout}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save About
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Skills & Socials
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Add your skills and social media links
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6 pb-6 space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(idx)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {showInput ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Type a skill and press Add"
                        className="w-full border-gray-200 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddSkill}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInput(true)}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      + Add Skill
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Social Profiles
                  </label>
                  <div className="flex items-center space-x-2 mb-4">
                    {socialPlatforms.map((platform) => (
                      <button
                        key={platform.platform}
                        onClick={() => handleIconClick(platform.platform)}
                        className={`p-2 rounded-full hover:bg-gray-100 ${
                          platform.color
                        } ${
                          activePlatforms.includes(platform.platform)
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        } transition-all`}
                      >
                        {platform.icon}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {activePlatforms.map((platform) => {
                      const platformInfo = socialPlatforms.find(
                        (p) => p.platform === platform
                      );
                      return (
                        <div
                          key={platform}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              platformInfo?.color || "text-gray-500"
                            } bg-gray-50`}
                          >
                            {platformInfo?.icon || <User className="w-4 h-4" />}
                          </div>
                          <Input
                            placeholder={`${
                              platformInfo?.name || platform
                            } username`}
                            value={socialLinks[platform] || ""}
                            onChange={(e) =>
                              handleInputChange(platform, e.target.value)
                            }
                            className="flex-1 border-gray-200 focus:ring-blue-500"
                          />
                          <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            onClick={() => handleRemove(platform)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSkills}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save Skills & Socials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:w-3/5">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Profile Details
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Edit your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6 pb-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-6">
                  <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Full Name
                      </label>
                      <Input
                        className="w-full border-gray-200 focus:ring-blue-500"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Username
                      </label>
                      <Input
                        className="w-full border-gray-200 bg-gray-50"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Headline
                      </label>
                      <Input
                        className="w-full border-gray-200 focus:ring-blue-500"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="E.g. Software Engineer at Company"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Birthdate
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="date"
                          className="w-full pl-10 border-gray-200 focus:ring-blue-500"
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-6">
                  <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Gender
                      </label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="email"
                          className="w-full pl-10 border-gray-200 focus:ring-blue-500"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Phone number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-full pl-10 border-gray-200 focus:ring-blue-500"
                          value={phone}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, "");
                            // Jika user mengetik 08 di awal, otomatis ubah ke +628
                            if (val.startsWith("08")) {
                              val = "62" + val.slice(1);
                            }
                            // Tambahkan + di depan jika belum ada
                            if (val && !val.startsWith("+")) {
                              val = "+" + val;
                            }
                            setPhone(val);
                          }}
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              "Backspace",
                              "ArrowLeft",
                              "ArrowRight",
                              "Tab",
                              "Delete",
                            ];
                            if (
                              !/[0-9]/.test(e.key) &&
                              !allowedKeys.includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          placeholder="+62 123 4567 890"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          className="w-full pl-10 border-gray-200 focus:ring-blue-500"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          className="w-full pl-10 border-gray-200 focus:ring-blue-500"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="Your company or school"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium block mb-2 text-gray-700">
                        Website
                      </label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          className="w-full pl-10 border-gray-200 focus:ring-blue-500"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save All Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Case>
  );
}