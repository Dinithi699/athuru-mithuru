import React, { useState } from 'react';
import { signInUser } from '../firebase/auth';

const SignInPage = ({ onShowSignup, onSignin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signInUser(formData.email, formData.password);
      
      if (result.success) {
        console.log('Sign-in successful');
        onSignin(result.user);
      } else {
        // Handle specific Firebase errors
        let errorMessage = 'ඇතුල්වීම අසාර්ථකයි';
        
        if (result.error.includes('network-request-failed')) {
          errorMessage = 'ජාල සම්බන්ධතාවයේ ගැටලුවක්. කරුණාකර නැවත උත්සාහ කරන්න.';
        } else if (result.error.includes('user-not-found')) {
          errorMessage = 'පරිශීලකයා සොයාගත නොහැක. කරුණාකර ලියාපදිංචි වන්න.';
        } else if (result.error.includes('wrong-password') || result.error.includes('invalid-credential')) {
          errorMessage = 'වැරදි මුර පදයක්';
        } else if (result.error.includes('invalid-email')) {
          errorMessage = 'වලංගු නොවන විද්‍යුත් තැපෑල';
        } else if (result.error.includes('too-many-requests')) {
          errorMessage = 'ඉතා වැඩි උත්සාහයන්. කරුණාකර පසුව උත්සාහ කරන්න';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Unexpected error during sign-in:', error);
      setError('අනපේක්ෂිත දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න');
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("images/Login bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md">
        <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-8 sm:py-12">
          <div className="space-y-3 sm:space-y-4">
            {/* Responsive spacing */}
            <div className="h-16 sm:h-24 md:h-32 lg:h-40"></div>
            
            {error && (
              <div className="bg-red-500/90 text-white p-3 rounded-lg text-center mb-4 text-sm sm:text-base">
                {error}
              </div>
            )}
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="විද්‍යුත් තැපෑල"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="මුර පදය"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic text-sm sm:text-base"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3d266c] hover:bg-[#3d2881] text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3d266c]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'පිවිසෙමින්...' : 'පිවිසෙන්න'}
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-1 pt-2 text-center">
              <p className="text-white text-sm sm:text-base font-semibold">
                ගිණුමක් නැද්ද?
              </p>
              <button
                type="button"
                onClick={onShowSignup}
                disabled={loading}
                className="text-[#20b2aa] hover:underline font-semibold transition-colors duration-300 disabled:opacity-50 text-sm sm:text-base"
              >
                ලියාපදිංචි වන්න
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;