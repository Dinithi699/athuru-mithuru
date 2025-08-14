import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveGameScore } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const DyslexiaGamePage = ({ onBack }) => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [responses, setResponses] = useState([]);
  const [showEndingVideo, setShowEndingVideo] = useState(false);
  const videoRef = useRef(null);

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

  // Game data for each level
  const gameData = {
    1: [
      { letter1: 'a', letter2: 'a', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'm', letter2: 'n', correct: 'Different', description: 'වෙනස් අකුරු' },
      { letter1: 'c', letter2: 'c', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'o', letter2: 'a', correct: 'Different', description: 'වෙනස් අකුරු' },
      { letter1: 'e', letter2: 'e', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'i', letter2: 'l', correct: 'Different', description: 'වෙනස් අකුරු' },
      { letter1: 's', letter2: 's', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'f', letter2: 't', correct: 'Different', description: 'වෙනස් අකුරු' }
    ],
    2: [
      { letter1: 'b', letter2: 'd', correct: 'Different', description: 'ප්‍රතිලෝම අකුරු' },
      { letter1: 'p', letter2: 'q', correct: 'Different', description: 'ප්‍රතිලෝම අකුරු' },
      { letter1: 'n', letter2: 'u', correct: 'Different', description: 'ප්‍රතිලෝම අකුරු' },
      { letter1: 'w', letter2: 'm', correct: 'Different', description: 'ප්‍රතිලෝම අකුරු' },
      { letter1: 'b', letter2: 'b', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'd', letter2: 'd', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'p', letter2: 'p', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'q', letter2: 'q', correct: 'Similar', description: 'එකම අකුරු' }
    ],
    3: [
      { letter1: 'g', letter2: 'q', correct: 'Different', description: 'සමාන පෙනුමක් ඇති වෙනස් අකුරු' },
      { letter1: 'h', letter2: 'n', correct: 'Different', description: 'සමාන පෙනුමක් ඇති වෙනස් අකුරු' },
      { letter1: 'r', letter2: 'n', correct: 'Different', description: 'සමාන පෙනුමක් ඇති වෙනස් අකුරු' },
      { letter1: 'a', letter2: 'o', correct: 'Different', description: 'සමාන පෙනුමක් ඇති වෙනස් අකුරු' },
      { letter1: 'g', letter2: 'g', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'h', letter2: 'h', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'r', letter2: 'r', correct: 'Similar', description: 'එකම අකුරු' },
      { letter1: 'v', letter2: 'w', correct: 'Different', description: 'සමාන පෙනුමක් ඇති වෙනස් අකුරු' }
    ]
  };

  const currentQuestions = gameData[currentLevel];
  const totalQuestions = currentQuestions.length;

  const getPerformanceAnalysis = useCallback(() => {
    const totalResponses = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const averageTime = responses.reduce((sum, r) => sum + r.timeTaken, 0) / totalResponses;
    const accuracy = (correctResponses / totalResponses) * 100;
    
    let riskLevel = 'Not Danger';
    let riskLevelSinhala = 'අවදානමක් නැත';
    let analysis = '';
    
    if (accuracy < 50) {
      riskLevel = 'Danger';
      riskLevelSinhala = 'අවදානම';
      analysis = 'අවධානය අවශ්‍යයි. දෘශ්‍ය වෙනස්කම් හඳුනාගැනීමේ සැලකිය යුතු දුෂ්කරතා ඩිස්ලෙක්සියා අවදානමක් යෝජනා කරයි.';
    } else if (accuracy < 70) {
      riskLevel = 'Less Danger';
      riskLevelSinhala = 'අඩු අවදානම';
      analysis = 'සාමාන්‍ය කාර්ය සාධනය. දෘශ්‍ය වෙනස්කම් හඳුනාගැනීමේ සුළු දුෂ්කරතා ඇත. අමතර අභ්‍යාස ප්‍රයෝජනවත් වේ.';
    } else {
      analysis = 'විශිෂ්ට කාර්ය සාධනය! දෘශ්‍ය වෙනස්කම් හඳුනාගැනීමේ හැකියාව හොඳයි.';
    }
    
    return {
      accuracy,
      averageTime,
      riskLevel,
      riskLevelSinhala,
      analysis
    };
  }, [responses]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(10);
    } else {
      completeLevel();
    }
  }, [currentQuestion, totalQuestions, completeLevel]);

  // Timer effect
  const handleTimeUp = useCallback(() => {
    playTimeoutSound();
    setResponses(prev => [...prev, {
      question: currentQuestion,
      userAnswer: null,
      correct: currentQuestions[currentQuestion].correct,
      timeTaken: 10,
      isCorrect: false
    }]);
    nextQuestion();
  }, [currentQuestion, currentQuestions, nextQuestion]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, gameCompleted, showResult, handleTimeUp]);

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
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(10);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestions[currentQuestion].correct;
    const timeTaken = 10 - timeLeft;
    
    // Play audio feedback
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      userAnswer: answer,
      correct: currentQuestions[currentQuestion].correct,
      timeTaken: timeTaken,
      isCorrect: isCorrect
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const completeLevel = useCallback(() => {
    // Save current level results
    const saveCurrentLevelResults = async () => {
      if (user?.uid) {
        const analysis = getPerformanceAnalysis();
        const levelData = {
          level: currentLevel,
          score: score,
          accuracy: analysis.accuracy,
          averageTime: analysis.averageTime,
          riskLevel: analysis.riskLevel,
          totalQuestions: totalQuestions,
          correctAnswers: score,
          responses: responses,
          completedAt: new Date().toISOString()
        };
        
        // Get existing game record or create new one
        try {
          const existingData = JSON.parse(localStorage.getItem(`Dyslexia_${user.uid}`) || '{}');
          existingData.gameType = 'Dyslexia';
          existingData.userId = user.uid;
          existingData.lastUpdated = new Date().toISOString();
          existingData.levels = existingData.levels || {};
          existingData.levels[`level${currentLevel}`] = levelData;
          
          // Calculate overall game statistics
          const allLevels = Object.values(existingData.levels);
          const totalScore = allLevels.reduce((sum, level) => sum + level.score, 0);
          const totalQuestionsAll = allLevels.reduce((sum, level) => sum + level.totalQuestions, 0);
          const overallAccuracy = allLevels.reduce((sum, level) => sum + level.accuracy, 0) / allLevels.length;
          const overallAvgTime = allLevels.reduce((sum, level) => sum + level.averageTime, 0) / allLevels.length;
          
          // Determine overall risk level
          let overallRiskLevel = 'Not Danger';
          if (overallAccuracy < 50) overallRiskLevel = 'Danger';
          else if (overallAccuracy < 70) overallRiskLevel = 'Less Danger';
          
          existingData.overallStats = {
            totalScore,
            totalQuestions: totalQuestionsAll,
            overallAccuracy,
            overallAvgTime,
            overallRiskLevel,
            levelsCompleted: allLevels.length,
            highestLevel: Math.max(...Object.keys(existingData.levels).map(k => parseInt(k.replace('level', ''))))
          };
          
          // Save to localStorage temporarily
          localStorage.setItem(`Dyslexia_${user.uid}`, JSON.stringify(existingData));
          
          // Save to Firestore (this will update the same document)
          await saveGameScore(user.uid, 'Dyslexia', totalScore, 0, existingData);
          console.log('Dyslexia game results saved successfully');
        } catch (error) {
          console.error('Failed to save Dyslexia game results:', error);
        }
      }
    };
    
    saveCurrentLevelResults();
    
    if (currentLevel === 3) {
      setShowEndingVideo(true); // show the ending video only after level 3
    } else {
      setGameCompleted(true);
    }
  }, [currentLevel, user?.uid, score, totalQuestions, responses, getPerformanceAnalysis]);

  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setGameStarted(false);
      setGameCompleted(false);
      setCurrentQuestion(0);
      setScore(0);
      setResponses([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(10);
    }
  };

  const restartGame = () => {
    setCurrentLevel(1);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(10);
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'මූලික දෘශ්‍ය වෙනස්කම් හඳුනාගැනීම',
      2: 'සාමාන්‍ය ඩිස්ලෙක්සික් ව්‍යාකූලතා',
      3: 'උසස් දෘශ්‍ය වෙනස්කම් හඳුනාගැනීම'
    };
    return descriptions[level];
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-yellow-700 to-yellow-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">දෘශ්‍ය වෙනස්කම් ක්‍රීඩාව</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 px-4">අකුරු වල සමානකම් සහ වෙනස්කම් හඳුනාගන්න</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">මට්ටම {currentLevel}</h2>
            <p className="text-lg sm:text-xl mb-4 sm:mb-6">{getLevelDescription(currentLevel)}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">ප්‍රශ්න ගණන</div>
                <div className="text-xl sm:text-2xl font-bold">{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">කාලය (ප්‍රශ්නයකට)</div>
                <div className="text-xl sm:text-2xl font-bold">10 තත්පර</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">මට්ටම</div>
                <div className="text-xl sm:text-2xl font-bold">{currentLevel}/3</div>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">ක්‍රීඩා නියම</h3>
              <ul className="text-left space-y-1 sm:space-y-2 max-w-md mx-auto text-sm sm:text-base">
                <li>• දෙ අකුරු සමාන ද වෙනස් ද යන්න තීරණය කරන්න</li>
                <li>• ප්‍රශ්නයකට තත්පර 10ක් ලැබේ</li>
                <li>• "සමාන" හෝ "වෙනස්" තෝරන්න</li>
                <li>• සියලු ප්‍රශ්න සම්පූර්ණ කර ඊළඟ මට්ටමට යන්න</li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="bg-white text-yellow-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg"
            >
              ක්‍රීඩාව ආරම්භ කරන්න
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
    );
  }

  if (showEndingVideo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src="/images/GameComplete.mp4" 
          autoPlay
          playsInline
          onEnded={onBack}
          className="w-screen h-screen object-cover"
        />
      </div>
    );
  }

  if (gameCompleted) {
    const analysis = getPerformanceAnalysis();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-yellow-700 to-yellow-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl w-full">
          <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">🎉</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">මට්ටම {currentLevel} සම්පූර්ණයි!</h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">ලකුණු</div>
                <div className="text-2xl sm:text-3xl font-bold">{score}/{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">නිරවද්‍යතාව</div>
                <div className="text-2xl sm:text-3xl font-bold">{analysis.accuracy.toFixed(1)}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">අවදානම් මට්ටම</div>
                <div className={`text-2xl sm:text-3xl font-bold ${
                  analysis.riskLevel === 'Not Danger' ? 'text-green-300' : 
                  analysis.riskLevel === 'Less Danger' ? 'text-yellow-300' : 'text-red-300'
                }`}>
                  {analysis.riskLevelSinhala}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">සාමාන්‍ය කාලය</div>
                <div className="text-2xl sm:text-3xl font-bold">{analysis.averageTime.toFixed(1)}s</div>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/10 rounded-lg">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">විශ්ලේෂණය</h3>
              <p className="text-sm sm:text-base md:text-lg">{analysis.analysis}</p>
            </div>
            
            <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
              {currentLevel < 3 && (
                <button
                  onClick={nextLevel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base"
                >
                  ඊළඟ මට්ටම →
                </button>
              )}
              
              <button
                onClick={onBack}
                className="bg-white text-yellow-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 text-sm sm:text-base"
              >
                ← ආපසු යන්න
              </button>
              
              <button
                onClick={restartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base"
              >
                🔄 නැවත ආරම්භ කරන්න
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-yellow-700 to-yellow-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
          <div className="text-left">
            <div className="text-sm sm:text-base md:text-lg font-bold">මට්ටම {currentLevel}</div>
            <div className="text-xs sm:text-sm opacity-80">ප්‍රශ්නය {currentQuestion + 1}/{totalQuestions}</div>
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
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏰ {timeLeft}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 mb-4 sm:mb-6 md:mb-8">
          <div 
            className="bg-white h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8">මෙම අකුරු සමාන ද වෙනස් ද?</h2>
          
          {/* Letters Display */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center shadow-2xl">
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-gray-800">{currentQ.letter1}</span>
            </div>
            
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold">VS</div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center shadow-2xl">
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-gray-800">{currentQ.letter2}</span>
            </div>
          </div>

          {/* Answer Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              onClick={() => handleAnswer('Similar')}
              disabled={selectedAnswer || showResult}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 shadow-lg ${
                showResult && currentQ.correct === 'Similar'
                  ? 'bg-green-500 text-white'
                  : showResult && selectedAnswer === 'Similar' && currentQ.correct !== 'Similar'
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === 'Similar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-yellow-600 hover:bg-gray-100'
              } ${selectedAnswer || showResult ? 'cursor-not-allowed' : 'hover:scale-105'}`}
            >
              සමාන ✔️
            </button>
            
            <button
              onClick={() => handleAnswer('Different')}
              disabled={selectedAnswer || showResult}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 shadow-lg ${
                showResult && currentQ.correct === 'Different'
                  ? 'bg-green-500 text-white'
                  : showResult && selectedAnswer === 'Different' && currentQ.correct !== 'Different'
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === 'Different'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-yellow-600 hover:bg-gray-100'
              } ${selectedAnswer || showResult ? 'cursor-not-allowed' : 'hover:scale-105'}`}
            >
              වෙනස් ❌
            </button>
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/10 rounded-lg">
              <div className={`text-lg sm:text-xl font-bold mb-2 ${
                selectedAnswer === currentQ.correct ? 'text-green-300' : 'text-red-300'
              }`}>
                {selectedAnswer === currentQ.correct ? '✅ නිවැරදියි!' : '❌ වැරදියි!'}
              </div>
              <div className="text-sm sm:text-base md:text-lg">
                නිවැරදි පිළිතුර: <span className="font-bold">{currentQ.correct}</span>
              </div>
              <div className="text-xs sm:text-sm opacity-80 mt-1 sm:mt-2">{currentQ.description}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs sm:text-sm opacity-80 px-4">
          අකුරු දෙක සමාන නම් "සමාන" ද, වෙනස් නම් "වෙනස්" ද තෝරන්න
        </div>
      </div>
    </div>
  );
};

export default DyslexiaGamePage;