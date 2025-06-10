'use client'
import { useState, useEffect } from 'react';
import { User, RefreshCw, Search, Check, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

const CompanyEditRequests = ({ color = "light" }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const rowsPerPage = 10;

  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const fetchEditRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Please log in to view edit requests");
        setIsLoading(false);
        return;
      }

      let url = `${apiUrl}/api/admin/company-edit-requests?limit=${rowsPerPage}&offset=${(currentPage - 1) * rowsPerPage}`;

      if (statusFilter !== 'all') {
        url = `${apiUrl}/api/admin/company-edit-requests/status/${statusFilter}?limit=${rowsPerPage}&offset=${(currentPage - 1) * rowsPerPage}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch edit requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data) {
        setRequests(data.data);
        setTotalCount(data.total || data.data.length);
      } else if (Array.isArray(data)) {
        setRequests(data);
        setTotalCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching edit requests:', error);
      toast.error("Failed to load edit requests: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchEditRequests();
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

    const response = await fetch(`${apiUrl}/api/admin/company-edit-requests/review/${requestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        ...(status === 'rejected' && reason && { rejection_reason: reason })
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to ${status} edit request: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      toast.success(`Edit request ${status} successfully`);
      fetchEditRequests(); // Refresh the list
      setRejectionModalOpen(false);
      setRejectionReason('');
      setCurrentRequestId(null);
    } else {
      throw new Error(data.message || `Failed to ${status} edit request`);
    }
  } catch (error) {
    console.error(`Error ${status} edit request:`, error);
    toast.error(error.message);
  } finally {
    setIsReviewing(false);
  }
};

  const handleApprove = (requestId) => {
    handleReviewAction(requestId, 'approved');
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
    handleReviewAction(currentRequestId, 'rejected', rejectionReason);
  };

  const filteredData = requests.filter(req =>
    (req?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (req?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchEditRequests();
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const renderDiff = (field, currentValue, requestedValue) => {
    if (currentValue === requestedValue) {
      return <span className="text-gray-500">{currentValue || 'N/A'}</span>;
    }
    
    return (
      <div className="flex flex-col">
        <span className="text-red-500 line-through">{currentValue || 'N/A'}</span>
        <span className="text-green-600">{requestedValue || 'N/A'}</span>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col w-full mb-6 bg-white border border-gray-900 rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-900 rounded-t-lg bg-sky-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-white">
            Company Edit Requests ({totalCount})
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-900 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Requested At
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase border-r border-gray-900 bg-sky-800">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase bg-sky-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-900">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-6 text-sm text-center text-gray-500">
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
                              src={'http://localhost:3000/' + (request.company?.logo || 'default-company-logo.png')}
                              alt="Company logo"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.company?.name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-900 whitespace-nowrap">
                        {request.user?.name || 'N/A'}
                        <div className="text-gray-400">{request.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-900 whitespace-nowrap">
                        {new Date(request.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 border-r border-gray-900 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {request.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          {(request.status === 'pending' || !request.status) && (
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
                    <td colSpan="5" className="px-6 py-6 text-sm text-center text-gray-500">
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * rowsPerPage + 1, totalCount)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * rowsPerPage, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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

      {/* Edit Request Detail Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-all duration-300 backdrop-blur-sm bg-black/40"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Container */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all duration-300 transform scale-100 bg-white border border-gray-100 shadow-2xl rounded-2xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">

              {/* Header Section */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {selectedRequest.company?.logo ? (
                        <div className="relative">
                          <img
                            src={selectedRequest.company.logo.startsWith('http') ? selectedRequest.company.logo : `${apiUrl}/${selectedRequest.company.logo}`}
                            alt="Company Logo"
                            className="object-cover w-16 h-16 shadow-md rounded-xl ring-2 ring-white"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-16 h-16 shadow-md bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Title and Status */}
                    <div>
                      <h3 className="mb-1 text-2xl font-bold text-gray-900">
                        {selectedRequest.company?.name || 'Company Name'} - Edit Request
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedRequest.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200' :
                          selectedRequest.status === 'rejected'
                            ? 'bg-red-100 text-red-800 ring-1 ring-red-200' :
                            'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                          }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${selectedRequest.status === 'approved' ? 'bg-emerald-400' :
                            selectedRequest.status === 'rejected' ? 'bg-red-400' :
                              'bg-amber-400'
                            }`}></div>
                          {selectedRequest.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 transition-colors duration-150 rounded-lg hover:text-gray-600 hover:bg-white/50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Requested By */}
                  <div className="p-4 transition-colors duration-150 bg-gray-50 rounded-xl hover:bg-gray-100">
                    <div className="flex items-center mb-2 space-x-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <label className="text-sm font-semibold tracking-wide text-gray-600 uppercase">Requested By</label>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <img
                          className="object-cover w-10 h-10 rounded-full"
                          src={selectedRequest.user?.photo || 'https://via.placeholder.com/50'}
                          alt="User avatar"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-medium text-gray-900">{selectedRequest.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{selectedRequest.user?.email || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requested At */}
                  <div className="p-4 transition-colors duration-150 bg-gray-50 rounded-xl hover:bg-gray-100">
                    <div className="flex items-center mb-2 space-x-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <label className="text-sm font-semibold tracking-wide text-gray-600 uppercase">Requested At</label>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Changes Section */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">Requested Changes</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Field</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Current Value</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Requested Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(selectedRequest.requested_changes || {}).map(([field, requestedValue]) => (
                          <tr key={field}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize whitespace-nowrap">
                              {field.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {selectedRequest.current_data?.[field] || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {renderDiff(field, selectedRequest.current_data?.[field], requestedValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                  <div className="p-4 bg-red-50 rounded-xl">
                    <div className="flex items-center mb-2 space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <label className="text-sm font-semibold tracking-wide text-red-600 uppercase">Rejection Reason</label>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex flex-col justify-end space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-150 bg-white border border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-md"
                  >
                    Close
                  </button>
                </div>
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

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block overflow-hidden text-left align-bottom transition-all duration-300 transform scale-100 bg-white border border-gray-100 shadow-2xl rounded-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 pt-6 pb-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Rejection Reason</h3>
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
                  {isReviewing ? 'Submitting...' : 'Confirm Rejection'}
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