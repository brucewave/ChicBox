'use client';

import React, { useEffect, useState } from 'react';
import RotatingBadge from './RotatingBadge';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomily.tech';
const fallbackImageUrl = `${baseUrl}/api/v1/images/PRD_0922a55d-f295-4bf1-a0ca-6a8ce5d50af3_1750004739411.png`;

const HeroBanner = () => {
  const [products, setProducts] = useState<any[]>([]);

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

  return (
    <section className="relative bg-[#fcf8f3] py-20 md:py-32 overflow-hidden w-full">
      <div className="w-full px-4 md:px-8">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          modules={[Autoplay, Navigation]}
          className="w-full"
        >
          {products.length > 0 ? products.map((product, idx) => {
            const imageUrl = product.primaryImageUrl
              ? `${baseUrl}/api/v1/images/${product.primaryImageUrl}`
              : fallbackImageUrl;
            return (
              <SwiperSlide key={product.id || idx}>
                <div className="flex flex-col md:flex-row items-center gap-12">
                  {/* Left: Text Content */}
                  <div className="flex-1 space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-black">
                      {product.name}
                    </h1>
                    <div className="flex gap-12 flex-wrap">
                      <div>
                        <div className="text-gray-500 font-medium">Price</div>
                        <div className="text-3xl font-bold">${product.price?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">Available Size</div>
                        <div className="flex gap-2 mt-1">
                          {product.sizeList && product.sizeList.length > 0
                            ? product.sizeList.map((size: string) => (
                                <span key={size} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{size}</span>
                              ))
                            : ['Small', 'Medium', 'Large'].map(size => (
                                <span key={size} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{size}</span>
                              ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">Available Color</div>
                        <div className="flex gap-2 mt-1">
                          {product.colorList && product.colorList.length > 0
                            ? product.colorList.map((color: string) => (
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
                        href={`/product/default?id=${product.id}`}
                        className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors"
                      >
                        VIEW DETAILS
                      </a>
                      <a
                        href="/shop/default-grid"
                        className="border-2 border-black text-black px-8 py-4 rounded-xl font-bold text-lg bg-white/80 hover:bg-gray-100 transition-colors"
                      >
                        VIEW COLLECTION
                      </a>
                    </div>
                    {/* Collection Badge */}
                    <div className="flex items-center gap-4 mt-8">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M20 5V35M5 20H35M10.6 10.6L29.4 29.4M10.6 29.4L29.4 10.6" stroke="black" strokeWidth="3" />
                      </svg>
                      <div>
                        <div className="font-bold">Summer Collection</div>
                        <div className="text-black text-sm">TRENDY AND CLASSIC FOR THE NEW SEASON</div>
                      </div>
                    </div>
                  </div>
                  {/* Right: Images & Vertical Label */}
                  <div className="flex-1 flex items-center justify-center relative min-w-[320px]">
                    {/* Decorative Yellow Star */}
                    <svg className="absolute -top-8 right-20 w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <path d="M32 8L36 28H56L40 36L44 56L32 44L20 56L24 36L8 28H28L32 8Z" fill="#FFE066"/>
                    </svg>
                    {/* Main Product Image */}
                    <div className="rounded-3xl overflow-hidden shadow-lg w-80 h-96 bg-white flex items-center justify-center">
                      <img src={imageUrl} alt={product.name} className="object-cover w-full h-full" />
                    </div>
                    {/* Vertical Label */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                      <span className="text-5xl font-extrabold tracking-widest text-black" style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}>
                        SUMMER
                      </span>
                      {/* Decorative Black Star */}
                      <svg className="mt-4 w-10 h-10" viewBox="0 0 40 40" fill="none">
                        <path d="M20 5V35M5 20H35M10.6 10.6L29.4 29.4M10.6 29.4L29.4 10.6" stroke="black" strokeWidth="3" />
                      </svg>
                    </div>
                    {/* Rotating Circular Badge */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <RotatingBadge />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          }) : (
            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                  <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-black">Product Name</h1>
                  <div className="flex gap-12 flex-wrap">
                    <div>
                      <div className="text-gray-500 font-medium">Price</div>
                      <div className="text-3xl font-bold">$0.00</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium">Available Size</div>
                      <div className="flex gap-2 mt-1">
                        {['Small', 'Medium', 'Large'].map(size => (
                          <span key={size} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{size}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium">Available Color</div>
                      <div className="flex gap-2 mt-1">
                        {['Black', 'Pink', 'White', 'Rose'].map(color => (
                          <span key={color} className="px-3 py-1 border rounded-lg text-black text-base font-medium bg-white/80">{color}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-6">
                    <a
                      href="/product/default?id=1"
                      className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors"
                    >
                      VIEW DETAILS
                    </a>
                    <a
                      href="/shop/default-grid"
                      className="border-2 border-black text-black px-8 py-4 rounded-xl font-bold text-lg bg-white/80 hover:bg-gray-100 transition-colors"
                    >
                      VIEW COLLECTION
                    </a>
                  </div>
                  {/* Collection Badge */}
                  <div className="flex items-center gap-4 mt-8">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path d="M20 5V35M5 20H35M10.6 10.6L29.4 29.4M10.6 29.4L29.4 10.6" stroke="black" strokeWidth="3" />
                    </svg>
                    <div>
                      <div className="font-bold">Summer Collection</div>
                      <div className="text-black text-sm">TRENDY AND CLASSIC FOR THE NEW SEASON</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center relative min-w-[320px]">
                  <svg className="absolute -top-8 right-20 w-16 h-16" viewBox="0 0 64 64" fill="none">
                    <path d="M32 8L36 28H56L40 36L44 56L32 44L20 56L24 36L8 28H28L32 8Z" fill="#FFE066"/>
                  </svg>
                  <div className="rounded-3xl overflow-hidden shadow-lg w-80 h-96 bg-white flex items-center justify-center">
                    <img src={fallbackImageUrl} alt="Product" className="object-cover w-full h-full" />
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-5xl font-extrabold tracking-widest text-black" style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}>
                      SUMMER
                    </span>
                    <svg className="mt-4 w-10 h-10" viewBox="0 0 40 40" fill="none">
                      <path d="M20 5V35M5 20H35M10.6 10.6L29.4 29.4M10.6 29.4L29.4 10.6" stroke="black" strokeWidth="3" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <RotatingBadge />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
    </section>
  );
};

export default HeroBanner; 