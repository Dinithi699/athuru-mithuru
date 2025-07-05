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

  // Game words organized by difficulty levels
  const gameWords = {
    1: [
      { english: 'CAT', sinhala: 'බළලා', image: '🐱' },
      { english: 'DOG', sinhala: 'බල්ලා', image: '🐶' },
      { english: 'COW', sinhala: 'එළදෙනා', image: '🐄' },
      { english: 'PIG', sinhala: 'ඌරා', image: '🐷' },
      { english: 'BAT', sinhala: 'වවුලා', image: '🦇' }
    ],
    2: [
      { english: 'RABBIT', sinhala: 'හාවා', image: '🐰' },
      { english: 'MONKEY', sinhala: 'වඳුරා', image: '🐵' },
      { english: 'TIGER', sinhala: 'කොටියා', image: '🐅' },
      { english: 'HORSE', sinhala: 'අශ්වයා', image: '🐴' },
      { english: 'BIRD', sinhala: 'කුරුල්ලා', image: '🐦' }
    ],
    3: [
      { english: 'ELEPHANT', sinhala: 'අලියා', image: '🐘' },
      { english: 'PEACOCK', sinhala: 'මොනරා', image: '🦚' },
      { english: 'BUTTERFLY', sinhala: 'සමනලයා', image: '🦋' },
      { english: 'CROCODILE', sinhala: 'කිඹුලා', image: '🐊' },
      { english: 'GIRAFFE', sinhala: 'ජිරාෆ්', image: '🦒' }
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
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2D3748';
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 300;
    
    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add guidelines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal guidelines
    for (let i = 1; i < 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Reset stroke style for drawing
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
  };

  useEffect(() => {
    initializeCanvas();
  }, [currentWord]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    setCurrentStroke([pos]);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);

    setCurrentStroke(prev => [...prev, pos]);

    ctx.beginPath();
    ctx.moveTo(currentStroke[currentStroke.length - 1]?.x || pos.x, currentStroke[currentStroke.length - 1]?.y || pos.y);
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

  const analyzeWriting = () => {
    if (strokeData.length === 0) {
      setFeedback('කරුණාකර පළමුව ලියන්න!');
      return;
    }

    // Simple analysis based on stroke count and complexity
    const expectedStrokes = currentWord.sinhala.length * 2; // Rough estimate
    const actualStrokes = strokeData.length;
    const strokeAccuracy = Math.max(0, 100 - Math.abs(expectedStrokes - actualStrokes) * 10);
    
    // Time analysis
    const timePerCharacter = timeSpent / currentWord.sinhala.length;
    const timeScore = timePerCharacter < 5 ? 100 : Math.max(0, 100 - (timePerCharacter - 5) * 10);
    
    // Overall score
    const wordScore = Math.round((strokeAccuracy + timeScore) / 2);
    
    setScore(prev => prev + wordScore);
    
    if (wordScore >= 70) {
      setFeedback(`🎉 ඉතා හොඳයි! ලකුණු: ${wordScore}`);
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
      setCurrentLevel(prev => prev + 1);
      setCurrentWordIndex(0);
      clearCanvas();
      setShowNextButton(false);
      setFeedback('');
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
    clearCanvas();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-700 to-teal-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="text-8xl mb-8 animate-bounce">✍🏻</div>
          <h1 className="text-5xl font-bold mb-8">පැන්සල් ඉරි ග්‍රහලෝකය</h1>
          <p className="text-2xl mb-8">ඉංග්‍රීසි වචන සිංහලෙන් ලියන්න</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">ක්‍රීඩා නියම</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl mb-2">🥉</div>
                <div className="font-bold">මට්ටම 1</div>
                <div className="text-sm">සරල වචන</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl mb-2">🥈</div>
                <div className="font-bold">මට්ටම 2</div>
                <div className="text-sm">මධ්‍යම වචන</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl mb-2">🥇</div>
                <div className="font-bold">මට්ටම 3</div>
                <div className="text-sm">දුෂ්කර වචන</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={startGame}
              className="bg-white text-teal-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🎮 ක්‍රීඩාව ආරම්භ කරන්න
            </button>
            <button
              onClick={onBack}
              className="bg-teal-800 hover:bg-teal-900 text-white px-6 py-4 rounded-full font-bold transition-colors duration-300"
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
      <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-700 to-teal-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="text-8xl mb-8">🏆</div>
          <h1 className="text-5xl font-bold mb-8">ක්‍රීඩාව සම්පූර්ණයි!</h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">මුළු ලකුණු</div>
                <div className="text-3xl font-bold">{score}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">ගත වූ කාලය</div>
                <div className="text-3xl font-bold">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">සම්පූර්ණ කළ මට්ටම්</div>
                <div className="text-3xl font-bold">{currentLevel}</div>
              </div>
            </div>
            
            <div className="mb-6">
              {score >= 400 && <div className="text-2xl mb-2">🌟 විශිෂ්ට කාර්ය සාධනයක්!</div>}
              {score >= 300 && score < 400 && <div className="text-2xl mb-2">⭐ හොඳ කාර්ය සාධනයක්!</div>}
              {score < 300 && <div className="text-2xl mb-2">💪 තවත් පුහුණු වන්න!</div>}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={restartGame}
              className="bg-white text-teal-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300"
            >
              🔄 නැවත ක්‍රීඩා කරන්න
            </button>
            <button
              onClick={onBack}
              className="bg-teal-800 hover:bg-teal-900 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300"
            >
              ← ආපසු යන්න
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-700 to-teal-500 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 text-white">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="bg-teal-800 hover:bg-teal-900 px-4 py-2 rounded-full font-bold transition-colors duration-300"
          >
            ← ආපසු
          </button>
          <div className="text-xl font-bold">මට්ටම {currentLevel}</div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-lg">⏱️ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
          <div className="text-lg">🏆 {score}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Word Display */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="text-8xl mb-4">{currentWord.image}</div>
            <div className="text-4xl font-bold text-white mb-4">{currentWord.english}</div>
            <div className="text-2xl text-teal-100 mb-6">"{currentWord.sinhala}" ලෙස ලියන්න</div>
            
            {/* Progress */}
            <div className="bg-white/10 rounded-full h-4 mb-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentWordIndex + 1) / gameWords[currentLevel].length) * 100}%` 
                }}
              ></div>
            </div>
            <div className="text-white text-sm">
              {currentWordIndex + 1} / {gameWords[currentLevel].length} වචන
            </div>
          </div>

          {/* Writing Canvas */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">මෙහි ලියන්න</h3>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full"
                style={{ maxWidth: '100%', height: 'auto' }}
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
            <div className="flex gap-4 justify-center mb-4">
              <button
                onClick={clearCanvas}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold transition-colors duration-300"
              >
                🗑️ මකන්න
              </button>
              <button
                onClick={analyzeWriting}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold transition-colors duration-300"
                disabled={strokeData.length === 0}
              >
                ✅ පරීක්ෂා කරන්න
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="text-center mb-4">
                <div className="bg-white/30 rounded-lg p-4 text-white text-lg font-bold">
                  {feedback}
                </div>
              </div>
            )}

            {/* Next Button */}
            {showNextButton && (
              <div className="text-center">
                <button
                  onClick={nextWord}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors duration-300"
                >
                  {currentWordIndex < gameWords[currentLevel].length - 1 ? '➡️ ඊළඟ වචනය' : 
                   currentLevel < 3 ? '🔼 ඊළඟ මට්ටම' : '🏁 ක්‍රීඩාව අවසන්'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinhalaGamePage;