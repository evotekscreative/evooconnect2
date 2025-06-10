import React, { useState, useEffect } from 'react';
import companyProfile from "../../assets/img/company-profile.jpg";
import { Pencil } from 'lucide-react';
import CompanyEditModal from '../../components/CompanyProfile/CompanyEditModal.jsx';
import { toast } from 'react-toastify';

export default function CompanyHeader({ company, isFollowingMain, setIsFollowingMain }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    linkedin_url: '',
    website: '',
    industry: '',
    size: '',
    type: '',
    logo: '',
    tagline: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        linkedin_url: company.linkedin_url || '',
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
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Enhanced validation
    if (!formData.name || !formData.website || !formData.industry) {
      toast.error("Name, website, and industry are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please log in.");
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();

      // Append all fields including empty ones (backend might expect them)
      formDataToSend.append('name', formData.name);
      formDataToSend.append('linkedin_url', formData.linkedin_url || '');
      formDataToSend.append('website', formData.website);
      formDataToSend.append('industry', formData.industry);
      formDataToSend.append('size', formData.size || '');
      formDataToSend.append('type', formData.type || '');
      formDataToSend.append('tagline', formData.tagline || '');

      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      } else if (formData.logo) {
        // If no new file but existing logo, send the existing logo URL
        formDataToSend.append('logoUrl', formData.logo);
      }

      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company.id}/request-edit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const responseData = await response.json();

      if (!response.ok) {
        // More detailed error message from backend if available
        const errorMsg = responseData.message ||
          (responseData.errors ? JSON.stringify(responseData.errors) : 'Failed to submit edit request');
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      setSubmitSuccess(true);
      toast.success('Edit request submitted for admin approval');

      setTimeout(() => {
        setIsEditModalOpen(false);
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting edit request:', error);
      toast.error(error.message || 'Failed to submit edit request');
    } finally {
      setIsSubmitting(false);
    }
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
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
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