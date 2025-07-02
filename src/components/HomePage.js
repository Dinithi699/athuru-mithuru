import React, { useState } from 'react';

const HomePage = ({ onLogout }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = [
    {
      id: 'math',
      name: 'ගණිතය',
      icon: '🔢',
      color: 'bg-blue-500',
      description: 'සංඛ්‍යා සහ ගණන් ඉගෙන ගන්න'
    },
    {
      id: 'sinhala',
      name: 'සිංහල',
      icon: '📚',
      color: 'bg-green-500',
      description: 'අකුරු සහ වචන ඉගෙන ගන්න'
    },
    {
      id: 'english',
      name: 'ඉංග්‍රීසි',
      icon: '🌍',
      color: 'bg-purple-500',
      description: 'English letters and words'
    },
    {
      id: 'science',
      name: 'විද්‍යාව',
      icon: '🔬',
      color: 'bg-orange-500',
      description: 'ප්‍රකෘතිය සහ විද්‍යාව ගවේෂණය කරන්න'
    },
    {
      id: 'art',
      name: 'කලාව',
      icon: '🎨',
      color: 'bg-pink-500',
      description: 'වර්ණ සහ චිත්‍ර ඇඳීම'
    },
    {
      id: 'music',
      name: 'සංගීතය',
      icon: '🎵',
      color: 'bg-yellow-500',
      description: 'සංගීතය සහ ගීත'
    }
  ];

  const games = [
    {
      id: 'puzzle',
      name: 'ප්‍රහේලිකා',
      icon: '🧩',
      difficulty: 'පහසු'
    },
    {
      id: 'memory',
      name: 'මතක ක්‍රීඩාව',
      icon: '🧠',
      difficulty: 'මධ්‍යම'
    },
    {
      id: 'quiz',
      name: 'ප්‍රශ්න ක්‍රීඩාව',
      icon: '❓',
      difficulty: 'අභියෝගාත්මක'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">📖</span>
              </div>
              <h1 className="text-3xl font-bold text-purple-800">ඉගෙනුම් මධ්‍යස්ථානය</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-yellow-700">100 ලකුණු</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                ඉවත්වන්න
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            ආයුබෝවන්! 🌟
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            අද ඔබ කුමක් ඉගෙන ගැනීමට කැමතිද?
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm font-semibold text-purple-700">අද ඉලක්කය</div>
              <div className="text-lg font-bold text-purple-800">5 පාඩම්</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm font-semibold text-orange-700">අඛණ්ඩ දින</div>
              <div className="text-lg font-bold text-orange-800">7 දින</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-semibold text-yellow-700">මට්ටම</div>
              <div className="text-lg font-bold text-yellow-800">ආරම්භක</div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-purple-800 mb-8">
            විෂයයන් 📚
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-yellow-400"
                onClick={() => setSelectedSubject(subject)}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{subject.icon}</div>
                  <h4 className="text-2xl font-bold text-purple-800 mb-2">
                    {subject.name}
                  </h4>
                  <p className="text-gray-600 mb-4">{subject.description}</p>
                  <div className={`${subject.color} text-white px-4 py-2 rounded-full inline-block font-semibold`}>
                    ආරම්භ කරන්න
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Games Section */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-purple-800 mb-8">
            ක්‍රීඩා 🎮
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">{game.icon}</div>
                  <h4 className="text-xl font-bold text-purple-800 mb-2">
                    {game.name}
                  </h4>
                  <div className="bg-white/70 px-3 py-1 rounded-full inline-block">
                    <span className="text-sm font-semibold text-purple-700">
                      {game.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">
            ඔබේ ප්‍රගතිය 📈
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">සතියේ ක්‍රියාකාරකම්</h4>
              <div className="space-y-3">
                {['සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා', 'ඉරිදා'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-gray-700">{day}</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < (index < 4 ? index + 2 : 1) ? 'bg-green-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">මෑත කාලීන ජයග්‍රහණ</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 bg-yellow-100 p-3 rounded-lg">
                  <span className="text-2xl">🏅</span>
                  <div>
                    <div className="font-semibold text-yellow-800">ගණිත මාස්ටර්</div>
                    <div className="text-sm text-yellow-600">10 ගණිත ප්‍රශ්න නිවැරදිව</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-blue-100 p-3 rounded-lg">
                  <span className="text-2xl">📖</span>
                  <div>
                    <div className="font-semibold text-blue-800">කියවීමේ ශූරයා</div>
                    <div className="text-sm text-blue-600">5 කතන්දර කියවා අවසන්</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-green-100 p-3 rounded-lg">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="font-semibold text-green-800">දෛනික ඉලක්කය</div>
                    <div className="text-sm text-green-600">7 දින අඛණ්ඩව</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 animate-bounce">
        <div className="text-4xl">🎈</div>
      </div>
      <div className="fixed top-32 right-20 animate-pulse">
        <div className="text-3xl">⭐</div>
      </div>
      <div className="fixed bottom-20 left-20 animate-bounce" style={{ animationDelay: '1s' }}>
        <div className="text-3xl">🌈</div>
      </div>
      <div className="fixed bottom-32 right-10 animate-pulse" style={{ animationDelay: '2s' }}>
        <div className="text-4xl">🦋</div>
      </div>

      {/* Subject Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedSubject.icon}</div>
              <h3 className="text-2xl font-bold text-purple-800 mb-4">
                {selectedSubject.name}
              </h3>
              <p className="text-gray-600 mb-6">{selectedSubject.description}</p>
              <div className="space-y-3">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300">
                  පාඩම් ආරම්භ කරන්න
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300">
                  අභ්‍යාස කරන්න
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300">
                  ක්‍රීඩා කරන්න
                </button>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300"
                >
                  වසන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;