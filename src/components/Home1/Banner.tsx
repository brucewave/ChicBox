'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomily.tech';

const Banner = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/v1/products`);
                const data = await res.json();
                setProducts(Array.isArray(data.content) ? data.content.slice(0, 2) : []);
            } catch (e) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="banner-block style-one grid sm:grid-cols-2 gap-5 md:pt-20 pt-10">
                <div className="banner-item relative block overflow-hidden duration-500 bg-gray-200 animate-pulse">
                    <div className="banner-img h-64"></div>
                </div>
                <div className="banner-item relative block overflow-hidden duration-500 bg-gray-200 animate-pulse">
                    <div className="banner-img h-64"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="banner-block style-one grid sm:grid-cols-2 gap-5 md:pt-20 pt-10">
                {products.length > 0 ? (
                    <>
                        <Link href={`/product/default?id=${products[0]?.id}`} className="banner-item relative block overflow-hidden duration-500">
                            <div className="banner-img">
                                <Image
                                    src={products[0]?.primaryImageUrl 
                                        ? `${baseUrl}/api/v1/images/${products[0].primaryImageUrl}`
                                        : '/images/banner/1.png'
                                    }
                                    width={2000}
                                    height={1300}
                                    alt={products[0]?.name || 'banner1'}
                                    priority={true}
                                    className='duration-1000'
                                />
                            </div>
                            <div className="banner-content absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                <div className="heading2 text-white">{products[0]?.name || 'Bán chạy nhất'}</div>
                                <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2">Mua ngay</div>
                            </div>
                        </Link>
                        <Link href={`/product/default?id=${products[1]?.id}`} className="banner-item relative block overflow-hidden duration-500">
                            <div className="banner-img">
                                <Image
                                    src={products[1]?.primaryImageUrl 
                                        ? `${baseUrl}/api/v1/images/${products[1].primaryImageUrl}`
                                        : '/images/banner/2.png'
                                    }
                                    width={2000}
                                    height={1300}
                                    alt={products[1]?.name || 'banner2'}
                                    priority={true}
                                    className='duration-1000'
                                />
                            </div>
                            <div className="banner-content absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                <div className="heading2 text-white">{products[1]?.name || 'Hàng mới về'}</div>
                                <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2">Mua ngay</div>
                            </div>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={'/shop/default-grid'} className="banner-item relative block overflow-hidden duration-500">
                            <div className="banner-img">
                                <Image
                                    src={'/images/banner/1.png'}
                                    width={2000}
                                    height={1300}
                                    alt='banner1'
                                    priority={true}
                                    className='duration-1000'
                                />
                            </div>
                            <div className="banner-content absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                <div className="heading2 text-white">Bán chạy nhất</div>
                                <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2">Mua ngay</div>
                            </div>
                        </Link>
                        <Link href={'/shop/default-grid'} className="banner-item relative block overflow-hidden duration-500">
                            <div className="banner-img">
                                <Image
                                    src={'/images/banner/2.png'}
                                    width={2000}
                                    height={1300}
                                    alt='banner2'
                                    priority={true}
                                    className='duration-1000'
                                />
                            </div>
                            <div className="banner-content absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                <div className="heading2 text-white">Hàng mới về</div>
                                <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2">Mua ngay</div>
                            </div>
                        </Link>
                    </>
                )}
            </div>
        </>
    )
}

export default Banner