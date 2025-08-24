'use client';

import React, { useEffect, useState } from 'react';
import RotatingBadge from './RotatingBadge';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomily.tech';
const fallbackImageUrl = `${baseUrl}/api/v1/images/PRD_0922a55d-f295-4bf1-a0ca-6a8ce5d50af3_1750004739411.png`;

const HeroBanner = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/products`);
        const data = await res.json();
        setProducts(Array.isArray(data.content) ? data.content.slice(0, 5) : []);
      } catch (e) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Auto change product every 5 seconds
  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentProductIndex((prev) => (prev + 1) % products.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  const currentProduct = products[currentProductIndex] || null;

  return (
    <section className="relative bg-[#fcf8f3] py-32 md:py-32 overflow-hidden w-full">
      <div className="w-full px-2 md:px-4 lg:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-8 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-black">
              {currentProduct ? currentProduct.name : 'Tên sản phẩm'}
            </h1>
            <div className="flex gap-8 lg:gap-12 flex-wrap">
              <div>
                <div className="text-gray-500 font-medium">Giá</div>
                <div className="text-3xl font-bold">
                  ${currentProduct ? currentProduct.price?.toLocaleString() : '0.00'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Kích cỡ có sẵn</div>
                <div className="flex gap-2 mt-1">
                  {currentProduct && currentProduct.sizeList && currentProduct.sizeList.length > 0
                    ? currentProduct.sizeList.map((size: string) => (
                        <span key={size} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{size}</span>
                      ))
                    : ['Small', 'Medium', 'Large'].map(size => (
                        <span key={size} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{size}</span>
                      ))}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Màu sắc có sẵn</div>
                <div className="flex gap-2 mt-1">
                  {currentProduct && currentProduct.colorList && currentProduct.colorList.length > 0
                    ? currentProduct.colorList.map((color: string) => (
                        <span key={color} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{color}</span>
                      ))
                    : ['Black', 'Pink', 'White', 'Rose'].map(color => (
                        <span key={color} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{color}</span>
                      ))}
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-6">
              <a
                href={currentProduct ? `/product/default?id=${currentProduct.id}` : '/product/default?id=1'}
                className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors"
              >
                XEM CHI TIẾT
              </a>
              <a
                href="/shop/default-grid"
                className="border-2 border-black text-black px-8 py-4 rounded-xl font-bold text-lg bg-white/80 hover:bg-gray-100 transition-colors"
              >
                XEM BỘ SƯU TẬP
              </a>
            </div>
            {/* Collection Badge */}
            <div className="flex items-center gap-4 mt-8">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 5V35M5 20H35M10.6 10.6L29.4 29.4M10.6 29.4L29.4 10.6" stroke="black" strokeWidth="3" />
              </svg>
              <div>
                <div className="font-bold">Bộ sưu tập mùa hè</div>
                <div className="text-black text-sm">Thời thượng và cổ điển cho mùa mới</div>
              </div>
            </div>
          </div>
          
          {/* Right: Images & Vertical Label */}
          <div className="flex-1 flex items-center justify-center relative min-w-[400px] lg:min-w-[500px]">
            {/* Decorative Yellow Star */}
            <svg className="absolute -top-8 right-20 w-16 h-16" viewBox="0 0 64 64" fill="none">
              <path d="M32 8L36 28H56L40 36L44 56L32 44L20 56L24 36L8 28H28L32 8Z" fill="#FFE066"/>
            </svg>
            {/* Main Product Image */}
            <div className="rounded-3xl overflow-hidden shadow-lg w-96 h-[500px] lg:w-[500px] lg:h-[600px] bg-white flex items-center justify-center">
              <img 
                src={currentProduct && currentProduct.primaryImageUrl 
                  ? `${baseUrl}/api/v1/images/${currentProduct.primaryImageUrl}`
                  : fallbackImageUrl
                } 
                alt={currentProduct ? currentProduct.name : 'Product'} 
                className="object-cover w-full h-full transition-opacity duration-500"
              />
            </div>
            {/* Vertical Label */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-5xl font-extrabold tracking-widest text-black" style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}>
                MÙA HÈ
              </span>
              {/* Decorative Black Star */}
              <svg className="mt-4 w-10 h-10" viewBox="0 0 40 40" fill="none">
                <path d="M20 5V35M5 20H35M10.6 10.6L29.4 29.4M10.6 29.4L29.4 10.6" stroke="black" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Rotating Circular Badge - positioned at bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <RotatingBadge />
        </div>
        
        {/* Simple Product Indicator Dots */}
        {products.length > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentProductIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentProductIndex 
                    ? 'bg-black scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner; 