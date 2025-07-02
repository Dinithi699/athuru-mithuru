import React, { useState } from 'react';

const SignupForm = ({ onShowSignin, onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.confirmPassword) {
      alert('කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('මුර පද නොගැලපේ');
      return;
    }
    
    onSignup(formData);
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("images/sign-up-test.png")'
      }}
    >
      {/* Form positioned over the translucent box in the image */}
      <div className="w-full max-w-md">
        {/* The form content goes inside the existing translucent box from the image */}
        <form onSubmit={handleSubmit} className="px-8 py-12 mt-8">
          <div className="space-y-2">
            <br></br><br></br><br></br>
            {/* Name input */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="නම"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
              />
            </div>
            
            {/* Email input */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="විද්‍යුත් තැපෑල"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
              />
            </div>
            
            {/* Mobile input */}
            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="දුරකථන අංකය"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
              />
            </div>
            
            {/* Password input */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="මුර පදය"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
              />
            </div>
            
            {/* Confirm Password input */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="මුර පදය තහවුරු කිරීම"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
              />
            </div>
            
            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#3d266c] hover:bg-[#3d2881] text-white text-xl font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3d266c]/50"
              >
                ලියාපදිංචිය සම්පූර්ණයි
              </button>
            </div>
            
            {/* Login link */}
            <div className="text-center pt-1">
              <p className="text-white/100 text-lg mb-4 font-semibold">
                දැනටත් ගිණුමක් තිබේද?
                <button
                  type="button"
                  onClick={onShowSignin}
                  className="text-yellow-300 hover:text-yellow-200 font-semibold underline transition-colors duration-300 ml-2"
                >
                  ප්‍රවේශ වන්න
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;