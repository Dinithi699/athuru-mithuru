import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Sign up new user with optimizations
export const signUpUser = async (email, password, name, mobile) => {
  try {
    console.log('Starting signup process...');
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User created successfully:', user.uid);
    
    // Prepare user data
    const userData = {
      name: name,
      email: email,
      mobile: mobile,
      createdAt: new Date().toISOString(),
      level: "ආරම්භක",
      points: 0,
      completedGames: 0,
      achievements: []
    };
    
    // Update profile and save data concurrently for better performance
    const [profileUpdate, firestoreUpdate] = await Promise.allSettled([
      updateProfile(user, { displayName: name }),
      setDoc(doc(db, "users", user.uid), userData)
    ]);
    
    if (profileUpdate.status === 'rejected') {
      console.warn('Profile update failed:', profileUpdate.reason);
    }
    
    if (firestoreUpdate.status === 'rejected') {
      console.warn('Firestore update failed:', firestoreUpdate.reason);
      // Continue anyway, we can retry later
    }
    
    console.log('User registration completed');
    
    return {
      success: true,
      user: {
        uid: user.uid,
        name: name,
        email: email,
        mobile: mobile,
        level: "ආරම්භක",
        points: 0,
        completedGames: 0,
        achievements: []
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.code || error.message
    };
  }
};

// Sign in existing user with optimizations
export const signInUser = async (email, password) => {
  try {
    console.log('Starting signin process...');
    
    // Sign in user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User signed in successfully:', user.uid);
    
    // Get user data with timeout
    let userData = {};
    try {
      const userDocPromise = getDoc(doc(db, "users", user.uid));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );
      
      const userDoc = await Promise.race([userDocPromise, timeoutPromise]);
      
      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('User data retrieved successfully');
      } else {
        console.log('No user document found, creating default data');
        userData = {
          name: user.displayName || 'පරිශීලකයා',
          email: user.email,
          mobile: "",
          level: "ආරම්භක",
          points: 0,
          completedGames: 0,
          achievements: [],
          createdAt: new Date().toISOString()
        };
        
        // Save default data asynchronously (don't wait)
        setDoc(doc(db, "users", user.uid), userData).catch(console.warn);
      }
    } catch (firestoreError) {
      console.warn('Firestore access failed, using basic user data:', firestoreError);
      userData = {
        name: user.displayName || 'පරිශීලකයා',
        email: user.email,
        mobile: "",
        level: "ආරම්භක",
        points: 0,
        completedGames: 0,
        achievements: []
      };
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        name: userData?.name || user.displayName || 'පරිශීලකයා',
        email: user.email,
        mobile: userData?.mobile || "",
        level: userData?.level || "ආරම්භක",
        points: userData?.points || 0,
        completedGames: userData?.completedGames || 0,
        achievements: userData?.achievements || []
      }
    };
  } catch (error) {
    console.error('Signin error:', error);
    return {
      success: false,
      error: error.code || error.message
    };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    return {
      success: false,
      error: error.code || error.message
    };
  }
};

// Listen to auth state changes with optimization
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};