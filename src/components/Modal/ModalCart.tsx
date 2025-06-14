'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import productData from '@/data/Product.json'
import { ProductType } from '@/type/ProductType';
import { useModalCartContext } from '@/context/ModalCartContext'
import { useCart } from '@/context/CartContext'
import { countdownTime } from '@/store/countdownTime'
import CountdownTimeType from '@/type/CountdownType';
import { cartService } from '@/services/cartService'
import { couponService, Coupon } from '@/services/couponService'

const ModalCart = ({ serverTimeLeft }: { serverTimeLeft: CountdownTimeType }) => {
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(countdownTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const [activeCoupons, userSpecificCoupons] = await Promise.all([
                    couponService.getActiveCoupons(),
                    couponService.getUserCoupons()
                ]);
                setCoupons(activeCoupons);
                setUserCoupons(userSpecificCoupons);
            } catch (error) {
                console.error('Failed to fetch coupons:', error);
            }
        };
        fetchCoupons();
    }, []);

    const [activeTab, setActiveTab] = useState<string | undefined>('')
    const { isModalOpen, closeModalCart } = useModalCartContext();
    const { cartState, addToCart, removeFromCart, updateCart, refreshCart } = useCart()

    // Refresh cart on initial load
    useEffect(() => {
        refreshCart();
    }, []);

    // Refresh cart when modal opens
    useEffect(() => {
        if (isModalOpen) {
            refreshCart();
        }
    }, [isModalOpen]);

    // Listen for token changes (login/logout)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                refreshCart();
            }
        };

        const handleTokenChange = () => {
            refreshCart();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('tokenChange', handleTokenChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tokenChange', handleTokenChange);
        };
    }, []);

    const handleAddToCart = async (productItem: ProductType) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            
            if (!cartState.cartArray.find(item => item.id === productItem.id)) {
                await addToCart(productItem);
                await refreshCart(); // Refresh after adding new item
            } else {
                const existingItem = cartState.cartArray.find(item => item.id === productItem.id);
                if (existingItem) {
                    if (token) {
                        // If user is logged in, update through API
                        await cartService.addToCart(productItem.id);
                        await refreshCart(); // Refresh after API update
                    } else {
                        updateCart(
                            productItem.id,
                            existingItem.quantity + 1,
                            existingItem.selectedSize,
                            existingItem.selectedColor
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Failed to add item to cart:', error);
        }
    };

    const handleRemoveFromCart = async (productId: string) => {
        try {
            await removeFromCart(productId);
            await refreshCart(); // Refresh after removal
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
        }
    };

    const handleActiveTab = (tab: string) => {
        setActiveTab(tab)
    }

    let moneyForFreeship = 150;
    let [totalCart, setTotalCart] = useState<number>(0)
    let [discountCart, setDiscountCart] = useState<number>(0)
    let [freeItemApplied, setFreeItemApplied] = useState<boolean>(false)

    // Calculate total cart value
    useEffect(() => {
        const total = cartState.cartArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalCart(total);
    }, [cartState.cartArray]);

    const handleApplyFreeItem = () => {
        const totalItems = cartState.cartArray.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems >= 5 && !freeItemApplied) {
            // Find the cheapest item to make it free
            const cheapestItem = cartState.cartArray.reduce((min, item) => 
                item.price < min.price ? item : min
            , cartState.cartArray[0]);
            
            setDiscountCart(prev => prev + cheapestItem.price);
            setFreeItemApplied(true);
        } else if (totalItems < 5) {
            alert('You need at least 5 items to get one free!');
        }
    };

    const handleApplyCoupon = async () => {
        try {
            if (!couponCode) {
                setCouponError('Please enter a coupon code');
                return;
            }

            const coupon = await couponService.getCouponByCode(couponCode);
            if (!coupon.isCurrentlyValid) {
                setCouponError('This coupon is not currently valid');
                return;
            }

            if (coupon.remainingUses <= 0) {
                setCouponError('This coupon has no remaining uses');
                return;
            }

            const result = await couponService.applyCoupon(couponCode, totalCart);
            setSelectedCoupon(coupon);
            setDiscountCart(Math.floor((totalCart * coupon.couponPercentage) / 100));
            setCouponError('');
        } catch (error) {
            setCouponError('Invalid coupon code');
        }
    };

    return (
        <>
            <div className={`modal-cart-block`} onClick={closeModalCart}>
                <div
                    className={`modal-cart-main flex ${isModalOpen ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="right cart-block w-full py-6 relative overflow-hidden">
                        {cartState.cartArray.length === 0 ? (
                            <div className="px-6 text-center text-title">
                                Your cart is empty.
                            </div>
                        ) : (
                            <>
                            <div className="heading px-6 pb-3 flex items-center justify-between relative">
                                <div className="heading5">Shopping Cart</div>
                                <div
                                    className="close-btn absolute right-6 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                    onClick={closeModalCart}
                                >
                                    <Icon.X size={14} />
                                </div>
                            </div>
                            <div className="list-product px-6">
                                {cartState.cartArray.map((product) => (
                                    <div key={product.id} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                        <div className="infor flex items-center gap-3 w-full">
                                            <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                                                <Image
                                                            src={(Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : '/assets/images/product_placeholder.png'}
                                                    width={300}
                                                    height={300}
                                                    alt={product.name}
                                                    className='w-full h-full'
                                                />
                                            </div>
                                            <div className='w-full'>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="name text-button">{product.name}</div>
                                                    <div
                                                        className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer"
                                                                onClick={() => handleRemoveFromCart(product.id)}
                                                    >
                                                        Remove
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-3 w-full">
                                                    <div className="flex items-center text-secondary2 capitalize">
                                                                {product.selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : '')}/{product.selectedColor || (product.variation && product.variation.length > 0 ? product.variation[0].color : '')}
                                                    </div>
                                                    <div className="product-price text-title">${product.price}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="footer-modal bg-white absolute bottom-0 left-0 w-full">
                                <div className="flex items-center justify-between pt-6 px-6">
                                    <div className="heading5">Subtotal</div>
                                    <div className="heading5">${totalCart}</div>
                                </div>
                                <div className="block-button text-center p-6">
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={'/cart'}
                                            className='button-main basis-1/2 bg-white border border-black text-black text-center uppercase'
                                            onClick={closeModalCart}
                                        >
                                            View cart
                                        </Link>
                                        <Link
                                            href={'/checkout'}
                                            className='button-main basis-1/2 text-center uppercase'
                                            onClick={closeModalCart}
                                        >
                                            Check Out
                                        </Link>
                                    </div>
                                    <div onClick={closeModalCart} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Or continue shopping</div>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalCart