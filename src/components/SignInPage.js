import React, { useState } from 'react';
import { signInUser } from '../firebase/auth';

const SignInPage = ({ onShowSignup, onSignin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Starting sign-in process for:', formData.email);
      const result = await signInUser(formData.email, formData.password);
      
      console.log('Sign-in result:', result);
      
      if (result.success) {
        console.log('Sign-in successful, calling onSignin with user:', result.user);
        alert('ඇතුල්වීම සාර්ථකයි!');
        onSignin(result.user);
      } else {
        // Handle specific Firebase errors
        let errorMessage = 'ඇතුල්වීම අසාර්ථකයි';
        
        console.error('Sign-in failed:', result.error);
        
        if (result.error.includes('client is offline') || result.error.includes('network-request-failed')) {
          errorMessage = 'ජාල සම්බන්ධතාවයේ ගැටලුවක්. කරුණාකර ඔබේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න.';
        } else if (result.error.includes('user-not-found')) {
          errorMessage = 'පරිශීලකයා සොයාගත නොහැක. කරුණාකර ලියාපදිංචි වන්න.';
        } else if (result.error.includes('wrong-password') || result.error.includes('invalid-credential')) {
          errorMessage = 'වැරදි මුර පදයක්';
        } else if (result.error.includes('invalid-email')) {
          errorMessage = 'වලංගු නොවන විද්‍යුත් තැපෑල';
        } else if (result.error.includes('too-many-requests')) {
          errorMessage = 'ඉතා වැඩි උත්සාහයන්. කරුණාකර පසුව උත්සාහ කරන්න';
        } else if (result.error.includes('user-disabled')) {
          errorMessage = 'මෙම ගිණුම අක්‍රිය කර ඇත';
        }
        
        alert(errorMessage + '\n\nදෝෂය: ' + result.error);
      }
    } catch (error) {
      console.error('Unexpected error during sign-in:', error);
      alert('අනපේක්ෂිත දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න\n\nදෝෂය: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("images/Login bg.png")'
      }}
    >
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="px-8 py-12 mt-8">
          <div className="space-y-2">
            <br></br><br></br><br></br>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="විද්‍යුත් තැපෑල"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="මුර පදය"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 placeholder-gray-600 text-gray-800 text-center italic"
                required
                disabled={loading}
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3d266c] hover:bg-[#3d2881] text-white text-xl font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3d266c]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'පිවිසෙමින්...' : 'පිවිසෙන්න'}
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-1 mb-4 text-s font-semibold">
              <p className="text-white">ගිණුමක් නැද්ද?
                <button
                  type="button"
                  onClick={onShowSignup}
                  disabled={loading}
                  className="text-[#20b2aa] hover:underline font-semibold transition-colors duration-300 ml-2 disabled:opacity-50"
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