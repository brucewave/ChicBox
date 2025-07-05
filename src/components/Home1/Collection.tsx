'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import { useRouter } from 'next/navigation';
// import Fade from 'react-reveal'

const baseUrl = 'https://api.roomily.tech';

interface Category {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    productCount: number;
}

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

const Collection = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch(`${baseUrl}/api/v1/categories`),
                    fetch(`${baseUrl}/api/v1/products`)
                ]);
                const catData = await catRes.json();
                const prodData = await prodRes.json();
                setCategories(catData.filter((c: Category) => c.isActive));
                // products may be in prodData.content
                setProducts(Array.isArray(prodData.content) ? prodData.content : []);
            } catch (err) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTypeClick = (type: string) => {
        router.push(`/shop/default-grid?type=${type}`);
    };

    // Helper: get a random product image for a category
    const getRandomImageForCategory = (categoryName: string) => {
        const filtered = products.filter(p => p.categoryName === categoryName && p.primaryImageUrl);
        if (filtered.length === 0) return null;
        const randomProduct = filtered[Math.floor(Math.random() * filtered.length)];
        return `${baseUrl}/api/v1/images/${randomProduct.primaryImageUrl}`;
    };

    return (
        <>
            <div className="collection-block md:pt-10 pt-10">
                <div className="container">
                    <div className="heading3 text-center">Explore Collections</div>
                </div>
                <div className="list-collection section-swiper-navigation md:mt-10 mt-6 sm:px-5 px-4">
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : (
                        <Swiper
                            spaceBetween={12}
                            slidesPerView={2}
                            navigation
                            loop={true}
                            modules={[Navigation, Autoplay]}
                            breakpoints={{
                                576: {
                                    slidesPerView: 2,
                                    spaceBetween: 12,
                                },
                                768: {
                                    slidesPerView: 3,
                                    spaceBetween: 20,
                                },
                                1200: {
                                    slidesPerView: 4,
                                    spaceBetween: 20,
                                },
                            }}
                            className='h-full'
                        >
                            {categories.map((category) => {
                                const imgUrl = getRandomImageForCategory(category.name);
                                return (
                                    <SwiperSlide key={category.id}>
                                        <div className="collection-item block relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleTypeClick(category.name)}>
                                            <div className="bg-img">
                                                {imgUrl ? (
                                                    <Image
                                                        src={imgUrl}
                                                        width={1000}
                                                        height={600}
                                                        alt={category.name}
                                                    />
                                                ) : (
                                                    <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                                                )}
                                            </div>
                                            <div className="collection-name heading5 text-center sm:bottom-8 bottom-4 lg:w-[200px] md:w-[160px] w-[100px] md:py-3 py-1.5 bg-white rounded-xl duration-500">
                                                {category.name}
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    )}
                </div>
            </div>
        </>
    )
}

export default Collection