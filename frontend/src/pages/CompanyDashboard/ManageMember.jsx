import React, { useState, useEffect } from "react";
import { Users, UserMinus, UserPlus, Search, X, Check } from "lucide-react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar";
import { toast } from 'react-toastify';

const ManageMember = ({ currentUserRole, companyId }) => {
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
    fetchJoinRequests();
  }, [companyId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${companyId}/members`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${companyId}/join-requests?status=pending&limit=10&offset=0`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setJoinRequests(data);
      }
    } catch (error) {
      toast.error('Failed to load join requests');
    }
  };

  const handleReviewRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-join-requests/${requestId}/review`;
      
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      };

      if (action === 'reject') {
        if (!rejectReason) {
          toast.error('Please provide a rejection reason');
          return;
        }
        options.body = JSON.stringify({ action, reject_reason: rejectReason });
      }

      const response = await fetch(url, options);
      
      if (response.ok) {
        toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchJoinRequests();
        fetchMembers();
        setShowRejectModal(false);
        setRejectReason('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/member-companies/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        toast.success('Member removed successfully');
        fetchMembers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/member-companies/${selectedMember.id}/role`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole })
        }
      );

      if (response.ok) {
        toast.success('Role updated successfully');
        setShowRoleModal(false);
        fetchMembers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const viewMemberDetails = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/member-companies/${memberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedMember(data);
        setShowMemberModal(true);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Manage Members
            </h2>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search members..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring focus:border-blue-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>

          {/* Join Requests Section (only visible for admins) */}
          {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && joinRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Pending Join Requests</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {joinRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{request.user.name}</p>
                      <p className="text-sm text-gray-600">{request.user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewRequest(request.id, 'approve')}
                        className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Name</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Email</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Role</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => viewMemberDetails(member.id)}>
                        <img
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium text-gray-800">{member.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{member.role}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
                          <>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                              disabled={member.role === 'super_admin'}
                            >
                              <UserMinus className="w-4 h-4 mr-1" /> Remove
                            </button>
                            {member.role !== 'super_admin' && (
                              <button
                                onClick={() => {
                                  setSelectedMember(member);
                                  setNewRole(member.role);
                                  setShowRoleModal(true);
                                }}
                                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                              >
                                Change Role
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Member Details</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <img
                src={selectedMember.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}`}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-full mb-3"
              />
              <h4 className="text-lg font-medium">{selectedMember.name}</h4>
              <p className="text-gray-600">{selectedMember.email}</p>
              <p className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                {selectedMember.role}
              </p>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Additional Information</h4>
              <p className="text-sm text-gray-600">
                Joined on: {new Date(selectedMember.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Change Member Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="mb-4">
              <p className="mb-2">Change role for <span className="font-medium">{selectedMember.name}</span>:</p>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="member">Member</option>
                <option value="HRD">HRD</option>
                <option value="admin">Admin</option>
                {currentUserRole === 'super_admin' && <option value="super_admin">Super Admin</option>}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Reject Join Request</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for rejection:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Enter the reason for rejecting this request..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewRequest(joinRequests[0].id, 'reject')}
                disabled={!rejectReason}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMember;