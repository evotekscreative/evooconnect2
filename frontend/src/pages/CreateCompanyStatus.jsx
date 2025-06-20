import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, XCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";

export default function CreateCompanyStatus() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
      
      const response = await fetch(`${apiUrl}/api/company/submissions/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status || "pending");
        setSubmissionData(data);
        
        if (data.status === "approved") {
          toast.success("Your company has been approved!");
          setTimeout(() => navigate("/jobs"), 3000);
        } else if (data.status === "rejected") {
          toast.error("Your company submission was rejected");
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking status:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleBackToJobs = () => {
    navigate("/jobs");
  };

  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-6" />;
      case "rejected":
        return <XCircle className="text-red-500 w-16 h-16 mx-auto mb-6" />;
      default:
        return <Clock className="text-yellow-500 w-16 h-16 mx-auto mb-6" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "approved":
        return "Your company has been approved!";
      case "rejected":
        return "Your company submission was rejected";
      default:
        return "Your company information has been submitted and is pending review by our team.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full relative">
        {/* Back button */}
        <button
          onClick={handleBackToJobs}
          className="absolute top-4 left-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back to Jobs</span>
        </button>
        
        {getStatusIcon()}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {status === "approved" 
            ? "Company Approved Successfully" 
            : status === "rejected"
              ? "Submission Rejected"
              : "Company Submitted Successfully"}
        </h1>
        <p className="text-gray-600 mb-6">
          {getStatusMessage()}
        </p>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className={`border rounded-md p-4 ${
            status === "approved" 
              ? "bg-green-50 border-green-200" 
              : status === "rejected"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
          }`}>
            <p className={`text-sm ${
              status === "approved" 
                ? "text-green-700" 
                : status === "rejected"
                  ? "text-red-700"
                  : "text-yellow-700"
            }`}>
              Current status: <span className="font-medium">{status}</span>
            </p>
            
            {status === "rejected" && submissionData?.rejection_reason && (
              <div className="mt-2 p-2 bg-red-100 rounded">
                <p className="text-xs text-red-700">
                  <strong>Reason:</strong> {submissionData.rejection_reason}
                </p>
              </div>
            )}
            
            <p className={`text-xs mt-1 ${
              status === "approved" 
                ? "text-green-600" 
                : status === "rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
            }`}>
              {status === "pending" 
                ? "You will be redirected when your submission is reviewed." 
                : status === "approved"
                  ? "Redirecting to jobs page..."
                  : "Please review the reason and submit again if needed."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
