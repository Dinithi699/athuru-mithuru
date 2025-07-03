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
    console.log('Attempting to create user with email:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User created successfully:', user.uid);
    
    // Update user profile
    await updateProfile(user, {
      displayName: name
    });
    
    console.log('Profile updated successfully');
    
    // Save additional user data to Firestore
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
    
    await setDoc(doc(db, "users", user.uid), userData);
    
    console.log('User data saved to Firestore');
    
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

// Sign in existing user
export const signInUser = async (email, password) => {
  try {
    console.log('Attempting to sign in user with email:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User signed in successfully:', user.uid);
    
    // Get additional user data from Firestore
    let userData = {};
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('User data retrieved from Firestore:', userData);
      } else {
        console.log('No user document found in Firestore, using default data');
        // Create default user data if document doesn't exist
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
        
        // Save the default data to Firestore
        await setDoc(doc(db, "users", user.uid), userData);
        console.log('Default user data saved to Firestore');
      }
    } catch (firestoreError) {
      console.warn('Error accessing Firestore, using basic user data:', firestoreError);
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

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};