import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logoB.png';
import googleIcon from '../../assets/img/google-icon.jpg';
import Alert from '../../components/Auth/Alert';
import '../../assets/css/style.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
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
    setAlertInfo(prev => ({ ...prev, show: false }));

    // Validasi simple
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      Cookies.set('token', response.data.data.token, { expires: 7 })

      setAlertInfo({
        show: true,
        type: 'success',
        message: response.data.message || 'Registration successful!',
      });

      setFormData({ name: '', username: '', email: '', password: '' });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: 'error',
        message: error.response?.data?.data || 'Registration failed!',
      });
    }
  };

  return (
    <div className="bg-white min-h-screen w-full mt-8 mb-8">
      <div className="container mx-auto">
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-full max-w-md px-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
              {/* Header */}
              <div className="mb-3 text-center">
                <img src={logo} alt="EVOConnect Logo" className="mx-auto h-[80px] object-contain" />
                <h5 className="font-bold mt-2 text-xl">Join EVOConnect</h5>
                <p className="text-gray-500 text-sm">Make the most of your professional life</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <InputField
                  label="Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                />

                {/* Username */}
                <InputField
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Create username"
                />

                {/* Email */} 
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter your email address"
                />

                {/* Password */}
                <InputField
                  label="Password (6 or more characters)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Create a password"
                />

                {/* Terms */}
                <div className="mb-4 text-xs text-gray-500 text-center">
                  You agree to the EVOConnect{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800">User Agreement</Link>, and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>.
                </div>

                {/* Submit */}
                <button type="submit" className="w-full btn-primary text-white py-2 px-4 rounded-md uppercase font-medium text-sm">
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

                {/* Footer */}
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

      {/* Alert */}
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

function InputField({ label, name, type, value, onChange, error, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-left mb-1 text-gray-600 text-sm">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pl-3 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}

export default Register;
