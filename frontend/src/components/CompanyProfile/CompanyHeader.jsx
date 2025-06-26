import React, { useState } from 'react';
import companyProfile from "../../assets/img/company-profile.jpg";
import { Pencil } from 'lucide-react';
import CompanyEditModal from '../../components/CompanyProfile/CompanyEditModal.jsx';
import { toast } from 'react-toastify';
import FollowersModal from '../../components/CompanyProfile/FollowersModal';

export default function CompanyHeader({ company, currentUser }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [companyState, setCompanyState] = useState(company);
  const [editRequestStatus, setEditRequestStatus] = useState(company.has_pending_edit ? 'pending' : 'none');
  const [joinStatus, setJoinStatus] = useState(
    company.is_member_of_company ? 'joined' : (company.is_pending_join_request ? 'pending' : 'not_joined')
  );
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const handleFollow = async () => {
    // Jika sudah follow, tampilkan modal konfirmasi untuk unfollow
    if (company.is_following) {
      setShowUnfollowModal(true);
      return;
    }

    await performFollowAction();
  };

  const performFollowAction = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = company.is_following ? 'unfollow' : 'follow';
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-follow/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ company_id: company.id })
        }
      );

      if (res.ok) {
        toast.success(company.is_following ? 'Unfollowed successfully' : 'Followed successfully');
        window.location.reload();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to update follow status');
      }
    } catch (error) {
      toast.error('An error occurred while updating follow status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUnfollow = async () => {
    setShowUnfollowModal(false);
    await performFollowAction();
  };

  const handleJoinRequest = async () => {
    console.log('Join button clicked');
    console.log('Join status:', joinStatus);
    console.log('Company ID:', company?.id);

    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if (joinStatus === 'pending') {
      setShowCancelModal(true);
      return;
    }

    if (!token || !company?.id) {
      toast.error('Missing token or company ID');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company.id}/join-request`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: company.id,
          message: "I`am a part of this company and I want to join it."
        })
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        let result = null;

        const contentLength = res.headers.get("content-length");
        const contentType = res.headers.get("content-type");

        if (contentLength !== "0" && contentType?.includes("application/json")) {
          result = await res.json();
          console.log('Join request result:', result);

          setCompanyState(prev => ({
            ...prev,
            join_request_id: result.data?.id
          }));
        }

        toast.success('Join request submitted');
        setJoinStatus('pending');
      } else {
        const errText = await res.text();
        let err = {};
        try {
          err = JSON.parse(errText);
        } catch {
          err = { message: errText };
        }
        toast.error(err.message || 'Failed to submit join request');
      }
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('An error occurred while submitting join request');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancelRequest = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const requestId = companyState.join_request_id || company.pending_join_request_id;
      
      console.log('Cancel request - requestId:', requestId);
      console.log('company.join_request_id:', company.join_request_id);
      console.log('companyState.pending_join_request_id:', companyState.pending_join_request_id);
      
      if (!requestId) {
        toast.error('No pending join request found');
        return;
      }
      
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-join-requests/${requestId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        toast.success('Join request cancelled');
        setJoinStatus('not_joined');
      } else if (res.status === 404) {
        toast.error('Join request not found or already processed');
        setJoinStatus('not_joined');
      } else {
        toast.error('Failed to cancel join request');
      }
    } finally {
      setIsSubmitting(false);
      setShowCancelModal(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-follow/${company.id}/followers?limit=10&offset=0`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const handleShowFollowers = async () => {
    await fetchFollowers();
    setShowFollowersModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gabungkan perubahan dengan data lama
      const merged = { ...companyData, ...changes };
      const formData = new FormData();
      Object.entries(merged).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await onSubmitEditRequest(formData);

      setSubmitSuccess(true);
      toast.success("Permintaan edit berhasil dikirim!");
    } catch (error) {
      toast.error("Gagal mengirim permintaan edit: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRequest = async (changes) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Pastikan field sudah snake_case
      Object.entries(changes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      // Debug: cek isi FormData
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

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

  const isOwnerOrMember = company.is_member_of_company;
  const isSuperAdmin = company.user_role === "super_admin";
  const isNotOwner = currentUser && company.owner.id !== currentUser.id;

  return (
    <div className="relative">
      <CompanyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        companyData={company}
        onSubmitEditRequest={handleEditRequest}
      />

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        companyId={company.id}
        companyName={company.name}
      />

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

      {showUnfollowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Unfollow Company</h3>
            <p className="mb-6">Are you sure you want to unfollow {company.name}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUnfollowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnfollow}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Unfollowing...' : 'Unfollow'}
              </button>
            </div>
          </div>
        </div>
      )}

      <img src={companyProfile} alt="Company Header" className="w-full h-60 object-cover" />
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 bg-white rounded-md shadow -mt-8 relative z-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-gray-500">
            {company.industry} | Jakarta |
            <button onClick={handleShowFollowers} className="hover:underline ml-1">
              {company.followers_count} followers
            </button>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0 justify-center md:justify-end">
          {isSuperAdmin && (
            company.has_pending_edit ? (
              <div className="text-yellow-600 font-semibold mt-2">
                Edit request is pending admin approval.
              </div>
            ) : (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Pencil size={16} /> Edit
              </button>
            )
          )}

          <button 
            onClick={() => company.website && window.open(company.website, '_blank')}
            disabled={!company.website}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${
              company.website 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Visit Website
          </button>

          {!isOwnerOrMember && (
            <>
              <button
                onClick={handleFollow}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded bg-blue-600 text-white ${company.is_following ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                {isSubmitting ? 'Processing...' : company.is_following ? 'Followed' : '+ Follow'}
              </button>

              {joinStatus === 'pending' ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-yellow-500 text-white"
                >
                  {isSubmitting ? 'Processing...' : 'Pending Approval'}
                </button>
              ) : joinStatus === 'joined' ? (
                <button
                  disabled
                  className="px-4 py-2 rounded bg-green-500 text-white cursor-default"
                >
                  Joined
                </button>
              ) : (
                <button
                  onClick={handleJoinRequest}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  {isSubmitting ? 'Processing...' : '+ Join'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}