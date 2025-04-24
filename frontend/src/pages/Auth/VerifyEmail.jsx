import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state or localStorage as fallback
  const [email, setEmail] = useState(
    location.state?.email || localStorage.getItem('verify_email') || ""
  );

  // Persist email in localStorage whenever it changes
  useEffect(() => {
    if (email) {
      localStorage.setItem('verify_email', email);
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email and code
    if (!email) {
      setMessage("Email is required for verification");
      setMessageColor("text-red-600");
      setSubmitted(true);
      return;
    }
    
    if (!code) {
      setMessage("Verification code is required");
      setMessageColor("text-red-600");
      setSubmitted(true);
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setResendMessage("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify",
        {
          token: code,
          email // Make sure email is included
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
          }
        }
      );

      setMessage("Your email has been verified successfully!");
      setMessageColor("text-green-600");
      localStorage.removeItem('verify_email'); // Clean up

      setTimeout(() => {
        navigate('/'); // Redirect to home after verification
      }, 2000);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setMessage("Verification failed. Your session may have expired.");
        } else if (error.response.status === 400) {
          setMessage(error.response.data?.data || "Invalid verification code");
        } else {
          setMessage("Verification failed. Please try again later.");
        }
      } else {
        setMessage("Network error. Please check your connection.");
      }
      setMessageColor("text-red-600");
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    setMessage("");

    try { 
      const response = await axios.post("http://localhost:3000/api/auth/verify/send", {
        email
      });
      setResendMessage("Verification code has been resent to your email.");
      setMessageColor("text-green-600");
    } catch (error) {
      setResendMessage("Failed to resend verification code. Please try again later.");
      setMessageColor("text-red-600");
    }

    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Verify Your Email
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          We've sent a verification code to <span className="font-semibold">{email}</span>
        </p>

        {(submitted || resendMessage) && (
          <div className={`text-center font-medium mb-4 ${messageColor}`}>
            {message || resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your verification code"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-2 rounded-lg transition text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className={`w-full font-semibold py-2 rounded-lg transition border mt-2 ${
              resendLoading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-500 hover:bg-blue-50"
            }`}
          >
            {resendLoading ? "Resending..." : "Resend Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;