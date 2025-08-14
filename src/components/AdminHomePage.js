import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getAllUsersWithGameScores } from '../firebase/firestore';
import AdminUserProfile from './AdminUserProfile';
const AdminHomePage = ({ onLogout, admin }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [downloadFormat, setDownloadFormat] = useState('xlsx'); 
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const result = await getAllUsersWithGameScores();
      if (result.success) {
      
        const usersWithRisk = result.data.map(user => ({
          ...user,
          riskLevel: calculateRiskLevel(user),
        }));
        setUsers(usersWithRisk);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);


  const prepareUserDataForExport = () => {
    return users.map(user => {
    
      const baseData = {
        'නම (Name)': user.name || 'නම නැත',
        'ඊමේල් (Email)': user.email || '',
        'දුරකථන (Mobile)': user.mobile || '',
        'මට්ටම (Level)': user.level || 'ආරම්භක',
        'ලකුණු (Points)': user.points || 0,
        'සම්පූර්ණ ක්‍රීඩා (Completed Games)': user.completedGames || 0,
        'අවදානම් මට්ටම (Risk Level)': getRiskText(user.riskLevel),
        'ගිණුම් සෑදූ දිනය (Created Date)': user.createdAt ? new Date(user.createdAt).toLocaleDateString('si-LK') : '',
      };

      
      if (user.gameScores && user.gameScores.length > 0) {
        user.gameScores.forEach((game, index) => {
          const gamePrefix = `ක්‍රීඩාව ${index + 1} (Game ${index + 1})`;
          baseData[`${gamePrefix} - වර්ගය (Type)`] = game.gameType || '';
          baseData[`${gamePrefix} - සම්පූර්ණ මට්ටම් (Levels Completed)`] = game.overallStats?.levelsCompleted || 0;
          baseData[`${gamePrefix} - මුළු ලකුණු (Total Score)`] = game.overallStats?.totalScore || 0;
          baseData[`${gamePrefix} - සම්පූර්ණ නිරවද්‍යතාවය (Overall Accuracy)`] = game.overallStats?.overallAccuracy ? `${game.overallStats.overallAccuracy.toFixed(2)}%` : '0%';
          baseData[`${gamePrefix} - අවදානම් මට්ටම (Risk Level)`] = game.overallStats?.overallRiskLevel || 'Not Available';
          baseData[`${gamePrefix} - අවසන් යාවත්කරණය (Last Updated)`] = game.lastUpdated ? new Date(game.lastUpdated).toLocaleDateString('si-LK') : '';
        });
      }

      return baseData;
    });
  };

 
  const downloadAsXLSX = () => {
    try {
      const data = prepareUserDataForExport();
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      
  
      const maxWidths = {};
      data.forEach(row => {
        Object.keys(row).forEach(key => {
          const value = String(row[key] || '');
          maxWidths[key] = Math.max(maxWidths[key] || 0, value.length, key.length);
        });
      });
      
      worksheet['!cols'] = Object.keys(maxWidths).map(key => ({
        wch: Math.min(maxWidths[key] + 2, 50) 
      }));
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ළමුන්ගේ දත්ත');
      
      const filename = `students_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      console.log('XLSX file downloaded successfully');
    } catch (error) {
      console.error('Error downloading XLSX:', error);
      alert('ගොනුව බාගත කිරීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සහ කරන්න.');
    }
  };


  const downloadAsCSV = () => {
    try {
      const data = prepareUserDataForExport();
      const headers = Object.keys(data[0] || {});
      
      
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvContent += values.join(',') + '\n';
      });
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `students_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('CSV file downloaded successfully');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('ගොනුව බාගත කිරීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සහ කරන්න.');
    }
  };


  const handleDownload = () => {
    if (users.length === 0) {
      alert('බාගත කිරීමට දත්ත නොමැත.');
      return;
    }

    if (downloadFormat === 'xlsx') {
      downloadAsXLSX();
    } else {
      downloadAsCSV();
    }
  };

  const calculateRiskLevel = (user) => {
    
    const gameHistory = user.gameHistory || [];
    if (gameHistory.length === 0) return 'low'; 

    let riskScore = 0;
    let totalGames = gameHistory.length;
    
    const completedGames = gameHistory.filter(game => game.score !== undefined && game.score > 0).length;
    const completionRate = completedGames / totalGames;
    if (completionRate < 0.5) riskScore += 3;
    else if (completionRate < 0.7) riskScore += 2;
    else if (completionRate < 0.9) riskScore += 1;
    
    
    const gamePerformances = gameHistory.map(game => {
      if (game.gameType === 'Dysgraphia') {
       
        return game.capturedImage ? 1 : 0;
      } else if (game.gameType === 'Dyspraxia') {
        const accuracy = game.accuracy || 0;
        const reactionTime = game.averageReactionTime || 5000;
        if (accuracy < 60 || reactionTime > 3000) return 0;
        else if (accuracy < 80 || reactionTime > 2000) return 0.5;
        else return 1;
      } else if (game.gameType === 'Dyscalculia') {
        const accuracy = game.accuracy || 0;
        if (accuracy < 50) return 0;
        else if (accuracy < 70) return 0.5;
        else return 1;
      } else if (game.gameType === 'Dyslexia') {
        const accuracy = game.accuracy || 0;
        if (accuracy < 60) return 0;
        else if (accuracy < 80) return 0.5;
        else return 1;
      }
      return 0.5; 
    });
    
    const averagePerformance = gamePerformances.reduce((sum, perf) => sum + perf, 0) / gamePerformances.length;
    if (averagePerformance < 0.3) riskScore += 4;
    else if (averagePerformance < 0.6) riskScore += 2;
    else if (averagePerformance < 0.8) riskScore += 1;
    
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


    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskText = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'ඉහළ අවදානම';
      case 'medium': return 'මධ්‍යම අවදානම';
      case 'low': return 'අඩු අවදානම';
      default: return 'අඩු අවදානම';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' || user.riskLevel === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const sortedUsers = filteredUsers.sort((a, b) => {
    const riskOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });

  if (selectedUser) {
    return (
      <AdminUserProfile 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)}
        admin={admin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-white-700 to-blue-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              👨‍🏫 ගුරු පාලක පුවරුව
            </h1>
            <p className="text-white/80">සාදරයෙන් පිළිගනිමු, {admin?.name || 'ගුරුතුමා'}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Download Section */}
            <div className="flex items-center gap-2">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="px-3 py-2 bg-white/80 rounded-full border border-white/30 text-sm focus:border-blue-400 focus:outline-none"
              >
                {/* <option value="xlsx">Excel (.xlsx)</option> */}
                <option value="csv">CSV (.csv)</option>
              </select>
              <button 
                onClick={handleDownload}
                disabled={users.length === 0}
                className={`text-white rounded-full p-2 px-4 font-bold transition-colors duration-300 ${
                  users.length === 0 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                📥 විස්තර ලබා ගන්න
              </button>
            </div>
            <div className="text-white text-right">
              <div className="text-sm opacity-80">පාසල</div>
              <div className="font-semibold">{admin?.school || 'පාසල'}</div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-colors duration-300"
            >
              ඉවත්වන්න
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="p-4 sm:p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ළමයාගේ නම හෝ ඊමේල් සොයන්න..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 rounded-xl border border-white/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
              />
            </div>
            <div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-3 bg-white/80 rounded-xl border border-white/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
              >
                <option value="all">සියලු අවදානම් මට්ටම්</option>
                <option value="high">ඉහළ අවදානම</option>
                <option value="medium">මධ්‍යම අවදානම</option>
                <option value="low">අඩු අවදානම</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-white/80 text-sm">මුළු ළමුන්</div>
          </div>
          <div className="bg-red-500/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.riskLevel === 'high').length}
            </div>
            <div className="text-white/80 text-sm">ඉහළ අවදානම</div>
          </div>
          <div className="bg-orange-500/40 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.riskLevel === 'medium').length}
            </div>
            <div className="text-white/80 text-sm">මධ්‍යම අවදානම</div>
          </div>
          <div className="bg-green-500/40 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.riskLevel === 'low').length}
            </div>
            <div className="text-white/80 text-sm">අඩු අවදානම</div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white text-lg">ළමුන්ගේ දත්ත පූරණය වෙමින්...</p>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👶</div>
            <p className="text-white text-lg">ළමුන් සොයාගත නොහැක</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                className={`${getRiskColor(user.riskLevel)}/20 backdrop-blur-sm border-2 ${getRiskColor(user.riskLevel).replace('bg-', 'border-')} rounded-2xl p-4 sm:p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">👶</span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">
                    {user.name || 'නම නැත'}
                  </h3>
                  
                  <p className="text-white/80 text-sm mb-3 truncate">
                    {user.email}
                  </p>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getRiskColor(user.riskLevel)}`}>
                    {getRiskText(user.riskLevel)}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/60">ලකුණු</div>
                      <div className="text-white font-bold">{user.points || 0}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/60">ක්‍රීඩා</div>
                      <div className="text-white font-bold">{user.completedGames || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;