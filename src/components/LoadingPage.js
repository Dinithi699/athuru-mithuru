import React, { useState, useEffect } from 'react';

const LoadingPage = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundImage: `url('/images/Loading bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <div className="text-center relative z-10">
         <div className="flex-col items-center  text-center"></div>
        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
        
        <div className="w-96 max-w-sm ">          
          <div className="w-96 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner justify-center items-center  text-center">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300 ease-out rounded-full justify-center"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          </div>
          
        </div>
        
      </div>
    
  );
};

export default LoadingPage;