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
  const [strokeColor, setStrokeColor] = useState('#FF6B6B');

  // Color palette for writing strokes
  const strokeColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  // Reduced to 3 words per level as requested - English words to write
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

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    
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
    ctx.lineWidth = 12;
    ctx.strokeText(currentWord.english, canvas.width / 2, canvas.height / 2);
    
    // Fill with very light color for guidance
    ctx.fillStyle = 'rgba(226, 232, 240, 0.2)';
    ctx.fillText(currentWord.english, canvas.width / 2, canvas.height / 2);
    
    // Reset for user drawing
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 8;
  };

  useEffect(() => {
    initializeCanvas();
  }, [currentWord, strokeColor]);

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
    
    // Change stroke color for each new stroke
    const newColor = strokeColors[strokeData.length % strokeColors.length];
    setStrokeColor(newColor);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = newColor;
    
    setCurrentStroke([{ ...pos, color: newColor }]);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);

    const strokePoint = { ...pos, color: strokeColor };
    setCurrentStroke(prev => [...prev, strokePoint]);

    // Draw with current stroke color
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    const lastPoint = currentStroke[currentStroke.length - 1] || strokePoint;
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStrokeData(prev => [...prev, currentStroke]);
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    initializeCanvas();
    setStrokeData([]);
    setCurrentStroke([]);
    setFeedback('');
    setShowNextButton(false);
  };

  const redrawAllStrokes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Redraw background
    initializeCanvas();
    
    // Redraw all previous strokes with their colors
    strokeData.forEach(stroke => {
      if (stroke.length > 0) {
        ctx.strokeStyle = stroke[0].color;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      }
    });
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
      clearCanvas();
      setShowNextButton(false);
      setFeedback('');
    } else if (currentLevel < 3) {
      setLevelCompleted(true);
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        setCurrentWordIndex(0);
        clearCanvas();
        setShowNextButton(false);
        setFeedback('');
        setLevelCompleted(false);
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
    clearCanvas();
  };

  // Celebration Component with varied animations
  const CelebrationOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-pulse">
        <div className="text-9xl mb-4 animate-spin">🎉</div>
        <div className="text-6xl font-bold text-yellow-300 animate-bounce">
          අපූරුයි!
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="text-4xl animate-ping">⭐</div>
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🌟</div>
          <div className="text-4xl animate-pulse" style={{ animationDelay: '0.2s' }}>✨</div>
        </div>
      </div>
    </div>
  );

  // Level Completion Component with varied animations
  const LevelCompletionOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="text-center text-white">
        <div className="text-9xl mb-4 animate-spin">🏆</div>
        <div className="text-5xl font-bold mb-4 animate-pulse">
          මට්ටම {currentLevel} සම්පූර්ණයි!
        </div>
        <div className="text-3xl animate-bounce">
          ඊළඟ මට්ටමට යමු...
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`text-4xl ${i % 2 === 0 ? 'animate-ping' : 'animate-pulse'}`}
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
        {/* Floating Elements with varied animations */}
        <div className="absolute top-10 left-10 text-6xl animate-ping" style={{ animationDelay: '0s' }}>✨</div>
        <div className="absolute top-20 right-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-spin" style={{ animationDelay: '2s' }}>⭐</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>💫</div>
        
        <div className="text-center text-white max-w-4xl relative z-10">
          <div className="text-9xl mb-8 animate-pulse">✍🏻</div>
          <h1 className="text-6xl font-bold mb-8 animate-bounce">පැන්සල් ඉරි ග්‍රහලෝකය</h1>
          <p className="text-3xl mb-12 animate-fade-in">ඉංග්‍රීසි වචන ලියන්න</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 mb-12 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8 animate-pulse">ක්‍රීඩා මට්ටම්</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xl">
              <div className="bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-2xl p-6 transform hover:scale-110 transition-all duration-300">
                <div className="text-6xl mb-4 animate-spin">🥉</div>
                <div className="font-bold text-2xl">මට්ටම 1</div>
                <div className="text-lg mt-2">සරල වචන</div>
                <div className="text-sm mt-2 opacity-80">CAT, DOG, COW</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-2xl p-6 transform hover:scale-110 transition-all duration-300">
                <div className="text-6xl mb-4 animate-pulse" style={{ animationDelay: '0.2s' }}>🥈</div>
                <div className="font-bold text-2xl">මට්ටම 2</div>
                <div className="text-lg mt-2">මධ්‍යම වචන</div>
                <div className="text-sm mt-2 opacity-80">RABBIT, MONKEY, TIGER</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-2xl p-6 transform hover:scale-110 transition-all duration-300">
                <div className="text-6xl mb-4 animate-ping" style={{ animationDelay: '0.4s' }}>🥇</div>
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
        {/* Celebration Background with varied animations */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute text-4xl ${i % 3 === 0 ? 'animate-bounce' : i % 3 === 1 ? 'animate-ping' : 'animate-pulse'}`}
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
          <div className="text-9xl mb-8 animate-spin">🏆</div>
          <h1 className="text-6xl font-bold mb-8 animate-pulse">ක්‍රීඩාව සම්පූර්ණයි!</h1>
          <div className="text-4xl mb-12 animate-fade-in">ඔබ විශිෂ්ට ලෙස ක්‍රීඩා කළා!</div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-2xl p-6">
                <div className="text-sm opacity-80">මුළු ලකුණු</div>
                <div className="text-5xl font-bold animate-bounce">{score}</div>
                <div className="text-2xl animate-spin">🏆</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-2xl p-6">
                <div className="text-sm opacity-80">ගත වූ කාලය</div>
                <div className="text-5xl font-bold animate-pulse">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
                <div className="text-2xl animate-ping">⏱️</div>
              </div>
              <div className="bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-2xl p-6">
                <div className="text-sm opacity-80">සම්පූර්ණ කළ මට්ටම්</div>
                <div className="text-5xl font-bold animate-bounce">{currentLevel}</div>
                <div className="text-2xl animate-pulse">📈</div>
              </div>
            </div>
            
            <div className="mb-8">
              {score >= 240 && (
                <div className="text-3xl mb-4 animate-ping">
                  🌟 ඔබ සුපිරි ලේඛකයෙක්! 🌟
                </div>
              )}
              {score >= 180 && score < 240 && (
                <div className="text-3xl mb-4 animate-pulse">
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
          <div className="text-xl bg-white/20 px-4 py-2 rounded-full animate-pulse">⏱️ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
          <div className="text-xl bg-white/20 px-4 py-2 rounded-full animate-bounce">🏆 {score}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto">
        {/* Word Display */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 inline-block">
            <div className="text-9xl mb-4 animate-spin">{currentWord.image}</div>
            <div className="text-5xl font-bold text-white mb-4 animate-pulse">{currentWord.english}</div>
            <div className="text-2xl text-teal-100 mb-6 animate-fade-in">"{currentWord.english}" ලියන්න</div>
            
            {/* Progress */}
            <div className="bg-white/20 rounded-full h-6 mb-4 w-64 mx-auto">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center animate-pulse"
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

        {/* Color Palette Display */}
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block">
            <div className="text-white text-lg mb-3 animate-bounce">🎨 ලේඛන වර්ණ</div>
            <div className="flex gap-3 justify-center">
              {strokeColors.map((color, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    strokeColor === color ? 'border-white scale-125 animate-ping' : 'border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="text-white text-sm mt-2 opacity-80 animate-fade-in">
              ලිවීමේදී වර්ණ ස්වයංක්‍රීයව වෙනස් වේ
            </div>
          </div>
        </div>

        {/* Writing Canvas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6">
          <h3 className="text-3xl font-bold text-white mb-6 text-center animate-pulse">
            වචනය මත ලියන්න
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
              onClick={clearCanvas}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg animate-pulse"
            >
              🗑️ මකන්න
            </button>
            <button
              onClick={analyzeWriting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg animate-bounce"
              disabled={strokeData.length === 0}
            >
              ✅ පරීක්ෂා කරන්න
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-2xl p-6 text-white text-2xl font-bold animate-ping">
                {feedback}
              </div>
            </div>
          )}

          {/* Next Button */}
          {showNextButton && (
            <div className="text-center">
              <button
                onClick={nextWord}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl animate-pulse"
              >
                {currentWordIndex < gameWords[currentLevel].length - 1 ? '➡️ ඊළඟ වචනය' : 
                 currentLevel < 3 ? '🔼 ඊළඟ මට්ටම' : '🏁 ක්‍රීඩාව අවසන්'}
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