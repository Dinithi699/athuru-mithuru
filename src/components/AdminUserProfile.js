import React, { useState, useEffect, useRef } from "react";
import { getUserGameHistory } from "../firebase/firestore";
import * as Chart from 'chart.js';

const AdminUserProfile = ({ user, onBack, admin }) => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGameDetails, setSelectedGameDetails] = useState(null);

  // Register Chart.js components - FIXED VERSION
  Chart.Chart.register(
    Chart.CategoryScale,
    Chart.LinearScale,
    Chart.PointElement,
    Chart.LineElement,
    Chart.BarElement,
    Chart.BarController,  // Added missing BarController
    Chart.LineController, // Added missing LineController
    Chart.PieController,  // Added missing PieController
    Chart.RadarController, // Added missing RadarController
    Chart.Title,
    Chart.Tooltip,
    Chart.Legend,
    Chart.ArcElement,
    Chart.RadialLinearScale,
    Chart.Filler // Added for filled areas in charts
  );

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
        if (accuracy < 51) return 0;
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

  const downloadGameResultsAsCSV = (user, gameHistory) => {
    // Helper function to get game type in Sinhala
    const getGameTypeInSinhala = (gameType) => {
      const gameTypes = {
        Dysgraphia: "අකුරු ලිවීම",
        Dyspraxia: "තරු රටා", 
        Dyscalculia: "සංඛ්‍යා සංසන්දනය",
        Dyslexia: "දෘශ්‍ය වෙනස්කම්",
      };
      return gameTypes[gameType] || gameType;
    };

    // Prepare CSV data
    const csvData = [];
    
    // Add header row
    csvData.push([
      'Game Type (English)',
      'Game Type (Sinhala)', 
      'Level',
      'Score',
      'Total Questions',
      'Correct Answers',
      'Accuracy (%)',
      'Average Time (seconds)',
      'Average Reaction Time (ms)',
      'Risk Level',
      'Completed Date',
      'Timeout Rate (%)',
      'Overall Risk Level'
    ]);

    // Process each game in gameHistory
    gameHistory.forEach(game => {
      if (game.gameScores && Array.isArray(game.gameScores)) {
        game.gameScores.forEach(gameScore => {
          const gameType = gameScore.gameType;
          const gameTypeSinhala = getGameTypeInSinhala(gameType);
          const overallStats = gameScore.overallStats || {};
          
          // Add overall stats row
          csvData.push([
            gameType,
            gameTypeSinhala,
            'Overall',
            overallStats.totalScore || 0,
            overallStats.totalQuestions || 0,
            '', // Correct answers not available in overall stats
            (overallStats.overallAccuracy || 0).toFixed(2),
            (overallStats.overallAvgTime || 0).toFixed(2),
            (overallStats.overallAvgReactionTime || 0).toFixed(2),
            overallStats.overallRiskLevel || '',
            gameScore.lastUpdated ? new Date(gameScore.lastUpdated).toLocaleDateString() : '',
            '',
            overallStats.overallRiskLevel || ''
          ]);

          // Add level-specific data
          if (gameScore.levels) {
            Object.values(gameScore.levels).forEach(level => {
              csvData.push([
                gameType,
                gameTypeSinhala,
                level.level || '',
                level.score || 0,
                level.totalQuestions || 0,
                level.correctAnswers || 0,
                (level.accuracy || 0).toFixed(2),
                (level.averageTime || 0).toFixed(2),
                (level.averageReactionTime || 0).toFixed(2),
                level.riskLevel || '',
                level.completedAt ? new Date(level.completedAt).toLocaleDateString() : '',
                (level.timeoutRate || 0).toFixed(2),
                overallStats.overallRiskLevel || ''
              ]);
            });
          }
        });
      }
    });

    // If using the user object from the second document
    if (user.gameScores && Array.isArray(user.gameScores)) {
      user.gameScores.forEach(gameScore => {
        const gameType = gameScore.gameType;
        const gameTypeSinhala = getGameTypeInSinhala(gameType);
        const overallStats = gameScore.overallStats || {};
        
        // Add overall stats row
        csvData.push([
          gameType,
          gameTypeSinhala,
          'Overall',
          overallStats.totalScore || 0,
          overallStats.totalQuestions || 0,
          '', // Correct answers not available in overall stats
          (overallStats.overallAccuracy || 0).toFixed(2),
          (overallStats.overallAvgTime || 0).toFixed(2),
          (overallStats.overallAvgReactionTime || 0).toFixed(2),
          overallStats.overallRiskLevel || '',
          gameScore.lastUpdated ? new Date(gameScore.lastUpdated).toLocaleDateString() : '',
          '',
          overallStats.overallRiskLevel || ''
        ]);

        // Add level-specific data
        if (gameScore.levels) {
          Object.values(gameScore.levels).forEach(level => {
            csvData.push([
              gameType,
              gameTypeSinhala,
              level.level || '',
              level.score || 0,
              level.totalQuestions || 0,
              level.correctAnswers || 0,
              (level.accuracy || 0).toFixed(2),
              (level.averageTime || 0).toFixed(2),
              (level.averageReactionTime || 0).toFixed(2),
              level.riskLevel || '',
              level.completedAt ? new Date(level.completedAt).toLocaleDateString() : '',
              (level.timeoutRate || 0).toFixed(2),
              overallStats.overallRiskLevel || ''
            ]);
          });
        }
      });
    }

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => 
        // Escape fields that contain commas, quotes, or newlines
        typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))
          ? `"${field.replace(/"/g, '""')}"`
          : field
      ).join(',')
    ).join('\n');

    // Create and download the file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${user.name || 'user'}_game_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const AccuracyScoreChart = ({ user }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!user?.gameScores || !Array.isArray(user.gameScores)) return;

      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const accuracyData = user.gameScores.map(game => Math.round(game.overallStats?.overallAccuracy || 0));
      const scoreData = user.gameScores.map(game => game.overallStats?.totalScore || 0);
      const labels = user.gameScores.map(game => getGameTypeInSinhala(game.gameType));

      chartInstance.current = new Chart.Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'නිරවද්‍යතාව (%)',
              data: accuracyData,
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'ලකුණු',
              data: scoreData,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'white',
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              ticks: {
                color: 'white',
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [user]);

    return <canvas ref={chartRef}></canvas>;
  };

  // Chart component for Risk Level Distribution
  const RiskLevelChart = ({ user }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!user?.gameScores || !Array.isArray(user.gameScores)) return;

      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const riskCounts = user.gameScores.reduce((acc, game) => {
        const risk = game.overallStats?.overallRiskLevel || 'Unknown';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(riskCounts).map(risk => {
        if (risk === 'high') return 'ඉහළ';
        if (risk === 'medium') return 'මධ්‍යම';
        if (risk === 'low') return 'අඩු';
        if (risk === 'Not Danger') return 'අවදානම් නැත';
        if (risk === 'Less Danger') return 'අඩු අවදානම';
        if (risk === 'Danger') return 'අවදානමක්';
        return risk;
      });

      const data = Object.values(riskCounts);
      const colors = Object.keys(riskCounts).map(risk => {
        if (risk === 'high' || risk === 'Danger') return '#ef4444';
        if (risk === 'medium' || risk === 'Less Danger') return '#f97316';
        return '#10b981';
      });

      chartInstance.current = new Chart.Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'white',
                font: {
                  size: 12
                },
                padding: 20
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed * 100) / total).toFixed(1);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
              }
            }
          }
        }
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [user]);

    return <canvas ref={chartRef}></canvas>;
  };

  // Chart component for Performance Radar
  const PerformanceRadarChart = ({ user }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!user?.gameScores || !Array.isArray(user.gameScores)) return;

      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = user.gameScores.map(game => getGameTypeInSinhala(game.gameType));
      const accuracyData = user.gameScores.map(game => Math.round(game.overallStats?.overallAccuracy || 0));
      const speedData = user.gameScores.map(game => {
        const reactionTime = game.overallStats?.overallAvgReactionTime || 5000;
        return Math.max(0, Math.min(100, 100 - (reactionTime / 50))); // Convert to speed score
      });

      chartInstance.current = new Chart.Chart(ctx, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'නිරවද්‍යතාව',
              data: accuracyData,
              borderColor: 'rgba(16, 185, 129, 1)',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              pointBackgroundColor: 'rgba(16, 185, 129, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
              pointRadius: 4
            },
            {
              label: 'වේගය',
              data: speedData,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              pointBackgroundColor: 'rgba(59, 130, 246, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: 'white',
                font: {
                  size: 10
                },
                stepSize: 25
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.2)'
              },
              pointLabels: {
                color: 'white',
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [user]);

    return <canvas ref={chartRef}></canvas>;
  };

  // Chart component for Level Performance Line Chart
  const LevelPerformanceChart = ({ user }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!user?.gameScores || !Array.isArray(user.gameScores)) return;

      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Prepare level data
      const levelData = [];
      const gameColors = ['#00ff00', '#ffff00', '#ff0000', '#ef4444'];
      const datasets = [];

      user.gameScores.forEach((game, gameIndex) => {
        if (game.levels) {
          const gameName = getGameTypeInSinhala(game.gameType);
          const levels = Object.values(game.levels).sort((a, b) => a.level - b.level);
          
          const accuracyData = levels.map(level => Math.round(level.accuracy || 0));
          const labelData = levels.map(level => `මට්ටම ${level.level}`);
          
          if (gameIndex === 0) {
            levelData.push(...labelData);
          }

          datasets.push({
            label: gameName,
            data: accuracyData,
            borderColor: gameColors[gameIndex % gameColors.length],
            backgroundColor: gameColors[gameIndex % gameColors.length] + '20',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8
          });
        }
      });

      // Get unique level labels
      const uniqueLabels = [...new Set(levelData)];

      chartInstance.current = new Chart.Chart(ctx, {
        type: 'line',
        data: {
          labels: uniqueLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y}%`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'white',
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: 'white',
                font: {
                  size: 12
                },
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [user]);

    return <canvas ref={chartRef}></canvas>;
  };
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
          <div className="flex items-center gap-4">

           <button 
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-colors duration-300 justify-end"
      onClick={() => downloadGameResultsAsCSV(user, gameHistory)}
    >
      විස්තරාත්මක ප්‍රතිඵල
    </button>
          <div
            className={`px-4 py-2 rounded-full text-white font-bold bg-${riskLevel.color}-500`}
          >
            {riskLevel.text}
          </div>
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

          {/* Performance Charts */}
          {user?.gameScores && user.gameScores.length > 0 && (
            <>
              {/* Accuracy and Score Comparison */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  ක්‍රීඩා අනුව නිරවද්‍යතාව සහ ලකුණු
                </h2>
                <div className="h-80">
                  <AccuracyScoreChart user={user} />
                </div>
              </div>

              {/* Risk Level and Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Level Distribution */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    අවදානම් මට්ටම් ව්‍යාප්තිය
                  </h2>
                  <div className="h-64">
                    <RiskLevelChart user={user} />
                  </div>
                </div>

                {/* Overall Performance Radar */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    සමස්ථ කාර්‍ය සාධනය
                  </h2>
                  <div className="h-64">
                    <PerformanceRadarChart user={user} />
                  </div>
                </div>
              </div>

              {/* Performance Across Levels */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  මට්ටම් අනුව කාර්‍ය සාධනය
                </h2>
                <div className="h-80">
                  <LevelPerformanceChart user={user} />
                </div>
              </div>
            </>
          )}

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

          {/* No Data Message */}
          {(!user?.gameScores || user.gameScores.length === 0) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-white/60 text-lg mb-2">📊</div>
              <h3 className="text-white font-bold mb-2">ක්‍රීඩා දත්ත නොමැත</h3>
              <p className="text-white/70 text-sm">
                මෙම පරිශීලකයා තවම ක්‍රීඩා කර නොමැත. ක්‍රීඩා සම්පූර්ණ කිරීමෙන් පසු දත්ත මෙහි පෙන්වනු ඇත.
              </p>
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
      
      // Handle Dysgraphia differently
      if (gameType === "Dysgraphia") {
        const levels = gameScore.levels || {};
        const levelData = Object.values(levels).flat(); // Combine all level attempts
        
        // Calculate stats from array data
        const totalAttempts = levelData.length;
        const levelsCompleted = Object.keys(levels).length; // Number of levels with attempts
        const totalScore = totalAttempts; // Each attempt is a score
        
        // Calculate risk level based on confidence
        const avgConfidence = totalAttempts > 0 
          ? levelData.reduce((sum, item) => sum + parseFloat(item.confidence || 0), 0) / totalAttempts 
          : 0;
        
        // Calculate average time across all attempts
        const avgTime = totalAttempts > 0
          ? levelData.reduce((sum, item) => sum + (item.timeTaken || 0), 0) / totalAttempts
          : 0;
        
        const overallRiskLevel = avgConfidence > 95 ? "Not Danger" : 
                               avgConfidence > 80 ? "Less Danger" : "Danger";
        
        // Get last attempt timestamp
        const lastAttempt = levelData.length > 0 ? levelData[levelData.length - 1] : null;
        const lastCompletedDate = lastAttempt?.timestamp 
          ? new Date(lastAttempt.timestamp.seconds * 1000).toISOString()
          : user.createdAt;

        return (
          <tr
            key={index}
            className="border-b border-white/10 hover:bg-white/5 transition-colors"
          >
            <td className="py-3 px-2">
              <div className="font-semibold">
                ඩිස්ග්‍රැෆියා
              </div>
              <div className="text-xs text-white/60">
                Dysgraphia
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
                {avgConfidence.toFixed(1)}%
              </span>
            </td>
            <td className="text-center py-3 px-2">
              <span className={`font-semibold ${
                overallRiskLevel === "Danger" ? "text-red-400" :
                overallRiskLevel === "Less Danger" ? "text-yellow-400" : 
                "text-green-400"
              }`}>
                {overallRiskLevel === "Danger" ? "ඉහළ අවදානම" :
                 overallRiskLevel === "Less Danger" ? "අඩු අවදානම" : 
                 "අවදානමක් නැත"}
              </span>
            </td>
            <td className="text-center py-3 px-2">
              <span className="text-sm">
                {avgTime.toFixed(1)}තත්
              </span>
            </td>
            <td className="text-center py-3 px-2">
              <div className="text-sm">
                {new Date(lastCompletedDate).toLocaleDateString("si-LK")}
              </div>
              <div className="text-xs text-white/60">
                {new Date(lastCompletedDate).toLocaleTimeString("si-LK")}
              </div>
            </td>
            <td className="text-center py-3 px-2">
              <button
                onClick={() =>
                  setSelectedGameDetails({
                    gameType: gameType,
                    overallStats: {
                      totalScore: totalScore,
                      overallAccuracy: avgConfidence,
                      levelsCompleted: levelsCompleted,
                      highestLevel: Object.keys(levels).length,
                      totalAttempts: totalAttempts,
                      overallAvgTime: avgTime
                    },
                    levels: levels,
                    averageTime: gameScore.averageTime || {},
                    lastUpdated: gameScore.lastUpdated || {seconds: Math.floor(new Date(lastCompletedDate).getTime() / 1000)}
                  })
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full text-sm transition-colors duration-300"
              >
                විස්තර
              </button>
            </td>
          </tr>
        );
      }

      // Handle other game types (original logic)
      const gameStats = gameScore.overallStats || {};
      const levels = gameScore.levels || {};
      const levelsCompleted = gameStats.levelsCompleted || 0;
      const totalScore = gameStats.totalScore || 0;
      const overallAccuracy = gameStats.overallAccuracy || 0;
      const overallRiskLevel = gameStats.overallRiskLevel || "Unknown";
      const overallAvgTime = gameStats.overallAvgReactionTime || gameStats.overallAvgTime || 0;

      // Get the last completed date from levels
      const lastCompletedDate = levels && typeof levels === "object"
        ? Object.values(levels)
            .filter((level) => level && level.completedAt)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]?.completedAt || user.createdAt
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
            return "ඩිස්ලෙක්සියා";
          case "Dysgraphia":
            return "ඩිස්ග්‍රැෆියා";
          case "Dyspraxia":
            return "ඩිස්ප්‍රැක්සියා";
          case "Dyscalculia":
            return "ඩිස්කැල්කියුලියා";
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
            <span className={`font-semibold ${getRiskColor(overallRiskLevel)}`}>
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
              {new Date(lastCompletedDate).toLocaleDateString("si-LK")}
            </div>
            <div className="text-xs text-white/60">
              {new Date(lastCompletedDate).toLocaleTimeString("si-LK")}
            </div>
          </td>
          <td className="text-center py-3 px-2">
            <button
              onClick={() =>
                setSelectedGameDetails({
                  gameType: gameType,
                  overallStats: {
                    totalScore: gameStats.totalScore,
                    overallAccuracy: gameStats.overallAccuracy,
                    levelsCompleted: gameStats.levelsCompleted,
                    highestLevel: gameStats.highestLevel,
                    overallAvgReactionTime: gameStats.overallAvgReactionTime || gameStats.overallAvgTime,
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
      <td colSpan="8" className="text-center text-white/60 py-4">
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
          {getGameTypeInSinhala(selectedGameDetails.gameType)} - විස්තරාත්මක ප්‍රතිඵල
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
        <h3 className="text-lg font-bold text-white mb-3">සමස්ත සංඛ්‍යාලේඛන</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {selectedGameDetails.gameType === "Dysgraphia" ? (
            <>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-sm">මුළු උත්සාහයන්</div>
                <div className="text-white font-bold text-xl">
                  {Object.values(selectedGameDetails.levels || {}).reduce(
                    (total, level) => total + level.length, 0
                  )}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-sm">සාමාන්‍ය කාලය</div>
                <div className="text-white font-bold text-xl">
                  {(
                    Object.values(selectedGameDetails.averageTime || {}).reduce(
                      (sum, time) => sum + time, 0
                    ) / Object.keys(selectedGameDetails.averageTime || {}).length || 0
                  ).toFixed(1)}තත්
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-sm">අවදානම් මට්ටම</div>
                <div className="text-white font-bold text-xl">
                  {selectedGameDetails.levels && 
                    Object.values(selectedGameDetails.levels).some(level => 
                      level.some(attempt => attempt.label !== "no_Dysgraphia")
                    ) ? "අවදානමක් ඇත" : "අවදානමක් නැත"}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-sm">අවසන් යාවත්කාලීනය</div>
                <div className="text-white font-bold text-xs">
                  {selectedGameDetails.lastUpdated?.seconds
                    ? new Date(selectedGameDetails.lastUpdated.seconds * 1000).toLocaleDateString("si-LK")
                    : "තවම සම්පූර්ණ කර නැහැ"}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-sm">මුළු ලකුණු</div>
                <div className="text-white font-bold text-xl">
                  {selectedGameDetails.overallStats?.totalScore || 0}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-sm">සමස්ත නිරවද්‍යතාව</div>
                <div className="text-white font-bold text-xl">
                  {(selectedGameDetails.overallStats?.overallAccuracy || 0).toFixed(1)}%
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
            </>
          )}
        </div>
      </div>

      {/* Level-wise Performance */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3">මට්ටම් අනුව කාර්ය සාධනය</h3>
        <div className="space-y-4">
          {selectedGameDetails.gameType === "Dysgraphia" ? (
            Object.entries(selectedGameDetails.levels || {}).map(([levelKey, levelData]) => {
              const levelNumber = levelKey.replace("level", "");
              const averageTime = selectedGameDetails.averageTime?.[levelKey] || 0;
              const correctAttempts = levelData.filter(attempt => attempt.label === "no_Dysgraphia").length;
              const totalAttempts = levelData.length;
              const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

              return (
                <div key={levelKey} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-white">මට්ටම {levelNumber}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      accuracy < 70 ? "bg-red-500/20 text-red-300" : 
                      accuracy < 90 ? "bg-yellow-500/20 text-yellow-300" : 
                      "bg-green-500/20 text-green-300"
                    }`}>
                      {accuracy < 70 ? "ඉහළ අවදානම" : 
                       accuracy < 90 ? "අඩු අවදානම" : 
                       "අවදානමක් නැත"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-white/60 text-xs">නිවැරදි උත්සාහයන්</div>
                      <div className="text-white font-bold">
                        {correctAttempts}/{totalAttempts}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 text-xs">නිරවද්‍යතාව</div>
                      <div className="text-white font-bold">
                        {accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 text-xs">සාමාන්‍ය කාලය</div>
                      <div className="text-white font-bold">
                        {averageTime.toFixed(1)}තත්
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 text-xs">අන්තිම උත්සාහය</div>
                      <div className="text-white font-bold text-xs">
                        {levelData[0]?.timestamp?.seconds
                          ? new Date(levelData[0].timestamp.seconds * 1000).toLocaleDateString("si-LK")
                          : "දත්ත නැත"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-white/80 text-sm font-bold mb-2">උත්සාහයන්:</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {levelData.map((attempt, index) => (
                        <div key={index} className="bg-white/5 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="text-white/80">වචනය: {attempt.wordAttempted}</span>
                            <span className={`text-xs ${
                              attempt.label === "no_Dysgraphia" 
                                ? "text-green-400" 
                                : "text-red-400"
                            }`}>
                              {attempt.label === "no_Dysgraphia" 
                                ? "නිවැරදි" 
                                : "වැරදි"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-white/60">
                            <span>කාලය: {attempt.timeTaken.toFixed(1)}තත්</span>
                            <span>විශ්වාසය: {attempt.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            selectedGameDetails.levels &&
            Object.entries(selectedGameDetails.levels).map(([levelKey, levelData]) => {
              const levelNumber = levelKey.replace("level", "");
              const isDyspraxia = selectedGameDetails.gameType === "Dyspraxia";
              const avgTime = isDyspraxia 
                ? (levelData.averageReactionTime / 1000).toFixed(1)
                : levelData.averageTime?.toFixed(1) || 0;
              const accuracy = levelData.accuracy || 0;
              const score = levelData.score || 0;
              const totalQuestions = levelData.totalQuestions || 0;
              const correctAnswers = levelData.correctAnswers || 0;
              const riskLevel = levelData.riskLevel || "Unknown";

              return (
                <div key={levelKey} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-white">මට්ටම {levelNumber}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      riskLevel === "Danger" ? "bg-red-500/20 text-red-300" :
                      riskLevel === "Less Danger" ? "bg-yellow-500/20 text-yellow-300" :
                      "bg-green-500/20 text-green-300"
                    }`}>
                      {riskLevel === "Danger" ? "ඉහළ අවදානම" :
                       riskLevel === "Less Danger" ? "අඩු අවදානම" :
                       "අවදානමක් නැත"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-white/60 text-xs">ලකුණු</div>
                      <div className="text-white font-bold">
                        {score}/{totalQuestions}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 text-xs">නිරවද්‍යතාව</div>
                      <div className="text-white font-bold">
                        {accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 text-xs">සාමාන්‍ය කාලය</div>
                      <div className="text-white font-bold">
                        {avgTime}තත්
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 text-xs">සම්පූර්ණ කළ දිනය</div>
                      <div className="text-white font-bold text-xs">
                        {levelData.completedAt
                          ? new Date(levelData.completedAt).toLocaleDateString("si-LK")
                          : "තවම සම්පූර්ණ කර නැහැ"}
                      </div>
                    </div>
                  </div>

                  {isDyspraxia && levelData.timeoutRate !== undefined && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-center">
                        <div className="text-white/60 text-xs">කාල අවසන් වීමේ අනුපාතය</div>
                        <div className="text-white font-bold">
                          {levelData.timeoutRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Response Analysis */}
      {selectedGameDetails.gameType === "Dysgraphia" ? (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">වචන අනුව කාර්ය සාධනය</h3>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white/80">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2">වචනය</th>
                    <th className="text-center py-2">උත්සාහයන්</th>
                    <th className="text-center py-2">නිවැරදි</th>
                    <th className="text-center py-2">සාමාන්‍ය කාලය</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const wordStats = {};
                    Object.values(selectedGameDetails.levels || {}).forEach(level => {
                      level.forEach(attempt => {
                        if (!wordStats[attempt.wordAttempted]) {
                          wordStats[attempt.wordAttempted] = {
                            attempts: 0,
                            correct: 0,
                            totalTime: 0
                          };
                        }
                        wordStats[attempt.wordAttempted].attempts++;
                        wordStats[attempt.wordAttempted].totalTime += attempt.timeTaken;
                        if (attempt.label === "no_Dysgraphia") {
                          wordStats[attempt.wordAttempted].correct++;
                        }
                      });
                    });

                    return Object.entries(wordStats).map(([word, stats]) => (
                      <tr key={word} className="border-b border-white/10">
                        <td className="py-2">{word}</td>
                        <td className="text-center py-2">{stats.attempts}</td>
                        <td className="text-center py-2">
                          {stats.correct} ({((stats.correct / stats.attempts) * 100).toFixed(0)}%)
                        </td>
                        <td className="text-center py-2">{(stats.totalTime / stats.attempts).toFixed(1)}තත්</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedGameDetails.levels && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">ප්‍රතිචාර විශ්ලේෂණය</h3>
          <div className="bg-white/5 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div className="text-sm text-white/80">
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
