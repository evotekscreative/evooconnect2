import React, { useState, useEffect } from "react";
import { Users, UserMinus, UserPlus, Search, X, Check } from "lucide-react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar";
import { toast } from 'react-toastify';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // tambahkan useLocation

const ManageMember = ({ currentUserRole }) => {
  const { company_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // untuk membaca query param
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [myJoinRequests, setMyJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [company, setCompany] = useState(null); // Tambahkan state untuk company
  const [companies, setCompanies] = useState([]); // state untuk daftar company
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  // Fetch daftar company untuk dropdown
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!company_id) {
      return;
    }
    console.log("Current company_id in ManageMember:", company_id); // Debug: pastikan berubah
    fetchCompanyDetail();
    fetchMyJoinRequests();
    // fetchMembers(); // <-- Pastikan fetchMembers dipanggil di sini agar data anggota muncul
  }, [company_id]);

  // Cek query param showJoin
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showJoin") === "1") {
      setShowJoinModal(true);
    }
  }, [company_id, location.search]);

  // Fungsi untuk fetch detail company
  const fetchCompanyDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/details`;
      console.log("[fetchCompanyDetail] Fetching:", url);
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

      console.log("[fetchCompanyDetail] Response:", data);

      // Perbaikan: Ambil data dari data.data jika ada, jika tidak fallback ke data
      if (response.ok && isJson) {
        // Jika data.data null, fallback ke data
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
      const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/my-company-join-requests?limit=10&offset=0`;
      console.log("[fetchMyJoinRequests] fetch url:", url);
      console.log("[fetchMyJoinRequests] token:", token);

      let jwtUserId = null;
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          jwtUserId = decoded.user_id || decoded.id || decoded.sub;
          console.log("[fetchMyJoinRequests] decoded JWT payload:", decoded);
          console.log("[fetchMyJoinRequests] user_id from JWT:", jwtUserId);
        } catch (e) {
          console.warn("[fetchMyJoinRequests] Cannot decode JWT token");
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("[fetchMyJoinRequests] response status:", response.status);
      const contentType = response.headers.get("content-type");
      console.log("[fetchMyJoinRequests] content-type:", contentType);

      if (response.status === 401) {
        console.error("[fetchMyJoinRequests] Unauthorized. Token expired or invalid.");
        toast.error("Session expired. Please login again.");
        setMyJoinRequests([]);
        return;
      }

      if (response.ok) {
        // Perbaikan: ambil data dari response.data jika ada, bukan dari data.data
        const raw = await response.json();
        const data = raw.data || raw.response?.data || [];
        console.log("[fetchMyJoinRequests] raw response:", raw);
        console.log("[fetchMyJoinRequests] extracted data:", data);

        if (!Array.isArray(data)) {
          console.warn("[fetchMyJoinRequests] WARNING: data is not an array.");
          setMyJoinRequests([]);
          return;
        }

        const formatted = data.map(request => ({
          ...request,
          companyName: request.company?.name || 'Unknown',
          companyLogo: request.company?.logo || null,
          responderName: request.responder?.name || null,
          responderPhoto: request.responder?.photo || null,
          readableRequestedAt: request.requested_at ? new Date(request.requested_at).toLocaleString() : ''
        }));

        setMyJoinRequests(formatted);

        if (formatted.length > 0) {
          console.log("[fetchMyJoinRequests] first company_id:", formatted[0].company_id);
        }
      } else {
        const errText = await response.text();
        console.error("[fetchMyJoinRequests] response not ok:", response.status, errText);
        toast.error(`Failed to load your join requests: ${response.status}`);
        setMyJoinRequests([]);
      }
    } catch (error) {
      console.error("[fetchMyJoinRequests] error:", error);
      toast.error(error.message);
      setMyJoinRequests([]);
    }
  };

  // Tambahkan fungsi fetchMembers jika belum ada
  // Perbaiki agar members selalu array
  // const fetchMembers = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem('token');
  //     const url = `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/companies/${company_id}/members`;
  //     const response = await fetch(url, {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     let data = await response.json();
  //     // Pastikan data array, jika null atau bukan array, jadikan array kosong
  //     if (!Array.isArray(data)) {
  //       data = Array.isArray(data.data) ? data.data : [];
  //     }
  //     setMembers(data);
  //   } catch (error) {
  //     setMembers([]);
  //     toast.error("Failed to fetch members");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        // Ganti reject_reason menjadi rejection_reason
        options.body = JSON.stringify({ action, rejection_reason: rejectReason });
      }

      const response = await fetch(url, options);

      if (response.ok) {
        toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchMyJoinRequests();
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

  const filteredMembers = Array.isArray(members)
    ? members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Tambahkan filter agar hanya join request untuk companyId yang aktif yang ditampilkan
  // Pastikan filter menggunakan string pada kedua sisi
  const myCompanyJoinRequests = Array.isArray(myJoinRequests)
    ? myJoinRequests.filter(
      (req) => String(req.company_id) === String(company_id)
    )
    : [];

  if (Array.isArray(myJoinRequests) && myJoinRequests.length === 0) {
    // console.warn("[ManageMember] myJoinRequests is empty, nothing to show in table.");
  }

  // Fungsi submit join request
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
        // Hapus query param showJoin dari URL
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

  // Tambahkan log di render agar bisa cek isi myJoinRequests dan company_id
  console.log("[ManageMember] Render: myJoinRequests =", myJoinRequests, "company_id =", company_id);

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
              {/* Tampilkan nama company */}
              {company && (
                <span className="ml-4 text-lg font-semibold text-gray-600">
                  ({company.name})
                </span>
              )}
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

          {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && joinRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Pending Join Requests ({joinRequests.length})</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {joinRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{request.user.name}</p>
                      <p className="text-sm text-gray-600">{request.user.email}</p>
                      {request.message && (
                        <p className="text-sm text-gray-500">Message: {request.message}</p>
                      )}
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
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
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

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Name</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Message</th>
                  <th className="px-4 py-3 text-sm text-gray-600 font-medium">Status</th>
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
                ) : filteredMembers.length === 0 && myCompanyJoinRequests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      {searchTerm ? 'No matching members found' : 'No members found'}
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredMembers.map((member) => (
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
                    ))}
                    {/* My Join Requests as table rows */}
                    {myCompanyJoinRequests.map(request => (
                      <tr key={`myreq-${request.id}`} className="border-b bg-yellow-50">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <span className="font-medium text-gray-800">
                            {request.company?.name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {request.message || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          <span className={`text-xs px-2 py-1 rounded 
                              ${request.status === 'pending' ? 'bg-gray-200 text-gray-700' : ''}
                              ${request.status === 'approved' ? 'bg-green-200 text-green-700' : ''}
                              ${request.status === 'rejected' ? 'bg-red-200 text-red-700' : ''}
                            `}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          {request.rejection_reason && (
                            <span className="ml-2 text-xs text-red-500">
                              {request.rejection_reason}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {/* Jika status pending, tampilkan tombol approve/reject */}
                          {(request.status === 'pending' && (currentUserRole === 'admin' || currentUserRole === 'super_admin')) && (
                            <>
                              <button
                                onClick={() => handleReviewRequest(request.id, 'approve')}
                                className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
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
                required
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
                onClick={() => handleReviewRequest(selectedRequest.id, 'reject')}
                disabled={!rejectReason}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Submit Rejection
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
                  // Hapus query param showJoin dari URL
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
    </div>
  );
};

export default ManageMember;