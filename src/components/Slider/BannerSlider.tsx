'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';

interface BannerType {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    link: string;
    buttonText: string;
}

const BannerSlider = () => {
    // Dữ liệu banner mẫu - bạn có thể thay đổi hoặc lấy từ API
    const [banners] = useState<BannerType[]>([
        {
            id: 1,
            title: "Khuyến mãi mùa hè",
            subtitle: "Giảm giá lên đến 50% cho tất cả sản phẩm",
            imageUrl: "/images/banner/1.png",
            link: "/shop/breadcrumb1",
            buttonText: "Mua ngay"
        },
        {
            id: 2,
            title: "Bộ sưu tập mới",
            subtitle: "Khám phá những xu hướng mới nhất",
            imageUrl: "/images/banner/2.png",
            link: "/shop/breadcrumb1",
            buttonText: "Khám phá"
        },
        {
            id: 3,
            title: "Flash Sale",
            subtitle: "Chỉ trong 24 giờ - Đừng bỏ lỡ!",
            imageUrl: "/images/banner/3.png",
            link: "/shop/breadcrumb1",
            buttonText: "Mua ngay"
        },
        {
            id: 4,
            title: "Ưu đãi đặc biệt",
            subtitle: "Dành cho khách hàng VIP",
            imageUrl: "/images/banner/4.png",
            link: "/shop/breadcrumb1",
            buttonText: "Xem ưu đãi"
        }
    ]);

    return (
        <>
            <div className="banner-slider-block w-full bg-gradient-to-r from-blue-50 to-purple-50 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <div className="slider-main relative">
                        <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            loop={true}
                            pagination={{ 
                                clickable: true,
                                dynamicBullets: true,
                                renderBullet: function (index, className) {
                                    return '<span class="' + className + ' w-3 h-3 bg-white border-2 border-gray-300 hover:bg-blue-500 transition-all duration-300"></span>';
                                }
                            }}
                            navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            }}
                            modules={[Pagination, Navigation, Autoplay]}
                            className='banner-swiper h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl'
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                            }}
                            effect="fade"
                            fadeEffect={{
                                crossFade: true
                            }}
                        >
                            {banners.map((banner) => (
                                <SwiperSlide key={banner.id}>
                                    <div className="banner-slide h-full w-full relative">
                                        <div className="banner-image absolute inset-0">
                                            <Image
                                                src={banner.imageUrl}
                                                fill
                                                alt={banner.title}
                                                priority={true}
                                                className='object-cover'
                                            />
                                            {/* Overlay để text dễ đọc hơn */}
                                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                                        </div>
                                        
                                        <div className="banner-content absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
                                            <div className="max-w-2xl">
                                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                                    {banner.title}
                                                </h2>
                                                <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90">
                                                    {banner.subtitle}
                                                </p>
                                                <Link 
                                                    href={banner.link} 
                                                    className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                                >
                                                    {banner.buttonText}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        
                        {/* Custom Navigation Buttons */}
                        <div className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-300 shadow-lg">
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <div className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-300 shadow-lg">
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BannerSlider
