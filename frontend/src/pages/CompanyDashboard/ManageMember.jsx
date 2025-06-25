import React, { useState, useEffect } from "react";
import {
  Users,
  UserMinus,
  UserPlus,
  Search,
  X,
  Check,
  Edit,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/Sidebar";
import Navbar from "../../components/CompanyDashboard/Navbar/Navbar";
import AdminNavbar from "../../components/Admin/Navbars/AdminNavbar";
import HeaderStats from "../../components/Admin/Headers/HeaderStats";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Case from "../../components/Case";
import Alert from "../../components/Auth/alert";

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
  const [newRole, setNewRole] = useState("admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [company, setCompany] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");
  const [pendingRejectReason, setPendingRejectReason] = useState("");
  const [pendingRejectingId, setPendingRejectingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies?limit=100&offset=0`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies/${company_id}/member-companies?limit=100&offset=0`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setMembers(Array.isArray(data.data.members) ? data.data.members : []);
        } else {
          setMembers([]);
          toast.error("Response is not JSON");
        }
      } else {
        let errorMsg = "Failed to fetch members";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          }
        } catch {}
        toast.error(errorMsg);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
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
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies/${company_id}/details`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = null;
      let isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
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
            ? data.message || "Failed to fetch company detail"
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
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies/${company_id}/join-requests?status=pending&limit=10&offset=0`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const raw = await response.json();
        const data = Array.isArray(raw.data) ? raw.data : [];
        const formatted = data.map((request) => ({
          ...request,
          name: request.user?.name || "-",
          email: request.user?.email || "-",
        }));
        setMyJoinRequests(formatted);
      } else {
        const errText = await response.text();
        console.error(
          "[fetchMyJoinRequests] response not ok:",
          response.status,
          errText
        );
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
    setPendingError("");
    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies/${company_id}/join-requests?status=pending&limit=100&offset=0`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const raw = await response.json();
        const data = Array.isArray(raw.data) ? raw.data : [];
        setPendingRequests(data);
      } else {
        setPendingError("Failed to load pending requests");
        setPendingRequests([]);
      }
    } catch (error) {
      setPendingError("Failed to load pending requests");
      setPendingRequests([]);
    }
    setPendingLoading(false);
  };

  const handleApprovePending = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/company-join-requests/${requestId}/review`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        setAlert({
          show: true,
          type: "success",
          message: "Request approved successfully",
        });
        setShowPendingModal(false);
        fetchPendingRequests();
        fetchMyJoinRequests();
        fetchMembers();
      } else {
        const errorData = await response.json();
        setAlert({
          show: true,
          type: "error",
          message: errorData.message || "Failed to approve request",
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Failed to approve request",
      });
    }
  };

  const handleRejectPending = async (requestId) => {
    if (!pendingRejectReason) {
      setAlert({
        show: true,
        type: "error",
        message: "Please provide a rejection reason",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/company-join-requests/${requestId}/review`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejection_reason: pendingRejectReason,
        }),
      });
      if (response.ok) {
        setAlert({
          show: true,
          type: "success",
          message: "Request rejected successfully",
        });
        setPendingRejectingId(null);
        setPendingRejectReason("");
        setShowPendingModal(false);
        fetchPendingRequests();
        fetchMyJoinRequests();
      } else {
        const errorData = await response.json();
        setAlert({
          show: true,
          type: "error",
          message: errorData.message || "Failed to reject request",
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Failed to reject request",
      });
    }
  };

  const handleRemoveMember = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
        }/api/member-companies/${memberToRemove.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setAlert({
          show: true,
          type: "success",
          message: "Member removed successfully",
        });
        fetchMembers();
      } else {
        const errorData = await response.json();
        setAlert({
          show: true,
          type: "error",
          message: errorData.message || "Failed to remove member",
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Failed to remove member",
      });
    }
    setShowRemoveModal(false);
    setMemberToRemove(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
        }/api/member-companies/${selectedMember.id}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        setAlert({
          show: true,
          type: "success",
          message: `Role updated to ${
            newRole.charAt(0).toUpperCase() + newRole.slice(1)
          } successfully`,
        });
        setShowRoleModal(false);

        setMembers((prev) =>
          prev.map((m) =>
            m.id === selectedMember.id ? { ...m, role: newRole } : m
          )
        );
      } else {
        const errorData = await response.json();
        setAlert({
          show: true,
          type: "error",
          message: errorData.message || "Failed to update role",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Failed to update role",
      });
    }
  };

  const handleSubmitJoinRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies/${company_id}/join-requests`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: joinMessage }),
      });
      if (response.ok) {
        setAlert({
          show: true,
          type: "success",
          message: "Join request sent successfully",
        });
        setShowJoinModal(false);
        setJoinMessage("");
        navigate(location.pathname, { replace: true });
        fetchMyJoinRequests();
      } else {
        const data = await response.json();
        setAlert({
          show: true,
          type: "error",
          message: data.message || "Failed to send join request",
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Failed to send join request",
      });
    }
  };

  const filteredMembers = Array.isArray(members)
    ? members.filter((member) => {
        const matchesSearch =
          member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
          roleFilter === "all" ? true : member.role === roleFilter;
        return matchesSearch && matchesRole;
      })
    : [];

  const myCompanyJoinRequests = Array.isArray(myJoinRequests)
    ? myJoinRequests.filter(
        (req) => String(req.company_id) === String(company_id)
      )
    : [];

  const fetchPendingCount = async () => {
    if (!company_id) return;
    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
      }/api/companies/${company_id}/join-requests/pending-count`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.data?.pending_count || 0);
      } else {
        setPendingCount(0);
      }
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, [company_id]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const color = "light";
  const isLight = color === "light";
  const headerClass =
    "px-6 py-3 text-xs uppercase font-semibold text-left border-b";
  const lightHeader = "bg-gray-100 text-gray-500 border-gray-200";
  const darkHeader = "bg-sky-800 text-sky-200 border-sky-700";
  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";

  return (
    <>
      <Navbar />
      <AdminNavbar />
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Case className="py-6" />
        <HeaderStats
          stats={[
            {
              label: "Pending Join Requests",
              value: pendingCount,
              icon: <UserPlus className="w-6 h-6 text-blue-500" />,
              color: "bg-blue-100 text-blue-700",
            },
          ]}
        />
        <div className="w-full px-4 mx-auto -m-32 md:px-10">
          {alert.show && (
            <div className="fixed z-50 w-full max-w-sm top-4 right-4">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
              />
            </div>
          )}
          <div className="flex flex-wrap mt-11">
            <div className="w-full px-4 mb-12">
              <div
                className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}
              >
                <div className="px-4 py-3 mb-0 border-b rounded-t border-sky-700 bg-sky-800">
                  <div className="flex flex-wrap items-center">
                    <div className="flex-1 flex-grow w-full max-w-full px-4">
                      <h3 className="text-lg font-semibold text-white">
                        Manage Members
                        {company && (
                          <span className="ml-2 text-sm font-normal">
                            ({company.name})
                          </span>
                        )}
                      </h3>
                    </div>
                    <button
                      className="px-4 py-2 font-semibold transition duration-200 bg-white rounded-lg shadow text-sky-800 hover:bg-sky-100"
                      onClick={() => {
                        setShowPendingModal(true);
                        fetchPendingRequests();
                      }}
                    >
                      Pending Requests
                    </button>
                  </div>
                </div>
                <div className="flex flex-col block w-full overflow-x-auto">
                  <div className="flex flex-col items-center gap-1 p-4 bg-white md:flex-row">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-[#F7F8FA]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F7F8FA]"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="hrd">HRD</option>
                      <option value="member">Member</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="py-8 text-center text-gray-400">
                      Loading members...
                    </div>
                  ) : (
                    <table className="items-center w-full bg-transparent border-collapse">
                      <thead>
                        <tr>
                          {["Name", "Email", "Role", "Status", "Actions"].map(
                            (title, idx) => (
                              <th
                                key={idx}
                                className={`${headerClass} ${
                                  isLight ? lightHeader : darkHeader
                                }`}
                              >
                                {title}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="py-8 text-center border-t"
                            >
                              {roleFilter === "all"
                                ? "No members found"
                                : "No members found for this role"}
                            </td>
                          </tr>
                        ) : (
                          filteredMembers.map((member) => (
                            <tr
                              key={member.id}
                              className="transition duration-200 bg-white hover:bg-gray-50"
                            >
                              <td
                                className={`border-t ${borderColor} align-top`}
                              >
                                <div className="flex items-center px-6 py-4">
                                  <img
                                    src={
                                      member.user?.avatar ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        member.user?.name || ""
                                      )}`
                                    }
                                    alt={member.user?.name}
                                    className="flex-shrink-0 object-cover w-10 h-10 border rounded-full"
                                  />
                                  <div className="min-w-0 ml-3">
                                    <p
                                      className={`font-bold ${textColor} truncate`}
                                    >
                                      {member.user?.name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs`}
                              >
                                {member.user?.email}
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs`}
                              >
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                    member.role === "admin"
                                      ? "bg-blue-100 text-blue-700"
                                      : member.role === "super_admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : member.role === "hrd"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {member.role
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs`}
                              >
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                    member.status === "pending"
                                      ? "bg-gray-100 text-gray-600"
                                      : member.status === "approved" ||
                                        member.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {member.status.charAt(0).toUpperCase() +
                                    member.status.slice(1)}
                                </span>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs whitespace-nowrap`}
                              >
                                {member.status === "active" &&
                                  member.role !== "super_admin" && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleRemoveMember(member.id)
                                        }
                                        className="p-1 text-red-600 rounded hover:bg-gray-100"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedMember(member);
                                          setNewRole(
                                            member.role === "admin"
                                              ? "member"
                                              : "admin"
                                          );
                                          setShowRoleModal(true);
                                        }}
                                        className="p-1 rounded hover:bg-gray-100 text-primary"
                                      >
                                        <Edit size={18} />
                                      </button>
                                    </div>
                                  )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Pending Join Requests</h3>
                <button
                  onClick={() => {
                    setShowPendingModal(false);
                    setPendingRequests([]);
                    setPendingRejectingId(null);
                    setPendingRejectReason("");
                  }}
                  className="p-2 text-gray-500 rounded-full hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>
              {pendingLoading ? (
                <div className="py-8 text-center text-gray-400">Loading...</div>
              ) : pendingError ? (
                <div className="py-8 text-center text-red-500">
                  {pendingError}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  No pending requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="pb-4 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {req.user?.name || "-"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {req.user?.email || "-"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-xs text-white bg-green-500 rounded-lg shadow hover:bg-green-600"
                            onClick={() => handleApprovePending(req.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg shadow hover:bg-red-600"
                            onClick={() => setPendingRejectingId(req.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      {req.message && (
                        <p className="mt-2 text-sm text-gray-600">
                          {req.message}
                        </p>
                      )}
                      {pendingRejectingId === req.id && (
                        <div className="mt-3">
                          <textarea
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                            rows={2}
                            placeholder="Enter rejection reason..."
                            value={pendingRejectReason}
                            onChange={(e) =>
                              setPendingRejectReason(e.target.value)
                            }
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              className="px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300"
                              onClick={() => {
                                setPendingRejectingId(null);
                                setPendingRejectReason("");
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg shadow hover:bg-red-600"
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
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Edit className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-center">
                Change Member Role
              </h3>
              <p className="mb-6 text-center text-gray-600">
                Change role for{" "}
                <span className="font-semibold">
                  {selectedMember.user?.name}
                </span>
              </p>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="admin">Admin</option>
                  <option value="hrd">HRD</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-6 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <UserMinus className="text-red-600" size={24} />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-center">
                Remove Member
              </h3>
              <p className="mb-6 text-center text-gray-600">
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {memberToRemove.user?.name}
                </span>{" "}
                from this company?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setMemberToRemove(null);
                  }}
                  className="px-6 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveMember}
                  className="px-6 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <UserPlus className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-center">
                Join Company
              </h3>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Message (optional)
                </label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Why do you want to join?"
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    navigate(location.pathname, { replace: true });
                  }}
                  className="px-6 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitJoinRequest}
                  className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageMember;
