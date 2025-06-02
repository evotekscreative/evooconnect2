'use client'
import { useState, useEffect } from 'react';
import { User, RefreshCw, Search, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

const CompanySubmissions = ({ color = "light" }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 10;

  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Use a try-catch with a timeout to handle network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `${apiUrl}/api/admin/company/submissions?limit=${rowsPerPage}&offset=${(currentPage - 1) * rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }

      const data = await response.json();

      // Use mock data if the API returns empty data
      if (!data || (Array.isArray(data.data) && data.data.length === 0)) {
        console.log("No data returned from API, using mock data");
        setSubmissions([
          {
            id: "mock-1",
            name: "Example Company",
            industry: "Technology",
            website: "https://example.com",
            status: "pending",
            user: { name: "John Doe", email: "john@example.com" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        setTotalCount(1);
      } else {
        if (data.data) {
          setSubmissions(data.data);
          setTotalCount(data.total || data.data.length);
        } else if (Array.isArray(data)) {
          setSubmissions(data);
          setTotalCount(data.length);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);

      // If it's a network error, show a more helpful message
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please check your connection.");
      } else if (error.message.includes('Failed to fetch')) {
        toast.error("Network error. Please check if the backend server is running.");
      } else {
        toast.error("Failed to load submissions: " + error.message);
      }

      // Use mock data for development
      setSubmissions([
        {
          id: "mock-1",
          name: "Example Company",
          industry: "Technology",
          website: "https://example.com",
          status: "pending",
          user: { name: "John Doe", email: "john@example.com" },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setTotalCount(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Initial fetch and when currentPage changes
  useEffect(() => {
    fetchSubmissions();
  }, [currentPage]);

  // Handle approve/reject
  const handleReview = async (submissionId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}/api/admin/company/submission/${submissionId}/review`,
        {
          method: 'PUT',  // Use PUT as specified in Postman
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      // Handle the response
      if (!response.ok) {
        throw new Error(`Failed to ${status} submission`);
      }

      toast.success(`Submission ${status} successfully`);
      fetchSubmissions();
      if (isModalOpen) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(`Error ${status} submission:`, error);
      toast.error(`Error: ${error.message}`);
    }
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
                              src={'http://localhost:3000' + submission.logo}
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
                                onClick={() => handleReview(submission.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReview(submission.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <X className="h-5 w-5" />
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
        <div className="px-6 py-4 bg-white border-t border-gray-900 rounded-b-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min(startIndex + 1, totalCount)}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalCount)}</span> of{' '}
              <span className="font-medium">{totalCount}</span> results
            </div>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-900 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border text-sm font-medium rounded-md ${currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-900 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 py-5 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-xl leading-6 font-semibold text-gray-900 mb-6">
                      Submission Details - {selectedSubmission.name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-900">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">User Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-900">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">Company Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Industry</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.industry}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Size</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.size}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.type}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-900 mb-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800">Additional Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tagline</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedSubmission.tagline || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Website</p>
                          <a
                            href={selectedSubmission.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            {selectedSubmission.website || 'N/A'}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                          <a
                            href={selectedSubmission.linkedin_url ? `https://linkedin.com/company/${selectedSubmission.linkedin_url}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            {selectedSubmission.linkedin_url ? `linkedin.com/company/${selectedSubmission.linkedin_url}` : 'N/A'}
                          </a>
                        </div>
                        {selectedSubmission.logo && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Logo</p>
                            <img
                              src={selectedSubmission.logo}
                              alt="Company logo"
                              className="mt-1 h-20 w-20 object-contain border border-gray-200 rounded"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-900">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800">Submission Status</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className="mt-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedSubmission.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : selectedSubmission.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {selectedSubmission.status || 'pending'}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Submitted At</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Last Updated</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedSubmission.updated_at ? new Date(selectedSubmission.updated_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-900">
                {(!selectedSubmission.status || selectedSubmission.status === 'pending') && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReview(selectedSubmission.id, 'approved')}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(selectedSubmission.id, 'rejected')}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
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