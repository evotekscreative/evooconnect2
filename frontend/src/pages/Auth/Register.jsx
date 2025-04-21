  import { useState } from 'react';
  import { Link } from 'react-router-dom';
  import logo from '../../assets/img/logoB.png';
  import googleIcon from '../../assets/img/google-icon.jpg';
  import Alert from '../../components/Auth/Alert';
  import '../../assets/css/style.css';
  
  function Register() {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    });
    
    const [errors, setErrors] = useState({
      name: '',
      email: '',
      password: '',
    });
  
    const [alertInfo, setAlertInfo] = useState({
      show: false,
      type: 'success',
      message: '',
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      
      // First hide any existing alert
      setAlertInfo(prev => ({...prev, show: false}));
      
      // Then after a short delay, show the new alert
      setTimeout(() => {
        setAlertInfo({
          show: true,
          type: 'success',
          message: 'Registration successful!'
        });
      }, 300);
    };
  
    return (
      <div className="bg-white min-h-screen w-full">
        <div className="container mx-auto">
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md px-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                {/* Header with Logo */}
                <div className="mb-4 text-center">
                  <img src={logo} alt="EVOConnect Logo" className="mx-auto h-[80px] object-contain" />
                  <h5 className="font-bold mt-2 text-xl">Join EVOConnect</h5>
                  <p className="text-gray-500 text-sm">
                    Make the most of your professional life
                  </p>
                </div>
                
                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  {/* Name Field */}
                  <div className="mb-4">
                    <label className="block text-left mb-1 text-gray-600 text-sm">Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                  </div>
                  
                  {/* Email Field */}
                  <div className="mb-4">
                    <label className="block text-left mb-1 text-sm text-gray-600">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                          <circle cx="12" cy="12" r="4"></circle>
                          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                        </svg>
                      </div>
                      <input 
                        type="email" 
                        className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                  </div>
                  
                  {/* Password Field */}
                  <div className="mb-8">
                    <label className="block text-left mb-1 text-sm text-gray-700">Password (6 or more characters)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <input 
                        type="password" 
                        className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                      />
                    </div>
                    {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                  </div>
                  
                  {/* Terms and Conditions */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 text-center">
                      You agree to the EVOConnect{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-800">User Agreement</Link>, and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>.
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="w-full btn-primary text-white py-2 px-4 rounded-md uppercase font-medium text-sm">
                    Agree & Join
                  </button>
  
                  {/* Social Login Options */}
                  <div className="mt-4 pb-4 text-center border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-3">Or login with</p>
                    <div className="flex justify-center items-center mb-2">
                      <a href="#" className="shadow-lg flex items-center px-3 py-2 border shadow-sm rounded-md bg-white hover:bg-gray-50">
                        <img src={googleIcon} alt="Google" className="w-5 h-5 mr-2" />
                        <span className="text-sm">Login with Google</span>
                      </a>
                    </div>
                  </div>
  
                  {/* Footer Links */}
                  <div className="flex justify-between items-center py-4">
                    <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                      Forgot password?
                    </Link>
                    <span className="text-sm">
                      Already on EVOConnect?{' '}
                      <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">
                        sign in
                      </Link>
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
  
  export default Register;