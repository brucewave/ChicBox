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
    <div className="absolute" style={{ right: '80px', bottom: '120px' }}>
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
              className="fill-black font-bold"
            >
              KHÁM PHÁ THÊM BỘ SƯU TẬP  KHÁM PHÁ THÊM BỘ SƯU TẬP 
            </textPath>
          </text>
        </svg>
        
        {/* Center arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isHovered ? 'bg-gray-900 scale-110' : 'bg-black scale-100'
          }`}>
            <FiArrowRight className={`w-4 h-4 md:w-5 md:h-5 text-white transition-transform duration-300 ${
              isHovered ? 'translate-x-[2px]' : 'translate-x-0'
            }`} />
          </div>
        </div>
        
        {/* Enhanced glow effect */}
        <div className="absolute inset-0 w-full h-full rounded-full bg-white/20"></div>
        
        {/* Enhanced hover ring effect */}
        <div className={`absolute inset-0 w-full h-full rounded-full border-2 transition-all duration-300 ${
          isHovered ? 'border-gray-400 scale-110' : 'border-gray-300 scale-100'
        }`}></div>
      </div>
    </div>
  );
};

export default RotatingBadge; 