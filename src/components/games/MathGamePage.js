import React, { useState, useEffect, useRef } from 'react';

const MathGamePage = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [responses, setResponses] = useState([]);
  const [draggedLetters, setDraggedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [dragStartTime, setDragStartTime] = useState(null);
  const [totalDragTime, setTotalDragTime] = useState(0);
  const [dragCount, setDragCount] = useState(0);
  const audioRef = useRef(null);

  // Game data for each level
  const gameData = {
    1: [
      { 
        word: 'CAT', 
        image: '🐱', 
        audio: 'cat',
        description: 'බළලා'
      },
      { 
        word: 'SUN', 
        image: '☀️', 
        audio: 'sun',
        description: 'සූර්යයා'
      }
    ],
    2: [
      { 
        word: 'BOOK', 
        image: '📚', 
        audio: 'book',
        description: 'පොත'
      },
      { 
        word: 'SHIP', 
        image: '🚢', 
        audio: 'ship',
        description: 'නැව'
      }
    ],
    3: [
      { 
        word: 'APPLE', 
        image: '🍎', 
        audio: 'apple',
        description: 'ඇපල්'
      },
      { 
        word: 'CHAIR', 
        image: '🪑', 
        audio: 'chair',
        description: 'පුටුව'
      }
    ]
  };

  const currentQuestions = gameData[currentLevel];
  const totalQuestions = currentQuestions.length;

  // Text-to-speech function
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

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
  }, [timeLeft, gameStarted, gameCompleted, showResult]);

  // Initialize question
  useEffect(() => {
    if (gameStarted && currentQuestion < totalQuestions) {
      initializeQuestion();
    }
  }, [currentQuestion, gameStarted]);

  const initializeQuestion = () => {
    const currentWord = currentQuestions[currentQuestion];
    const letters = currentWord.word.split('');
    
    // Add some extra letters to make it challenging
    const extraLetters = ['A', 'E', 'I', 'O', 'U', 'B', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    const shuffledExtras = extraLetters.filter(letter => !letters.includes(letter)).sort(() => Math.random() - 0.5);
    const additionalLetters = shuffledExtras.slice(0, Math.min(4, 8 - letters.length));
    
    const allLetters = [...letters, ...additionalLetters].sort(() => Math.random() - 0.5);
    
    setAvailableLetters(allLetters.map((letter, index) => ({ id: index, letter, used: false })));
    setDraggedLetters(new Array(currentWord.word.length).fill(null));
    setShowResult(false);
    setQuestionStartTime(Date.now());
    setTotalDragTime(0);
    setDragCount(0);
    
    // Auto-play the word pronunciation
    setTimeout(() => {
      speakWord(currentWord.word);
    }, 1000);
  };

  const handleTimeUp = () => {
    const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 60;
    const averageDragTime = dragCount > 0 ? totalDragTime / dragCount : 0;
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      userAnswer: draggedLetters.map(item => item?.letter || '').join(''),
      correct: currentQuestions[currentQuestion].word,
      timeTaken: timeTaken,
      averageDragTime: averageDragTime,
      dragCount: dragCount,
      isCorrect: false,
      completed: false
    }]);
    
    nextQuestion();
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setTimeLeft(60);
  };

  const handleDragStart = (e, letterId) => {
    e.dataTransfer.setData('letterId', letterId);
    setDragStartTime(Date.now());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const letterId = parseInt(e.dataTransfer.getData('letterId'));
    const letter = availableLetters.find(l => l.id === letterId);
    
    if (letter && !letter.used) {
      const dragTime = dragStartTime ? Date.now() - dragStartTime : 0;
      setTotalDragTime(prev => prev + dragTime);
      setDragCount(prev => prev + 1);
      
      // Update available letters
      setAvailableLetters(prev => 
        prev.map(l => l.id === letterId ? { ...l, used: true } : l)
      );
      
      // Update dragged letters
      const newDraggedLetters = [...draggedLetters];
      
      // If slot is occupied, return the old letter to available
      if (newDraggedLetters[slotIndex]) {
        setAvailableLetters(prev => 
          prev.map(l => l.id === newDraggedLetters[slotIndex].id ? { ...l, used: false } : l)
        );
      }
      
      newDraggedLetters[slotIndex] = letter;
      setDraggedLetters(newDraggedLetters);
      
      // Check if word is complete
      if (newDraggedLetters.every(item => item !== null)) {
        checkAnswer(newDraggedLetters);
      }
    }
  };

  const handleLetterClick = (letterId) => {
    const letter = availableLetters.find(l => l.id === letterId);
    
    if (letter && !letter.used) {
      // Find first empty slot
      const emptySlotIndex = draggedLetters.findIndex(item => item === null);
      
      if (emptySlotIndex !== -1) {
        const dragTime = 500; // Simulate drag time for click
        setTotalDragTime(prev => prev + dragTime);
        setDragCount(prev => prev + 1);
        
        // Update available letters
        setAvailableLetters(prev => 
          prev.map(l => l.id === letterId ? { ...l, used: true } : l)
        );
        
        // Update dragged letters
        const newDraggedLetters = [...draggedLetters];
        newDraggedLetters[emptySlotIndex] = letter;
        setDraggedLetters(newDraggedLetters);
        
        // Check if word is complete
        if (newDraggedLetters.every(item => item !== null)) {
          checkAnswer(newDraggedLetters);
        }
      }
    }
  };

  const removeLetterFromSlot = (slotIndex) => {
    const letter = draggedLetters[slotIndex];
    if (letter) {
      // Return letter to available
      setAvailableLetters(prev => 
        prev.map(l => l.id === letter.id ? { ...l, used: false } : l)
      );
      
      // Remove from slot
      const newDraggedLetters = [...draggedLetters];
      newDraggedLetters[slotIndex] = null;
      setDraggedLetters(newDraggedLetters);
    }
  };

  const checkAnswer = (letters) => {
    const userWord = letters.map(item => item?.letter || '').join('');
    const correctWord = currentQuestions[currentQuestion].word;
    const isCorrect = userWord === correctWord;
    
    const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;
    const averageDragTime = dragCount > 0 ? totalDragTime / dragCount : 0;
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      userAnswer: userWord,
      correct: correctWord,
      timeTaken: timeTaken,
      averageDragTime: averageDragTime,
      dragCount: dragCount,
      isCorrect: isCorrect,
      completed: true
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60);
    } else {
      completeLevel();
    }
  };

  const completeLevel = () => {
    setGameCompleted(true);
  };

  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setGameStarted(false);
      setGameCompleted(false);
      setCurrentQuestion(0);
      setScore(0);
      setResponses([]);
      setTimeLeft(60);
    }
  };

  const restartGame = () => {
    setCurrentLevel(1);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setTimeLeft(60);
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'සරල 3-අකුරු වචන',
      2: 'මධ්‍යම 4-අකුරු වචන',
      3: 'අභියෝගාත්මක 5-අකුරු වචන'
    };
    return descriptions[level];
  };

  const getDysgraphiaAnalysis = () => {
    const totalResponses = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const completedResponses = responses.filter(r => r.completed).length;
    const averageTime = responses.reduce((sum, r) => sum + r.timeTaken, 0) / totalResponses;
    const averageDragTime = responses.reduce((sum, r) => sum + r.averageDragTime, 0) / totalResponses;
    const averageDragCount = responses.reduce((sum, r) => sum + r.dragCount, 0) / totalResponses;
    const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
    
    let riskLevel = 'අඩු';
    let analysis = '';
    let recommendations = [];
    
    // Dysgraphia risk assessment based on multiple factors
    const timeThreshold = currentLevel === 1 ? 30 : currentLevel === 2 ? 45 : 50;
    const dragTimeThreshold = 2000; // 2 seconds per drag
    const dragCountThreshold = currentLevel === 1 ? 6 : currentLevel === 2 ? 8 : 10;
    
    if (accuracy < 50 || averageTime > timeThreshold * 1.5 || averageDragTime > dragTimeThreshold * 1.5 || averageDragCount > dragCountThreshold * 1.5) {
      riskLevel = 'ඉහළ';
      analysis = 'අකුරු හඳුනාගැනීම, අකුරු අනුක්‍රමය සහ ලිඛිත ක්‍රියාකාරකම්වල සැලකිය යුතු දුෂ්කරතා ඩිස්ග්‍රැෆියා අවදානමක් යෝජනා කරයි.';
      recommendations = [
        'අකුරු හඳුනාගැනීමේ ක්‍රියාකාරකම් අභ්‍යාස කරන්න',
        'ලිඛිත මෝටර් කුසලතා වර්ධනය කරන්න',
        'දෘශ්‍ය-මෝටර් සම්බන්ධීකරණ අභ්‍යාස',
        'වෘත්තීය ප්‍රතිකාර විශේෂඥයෙකු සම්බන්ධ කරගන්න',
        'ලිඛිත කාර්යයන් සඳහා අමතර කාලය ලබා දෙන්න'
      ];
    } else if (accuracy < 70 || averageTime > timeThreshold || averageDragTime > dragTimeThreshold || averageDragCount > dragCountThreshold) {
      riskLevel = 'මධ්‍යම';
      analysis = 'ලිඛිත කුසලතා සහ අකුරු සැකසීමේ සමහර අභියෝග. ඉලක්කගත සහාය සමඟ ප්‍රගතිය කළ හැක.';
      recommendations = [
        'අකුරු හඳුනාගැනීමේ ක්‍රීඩා නිතිපතා කරන්න',
        'ලිඛිත අභ්‍යාස වැඩි කරන්න',
        'මල්ටිසෙන්සරි ඉගෙනුම් ක්‍රම භාවිතා කරන්න',
        'ලිඛිත කාර්යයන්හි ප්‍රගතිය නිරීක්ෂණය කරන්න',
        'ධනාත්මක ප්‍රතිපෝෂණ ලබා දෙන්න'
      ];
    } else {
      analysis = 'හොඳ අකුරු හඳුනාගැනීම සහ ලිඛිත කුසලතා. සාමාන්‍ය වර්ධනයක් පෙන්නුම් කරයි.';
      recommendations = [
        'වර්තමාන ප්‍රගතිය දිගටම කරගෙන යන්න',
        'වඩාත් සංකීර්ණ වචන සමඟ අභ්‍යාස කරන්න',
        'නිර්මාණාත්මක ලිඛිත ක්‍රියාකාරකම් දිරිමත් කරන්න',
        'කියවීම සහ ලිවීම ඒකාබද්ධ කරන්න'
      ];
    }
    
    return { 
      accuracy, 
      averageTime, 
      averageDragTime, 
      averageDragCount, 
      completionRate, 
      riskLevel, 
      analysis, 
      recommendations 
    };
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="text-8xl mb-8 animate-bounce">✍️</div>
          <h1 className="text-5xl font-bold mb-8">වචන අකුරු සැකසීම</h1>
          <p className="text-2xl mb-8">පින්තූරය බලා, ශබ්දය අසා, අකුරු ඇදගෙන වචනය සාදන්න!</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">මට්ටම {currentLevel}</h2>
            <p className="text-xl mb-6">{getLevelDescription(currentLevel)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">වචන ගණන</div>
                <div className="text-2xl font-bold">{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">වචනයකට කාලය</div>
                <div className="text-2xl font-bold">60 තත්පර</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">මට්ටම</div>
                <div className="text-2xl font-bold">{currentLevel}/3</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">ක්‍රීඩා කරන ආකාරය</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li>• පින්තූරය බලන්න සහ ශබ්දය අසන්න</li>
                <li>• අකුරු ඇදගෙන හෝ ක්ලික් කර නිවැරදි ස්ථානයට දමන්න</li>
                <li>• වචනය සම්පූර්ණ කරන්න</li>
                <li>• 🔊 බොත්තම ක්ලික් කර නැවත අසන්න</li>
                <li>• වැරදි අකුරු ඉවත් කිරීමට ඒවා ක්ලික් කරන්න</li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              🚀 ක්‍රීඩාව ආරම්භ කරන්න
            </button>
          </div>
          
          <button
            onClick={onBack}
            className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-300"
          >
            ← ආපසු යන්න
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const analysis = getDysgraphiaAnalysis();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-3xl">
          <div className="text-8xl mb-8">
            {analysis.riskLevel === 'අඩු' ? '🎉' : analysis.riskLevel === 'මධ්‍යම' ? '⚠️' : '🔍'}
          </div>
          <h1 className="text-5xl font-bold mb-8">මට්ටම {currentLevel} සම්පූර්ණයි!</h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">ලකුණු</div>
                <div className="text-3xl font-bold">{score}/{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">නිරවද්‍යතාව</div>
                <div className="text-3xl font-bold">{analysis.accuracy.toFixed(1)}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">සාමාන්‍ය කාලය</div>
                <div className="text-2xl font-bold">{analysis.averageTime.toFixed(1)}තත්</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">අවදානම් මට්ටම</div>
                <div className={`text-xl font-bold ${
                  analysis.riskLevel === 'අඩු' ? 'text-green-300' : 
                  analysis.riskLevel === 'මධ්‍යම' ? 'text-yellow-300' : 'text-red-300'
                }`}>
                  {analysis.riskLevel}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">සාමාන්‍ය ඇදගැනීමේ කාලය</div>
                <div className="text-xl font-bold">{(analysis.averageDragTime / 1000).toFixed(1)}තත්</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">සාමාන්‍ය ඇදගැනීම් ගණන</div>
                <div className="text-xl font-bold">{analysis.averageDragCount.toFixed(1)}</div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-white/10 rounded-lg text-left">
              <h3 className="text-xl font-bold mb-3">ඩිස්ග්‍රැෆියා තක්සේරු විශ්ලේෂණය</h3>
              <p className="text-lg mb-4">{analysis.analysis}</p>
              
              <h4 className="text-lg font-bold mb-2">නිර්දේශ:</h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              {currentLevel < 3 && analysis.accuracy >= 40 && (
                <button
                  onClick={nextLevel}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105"
                >
                  ඊළඟ මට්ටම →
                </button>
              )}
              
              <button
                onClick={restartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105"
              >
                🔄 නැවත ආරම්භ කරන්න
              </button>
              
              <button
                onClick={onBack}
                className="bg-white text-red-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
              >
                ← ආපසු යන්න
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <div className="text-lg font-bold">මට්ටම {currentLevel}</div>
            <div className="text-sm opacity-80">වචනය {currentQuestion + 1}/{totalQuestions}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">ලකුණු: {score}</div>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏰ {timeLeft}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-6">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Game Area */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          {/* Image and Audio */}
          <div className="mb-8">
            <div className="text-9xl mb-4 animate-pulse">{currentQ.image}</div>
            <div className="text-2xl font-bold mb-2">{currentQ.description}</div>
            <button
              onClick={() => speakWord(currentQ.word)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 flex items-center gap-2 mx-auto"
            >
              🔊 නැවත අසන්න
            </button>
          </div>

          {/* Word Slots */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">වචනය සාදන්න:</h3>
            <div className="flex justify-center gap-2 mb-6">
              {draggedLetters.map((letter, index) => (
                <div
                  key={index}
                  className="w-16 h-16 bg-white/30 border-2 border-white/50 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer hover:bg-white/40 transition-colors duration-300"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => removeLetterFromSlot(index)}
                >
                  {letter ? letter.letter : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Available Letters */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">අකුරු:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {availableLetters.map((letter) => (
                <div
                  key={letter.id}
                  draggable={!letter.used}
                  onDragStart={(e) => handleDragStart(e, letter.id)}
                  onClick={() => handleLetterClick(letter.id)}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                    letter.used 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-white text-red-600 hover:bg-gray-100 shadow-lg'
                  }`}
                >
                  {letter.letter}
                </div>
              ))}
            </div>
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <div className={`text-2xl font-bold mb-2 ${
                responses[responses.length - 1]?.isCorrect ? 'text-green-300' : 'text-red-300'
              }`}>
                {responses[responses.length - 1]?.isCorrect ? '🎉 නිවැරදියි!' : '❌ වැරදියි!'}
              </div>
              <div className="text-lg">
                ඔබේ පිළිතුර: <span className="font-bold">{responses[responses.length - 1]?.userAnswer}</span>
              </div>
              <div className="text-lg">
                නිවැරදි වචනය: <span className="font-bold">{currentQ.word}</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm opacity-80">
          අකුරු ඇදගෙන හෝ ක්ලික් කර නිවැරදි ස්ථානයට දමන්න. වැරදි අකුරු ඉවත් කිරීමට ඒවා ක්ලික් කරන්න.
        </div>
      </div>
    </div>
  );
};

export default MathGamePage;