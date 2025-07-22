import React, { useState } from 'react';
import DysgraphiaGamePage from './games/DysgraphiaGamePage';
import DyspraxiaGamePage from './games/DyspraxiaGamePage';
import DyscalculiaGamePage from './games/DyscalculiaGamePage';
import DyslexiaGamePage from './games/DyslexiaGamePage';
import ProfilePage from './ProfilePage';

const HomePage = ({ onLogout, user }) => {
  const [currentPage, setCurrentPage] = useState('home');

  const planets = [
    {
      id: 'Dysgraphia',
      name: 'අකුරු මාරු',
      color: '#FF6B6B',
      size: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24',
      orbitRadius: { mobile: 80, tablet: 120, desktop: 200 },
      orbitSpeed: 20,
      page: 'Dysgraphia',
      ringColor: '#FF9999'
    },
    {
      id: 'Dyspraxia',
      name: 'තරු රටා',
      color: '#4ECDC4',
      size: 'w-18 h-18 sm:w-24 sm:h-24 lg:w-28 lg:h-28',
      orbitRadius: { mobile: 140, tablet: 200, desktop: 320 },
      orbitSpeed: 15,
      page: 'Dyspraxia',
      ringColor: '#7EEEE6'
    },
    {
      id: 'Dyscalculia',
      name: 'ලොකු පොඩි',
      color: '#B2B7D1',
      size: 'w-18 h-18 sm:w-24 sm:h-24 lg:w-28 lg:h-28',
      orbitRadius: { mobile: 60, tablet: 80, desktop: 120 },
      orbitSpeed: 25,
      page: 'Dyscalculia',
      ringColor: '#78C5E8'
    },
    {
      id: 'Dyslexia',
      name: 'හෝඩිපොත',
      color: '#F9CA24',
      size: 'w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32',
      orbitRadius: { mobile: 180, tablet: 280, desktop: 420 },
      orbitSpeed: 12,
      page: 'Dyslexia',
      ringColor: '#FDD757'
    }
  ];

  const handlePlanetClick = (planetPage) => {
    setCurrentPage(planetPage);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'Dysgraphia':
        return <DysgraphiaGamePage onBack={() => setCurrentPage('home')} />;
      case 'Dyspraxia':
        return <DyspraxiaGamePage onBack={() => setCurrentPage('home')} />;
      case 'Dyscalculia':
        return <DyscalculiaGamePage onBack={() => setCurrentPage('home')} />;
      case 'Dyslexia':
        return <DyslexiaGamePage onBack={() => setCurrentPage('home')} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} user={user} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden">
            {/* Stars Background */}
            <div className="absolute inset-0 z-0">
              {[...Array(150)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: Math.random() * 2 + 1 + 'px',
                    height: Math.random() * 2 + 1 + 'px',
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-radial from-yellow-200 via-orange-400 to-red-500 rounded-full shadow-2xl relative"
                   style={{ 
                     boxShadow: '0 0 30px #FFA500, 0 0 60px #FF6347, 0 0 90px #FF4500',
                     animation: 'sunRotate 10s linear infinite'
                   }}>
                {/* Sun surface details */}
                <div className="absolute inset-1 sm:inset-2 bg-gradient-radial from-yellow-100 via-orange-300 to-transparent rounded-full animate-pulse"></div>
                <div className="absolute inset-2 sm:inset-4 bg-gradient-radial from-white via-yellow-200 to-transparent rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
              </div>
              {/* Sun corona */}
              <div className="absolute inset-0 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 transform -translate-x-1/4 -translate-y-1/4 bg-gradient-radial from-orange-300/20 via-yellow-200/10 to-transparent rounded-full animate-pulse"></div>
            </div>

            {/* Responsive Orbital Paths */}
            {planets.map((planet) => (
              <React.Fragment key={`orbit-group-${planet.id}`}>
                {/* Mobile orbit */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded-full opacity-40 z-5 sm:hidden"
                  style={{
                    width: planet.orbitRadius.mobile * 2 + 'px',
                    height: planet.orbitRadius.mobile * 2 + 'px',
                  }}
                />
                {/* Tablet orbit */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded-full opacity-40 z-5 hidden sm:block lg:hidden"
                  style={{
                    width: planet.orbitRadius.tablet * 2 + 'px',
                    height: planet.orbitRadius.tablet * 2 + 'px',
                  }}
                />
                {/* Desktop orbit */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded-full opacity-40 z-5 hidden lg:block"
                  style={{
                    width: planet.orbitRadius.desktop * 2 + 'px',
                    height: planet.orbitRadius.desktop * 2 + 'px',
                  }}
                />
              </React.Fragment>
            ))}

            {/* Header */}
            <header className="relative z-50 p-3 sm:p-6 flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Logo or title can go here */}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 shadow-lg text-sm sm:text-base"
                >
                  <span>👤</span>
                  <span className="font-semibold hidden sm:inline">Profile</span>
                </button>
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">ඉවත්වන්න</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 animate-pulse drop-shadow-lg">
                   ගගනගාමී ලෝකයට සාදරයෙන් පිළිගනිමු! 
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 drop-shadow-md px-4">
                  ඔබේ ඉගෙනුම් ගමන ආරම්භ කිරීමට ග්‍රහලෝකයක් තෝරන්න
                </p>
              </div>
            </div>

            {/* 3D Orbiting Planet Buttons with Responsive Rings */}
            {planets.map((planet, index) => (
              <div
                key={planet.id}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                style={{
                  animation: `horizontalOrbit-${planet.id} ${planet.orbitSpeed}s linear infinite`,
                  animationDelay: `${index * 2}s`
                }}
              >
                {/* Planet Ring System - Responsive */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  {/* Outer Ring */}
                  <div 
                    className="absolute border-2 rounded-full opacity-60 hidden sm:block"
                    style={{
                      width: `${parseInt(planet.size.split(' ')[0].split('-')[1]) * 6}px`,
                      height: `${parseInt(planet.size.split(' ')[0].split('-')[1]) * 1.5}px`,
                      borderColor: planet.ringColor,
                      animation: `ringRotate 6s linear infinite`,
                      transform: 'rotateX(75deg)'
                    }}
                  />
                  {/* Inner Ring */}
                  <div 
                    className="absolute border rounded-full opacity-40 hidden sm:block"
                    style={{
                      width: `${parseInt(planet.size.split(' ')[0].split('-')[1]) * 4}px`,
                      height: `${parseInt(planet.size.split(' ')[0].split('-')[1]) * 1}px`,
                      borderColor: planet.ringColor,
                      animation: `ringRotate 4s linear infinite reverse`,
                      transform: 'rotateX(75deg)'
                    }}
                  />
                </div>

                {/* 3D Planet Button - Responsive */}
                <button
                  onClick={() => handlePlanetClick(planet.page)}
                  className={`${planet.size} rounded-full shadow-2xl transform transition-all duration-500 hover:scale-110 sm:hover:scale-125 cursor-pointer group relative z-40 pointer-events-auto`}
                  style={{
                    background: `radial-gradient(circle at 25% 25%, ${planet.color}ff, ${planet.color}dd, ${planet.color}88, ${planet.color}44)`,
                    boxShadow: `0 0 20px ${planet.color}88, inset -4px -4px 8px rgba(0,0,0,0.4), inset 2px 2px 4px rgba(255,255,255,0.2)`
                  }}
                >
                  {/* Planet Surface Details */}
                  <div className="absolute inset-1 rounded-full opacity-30 pointer-events-none"
                       style={{ 
                         background: `radial-gradient(circle at 70% 30%, transparent 30%, ${planet.color}66 50%, transparent 70%)`
                       }}>
                  </div>
                  
                  {/* Planet Continents/Features */}
                  <div className="absolute inset-1 sm:inset-2 rounded-full opacity-20 pointer-events-none"
                       style={{ 
                         background: `radial-gradient(circle at 40% 60%, ${planet.color}aa 20%, transparent 40%)`
                       }}>
                  </div>

                  <div className="w-full h-full flex items-center justify-center relative z-50 pointer-events-none">
                    <span className="text-white font-black text-xs sm:text-sm md:text-lg lg:text-xl group-hover:text-sm sm:group-hover:text-lg md:group-hover:text-xl lg:group-hover:text-2xl transition-all duration-300 text-center px-1 sm:px-2 drop-shadow-lg leading-tight">
                      {planet.name}
                    </span>
                  </div>
                  
                  {/* Planet Atmosphere */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle, ${planet.color}44, transparent 70%)`,
                      transform: 'scale(1.3)',
                      filter: 'blur(3px) sm:blur(6px)'
                    }}
                  />
                  
                  {/* Planet Highlight on Hover */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 sm:border-4 border-white opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                    style={{ transform: 'scale(1.1)' }}
                  />
                </button>
              </div>
            ))}

            {/* Floating Space Elements - Responsive */}
            <div className="absolute top-16 sm:top-20 left-4 sm:left-10 text-3xl sm:text-4xl md:text-5xl z-10" style={{ animation: 'float 8s ease-in-out infinite' }}>
              🛸
            </div>
            <div className="absolute top-20 sm:top-32 right-8 sm:right-20 text-2xl sm:text-3xl md:text-4xl z-10" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>
              🌙
            </div>
            <div className="absolute bottom-16 sm:bottom-20 left-8 sm:left-20 text-2xl sm:text-3xl z-10" style={{ animation: 'twinkle 3s ease-in-out infinite', animationDelay: '2s' }}>
              ⭐
            </div>
            <div className="absolute bottom-20 sm:bottom-32 right-4 sm:right-10 text-3xl sm:text-4xl md:text-5xl z-10" style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '3s' }}>
              🪐
            </div>
            <div className="absolute top-1/4 right-1/3 text-2xl sm:text-3xl md:text-4xl z-10" style={{ animation: 'twinkle 4s ease-in-out infinite', animationDelay: '4s' }}>
              ☄️
            </div>

            {/* Shooting Stars - Responsive */}
            <div className="absolute top-1/4 left-0 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full z-10" style={{ animation: 'shootingStar 8s linear infinite', animationDelay: '5s' }} />
            <div className="absolute top-1/2 right-0 w-1 h-1 sm:w-2 sm:h-2 bg-yellow-300 rounded-full z-10" style={{ animation: 'shootingStar 6s linear infinite', animationDelay: '7s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-blue-300 rounded-full z-10" style={{ animation: 'shootingStar 10s linear infinite', animationDelay: '9s' }} />

            {/* Distant Nebula - Responsive */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 z-0">
              <div className="w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
            </div>
          </div>
        );
    }
  };

  return (









    <div>
      {renderCurrentPage()}
    </div>
  );
};

export default HomePage;