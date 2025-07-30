'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Benefit from '@/components/Home1/Benefit'
import Newsletter from '@/components/Home4/Newsletter'
import Instagram from '@/components/Home6/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomily.tech';

const AboutUs = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/v1/products`);
                const data = await res.json();
                setProducts(Array.isArray(data.content) ? data.content.slice(0, 3) : []);
            } catch (e) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Về chúng tôi' subHeading='Về chúng tôi' />
            </div>
            <div className='about md:pt-20 pt-10'>
                <div className="about-us-block">
                    <div className="container">
                        <div className="text flex items-center justify-center">
                            <div className="content md:w-5/6 w-full">
                                <div className="heading3 text-center">Tôi bị ám ảnh bởi chiếc váy mà Pippa Middleton mặc trong đám cưới của anh trai cô ấy.</div>
                                <div className="body1 text-center md:mt-7 mt-5">Kim Kardashian West không cần giới thiệu. Trong 14 năm kể từ khi cô ấy xuất hiện lần đầu trên màn ảnh với chương trình Keeping Up With The Kardashians, cô đã xây dựng đế chế làm đẹp KKW, quay chương trình, kết thúc chương trình, trở thành tỷ phú, học luật, vận động cho quyền lợi của các tử tù, đi khắp thế giới tham dự các sự kiện như Paris Fashion Week, nuôi dạy bốn đứa con và ra mắt thương hiệu đồ định hình SKIMS cực kỳ thành công.</div>
                            </div>
                        </div>
                        <div className="list-img grid sm:grid-cols-3 gap-[30px] md:pt-20 pt-10">
                            {loading ? (
                                // Loading skeleton
                                <>
                                    <div className="bg-img bg-gray-200 animate-pulse rounded-[30px] h-96"></div>
                                    <div className="bg-img bg-gray-200 animate-pulse rounded-[30px] h-96"></div>
                                    <div className="bg-img bg-gray-200 animate-pulse rounded-[30px] h-96"></div>
                                </>
                            ) : products.length > 0 ? (
                                // Dynamic product images
                                <>
                                    <div className="bg-img">
                                        <Image
                                            src={products[0]?.primaryImageUrl 
                                                ? `${baseUrl}/api/v1/images/${products[0].primaryImageUrl}`
                                                : '/images/other/about-us1.png'
                                            }
                                            width={2000}
                                            height={3000}
                                            alt={products[0]?.name || 'about-us1'}
                                            className='w-full rounded-[30px]'
                                        />
                                    </div>
                                    <div className="bg-img">
                                        <Image
                                            src={products[1]?.primaryImageUrl 
                                                ? `${baseUrl}/api/v1/images/${products[1].primaryImageUrl}`
                                                : '/images/other/about-us2.png'
                                            }
                                            width={2000}
                                            height={3000}
                                            alt={products[1]?.name || 'about-us2'}
                                            className='w-full rounded-[30px]'
                                        />
                                    </div>
                                    <div className="bg-img">
                                        <Image
                                            src={products[2]?.primaryImageUrl 
                                                ? `${baseUrl}/api/v1/images/${products[2].primaryImageUrl}`
                                                : '/images/other/about-us3.png'
                                            }
                                            width={2000}
                                            height={3000}
                                            alt={products[2]?.name || 'about-us3'}
                                            className='w-full rounded-[30px]'
                                        />
                                    </div>
                                </>
                            ) : (
                                // Fallback static images
                                <>
                                    <div className="bg-img">
                                        <Image
                                            src={'/images/other/about-us1.png'}
                                            width={2000}
                                            height={3000}
                                            alt='bg-img'
                                            className='w-full rounded-[30px]'
                                        />
                                    </div>
                                    <div className="bg-img">
                                        <Image
                                            src={'/images/other/about-us2.png'}
                                            width={2000}
                                            height={3000}
                                            alt='bg-img'
                                            className='w-full rounded-[30px]'
                                        />
                                    </div>
                                    <div className="bg-img">
                                        <Image
                                            src={'/images/other/about-us3.png'}
                                            width={2000}
                                            height={3000}
                                            alt='bg-img'
                                            className='w-full rounded-[30px]'
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Benefit props="md:pt-20 pt-10" />
            <Newsletter props="bg-green md:mt-20 mt-10" />
            <Instagram />
            <Brand />
            <Footer />
        </>
    )
}

export default AboutUs