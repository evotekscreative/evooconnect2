import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo1.png'; 
import googleIcon from '../../assets/img/google-icon.jpg';
import Alert from "../../components/Auth/alert";
import '../../assets/css/style.css';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    setAlertInfo(prev => ({...prev, show: false}));
    
    setTimeout(() => {
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Login successful!'
      });
    }, 300);
  };
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header with Logo */}
              <div className="mb-4 text-center">
                <img src={logo} alt="EVOConnect Logo" className="mx-auto h-16 object-contain" />
                <h5 className="font-bold mt-3 text-xl">Selamat datang</h5>
                <p className="text-gray-500">
                  Don't miss your next opportunity. Sign in to stay updated on your professional world.
                </p>
              </div>
              
              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email/Phone Field */}
                <div className="mb-4">
                  <label className="block mb-1">Email or Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <input 
                      type="email" 
                      className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </div>
                
                {/* Password Field */}
                <div className="mb-4">
                  <label className="block mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <input 
                      type="password" 
                      className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                </div>
                
                {/* Remember Password Checkbox */}
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
                  className="w-full btn-primary text-white py-2 px-4 rounded-md uppercase font-medium"                  >
                  Sign in
                </button>

                {/* Social Login Options */}
                <div className="border-b border-gray-200 mt-4 pb-4 text-center">
                  <p className="text-sm text-gray-500">Or login with</p>
                  <div className="flex justify-center items-center mt-4">
                    <a href="#" className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                      <img src={googleIcon} alt="Google Logo" className="w-5 h-5 mr-2" />
                      <span>Login with Google</span>
                    </a>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="flex justify-between items-center py-4">
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">Forgot password?</Link>
                  <span>
                    Don't have an account? <Link to="/Register" className="font-bold text-blue-600 hover:text-blue-800">sign up</Link>
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