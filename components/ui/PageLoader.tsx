'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface PageLoaderProps {
  show: boolean;
  onFinished?: () => void;
  message?: string;
}

export default function PageLoader({ 
  show, 
  onFinished, 
  message = "ShuttleFlow" 
}: PageLoaderProps) {
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(show);
  const [lottieData, setLottieData] = useState<any>(null);

  // Load the Lottie animation
  useEffect(() => {
    // Using dynamic import for better error handling
    import('../../assets/bbzkCrMEDd.json')
      .then(animation => {
        setLottieData(animation.default);
      })
      .catch(error => {
        console.error('Failed to load Lottie animation:', error);
      });
  }, []);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setOpacity(1);
      
      // Start fading out after 2 seconds
      const fadeOutTimer = setTimeout(() => {
        setOpacity(0);
      }, 2000);
      
      // Complete hide after 3 seconds total
      const hideTimer = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 3000);
      
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, onFinished]);

  if (!visible) return null;
  
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#df2027] z-50"
      style={{ 
        opacity, 
        transition: 'opacity 1s ease-out'
      }}
    >
      <div className="flex flex-col items-center">
        {/* Lottie Animation or Fallback */}
        <div className="w-64 h-64 mb-4 flex items-center justify-center">
          

          {lottieData  ? (
            <Lottie 
              animationData={lottieData}
              loop={true}
              autoplay={true}
            />
          ) : (
            <p className='text-white text-[15px] font-bold tracking-wider fancy-text'>Getting ready to smash it!</p>
          )}
        </div>
        
        {/* Fancy text with sliding-in letters animation */}
        {
          lottieData && (
            <div className="fancy-text-container overflow-hidden">
              <p className="text-white text-[16px] font-bold tracking-wider fancy-text">
                {message.split('').map((char, index) => (
                  <span 
                    key={index} 
                    className="inline-block" 
                    style={{ 
                      animationDelay: `${index * 0.07}s`
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </p>
            </div>
          )
        }
        
      </div>
      
      {/* CSS for the text animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fancy-text span {
          animation: fadeInUp 0.6s both;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}