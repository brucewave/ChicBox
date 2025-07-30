'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import Product from '../Product/Product'
import { motion } from 'framer-motion'
import { ProductType } from '@/type/ProductType'

const baseUrl = 'https://api.roomily.tech';

const TabFeatures: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('on sale');
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/v1/products`);
                const data = await response.json();
                const apiProducts = Array.isArray(data.content) ? data.content : [];
                // Map API products to local ProductType
                const mappedProducts: ProductType[] = apiProducts.map((product: any) => ({
                    id: product.id?.toString() || '',
                    category: product.categoryName || '',
                    type: product.categoryName || '',
                    name: product.name || '',
                    gender: product.categoryName || '',
                    new: !!product.tag,
                    sale: product.discount > 0,
                    rate: product.averageRating || 0,
                    price: product.discount > 0 ? Number((product.price * (1 - product.discount/100)).toFixed(2)) : product.price,
                    originPrice: product.price || 0,
                    brand: product.brandName || '',
                    sold: product.ratingCount || 0,
                    quantity: product.stockQuantity || 0,
                    quantityPurchase: 0,
                    sizes: product.productSize ? [product.productSize] : [],
                    variation: product.color?.split('/')?.map((color: string) => ({
                        color: color.trim(),
                        colorCode: '#000000',
                        colorImage: product.primaryImageUrl ? `${baseUrl}/api/v1/images/${product.primaryImageUrl}` : '',
                        image: product.primaryImageUrl ? `${baseUrl}/api/v1/images/${product.primaryImageUrl}` : ''
                    })) || [],
                    thumbImage: product.primaryImageUrl ? [`${baseUrl}/api/v1/images/${product.primaryImageUrl}`] : [],
                    images: product.imageUrls?.length > 0 ? product.imageUrls.map((url: string) => `${baseUrl}/api/v1/images/${url}`) : [],
                    description: product.description || '',
                    action: 'add to cart',
                    slug: product.name?.toLowerCase().replace(/\s+/g, '-') || '',
                    conditionPoints: product.conditionPoints ?? 0,
                    status: product.status ?? '',
                    averageRating: product.averageRating ?? 0,
                    isAvailable: product.isAvailable ?? true,
                    material: product.material ?? '',
                    shoulder: product.shoulder ?? 0,
                    width: product.width ?? 0,
                    length: product.length ?? 0,
                    arm: product.arm ?? 0,
                    form: product.form ?? '',
                    fault: product.fault ?? '',
                }));
                setProducts(mappedProducts);
            } catch (err) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleTabClick = (item: string) => {
        setActiveTab(item)
    }

    const getFilterData = () => {
        if (activeTab === 'on sale') {
            return products.filter((product) => product.sale);
        }
        if (activeTab === 'new arrivals') {
            return products.filter((product) => product.new);
        }
        return products;
    }

    const filteredProducts = getFilterData();
    const start = 0;
    const limit = 8;

    return (
        <>
            <div className="tab-features-block md:pt-20 pt-10">
                <div className="container">
                    <div className="heading flex flex-col items-center text-center">
                        <div className="menu-tab flex items-center gap-2 p-1 bg-surface rounded-2xl">
                            {['Đang giảm giá', 'Hàng mới về'].map((item, index) => (
                                <div
                                    key={index}
                                    className={`tab-item relative text-secondary heading5 py-2 px-5 cursor-pointer duration-500 hover:text-black ${activeTab === item ? 'active' : ''}`}
                                    onClick={() => handleTabClick(item)}
                                >
                                    {activeTab === item && (
                                        <motion.div layoutId='active-pill' className='absolute inset-0 rounded-2xl bg-white'></motion.div>
                                    )}
                                    <span className='relative heading5 z-[1]'>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="list-product hide-product-sold section-swiper-navigation style-outline style-border md:mt-10 mt-6">
                        {loading ? (
                            <div className="text-center py-10">Đang tải...</div>
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
                                        spaceBetween: 30,
                                    },
                                }}
                            >
                                {filteredProducts.slice(start, limit).map((prd, index) => (
                                    <SwiperSlide key={index}>
                                        <Product data={prd} type='grid' />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default TabFeatures