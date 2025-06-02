import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function CreateCompanyStatus() {
  const location = useLocation();
  const [status, setStatus] = useState("pending");
  const submissionId = location.state?.submissionId;

  useEffect(() => {
    // Check submission status periodically
    const checkStatus = async () => {
      try {
        if (!submissionId) return;
        
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        
        const response = await fetch(`${apiUrl}/api/company/submissions/${submissionId}/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status || "pending");
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    // Check immediately and then every 30 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [submissionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Company Submitted Successfully
        </h1>
        <p className="text-gray-600 mb-6">
          Your company information has been submitted and is pending review by our team.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-700">
            Current status: <span className="font-medium">{status}</span>
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            You will be notified when your submission is approved.
          </p>
        </div>
      </div>
    </div>
  );
}
