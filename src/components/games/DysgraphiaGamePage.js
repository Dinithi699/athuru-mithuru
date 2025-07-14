import React, { useState, useEffect, useCallback, useRef } from 'react';

const DysgraphiaGamePage = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per word
  const [responses, setResponses] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [writingPhase, setWritingPhase] = useState('instruction'); // instruction, writing, camera, captured, analyzing
  const [analysisResult, setAnalysisResult] = useState(null);
  const [writingStartTime, setWritingStartTime] = useState(null);
  const [cameraStartTime, setCameraStartTime] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Game data for each level - same as before
  const gameData = {
    1: [
      { 
        word: 'CAT', 
        image: '/images/cat.png', 
        audio: 'cat',
        description: 'බළලා',
        isCustomImage: true
      },
      { 
        word: 'SUN', 
        image: '/images/sun.png', 
        audio: 'sun',
        description: 'සූර්යයා',
        isCustomImage: true
      }
    ],
    2: [
      { 
        word: 'BOOK', 
        image: '/images/book.png', 
        audio: 'book',
        description: 'පොත',
        isCustomImage: true
      },
      { 
        word: 'SHIP', 
        image: '/images/ship.png', 
        audio: 'ship',
        description: 'නැව',
        isCustomImage: true
      }
    ],
    3: [
      { 
        word: 'APPLE', 
        image: '/images/apple.png', 
        audio: 'apple',
        description: 'ඇපල්',
        isCustomImage: true
      },
      { 
        word: 'CHAIR', 
        image: '/images/chair.png', 
        audio: 'chair',
        description: 'පුටුව',
        isCustomImage: true
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

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Use front camera for better accessibility
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        streamRef.current = stream;
        setCameraActive(true);
        setCameraStartTime(Date.now());
        setWritingPhase('camera');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Try with different constraints if the first attempt fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
          streamRef.current = fallbackStream;
          setCameraActive(true);
          setCameraStartTime(Date.now());
          setWritingPhase('camera');
        }
      } catch (fallbackError) {
        console.error('Fallback camera access failed:', fallbackError);
        alert('කැමරාවට ප්‍රවේශ වීමට නොහැකි විය. කරුණාකර:\n1. කැමරා අවසර ලබා දෙන්න\n2. Browser settings පරීක්ෂා කරන්න\n3. HTTPS connection භාවිතා කරන්න');
        setWritingPhase('writing'); // Go back to writing phase
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Ensure we have valid dimensions
      if (canvas.width > 0 && canvas.height > 0) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setWritingPhase('captured');
        stopCamera();
        
        // Simulate handwriting analysis
        setTimeout(() => {
          analyzeHandwriting(imageData);
        }, 1000);
      } else {
        alert('කැමරා තවමත් සූදානම් නොවේ. කරුණාකර මොහොතක් රැඳී සිට නැවත උත්සාහ කරන්න.');
      }
    } else {
      alert('කැමරා සූදානම් නොවේ. කරුණාකර මොහොතක් රැඳී සිට නැවත උත්සාහ කරන්න.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(); // Restart camera instead of going back to writing
  };

  // Add a function to check camera readiness
  const isCameraReady = () => {
    return videoRef.current && 
           videoRef.current.readyState === 4 && 
           videoRef.current.videoWidth > 0 && 
           videoRef.current.videoHeight > 0;
  };

  // Add state for camera readiness
  const [cameraReady, setCameraReady] = useState(false);

  // Monitor camera readiness
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const checkReady = () => {
        setCameraReady(isCameraReady());
      };
      
      videoRef.current.addEventListener('loadedmetadata', checkReady);
      videoRef.current.addEventListener('canplay', checkReady);
      
      const interval = setInterval(checkReady, 500);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', checkReady);
          videoRef.current.removeEventListener('canplay', checkReady);
        }
        clearInterval(interval);
      };
    }

  // Simulated handwriting analysis
  const analyzeHandwriting = (imageData) => {
    setWritingPhase('analyzing');
    
    // Simulate analysis time
    setTimeout(() => {
      const currentQ = currentQuestions[currentQuestion];
      const writingTime = writingStartTime ? (Date.now() - writingStartTime) / 1000 : 0;
      const cameraTime = cameraStartTime ? (Date.now() - cameraStartTime) / 1000 : 0;
      const totalTime = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;
      
      // Simulate analysis results based on various factors
      const analysisFactors = {
        writingTime: writingTime,
        cameraTime: cameraTime,
        totalTime: totalTime,
        wordLength: currentQ.word.length,
        level: currentLevel
      };
      
      // Simulate different analysis outcomes
      const outcomes = ['excellent', 'good', 'fair', 'needs_attention', 'concerning'];
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      const analysis = generateAnalysisResult(randomOutcome, analysisFactors, currentQ.word);
      
      setAnalysisResult(analysis);
      
      // Calculate score based on analysis
      let questionScore = 0;
      if (analysis.overallRating === 'excellent') questionScore = 100;
      else if (analysis.overallRating === 'good') questionScore = 80;
      else if (analysis.overallRating === 'fair') questionScore = 60;
      else if (analysis.overallRating === 'needs_attention') questionScore = 40;
      else questionScore = 20;
      
      setScore(prev => prev + questionScore);
      
      // Store response data
      const responseData = {
        question: currentQuestion,
        word: currentQ.word,
        writingTime: writingTime,
        cameraTime: cameraTime,
        totalTime: totalTime,
        analysisResult: analysis,
        score: questionScore,
        imageData: imageData // Store for potential future analysis
      };
      
      setResponses(prev => [...prev, responseData]);
      setShowResult(true);
      
      setTimeout(() => {
        nextQuestion();
      }, 5000);
    }, 3000);
  };

  const generateAnalysisResult = (outcome, factors, word) => {
    const analyses = {
      excellent: {
        overallRating: 'excellent',
        letterFormation: 'විශිෂ්ට',
        spacing: 'නිවැරදි',
        alignment: 'හොඳ',
        pressure: 'සමබර',
        fluency: 'ගලන්',
        feedback: 'ඉතා හොඳ අකුරු ලිවීමේ කුසලතාවක්! අකුරු පැහැදිලි සහ හොඳින් සකස් කර ඇත.',
        riskLevel: 'අඩු',
        recommendations: [
          'වර්තමාන ප්‍රගතිය දිගටම කරගෙන යන්න',
          'වඩාත් සංකීර්ණ වචන සමඟ අභ්‍යාස කරන්න'
        ]
      },
      good: {
        overallRating: 'good',
        letterFormation: 'හොඳ',
        spacing: 'බොහෝ දුරට නිවැරදි',
        alignment: 'සාධාරණ',
        pressure: 'සමබර',
        fluency: 'හොඳ',
        feedback: 'හොඳ අකුරු ලිවීමේ කුසලතාවක්. සුළු වැඩිදියුණු කිරීම් සමඟ ඉතා හොඳ මට්ටමකට ළඟා විය හැක.',
        riskLevel: 'අඩු',
        recommendations: [
          'අකුරු අතර ඉඩ ප්‍රමාණය වැඩිදියුණු කරන්න',
          'නිතිපතා අභ්‍යාස කරන්න'
        ]
      },
      fair: {
        overallRating: 'fair',
        letterFormation: 'සාධාරණ',
        spacing: 'අනියමිත',
        alignment: 'සුළු ගැටලු',
        pressure: 'වෙනස්වන',
        fluency: 'මන්දගාමී',
        feedback: 'අකුරු ලිවීමේ කුසලතා වර්ධනය වෙමින් පවතී. අමතර අභ්‍යාස සහ මග පෙන්වීම ප්‍රයෝජනවත් වේ.',
        riskLevel: 'මධ්‍යම',
        recommendations: [
          'අකුරු හැඩය වැඩිදියුණු කිරීම කෙරෙහි අවධානය යොමු කරන්න',
          'මෝටර් කුසලතා අභ්‍යාස වැඩි කරන්න',
          'ලිඛිත අභ්‍යාස නිතිපතා කරන්න'
        ]
      },
      needs_attention: {
        overallRating: 'needs_attention',
        letterFormation: 'දුෂ්කර',
        spacing: 'අසමාන',
        alignment: 'ගැටලුකාරී',
        pressure: 'අධික/අඩු',
        fluency: 'කඩාකප්පල්',
        feedback: 'අකුරු ලිවීමේ සැලකිය යුතු අභියෝග. අමතර සහාය සහ ඉලක්කගත අභ්‍යාස අවශ්‍යයි.',
        riskLevel: 'ඉහළ',
        recommendations: [
          'වෘත්තීය ප්‍රතිකාර විශේෂඥයෙකු සම්බන්ධ කරගන්න',
          'මූලික මෝටර් කුසලතා වර්ධනය කරන්න',
          'දෘශ්‍ය-මෝටර් සම්බන්ධීකරණ අභ්‍යාස',
          'ලිඛිත කාර්යයන් සඳහා අමතර කාලය ලබා දෙන්න'
        ]
      },
      concerning: {
        overallRating: 'concerning',
        letterFormation: 'ඉතා දුෂ්කර',
        spacing: 'අක්‍රමවත්',
        alignment: 'දුර්වල',
        pressure: 'අස්ථිර',
        fluency: 'ඉතා මන්දගාමී',
        feedback: 'අකුරු ලිවීමේ සැලකිය යුතු දුෂ්කරතා ඩිස්ග්‍රැෆියා අවදානමක් යෝජනා කරයි. වහාම වෘත්තීය තක්සේරුවක් අවශ්‍යයි.',
        riskLevel: 'ඉතා ඉහළ',
        recommendations: [
          'වහාම වෘත්තීය ප්‍රතිකාර විශේෂඥයෙකු සම්බන්ධ කරගන්න',
          'සවිස්තරාත්මක ඩිස්ග්‍රැෆියා තක්සේරුවක් කරවන්න',
          'විකල්ප ලිඛිත ක්‍රම සලකා බලන්න',
          'අධ්‍යාපන සහාය සැලසුම් සකස් කරන්න'
        ]
      }
    };
    
    return analyses[outcome];
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && !showResult && timeLeft > 0 && writingPhase !== 'analyzing') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, gameCompleted, showResult, writingPhase]);

  const handleTimeUp = useCallback(() => {
    const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 120;
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      word: currentQuestions[currentQuestion].word,
      writingTime: 120,
      cameraTime: 0,
      totalTime: timeTaken,
      analysisResult: {
        overallRating: 'timeout',
        feedback: 'කාලය අවසන්. ප්‍රශ්නය සම්පූර්ණ කිරීමට නොහැකි විය.',
        riskLevel: 'අනිශ්චිත'
      },
      score: 0,
      imageData: null
    }]);
    
    nextQuestion();
  }, [currentQuestion, currentQuestions, questionStartTime]);

  // Initialize question
  useEffect(() => {
    if (gameStarted && currentQuestion < totalQuestions) {
      initializeQuestion();
    }
  }, [currentQuestion, gameStarted]);

  const initializeQuestion = () => {
    const currentWord = currentQuestions[currentQuestion];
    setWritingPhase('instruction');
    setShowResult(false);
    setQuestionStartTime(Date.now());
    setCapturedImage(null);
    setAnalysisResult(null);
    setTimeLeft(120); // 2 minutes per word
    
    // Auto-play the word pronunciation
    setTimeout(() => {
      speakWord(currentWord.word);
    }, 1000);
  };

  const startWriting = () => {
    setWritingPhase('writing');
    setWritingStartTime(Date.now());
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setResponses([]);
    setTimeLeft(120);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeLevel();
    }
  };

  const completeLevel = () => {
    setGameCompleted(true);
    stopCamera(); // Ensure camera is stopped
  };

  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setGameStarted(false);
      setGameCompleted(false);
      setCurrentQuestion(0);
      setScore(0);
      setResponses([]);
      setTimeLeft(120);
    }
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'සරල 3-අකුරු වචන (අකුරු ලිවීම)',
      2: 'මධ්‍යම 4-අකුරු වචන (අකුරු ලිවීම)',
      3: 'අභියෝගාත්මක 5-අකුරු වචන (අකුරු ලිවීම)'
    };
    return descriptions[level];
  };

  const getDysgraphiaAnalysis = () => {
    const totalResponses = responses.length;
    const averageScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses;
    const averageWritingTime = responses.reduce((sum, r) => sum + r.writingTime, 0) / totalResponses;
    const averageTotalTime = responses.reduce((sum, r) => sum + r.totalTime, 0) / totalResponses;
    
    const riskLevels = responses.map(r => r.analysisResult?.riskLevel).filter(Boolean);
    const highRiskCount = riskLevels.filter(level => level === 'ඉහළ' || level === 'ඉතා ඉහළ').length;
    const mediumRiskCount = riskLevels.filter(level => level === 'මධ්‍යම').length;
    
    let overallRiskLevel = 'අඩු';
    let analysis = '';
    let recommendations = [];
    
    if (highRiskCount > totalResponses / 2) {
      overallRiskLevel = 'ඉහළ';
      analysis = 'අකුරු ලිවීමේ සැලකිය යුතු දුෂ්කරතා ඩිස්ග්‍රැෆියා අවදානමක් යෝජනා කරයි. වෘත්තීය තක්සේරුවක් නිර්දේශ කරනු ලැබේ.';
      recommendations = [
        'වෘත්තීය ප්‍රතිකාර විශේෂඥයෙකු සම්බන්ධ කරගන්න',
        'සවිස්තරාත්මක ඩිස්ග්‍රැෆියා තක්සේරුවක් කරවන්න',
        'මෝටර් කුසලතා වර්ධන ක්‍රියාකාරකම්',
        'ලිඛිත කාර්යයන් සඳහා අමතර කාලය සහ සහාය'
      ];
    } else if (mediumRiskCount > 0 || averageScore < 70) {
      overallRiskLevel = 'මධ්‍යම';
      analysis = 'අකුරු ලිවීමේ සමහර අභියෝග. ඉලක්කගත සහාය සහ අභ්‍යාස සමඟ වැඩිදියුණු කළ හැක.';
      recommendations = [
        'නිතිපතා අකුරු ලිවීමේ අභ්‍යාස',
        'මෝටර් කුසලතා වර්ධන ක්‍රියාකාරකම්',
        'ප්‍රගතිය නිරීක්ෂණය කරන්න',
        'අධ්‍යාපන සහාය සලකා බලන්න'
      ];
    } else {
      analysis = 'හොඳ අකුරු ලිවීමේ කුසලතා. සාමාන්‍ය වර්ධනයක් පෙන්නුම් කරයි.';
      recommendations = [
        'වර්තමාන ප්‍රගතිය දිගටම කරගෙන යන්න',
        'වඩාත් සංකීර්ණ ලිඛිත කාර්යයන් උත්සාහ කරන්න',
        'නිර්මාණාත්මක ලිවීම දිරිමත් කරන්න'
      ];
    }
    
    return { 
      averageScore: averageScore.toFixed(1), 
      averageWritingTime: averageWritingTime.toFixed(1), 
      averageTotalTime: averageTotalTime.toFixed(1),
      overallRiskLevel, 
      analysis, 
      recommendations 
    };
  };

  // Helper function to render image
  const renderImage = (currentQ) => {
    if (currentQ.isCustomImage) {
      return (
        <img 
          src={currentQ.image} 
          alt={currentQ.description}
          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-3 sm:mb-4 object-contain animate-pulse"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
        />
      );
    } else {
      return (
        <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-3 sm:mb-4 animate-pulse">{currentQ.image}</div>
      );
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">අකුරු ලිවීමේ තක්සේරුව</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 px-4">පින්තූරය බලා, ශබ්දය අසා, කඩදාසියේ වචනය ලියා කැමරාවට පෙන්වන්න!</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">මට්ටම {currentLevel}</h2>
            <p className="text-lg sm:text-xl mb-4 sm:mb-6">{getLevelDescription(currentLevel)}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">වචන ගණන</div>
                <div className="text-xl sm:text-2xl font-bold">{totalQuestions}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">වචනයකට කාලය</div>
                <div className="text-xl sm:text-2xl font-bold">2 මිනිත්තු</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">තක්සේරු ක්‍රමය</div>
                <div className="text-lg sm:text-xl font-bold">කැමරා</div>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">ක්‍රීඩා කරන ආකාරය</h3>
              <ul className="text-left space-y-1 sm:space-y-2 max-w-md mx-auto text-sm sm:text-base">
                <li>• පින්තූරය බලන්න සහ ශබ්දය අසන්න</li>
                <li>• කඩදාසියක වචනය පැහැදිලිව ලියන්න</li>
                <li>• කැමරාව ආරම්භ කර ලියූ වචනය පෙන්වන්න</li>
                <li>• ඡායාරූපයක් ගෙන AI විශ්ලේෂණය බලන්න</li>
                <li>• 🔊 බොත්තම ක්ලික් කර නැවත අසන්න</li>
                <li>• අකුරු ලිවීමේ තත්ත්වය ගැන විස්තරාත්මක ප්‍රතිපෝෂණ ලැබෙයි</li>
              </ul>
            </div>
            
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-500/20 rounded-lg">
              <h4 className="text-base sm:text-lg font-bold mb-2">⚠️ අවශ්‍ය දේවල්</h4>
              <ul className="text-left space-y-1 text-sm sm:text-base">
                <li>• කඩදාසියක් සහ පෑනක්</li>
                <li>• කැමරා අවසර</li>
                <li>• හොඳ ආලෝකය</li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="bg-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
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
    const analysis = getDysgraphiaAnalysis();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-3xl w-full">
          <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">
            {analysis.overallRiskLevel === 'අඩු' ? '🎉' : analysis.overallRiskLevel === 'මධ්‍යම' ? '⚠️' : '🔍'}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">මට්ටම {currentLevel} සම්පූර්ණයි!</h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">සාමාන්‍ය ලකුණු</div>
                <div className="text-2xl sm:text-3xl font-bold">{analysis.averageScore}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">ලිවීමේ කාලය</div>
                <div className="text-lg sm:text-xl font-bold">{analysis.averageWritingTime}තත්</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">සම්පූර්ණ කාලය</div>
                <div className="text-lg sm:text-xl font-bold">{analysis.averageTotalTime}තත්</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm opacity-80">අවදානම් මට්ටම</div>
                <div className={`text-lg sm:text-xl font-bold ${
                  analysis.overallRiskLevel === 'අඩු' ? 'text-green-300' : 
                  analysis.overallRiskLevel === 'මධ්‍යම' ? 'text-yellow-300' : 'text-red-300'
                }`}>
                  {analysis.overallRiskLevel}
                </div>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/10 rounded-lg text-left">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">ඩිස්ග්‍රැෆියා AI තක්සේරු විශ්ලේෂණය</h3>
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
                className="bg-white text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
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
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="text-left">
            <div className="text-sm sm:text-base md:text-lg font-bold">මට්ටම {currentLevel}</div>
            <div className="text-xs sm:text-sm opacity-80">වචනය {currentQuestion + 1}/{totalQuestions}</div>
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
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${timeLeft <= 30 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 mb-4 sm:mb-6">
          <div 
            className="bg-white h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Game Area */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Image and Audio */}
          <div className="mb-6 sm:mb-8">
            {renderImage(currentQ)}
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">{currentQ.description}</div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-yellow-300">
              {currentQ.word}
            </div>
            <button
              onClick={() => speakWord(currentQ.word)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              🔊 නැවත අසන්න
            </button>
          </div>

          {/* Phase-based Content */}
          {writingPhase === 'instruction' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-yellow-500/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📝 උපදෙස්</h3>
                <ol className="text-left space-y-2 max-w-md mx-auto text-sm sm:text-base">
                  <li>1. කඩදාසියක් සහ පෑනක් සූදානම් කරන්න</li>
                  <li>2. ඉහත වචනය පැහැදිලිව ලියන්න</li>
                  <li>3. ලිවීම අවසන් වූ පසු "ලිවීම අවසන්" ක්ලික් කරන්න</li>
                  <li>4. කැමරාව ආරම්භ කර ලියූ වචනය පෙන්වන්න</li>
                </ol>
              </div>
              <button
                onClick={startWriting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105"
              >
                ✍️ ලිවීම ආරම්භ කරන්න
              </button>
            </div>
          )}

          {writingPhase === 'writing' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-500/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">✍️ ලිවීම</h3>
                <p className="text-sm sm:text-base mb-4">කඩදාසියේ "<span className="font-bold text-yellow-300">{currentQ.word}</span>" වචනය පැහැදිලිව ලියන්න</p>
                <div className="text-2xl sm:text-3xl animate-pulse">📝</div>
              </div>
              <button
                onClick={startCamera}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105"
              >
                📷 ලිවීම අවසන් - කැමරාව ආරම්භ කරන්න
              </button>
            </div>
          )}

          {writingPhase === 'camera' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-purple-500/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📷 කැමරා දර්ශනය</h3>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4 min-h-[200px] sm:min-h-[320px]">
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <div className="text-sm">කැමරා සූදානම් කරමින්...</div>
                      </div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-64 sm:h-80 object-cover ${!cameraReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                  />
                  {cameraReady && (
                    <div className="absolute inset-0 border-4 border-dashed border-yellow-400 m-4 rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs sm:text-sm">
                        ලියූ වචනය මෙම කොටුව තුළ තබන්න
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        📝 {currentQ.word}
                      </div>
                    </div>
                  )}
                </div>
                
                {cameraReady ? (
                  <p className="text-sm sm:text-base mb-4 text-green-300">
                    ✅ කැමරා සූදානම්! ලියූ කඩදාසිය කැමරාවට පෙන්වා ඡායාරූපයක් ගන්න
                  </p>
                ) : (
                  <p className="text-sm sm:text-base mb-4 text-yellow-300">
                    ⏳ කැමරා සූදානම් වන තෙක් රැඳී සිටින්න...
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 sm:gap-4 justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 text-sm sm:text-base ${
                    cameraReady 
                      ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  📸 ඡායාරූපය ගන්න
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    setWritingPhase('writing');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base"
                >
                  ❌ අවලංගු කරන්න
                </button>
              </div>
            </div>
          )}

          {writingPhase === 'captured' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-green-500/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📸 ගත් ඡායාරූපය</h3>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured handwriting"
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                  )}
                </div>
                <p className="text-sm sm:text-base mb-4">ඡායාරූපය හොඳද? නැතහොත් නැවත ගන්නද?</p>
              </div>
              <div className="flex gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => analyzeHandwriting(capturedImage)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base transform hover:scale-105"
                >
                  ✅ විශ්ලේෂණය කරන්න
                </button>
                <button
                  onClick={retakePhoto}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base transform hover:scale-105"
                >
                  🔄 නැවත ගන්න
                </button>
              </div>
            </div>
          )}
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                      ලියූ වචනය මෙම කොටුව තුළ තබන්න
                    </div>
                  </div>
                </div>
                <p className="text-sm sm:text-base mb-4">ලියූ කඩදාසිය කැමරාවට පෙන්වා ඡායාරූපයක් ගන්න</p>
              </div>
            </div>
          )}

          {writingPhase === 'analyzing' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-500/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🤖 AI විශ්ලේෂණය</h3>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="text-sm sm:text-base">අකුරු ලිවීම විශ්ලේෂණය කරමින්...</span>
                </div>
                <div className="text-xs sm:text-sm opacity-80">
                  • අකුරු හැඩය පරීක්ෂා කරමින්<br/>
                  • අකුරු අතර ඉඩ ප්‍රමාණය මැනීම<br/>
                  • ලිඛිත පීඩනය තක්සේරු කරමින්<br/>
                  • සමස්ත ගුණාත්මකභාවය ගණනය කරමින්
                </div>
              </div>
            </div>
          )}

          {/* Analysis Result Display */}
          {showResult && analysisResult && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/10 rounded-lg text-left">
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-center">📊 විශ්ලේෂණ ප්‍රතිඵල</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs opacity-80">අකුරු හැඩය</div>
                  <div className="text-sm font-bold">{analysisResult.letterFormation}</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs opacity-80">ඉඩ ප්‍රමාණය</div>
                  <div className="text-sm font-bold">{analysisResult.spacing}</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs opacity-80">පෙළගැස්ම</div>
                  <div className="text-sm font-bold">{analysisResult.alignment}</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs opacity-80">ගලන බව</div>
                  <div className="text-sm font-bold">{analysisResult.fluency}</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm sm:text-base font-bold mb-2">ප්‍රතිපෝෂණ:</div>
                <p className="text-xs sm:text-sm">{analysisResult.feedback}</p>
              </div>
              
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  analysisResult.riskLevel === 'අඩු' ? 'bg-green-500' :
                  analysisResult.riskLevel === 'මධ්‍යම' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  අවදානම: {analysisResult.riskLevel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs sm:text-sm opacity-80 px-4">
          වචනය කඩදාසියේ ලියා කැමරාවට පෙන්වන්න. AI විශ්ලේෂණයෙන් ඔබේ අකුරු ලිවීමේ තත්ත්වය තක්සේරු කරනු ලැබේ.
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default DysgraphiaGamePage;