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
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundImage: imageLoaded ? `url('/images/Loading bg.png')` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="text-center relative z-10 w-full max-w-sm">
        {/* Responsive spacing */}
        <div className="h-32 sm:h-40 md:h-48 lg:h-72 xl:h-96"></div>
        
        <div className="w-full px-4">          
          <div className="w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-200 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Loading text */}
          <div className="mt-3 sm:mt-4 text-white text-base sm:text-lg font-semibold">
            පූරණය වෙමින්... {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;