import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LoadingPage from './components/LoadingPage';
import SigninPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import AdminSignInPage from './components/AdminSignInPage';
import AdminSignUpPage from './components/AdminSignUpPage';
import HomePage from './components/HomePage';
import AdminHomePage from './components/AdminHomePage';

import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  
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
    setUserType('user');
  };

  const handleShowAdminSignin = () => {
    setCurrentScreen('admin-signin');
    setUserType('admin');
  };

  const handleShowAdminSignup = () => {
    setCurrentScreen('admin-signup');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setShowIntroVideo(true);
  };

  const handleSignin = (userData) => {
    setUser(userData);
    setShowIntroVideo(true);
  };

  const handleIntroVideoEnd = () => {
    setShowIntroVideo(false);
    if (user?.role === 'admin') {
      setCurrentScreen('admin-home');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowIntroVideo(false);
    if (userType === 'admin') {
      setCurrentScreen('admin-signin');
    } else {
      setCurrentScreen('signin');
    }
  };

  return (
    <AuthProvider>
      <div>
        {showIntroVideo && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <video
              src="/images/intro.mp4"
              autoPlay
              playsInline
              onEnded={handleIntroVideoEnd}
              className="w-screen h-screen object-cover"
              onError={() => {
                console.warn('Intro video failed to load, skipping...');
                handleIntroVideoEnd();
              }}
            />
            {/* Skip button */}
            <button
              onClick={handleIntroVideoEnd}
              className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full font-bold hover:bg-black/70 transition-colors duration-300 z-10"
            >
              Skip →
            </button>
          </div>
        )}
        {currentScreen === 'loading' && <LoadingPage onLoadComplete={handleLoadComplete} />}
        {currentScreen === 'signup' && (
          <SignUpPage 
            onShowSignin={handleShowSignin} 
            onSignup={handleSignup}
            onShowAdminSignup={handleShowAdminSignup}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === 'signin' && (
          <SigninPage 
            onShowSignup={handleShowSignup} 
            onSignin={handleSignin}
            onShowAdminSignin={handleShowAdminSignin}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === 'admin-signup' && (
          <AdminSignUpPage 
            onShowSignin={handleShowAdminSignin} 
            onSignup={handleSignup}
            onShowUserSignup={() => setCurrentScreen('signup')}
          />
        )}
        {currentScreen === 'admin-signin' && (
          <AdminSignInPage 
            onShowSignup={handleShowAdminSignup} 
            onSignin={handleSignin}
            onShowUserLogin={() => setCurrentScreen('signin')}
          />
        )}
        {currentScreen === 'home' && (
          <HomePage onLogout={handleLogout} user={user} />
        )}
        {currentScreen === 'admin-home' && (
          <AdminHomePage onLogout={handleLogout} admin={user} />
        )}
      </div>
    </AuthProvider>
  );
};

export default App;