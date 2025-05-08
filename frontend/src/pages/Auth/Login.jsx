import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/img/logoB.png';
import googleIcon from '../../assets/img/google-icon.jpg';
import Alert from '../../components/Auth/Alert';
import '../../assets/css/style.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Log the credential for debugging
      console.log("Google credential:", credentialResponse.credential);

      const response = await axios.post(
        "http://localhost:3000/api/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      // Check that the token is a valid JWT format with console.log
      console.log("Backend response:", response.data);

      if (!response.data.data?.token) {
        throw new Error("No token received from server");
      }

      // Store JWT token
      localStorage.setItem("token", response.data.data.token);

      // Clear any stored name/email info from localStorage
      localStorage.removeItem("register_name");
      localStorage.removeItem("register_email");

      // Show success message
      setAlertInfo({
        show: true,
        type: "success",
        message: "Registration successful!",
      });

      // Redirect to home after successful registration
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Google auth error:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message:
          error.response?.data?.data ||
          error.message ||
          "Registration with Google failed",
      });
    }
  };

  const handleGoogleError = () => {
    setAlertInfo({
      show: true,
      type: 'error',
      message: 'Google sign-in was canceled or failed'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo({ show: false, type: '', message: '' });
  
    if (!validate()) return;
  
    setLoading(true);
  
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      
      // Simpan token dan data user
      localStorage.setItem("token", response.data.data.token);
      
      localStorage.setItem("userData", JSON.stringify({
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email,
        photo: response.data.data.photo,
        // tambahkan data user lainnya sesuai response API
      }));
  
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Login successful!',
      });
  
      const navigateTo = location.state?.from?.pathname || '/';
      navigate(navigateTo);
    } catch (error) {
      setAlertInfo({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header with Logo */}
              <div className="mb-4 text-center">
                <img src={logo} alt="EVOConnect Logo" className="mx-auto h-20 object-contain" />
                <h5 className="font-bold mt-3 text-xl mb-2">Welcome to EVOConnect</h5>
                <p className="text-gray-500 text-sm">
                  Don't miss your next opportunity. Sign in to stay updated on your professional world.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-left mb-1 text-sm text-gray-600">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="block text-left mb-1 text-sm text-gray-600">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                </div>

                {/* Remember Checkbox */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                    Remember password
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn-primary text-white py-2 px-4 rounded-md uppercase font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                {/* Social Login */}
                <div className="border-b border-gray-200 mt-4 pb-4 text-center">
                  <p className="text-sm text-gray-500">Or login with</p>
                  <div className="flex justify-center items-center mt-4 mb-3">
                    <GoogleOAuthProvider clientId="630548216793-u72hegqjlqli4petjg5lsgkrp8fn0foc.apps.googleusercontent.com">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="outline"
                        text="signin_with"
                        shape="rectangular"
                        logo_alignment="center"
                        width="280"
                      />
                    </GoogleOAuthProvider>
                  </div>
                </div>
                <div className="flex justify-between items-center py-4">
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">Forgot password?</Link>
                  <span className="text-sm">
                    Don't have an account? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 text-sm">sign up</Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Component */}
      <div className="fixed top-5 right-5 z-50">
        {alertInfo.show && (
          <Alert
            type={alertInfo.type}
            message={alertInfo.message}
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          />
        )}
      </div>
    </div>
  );
}

export default Login;