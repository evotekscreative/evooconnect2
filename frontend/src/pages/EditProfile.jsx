import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Linkedin, Github, Instagram, X } from "lucide-react";

const socialPlatforms = [
  { name: "instagram", icon: <Instagram className="w-5 h-5" />, color: "text-pink-500" },
  { name: "facebook", icon: <Facebook className="w-5 h-5" />, color: "text-blue-500" },
  { name: "twitter", icon: <Twitter className="w-5 h-5" />, color: "text-blue-400" },
  { name: "linkedin", icon: <Linkedin className="w-5 h-5" />, color: "text-blue-700" },
  { name: "github", icon: <Github className="w-5 h-5" />, color: "text-black" },
];

export default function ProfileEdit() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [about, setAbout] = useState("");
  const [fullName, setFullName] = useState("Muhammad Bintang Asyidqy");
  const [username, setUsername] = useState("12309840");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("bintangasyidqy007@gmail.com");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const fileInputRef = useRef(null);
  const [socialLinks, setSocialLinks] = useState({});
  const [activePlatforms, setActivePlatforms] = useState([]);

  useEffect(() => {
    const savedAbout = localStorage.getItem("profileAbout");
    if (savedAbout) setAbout(savedAbout);

    const savedSkills = localStorage.getItem("profileSkills");
    if (savedSkills) setSkills(JSON.parse(savedSkills));

    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) setProfileImage(savedImage);

    const savedSocials = localStorage.getItem("profileSocials");
    if (savedSocials) {
      const parsed = JSON.parse(savedSocials);
      setSocialLinks(parsed);
      setActivePlatforms(Object.keys(parsed));
    }

    const savedFullName = localStorage.getItem("profileFullName");
    if (savedFullName) setFullName(savedFullName);

    const savedHeadline = localStorage.getItem("profileHeadline");
    if (savedHeadline) setHeadline(savedHeadline);
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      localStorage.setItem("profileSkills", JSON.stringify(updatedSkills));
      setNewSkill("");
      setShowInput(false);
    }
  };

  const handleRemoveSkill = (index) => {
    const updated = [...skills];
    updated.splice(index, 1);
    setSkills(updated);
    localStorage.setItem("profileSkills", JSON.stringify(updated));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setProfileImage(imageUrl);
        localStorage.setItem("profileImage", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem("profileImage");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSaveProfile = () => {
    localStorage.setItem("profileAbout", about);
    localStorage.setItem("profileSkills", JSON.stringify(skills));
    localStorage.setItem("profileSocials", JSON.stringify(socialLinks));
    localStorage.setItem("profileFullName", fullName);
    localStorage.setItem("profileHeadline", headline);
    
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
    
    alert("Profile information saved!");
  };

  const handleIconClick = (platform) => {
    if (!activePlatforms.includes(platform)) {
      setActivePlatforms([...activePlatforms, platform]);
      setSocialLinks({ ...socialLinks, [platform]: "" });
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
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <Card className="p-4">
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">MA</span>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
                  Upload
                </Button>
                {profileImage && (
                  <Button variant="outline" size="sm" onClick={handleRemoveImage}>
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">About You</p>
              <textarea
                placeholder="Enter About You"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Skills</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button onClick={() => handleRemoveSkill(idx)} className="ml-1">
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
                    placeholder="Type a skill"
                    className="w-full"
                  />
                  <Button size="sm" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
              ) : (
                <p className="text-blue-600 text-sm cursor-pointer" onClick={() => setShowInput(true)}>
                  + Add skills
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Social Profiles</p>
              <div className="flex items-center space-x-2 mb-4">
                {socialPlatforms.map((platform) => (
                  <div
                    key={platform.name}
                    onClick={() => handleIconClick(platform.name)}
                    className={`cursor-pointer ${platform.color}`}
                  >
                    {platform.icon}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {activePlatforms.map((platform) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Input
                      placeholder={`Enter ${platform} username`}
                      value={socialLinks[platform] || ""}
                      onChange={(e) => handleInputChange(platform, e.target.value)}
                    />
                    <button
                      className="bg-red-500 text-white px-2 rounded"
                      onClick={() => handleRemove(platform)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold">Edit Your Profile</h2>
              <p className="text-sm text-gray-500">Add information about yourself</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  className="mt-1" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input 
                  className="mt-1" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium">Headline</label>
                <Input
                  className="mt-1"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="E.g. Software Engineer at Company"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Birthdate</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Email address</label>
                <Input
                  type="email"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  className="mt-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Organization</label>
                <Input
                  className="mt-1"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  className="mt-1"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone number</label>
                <Input
                  type="tel"
                  className="mt-1"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}