import React, { useState, useEffect } from 'react';
import companyProfile from "../../assets/img/company-profile.jpg";
import { Pencil } from 'lucide-react';
import CompanyEditModal from '../../components/CompanyProfile/CompanyEditModal.jsx';
import { toast } from 'react-toastify';

export default function CompanyHeader({ company, isFollowingMain, setIsFollowingMain, currentUser }) {
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
  const [joinStatus, setJoinStatus] = useState('not_joined'); // 'not_joined', 'pending', 'member'
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [previousRequest, setPreviousRequest] = useState(null);
  const [editRequestStatus, setEditRequestStatus] = useState(null);

  useEffect(() => {
    if (!company || !currentUser) return;
    if (company.owner_id === currentUser.id) {
      setJoinStatus('owner');
      return;
    }
    checkJoinStatus();
  }, [company, currentUser]);

  const checkJoinStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company.id}/join-requests?status=pending&limit=1&offset=0`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setJoinStatus('pending');
          setPendingRequestId(data[0].id);
        } else {
          setJoinStatus('not_joined');
          setPendingRequestId(null);
        }
      }
    } catch (e) {
      setJoinStatus('not_joined');
      setPendingRequestId(null);
    }
  };

  const handleJoinRequest = async () => {
    if (joinStatus === 'pending') {
      setShowCancelModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company.id}/join-request`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        setJoinStatus('pending');
        toast.success('Join request submitted to company admins');
        checkJoinStatus();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to submit join request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequestId) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-join-requests/${pendingRequestId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        setJoinStatus('not_joined');
        setPendingRequestId(null);
        toast.success('Join request cancelled');
      } else {
        toast.error('Failed to cancel join request');
      }
    } finally {
      setIsSubmitting(false);
      setShowCancelModal(false);
    }
  };

  // Render button join hanya jika user bukan owner/member/pending
  const canShowJoin =
    joinStatus === 'not_joined' &&
    currentUser &&
    company.owner_id !== currentUser.id &&
    currentUserRole !== 'member' &&
    currentUserRole !== 'admin' &&
    currentUserRole !== 'super_admin';

  useEffect(() => {
    const fetchEditRequestStatus = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company.id}/edit-request-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEditRequestStatus(data.status); // status: 'pending', 'approved', 'rejected', null
      }
    };
    if (company) fetchEditRequestStatus();
  }, [company]);

  const handleEditRequest = async (changes) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(changes).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company.id}/request-edit`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit edit request');
      }

      toast.success('Edit request submitted for admin approval');
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to submit edit request');
    }
  };

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

      formDataToSend.append('Name', formData.name);
      formDataToSend.append('LinkedinUrl', formData.linkedin_url);
      formDataToSend.append('Website', formData.website);
      formDataToSend.append('Industry', formData.industry);
      formDataToSend.append('Size', formData.size);
      formDataToSend.append('Type', formData.type);
      formDataToSend.append('Tagline', formData.tagline);

      if (logoFile) {
        formDataToSend.append('Logo', logoFile);
      } else if (formData.logo) {
        formDataToSend.append('LogoUrl', formData.logo);
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
        companyData={company}
        previousRequest={previousRequest}
        onSubmitEditRequest={handleEditRequest}
      />

      {/* Cancel Join Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Cancel Join Request</h3>
            <p className="mb-6">Are you sure you want to cancel your join request?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          {editRequestStatus !== 'pending' && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Pencil className="inline" size={16} />
            </button>
          )}
          {editRequestStatus === 'pending' && (
            <div className="text-yellow-600 font-semibold mt-2">
              Edit request is pending admin approval.
            </div>
          )}
          <button className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
            Visit Website
          </button>
          <button
            onClick={() => setIsFollowingMain(!isFollowingMain)}
            className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${isFollowingMain ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isFollowingMain ? " Followed" : "+ Follow"}
          </button>
          {canShowJoin && (
            <button
              onClick={handleJoinRequest}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              {isSubmitting ? 'Processing...' : '+ Join'}
            </button>
          )}
          {joinStatus === 'pending' && (
            <button
              onClick={handleJoinRequest}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-yellow-500 text-white"
            >
              {isSubmitting ? 'Processing...' : 'Pending Approval'}
            </button>
          )}
        </div>
      </div>
    </div >
  );
}