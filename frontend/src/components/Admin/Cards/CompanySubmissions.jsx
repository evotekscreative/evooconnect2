'use client'
import { useState, useEffect } from 'react';
import { User, RefreshCw, Search, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const CompanySubmissions = ({ color = "light" }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const rowsPerPage = 10;

  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view submissions");
        setIsLoading(false);
        return;
      }

      // URL endpoint berdasarkan filter status
      let url = `${apiUrl}/api/admin/company-submissions?limit=${rowsPerPage}&offset=${(currentPage - 1) * rowsPerPage}`;

      // Jika status filter bukan 'all', gunakan endpoint status
      if (statusFilter !== 'all') {
        url = `${apiUrl}/api/admin/company-submissions/status/${statusFilter}?limit=${rowsPerPage}&offset=${(currentPage - 1) * rowsPerPage}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data) {
        setSubmissions(data.data);
        setTotalCount(data.total || data.data.length);
      } else if (Array.isArray(data)) {
        setSubmissions(data);
        setTotalCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Failed to load submissions: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchSubmissions();
  }, [currentPage, statusFilter]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchSubmissions();
  }, [currentPage]);

  const handleReviewAction = async (submissionId, status, reason = null) => {
    setIsReviewing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const payload = {
        status,
        ...(status === 'rejected' && reason && { rejection_reason: reason })
      };

      console.log(`Trying with Axios-like approach for ${status}`);

      // Gunakan pendekatan yang mirip dengan Postman
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${apiUrl}/api/admin/company-submissions/review/${submissionId}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log("Status:", xhr.status);
          console.log("Response:", xhr.responseText);

          if (xhr.status >= 200 && xhr.status < 300) {
            // Sukses - refresh data
            fetchSubmissions().then(() => {
              toast.success(`Submission ${status} successfully`);
              setRejectionModalOpen(false);
              setRejectionReason('');
              setCurrentSubmissionId(null);
              setIsReviewing(false);
            });
          } else {
            // Error
            console.error("Error response:", xhr.responseText);
            toast.error(`Failed to ${status} submission`);
            setIsReviewing(false);
          }
        }
      };

      xhr.send(JSON.stringify(payload));
    } catch (error) {
      console.error(`Error ${status} submission:`, error);
      toast.error(`Failed to ${status} submission`);
      setIsReviewing(false);
    }
  };

  const handleApprove = (submissionId) => {
    handleReviewAction(submissionId, 'approved');
  };

  const handleReject = (submissionId) => {
    setCurrentSubmissionId(submissionId);
    setRejectionModalOpen(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    handleReviewAction(currentSubmissionId, 'rejected', rejectionReason);
  };

  const filteredData = submissions.filter(sub =>
    (sub?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (sub?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchSubmissions();
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <div className="relative flex flex-col w-full mb-6 shadow-lg rounded-lg border border-gray-900 bg-white">
      {/* Header Section */}
      <div className="rounded-t-lg px-6 py-4 border-b border-gray-900 bg-sky-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            Company Submissions ({totalCount})
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
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
              <RefreshCw className="h-5 w-5" />
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
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Submitted By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Website
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-sky-800 text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-900">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-6 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-900">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={submission.logo ? (submission.logo.startsWith('http') ? submission.logo : `${apiUrl}/${submission.logo}`) : 'https://via.placeholder.com/50'}
                              alt="Company logo"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{submission.name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        {submission.user?.name || 'N/A'}
                        <div className="text-gray-400">{submission.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 border-r border-gray-900">
                        {submission.website ? (
                          <a href={submission.website} target="_blank" rel="noopener noreferrer">
                            {submission.website}
                          </a>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        {submission.industry || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-900">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {submission.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewSubmission(submission)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <User className="h-5 w-5" />
                          </button>

                          {(submission.status === 'pending' || !submission.status) && (
                            <>
                              <button
                                onClick={() => handleApprove(submission.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                                disabled={isReviewing}
                              >
                                {isReviewing ? (
                                  <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Check className="h-5 w-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(submission.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                                disabled={isReviewing}
                              >
                                {isReviewing ? (
                                  <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                  <X className="h-5 w-5" />
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
                    <td colSpan="6" className="px-6 py-6 text-center text-sm text-gray-500">
                      No submissions found
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
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-900">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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

      {/* Enhanced Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-all duration-300 backdrop-blur-sm bg-black/40"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Container */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">

              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {selectedSubmission.logo ? (
                        <div className="relative">
                          <img
                            src={selectedSubmission.logo.startsWith('http') ? selectedSubmission.logo : `${apiUrl}/${selectedSubmission.logo}`}
                            alt="Company Logo"
                            className="w-16 h-16 object-cover rounded-xl shadow-md ring-2 ring-white"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Title and Status */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedSubmission.name || 'Company Name'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedSubmission.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200' :
                          selectedSubmission.status === 'rejected'
                            ? 'bg-red-100 text-red-800 ring-1 ring-red-200' :
                            'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                          }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${selectedSubmission.status === 'approved' ? 'bg-emerald-400' :
                            selectedSubmission.status === 'rejected' ? 'bg-red-400' :
                              'bg-amber-400'
                            }`}></div>
                          {selectedSubmission.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleCloseModal}
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors duration-150"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Company Details */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-150">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Company</label>
                      </div>
                      <p className="text-lg font-medium text-gray-900">{selectedSubmission.name || 'N/A'}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-150">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                        </svg>
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Industry</label>
                      </div>
                      <p className="text-lg font-medium text-gray-900">{selectedSubmission.industry || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Website and Review Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-150">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                        </svg>
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Website</label>
                      </div>
                      {selectedSubmission.website ? (
                        <a
                          href={selectedSubmission.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150"
                        >
                          {selectedSubmission.website}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      ) : (
                        <p className="text-lg font-medium text-gray-500">N/A</p>
                      )}
                    </div>

                    {selectedSubmission.status !== 'pending' && selectedSubmission.reviewed_at && (
                      <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-150">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Reviewed</label>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(selectedSubmission.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedSubmission.status === 'rejected' && selectedSubmission.rejection_reason && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <label className="text-sm font-semibold text-red-600 uppercase tracking-wide">Rejection Reason</label>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 shadow-sm hover:shadow-md"
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
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-all duration-300 backdrop-blur-sm bg-black/40"
              aria-hidden="true"
              onClick={() => setRejectionModalOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
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
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectionModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRejection}
                  disabled={isReviewing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CompanySubmissions;