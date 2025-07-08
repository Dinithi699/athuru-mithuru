import React, { useState, useEffect } from 'react';

const LoadingPage = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.warn('Background image failed to load');
      setImageLoaded(true); // Continue anyway
    };
    img.src = '/images/Loading bg.png';

    // Start progress after a short delay
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Complete loading after image is loaded and progress is done
            setTimeout(() => {
              if (onLoadComplete) {
                onLoadComplete();
              }
            }, 300);
            return 100;
          }
          // Faster progress for better UX
          return prev + 5;
        });
      }, 100);

      return () => clearInterval(interval);
    }, 500);

    return () => {
      clearTimeout(startDelay);
    };
  }, [onLoadComplete]);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: imageLoaded ? `url('/images/Loading bg.png')` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Flexible spacer to push content to center */}
      <div className="flex-1"></div>
      
      <div className="text-center relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="w-full px-2 sm:px-4">          
          <div className="w-full h-2 sm:h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-200 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Loading text */}
          <div className="mt-2 sm:mt-3 md:mt-4 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
            පූරණය වෙමින්... {progress}%
          </div>
        </div>
      </div>
      
      {/* Flexible spacer to balance the layout */}
      <div className="flex-1"></div>
    </div>
  );
};

export default LoadingPage;