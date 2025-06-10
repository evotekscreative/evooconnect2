import React, { useState, useEffect } from 'react';
import companyProfile from "../../assets/img/company-profile.jpg";
import { Pencil } from 'lucide-react';
import CompanyEditModal from '../../components/CompanyProfile/CompanyEditModal.jsx';

export default function CompanyHeader({ company, isFollowingMain, setIsFollowingMain }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    linkedin: '',
    website: '',
    industry: '',
    size: '',
    type: '',
    logo: '',
    tagline: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);

  // Sinkronkan formData setiap kali company berubah
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        linkedin: company.linkedin_url || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
        type: company.type || '',
        logo: company.logo || '',
        tagline: company.tagline || ''
      });
    }
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({
        ...prev,
        logo: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsEditModalOpen(false);
  };

  return (
    <div className="relative">
      <CompanyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={formData}
        logoPreview={logoPreview}
        handleInputChange={handleInputChange}
        handleLogoChange={handleLogoChange}
        handleSubmit={handleSubmit}
      />

      {/* Header Content */}
      <img src={companyProfile} alt="Company Header" className="w-full h-60 object-cover" />
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 bg-white rounded-md shadow -mt-8 relative z-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">
            {company.name}
          </h1>
          <p className="text-gray-500">
            {company.industry} | {company.location} | {company.followers} followers
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors border rounded-md"
            aria-label="Edit company"
          >
            <Pencil size={18} />
          </button>
          <button className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
            Visit Website
          </button>
          <button
            onClick={() => setIsFollowingMain(!isFollowingMain)}
            className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${isFollowingMain ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isFollowingMain ? " Followed" : "+ Follow"}
          </button>
        </div>
      </div>
    </div>
  );
}
