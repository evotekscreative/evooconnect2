import React, { useState, useEffect } from "react";
import { Users, UserMinus, UserPlus, Search, X, Check } from "lucide-react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar";
import { toast } from 'react-toastify';
import { useRef } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Case from "../../components/Case";

const ManageMember = ({ currentUserRole }) => {
  const { company_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [myJoinRequests, setMyJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [company, setCompany] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [pendingRejectReason, setPendingRejectReason] = useState('');
  const [pendingRejectingId, setPendingRejectingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies?limit=100&offset=0`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data.data) ? data.data : []);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      setCompanies([]);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/member-companies?limit=100&offset=0`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setMembers(Array.isArray(data.data.members) ? data.data.members : []);
        } else {
          setMembers([]);
          toast.error('Response is not JSON');
        }
      } else {
        let errorMsg = 'Failed to fetch members';
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          }
        } catch { }
        toast.error(errorMsg);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
      setMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!company_id) {
      return;
    }
    fetchCompanyDetail();
    fetchMyJoinRequests();
    fetchMembers();
  }, [company_id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showJoin") === "1") {
      setShowJoinModal(true);
    }
  }, [company_id, location.search]);

  const fetchCompanyDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/details`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let data = null;
      let isJson = response.headers.get("content-type")?.includes("application/json");
      if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
        console.warn("[fetchCompanyDetail] Response is not JSON:", data);
      }

      if (response.ok && isJson) {
        setCompany(data.data ?? data);
      } else {
        setCompany(null);
        toast.error(
          isJson
            ? (data.message || "Failed to fetch company detail")
            : `Failed to fetch company detail: ${data}`
        );
      }
    } catch (error) {
      setCompany(null);
      console.error("[fetchCompanyDetail] Error:", error);
      toast.error("Error fetching company detail");
    }
  };

  const fetchMyJoinRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/join-requests?status=pending&limit=10&offset=0`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const raw = await response.json();
        const data = Array.isArray(raw.data) ? raw.data : [];
        const formatted = data.map(request => ({
          ...request,
          name: request.user?.name || '-',
          email: request.user?.email || '-'
        }));
        setMyJoinRequests(formatted);
      } else {
        const errText = await response.text();
        console.error("[fetchMyJoinRequests] response not ok:", response.status, errText);
        toast.error(`Failed to load join requests: ${response.status}`);
        setMyJoinRequests([]);
      }
    } catch (error) {
      console.error("[fetchMyJoinRequests] error:", error);
      toast.error(error.message);
      setMyJoinRequests([]);
    }
  };

  const fetchPendingRequests = async () => {
    setPendingLoading(true);
    setPendingError('');
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/join-requests?status=pending&limit=100&offset=0`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const raw = await response.json();
        const data = Array.isArray(raw.data) ? raw.data : [];
        setPendingRequests(data);
      } else {
        setPendingError('Failed to load pending requests');
        setPendingRequests([]);
      }
    } catch (error) {
      setPendingError('Failed to load pending requests');
      setPendingRequests([]);
    }
    setPendingLoading(false);
  };

  const handleApprovePending = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-join-requests/${requestId}/review`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        toast.success('Request approved');
        setShowPendingModal(false); // Tutup modal setelah approve
        fetchPendingRequests();
        fetchMyJoinRequests();
        fetchMembers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectPending = async (requestId) => {
    if (!pendingRejectReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/company-join-requests/${requestId}/review`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected', rejection_reason: pendingRejectReason }),
      });
      if (response.ok) {
        toast.success('Request rejected');
        setPendingRejectingId(null);
        setPendingRejectReason('');
        setShowPendingModal(false); // Tutup modal setelah reject
        fetchPendingRequests();
        fetchMyJoinRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveMember = (memberId) => {
    const member = members.find(m => m.id === memberId);
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/member-companies/${memberToRemove.id}`,
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
    setShowRemoveModal(false);
    setMemberToRemove(null);
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
        toast.success(`Role updated to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} successfully`);
        setShowRoleModal(false);

        // Update state members secara lokal
        setMembers(prev =>
          prev.map(m =>
            m.id === selectedMember.id ? { ...m, role: newRole } : m
          )
        );

        // fetchMembers(); // Boleh tetap dipanggil jika ingin sync dengan backend
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleSubmitJoinRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/join-requests`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: joinMessage }),
      });
      if (response.ok) {
        toast.success("Join request sent!");
        setShowJoinModal(false);
        setJoinMessage("");
        navigate(location.pathname, { replace: true });
        fetchMyJoinRequests();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to send join request");
      }
    } catch (error) {
      toast.error("Failed to send join request");
    }
  };

  const filteredMembers = Array.isArray(members)
    ? members.filter(member => {
      const matchesSearch =
        member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === 'all' ? true : member.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    : [];

  const myCompanyJoinRequests = Array.isArray(myJoinRequests)
    ? myJoinRequests.filter(
      (req) => String(req.company_id) === String(company_id)
    )
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Manage Members
              {company && (
                <span className="ml-4 text-lg font-semibold text-gray-600">
                  ({company.name})
                </span>
              )}
            </h2>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                setShowPendingModal(true);
                fetchPendingRequests();
              }}
            >
              Pending Join Users
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring focus:border-blue-300 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="hrd">HRD</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Name</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Email</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Role</th> {/* Tambahkan ini */}
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Status</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                      {roleFilter === 'all'
                        ? 'No members found'
                        : 'No members found for this role.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(member => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={member.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || '')}`}
                          alt={member.user?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium text-gray-800">{member.user?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.user?.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        <span className={`text-xs px-2 py-1 rounded 
              ${member.role === 'admin' ? 'bg-blue-200 text-blue-700' : ''}
              ${member.role === 'super_admin' ? 'bg-purple-200 text-purple-700' : ''}
              ${member.role === 'hrd' ? 'bg-yellow-200 text-yellow-700' : ''}
              ${member.role === 'member' ? 'bg-gray-200 text-gray-700' : ''}
            `}>
                          {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        <span className={`text-xs px-2 py-1 rounded 
    ${member.status === 'pending' ? 'bg-gray-200 text-gray-700' : ''}
    ${member.status === 'approved' ? 'bg-green-200 text-green-700' : ''}
    ${member.status === 'rejected' ? 'bg-red-200 text-red-700' : ''}
  `}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {member.status === 'active' && member.role !== 'super_admin' && (
                          <div className="flex gap-2 justify-end items-center">
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                            >
                              <UserMinus className="w-4 h-4 mr-1" /> Remove
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setNewRole(member.role === 'admin' ? 'member' : 'admin');
                                setShowRoleModal(true);
                              }}
                              className={`text-sm ${member.role === 'admin' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-3 py-1 rounded flex items-center`}
                            >
                              {member.role === 'admin' ? 'Change Role' : 'Change Role'}
                            </button>
                          </div>
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

      {/* Modal Pending Users */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Pending Join Requests</h3>
              <button
                onClick={() => {
                  setShowPendingModal(false);
                  setPendingRequests([]);
                  setPendingRejectingId(null);
                  setPendingRejectReason('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            {pendingLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : pendingError ? (
              <div className="text-center py-8 text-red-500">{pendingError}</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending requests.</div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="border-b pb-3 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{req.user?.name || '-'}</span>
                      <span className="text-sm text-gray-500">{req.user?.email || '-'}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {req.message || <span className="italic text-gray-400">No message</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        onClick={() => handleApprovePending(req.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={() => setPendingRejectingId(req.id)}
                      >
                        Reject
                      </button>
                    </div>
                    {pendingRejectingId === req.id && (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded"
                          rows={2}
                          placeholder="Enter rejection reason..."
                          value={pendingRejectReason}
                          onChange={e => setPendingRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                            onClick={() => {
                              setPendingRejectingId(null);
                              setPendingRejectReason('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            onClick={() => handleRejectPending(req.id)}
                            disabled={!pendingRejectReason}
                          >
                            Submit Rejection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                src={selectedMember.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.user?.name || '')}`}
                alt={selectedMember.user?.name}
                className="w-16 h-16 rounded-full mb-3"
              />
              <h4 className="text-lg font-medium">{selectedMember.user?.name}</h4>
              <p className="text-gray-600">{selectedMember.user?.email}</p>
              <p className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                {selectedMember.role}
              </p>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Additional Information</h4>
              <p className="text-sm text-gray-600">
                Joined on: {new Date(selectedMember.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Status: {selectedMember.status}
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
              <p className="mb-2">
                Change role for <span className="font-medium">{selectedMember.user?.name}</span> to:
              </p>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="admin">Admin</option>
                <option value="hrd">HRD</option>
                <option value="member">Member</option>
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

      {/* Modal Join Request */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Join Company</h3>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  navigate(location.pathname, { replace: true });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (optional):
              </label>
              <textarea
                value={joinMessage}
                onChange={e => setJoinMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Why do you want to join?"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  navigate(location.pathname, { replace: true });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitJoinRequest}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Send Join Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Remove Member */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Remove Member</h3>
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setMemberToRemove(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <p>
                Are you sure you want to remove <span className="font-semibold">{memberToRemove.user?.name}</span> from this company?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setMemberToRemove(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMember;