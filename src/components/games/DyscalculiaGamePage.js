import React, { useState, useEffect, useCallback } from 'react';

const DyscalculiaGamePage = ({ onBack }) => {
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

  // Game data for each level - 5 questions each
  const gameData = {
    1: [
      { left: 3, right: 7, correct: 'right', type: 'numbers' },
      { left: 9, right: 2, correct: 'left', type: 'numbers' },
      { left: 8, right: 8, correct: 'same', type: 'numbers' },
      { left: 5, right: 4, correct: 'left', type: 'numbers' },
      { left: 6, right: 10, correct: 'right', type: 'numbers' }
    ],
    2: [
      { left: 21, right: 12, correct: 'left', type: 'numbers' },
      { left: 88, right: 99, correct: 'right', type: 'numbers' },
      { left: 36, right: 36, correct: 'same', type: 'numbers' },
      { left: 45, right: 54, correct: 'right', type: 'numbers' },
      { left: 67, right: 76, correct: 'right', type: 'numbers' }
    ],
    3: [
      { left: '1+2', right: '7+2', leftValue: 3, rightValue: 9, correct: 'right', type: 'expressions' },
      { left: '9+1', right: '5+5', leftValue: 10, rightValue: 10, correct: 'same', type: 'expressions' },
      { left: '6+3', right: '4+4', leftValue: 9, rightValue: 8, correct: 'left', type: 'expressions' },
      { left: '3+5', right: '2+4', leftValue: 8, rightValue: 6, correct: 'left', type: 'expressions' },
      { left: '4+2', right: '3+3', leftValue: 6, rightValue: 6, correct: 'same', type: 'expressions' }
    ]
  };

  const currentQuestions = gameData[currentLevel];
  const totalQuestions = currentQuestions.length;

  // Memoized handleTimeUp function
  const handleTimeUp = useCallback(() => {
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
  }, [currentQuestion, currentQuestions, questionStartTime, nextQuestion]);

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

  // Set question start time when new question begins
  useEffect(() => {
    if (gameStarted && !showResult) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameStarted, showResult]);

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

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'මූලික සංඛ්‍යා සංසන්දනය (1-10)',
      2: 'විශාල සංඛ්‍යා සහ ස්ථාන අගයන්',
      3: 'සරල එකතු කිරීම් ප්‍රකාශන'
    };
    return descriptions[level];
  };

  const getDyscalculiaAnalysis = () => {
    const totalResponses = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const averageTime = responses.reduce((sum, r) => sum + r.timeTaken, 0) / totalResponses;
    const averageReactionTime = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
    const accuracy = (correctResponses / totalResponses) * 100;
    
    let riskLevel = 'අඩු';
    let analysis = '';
    let recommendations = [];
    
    // Dyscalculia risk assessment
    if (currentLevel === 1) {
      if (accuracy < 70 || averageReactionTime > 8000) {
        riskLevel = 'ඉහළ';
        analysis = 'මූලික සංඛ්‍යා හඳුනාගැනීම සහ සංසන්දනයේ දුෂ්කරතා ඩිස්කැල්කියුලියා අවදානමක් පෙන්නුම් කරයි.';
        recommendations = [
          'සංඛ්‍යා හඳුනාගැනීමේ ක්‍රියාකාරකම් අභ්‍යාස කරන්න',
          'සංඛ්‍යා සංසන්දනය සඳහා දෘශ්‍ය උපකරණ භාවිතා කරන්න',
          'වෘත්තීය තක්සේරුවක් සලකා බලන්න'
        ];
      } else if (accuracy < 85 || averageReactionTime > 5000) {
        riskLevel = 'මධ්‍යම';
        analysis = 'සංඛ්‍යා සැකසීමේ සමහර අභියෝග. අමතර අභ්‍යාස සමඟ ප්‍රගතිය නිරීක්ෂණය කරන්න.';
        recommendations = [
          'නිතිපතා සංඛ්‍යා සංසන්දන අභ්‍යාස',
          'ගණන් කිරීම සඳහා හස්ත ද්‍රව්‍ය භාවිතා කරන්න',
          'සංඛ්‍යා රේඛා සමඟ අභ්‍යාස කරන්න'
        ];
      } else {
        analysis = 'හොඳ මූලික සංඛ්‍යා හඳුනාගැනීම සහ සංසන්දන කුසලතා.';
        recommendations = [
          'වඩාත් අභියෝගාත්මක සංඛ්‍යා ක්‍රියාකාරකම් සමඟ ඉදිරියට යන්න',
          'ස්ථාන අගය සංකල්ප හඳුන්වා දෙන්න'
        ];
      }
    } else if (currentLevel === 2) {
      if (accuracy < 60 || averageReactionTime > 10000) {
        riskLevel = 'ඉහළ';
        analysis = 'ස්ථාන අගය අවබෝධයේ සැලකිය යුතු දුෂ්කරතා ඩිස්කැල්කියුලියා අවදානමක් යෝජනා කරයි.';
        recommendations = [
          'ස්ථාන අගය අවබෝධය කෙරෙහි අවධානය යොමු කරන්න',
          'දෘශ්‍යකරණය සඳහා base-10 කුට්ටි භාවිතා කරන්න',
          'අධ්‍යාපන සහාය විශේෂඥයෙකු සොයන්න'
        ];
      } else if (accuracy < 75 || averageReactionTime > 7000) {
        riskLevel = 'මධ්‍යම';
        analysis = 'ස්ථාන අගය සංකල්ප ශක්තිමත් කිරීම අවශ්‍යයි. ඉලක්කගත අභ්‍යාස දිගටම කරන්න.';
        recommendations = [
          'දහයන් සහ ඒකයන් සමඟ අභ්‍යාස කරන්න',
          'දෘශ්‍ය ස්ථාන අගය ප්‍රස්ථාර භාවිතා කරන්න',
          'නිතිපතා සංඛ්‍යා සංසන්දන අභ්‍යාස'
        ];
      } else {
        analysis = 'ස්ථාන අගය සහ සංඛ්‍යා සංසන්දනය පිළිබඳ හොඳ අවබෝධයක්.';
        recommendations = [
          'වඩාත් සංකීර්ණ සංඛ්‍යා සංකල්ප හඳුන්වා දෙන්න',
          'විශාල සංඛ්‍යා සමඟ අභ්‍යාස කරන්න'
        ];
      }
    } else if (currentLevel === 3) {
      if (accuracy < 50 || averageReactionTime > 12000) {
        riskLevel = 'ඉහළ';
        analysis = 'මූලික ගණිතයේ දුෂ්කරතා සැලකිය යුතු ඩිස්කැල්කියුලියා අවදානමක් යෝජනා කරයි.';
        recommendations = [
          'ස්පර්ශනීය එකතු කිරීමේ උපාය මාර්ග කෙරෙහි අවධානය යොමු කරන්න',
          'ගණිතය සඳහා හස්ත ද්‍රව්‍ය භාවිතා කරන්න',
          'සවිස්තරාත්මක තක්සේරුවක් සලකා බලන්න'
        ];
      } else if (accuracy < 70 || averageReactionTime > 8000) {
        riskLevel = 'මධ්‍යම';
        analysis = 'ගණිත සැකසීමට සහාය අවශ්‍යයි. මූලික ක්‍රියාකාරකම් අභ්‍යාස කරන්න.';
        recommendations = [
          'එකතු කිරීමේ කරුණු අභ්‍යාස කරන්න',
          'දෘශ්‍ය එකතු කිරීමේ උපාය මාර්ග භාවිතා කරන්න',
          'නිතිපතා ගණිත අභ්‍යාස'
        ];
      } else {
        analysis = 'හොඳ මූලික ගණිත සහ සංසන්දන කුසලතා.';
        recommendations = [
          'වඩාත් සංකීර්ණ ප්‍රකාශන සමඟ ඉදිරියට යන්න',
          'අඩු කිරීමේ සංසන්දන හඳුන්වා දෙන්න'
        ];
      }
    }
    
    return { accuracy, averageTime, averageReactionTime, riskLevel, analysis, recommendations };
  };

  const getNumberDisplay = (value, isExpression = false) => {
    if (isExpression) {
      return (
        <div className="text-center">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">{value}</div>
        </div>
      );
    }
    return <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold">{value}</div>;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">සංඛ්‍යා සංසන්දන ක්‍රීඩාව</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 px-4">විශාල සංඛ්‍යාව තෝරන්න හෝ ඒවා සමාන දැයි හඳුනාගන්න!</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">මට්ටම {currentLevel}</h2>
            <p className="text-lg sm:text-xl mb-4 sm:mb-6">{getLevelDescription(currentLevel)}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">ප්‍රශ්න</div>
                <div className="text-xl sm:text-2xl font-bold">{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">ප්‍රශ්නයකට කාලය</div>
                <div className="text-xl sm:text-2xl font-bold">15 තත්පර</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">මට්ටම</div>
                <div className="text-xl sm:text-2xl font-bold">{currentLevel}/3</div>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">ක්‍රීඩා කරන ආකාරය</h3>
              <ul className="text-left space-y-1 sm:space-y-2 max-w-md mx-auto text-sm sm:text-base">
                <li>• සංඛ්‍යා දෙකක් හෝ ප්‍රකාශන සංසන්දනය කරන්න</li>
                <li>• වම් සංඛ්‍යාව විශාල නම් එය ක්ලික් කරන්න</li>
                <li>• දකුණු සංඛ්‍යාව විශාල නම් එය ක්ලික් කරන්න</li>
                <li>• දෙකම සමාන නම් "සමාන" ක්ලික් කරන්න</li>
                <li>• හැකි ඉක්මනින් සහ නිවැරදිව පිළිතුරු දෙන්න</li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
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
    );
  }

  if (gameCompleted) {
    const analysis = getDyscalculiaAnalysis();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-3xl w-full">
          <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">
            {analysis.riskLevel === 'අඩු' ? '🎉' : analysis.riskLevel === 'මධ්‍යම' ? '⚠️' : '🔍'}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">මට්ටම {currentLevel} සම්පූර්ණයි!</h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">ලකුණු</div>
                <div className="text-2xl sm:text-3xl font-bold">{score}/{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">නිරවද්‍යතාව</div>
                <div className="text-2xl sm:text-3xl font-bold">{analysis.accuracy.toFixed(1)}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">සාමාන්‍ය කාලය</div>
                <div className="text-xl sm:text-2xl font-bold">{analysis.averageTime.toFixed(1)}තත්</div>
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
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">තක්සේරු විශ්ලේෂණය</h3>
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
                onClick={onBack}
                className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-4xl w-full">
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
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : ''}`}>
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">කුමන එක විශාලද?</h2>
          
          {/* Numbers/Expressions Display */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 md:gap-16 mb-6 sm:mb-8 md:mb-12">
            {/* Left Number - Clickable */}
            <button
              onClick={() => handleAnswer('left')}
              disabled={selectedAnswer || showResult}
              className={`bg-white rounded-2xl sm:rounded-3xl w-32 h-24 sm:w-48 sm:h-32 md:w-64 md:h-48 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                selectedAnswer || showResult ? 'cursor-not-allowed' : 'transform hover:scale-105 sm:hover:scale-110 hover:shadow-3xl cursor-pointer'
              } ${
                showResult && currentQ.correct === 'left'
                  ? 'bg-green-400 animate-bounce'
                  : showResult && selectedAnswer === 'left' && currentQ.correct !== 'left'
                  ? 'bg-red-400'
                  : selectedAnswer === 'left'
                  ? 'bg-blue-400'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div className={`${
                showResult && currentQ.correct === 'left' ? 'text-white' :
                showResult && selectedAnswer === 'left' && currentQ.correct !== 'left' ? 'text-white' :
                selectedAnswer === 'left' ? 'text-white' : 'text-blue-800'
              }`}>
                {getNumberDisplay(currentQ.left, currentQ.type === 'expressions')}
              </div>
            </button>
            
            <div className="text-2xl sm:text-4xl md:text-6xl font-bold animate-pulse">VS</div>
            
            {/* Right Number - Clickable */}
            <button
              onClick={() => handleAnswer('right')}
              disabled={selectedAnswer || showResult}
              className={`bg-white rounded-2xl sm:rounded-3xl w-32 h-24 sm:w-48 sm:h-32 md:w-64 md:h-48 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                selectedAnswer || showResult ? 'cursor-not-allowed' : 'transform hover:scale-105 sm:hover:scale-110 hover:shadow-3xl cursor-pointer'
              } ${
                showResult && currentQ.correct === 'right'
                  ? 'bg-green-400 animate-bounce'
                  : showResult && selectedAnswer === 'right' && currentQ.correct !== 'right'
                  ? 'bg-red-400'
                  : selectedAnswer === 'right'
                  ? 'bg-blue-400'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div className={`${
                showResult && currentQ.correct === 'right' ? 'text-white' :
                showResult && selectedAnswer === 'right' && currentQ.correct !== 'right' ? 'text-white' :
                selectedAnswer === 'right' ? 'text-white' : 'text-blue-800'
              }`}>
                {getNumberDisplay(currentQ.right, currentQ.type === 'expressions')}
              </div>
            </button>
          </div>

          {/* Same Button */}
          <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
            <button
              onClick={() => handleAnswer('same')}
              disabled={selectedAnswer || showResult}
              className={`px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-lg transform hover:scale-105 sm:hover:scale-110 ${
                showResult && currentQ.correct === 'same'
                  ? 'bg-green-500 text-white animate-bounce'
                  : showResult && selectedAnswer === 'same' && currentQ.correct !== 'same'
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === 'same'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              } ${selectedAnswer || showResult ? 'cursor-not-allowed' : ''}`}
            >
              = සමාන
            </button>
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 bg-white/10 rounded-lg">
              <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 ${
                selectedAnswer === currentQ.correct ? 'text-green-300' : 'text-red-300'
              }`}>
                {selectedAnswer === currentQ.correct ? '🎉 නිවැරදියි!' : '❌ වැරදියි!'}
              </div>
              <div className="text-sm sm:text-base md:text-lg">
                නිවැරදි පිළිතුර: <span className="font-bold">
                  {currentQ.correct === 'left' ? 'වම්' : 
                   currentQ.correct === 'right' ? 'දකුණ' : 'සමාන'}
                </span>
              </div>
              {currentQ.type === 'expressions' && (
                <div className="text-xs sm:text-sm opacity-80 mt-1 sm:mt-2">
                  {currentQ.left} = {currentQ.leftValue}, {currentQ.right} = {currentQ.rightValue}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs sm:text-sm opacity-80 px-4">
          සංඛ්‍යා සංසන්දනය කර විශාල එක ක්ලික් කරන්න, හෝ සමාන නම් "සමාන" තෝරන්න
        </div>
      </div>
    </div>
  );
};

export default DyscalculiaGamePage;