import { 
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  getDoc,
  collection,
  addDoc,
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
export const saveGameScore = async (userId, gameType, score, duration) => {
  try {
    await addDoc(collection(db, "gameScores"), {
      userId: userId,
      gameType: gameType,
      score: score,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
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
      orderBy("timestamp", "desc")
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