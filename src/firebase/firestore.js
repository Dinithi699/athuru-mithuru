import { 
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  getDoc,
  collection,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs 
} from "firebase/firestore";
import { db } from "./config";

// Update user progress
export const updateUserProgress = async (userId, gameType, points) => {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      points: increment(points),
      completedGames: increment(1),
      [`${gameType}Progress`]: increment(1)
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Add achievement to user
export const addUserAchievement = async (userId, achievement) => {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      achievements: arrayUnion(achievement)
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user data
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: "User not found"
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Save game score
export const saveGameScore = async (userId, gameType, score, duration, gameData = {}) => {
  try {
    // Use a consistent document ID based on userId and gameType
    const docId = `${userId}_${gameType}`;
    const gameDocRef = doc(db, "gameScores", docId);
    
    // Use setDoc with merge to update existing document or create new one
    await setDoc(gameDocRef, {
      userId,
      gameType,
      lastUpdated: new Date().toISOString(),
      ...gameData
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's game history
export const getUserGameHistory = async (userId) => {
  try {
    const q = query(
      collection(db, "gameScores"),
      where("userId", "==", userId),
    );
    
    const querySnapshot = await getDocs(q);
    const gameHistory = [];
    
    querySnapshot.forEach((doc) => {
      gameHistory.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: gameHistory
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all users (for admin dashboard)
export const getAllUsers = async () => {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    // Get game history for each user
    const usersWithHistory = await Promise.all(
      users.map(async (user) => {
        const gameHistoryResult = await getUserGameHistory(user.uid);
        return {
          ...user,
          gameHistory: gameHistoryResult.success ? gameHistoryResult.data : []
        };
      })
    );
    
    return {
      success: true,
      data: usersWithHistory
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get admin data
export const getAdminData = async (adminId) => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", adminId));
    
    if (adminDoc.exists()) {
      return {
        success: true,
        data: adminDoc.data()
      };
    } else {
      return {
        success: false,
        error: "Admin not found"
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get leaderboard
export const getLeaderboard = async (gameType = null) => {
  try {
    let q;
    
    if (gameType) {
      q = query(
        collection(db, "gameScores"),
        where("gameType", "==", gameType),
        orderBy("score", "desc")
      );
    } else {
      q = query(
        collection(db, "users"),
        orderBy("points", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      leaderboard.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: leaderboard.slice(0, 10) // Top 10
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const saveDysgraphiaResult = async (userId, predictionData, levelData = null) => {
  try {
    // Save to dysgraphiaResults collection
    const resultsRef = collection(db, 'dysgraphiaResults');
    
    const resultDoc = {
      userId,
      label: predictionData.label,
      probability: predictionData.probability,
      confidence: predictionData.confidence,
      timestamp: new Date(),
      testType: 'handwriting_analysis'
    };
    
    await addDoc(resultsRef, resultDoc);
    
    // Update gameScores collection if levelData is provided
    if (levelData) {
      await updateDysgraphiaGameScores(userId, levelData, predictionData);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving dysgraphia result:', error);
    return { success: false, error: error.message };
  }
};

const updateDysgraphiaGameScores = async (userId, levelData, predictionData) => {
  try {
    const gameScoresRef = collection(db, 'gameScores');
    const q = query(gameScoresRef, where('userId', '==', userId), where('gameType', '==', 'Dysgraphia'));
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing document
      const docRef = querySnapshot.docs[0].ref;
      const existingData = querySnapshot.docs[0].data();
      
      // Determine the next level
      const currentLevels = existingData.levels || {};
      const levelNumbers = Object.keys(currentLevels).map(key => parseInt(key.replace('level', '')));
      const nextLevel = levelNumbers.length > 0 ? Math.max(...levelNumbers) + 1 : 1;
      
      // Calculate risk level based on prediction
      const riskLevel = calculateRiskLevel(predictionData.label, predictionData.confidence);
      
      // Create new level data
      const newLevelData = {
        [`level${nextLevel}`]: {
          accuracy: levelData.accuracy || 0,
          averageReactionTime: levelData.averageReactionTime || 0,
          completedAt: new Date().toISOString(),
          correctAnswers: levelData.correctAnswers || 0,
          level: nextLevel,
          responses: levelData.responses || [],
          riskLevel: riskLevel,
          score: levelData.score || 0,
          timeoutRate: levelData.timeoutRate || 0,
          totalQuestions: levelData.totalQuestions || 0,
          predictionLabel: predictionData.label,
          predictionConfidence: predictionData.confidence,
          predictionProbability: predictionData.probability
        }
      };
      
      // Update overall stats
      const updatedOverallStats = calculateOverallStats(
        { ...currentLevels, ...newLevelData }, 
        existingData.overallStats
      );
      
      await updateDoc(docRef, {
        levels: { ...currentLevels, ...newLevelData },
        overallStats: updatedOverallStats,
        lastUpdated: new Date().toISOString()
      });
      
    } else {
      // Create new document
      const riskLevel = calculateRiskLevel(predictionData.label, predictionData.confidence);
      
      const newGameScore = {
        userId,
        gameType: 'Dysgraphia',
        lastUpdated: new Date().toISOString(),
        levels: {
          level1: {
            accuracy: levelData.accuracy || 0,
            averageReactionTime: levelData.averageReactionTime || 0,
            completedAt: new Date().toISOString(),
            correctAnswers: levelData.correctAnswers || 0,
            level: 1,
            responses: levelData.responses || [],
            riskLevel: riskLevel,
            score: levelData.score || 0,
            timeoutRate: levelData.timeoutRate || 0,
            totalQuestions: levelData.totalQuestions || 0,
            predictionLabel: predictionData.label,
            predictionConfidence: predictionData.confidence,
            predictionProbability: predictionData.probability
          }
        },
        overallStats: {
          highestLevel: 1,
          levelsCompleted: 1,
          overallAccuracy: levelData.accuracy || 0,
          overallAvgReactionTime: levelData.averageReactionTime || 0,
          overallRiskLevel: riskLevel,
          totalQuestions: levelData.totalQuestions || 0,
          totalScore: levelData.score || 0
        }
      };
      
      await addDoc(gameScoresRef, newGameScore);
    }
    
  } catch (error) {
    console.error('Error updating dysgraphia game scores:', error);
    throw error;
  }
};

const calculateRiskLevel = (label, confidence) => {
  // Adjust risk level calculation based on your dysgraphia prediction logic
  if (label === 'No Dysgraphia' || (label === 'Dysgraphia' && confidence < 0.3)) {
    return 'Not Danger';
  } else if (label === 'Dysgraphia' && confidence >= 0.3 && confidence < 0.7) {
    return 'Less Danger';
  } else if (label === 'Dysgraphia' && confidence >= 0.7) {
    return 'High Danger';
  }
  return 'Less Danger'; // default
};

const calculateOverallStats = (allLevels, existingStats) => {
  const levels = Object.values(allLevels);
  const completedLevels = levels.length;
  
  const totalQuestions = levels.reduce((sum, level) => sum + (level.totalQuestions || 0), 0);
  const totalScore = levels.reduce((sum, level) => sum + (level.score || 0), 0);
  const totalCorrectAnswers = levels.reduce((sum, level) => sum + (level.correctAnswers || 0), 0);
  
  const overallAccuracy = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;
  
  const avgReactionTimes = levels
    .filter(level => level.averageReactionTime > 0)
    .map(level => level.averageReactionTime);
  const overallAvgReactionTime = avgReactionTimes.length > 0 
    ? avgReactionTimes.reduce((sum, time) => sum + time, 0) / avgReactionTimes.length 
    : 0;
  
  // Determine overall risk level (use the highest risk from all levels)
  const riskLevels = levels.map(level => level.riskLevel);
  let overallRiskLevel = 'Not Danger';
  if (riskLevels.includes('High Danger')) {
    overallRiskLevel = 'High Danger';
  } else if (riskLevels.includes('Less Danger')) {
    overallRiskLevel = 'Less Danger';
  }
  
  return {
    highestLevel: Math.max(...levels.map(level => level.level)),
    levelsCompleted: completedLevels,
    overallAccuracy: Math.round(overallAccuracy * 100) / 100,
    overallAvgReactionTime: Math.round(overallAvgReactionTime * 100) / 100,
    overallRiskLevel,
    totalQuestions,
    totalScore
  };
};

export const getAllUsersWithGameScores = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const gameScoresSnapshot = await getDocs(collection(db, "gameScores"));

    // Convert user documents to array
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Convert game score documents to array
    const scores = [];
    gameScoresSnapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() });
    });

    // Group game scores by userId
    const scoresByUser = {};
    scores.forEach((score) => {
      const { userId } = score;
      if (!scoresByUser[userId]) {
        scoresByUser[userId] = [];
      }
      scoresByUser[userId].push(score);
    });

    // Merge users with all their game scores
    const merged = users.map(user => {
      return {
        ...user,
        gameScores: scoresByUser[user.id] || []
      };
    });

    return {
      success: true,
      data: merged
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
