'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import Product from '@/components/Product/Product';
import productData from '@/data/Product.json'
import useLoginPopup from '@/store/useLoginPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useModalSearchContext } from '@/context/ModalSearchContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
    props: string;
}

interface Category {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    productCount: number;
}

const MenuOne: React.FC<Props> = ({ props }) => {
    const router = useRouter()
    const pathname = usePathname()
    let [selectedType, setSelectedType] = useState<string | null>()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null)
    const { openModalCart } = useModalCartContext()
    const { cartState, getCartCount } = useCart()
    const { openModalWishlist } = useModalWishlistContext()
    const { wishlistState, getWishlistCount } = useWishlist()
    const { openModalSearch } = useModalSearchContext()
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`);
                const data = await response.json();
                setCategories(data.filter((category: Category) => category.isActive));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchDiscountedProducts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/discounted?pageNum=0&pageSize=10&sortBy=createdAt&sortDir=desc`);
                const data = await response.json();
                
                // Transform the API data to match Product component format
                const transformedProducts = data.content.slice(0, 2).map((product: any) => ({
                    id: product.id.toString(),
                    name: product.name,
                    description: product.description,
                    price: product.discount > 0 ? Number((product.price * (1 - product.discount/100)).toFixed(2)) : product.price,
                    originPrice: product.discount > 0 ? product.price : product.price,
                    brand: product.brandName,
                    sold: product.ratingCount || 0,
                    quantity: product.stockQuantity || 0,
                    sizes: [product.productSize],
                    variation: product.color?.split('/').map((color: string) => ({
                        color: color.trim(),
                        colorCode: color.trim().toLowerCase() === 'red' ? '#DB4444' :
                                 color.trim().toLowerCase() === 'yellow' ? '#ECB018' :
                                 color.trim().toLowerCase() === 'white' ? '#F6EFDD' :
                                 color.trim().toLowerCase() === 'purple' ? '#868I4D4' :
                                 color.trim().toLowerCase() === 'pink' ? '#F4407D' :
                                 color.trim().toLowerCase() === 'black' ? '#1F1F1F' :
                                 color.trim().toLowerCase() === 'green' ? '#D2EF9A' :
                                 color.trim().toLowerCase() === 'navy' ? '#000080' : '#000000',
                        colorImage: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${color.trim().toLowerCase()}.png`,
                        image: product.primaryImageUrl ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${product.primaryImageUrl}` : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/back.png`
                    })) || [{
                        color: product.color || '',
                        colorCode: '#000000',
                        colorImage: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/back.png`,
                        image: product.primaryImageUrl ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${product.primaryImageUrl}` : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/back.png`
                    }],
                    thumbImage: product.primaryImageUrl ? [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${product.primaryImageUrl}`] : [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/back.png`],
                    images: product.imageUrls?.length > 0 ? product.imageUrls.map((url: string) => `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${url}`) : [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/back.png`],
                    action: 'add to cart',
                    type: product.categoryName,
                    category: product.categoryName,
                    gender: product.categoryName,
                    new: false,
                    sale: product.discount > 0,
                    rate: product.averageRating || 0,
                    quantityPurchase: 0,
                    slug: product.name.toLowerCase().replace(/\s+/g, '-')
                }));
                
                setDiscountedProducts(transformedProducts);
            } catch (error) {
                console.error('Error fetching discounted products:', error);
            }
        };

        fetchDiscountedProducts();
    }, []);

    const handleOpenSubNavMobile = (index: number) => {
        setOpenSubNavMobile(openSubNavMobile === index ? null : index)
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        handleLoginPopup()
        router.push('/login')
    }

    const [fixedHeader, setFixedHeader] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
            setLastScrollPosition(scrollPosition);
        };

        // Gắn sự kiện cuộn khi component được mount
        window.addEventListener('scroll', handleScroll);

        // Hủy sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollPosition]);

    const handleGenderClick = (gender: string) => {
        router.push(`/shop/breadcrumb1?gender=${gender}`);
    };

    const handleCategoryClick = (category: string) => {
        router.push(`/shop/breadcrumb1?category=${category}`);
    };

    const handleTypeClick = (type: string) => {
        setSelectedType(type)
        router.push(`/shop/breadcrumb1?type=${type}`);
    };

    return (
        <>
            <div className={`header-menu style-one ${fixedHeader ? 'fixed' : 'absolute'} top-0 left-0 right-0 w-full md:h-[74px] h-[70px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="header-main flex justify-between h-full">
                        <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                            <i className="icon-category text-2xl"></i>
                        </div>
                        <div className="left flex items-center gap-16">
                            <Link href={'/'} className='flex items-center max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2 pt-2 max-lg:pt-2 max-sm:pt-3'>
                                <div className="heading4">
                                    <Image src={'/images/logo/logo.png'} alt='logo' width={80} height={80} />
                                </div>
                            </Link>
                            <div className="menu-main h-full max-lg:hidden">
                                <ul className='flex items-center gap-8 h-full'>
                                    <li className='h-full relative'>
                                        <Link
                                            href="/"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 ${pathname === '/' ? 'active' : ''}`}
                                        >
                                            HOME
                                        </Link>
                                    </li>
                                    <li className='h-full'>
                                        <Link
                                            href="/shop/default-grid"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes('/shop/') ? 'active' : ''}`}
                                        >
                                            SHOP
                                        </Link>
                                        <div className="mega-menu absolute top-[74px] left-0 bg-white w-screen">
                                            <div className="container">
                                                <div className="flex justify-between py-8">
                                                    <div className="nav-link basis-2/3 grid grid-cols-3 gap-8">
                                                        {categories.map((category) => (
                                                            <div key={category.id} className="nav-item">
                                                                <div className="text-button-uppercase pb-2">{category.name}</div>
                                                                <div className="text-secondary text-sm mt-2">{category.description}</div>
                                                                <Link
                                                                    href="/shop/default-grid"
                                                                    className="link text-secondary duration-300 mt-4 inline-block hover:text-black"
                                                                >
                                                                    View All
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="recent-product pl-2.5 basis-1/3">
                                                        <div className="text-button-uppercase pb-2">Recent Products</div>
                                                        <div className="list-product hide-product-sold grid grid-cols-2 gap-5 mt-3">
                                                            {discountedProducts.map((prd, index) => (
                                                                <Product key={index} data={prd} type='grid' />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className='h-full'>
                                        <Link
                                            href="/pages/about"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === '/pages/about' ? 'active' : ''}`}
                                                                    >
                                            ABOUT US
                                                                    </Link>
                                                                </li>
                                    <li className='h-full'>
                                                                    <Link
                                            href="/pages/store-list"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === '/pages/store-list' ? 'active' : ''}`}
                                                                    >
                                            STORE LIST
                                                                    </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="right flex items-center gap-5">
                            {/* <div className="max-md:hidden search-icon flex items-center cursor-pointer" onClick={openModalSearch}>
                                <Icon.MagnifyingGlass size={24} color='black' />
                            </div> */}
                            <div className="user-icon flex items-center justify-center cursor-pointer">
                                <Icon.User size={24} color='black' onClick={handleLoginPopup} />
                                <div
                                    className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-small 
                                        ${openLoginPopup ? 'open' : ''}`}
                                >
                                    {isLoggedIn ? (
                                        <>
                                            <Link href={'/my-account'} className="button-main w-full text-center" onClick={handleLoginPopup}>My Account</Link>
                                            <div className="text-secondary text-center mt-3 pb-4">
                                                <button onClick={handleLogout} className='text-black hover:underline'>Logout</button>
                                            </div>
                                            <div className="bottom pt-4 border-t border-line"></div>
                                            <Link href={'#!'} className='body1 hover:underline'>Support</Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={'/login'} className="button-main w-full text-center" onClick={handleLoginPopup}>Login</Link>
                                            <div className="text-secondary text-center mt-3 pb-4">Don't have an account?
                                                <Link href={'/register'} className='text-black pl-1 hover:underline' onClick={handleLoginPopup}>Register</Link>
                                            </div>
                                            <div className="bottom pt-4 border-t border-line"></div>
                                            <Link href={'#!'} className='body1 hover:underline'>Support</Link>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                                <Icon.Handbag size={24} color='black' />
                                <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">{getCartCount()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
                <div className="menu-container bg-white h-full">
                    <div className="container h-full">
                        <div className="menu-main h-full overflow-hidden">
                            <div className="heading py-2 relative flex items-center justify-center">
                                <div
                                    className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
                                    onClick={handleMenuMobile}
                                >
                                    <Icon.X size={14} />
                                </div>
                                <Link href={'/'} className='logo text-3xl font-semibold text-center'>Anvogue</Link>
                            </div>
                            <div className="form-search relative mt-2">
                                <Icon.MagnifyingGlass size={20} className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer' />
                                <input type="text" placeholder='What are you looking for?' className=' h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4' />
                            </div>
                            <div className="list-nav mt-6">
                                <ul>
                                    <li>
                                        <Link href={'/'} className='text-xl font-semibold flex items-center justify-between'>Home</Link>
                                    </li>
                                    <li>
                                        <Link href={'/shop/default-grid'} className='text-xl font-semibold flex items-center justify-between mt-5'>Shop</Link>
                                    </li>
                                    <li>
                                        <Link href={'/pages/about'} className='text-xl font-semibold flex items-center justify-between mt-5'>About Us</Link>
                                    </li>
                                    <li>
                                        <Link href={'/pages/store-list'} className='text-xl font-semibold flex items-center justify-between mt-5'>Store List</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MenuOne