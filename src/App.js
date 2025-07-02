import React, { useState } from 'react';
import LoadingPage from './components/LoadingPage';
import SigninPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import HomePage from './components/HomePage';

import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [user, setUser] = useState(null);
  
  const handleLoadComplete = () => {
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
    alert('ලියාපදිංචිය සාර්ථකයි!');
    setCurrentScreen('home');
  };

  const handleSignin = (userData) => {
    setUser(userData);
    alert('ඇතුල්වීම සාර්ථකයි!');
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('signin');
  };

  return (
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
  );
};

export default App;