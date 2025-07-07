import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LoadingPage from './components/LoadingPage';
import SigninPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import HomePage from './components/HomePage';

import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Preload critical resources
    const preloadResources = async () => {
      try {
        // Preload critical images
        const criticalImages = [
          '/images/Login bg.png',
          '/images/sign-up-test.png'
        ];
        
        const imagePromises = criticalImages.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            img.src = src;
          });
        });
        
        await Promise.allSettled(imagePromises);
        setAppReady(true);
      } catch (error) {
        console.warn('Resource preloading failed:', error);
        setAppReady(true); // Continue anyway
      }
    };
    
    preloadResources();
  }, []);
  
  const handleLoadComplete = () => {
    if (appReady) {
      setCurrentScreen('signin');
    } else {
      // Wait for app to be ready
      const checkReady = setInterval(() => {
        if (appReady) {
          clearInterval(checkReady);
          setCurrentScreen('signin');
        }
      }, 100);
    }
  };

  const handleShowSignup = () => {
    setCurrentScreen('signup');
  };

  const handleShowSignin = () => {
    setCurrentScreen('signin');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const handleSignin = (userData) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('signin');
  };

  return (
    <AuthProvider>
      <div>
        {currentScreen === 'loading' && <LoadingPage onLoadComplete={handleLoadComplete} />}
        {currentScreen === 'signup' && (
          <SignUpPage onShowSignin={handleShowSignin} onSignup={handleSignup} />
        )}
        {currentScreen === 'signin' && (
          <SigninPage onShowSignup={handleShowSignup} onSignin={handleSignin} />
        )}
        {currentScreen === 'home' && (
          <HomePage onLogout={handleLogout} user={user} />
        )}
      </div>
    </AuthProvider>
  );
};

export default App;