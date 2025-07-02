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
      size: 'w-20 h-20',
      orbitRadius: 200,
      orbitSpeed: 20,
      page: 'math',
      ringColor: '#FF9999'
    },
    {
      id: 'sinhala',
      name: 'සිංහල',
      color: '#4ECDC4',
      size: 'w-24 h-24',
      orbitRadius: 320,
      orbitSpeed: 15,
      page: 'sinhala',
      ringColor: '#7EEEE6'
    },
    {
      id: 'english',
      name: 'English',
      color: '#45B7D1',
      size: 'w-18 h-18',
      orbitRadius: 120,
      orbitSpeed: 25,
      page: 'english',
      ringColor: '#78C5E8'
    },
    {
      id: 'science',
      name: 'විද්‍යාව',
      color: '#F9CA24',
      size: 'w-28 h-28',
      orbitRadius: 420,
      orbitSpeed: 12,
      page: 'science',
      ringColor: '#FDD757'
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
              {[...Array(300)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: Math.random() * 3 + 1 + 'px',
                    height: Math.random() * 3 + 1 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 3 + 's',
                    animationDuration: Math.random() * 2 + 2 + 's',
                    opacity: Math.random() * 0.8 + 0.2
                  }}
                />
              ))}
            </div>

            {/* Galactic Center - Sun */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-24 h-24 bg-gradient-radial from-yellow-200 via-orange-400 to-red-500 rounded-full shadow-2xl relative"
                   style={{ 
                     boxShadow: '0 0 60px #FFA500, 0 0 120px #FF6347, 0 0 180px #FF4500',
                     animation: 'sunRotate 10s linear infinite'
                   }}>
                {/* Sun surface details */}
                <div className="absolute inset-2 bg-gradient-radial from-yellow-100 via-orange-300 to-transparent rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-radial from-white via-yellow-200 to-transparent rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
              </div>
              {/* Sun corona */}
              <div className="absolute inset-0 w-40 h-40 transform -translate-x-1/4 -translate-y-1/4 bg-gradient-radial from-orange-300/20 via-yellow-200/10 to-transparent rounded-full animate-pulse"></div>
            </div>

            {/* Horizontal Orbital Paths */}
            {planets.map((planet) => (
              <div
                key={`orbit-${planet.id}`}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded-full opacity-40"
                style={{
                  width: planet.orbitRadius * 2 + 'px',
                  height: planet.orbitRadius * 2 + 'px',
                }}
              />
            ))}

            {/* Header */}
            <header className="relative z-30 p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-4xl animate-spin" style={{ animationDuration: '20s' }}>🚀</div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">ගගනගාමී ඉගෙනුම</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <span>👤</span>
                  <span className="font-semibold">Profile</span>
                </button>
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  ඉවත්වන්න
                </button>
              </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="text-center mb-12">
                <h2 className="text-6xl font-bold text-white mb-6 animate-pulse drop-shadow-lg">
                  🌟 ගගනගාමී ලෝකයට සාදරයෙන් පිළිගනිමු! 🌟
                </h2>
                <p className="text-2xl text-gray-300 mb-8 drop-shadow-md">
                  ඔබේ ඉගෙනුම් ගමන ආරම්භ කිරීමට ග්‍රහලෝකයක් තෝරන්න
                </p>
              </div>
            </div>

            {/* 3D Orbiting Planet Buttons with Rings */}
            {planets.map((planet, index) => (
              <div
                key={planet.id}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  animation: `horizontalOrbit-${planet.id} ${planet.orbitSpeed}s linear infinite`,
                  animationDelay: `${index * 2}s`
                }}
              >
                {/* Planet Ring System */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Outer Ring */}
                  <div 
                    className="absolute border-2 rounded-full opacity-60"
                    style={{
                      width: `${parseInt(planet.size.split('-')[1]) * 8}px`,
                      height: `${parseInt(planet.size.split('-')[1]) * 2}px`,
                      borderColor: planet.ringColor,
                      animation: `ringRotate 6s linear infinite`,
                      transform: 'rotateX(75deg)'
                    }}
                  />
                  {/* Inner Ring */}
                  <div 
                    className="absolute border rounded-full opacity-40"
                    style={{
                      width: `${parseInt(planet.size.split('-')[1]) * 6}px`,
                      height: `${parseInt(planet.size.split('-')[1]) * 1.5}px`,
                      borderColor: planet.ringColor,
                      animation: `ringRotate 4s linear infinite reverse`,
                      transform: 'rotateX(75deg)'
                    }}
                  />
                </div>

                {/* 3D Planet - NO SELF ROTATION */}
                <button
                  onClick={() => setCurrentPage(planet.page)}
                  className={`${planet.size} rounded-full shadow-2xl transform transition-all duration-500 hover:scale-125 cursor-pointer group relative z-10`}
                  style={{
                    background: `radial-gradient(circle at 25% 25%, ${planet.color}ff, ${planet.color}dd, ${planet.color}88, ${planet.color}44)`,
                    boxShadow: `0 0 40px ${planet.color}88, inset -8px -8px 16px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.2)`
                  }}
                >
                  {/* Planet Surface Details - NO ROTATION */}
                  <div className="absolute inset-1 rounded-full opacity-30"
                       style={{ 
                         background: `radial-gradient(circle at 70% 30%, transparent 30%, ${planet.color}66 50%, transparent 70%)`
                       }}>
                  </div>
                  
                  {/* Planet Continents/Features - NO ROTATION */}
                  <div className="absolute inset-2 rounded-full opacity-20"
                       style={{ 
                         background: `radial-gradient(circle at 40% 60%, ${planet.color}aa 20%, transparent 40%)`
                       }}>
                  </div>

                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <span className="text-white font-black text-xl group-hover:text-2xl transition-all duration-300 text-center px-2 drop-shadow-lg leading-tight">
                      {planet.name}
                    </span>
                  </div>
                  
                  {/* Planet Atmosphere */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle, ${planet.color}44, transparent 70%)`,
                      transform: 'scale(1.3)',
                      filter: 'blur(6px)'
                    }}
                  />
                  
                  {/* Planet Highlight on Hover */}
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-white opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                    style={{ transform: 'scale(1.1)' }}
                  />
                </button>
              </div>
            ))}

            {/* Floating Space Elements */}
            <div className="absolute top-20 left-10 text-5xl z-10" style={{ animation: 'float 8s ease-in-out infinite' }}>
              🛸
            </div>
            <div className="absolute top-32 right-20 text-4xl z-10" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>
              🌙
            </div>
            <div className="absolute bottom-20 left-20 text-3xl z-10" style={{ animation: 'twinkle 3s ease-in-out infinite', animationDelay: '2s' }}>
              ⭐
            </div>
            <div className="absolute bottom-32 right-10 text-5xl z-10" style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '3s' }}>
              🪐
            </div>
            <div className="absolute top-1/4 right-1/3 text-4xl z-10" style={{ animation: 'twinkle 4s ease-in-out infinite', animationDelay: '4s' }}>
              ☄️
            </div>

            {/* Shooting Stars */}
            <div className="absolute top-1/4 left-0 w-3 h-3 bg-white rounded-full z-10" style={{ animation: 'shootingStar 8s linear infinite', animationDelay: '5s' }} />
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-yellow-300 rounded-full z-10" style={{ animation: 'shootingStar 6s linear infinite', animationDelay: '7s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-blue-300 rounded-full z-10" style={{ animation: 'shootingStar 10s linear infinite', animationDelay: '9s' }} />

            {/* Distant Nebula */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 z-0">
              <div className="w-[800px] h-[800px] bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentPage()}
      <style jsx>{`
        /* Horizontal Orbital Animations */
        @keyframes horizontalOrbit-math {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(200px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(200px) rotate(-360deg); }
        }
        
        @keyframes horizontalOrbit-sinhala {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(320px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(320px) rotate(-360deg); }
        }
        
        @keyframes horizontalOrbit-english {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        
        @keyframes horizontalOrbit-science {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(420px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(420px) rotate(-360deg); }
        }

        /* Ring Rotation */
        @keyframes ringRotate {
          0% { transform: rotateX(75deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateZ(360deg); }
        }

        /* Sun Rotation */
        @keyframes sunRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        /* Twinkling Animation */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Shooting Star Animation */
        @keyframes shootingStar {
          0% { transform: translateX(-100px) translateY(0px) scale(0); opacity: 0; }
          10% { opacity: 1; transform: scale(1); }
          90% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 100px)) translateY(-200px) scale(0); opacity: 0; }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* 3D Perspective for better depth */
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </>
  );
};

export default HomePage;