import React, { useState } from 'react';
import LoadingPage from './components/LoadingPage';
import SigninPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import ThreeJSBackground from './components/ThreeJSBackground';

import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  
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
    alert('ලියාපදිංචිය සාර්ථකයි!');
    setCurrentScreen('main');
  };

  const handleSignin = (userData) => {
    alert('ඇතුල්වීම සාර්ථකයි!');
    setCurrentScreen('main');
  };

 

  return (
    <div>

      {currentScreen === 'loading' && <LoadingPage onLoadComplete={handleLoadComplete} />}
      {currentScreen === 'signin'}
      {currentScreen === 'signup' && (
        <SignUpPage onShowSignin={handleShowSignin} onSignup={handleSignin} />
      )}
      {currentScreen === 'signin' && (
        <SigninPage onShowSignup={handleShowSignup} onSignin={handleSignup} />
      )}
    </div>
  );
};

export default App;