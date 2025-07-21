import React, { useState } from 'react';
import { signUpUser } from '../firebase/auth';

const SignupForm = ({ onShowSignin, onSignup, onShowAdminSignup, setCurrentScreen }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.confirmPassword) {
      setError('කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('මුර පද නොගැලපේ');
      return false;
    }

    if (formData.password.length < 6) {
      setError('මුර පදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signUpUser(formData.email, formData.password, formData.name, formData.mobile);
      
      if (result.success) {
        console.log('Signup successful');
        onSignup(result.user);
      } else {
        // Handle specific Firebase errors
        let errorMessage = 'ලියාපදිංචිය අසාර්ථකයි';
        
        if (result.error.includes('email-already-in-use')) {
          errorMessage = 'මෙම විද්‍යුත් තැපෑල දැනටමත් භාවිතයේ ඇත';
        } else if (result.error.includes('weak-password')) {
          errorMessage = 'මුර පදය ඉතා දුර්වලයි';
        } else if (result.error.includes('invalid-email')) {
          errorMessage = 'වලංගු නොවන විද්‍යුත් තැපෑල';
        } else if (result.error.includes('network-request-failed')) {
          errorMessage = 'ජාල සම්බන්ධතා ගැටලුවක්. කරුණාකර නැවත උත්සාහ කරන්න';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('අනපේක්ෂිත දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න');
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("images/Login-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative flex items-center justify-center min-h-screen p-4" style={{ zIndex: 5 }}>
        <div className="w-full max-w-md">
         
          {/* Glassmorphism Container */}
          <div className="h-[560px] w-[500px] backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden flex flex-col justify-center">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />
             <div className="space-y-1 sm:space-y-1">
             <div className="text-center mb-1 z-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm ">
               ලියාපදිංචි වෙන්න
              </h1>
            </div>
      <div className="w-full max-w-sm sm:max-w-md">
        <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-4 sm:py-4">
          <div className="space-y-2.5 sm:space-y-3">
            {/* Responsive spacing */}
            <div className="h-16 sm:h-16 md:h-1 lg:h-2"></div>
            
            {error && (
              <div className="bg-red-500/90 text-white p-3 rounded-lg text-center mb-3 text-sm sm:text-base">
                {error}
                
              </div>
            )}
            
            <div>
              <input
                type="text"
                name="name"
                placeholder="නම"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="විද්‍යුත් තැපෑල"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="දුරකථන අංකය"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                autoComplete="tel"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="මුර පදය (අවම අක්ෂර 6ක්)"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="මුර පදය තහවුරු කිරීම"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            
            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3d266c] hover:bg-[#3d2881] text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3d266c]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              > 
                {loading ? 'ලියාපදිංචි වෙමින්...' : 'ලියාපදිංචිය සම්පූර්ණයි'}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-white text-sm sm:text-base font-semibold mb-2">
                දැනටත් ගිණුමක් තිබේද?
              </p>
              <button
                type="button"
                onClick={onShowSignin}
                disabled={loading}
                className="text-yellow-300 hover:text-yellow-200 font-semibold underline transition-colors duration-300 disabled:opacity-50 text-sm sm:text-base"
              >
                ප්‍රවේශ වන්න
              </button>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white text-sm font-semibold mb-2">
                  ගුරුවරයෙක්ද?
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('admin-signup')}
                  disabled={loading}
                  className="text-blue-300 hover:text-blue-200 font-semibold underline transition-colors duration-300 disabled:opacity-50 text-sm"
                >
                  👨‍🏫 ගුරු ලියාපදිංචිය
                </button>
              </div>
            </div>
            </div>
        </form>
      </div>
    </div>
    </div>
    </div>
    </div>
       </div>    
  );
};

export default SignupForm;