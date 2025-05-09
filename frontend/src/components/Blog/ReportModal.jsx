import React from "react";

const ReportModal = ({ show, onClose, onSubmit, reasons, selectedReason, setSelectedReason, customReason, setCustomReason }) => {
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 p-5">
          <h3 className="text-lg font-semibold mb-4">Report this post</h3>
          <p className="mb-3 text-sm text-gray-600">Choose the applicable policy</p>
  
          <div className="grid grid-cols-2 gap-2 mb-4">
            {reasons.map((reason) => (
              <button
                key={reason}
                className={`py-2 px-3 text-sm border rounded-full ${
                  selectedReason === reason
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => setSelectedReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>
  
          {selectedReason === "Other" && (
            <textarea
              className="w-full p-2 border rounded mb-3 text-sm"
              rows={3}
              placeholder="Explain why you're reporting this post"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
  
          <div className="flex justify-end gap-2">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded text-white ${
                selectedReason
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!selectedReason}
              onClick={onSubmit}
            >
              Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ReportModal;