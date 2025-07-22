import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveGameScore } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const DyspraxiaGamePage = ({ onBack }) => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStar, setCurrentStar] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [starPositions, setStarPositions] = useState([]);
  const [activeStarIndex, setActiveStarIndex] = useState(-1);
  const [isFlashing, setIsFlashing] = useState(false);
  const [responses, setResponses] = useState([]);
  const [starStartTime, setStarStartTime] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [missedClicks, setMissedClicks] = useState(0);
  const audioRef = useRef(null);
  const [showEndingVideo, setShowEndingVideo] = useState(false);
  const videoRef = useRef(null);

  // Game configuration for each level
  const gameConfig = {
    1: { starCount: 3, flashDuration: 3000, totalStars: 5 },
    2: { starCount: 5, flashDuration: 2000, totalStars: 8 },
    3: { starCount: 7, flashDuration: 1500, totalStars: 10 }
  };

  const currentConfig = gameConfig[currentLevel];

  // Audio effects using Web Audio API
  const playCorrectSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Happy ascending melody
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1 + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + index * 0.1);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + 0.3 + index * 0.1);
    });
  };

  const playWrongSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Descending sad melody
    const frequencies = [440, 392, 349.23]; // A4, G4, F4
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1 + index * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4 + index * 0.15);
      
      oscillator.start(audioContext.currentTime + index * 0.15);
      oscillator.stop(audioContext.currentTime + 0.4 + index * 0.15);
    });
  };

  const playTimeoutSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Low buzzing sound for timeout
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  };

  // Generate random star positions
  const generateStarPositions = (count) => {
    const positions = [];
    const minDistance = 80; // Minimum distance between stars
    const margin = 60; // Margin from edges
    
    for (let i = 0; i < count; i++) {
      let position;
      let attempts = 0;
      
      do {
        position = {
          x: margin + Math.random() * (window.innerWidth - 2 * margin),
          y: margin + Math.random() * (window.innerHeight - margin - 100),
          id: i
        };
        attempts++;
      } while (
        attempts < 50 && 
        positions.some(pos => 
          Math.sqrt(Math.pow(pos.x - position.x, 2) + Math.pow(pos.y - position.y, 2)) < minDistance
        )
      );
      
      positions.push(position);
    }
    
    return positions;
  };

  // Timer effect for star flashing
  useEffect(() => {
    if (gameStarted && !gameCompleted && activeStarIndex >= 0 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && activeStarIndex >= 0) {
      handleStarTimeout();
    }
  }, [timeLeft, gameStarted, gameCompleted, activeStarIndex]);

  // Flash effect
  useEffect(() => {
    if (activeStarIndex >= 0 && gameStarted && !gameCompleted) {
      const flashInterval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 300); // Flash every 300ms
      
      return () => clearInterval(flashInterval);
    }
  }, [activeStarIndex, gameStarted, gameCompleted]);

  useEffect(() => {
    if (showEndingVideo && videoRef.current) {
      const videoEl = videoRef.current;
      if (videoEl.requestFullscreen) {
        videoEl.requestFullscreen().catch((e) => console.warn("Fullscreen failed", e));
      }
    }
  }, [showEndingVideo]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentStar(0);
    setScore(0);
    setResponses([]);
    setMissedClicks(0);
    setShowResult(false);
    
    // Generate star positions
    const positions = generateStarPositions(currentConfig.starCount);
    setStarPositions(positions);
    
    // Start first star
    startNextStar();
  };

  const startNextStar = () => {
    if (currentStar >= currentConfig.totalStars) {
      completeLevel();
      return;
    }
    
    // Random star position
    const randomIndex = Math.floor(Math.random() * currentConfig.starCount);
    setActiveStarIndex(randomIndex);
    setIsFlashing(true);
    setTimeLeft(currentConfig.flashDuration);
    setStarStartTime(Date.now());
  };

  const handleStarClick = (starIndex) => {
    if (!gameStarted || gameCompleted || activeStarIndex < 0) return;
    
    const reactionTime = starStartTime ? Date.now() - starStartTime : 0;
    const isCorrect = starIndex === activeStarIndex;
    
    if (isCorrect) {
      playCorrectSound();
      setScore(score + 1);
      setResultType('correct');
    } else {
      playWrongSound();
      setMissedClicks(prev => prev + 1);
      setResultType('wrong');
    }
    
    // Record response
    setResponses(prev => [...prev, {
      starNumber: currentStar + 1,
      targetStarIndex: activeStarIndex,
      clickedStarIndex: starIndex,
      reactionTime: reactionTime,
      isCorrect: isCorrect,
      timeRemaining: timeLeft
    }]);
    
    setShowResult(true);
    setActiveStarIndex(-1);
    setIsFlashing(false);
    
    setTimeout(() => {
      setShowResult(false);
      setCurrentStar(prev => prev + 1);
      startNextStar();
    }, 1000);
  };

  const handleStarTimeout = () => {
    playTimeoutSound();
    setMissedClicks(prev => prev + 1);
    setResultType('timeout');
    
    // Record timeout response
    setResponses(prev => [...prev, {
      starNumber: currentStar + 1,
      targetStarIndex: activeStarIndex,
      clickedStarIndex: -1,
      reactionTime: currentConfig.flashDuration,
      isCorrect: false,
      timeRemaining: 0,
      timeout: true
    }]);
    
    setShowResult(true);
    setActiveStarIndex(-1);
    setIsFlashing(false);
    
    setTimeout(() => {
      setShowResult(false);
      setCurrentStar(prev => prev + 1);
      startNextStar();
    }, 1000);
  };

  const handleBackgroundClick = (e) => {
    // Only count as wrong click if clicking on background, not on stars
    if (e.target.classList.contains('game-background') && activeStarIndex >= 0) {
      handleStarClick(-1); // -1 indicates background click
    }
  };

  const completeLevel = () => {
  if (currentLevel === 3) {
    setShowEndingVideo(true) // show the ending video only after level 3
  } else {
    setGameCompleted(true)
  }
  
  // Save game results to Firestore
  const saveResults = async () => {
    if (user?.uid) {
      const analysis = getDyspraxiaAnalysis();
      const gameData = {
        gameType: 'Dyspraxia',
        level: currentLevel,
        score: score,
        accuracy: analysis.accuracy,
        averageReactionTime: analysis.averageReactionTime,
        timeoutRate: analysis.timeoutRate,
        riskLevel: analysis.riskLevel,
        totalQuestions: currentConfig.totalStars,
        correctAnswers: score,
        responses: responses,
        completedAt: new Date().toISOString()
      };
      
      try {
        await saveGameScore(user.uid, 'Dyspraxia', score, Date.now(), gameData);
        console.log('Dyspraxia game results saved successfully');
      } catch (error) {
        console.error('Failed to save Dyspraxia game results:', error);
      }
    }
  };
  
  saveResults();
}
  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setGameStarted(false);
      setGameCompleted(false);
      setCurrentStar(0);
      setScore(0);
      setResponses([]);
      setMissedClicks(0);
      setActiveStarIndex(-1);
      setIsFlashing(false);
      setShowResult(false);
    }
  };

  const restartGame = () => {
    setCurrentLevel(1);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentStar(0);
    setScore(0);
    setResponses([]);
    setMissedClicks(0);
    setActiveStarIndex(-1);
    setIsFlashing(false);
    setShowResult(false);
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'ආරම්භක මට්ටම - 3 තරු, 3 තත්පර',
      2: 'මධ්‍යම මට්ටම - 5 තරු, 2 තත්පර',
      3: 'උසස් මට්ටම - 7 තරු, 1.5 තත්පර'
    };
    return descriptions[level];
  };

  const getDyspraxiaAnalysis = () => {
    const totalResponses = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const timeoutResponses = responses.filter(r => r.timeout).length;
    const averageReactionTime = responses
      .filter(r => r.isCorrect)
      .reduce((sum, r) => sum + r.reactionTime, 0) / Math.max(correctResponses, 1);
    
    const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;
    const timeoutRate = totalResponses > 0 ? (timeoutResponses / totalResponses) * 100 : 0;
    
    let riskLevel = 'Not Danger';
    let riskLevelSinhala = 'අවදානමක් නැත';
    let analysis = '';
    let recommendations = [];
    
    // Dyspraxia risk assessment
    const reactionThreshold = currentLevel === 1 ? 1500 : currentLevel === 2 ? 1200 : 1000;
    
    if (accuracy < 50 || averageReactionTime > reactionThreshold * 1.5 || timeoutRate > 40) {
      riskLevel = 'Danger';
      riskLevelSinhala = 'අවදානම';
      analysis = 'දෘශ්‍ය-මෝටර් සම්බන්ධීකරණය, ප්‍රතික්‍රියා කාලය සහ අවධානය යොමු කිරීමේ සැලකිය යුතු දුෂ්කරතා ඩිස්ප්‍රැක්සියා අවදානමක් යෝජනා කරයි.';
      recommendations = [
        'දෘශ්‍ය-මෝටර් සම්බන්ධීකරණ අභ්‍යාස',
        'සියුම් මෝටර් කුසලතා වර්ධන ක්‍රියාකාරකම්',
        'අවධානය යොමු කිරීමේ අභ්‍යාස',
        'වෘත්තීය ප්‍රතිකාර විශේෂඥයෙකු සම්බන්ධ කරගන්න',
        'නිතිපතා සංවේදී මෝටර් අභ්‍යාස'
      ];
    } else if (accuracy < 70 || averageReactionTime > reactionThreshold || timeoutRate > 25) {
      riskLevel = 'Less Danger';
      riskLevelSinhala = 'අඩු අවදානම';
      analysis = 'දෘශ්‍ය සැකසීම සහ මෝටර් ප්‍රතිචාරවල සමහර අභියෝග. ඉලක්කගත අභ්‍යාස සමඟ වැඩිදියුණු කළ හැක.';
      recommendations = [
        'ඉලක්ක කරන ක්‍රීඩා නිතිපතා කරන්න',
        'අත්-ඇස් සම්බන්ධීකරණ අභ්‍යාස',
        'ප්‍රතික්‍රියා කාල වැඩිදියුණු කිරීමේ ක්‍රියාකාරකම්',
        'දෘශ්‍ය අවධානය වර්ධන අභ්‍යාස',
        'ප්‍රගතිය නිරීක්ෂණය කරන්න'
      ];
    } else {
      riskLevel = 'Not Danger';
      riskLevelSinhala = 'අවදානමක් නැත';
      analysis = 'හොඳ දෘශ්‍ය-මෝටර් සම්බන්ධීකරණය සහ ප්‍රතික්‍රියා කාලය. සාමාන්‍ය වර්ධනයක් පෙන්නුම් කරයි.';
      recommendations = [
        'වර්තමාන කුසලතා පවත්වාගෙන යන්න',
        'වඩාත් අභියෝගාත්මක ක්‍රියාකාරකම් උත්සාහ කරන්න',
        'ක්‍රීඩා සහ ශාරීරික ක්‍රියාකාරකම් දිරිමත් කරන්න',
        'සියුම් මෝටර් කුසලතා දිගටම වර්ධනය කරන්න'
      ];
    }
    
    return { 
      accuracy, 
      averageReactionTime, 
      timeoutRate, 
      riskLevel, 
      riskLevelSinhala,
      analysis, 
      recommendations 
    };
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black relative overflow-hidden">
        {/* Animated background stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * window.innerHeight + 'px',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 2 + 2 + 's',
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center text-white max-w-2xl w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">තරු රටා ක්‍රීඩාව</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 px-4">දිලිසෙන තරු ක්ලික් කර ඔබේ ප්‍රතික්‍රියා වේගය පරීක්ෂා කරන්න!</p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">මට්ටම {currentLevel}</h2>
              <p className="text-lg sm:text-xl mb-4 sm:mb-6">{getLevelDescription(currentLevel)}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">තරු ගණන</div>
                  <div className="text-xl sm:text-2xl font-bold">{currentConfig.starCount}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">ක්ලික් කිරීමට කාලය</div>
                  <div className="text-xl sm:text-2xl font-bold">{currentConfig.flashDuration / 1000}තත්</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">මුළු තරු</div>
                  <div className="text-xl sm:text-2xl font-bold">{currentConfig.totalStars}</div>
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">ක්‍රීඩා කරන ආකාරය</h3>
                <ul className="text-left space-y-1 sm:space-y-2 max-w-md mx-auto text-sm sm:text-base">
                  <li>• දිලිසෙන තරුව ක්ලික් කරන්න</li>
                  <li>• හැකි ඉක්මනින් ප්‍රතිචාර දක්වන්න</li>
                  <li>• වැරදි තරුවක් ක්ලික් නොකරන්න</li>
                  <li>• කාලය ඉකුත්වීමට පෙර ක්ලික් කරන්න</li>
                  <li>• 🎵 නිවැරදි/වැරදි සඳහා ශබ්ද ප්‍රතිපෝෂණ</li>
                </ul>
              </div>
              
              <button
                onClick={startGame}
                className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                🚀 ක්‍රීඩාව ආරම්භ කරන්න
              </button>
            </div>
            
            <button
              onClick={onBack}
              className="bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-300 text-sm sm:text-base"
            >
              ← ආපසු යන්න
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showEndingVideo) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <video
        src="/images/GameComplete.mp4" 
        autoPlay
        playsInline
        onEnded={onBack}
        className="w-screen h-screen object-cover"
      />
    </div>
  )
}

  if (gameCompleted) {
    const analysis = getDyspraxiaAnalysis();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black relative overflow-hidden">
        {/* Background stars */}
        <div className="absolute inset-0" style={{paddingBottom:'250px'}}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * window.innerHeight*0.5 + 'px',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                opacity: Math.random() * 0.6 + 0.2
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center text-white max-w-3xl w-full">
            <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">
              {analysis.riskLevel === 'Not Danger' ? '🎉' : analysis.riskLevel === 'Less Danger' ? '⚠️' : '🔍'}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">මට්ටම {currentLevel} සම්පූර්ණයි!</h1>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">ලකුණු</div>
                  <div className="text-2xl sm:text-3xl font-bold">{score}/{currentConfig.totalStars}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">නිරවද්‍යතාව</div>
                  <div className="text-2xl sm:text-3xl font-bold">{analysis.accuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">සාමාන්‍ය ප්‍රතික්‍රියා</div>
                  <div className="text-lg sm:text-xl font-bold">{(analysis.averageReactionTime / 1000).toFixed(1)}තත්</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">අවදානම් මට්ටම</div>
                  <div className={`text-lg sm:text-xl font-bold ${
                    analysis.riskLevel === 'අඩු' ? 'text-green-300' : 
                    analysis.riskLevel === 'මධ්‍යම' ? 'text-yellow-300' : 'text-red-300'
                  }`}>
                    {analysis.riskLevel}
                  </div>
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/10 rounded-lg text-left">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">ඩිස්ප්‍රැක්සියා තක්සේරු විශ්ලේෂණය</h3>
                <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4">{analysis.analysis}</p>
                
                <h4 className="text-base sm:text-lg font-bold mb-2">නිර්දේශ:</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-xs sm:text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
                {currentLevel < 3 && (
                  <button
                    onClick={nextLevel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
                  >
                    ඊළඟ මට්ටම →
                  </button>
                )}
                
                <button
                  onClick={restartGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
                  >
                    🔄 නැවත ආරම්භ කරන්න
                  </button>
                
                <button
                  onClick={onBack}
                  className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
              analysis.riskLevel === 'Not Danger' ? 'text-green-300' : 
              analysis.riskLevel === 'Less Danger' ? 'text-yellow-300' : 'text-red-300'
                </button>
              {analysis.riskLevelSinhala}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black relative overflow-hidden game-background"
      onClick={handleBackgroundClick}
    >
      {/* Background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * window.innerHeight + 'px',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              opacity: Math.random() * 0.4 + 0.1
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 p-3 sm:p-6 flex justify-between items-center text-white">
        <div className="text-left">
          <div className="text-sm sm:text-base md:text-lg font-bold">මට්ටම {currentLevel}</div>
          <div className="text-xs sm:text-sm opacity-80">තරුව {currentStar + 1}/{currentConfig.totalStars}</div>
        </div>
        <div className="text-center">
            <button
              onClick={onBack}
              className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-xs sm:text-sm"
            >
              🚪 ඉවත්වන්න
            </button>
          </div> 
        <div className="text-right">
          <div className="text-sm sm:text-base md:text-lg font-bold">ලකුණු: {score}</div>
          <div className={`text-lg sm:text-xl md:text-2xl font-bold ${timeLeft <= 1000 ? 'text-red-300 animate-pulse' : ''}`}>
            ⏰ {(timeLeft / 1000).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-20 px-4 sm:px-6">
        <div className="w-full bg-white/20 rounded-full h-2 sm:h-3">
          <div 
            className="bg-white h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentStar + 1) / currentConfig.totalStars) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Game Stars */}
      <div className="relative z-10 w-full h-full">
        {starPositions.map((position, index) => (
          <button
            key={position.id}
            onClick={(e) => {
              e.stopPropagation();
              handleStarClick(index);
            }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
              index === activeStarIndex && isFlashing
                ? 'text-yellow-300 animate-pulse scale-125 drop-shadow-lg'
                : 'text-white/60 scale-100'
            } ${
              index === activeStarIndex 
                ? 'cursor-pointer hover:scale-150' 
                : 'cursor-default'
            }`}
            style={{
              left: `${Math.min(Math.max(position.x, 40), window.innerWidth - 40)}px`,
              top: `${Math.min(Math.max(position.y, 100), window.innerHeight - 100)}px`,
              fontSize: index === activeStarIndex && isFlashing ? '5rem' : '3.5rem',
              filter: index === activeStarIndex && isFlashing 
                ? 'drop-shadow(0 0 20px #fbbf24) drop-shadow(0 0 40px #f59e0b)' 
                : 'none',
              textShadow: index === activeStarIndex && isFlashing 
                ? '0 0 20px #fbbf24, 0 0 40px #f59e0b, 0 0 60px #d97706' 
                : 'none'
            }}
            disabled={index !== activeStarIndex}
          >
            ⭐
          </button>
        ))}
      </div>

      {/* Result Display */}
      {showResult && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className={`text-6xl sm:text-7xl md:text-8xl font-bold animate-bounce ${
            resultType === 'correct' ? 'text-green-400' : 
            resultType === 'wrong' ? 'text-red-400' : 'text-orange-400'
          }`}>
            {resultType === 'correct' ? '✅' : 
             resultType === 'wrong' ? '❌' : '⏰'}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center z-20">
        <div className="text-xs sm:text-sm opacity-80 px-6">
          දිලිසෙන තරුව හැකි ඉක්මනින් ක්ලික් කරන්න!
        </div>
      </div>
    </div>
  );
};

export default DyspraxiaGamePage;