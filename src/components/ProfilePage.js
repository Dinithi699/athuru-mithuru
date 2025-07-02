import React from 'react';

const ProfilePage = ({ onBack, user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-700 to-purple-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-8xl mb-8">👤</div>
        <h1 className="text-5xl font-bold mb-8">පරිශීලක පැතිකඩ</h1>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-24 h-24 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👨‍🎓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{user?.name || 'පරිශීලකයා'}</h2>
            <p className="text-lg opacity-80">{user?.email || 'user@example.com'}</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-80">මට්ටම</div>
              <div className="text-xl font-bold">ආරම්භක</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-80">ලකුණු</div>
              <div className="text-xl font-bold">100</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-80">සම්පූර්ණ කළ ක්‍රීඩා</div>
              <div className="text-xl font-bold">0</div>
            </div>
          </div>
          
          <button
            onClick={onBack}
            className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300"
          >
            ← ආපසු යන්න
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;