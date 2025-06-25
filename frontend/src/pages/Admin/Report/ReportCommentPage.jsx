import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import { FaCommentDots } from "react-icons/fa";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const ReportCommentPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [takeDownReason, setTakeDownReason] = useState("");

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(
        `${BASE_URL}/api/admin/reports?page=${page}&limit=10&target_type=comment`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.code === 200) {
        setReports(data.data.reports || []);
        setCurrentPage(data.data.current_page);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleTakeAction = async (action, reason = "") => {
    if (!selectedReport) return;

    const payload = {
      status: "accepted",
      action: action,
      reason: reason || "comment tidak pantas",
    };

    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(
        `${BASE_URL}/api/admin/reports/${selectedReport.id}/action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (data.code === 200) {
        alert(
          `Action taken successfully!\nReport ID: ${data.data.report_id}\nAction: ${data.data.action}\nStatus: ${data.data.status}`
        );
        setShowModal(false);
        setShowReasonModal(false);
        setTakeDownReason("");
        fetchReports();
      } else {
        alert(`Failed to take action: ${data.status} - ${data.data}`);
      }
    } catch (error) {
      console.error("Error taking action:", error);
      alert("Error taking action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeDown = () => {
    setShowModal(false);
    setShowReasonModal(true);
  };

  const confirmTakeDown = () => {
    if (!takeDownReason.trim()) {
      alert("Please provide a reason for taking down this comment");
      return;
    }
    handleTakeAction("take_down", takeDownReason);
  };

  const openActionModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      <main className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaCommentDots /> Report Comment
        </h1>

        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Isi Komentar</th>
                <th className="px-4 py-2">Dilaporkan Oleh</th>
                <th className="px-4 py-2">Alasan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : !reports || reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report.id} className="border-t">
                    <td className="px-4 py-2">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-4 py-2">{report.target_content}</td>
                    <td className="px-4 py-2">{report.reporter_name}</td>
                    <td className="px-4 py-2">{report.target_title}</td>
                    <td className="px-4 py-2">{report.reason}</td>
                    <td className="px-4 py-2">{report.status}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          report.status === "pending"
                            ? "bg-yellow-200 text-yellow-800"
                            : report.status === "accepted"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {report.status === "pending" && (
                        <button
                          onClick={() => openActionModal(report)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Take Action
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">Take Action on Report</h3>
              <p className="mb-4">Report Reason: {selectedReport?.reason}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleTakeDown}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Take Down
                </button>
                <button
                  onClick={() => handleTakeAction("reject")}
                  disabled={actionLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Take Down Reason Modal */}
        {showReasonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">Take Down Comment</h3>
              <p className="mb-4">
                Please provide a reason for taking down this comment:
              </p>
              <textarea
                value={takeDownReason}
                onChange={(e) => setTakeDownReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full p-3 border rounded-lg mb-4 h-24 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={confirmTakeDown}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm Take Down"}
                </button>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setTakeDownReason("");
                    setShowModal(true);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportCommentPage;
