import React, { useState, useRef, useEffect } from 'react';
import { saveGameScore, updateUserProgress } from '../../firebase/firestore';

const SinhalaGamePage = ({ onBack, user }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [strokeData, setStrokeData] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [allUserStrokes, setAllUserStrokes] = useState([]);
  const [liveAccuracy, setLiveAccuracy] = useState(0); // Live accuracy tracking
  const [liveProgress, setLiveProgress] = useState(0); // Live progress tracking

  // Updated to show English words for writing
  const gameWords = {
    1: [
      { english: 'CAT', sinhala: 'බළලා', image: '🐱' },
      { english: 'DOG', sinhala: 'බල්ලා', image: '🐶' },
      { english: 'COW', sinhala: 'එළදෙනා', image: '🐄' }
    ],
    2: [
      { english: 'RABBIT', sinhala: 'හාවා', image: '🐰' },
      { english: 'MONKEY', sinhala: 'වඳුරා', image: '🐵' },
      { english: 'TIGER', sinhala: 'කොටියා', image: '🐅' }
    ],
    3: [
      { english: 'ELEPHANT', sinhala: 'අලියා', image: '🐘' },
      { english: 'PEACOCK', sinhala: 'මොනරා', image: '🦚' },
      { english: 'BUTTERFLY', sinhala: 'සමනලයා', image: '🦋' }
    ]
  };

  const currentWord = gameWords[currentLevel][currentWordIndex];

  useEffect(() => {
    if (gameStarted && !startTime) {
      setStartTime(Date.now());
    }
  }, [gameStarted, startTime]);

  useEffect(() => {
    let interval;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  // Live analysis effect - runs whenever strokeData changes
  useEffect(() => {
    if (strokeData.length > 0) {
      calculateLiveMetrics();
    } else {
      setLiveAccuracy(0);
      setLiveProgress(0);
    }
  }, [strokeData, currentWord]);

  const calculateLiveMetrics = () => {
    if (strokeData.length === 0) return;

    // Calculate live accuracy based on stroke count vs expected
    const expectedStrokes = currentWord.english.length * 1.2;
    const actualStrokes = strokeData.length;
    const accuracy = Math.max(0, Math.min(100, 100 - Math.abs(expectedStrokes - actualStrokes) * 8));
    
    // Calculate progress based on stroke coverage
    const progress = Math.min(100, (actualStrokes / expectedStrokes) * 100);
    
    setLiveAccuracy(Math.round(accuracy));
    setLiveProgress(Math.round(progress));
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Set canvas size to be large
    canvas.width = 800;
    canvas.height = 400;
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the English word outline in light gray for tracing
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw outline/shadow of the word
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 8;
    ctx.strokeText(currentWord.english, canvas.width / 2, canvas.height / 2);
    
    // Fill with very light color for guidance
    ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
    ctx.fillText(currentWord.english, canvas.width / 2, canvas.height / 2);
    
    // Redraw all previous user strokes in green
    redrawAllUserStrokes();
  };

  const redrawAllUserStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Draw all stored user strokes
    allUserStrokes.forEach(stroke => {
      if (stroke.length > 1) {
        ctx.strokeStyle = '#10B981'; // Green color
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    initializeCanvas();
  }, [currentWord, allUserStrokes]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    setCurrentStroke([pos]);
    
    // Set green color for drawing
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#10B981'; // Green color
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);

    // Ensure green color is maintained
    ctx.strokeStyle = '#10B981'; // Green color
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const lastPos = currentStroke[currentStroke.length - 1] || pos;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setCurrentStroke(prev => [...prev, pos]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Add current stroke to both strokeData and allUserStrokes
    if (currentStroke.length > 0) {
      setStrokeData(prev => [...prev, currentStroke]);
      setAllUserStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke([]);
  };

  const clearCurrentWordOnly = () => {
    // Only clear current word's strokes, but keep all previous writing
    setStrokeData([]);
    setCurrentStroke([]);
    setFeedback('');
    setShowNextButton(false);
    setLiveAccuracy(0);
    setLiveProgress(0);
    
    // Reinitialize canvas but keep all user strokes
    initializeCanvas();
  };

  const clearAllWriting = () => {
    // This function completely clears all writing (for restart)
    setAllUserStrokes([]);
    setStrokeData([]);
    setCurrentStroke([]);
    setFeedback('');
    setShowNextButton(false);
    setLiveAccuracy(0);
    setLiveProgress(0);
    initializeCanvas();
  };

  const analyzeWriting = () => {
    if (strokeData.length === 0) {
      setFeedback('කරුණාකර පළමුව ලියන්න!');
      return;
    }

    // Enhanced analysis
    const expectedStrokes = currentWord.english.length * 1.2;
    const actualStrokes = strokeData.length;
    const strokeAccuracy = Math.max(0, 100 - Math.abs(expectedStrokes - actualStrokes) * 8);
    
    // Time analysis - more lenient for children
    const timePerCharacter = timeSpent / currentWord.english.length;
    const timeScore = timePerCharacter < 8 ? 100 : Math.max(0, 100 - (timePerCharacter - 8) * 5);
    
    // Overall score
    const wordScore = Math.round((strokeAccuracy + timeScore) / 2);
    
    setScore(prev => prev + wordScore);
    
    // Show celebration for good scores
    if (wordScore >= 70) {
      setShowCelebration(true);
      setFeedback(`🎉 අපූරුයි! ලකුණු: ${wordScore}`);
      setTimeout(() => setShowCelebration(false), 3000);
    } else if (wordScore >= 50) {
      setFeedback(`👍 හොඳයි! ලකුණු: ${wordScore}`);
    } else {
      setFeedback(`💪 තවත් පුහුණු වන්න! ලකුණු: ${wordScore}`);
    }
    
    setShowNextButton(true);
  };

  const nextWord = () => {
    if (currentWordIndex < gameWords[currentLevel].length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      // AUTOMATICALLY clear current word data when moving to next word
      setStrokeData([]);
      setCurrentStroke([]);
      setShowNextButton(false);
      setFeedback('');
      setLiveAccuracy(0);
      setLiveProgress(0);
    } else if (currentLevel < 3) {
      setLevelCompleted(true);
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        setCurrentWordIndex(0);
        // AUTOMATICALLY clear when moving to next level
        setStrokeData([]);
        setCurrentStroke([]);
        setShowNextButton(false);
        setFeedback('');
        setLevelCompleted(false);
        setLiveAccuracy(0);
        setLiveProgress(0);
      }, 3000);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user?.uid) {
      await saveGameScore(user.uid, 'sinhala', score, timeSpent);
      await updateUserProgress(user.uid, 'sinhala', score);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const restartGame = () => {
    setCurrentLevel(1);
    setCurrentWordIndex(0);
    setScore(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeSpent(0);
    setStartTime(null);
    setFeedback('');
    setShowNextButton(false);
    setStrokeData([]);
    setCurrentStroke([]);
    setShowCelebration(false);
    setLevelCompleted(false);
    setLiveAccuracy(0);
    setLiveProgress(0);
    clearAllWriting();
  };

  // Live Preview Component
  const LivePreview = () => (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 mb-6">
      <h4 className="text-2xl font-bold text-white mb-4 text-center animate-pulse">
        🔴 සජීව පෙරදසුන
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Accuracy */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-lg font-semibold text-white mb-2">නිරවද්‍යතාව</div>
          <div className="bg-gray-300 rounded-full h-6 mb-2">
            <div 
              className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center ${
                liveAccuracy >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                liveAccuracy >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${liveAccuracy}%` }}
            >
              <span className="text-white font-bold text-sm">{liveAccuracy}%</span>
            </div>
          </div>
          <div className="text-sm text-gray-200">
            {liveAccuracy >= 80 ? '🟢 විශිෂ්ට!' : 
             liveAccuracy >= 60 ? '🟡 හොඳයි!' : 
             liveAccuracy > 0 ? '🔴 වැඩිදියුණු කරන්න' : '⚪ ලිවීම ආරම්භ කරන්න'}
          </div>
        </div>

        {/* Live Progress */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-lg font-semibold text-white mb-2">ප්‍රගතිය</div>
          <div className="bg-gray-300 rounded-full h-6 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${liveProgress}%` }}
            >
              <span className="text-white font-bold text-sm">{liveProgress}%</span>
            </div>
          </div>
          <div className="text-sm text-gray-200">
            {liveProgress >= 90 ? '🎯 සම්පූර්ණයට ආසන්නයි!' : 
             liveProgress >= 50 ? '📝 හොඳ ප්‍රගතියක්!' : 
             liveProgress > 0 ? '✏️ ලිවීම ආරම්භ වී ඇත' : '📋 ලිවීමට සූදානම්'}
          </div>
        </div>
      </div>

      {/* Live Stroke Count */}
      <div className="mt-4 text-center">
        <div className="bg-white/10 rounded-xl p-3 inline-block">
          <span className="text-white font-semibold">
            ✍️ ඉරි ගණන: <span className="text-yellow-300">{strokeData.length}</span>
            {strokeData.length > 0 && (
              <span className="ml-4 text-green-300">
                🟢 සජීව ලිවීම සක්‍රියයි
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );

  // Celebration Component
  const CelebrationOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-bounce">
        <div className="text-9xl mb-4">🎉</div>
        <div className="text-6xl font-bold text-yellow-300 animate-pulse">
          අපූරුයි!
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="text-4xl animate-spin">⭐</div>
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🌟</div>
          <div className="text-4xl animate-spin" style={{ animationDelay: '0.2s' }}>✨</div>
        </div>
      </div>
    </div>
  );

  // Level Completion Component
  const LevelCompletionOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="text-center text-white animate-pulse">
        <div className="text-9xl mb-4">🏆</div>
        <div className="text-5xl font-bold mb-4">
          මට්ටම {currentLevel} සම්පූර්ණයි!
        </div>
        <div className="text-3xl mb-4">
          වචනය ස්වයංක්‍රීයව මකනු ඇත...
        </div>
        <div className="text-2xl">
          ඊළඟ මට්ටමට යමු...
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="text-4xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              🎊
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-700 to-teal-500 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '2s' }}>⭐</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>💫</div>
        
        <div className="text-center text-white max-w-4xl relative z-10">
          <div className="text-9xl mb-8 animate-bounce">✍🏻</div>
          <h1 className="text-6xl font-bold mb-8 animate-pulse">පැන්සල් ඉරි ග්‍රහලෝකය</h1>
          <p className="text-3xl mb-12 animate-fade-in">ඉංග්‍රීසි වචන ලියන්න - සජීව පෙරදසුන සමඟ!</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 mb-12 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8">🔴 නව විශේෂාංග</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-2xl p-6">
                <div className="text-4xl mb-2">📊</div>
                <div className="font-bold text-xl">සජීව පෙරදසුන</div>
                <div className="text-sm mt-2">ලිවීමේදී ක්ෂණික ප්‍රතිපෝෂණ</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-2xl p-6">
                <div className="text-4xl mb-2">🔄</div>
                <div className="font-bold text-xl">ස්වයංක්‍රීය මකාදැමීම</div>
                <div className="text-sm mt-2">ඊළඟ වචනයට යාමේදී ස්වයංක්‍රීයව මකනු ඇත</div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-6">ක්‍රීඩා මට්ටම්</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xl">
              <div className="bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-2xl p-6 transform hover:scale-110 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce">🥉</div>
                <div className="font-bold text-2xl">මට්ටම 1</div>
                <div className="text-lg mt-2">සරල වචන</div>
                <div className="text-sm mt-2 opacity-80">CAT, DOG, COW</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-2xl p-6 transform hover:scale-110 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>🥈</div>
                <div className="font-bold text-2xl">මට්ටම 2</div>
                <div className="text-lg mt-2">මධ්‍යම වචන</div>
                <div className="text-sm mt-2 opacity-80">RABBIT, MONKEY, TIGER</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-2xl p-6 transform hover:scale-110 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce" style={{ animationDelay: '0.4s' }}>🥇</div>
                <div className="font-bold text-2xl">මට්ටම 3</div>
                <div className="text-lg mt-2">දුෂ්කර වචන</div>
                <div className="text-sm mt-2 opacity-80">ELEPHANT, PEACOCK, BUTTERFLY</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 justify-center">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-6 rounded-full font-bold text-2xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 shadow-2xl animate-pulse"
            >
              🎮 ක්‍රීඩාව ආරම්භ කරන්න
            </button>
            <button
              onClick={onBack}
              className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-6 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ← ආපසු යන්න
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-700 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Celebration Background */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-bounce"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {['🎉', '🎊', '⭐', '🌟', '✨', '🏆'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
        
        <div className="text-center text-white max-w-4xl relative z-10">
          <div className="text-9xl mb-8 animate-bounce">🏆</div>
          <h1 className="text-6xl font-bold mb-8 animate-pulse">ක්‍රීඩාව සම්පූර්ණයි!</h1>
          <div className="text-4xl mb-12 animate-fade-in">ඔබ විශිෂ්ට ලෙස ක්‍රීඩා කළා!</div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-2xl p-6">
                <div className="text-sm opacity-80">මුළු ලකුණු</div>
                <div className="text-5xl font-bold">{score}</div>
                <div className="text-2xl">🏆</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-2xl p-6">
                <div className="text-sm opacity-80">ගත වූ කාලය</div>
                <div className="text-5xl font-bold">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
                <div className="text-2xl">⏱️</div>
              </div>
              <div className="bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-2xl p-6">
                <div className="text-sm opacity-80">සම්පූර්ණ කළ මට්ටම්</div>
                <div className="text-5xl font-bold">{currentLevel}</div>
                <div className="text-2xl">📈</div>
              </div>
            </div>
            
            <div className="mb-8">
              {score >= 240 && (
                <div className="text-3xl mb-4 animate-bounce">
                  🌟 ඔබ සුපිරි ලේඛකයෙක්! 🌟
                </div>
              )}
              {score >= 180 && score < 240 && (
                <div className="text-3xl mb-4 animate-bounce">
                  ⭐ හොඳ කාර්ය සාධනයක්! ⭐
                </div>
              )}
              {score < 180 && (
                <div className="text-3xl mb-4 animate-bounce">
                  💪 තවත් පුහුණු වී දක්ෂ වන්න! 💪
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-6 justify-center">
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 shadow-2xl"
            >
              🔄 නැවත ක්‍රීඩා කරන්න
            </button>
            <button
              onClick={onBack}
              className="bg-purple-800 hover:bg-purple-900 text-white px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ← ආපසු යන්න
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-700 to-teal-500 p-4 relative">
      {/* Celebration Overlay */}
      {showCelebration && <CelebrationOverlay />}
      
      {/* Level Completion Overlay */}
      {levelCompleted && <LevelCompletionOverlay />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 text-white">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="bg-teal-800 hover:bg-teal-900 px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
          >
            ← ආපසු
          </button>
          <div className="text-2xl font-bold animate-pulse">මට්ටම {currentLevel}</div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-xl bg-white/20 px-4 py-2 rounded-full">⏱️ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
          <div className="text-xl bg-white/20 px-4 py-2 rounded-full">🏆 {score}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto">
        {/* Word Display */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 inline-block">
            <div className="text-9xl mb-4 animate-bounce">{currentWord.image}</div>
            <div className="text-5xl font-bold text-white mb-4">{currentWord.english}</div>
            <div className="text-2xl text-teal-100 mb-6">"{currentWord.english}" ලෙස ලියන්න</div>
            <div className="text-lg text-teal-200 mb-6">🟢 හරිත වර්ණයෙන් ලියන්න</div>
            
            {/* Progress */}
            <div className="bg-white/20 rounded-full h-6 mb-4 w-64 mx-auto">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ 
                  width: `${((currentWordIndex + 1) / gameWords[currentLevel].length) * 100}%` 
                }}
              >
                <span className="text-white font-bold text-sm">
                  {currentWordIndex + 1}/{gameWords[currentLevel].length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <LivePreview />

        {/* Writing Canvas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6">
          <h3 className="text-3xl font-bold text-white mb-6 text-center animate-pulse">
            වචනය මත ලියන්න - ස්වයංක්‍රීය මකාදැමීම සක්‍රියයි
          </h3>
          
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-2xl">
            <canvas
              ref={canvasRef}
              className="w-full h-auto cursor-crosshair rounded-lg"
              style={{ maxWidth: '100%', aspectRatio: '2/1' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-6 justify-center mb-6">
            <button
              onClick={clearCurrentWordOnly}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              🗑️ මෙම වචනය මකන්න
            </button>
            <button
              onClick={clearAllWriting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              🗑️ සියල්ල මකන්න
            </button>
            <button
              onClick={analyzeWriting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg"
              disabled={strokeData.length === 0}
            >
              ✅ පරීක්ෂා කරන්න
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-2xl p-6 text-white text-2xl font-bold animate-pulse">
                {feedback}
              </div>
            </div>
          )}

          {/* Next Button */}
          {showNextButton && (
            <div className="text-center">
              <button
                onClick={nextWord}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl animate-bounce"
              >
                {currentWordIndex < gameWords[currentLevel].length - 1 ? '➡️ ඊළඟ වචනය (ස්වයංක්‍රීයව මකනු ඇත)' : 
                 currentLevel < 3 ? '🔼 ඊළඟ මට්ටම (ස්වයංක්‍රීයව මකනු ඇත)' : '🏁 ක්‍රීඩාව අවසන්'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        canvas {
          touch-action: none;
        }
      `}</style>
    </div>
  );
};

export default SinhalaGamePage;