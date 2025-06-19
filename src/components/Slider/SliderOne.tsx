'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';

const baseUrl = 'https://api.roomily.tech';

interface ProductType {
    id: number;
    name: string;
    description: string;
    price: number;
    brandName: string;
    productSize: string;
    color: string;
    conditionPoints: number;
    status: string;
    stockQuantity: number;
    discount: number;
    averageRating: number;
    ratingCount: number;
    categoryName: string;
    primaryImageUrl: string;
    imageUrls: string[];
    createdAt: string | null;
}

const SliderOne = () => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/v1/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                console.log('API response for products:', data);
                // Try to find the array in the response
                let productsArray = Array.isArray(data.content) ? data.content : [];
                setProducts(productsArray);
            } catch (err: any) {
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <>
            <div className="slider-block style-one bg-linear xl:h-[860px] lg:h-[800px] md:h-[580px] sm:h-[500px] h-[350px] max-[420px]:h-[320px] w-full">
                <div className="slider-main h-full w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">Loading...</div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                    ) : (
                        <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            loop={true}
                            pagination={{ clickable: true }}
                            modules={[Pagination, Autoplay]}
                            className='h-full relative'
                            autoplay={{
                                delay: 4000,
                            }}
                        >
                            {products.slice(0, 5).map((product) => (
                                <SwiperSlide key={product.id}>
                                    <div className="slider-item h-full w-full relative">
                                        <div className="container w-full h-full flex items-center relative">
                                            <div className="text-content basis-1/2">
                                                <div className="text-sub-display">{product.discount > 0 ? `Sale! Up To ${product.discount}% Off!` : 'New Arrival'}</div>
                                                <div className="text-display md:mt-5 mt-2">{product.name}</div>
                                                <Link href={`/product/default?id=${product.id}`} className="button-main md:mt-8 mt-3">Shop Now</Link>
                                            </div>
                                            <div className="sub-img absolute sm:w-1/2 w-3/5 2xl:-right-[60px] -right-[16px] bottom-0">
                                                <Image
                                                    src={product.primaryImageUrl ? `${baseUrl}/api/v1/images/${product.primaryImageUrl}` : '/images/slider/bg1-1.png'}
                                                    width={670}
                                                    height={936}
                                                    alt={product.name}
                                                    priority={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>
        </>
    )
}

export default SliderOne