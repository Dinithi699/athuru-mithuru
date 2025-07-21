import { useState, useEffect, useCallback, useRef } from "react"
// Removed shadcn/ui imports as they are not present in your project
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"

const DysgraphiaGamePage = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [responses, setResponses] = useState([])
  const [showResult, setShowResult] = useState(false) // Controls display of captured image preview
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false) // Controls display of success message
  const [showEndingVideo, setShowEndingVideo] = useState(false)


  // Camera related states
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Game data for each level
  const gameData = {
    1: [
      {
        word: "CAT",
        image: "/images/cat.png",
        audio: "cat",
        description: "බළලා",
        isCustomImage: true,
      },
      {
        word: "SUN",
        image: "/images/sun.png",
        audio: "sun",
        description: "සූර්යයා",
        isCustomImage: true,
      },
    ],
    2: [
      {
        word: "BOOK",
        image: "/images/book.png",
        audio: "book",
        description: "පොත",
        isCustomImage: true,
      },
      {
        word: "SHIP",
        image: "/images/ship.png",
        audio: "ship",
        description: "නැව",
        isCustomImage: true,
      },
    ],
    3: [
      {
        word: "APPLE",
        image: "/images/apple.png",
        audio: "apple",
        description: "ඇපල්",
        isCustomImage: true,
      },
      {
        word: "CHAIR",
        image: "/images/chair.png",
        audio: "chair",
        description: "පුටුව",
        isCustomImage: true,
      },
    ],
  }

  const currentQuestions = gameData[currentLevel]
  const totalQuestions = currentQuestions.length

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null)

      // Stop any existing stream first
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "environment", // Use back camera if available
        },
        audio: false,
      })

      setCameraStream(stream)
      setShowCamera(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError(`කැමරාවට ප්‍රවේශ වීමට නොහැකි විය: ${error.message}`)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    // Do not clear capturedImage here, it's handled by confirm/retake
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to image data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)
      setCapturedImage(imageDataUrl)

      // Stop camera after capture
      stopCamera()

      // Show preview for user confirmation
      setShowResult(true)
    } else {
      setCameraError("කැමරා හෝ කැන්වස් සූදානම් නැත")
    }
  }

  // Function for confirming the captured photo
  const confirmPhoto = () => {
    if (capturedImage) {
      setShowResult(false) // Hide the preview immediately
      setCapturedImage(null) // Clear the image from state immediately
      processHandwriting(capturedImage)
    }
  }

  // Function for retaking photo
  const retakePhoto = () => {
    setCapturedImage(null)
    setShowResult(false)
    startCamera()
  }

  const processHandwriting = async (imageDataUrl) => {
    setIsProcessing(true)
    setShowSuccessMessage(false) // Ensure success message is hidden before processing

    try {
      const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0
      const currentWord = currentQuestions[currentQuestion].word

      // Store the response with captured image for backend processing
      setResponses((prev) => [
        ...prev,
        {
          question: currentQuestion,
          expectedWord: currentWord,
          timeTaken: timeTaken,
          capturedImage: imageDataUrl,
          timestamp: new Date().toISOString(),
        },
      ])

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowSuccessMessage(true) // Show success message after processing
      playWinSound() // Play success sound

      // Move to next question after a short delay to show success message
      setTimeout(() => {
        setShowSuccessMessage(false) // Hide success message
        nextQuestion()
      }, 1500) // Short delay for success message visibility
    } catch (error) {
      console.error("Error processing image:", error)
      setCameraError("ඡායාරූපය සුරැකීමේ දෝෂයක්. නැවත උත්සාහ කරන්න.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Audio effects
  const playWinSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const frequencies = [523.25, 659.25, 783.99, 1046.5]

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1 + index * 0.15)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4 + index * 0.15)

      oscillator.start(audioContext.currentTime + index * 0.15)
      oscillator.stop(audioContext.currentTime + 0.4 + index * 0.15)
    })
  }

  const playLoseSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const frequencies = [440, 392, 349.23, 293.66]

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
      oscillator.type = "triangle"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1 + index * 0.2)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + index * 0.2)

      oscillator.start(audioContext.currentTime + index * 0.2)
      oscillator.stop(audioContext.currentTime + 0.5 + index * 0.2)
    })
  }

  const speakWord = (word) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      utterance.pitch = 1.2
      speechSynthesis.speak(utterance)
    }
  }

  const completeLevel = useCallback(() => {
  if (currentLevel === 3) {
    setShowEndingVideo(true) // show the ending video only after level 3
  } else {
    setGameCompleted(true)
  }
}, [currentLevel])

  // Moved nextQuestion definition before handleTimeUp
  const nextQuestion = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(60) // Reset time for the new question
      setQuestionStartTime(Date.now()) // Reset start time for the new question
      setShowResult(false) // Ensure no previous result is shown
      setShowSuccessMessage(false) // Ensure no previous success message is shown
      setCapturedImage(null) // Clear any previously captured image
      setCameraError(null) // Clear any previous camera error
    } else {
      completeLevel()
    }
  }, [currentQuestion, totalQuestions, completeLevel]) // Dependencies for useCallback

  // Timer effect
  const handleTimeUp = useCallback(() => {
    const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 60

    setResponses((prev) => [
      ...prev,
      {
        question: currentQuestion,
        userAnswer: "",
        correct: currentQuestions[currentQuestion].word,
        timeTaken: timeTaken,
        confidence: 0,
        handwritingQuality: "timeout",
        isCorrect: false,
        completed: false,
      },
    ])

    playLoseSound()
    stopCamera()
    nextQuestion() // nextQuestion is now defined
  }, [currentQuestion, currentQuestions, questionStartTime, nextQuestion, stopCamera])

  useEffect(() => {
    let timer
    if (gameStarted && !gameCompleted && !showResult && !showSuccessMessage && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && !showResult && !showSuccessMessage) {
      handleTimeUp()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, gameStarted, gameCompleted, showResult, showSuccessMessage, handleTimeUp])

  useEffect(() => {


  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error)
        setCameraError("වීඩියෝ දෝෂයක්")
      })
    }
  }, [showCamera, cameraStream])

  useEffect(() => {
  if (showEndingVideo) {
    const videoDuration = 8000 // fallback: auto-redirect after 8 seconds
    const timer = setTimeout(() => {
      onBack() // go to home
    }, videoDuration)
    return () => clearTimeout(timer)
  }
}, [showEndingVideo, onBack])

  const startGame = () => {
  setGameStarted(true)
  setCurrentQuestion(0)
  setScore(0)
  setResponses([])
  setTimeLeft(60)
  setQuestionStartTime(Date.now())
  setShowResult(false)
  setShowSuccessMessage(false)
  setCapturedImage(null)
  setCameraError(null)
}

  const nextLevel = () => {
  if (currentLevel < 3) {
    const newLevel = currentLevel + 1
    setCurrentLevel(newLevel)
    setGameStarted(false)
    setGameCompleted(false)
    setCurrentQuestion(0)
    setScore(0)
    setResponses([])
    setTimeLeft(60)
  }
}

  const getLevelDescription = (level) => {
    const descriptions = {
      1: "සරල 3-අකුරු වචන",
      2: "මධ්‍යම 4-අකුරු වචන",
      3: "අභියෝගාත්මක 5-අකුරු වචන",
    }
    return descriptions[level]
  }

  const getDysgraphiaAnalysis = () => {
    const totalResponses = responses.length
    const averageTime = responses.reduce((sum, r) => sum + r.timeTaken, 0) / totalResponses

    return {
      totalQuestions: totalResponses,
      averageTime,
      capturedImages: responses.length,
      responses: responses, // Include all responses for backend analysis
    }
  }

  const renderImage = (currentQ) => {
    return (
      <img
        src={currentQ.image || "/placeholder.svg"}
        alt={currentQ.description}
        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-3 sm:mb-4 object-contain animate-pulse"
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
      />
    )
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">අකුරු ලිවීමේ ක්‍රීඩාව</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 px-4">
            පින්තූරය බලා, ශබ්දය අසා, කඩදාසියේ වචනය ලියා කැමරාවට පෙන්වන්න!
          </p>

          {/* Replaced Card with div */}
          <div className="bg-white/20 backdrop-blur-sm border-0 mb-6 sm:mb-8 rounded-lg shadow-md">
            {/* Replaced CardContent with div */}
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">මට්ටම {currentLevel}</h2>
              <p className="text-lg sm:text-xl mb-4 sm:mb-6">{getLevelDescription(currentLevel)}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">වචන ගණන</div>
                  <div className="text-xl sm:text-2xl font-bold">{totalQuestions}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">වචනයකට කාලය</div>
                  <div className="text-xl sm:text-2xl font-bold">60 තත්පර</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">ක්‍රමය</div>
                  <div className="text-xl sm:text-2xl font-bold">📷 කැමරා</div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">ක්‍රීඩා කරන ආකාරය</h3>
                <ul className="text-left space-y-1 sm:space-y-2 max-w-md mx-auto text-sm sm:text-base">
                  <li>• පින්තූරය බලන්න සහ ශබ්දය අසන්න</li>
                  <li>• කඩදාසියේ වචනය ලියන්න</li>
                  <li>• කැමරා ආරම්භ කරන්න</li>
                  <li>• ලියූ කඩදාසිය කැමරාවට පෙන්වන්න</li>
                  <li>• ඡායාරූපය ගන්න</li>
                </ul>
              </div>

              {/* Replaced Button with button */}
              <button
                onClick={startGame}
                className="bg-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                🚀 ක්‍රීඩාව ආරම්භ කරන්න
              </button>
            </div>
          </div>

          {/* Replaced Button with button */}
          <button
            onClick={onBack}
            className="bg-white/20 text-white border border-white/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-300 text-sm sm:text-base"
          >
            ← ආපසු යන්න
          </button>
        </div>
      </div>
    )
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
    const analysis = getDysgraphiaAnalysis()

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-3xl w-full">
          <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">
            {analysis.riskLevel === "අඩු" ? "🎉" : analysis.riskLevel === "මධ්‍යම" ? "⚠️" : "🔍"}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">මට්ටම {currentLevel} සම්පූර්ණයි!</h1>

          {/* Replaced Card with div */}
          <div className="bg-white/20 backdrop-blur-sm border-0 mb-6 sm:mb-8 rounded-lg shadow-md">
            {/* Replaced CardContent with div */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">සම්පූර්ණ කළ වචන</div>
                  <div className="text-2xl sm:text-3xl font-bold">{analysis.totalQuestions}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">සාමාන්‍ය කාලය</div>
                  <div className="text-2xl sm:text-3xl font-bold">{analysis.averageTime.toFixed(1)}තත්</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm opacity-80">ගත් ඡායාරූප</div>
                  <div className="text-2xl sm:text-3xl font-bold">{analysis.capturedImages}</div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/10 rounded-lg text-left">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">සම්පූර්ණ කළ කාර්යයන්</h3>
                <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
                  සියලුම ඡායාරූප සාර්ථකව ගන්නා ලදී. විස්තරාත්මක විශ්ලේෂණය සඳහා ඡායාරූප පසුබිම් සේවාවට යවනු ලැබේ.
                </p>
              </div>

              <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
                {currentLevel < 3 && (
                  // Replaced Button with button
                  <button
                    onClick={nextLevel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
                  >
                    ඊළඟ මට්ටම →
                  </button>
                )}

                {/* Replaced Button with button */}
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
      </div>
    )
  }

  const currentQ = currentQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="text-left">
            <div className="text-sm sm:text-base md:text-lg font-bold">මට්ටම {currentLevel}</div>
            <div className="text-xs sm:text-sm opacity-80">
              වචනය {currentQuestion + 1}/{totalQuestions}
            </div>
          </div>
          <div className="text-center">
            {/* Replaced Button with button */}
            <button
              onClick={onBack}
              className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-xs sm:text-sm"
            >
              🚪 ඉවත්වන්න
            </button>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base md:text-lg font-bold">ලකුණු: {score}</div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${timeLeft <= 10 ? "text-red-300 animate-pulse" : ""}`}
            >
              ⏰ {timeLeft}
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

        {/* Game Area - Replaced Card with div */}
        <div className="bg-white/20 backdrop-blur-sm border-0 mb-4 sm:mb-6 rounded-lg shadow-md">
          {/* Replaced CardContent with div */}
          <div className="p-4 sm:p-6">
            {/* Image and Audio */}
            <div className="mb-6 sm:mb-8">
              {renderImage(currentQ)}
              <div className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">{currentQ.description}</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-yellow-300">{currentQ.word}</div>
              {/* Replaced Button with button */}
              <button
                onClick={() => speakWord(currentQ.word)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base"
              >
                🔊 නැවත අසන්න
              </button>
            </div>

            {/* Instructions */}
            <div className="mb-6 sm:mb-8 p-4 bg-white/10 rounded-lg">
              <h3 className="text-lg font-bold mb-2">උපදෙස්:</h3>
              <p className="text-sm sm:text-base">
                1. කඩදාසියක මේ වචනය ලියන්න: <strong>{currentQ.word}</strong>
                <br />
                2. කැමරා ආරම්භ කරන්න
                <br />
                3. ලියූ කඩදාසිය කැමරාවට පෙන්වන්න
                <br />
                4. ඡායාරූපය ගන්න
              </p>
            </div>

            {/* Camera Section */}
            {!showCamera && !capturedImage && !isProcessing && !showSuccessMessage && (
              <div className="mb-6">
                {/* Replaced Button with button */}
                <button
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors duration-300"
                  disabled={isProcessing}
                >
                  📷 කැමරා ආරම්භ කරන්න
                </button>
                {cameraError && <div className="mt-4 p-3 bg-red-500/20 rounded-lg text-red-200">{cameraError}</div>}
              </div>
            )}

            {/* Camera Preview */}
            {showCamera && (
              <div className="mb-6">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4 mx-auto max-w-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 sm:h-80 object-cover"
                    onLoadedMetadata={() => {
                      console.log("Video metadata loaded")
                      if (videoRef.current) {
                        videoRef.current.play()
                      }
                    }}
                    onError={(e) => {
                      console.error("Video error:", e)
                      setCameraError("වීඩියෝ දෝෂයක්")
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    🔴 LIVE
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <div className="bg-black/50 text-white px-2 py-1 rounded text-sm">ලියූ කඩදාසිය කැමරාවට පෙන්වන්න</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  {/* Replaced Button with button */}
                  <button
                    onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300"
                    disabled={isProcessing}
                  >
                    📸 ඡායාරූපය ගන්න
                  </button>
                  {/* Replaced Button with button */}
                  <button
                    onClick={stopCamera}
                    className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-300"
                    disabled={isProcessing}
                  >
                    ❌ නවත්වන්න
                  </button>
                </div>

                {cameraError && (
                  <div className="mt-4 p-3 bg-red-500/20 rounded-lg text-red-200 text-sm">{cameraError}</div>
                )}
              </div>
            )}

            {/* Captured Image Preview with Actions */}
            {capturedImage && showResult && !isProcessing && !showSuccessMessage && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-white">ගත් ඡායාරූපය:</h3>
                <div className="bg-white/10 p-4 rounded-lg">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured handwriting"
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-white/30 shadow-lg mb-4"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />

                  <div className="mb-4 text-center">
                    <p className="text-sm text-white/80 mb-2">ඡායාරූපය පැහැදිලිද? වචනය "{currentQ.word}" හොඳින් පෙනෙනවාද?</p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    {/* Replaced Button with button */}
                    <button
                      onClick={confirmPhoto}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 flex items-center gap-2"
                    >
                      ✅ හරි, ඊළඟට යන්න
                    </button>
                    {/* Replaced Button with button */}
                    <button
                      onClick={retakePhoto}
                      className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-300 flex items-center gap-2"
                    >
                      🔄 නැවත ගන්න
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Processing State for saving */}
            {isProcessing && (
              <div className="mb-6 p-4 bg-blue-500/20 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>ඡායාරූපය සුරකිමින්...</span>
                </div>
              </div>
            )}

            {/* Final Success Message */}
            {showSuccessMessage && !isProcessing && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500/20 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-green-300">
                  ✅ සාර්ථකයි! ඡායාරූපය සුරකින ලදී
                </div>
                <div className="text-sm sm:text-base md:text-lg">
                  වචනය: <span className="font-bold">{currentQ.word}</span>
                </div>
                <div className="text-sm opacity-80 mt-2">ඊළඟ ප්‍රශ්නයට යමින්...</div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Instructions */}
        <div className="text-xs sm:text-sm opacity-80 px-4">
          වචනය කඩදාසියේ ලියා කැමරාවට පෙන්වන්න. ඡායාරූපය ගැනීමට පෙර වචනය පැහැදිලිව පෙනෙන්නට වග බලා ගන්න.
        </div>
      </div>
    </div>
  )
}

export default DysgraphiaGamePage
