import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGameHistory, updateUserProgress } from '../firebase/firestore';
import { signOutUser } from '../firebase/auth';

const ProfilePage = ({ onBack, user }) => {
  const { setUser } = useAuth();
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameHistory = async () => {
      if (user?.uid) {
        const result = await getUserGameHistory(user.uid);
        if (result.success) {
          setGameHistory(result.data);
        }
      }
      setLoading(false);
    };

    fetchGameHistory();
  }, [user]);

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      setUser(null);
      onBack();
    }
  };

  const getGameTypeInSinhala = (gameType) => {
    const gameTypes = {
      'math': 'ගණිතය',
      'sinhala': 'සිංහල',
      'english': 'ඉංග්‍රීසි',
      'science': 'විද්‍යාව'
    };
    return gameTypes[gameType] || gameType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-700 to-purple-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl w-full">
        <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">👤</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">පරිශීලක විස්තර</h1>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/30 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-4xl">👨‍🎓</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{user?.name || 'පරිශීලකයා'}</h2>
            <p className="text-base sm:text-lg opacity-80">{user?.email || 'user@example.com'}</p>
            {user?.mobile && (
              <p className="text-sm sm:text-base opacity-70">{user.mobile}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm opacity-80">මට්ටම</div>
              <div className="text-lg sm:text-xl font-bold">{user?.level || 'ආරම්භක'}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm opacity-80">ලකුණු</div>
              <div className="text-lg sm:text-xl font-bold">{user?.points || 0}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm opacity-80">සම්පූර්ණ කළ ක්‍රීඩා</div>
              <div className="text-lg sm:text-xl font-bold">{user?.completedGames || 0}</div>
            </div>
          </div>

          {/* Achievements Section */}
          {user?.achievements && user.achievements.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">ජයග්‍රහණ</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {user.achievements.map((achievement, index) => (
                  <span 
                    key={index}
                    className="bg-yellow-500/20 text-yellow-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                  >
                    🏆 {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Game History */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">මෑත ක්‍රීඩා ඉතිහාසය</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner mx-auto"></div>
                <p className="mt-2 text-sm sm:text-base">පූරණය වෙමින්...</p>
              </div>
            ) : gameHistory.length > 0 ? (
              <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-2">
                {gameHistory.slice(0, 5).map((game, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-2 sm:p-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm sm:text-base">{getGameTypeInSinhala(game.gameType)}</span>
                      <span className="text-yellow-300 text-sm sm:text-base">{game.score} ලකුණු</span>
                    </div>
                    <div className="text-xs sm:text-sm opacity-70">
                      {new Date(game.timestamp).toLocaleDateString('si-LK')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-sm sm:text-base">තවම ක්‍රීඩා කර නැත</p>
            )}
          </div>
          
          <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
            <button
              onClick={onBack}
              className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 text-sm sm:text-base"
            >
              ← ආපසු යන්න
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base"
            >
              ඉවත්වන්න
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;