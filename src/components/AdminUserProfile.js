import React, { useState, useEffect } from "react";
import { getUserGameHistory } from "../firebase/firestore";

const AdminUserProfile = ({ user, onBack, admin }) => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGameDetails, setSelectedGameDetails] = useState(null);

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
  console.log("Game History user:", user);
  const calculateRiskLevel = () => {
    if (gameHistory.length === 0)
      return { level: "low", color: "green", text: "අඩු අවදානම" };

    // Use the same comprehensive risk calculation as in AdminHomePage
    let riskScore = 0;
    let totalGames = gameHistory.length;

    // Factor 1: Game completion rate
    const completedGames = gameHistory.filter(
      (game) => game.score !== undefined && game.score > 0
    ).length;
    const completionRate = completedGames / totalGames;
    if (completionRate < 0.5) riskScore += 3;
    else if (completionRate < 0.7) riskScore += 2;
    else if (completionRate < 0.9) riskScore += 1;

    // Factor 2: Average performance across games
    const gamePerformances = gameHistory.map((game) => {
      if (game.gameType === "Dysgraphia") {
        return game.capturedImage ? 1 : 0;
      } else if (game.gameType === "Dyspraxia") {
        const accuracy = game.accuracy || 0;
        const reactionTime = game.averageReactionTime || 5000;
        if (accuracy < 60 || reactionTime > 3000) return 0;
        else if (accuracy < 80 || reactionTime > 2000) return 0.5;
        else return 1;
      } else if (game.gameType === "Dyscalculia") {
        const accuracy = game.accuracy || 0;
        if (accuracy < 50) return 0;
        else if (accuracy < 70) return 0.5;
        else return 1;
      } else if (game.gameType === "Dyslexia") {
        const accuracy = game.accuracy || 0;
        if (accuracy < 60) return 0;
        else if (accuracy < 80) return 0.5;
        else return 1;
      }
      return 0.5;
    });

    const averagePerformance =
      gamePerformances.reduce((sum, perf) => sum + perf, 0) /
      gamePerformances.length;
    if (averagePerformance < 0.3) riskScore += 4;
    else if (averagePerformance < 0.6) riskScore += 2;
    else if (averagePerformance < 0.8) riskScore += 1;

    // Factor 3: Consistency across different game types
    // const gameTypes = [...new Set(gameHistory.map(game => game.gameType))];
    // if (gameTypes.length >= 2) {
    //   const typePerformances = gameTypes.map(type => {
    //     const typeGames = gameHistory.filter(game => game.gameType === type);
    //     const typeAvg = typeGames.reduce((sum, game) => {
    //       return sum + (game.accuracy || game.score || 50);
    //     }, 0) / typeGames.length;
    //     return typeAvg;
    //   });

    //   const variance = typePerformances.reduce((sum, perf) => {
    //     const avg = typePerformances.reduce((s, p) => s + p, 0) / typePerformances.length;
    //     return sum + Math.pow(perf - avg, 2);
    //   }, 0) / typePerformances.length;

    //   if (variance > 1000) riskScore += 2;
    //   else if (variance > 500) riskScore += 1;
    // }

    // // Factor 4: Recent performance trend
    // if (gameHistory.length >= 3) {
    //   const recentGames = gameHistory.slice(-3);
    //   const olderGames = gameHistory.slice(0, -3);

    //   if (olderGames.length > 0) {
    //     const recentAvg = recentGames.reduce((sum, game) => sum + (game.accuracy || game.score || 50), 0) / recentGames.length;
    //     const olderAvg = olderGames.reduce((sum, game) => sum + (game.accuracy || game.score || 50), 0) / olderGames.length;

    //     if (recentAvg < olderAvg - 10) riskScore += 2;
    //     else if (recentAvg < olderAvg) riskScore += 1;
    //   }
    // }

    // Determine final risk level
    if (riskScore >= 6) {
      return { level: "high", color: "red", text: "ඉහළ අවදානම" };
    }
    if (riskScore >= 3) {
      return { level: "medium", color: "orange", text: "මධ්‍යම අවදානම" };
    }
    return { level: "low", color: "green", text: "අඩු අවදානම" };
  };

  const getGameTypeInSinhala = (gameType) => {
    const gameTypes = {
      Dysgraphia: "අකුරු ලිවීම",
      Dyspraxia: "තරු රටා",
      Dyscalculia: "සංඛ්‍යා සංසන්දනය",
      Dyslexia: "දෘශ්‍ය වෙනස්කම්",
    };
    return gameTypes[gameType] || gameType;
  };

  const getRecommendations = (riskLevel) => {
    switch (riskLevel.level) {
      case "high":
        return [
          "වෘත්තීය මනෝවිද්‍යාඥයෙකු හමුවන්න",
          "විශේෂ අධ්‍යාපන සහාය ලබාගන්න",
          "දෛනික අභ්‍යාස කාර්යක්‍රමයක් ආරම්භ කරන්න",
          "දෙමාපියන් සමඟ සාකච්ඡා කරන්න",
          "ප්‍රගතිය සතිපතා නිරීක්ෂණය කරන්න",
        ];
      case "medium":
        return [
          "අමතර අභ්‍යාස කාලය ලබාදෙන්න",
          "ප්‍රගතිය මාසිකව නිරීක්ෂණය කරන්න",
          "දෙමාපියන්ට දැනුම් දෙන්න",
          "සමූහ ක්‍රියාකාරකම්වලට දිරිමත් කරන්න",
          "ධනාත්මක ප්‍රතිපෝෂණ ලබාදෙන්න",
        ];
      case "low":
        return [
          "වර්තමාන ප්‍රගතිය දිගටම කරගෙන යන්න",
          "අභියෝගාත්මක ක්‍රියාකාරකම් ලබාදෙන්න",
          "අනෙක් ළමුන්ට උදව් කිරීමට දිරිමත් කරන්න",
          "නිර්මාණශීලී ක්‍රියාකාරකම්වලට දිරිමත් කරන්න",
          "ප්‍රගතිය මාසිකව නිරීක්ෂණය කරන්න",
        ];
      default:
        return [
          "ක්‍රීඩා කිරීමට දිරිමත් කරන්න",
          "ප්‍රගතිය නිරීක්ෂණය කරන්න",
          "වැඩි දත්ත එකතු කිරීම සඳහා නිතිපතා ක්‍රීඩා කරන්න",
        ];
    }
  };

  const riskLevel = calculateRiskLevel();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-white-700 to-blue-500">
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
                {user?.name || "නම නැත"}
              </h1>
              <p className="text-white/80">{user?.email}</p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-white font-bold bg-${riskLevel.color}-500`}
          >
            {riskLevel.text}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="p-4 sm:p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-2 rounded-xl font-bold transition-colors duration-300 ${
                activeTab === "overview"
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-white/20"
              }`}
            >
              සාමාන්‍ය විස්තර
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex-1 px-4 py-2 rounded-xl font-bold transition-colors duration-300 ${
                activeTab === "games"
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-white/20"
              }`}
            >
              ක්‍රීඩා ඉතිහාසය
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex-1 px-4 py-2 rounded-xl font-bold transition-colors duration-300 ${
                activeTab === "recommendations"
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-white/20"
              }`}
            >
              නිර්දේශ
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                පරිශීලක විස්තර
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">නම</div>
                  <div className="text-white font-bold">
                    {user?.name || "නම නැත"}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">ඊමේල්</div>
                  <div className="text-white font-bold text-sm">
                    {user?.email || "ඊමේල් නැත"}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">දුරකථන</div>
                  <div className="text-white font-bold">
                    {user?.mobile || "නැත"}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">ලියාපදිංචි දිනය</div>
                  <div className="text-white font-bold text-sm">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("si-LK")
                      : "නොදන්නා"}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                කාර්ය සාධන සංඛ්‍යාලේඛන
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {user?.points || 0}
                  </div>
                  <div className="text-white/60 text-sm">මුළු ලකුණු</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {user?.completedGames || 0}
                  </div>
                  <div className="text-white/60 text-sm">සම්පූර්ණ ක්‍රීඩා</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {user?.level || "ආරම්භක"}
                  </div>
                  <div className="text-white/60 text-sm">මට්ටම</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {gameHistory.length}
                  </div>
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

        {activeTab === "games" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              ක්‍රීඩා ඉතිහාසය
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-white">ක්‍රීඩා දත්ත පූරණය වෙමින්...</p>
              </div>
            ) : user.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎮</div>
                <p className="text-white">තවම ක්‍රීඩා කර නැත</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-2 font-bold">
                        ක්‍රීඩාව
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        මට්ටම්
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        මුළු ලකුණු
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        නිරවද්‍යතාව
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        අවදානම් මට්ටම
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        සාමාන්‍ය කාලය
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        අවසන් වූ දිනය
                      </th>
                      <th className="text-center py-3 px-2 font-bold">
                        විස්තර
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.gameScores && user.gameScores.length > 0 ? (
                      user.gameScores.map((gameScore, index) => {
                        const gameType = gameScore.gameType;
                        const gameStats = gameScore.overallStats || {};
                        const levels = gameScore.levels || {};
                        const levelsCompleted = gameStats.levelsCompleted || 0;
                        const totalScore = gameStats.totalScore || 0;
                        const overallAccuracy = gameStats.overallAccuracy || 0;
                        const overallRiskLevel =
                          gameStats.overallRiskLevel || "Unknown";
                        const overallAvgTime =
                          gameStats.overallAvgReactionTime ||
                          gameStats.overallAvgTime ||
                          0;

                        // Get the last completed date from levels
                        const lastCompletedDate =
                          levels && typeof levels === "object"
                            ? Object.values(levels)
                                .filter((level) => level && level.completedAt)
                                .sort(
                                  (a, b) =>
                                    new Date(b.completedAt) -
                                    new Date(a.completedAt)
                                )[0]?.completedAt || user.createdAt
                            : user.createdAt;

                        const getRiskColor = (risk) => {
                          switch (risk) {
                            case "Danger":
                              return "text-red-400";
                            case "Less Danger":
                              return "text-yellow-400";
                            case "Not Danger":
                              return "text-green-400";
                            default:
                              return "text-gray-400";
                          }
                        };

                        const getRiskTextSinhala = (risk) => {
                          switch (risk) {
                            case "Danger":
                              return "ඉහළ අවදානම";
                            case "Less Danger":
                              return "අඩු අවදානම";
                            case "Not Danger":
                              return "අවදානමක් නැත";
                            default:
                              return "නොදන්නා";
                          }
                        };

                        const getGameTypeInSinhala = (type) => {
                          switch (type) {
                            case "Dyslexia":
                              return "දෘශ්‍ය වෙනස්කම් ක්‍රීඩාව";
                            case "Dysgraphia":
                              return "අකුරු ලිවීමේ ක්‍රීඩාව";
                            case "Dyspraxia":
                              return "තරු රටා ක්‍රීඩාව";
                            case "Dyscalculia":
                              return "සංඛ්‍යා සංසන්දන ක්‍රීඩාව"
                            default:
                              return "නොදන්නා ක්‍රීඩාව";
                          }
                        };

                        return (
                          <tr
                            key={index}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-2">
                              <div className="font-semibold">
                                {getGameTypeInSinhala(gameType)}
                              </div>
                              <div className="text-xs text-white/60">
                                {gameType}
                              </div>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-sm">
                                {levelsCompleted}/3
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="text-yellow-300 font-bold">
                                {totalScore}
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="font-semibold">
                                {overallAccuracy.toFixed(1)}%
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span
                                className={`font-semibold ${getRiskColor(
                                  overallRiskLevel
                                )}`}
                              >
                                {getRiskTextSinhala(overallRiskLevel)}
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="text-sm">
                                {gameType === "Dyspraxia"
                                  ? `${(overallAvgTime / 1000).toFixed(1)}තත්`
                                  : `${overallAvgTime.toFixed(1)}තත්`}
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <div className="text-sm">
                                {new Date(lastCompletedDate).toLocaleDateString(
                                  "si-LK"
                                )}
                              </div>
                              <div className="text-xs text-white/60">
                                {new Date(lastCompletedDate).toLocaleTimeString(
                                  "si-LK"
                                )}
                              </div>
                            </td>
                            <td className="text-center py-3 px-2">
                              <button
                                onClick={() =>
                                  setSelectedGameDetails({
                                    gameType: gameType,
                                    overallStats: {
                                      totalScore: gameStats.totalScore,
                                      overallAccuracy:
                                        gameStats.overallAccuracy,
                                      levelsCompleted:
                                        gameStats.levelsCompleted,
                                      highestLevel: gameStats.highestLevel,
                                      overallAvgReactionTime:
                                        gameStats.overallAvgReactionTime ||
                                        gameStats.overallAvgTime,
                                    },
                                    levels: levels,
                                    lastUpdated: lastCompletedDate,
                                  })
                                }
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full text-sm transition-colors duration-300"
                              >
                                විස්තර
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center text-white/60 py-4"
                        >
                          මෙම පරිශීලකයාගේ ක්‍රීඩා දත්තයන් නොමැත
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">ගුරු නිර්දේශ</h2>
            <div
              className={`mb-6 p-4 rounded-lg bg-${riskLevel.color}-500/20 border border-${riskLevel.color}-500/50`}
            >
              <h3 className="font-bold text-white mb-2">
                අවදානම් මට්ටම: {riskLevel.text}
              </h3>
              <p className="text-white/80 text-sm">
                {riskLevel.level === "high" &&
                  "මෙම ළමයාට විශේෂ අවධානය සහ සහාය අවශ්‍යයි."}
                {riskLevel.level === "medium" &&
                  "මෙම ළමයාට අමතර සහාය ප්‍රයෝජනවත් වේ."}
                {riskLevel.level === "low" &&
                  "මෙම ළමයා හොඳ ප්‍රගතියක් පෙන්වයි."}
                {riskLevel.level === "unknown" && "වැඩි ක්‍රීඩා දත්ත අවශ්‍යයි."}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white">නිර්දේශිත ක්‍රියාමාර්ග:</h4>
              <ul className="space-y-2">
                {getRecommendations(riskLevel).map((recommendation, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-white/80"
                  >
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

      {/* Game Details Modal */}
      {selectedGameDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getGameTypeInSinhala(selectedGameDetails.gameType)} -
                විස්තරාත්මක ප්‍රතිඵල
              </h2>
              <button
                onClick={() => setSelectedGameDetails(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-colors duration-300"
              >
                ✕ වසන්න
              </button>
            </div>

            {/* Overall Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">
                සමස්ත සංඛ්‍යාලේඛන
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/60 text-sm">මුළු ලකුණු</div>
                  <div className="text-white font-bold text-xl">
                    {selectedGameDetails.overallStats?.totalScore || 0}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/60 text-sm">සමස්ත නිරවද්‍යතාව</div>
                  <div className="text-white font-bold text-xl">
                    {(
                      selectedGameDetails.overallStats?.overallAccuracy || 0
                    ).toFixed(1)}
                    %
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/60 text-sm">සම්පූර්ණ මට්ටම්</div>
                  <div className="text-white font-bold text-xl">
                    {selectedGameDetails.overallStats?.levelsCompleted || 0}/3
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/60 text-sm">ඉහළම මට්ටම</div>
                  <div className="text-white font-bold text-xl">
                    {selectedGameDetails.overallStats?.highestLevel || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Level-wise Performance */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">
                මට්ටම් අනුව කාර්ය සාධනය
              </h3>
              <div className="space-y-4">
                {selectedGameDetails.levels &&
                  Object.entries(selectedGameDetails.levels).map(
                    ([levelKey, levelData]) => {
                      const levelNumber = levelKey.replace("level", "");
                      return (
                        <div
                          key={levelKey}
                          className="bg-white/10 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-white">
                              මට්ටම {levelNumber}
                            </h4>
                            {(() => {
                              const riskLevel =
                                levelData?.riskLevel || "Unknown";

                              const riskStyles = {
                                Danger: "bg-red-500/20 text-red-300",
                                "Less Danger":
                                  "bg-yellow-500/20 text-yellow-300",
                                "Not Danger": "bg-green-500/20 text-green-300",
                                Unknown: "bg-gray-500/20 text-gray-300",
                              };

                              const riskTexts = {
                                Danger: "ඉහළ අවදානම",
                                "Less Danger": "අඩු අවදානම",
                                "Not Danger": "අවදානමක් නැත",
                                Unknown: "නොදන්නා",
                              };

                              return (
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-bold ${riskStyles[riskLevel]}`}
                                >
                                  {riskTexts[riskLevel]}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-white/60 text-xs">ලකුණු</div>
                              <div className="text-white font-bold">
                                {levelData?.score ?? 0}/
                                {levelData?.totalQuestions ?? 0}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-white/60 text-xs">
                                නිරවද්‍යතාව
                              </div>
                              <div className="text-white font-bold">
                                {(levelData?.accuracy ?? 0).toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-white/60 text-xs">
                                සාමාන්‍ය කාලය
                              </div>
                              <div className="text-white font-bold">
                                {selectedGameDetails.gameType === "Dyspraxia"
                                  ? `${
                                      typeof levelData?.averageReactionTime ===
                                      "number"
                                        ? (
                                            levelData.averageReactionTime / 1000
                                          ).toFixed(1)
                                        : "0.0"
                                    }තත්`
                                  : `${
                                      typeof levelData?.averageTime === "number"
                                        ? levelData.averageTime.toFixed(1)
                                        : "0.0"
                                    }තත්`}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-white/60 text-xs">
                                සම්පූර්ණ කළ දිනය
                              </div>
                              <div className="text-white font-bold text-xs">
                                {levelData?.completedAt
                                  ? new Date(
                                      levelData.completedAt
                                    ).toLocaleDateString("si-LK")
                                  : "තවම සම්පූර්ණ කර නැහැ"}
                              </div>
                            </div>
                          </div>

                          {/* Additional game-specific metrics */}
                          {selectedGameDetails.gameType === "Dyspraxia" &&
                            levelData.timeoutRate && (
                              <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="text-center">
                                  <div className="text-white/60 text-xs">
                                    කාල අවසන් වීමේ අනුපාතය
                                  </div>
                                  <div className="text-white font-bold">
                                    {typeof levelData?.timeoutRate === "number"
                                      ? levelData.timeoutRate.toFixed(1) + "%"
                                      : "N/A"}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    }
                  )}
              </div>
            </div>

            {/* Response Analysis (for detailed debugging) */}
            {selectedGameDetails.levels && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3">
                  ප්‍රතිචාර විශ්ලේෂණය
                </h3>
                <div className="bg-white/5 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="text-sm text-white/80">
                    <p className="mb-2">
                      මෙම කොටස backend සම්බන්ධතාවයෙන් පසු විස්තරාත්මක ප්‍රතිචාර
                      දත්ත පෙන්වනු ඇත:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>ප්‍රශ්න-අනුව ප්‍රතිචාර කාලය</li>
                      <li>වැරදි පිළිතුරු රටා</li>
                      <li>දුෂ්කරතා මට්ටම් අනුව කාර්ය සාධනය</li>
                      <li>ප්‍රගති ප්‍රවණතා</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
