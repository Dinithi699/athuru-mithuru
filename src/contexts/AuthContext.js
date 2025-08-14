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
    let mounted = true;
    
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!mounted) return;
      
      try {
        if (firebaseUser) {
          console.log('Auth state changed: User logged in');
          
          // Set basic user data immediately
          const basicUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'පරිශීලකයා',
            level: 'ආරම්භක',
            points: 0,
            completedGames: 0,
            achievements: []
          };
          
          if (mounted) {
            setUser(basicUserData);
            setLoading(false);
          }
          
          // Get additional user data asynchronously
          try {
            const userData = await Promise.race([
              getUserData(firebaseUser.uid),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ]);
            
            if (mounted && userData.success) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userData.data
              });
            }
          } catch (error) {
            console.warn('Failed to load additional user data:', error);
            // Continue with basic data
          }
        } else {
          console.log('Auth state changed: User logged out');
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // Set a maximum loading time
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth loading timeout, proceeding without user');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [loading]);

  const value = {
    user,
    setUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};