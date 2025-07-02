import React, { useState } from 'react';
import MathGamePage from './games/MathGamePage';
import SinhalaGamePage from './games/SinhalaGamePage';
import EnglishGamePage from './games/EnglishGamePage';
import ScienceGamePage from './games/ScienceGamePage';
import ProfilePage from './ProfilePage';

const HomePage = ({ onLogout, user }) => {
  const [currentPage, setCurrentPage] = useState('home');

  const planets = [
    {
      id: 'math',
      name: 'ගණිතය',
      color: '#FF6B6B',
      size: 'w-32 h-32',
      position: 'top-1/4 left-1/4',
      page: 'math'
    },
    {
      id: 'sinhala',
      name: 'සිංහල',
      color: '#4ECDC4',
      size: 'w-36 h-36',
      position: 'top-1/3 right-1/4',
      page: 'sinhala'
    },
    {
      id: 'english',
      name: 'English',
      color: '#45B7D1',
      size: 'w-28 h-28',
      position: 'bottom-1/3 left-1/3',
      page: 'english'
    },
    {
      id: 'science',
      name: 'විද්‍යාව',
      color: '#F9CA24',
      size: 'w-40 h-40',
      position: 'bottom-1/4 right-1/5',
      page: 'science'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'math':
        return <MathGamePage onBack={() => setCurrentPage('home')} />;
      case 'sinhala':
        return <SinhalaGamePage onBack={() => setCurrentPage('home')} />;
      case 'english':
        return <EnglishGamePage onBack={() => setCurrentPage('home')} />;
      case 'science':
        return <ScienceGamePage onBack={() => setCurrentPage('home')} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} user={user} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden">
            {/* Stars Background */}
            <div className="absolute inset-0">
              {[...Array(100)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: Math.random() * 3 + 1 + 'px',
                    height: Math.random() * 3 + 1 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 3 + 's',
                    animationDuration: Math.random() * 2 + 2 + 's'
                  }}
                />
              ))}
            </div>

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🚀</div>
                <h1 className="text-3xl font-bold text-white">ගගනගාමී ඉගෙනුම</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  ඉවත්වන්න
                </button>
              </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-white mb-4 animate-pulse">
                  🌟 ගගනගාමී ලෝකයට සාදරයෙන් පිළිගනිමු! 🌟
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  ඔබේ ඉගෙනුම් ගමන ආරම්භ කිරීමට ග්‍රහලෝකයක් තෝරන්න
                </p>
              </div>
            </div>

            {/* Planet Buttons */}
            {planets.map((planet) => (
              <button
                key={planet.id}
                onClick={() => setCurrentPage(planet.page)}
                className={`absolute ${planet.position} ${planet.size} rounded-full shadow-2xl transform transition-all duration-500 hover:scale-110 hover:shadow-3xl animate-bounce cursor-pointer group`}
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}dd, ${planet.color}88)`,
                  boxShadow: `0 0 30px ${planet.color}66, inset -10px -10px 20px rgba(0,0,0,0.3)`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '3s'
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg group-hover:text-2xl transition-all duration-300 text-center px-2">
                    {planet.name}
                  </span>
                </div>
                {/* Planet ring effect */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                  style={{ transform: 'scale(1.2)' }}
                />
              </button>
            ))}

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 text-4xl animate-spin" style={{ animationDuration: '10s' }}>
              🛸
            </div>
            <div className="absolute top-32 right-20 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>
              🌙
            </div>
            <div className="absolute bottom-20 left-20 text-2xl animate-pulse" style={{ animationDelay: '2s' }}>
              ⭐
            </div>
            <div className="absolute bottom-32 right-10 text-4xl animate-spin" style={{ animationDuration: '15s', animationDelay: '3s' }}>
              🪐
            </div>

            {/* Shooting Stars */}
            <div className="absolute top-1/4 left-0 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '4s' }} />
            <div className="absolute top-1/2 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '6s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '8s' }} />
          </div>
        );
    }
  };

  return renderCurrentPage();
};

export default HomePage;