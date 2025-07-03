import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../firebase/auth';
import { getUserData } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userData = await getUserData(firebaseUser.uid);
        
        if (userData.success) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData.data
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'පරිශීලකයා',
            level: 'ආරම්භක',
            points: 0,
            completedGames: 0,
            achievements: []
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    setUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};