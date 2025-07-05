'use client';

import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

const RotatingBadge: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset click state after animation
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div className="flex justify-center w-full">
      <div 
        className={`relative w-24 h-24 md:w-32 md:h-32 transition-all duration-300 cursor-pointer ${
          isHovered ? 'scale-110' : 'scale-100'
        } ${isClicked ? 'animate-spin-fast' : isHovered ? 'animate-spin' : 'animate-spin-slow'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Circular text path */}
        <svg
          className="w-full h-full"
          viewBox="0 0 128 128"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Define the circular path */}
          <defs>
            <path
              id="circlePath"
              d="M 64 64 m -48 0 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
              fill="none"
            />
          </defs>
          
          {/* Text following the circular path */}
          <text className="text-sm font-bold tracking-wider">
            <textPath
              href="#circlePath"
              startOffset="0%"
              className="fill-black drop-shadow-xl"
            >
              EXPLORE MORE COLLECTION • EXPLORE MORE COLLECTION •
            </textPath>
          </text>
        </svg>
        
        {/* Center arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-8 h-8 md:w-10 md:h-10 bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            isHovered ? 'bg-black scale-110' : 'bg-black/90 scale-100'
          }`}>
            <FiArrowRight className={`w-4 h-4 md:w-5 md:h-5 text-white transition-transform duration-300 ${
              isHovered ? 'translate-x-[2px]' : 'translate-x-0'
            }`} />
          </div>
        </div>
        
        {/* Enhanced glow effect */}
        <div className="absolute inset-0 w-full h-full rounded-full bg-white/10 backdrop-blur-sm animate-pulse-slow"></div>
        
        {/* Enhanced hover ring effect */}
        <div className={`absolute inset-0 w-full h-full rounded-full border-2 transition-all duration-300 ${
          isHovered ? 'border-white/60 scale-110' : 'border-white/40 scale-100'
        }`}></div>
        
        {/* Floating animation wrapper */}
        <div className="absolute inset-0 animate-float">
          {/* Enhanced decorative elements */}
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/50 rounded-full transition-all duration-300 ${
            isHovered ? 'scale-150' : 'scale-100'
          }`}></div>
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/50 rounded-full transition-all duration-300 ${
            isHovered ? 'scale-150' : 'scale-100'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default RotatingBadge; 