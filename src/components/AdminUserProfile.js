import React, { useState, useEffect } from 'react';
import { getUserGameResults } from '../firebase/firestore';

const AdminUserProfile = ({ user, onBack, admin }) => {
  const [gameResults, setGameResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchGameResults = async () => {
      if (user?.uid) {
        const result = await getUserGameResults(user.uid);
        if (result.success) {
          setGameResults(result.data);
        }
      }
      setLoading(false);
    };

    fetchGameResults();
  }, [user]);

  const calculateRiskLevel = () => {
    if (gameResults.length === 0) return { level: 'low', color: 'green', text: 'අඩු අවදානම' };

    // Calculate risk based on consolidated game results
    let riskScore = 0;
    let dangerCount = 0;
    let lessDangerCount = 0;
    
    // Analyze each game's overall risk level
    gameResults.forEach(game => {
      const overallRisk = game.overallStats?.overallRiskLevel || 'Not Danger';
      if (overallRisk === 'Danger') {
        dangerCount++;
        riskScore += 3;
      } else if (overallRisk === 'Less Danger') {
        lessDangerCount++;
        riskScore += 2;
      }
    });
    
    // Factor in average accuracy across all games
    const avgAccuracy = gameResults.reduce((sum, game) => {
      return sum + (game.overallStats?.overallAccuracy || 0);
    }, 0) / Math.max(gameResults.length, 1);
    
    if (avgAccuracy < 50) riskScore += 2;
    else if (avgAccuracy < 70) riskScore += 1;
    
    // Determine final risk level
    if (dangerCount >= 2 || riskScore >= 6) {
      return { level: 'high', color: 'red', text: 'ඉහළ අවදානම' };
    }
    if (dangerCount >= 1 || lessDangerCount >= 2 || riskScore >= 3) {
      return { level: 'medium', color: 'orange', text: 'මධ්‍යම අවදානම' };
    }
    return { level: 'low', color: 'green', text: 'අඩු අවදානම' };
  };

  const getGameTypeInSinhala = (gameType) => {
    const gameTypes = {
      'Dysgraphia': 'අකුරු ලිවීම',
      'Dyspraxia': 'තරු රටා',
      'Dyscalculia': 'සංඛ්‍යා සංසන්දනය',
      'Dyslexia': 'දෘශ්‍ය වෙනස්කම්'
    };
    return gameTypes[gameType] || gameType;
  };

  const getRiskColorFromLevel = (riskLevel) => {
    switch (riskLevel) {
      case 'Danger': return 'text-red-400';
      case 'Less Danger': return 'text-orange-400';
      case 'Not Danger': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskTextFromLevel = (riskLevel) => {
    switch (riskLevel) {
      case 'Danger': return 'ඉහළ අවදානම';
      case 'Less Danger': return 'අඩු අවදානම';
      case 'Not Danger': return 'අවදානමක් නැත';
      default: return 'තක්සේරු නොකළ';
    }
  };

  const getOverallGameStats = () => {
    const totalGames = gameResults.length;
    const totalScore = gameResults.reduce((sum, game) => sum + (game.overallStats?.totalScore || 0), 0);
    const totalQuestions = gameResults.reduce((sum, game) => sum + (game.overallStats?.totalQuestions || 0), 0);
    const avgAccuracy = gameResults.reduce((sum, game) => sum + (game.overallStats?.overallAccuracy || 0), 0) / Math.max(totalGames, 1);
    
    return {
      totalGames,
      totalScore,
      totalQuestions,
      avgAccuracy: avgAccuracy.toFixed(1)
    };
  };

  const calculateRiskLevelOld = () => {
    if (gameHistory.length === 0) return { level: 'unknown', color: 'gray', text: 'තක්සේරු නොකළ' };

    let riskScore = 0;
    
    // Factor 1: Recent performance (last 5 games)
    const recentGames = gameHistory.slice(-5);
    const recentPerformances = recentGames.map(game => {
      const accuracy = game.accuracy || game.score || 50;
      return accuracy / 100;
    });
    
    const averagePerformance = gamePerformances.reduce((sum, perf) => sum + perf, 0) / gamePerformances.length;
    if (averagePerformance < 0.3) riskScore += 4;
    else if (averagePerformance < 0.6) riskScore += 2;
    else if (averagePerformance < 0.8) riskScore += 1;
    
    // Factor 3: Consistency across different game types
    const gameTypes = [...new Set(gameHistory.map(game => game.gameType))];
    if (gameTypes.length >= 2) {
      const typePerformances = gameTypes.map(type => {
        const typeGames = gameHistory.filter(game => game.gameType === type);
        const typeAvg = typeGames.reduce((sum, game) => {
          return sum + (game.accuracy || game.score || 50);
        }, 0) / typeGames.length;
        return typeAvg;
      });
      
      const variance = typePerformances.reduce((sum, perf) => {
        const avg = typePerformances.reduce((s, p) => s + p, 0) / typePerformances.length;
        return sum + Math.pow(perf - avg, 2);
      }, 0) / typePerformances.length;
      
      if (variance > 1000) riskScore += 2;
      else if (variance > 500) riskScore += 1;
    }
    
    // Factor 4: Recent performance trend
    if (gameHistory.length >= 3) {
      const recentGames = gameHistory.slice(-3);
      const olderGames = gameHistory.slice(0, -3);
      
      if (olderGames.length > 0) {
        const recentAvg = recentGames.reduce((sum, game) => sum + (game.accuracy || game.score || 50), 0) / recentGames.length;
        const olderAvg = olderGames.reduce((sum, game) => sum + (game.accuracy || game.score || 50), 0) / olderGames.length;
        
        if (recentAvg < olderAvg - 10) riskScore += 2;
        else if (recentAvg < olderAvg) riskScore += 1;
      }
    }

    // Determine final risk level
    if (riskScore >= 6) {
      return { level: 'high', color: 'red', text: 'ඉහළ අවදානම' };
    }
    if (riskScore >= 3) {
      return { level: 'medium', color: 'orange', text: 'මධ්‍යම අවදානම' };
    }
    return { level: 'low', color: 'green', text: 'අඩු අවදානම' };
  };

  const getRecommendations = (riskLevel) => {
    switch (riskLevel.level) {
      case 'high':
        return [
          'වෘත්තීය මනෝවිද්‍යාඥයෙකු හමුවන්න',
          'විශේෂ අධ්‍යාපන සහාය ලබාගන්න',
          'දෛනික අභ්‍යාස කාර්යක්‍රමයක් ආරම්භ කරන්න',
          'දෙමාපියන් සමඟ සාකච්ඡා කරන්න',
          'ප්‍රගතිය සතිපතා නිරීක්ෂණය කරන්න'
        ];
      case 'medium':
        return [
          'අමතර අභ්‍යාස කාලය ලබාදෙන්න',
          'ප්‍රගතිය මාසිකව නිරීක්ෂණය කරන්න',
          'දෙමාපියන්ට දැනුම් දෙන්න',
          'සමූහ ක්‍රියාකාරකම්වලට දිරිමත් කරන්න',
          'ධනාත්මක ප්‍රතිපෝෂණ ලබාදෙන්න'
        ];
      case 'low':
        return [
          'වර්තමාන ප්‍රගතිය දිගටම කරගෙන යන්න',
          'අභියෝගාත්මක ක්‍රියාකාරකම් ලබාදෙන්න',
          'අනෙක් ළමුන්ට උදව් කිරීමට දිරිමත් කරන්න',
          'නිර්මාණශීලී ක්‍රියාකාරකම්වලට දිරිමත් කරන්න',
          'ප්‍රගතිය මාසිකව නිරීක්ෂණය කරන්න'
        ];
      default:
        return [
          'ක්‍රීඩා කිරීමට දිරිමත් කරන්න',
          'ප්‍රගතිය නිරීක්ෂණය කරන්න',
          'වැඩි දත්ත එකතු කිරීම සඳහා නිතිපතා ක්‍රීඩා කරන්න'
        ];
    }
  };

  const riskLevel = calculateRiskLevel();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold transition-colors duration-300"
            >
              ← ආපසු
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {user?.name || 'නම නැත'}
              </h1>
              <p className="text-white/80">{user?.email}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-white font-bold bg-${riskLevel.color}-500`}>
            {riskLevel.text}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="p-4 sm:p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-xl font-bold transition-colors duration-300 ${
                activeTab === 'overview' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              සාමාන්‍ය විස්තර
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`flex-1 px-4 py-2 rounded-xl font-bold transition-colors duration-300 ${
                activeTab === 'games' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              ක්‍රීඩා ඉතිහාසය
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-4 py-2 rounded-xl font-bold transition-colors duration-300 ${
                activeTab === 'recommendations' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              නිර්දේශ
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">පරිශීලක විස්තර</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">නම</div>
                  <div className="text-white font-bold">{user?.name || 'නම නැත'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">ඊමේල්</div>
                  <div className="text-white font-bold text-sm">{user?.email || 'ඊමේල් නැත'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">දුරකථන</div>
                  <div className="text-white font-bold">{user?.mobile || 'නැත'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">ලියාපදිංචි දිනය</div>
                  <div className="text-white font-bold text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('si-LK') : 'නොදන්නා'}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">කාර්ය සාධන සංඛ්‍යාලේඛන</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user?.points || 0}</div>
                  <div className="text-white/60 text-sm">මුළු ලකුණු</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user?.completedGames || 0}</div>
                  <div className="text-white/60 text-sm">සම්පූර්ණ ක්‍රීඩා</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user?.level || 'ආරම්භක'}</div>
                  <div className="text-white/60 text-sm">මට්ටම</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{gameResults.length}</div>
                  <div className="text-white/60 text-sm">ක්‍රීඩා සැසි</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {user?.achievements && user.achievements.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">ජයග්‍රහණ</h2>
                <div className="flex flex-wrap gap-2">
                  {user.achievements.map((achievement, index) => (
                    <span 
                      key={index}
                      className="bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full text-sm"
                    >
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'games' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">ක්‍රීඩා ප්‍රතිඵල</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-white">ක්‍රීඩා ප්‍රතිඵල පූරණය වෙමින්...</p>
              </div>
            ) : gameResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎮</div>
                <p className="text-white">තවම ක්‍රීඩා කර නැත</p>
              </div>
            ) : (
              <div className="space-y-6">
                {gameResults.map((game, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-white">{getGameTypeInSinhala(game.gameType)}</h3>
                        <p className="text-white/60 text-sm">
                          අවසන් වරට යාවත්කාලීන: {new Date(game.lastUpdated).toLocaleDateString('si-LK')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getRiskColorFromLevel(game.overallStats?.overallRiskLevel)}`}>
                          {getRiskTextFromLevel(game.overallStats?.overallRiskLevel)}
                        </div>
                        <div className="text-white/60 text-sm">
                          {game.overallStats?.overallAccuracy?.toFixed(1)}% නිරවද්‍යතාව
                        </div>
                      </div>
                    </div>
                    
                    {/* Overall Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-lg font-bold text-white">{game.overallStats?.totalScore || 0}</div>
                        <div className="text-xs text-white/60">මුළු ලකුණු</div>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-lg font-bold text-white">{game.overallStats?.levelsCompleted || 0}</div>
                        <div className="text-xs text-white/60">සම්පූර්ණ මට්ටම්</div>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-lg font-bold text-white">{game.overallStats?.totalQuestions || 0}</div>
                        <div className="text-xs text-white/60">මුළු ප්‍රශ්න</div>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-lg font-bold text-white">{game.overallStats?.highestLevel || 0}</div>
                        <div className="text-xs text-white/60">ඉහළම මට්ටම</div>
                      </div>
                    </div>

                    {/* Level Details */}
                    {game.levels && (
                      <div className="mt-4">
                        <h4 className="text-sm font-bold text-white mb-2">මට්ටම් විස්තර:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {Object.entries(game.levels).map(([levelKey, levelData]) => (
                            <div key={levelKey} className="bg-white/5 rounded p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium">
                                  {levelKey.replace('level', 'මට්ටම ')}
                                </span>
                                <span className="text-white/80">
                                  {levelData.score}/{levelData.totalQuestions}
                                </span>
                              </div>
                              <div className="text-xs text-white/60 mt-1">
                                {levelData.accuracy?.toFixed(1)}% නිරවද්‍යතාව
                              </div>
                              <div className={`text-xs mt-1 ${getRiskColorFromLevel(levelData.riskLevel)}`}>
                                {getRiskTextFromLevel(levelData.riskLevel)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">ගුරු නිර්දේශ</h2>
            <div className={`mb-6 p-4 rounded-lg bg-${riskLevel.color}-500/20 border border-${riskLevel.color}-500/50`}>
              <h3 className="font-bold text-white mb-2">අවදානම් මට්ටම: {riskLevel.text}</h3>
              <p className="text-white/80 text-sm">
                {riskLevel.level === 'high' && 'මෙම ළමයාට විශේෂ අවධානය සහ සහාය අවශ්‍යයි.'}
                {riskLevel.level === 'medium' && 'මෙම ළමයාට අමතර සහාය ප්‍රයෝජනවත් වේ.'}
                {riskLevel.level === 'low' && 'මෙම ළමයා හොඳ ප්‍රගතියක් පෙන්වයි.'}
                {riskLevel.level === 'unknown' && 'වැඩි ක්‍රීඩා දත්ත අවශ්‍යයි.'}
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-white">නිර්දේශිත ක්‍රියාමාර්ග:</h4>
              <ul className="space-y-2">
                {getRecommendations(riskLevel).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 text-white/80">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Parents Button */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300">
                📞 දෙමාපියන් සම්බන්ධ කරගන්න
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserProfile;