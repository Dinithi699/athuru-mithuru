import React, { useState, useEffect } from 'react';

const EnglishGamePage = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [responses, setResponses] = useState([]);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Game data for each level
  const gameData = {
    1: [
      { left: 3, right: 7, correct: 'right', type: 'numbers' },
      { left: 9, right: 2, correct: 'left', type: 'numbers' },
      { left: 8, right: 8, correct: 'same', type: 'numbers' }
    ],
    2: [
      { left: 21, right: 12, correct: 'left', type: 'numbers' },
      { left: 88, right: 99, correct: 'right', type: 'numbers' },
      { left: 36, right: 36, correct: 'same', type: 'numbers' }
    ],
    3: [
      { left: '1+2', right: '7+2', leftValue: 3, rightValue: 9, correct: 'right', type: 'expressions' },
      { left: '9+1', right: '5+5', leftValue: 10, rightValue: 10, correct: 'same', type: 'expressions' },
      { left: '6+3', right: '4+4', leftValue: 9, rightValue: 8, correct: 'left', type: 'expressions' }
    ]
  };

  const currentQuestions = gameData[currentLevel];
  const totalQuestions = currentQuestions.length;

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

  // Set question start time when new question begins
  useEffect(() => {
    if (gameStarted && !showResult) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameStarted, showResult]);

  const handleTimeUp = () => {
    const reactionTime = questionStartTime ? Date.now() - questionStartTime : 15000;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      userAnswer: null,
      correct: currentQuestions[currentQuestion].correct,
      timeTaken: 15,
      reactionTime: reactionTime,
      isCorrect: false
    }]);
    nextQuestion();
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setReactionTimes([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer || showResult) return;
    
    const reactionTime = questionStartTime ? Date.now() - questionStartTime : 0;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestions[currentQuestion].correct;
    const timeTaken = 15 - timeLeft;
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      userAnswer: answer,
      correct: currentQuestions[currentQuestion].correct,
      timeTaken: timeTaken,
      reactionTime: reactionTime,
      isCorrect: isCorrect
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
      setQuestionStartTime(Date.now());
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
      setReactionTimes([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
    }
  };

  const restartGame = () => {
    setCurrentLevel(1);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setReactionTimes([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'Basic Number Comparison (1-10)',
      2: 'Large Numbers & Place Values',
      3: 'Simple Addition Expressions'
    };
    return descriptions[level];
  };

  const getDyscalculiaAnalysis = () => {
    const totalResponses = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const averageTime = responses.reduce((sum, r) => sum + r.timeTaken, 0) / totalResponses;
    const averageReactionTime = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
    const accuracy = (correctResponses / totalResponses) * 100;
    
    let riskLevel = 'Low';
    let analysis = '';
    let recommendations = [];
    
    // Dyscalculia risk assessment
    if (currentLevel === 1) {
      if (accuracy < 70 || averageReactionTime > 8000) {
        riskLevel = 'High';
        analysis = 'Difficulty with basic number recognition and comparison may indicate dyscalculia risk.';
        recommendations = [
          'Practice number recognition activities',
          'Use visual aids for number comparison',
          'Consider professional assessment'
        ];
      } else if (accuracy < 85 || averageReactionTime > 5000) {
        riskLevel = 'Medium';
        analysis = 'Some challenges with number processing. Monitor progress with additional practice.';
        recommendations = [
          'Regular number comparison exercises',
          'Use manipulatives for counting',
          'Practice with number lines'
        ];
      } else {
        analysis = 'Good basic number recognition and comparison skills.';
        recommendations = [
          'Continue with more challenging number activities',
          'Introduce place value concepts'
        ];
      }
    } else if (currentLevel === 2) {
      if (accuracy < 60 || averageReactionTime > 10000) {
        riskLevel = 'High';
        analysis = 'Significant difficulty with place value understanding suggests dyscalculia risk.';
        recommendations = [
          'Focus on place value understanding',
          'Use base-10 blocks for visualization',
          'Seek educational support specialist'
        ];
      } else if (accuracy < 75 || averageReactionTime > 7000) {
        riskLevel = 'Medium';
        analysis = 'Place value concepts need reinforcement. Continue targeted practice.';
        recommendations = [
          'Practice with tens and ones',
          'Use visual place value charts',
          'Regular number comparison drills'
        ];
      } else {
        analysis = 'Good understanding of place value and number comparison.';
        recommendations = [
          'Introduce more complex number concepts',
          'Practice with larger numbers'
        ];
      }
    } else if (currentLevel === 3) {
      if (accuracy < 50 || averageReactionTime > 12000) {
        riskLevel = 'High';
        analysis = 'Difficulty with basic arithmetic suggests significant dyscalculia risk.';
        recommendations = [
          'Focus on concrete addition strategies',
          'Use manipulatives for arithmetic',
          'Consider comprehensive assessment'
        ];
      } else if (accuracy < 70 || averageReactionTime > 8000) {
        riskLevel = 'Medium';
        analysis = 'Arithmetic processing needs support. Practice basic operations.';
        recommendations = [
          'Practice addition facts',
          'Use visual addition strategies',
          'Regular arithmetic drills'
        ];
      } else {
        analysis = 'Good basic arithmetic and comparison skills.';
        recommendations = [
          'Continue with more complex expressions',
          'Introduce subtraction comparisons'
        ];
      }
    }
    
    return { accuracy, averageTime, averageReactionTime, riskLevel, analysis, recommendations };
  };

  const getNumberDisplay = (value, isExpression = false) => {
    if (isExpression) {
      return (
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{value}</div>
          <div className="text-2xl opacity-80">
            = {currentLevel === 3 ? eval(value.replace(/[^0-9+\-*/]/g, '')) : ''}
          </div>
        </div>
      );
    }
    return <div className="text-8xl font-bold">{value}</div>;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="text-8xl mb-8 animate-bounce">🔢</div>
          <h1 className="text-5xl font-bold mb-8">Number Comparison Game</h1>
          <p className="text-2xl mb-8">Choose the larger number or identify if they're the same!</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">Level {currentLevel}</h2>
            <p className="text-xl mb-6">{getLevelDescription(currentLevel)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Questions</div>
                <div className="text-2xl font-bold">{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Time per Question</div>
                <div className="text-2xl font-bold">15 seconds</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Level</div>
                <div className="text-2xl font-bold">{currentLevel}/3</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">How to Play</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li>• Compare two numbers or expressions</li>
                <li>• Click "Left" if left number is larger</li>
                <li>• Click "Right" if right number is larger</li>
                <li>• Click "Same" if both are equal</li>
                <li>• Answer as quickly and accurately as possible</li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              🚀 Start Game
            </button>
          </div>
          
          <button
            onClick={onBack}
            className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-300"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const analysis = getDyscalculiaAnalysis();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-3xl">
          <div className="text-8xl mb-8">
            {analysis.riskLevel === 'Low' ? '🎉' : analysis.riskLevel === 'Medium' ? '⚠️' : '🔍'}
          </div>
          <h1 className="text-5xl font-bold mb-8">Level {currentLevel} Complete!</h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Score</div>
                <div className="text-3xl font-bold">{score}/{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Accuracy</div>
                <div className="text-3xl font-bold">{analysis.accuracy.toFixed(1)}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Avg Time</div>
                <div className="text-3xl font-bold">{analysis.averageTime.toFixed(1)}s</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-80">Risk Level</div>
                <div className={`text-2xl font-bold ${
                  analysis.riskLevel === 'Low' ? 'text-green-300' : 
                  analysis.riskLevel === 'Medium' ? 'text-yellow-300' : 'text-red-300'
                }`}>
                  {analysis.riskLevel}
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-white/10 rounded-lg text-left">
              <h3 className="text-xl font-bold mb-3">Assessment Analysis</h3>
              <p className="text-lg mb-4">{analysis.analysis}</p>
              
              <h4 className="text-lg font-bold mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              {currentLevel < 3 && analysis.accuracy >= 50 && (
                <button
                  onClick={nextLevel}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105"
                >
                  Next Level →
                </button>
              )}
              
              <button
                onClick={restartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105"
              >
                🔄 Restart
              </button>
              
              <button
                onClick={onBack}
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <div className="text-lg font-bold">Level {currentLevel}</div>
            <div className="text-sm opacity-80">Question {currentQuestion + 1}/{totalQuestions}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">Score: {score}</div>
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏰ {timeLeft}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-8">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-8">Which is larger?</h2>
          
          {/* Numbers/Expressions Display */}
          <div className="flex justify-center items-center gap-16 mb-12">
            {/* Left Number */}
            <div className="bg-white rounded-3xl w-64 h-48 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-blue-800">
                {getNumberDisplay(currentQ.left, currentQ.type === 'expressions')}
              </div>
            </div>
            
            <div className="text-6xl font-bold animate-pulse">VS</div>
            
            {/* Right Number */}
            <div className="bg-white rounded-3xl w-64 h-48 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-blue-800">
                {getNumberDisplay(currentQ.right, currentQ.type === 'expressions')}
              </div>
            </div>
          </div>

          {/* Answer Buttons */}
          <div className="flex gap-8 justify-center">
            <button
              onClick={() => handleAnswer('left')}
              disabled={selectedAnswer || showResult}
              className={`px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-110 ${
                showResult && currentQ.correct === 'left'
                  ? 'bg-green-500 text-white animate-bounce'
                  : showResult && selectedAnswer === 'left' && currentQ.correct !== 'left'
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === 'left'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              } ${selectedAnswer || showResult ? 'cursor-not-allowed' : ''}`}
            >
              ← Left
            </button>
            
            <button
              onClick={() => handleAnswer('same')}
              disabled={selectedAnswer || showResult}
              className={`px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-110 ${
                showResult && currentQ.correct === 'same'
                  ? 'bg-green-500 text-white animate-bounce'
                  : showResult && selectedAnswer === 'same' && currentQ.correct !== 'same'
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === 'same'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              } ${selectedAnswer || showResult ? 'cursor-not-allowed' : ''}`}
            >
              = Same
            </button>
            
            <button
              onClick={() => handleAnswer('right')}
              disabled={selectedAnswer || showResult}
              className={`px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-110 ${
                showResult && currentQ.correct === 'right'
                  ? 'bg-green-500 text-white animate-bounce'
                  : showResult && selectedAnswer === 'right' && currentQ.correct !== 'right'
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === 'right'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              } ${selectedAnswer || showResult ? 'cursor-not-allowed' : ''}`}
            >
              Right →
            </button>
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="mt-8 p-6 bg-white/10 rounded-lg">
              <div className={`text-2xl font-bold mb-3 ${
                selectedAnswer === currentQ.correct ? 'text-green-300' : 'text-red-300'
              }`}>
                {selectedAnswer === currentQ.correct ? '🎉 Correct!' : '❌ Incorrect!'}
              </div>
              <div className="text-lg">
                Correct answer: <span className="font-bold capitalize">{currentQ.correct}</span>
              </div>
              {currentQ.type === 'expressions' && (
                <div className="text-sm opacity-80 mt-2">
                  {currentQ.left} = {currentQ.leftValue}, {currentQ.right} = {currentQ.rightValue}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm opacity-80">
          Compare the numbers and choose which is larger, or select "Same" if they're equal
        </div>
      </div>
    </div>
  );
};

export default EnglishGamePage;