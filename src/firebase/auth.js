import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Sign up new user
export const signUpUser = async (email, password, name, mobile) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, {
      displayName: name
    });
    
    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      mobile: mobile,
      createdAt: new Date().toISOString(),
      level: "ආරම්භක",
      points: 0,
      completedGames: 0,
      achievements: []
    });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        name: name,
        email: email,
        mobile: mobile
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign in existing user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    
    return {
      success: true,
      user: {
        uid: user.uid,
        name: userData?.name || user.displayName,
        email: user.email,
        mobile: userData?.mobile || "",
        level: userData?.level || "ආරම්භක",
        points: userData?.points || 0,
        completedGames: userData?.completedGames || 0,
        achievements: userData?.achievements || []
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};