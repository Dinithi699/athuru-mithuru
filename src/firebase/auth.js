import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Sign up new admin with optimizations
export const signUpAdmin = async (email, password, name, mobile, school) => {
  try {
    console.log('Starting admin signup process...');
    
    // Create admin account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Admin created successfully:', user.uid);
    
    // Prepare admin data
    const adminData = {
      name: name,
      email: email,
      mobile: mobile,
      school: school,
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Update profile and save data concurrently for better performance
    const [profileUpdate, firestoreUpdate] = await Promise.allSettled([
      updateProfile(user, { displayName: name }),
      setDoc(doc(db, "admins", user.uid), adminData)
    ]);
    
    if (profileUpdate.status === 'rejected') {
      console.warn('Admin profile update failed:', profileUpdate.reason);
    }
    
    if (firestoreUpdate.status === 'rejected') {
      console.warn('Admin firestore update failed:', firestoreUpdate.reason);
    }
    
    console.log('Admin registration completed');
    
    return {
      success: true,
      user: {
        uid: user.uid,
        name: name,
        email: email,
        mobile: mobile,
        school: school,
        role: 'admin',
        isActive: true
      }
    };
  } catch (error) {
    console.error('Admin signup error:', error);
    return {
      success: false,
      error: error.code || error.message
    };
  }
};

// Sign in admin with optimizations
export const signInAdmin = async (email, password) => {
  try {
    console.log('Starting admin signin process...');
    
    // Sign in admin
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Admin signed in successfully:', user.uid);
    
    // Get admin data with timeout
    let adminData = {};
    try {
      const adminDocPromise = getDoc(doc(db, "admins", user.uid));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 10000)
      );
      
      const adminDoc = await Promise.race([adminDocPromise, timeoutPromise]);
      
      if (adminDoc.exists()) {
        adminData = adminDoc.data();
        console.log('Admin data retrieved successfully');
      } else {
        console.log('No admin document found, using basic admin data');
        adminData = {
          name: user.displayName || 'ගුරුතුමා',
          email: user.email,
          mobile: "",
          school: "",
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        // Save default admin data asynchronously
        setDoc(doc(db, "admins", user.uid), adminData).catch(console.warn);
      }
    } catch (firestoreError) {
      console.warn('Admin firestore access failed, using basic admin data:', firestoreError);
      adminData = {
        name: user.displayName || 'ගුරුතුමා',
        email: user.email,
        mobile: "",
        school: "",
        role: 'admin',
        isActive: true
      };
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        name: adminData?.name || user.displayName || 'ගුරුතුමා',
        email: user.email,
        mobile: adminData?.mobile || "",
        school: adminData?.school || "",
        role: 'admin',
        isActive: adminData?.isActive || true
      }
    };
  } catch (error) {
    console.error('Admin signin error:', error);
    return {
      success: false,
      error: error.code || error.message
    };
  }
};

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
      role: 'user',
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
        setTimeout(() => reject(new Error('Firestore timeout')), 10000)
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
        role: 'user',
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
}
// Listen to auth state changes with optimization
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};