import React, { useState, useEffect } from "react";
import { User, RefreshCw, Search, Check, X } from "lucide-react";
import { toast } from "react-toastify";

const rowsPerPage = 10;

const CompanyEditRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please log in to view edit requests");
        setIsLoading(false);
        return;
      }
      let url = `${apiUrl}/api/admin/company-edit-requests?limit=${rowsPerPage}&offset=${
        (currentPage - 1) * rowsPerPage
      }`;
      if (statusFilter !== "all") {
        url = `${apiUrl}/api/admin/company-edit-requests/status/${statusFilter}?limit=${rowsPerPage}&offset=${
          (currentPage - 1) * rowsPerPage
        }`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch edit requests");
      const data = await response.json();
      setRequests(Array.isArray(data.data) ? data.data : []);
      setTotalCount(data.total || data.data.length);
    } catch (error) {
      toast.error("Failed to load edit requests: " + error.message);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReviewAction = async (requestId, status, reason = null) => {
    setIsReviewing(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }
      const payload = {
        status,
        ...(status === "rejected" && reason && { rejection_reason: reason }),
      };
      const response = await fetch(
        `${apiUrl}/api/admin/company-edit-requests/review/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.data || `Failed to ${status} request`);
        setIsReviewing(false);
        return;
      }
      fetchRequests();
      toast.success(`Request ${status} successfully`);
      setRejectionModalOpen(false);
      setRejectionReason("");
      setCurrentRequestId(null);
      setIsReviewing(false);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to review request");
      setIsReviewing(false);
    }
  };

  const handleApprove = (requestId) => {
    handleReviewAction(requestId, "approved");
  };

  const handleReject = (requestId) => {
    setCurrentRequestId(requestId);
    setRejectionModalOpen(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    handleReviewAction(currentRequestId, "rejected", rejectionReason);
  };

  const filteredData = requests.filter(
    (req) =>
      req?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      req?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ""
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchRequests();
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="relative flex flex-col w-full mb-6 bg-white border border-gray-900 rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-900 rounded-t-lg bg-sky-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-white">
            Company Edit Requests ({totalCount})
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 text-gray-700 bg-white border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {/* Search Box */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-900 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center p-2.5 border border-gray-900 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border-b border-gray-900">
            <table className="min-w-full divide-y divide-gray-900">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase border-r border-gray-900 bg-sky-800">
                    Company
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase border-r border-gray-900 bg-sky-800">
                    Requested By
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase border-r border-gray-900 bg-sky-800">
                    Requested Changes
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase border-r border-gray-900 bg-sky-800">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase border-r border-gray-900 bg-sky-800">
                    Requested At
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase bg-sky-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-900">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-6 text-sm text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <img
                              className="object-cover w-10 h-10 rounded-md"
                              src={
                                request.company.logo
                                  ? `${apiUrl}/${request.company.logo.replace(
                                      /^\/+/,
                                      ""
                                    )}`
                                  : "/default-company-logo.png"
                              }
                              alt="Company logo"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.company.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-900 whitespace-nowrap">
                        {request.user?.name || "N/A"}
                        <div className="text-gray-400">
                          {request.user?.email || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-900 whitespace-nowrap">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="text-blue-600 underline hover:text-blue-900"
                        >
                          View Changes
                        </button>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-900 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-900 whitespace-nowrap">
                        {new Date(request.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          {(request.status === "pending" ||
                            !request.status) && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                                disabled={isReviewing}
                              >
                                {isReviewing ? (
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                                disabled={isReviewing}
                              >
                                {isReviewing ? (
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                  <X className="w-5 h-5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-6 text-sm text-center text-gray-500"
                    >
                      No edit requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-900">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * rowsPerPage + 1, totalCount)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
      /* Detail Modal */
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-all duration-300 backdrop-blur-sm bg-black/40"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            {/* Modal Container */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all duration-300 transform scale-100 bg-white border border-gray-200 shadow-2xl rounded-lg sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
              {/* Header Section */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Edit Request Details
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Status Banner */}
                <div className="p-4 mb-6 border-l-4 border-yellow-400 rounded-r-lg bg-yellow-50">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        Request Status:{" "}
                        {selectedRequest.status === "pending"
                          ? "Pending Review"
                          : selectedRequest.status}
                      </p>
                      <p className="text-sm text-yellow-700">
                        Request ID:{" "}
                        <span className="font-mono">{selectedRequest.id}</span>
                      </p>
                      <p className="mt-1 text-xs text-yellow-600">
                        Submitted:{" "}
                        {new Date(selectedRequest.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedRequest.requested_changes &&
                    Object.entries(selectedRequest.requested_changes).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center mb-2">
                            <User className="w-4 h-4 mr-2 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Current:</p>
                              <p className="text-sm text-gray-900">
                                {selectedRequest.current_data?.[key] || "N/A"}
                              </p>
                            </div>
                            {value !== selectedRequest.current_data?.[key] && (
                              <div>
                                <p className="text-xs text-blue-600">
                                  Pending:
                                </p>
                                <p className="text-sm font-medium text-blue-800">
                                  {value || "N/A"}
                                </p>
                              </div>
                            )}
                            {value === selectedRequest.current_data?.[key] && (
                              <p className="text-xs text-gray-400">
                                No changes requested
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                </div>

                {/* Logo Comparison */}
                {(selectedRequest.requested_changes?.logo ||
                  selectedRequest.current_data?.logo) && (
                  <div className="p-4 mt-6 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-sm font-medium text-gray-700">
                      Logo Changes
                    </h3>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="mb-2 text-xs text-gray-500">
                          Current Logo
                        </p>
                        <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border rounded-lg">
                          {selectedRequest.current_data?.logo ? (
                            <img
                              src={
                                selectedRequest.current_data.logo.startsWith(
                                  "http"
                                )
                                  ? selectedRequest.current_data.logo
                                  : `${apiUrl}/${selectedRequest.current_data.logo.replace(
                                      /^\/+/,
                                      ""
                                    )}`
                              }
                              alt="Current logo"
                              className="object-cover w-full h-full rounded-lg"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-500">
                              {selectedRequest.company?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedRequest.requested_changes?.logo &&
                        selectedRequest.requested_changes.logo !==
                          selectedRequest.current_data?.logo && (
                          <div className="text-center">
                            <p className="mb-2 text-xs text-blue-600">
                              Pending Logo
                            </p>
                            <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border rounded-lg">
                              <img
                                src={
                                  selectedRequest.requested_changes.logo.startsWith(
                                    "http"
                                  )
                                    ? selectedRequest.requested_changes.logo
                                    : `${apiUrl}/${selectedRequest.requested_changes.logo.replace(
                                        /^\/+/,
                                        ""
                                      )}`
                                }
                                alt="Pending logo"
                                className="object-cover w-full h-full rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Request Details */}
                <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="mb-4 text-sm font-medium text-gray-700">
                    Request Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Requested by</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedRequest.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedRequest.user?.email || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {selectedRequest.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(
                          selectedRequest.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(
                          selectedRequest.updated_at ||
                            selectedRequest.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedRequest.status === "rejected" &&
                  selectedRequest.rejection_reason && (
                    <div className="p-4 mt-6 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center mb-2">
                        <X className="w-5 h-5 mr-2 text-red-500" />
                        <label className="text-sm font-medium text-red-700">
                          Rejection Reason
                        </label>
                      </div>
                      <p className="text-sm text-red-900">
                        {selectedRequest.rejection_reason}
                      </p>
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Reason Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-all duration-300 backdrop-blur-sm bg-black/40"
              aria-hidden="true"
              onClick={() => setRejectionModalOpen(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block overflow-hidden text-left align-bottom transition-all duration-300 transform scale-100 bg-white border border-gray-100 shadow-2xl rounded-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 pt-6 pb-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Rejection Reason
                    </h3>
                    <div className="mt-2">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Please provide the reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end px-6 py-4 space-x-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setRejectionModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRejection}
                  disabled={isReviewing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReviewing ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyEditRequests;
