'use client';

import React from 'react';

const categories = [
  'QUẦN SHORT',
  'ÁO THUN',
  'ÁO BLAZER',
  'BẠN ĐỒNG HÀNH',
  'BÓNG',
  'ĐẦM',
  'QUẦN JEANS',
  'ÁO KHOÁC',
  'ÁO HOODIE',
  'ÁO LEN',
  'CHÂN VÁY',
  'QUẦN DÀI',
  'GIÀY',
  'TÚI XÁCH',
  'PHỤ KIỆN',
];

// Duplicate for seamless loop
const duplicated = [...categories, ...categories];

const StarIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-6 md:mx-10" style={{minWidth:36}}>
    <path d="M18 5L20.4721 14.5279L30 17L20.4721 19.4721L18 29L15.5279 19.4721L6 17L15.5279 14.5279L18 5Z" fill="#BDBDBD"/>
  </svg>
);

const CategoryMarquee: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-transparent py-8 md:py-12">
      <div className="border-t border-b border-gray-300 transform -skew-y-2">
        <div className="py-6 md:py-10">
          <div className="relative whitespace-nowrap transform -skew-y-0">
            {/* Marquee 1 */}
            <div className="inline-block animate-marquee">
              {duplicated.map((category, idx) => (
                <span key={idx} className="inline-flex items-center uppercase tracking-widest font-semibold text-black text-2xl md:text-4xl mx-6 md:mx-10" style={{letterSpacing: '0.18em'}}>
                  {category}
                  {idx !== duplicated.length - 1 && <StarIcon />}
                </span>
              ))}
            </div>
            {/* Marquee 2 for seamless loop */}
            <div className="inline-block animate-marquee2 absolute top-0 left-0">
              {duplicated.map((category, idx) => (
                <span key={`d-${idx}`} className="inline-flex items-center uppercase tracking-widest font-semibold text-black text-2xl md:text-4xl mx-6 md:mx-10" style={{letterSpacing: '0.18em'}}>
                  {category}
                  {idx !== duplicated.length - 1 && <StarIcon />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMarquee; 