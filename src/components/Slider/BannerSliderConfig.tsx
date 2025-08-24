'use client'

import React from 'react'
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
    backgroundColor?: string;
    textColor?: string;
    buttonStyle?: 'primary' | 'secondary' | 'outline';
}

interface BannerSliderConfigProps {
    banners?: BannerType[];
    autoPlay?: boolean;
    autoPlayDelay?: number;
    showNavigation?: boolean;
    showPagination?: boolean;
    height?: string;
    className?: string;
}

const BannerSliderConfig: React.FC<BannerSliderConfigProps> = ({
    banners = [],
    autoPlay = true,
    autoPlayDelay = 5000,
    showNavigation = false,
    showPagination = true,
    height = "h-[300px] md:h-[400px] lg:h-[500px]",
    className = ""
}) => {
    // Dữ liệu banner mặc định nếu không có banners được truyền vào
    const defaultBanners: BannerType[] = [
        {
            id: 1,
            title: "Khuyến mãi mùa hè",
            subtitle: "Giảm giá lên đến 50% cho tất cả sản phẩm",
            imageUrl: "/images/banner/banner1.jpg",
            link: "/shop/breadcrumb1",
            buttonText: "Mua ngay",
            buttonStyle: 'primary'
        },
        {
            id: 2,
            title: "Bộ sưu tập mới",
            subtitle: "Khám phá những xu hướng mới nhất",
            imageUrl: "/images/banner/banner2.jpg",
            link: "/shop/breadcrumb1",
            buttonText: "Khám phá",
            buttonStyle: 'secondary'
        },
        {
            id: 3,
            title: "Flash Sale",
            subtitle: "Chỉ trong 24 giờ - Đừng bỏ lỡ!",
            imageUrl: "/images/banner/banner3.jpg",
            link: "/shop/breadcrumb1",
            buttonText: "Mua ngay",
            buttonStyle: 'outline'
        },
        {
            id: 4,
            title: "Ưu đãi đặc biệt",
            subtitle: "Dành cho khách hàng VIP",
            imageUrl: "/images/banner/banner4.jpg",
            link: "/shop/breadcrumb1",
            buttonText: "Xem ưu đãi",
            buttonStyle: 'primary'
        }
    ];

    const displayBanners = banners.length > 0 ? banners : defaultBanners;

    const getButtonStyle = (style: string = 'primary') => {
        switch (style) {
            case 'secondary':
                return "bg-gray-800 text-white hover:bg-gray-700";
            case 'outline':
                return "bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900";
            default:
                return "bg-white text-gray-900 hover:bg-gray-100";
        }
    };

    return (
        <>
            <div className={`banner-slider-block w-full bg-gradient-to-r from-blue-50 to-purple-50 ${className}`}>
                <div className="w-full">
                    <div className="slider-main relative">
                        <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            loop={true}
                            pagination={showPagination ? { 
                                clickable: true,
                                dynamicBullets: true,
                                renderBullet: function (index, className) {
                                    return '<span class="' + className + ' w-3 h-3 bg-white border-2 border-gray-300 hover:bg-blue-500 transition-all duration-300"></span>';
                                }
                            } : false}
                            navigation={showNavigation ? {
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            } : false}
                            modules={[Pagination, Navigation, Autoplay]}
                            className={`banner-swiper ${height} w-full overflow-hidden`}
                            autoplay={autoPlay ? {
                                delay: autoPlayDelay,
                                disableOnInteraction: false,
                            } : false}
                            effect="fade"
                            fadeEffect={{
                                crossFade: true
                            }}
                        >
                            {displayBanners.map((banner) => (
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
                                                    className={`inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(banner.buttonStyle)}`}
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
                        {showNavigation && (
                            <>
                                <div className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110">
                                    <svg 
                                        className="w-8 h-8 drop-shadow-lg" 
                                        fill="none" 
                                        stroke="white" 
                                        viewBox="0 0 24 24"
                                        style={{ color: 'white', stroke: 'white' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </div>
                                <div className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110">
                                    <svg 
                                        className="w-8 h-8 drop-shadow-lg" 
                                        fill="none" 
                                        stroke="white" 
                                        viewBox="0 0 24 24"
                                        style={{ color: 'white', stroke: 'white' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default BannerSliderConfig
