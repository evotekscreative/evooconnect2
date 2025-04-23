import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const fakeEmailDatabase = ["user@example.com", "admin@site.com"];

      if (fakeEmailDatabase.includes(email)) {
        setMessage(
          "We’ve sent you an email with instructions to reset your password. Check your inbox for a reset link"
        );
        setMessageColor("text-green-600");
      } else {
        setMessage("No account found with that email.");
        setMessageColor("text-red-600");
      }

      setSubmitted(true);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Your Password?
        </h2>

        {submitted ? (
          <div className={`text-center font-medium mb-4 ${messageColor}`}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="guest@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-2 rounded-lg transition ${
                loading
                  ? "bg-primary cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700"
              } text-white`}
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
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-blue-600 hover:underline text-sm">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
