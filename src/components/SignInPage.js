import React, { useState } from 'react';

const SignInPage = ({ onShowSignup, onSignin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      onSignin(formData);
    } else {
      alert('කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න');
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("images/Login bg.png")'
      }}
    >
      {/* Form positioned over the translucent box in the image */}
      <div className="w-full max-w-md">
        {/* The form content goes inside the existing translucent box from the image */}
        <form onSubmit={handleSubmit} className="px-8 py-12 mt-8">
          <div className="space-y-2">
            <br></br><br></br><br></br>
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
            
            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#3d266c] hover:bg-[#3d2881] text-white text-xl font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3d266c]/50"
              >
                පිවිසෙන්න
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-1 mb-4 text-s font-semibold">
              <p className="text-white">ගිණුමක් නැද්ද?
                <a></a>
                {/* Sign up button */}
                <button
                  type="button"
                  onClick={onShowSignup}
                  className="text-[#20b2aa] hover:underline font-semibold transition-colors duration-300 ml-2"
                >
                  ලියාපදිංචි වන්න
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;