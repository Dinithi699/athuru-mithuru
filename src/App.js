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
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  const handleLoadComplete = () => {
    setLoadingComplete(true);
    setCurrentScreen('signin');
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
        {currentScreen === 'loading' && !loadingComplete && (
          <LoadingPage onLoadComplete={handleLoadComplete} />
        )}
        {currentScreen === 'signup' && (
          <SignUpPage onShowSignin={handleShowSignin} onSignup={handleSignup} />
        )}
        {currentScreen === 'signin' && loadingComplete && (
          <SigninPage onShowSignup={handleShowSignup} onSignin={handleSignin} />
        )}
        {currentScreen === 'home' && loadingComplete && (
          <HomePage onLogout={handleLogout} user={user} />
        )}
      </div>
    </AuthProvider>
  );
};

export default App;