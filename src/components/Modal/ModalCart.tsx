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
                    <div className="left w-1/2 border-r border-line py-6 max-md:hidden">
                        <div className="heading5 px-6 pb-3">You May Also Like</div>
                        <div className="list px-6">
                            {productData.slice(0, 4).map((product) => (
                                <div key={product.id} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                    <div className="infor flex items-center gap-5">
                                        <div className="bg-img">
                                            <Image
                                                src={product.images[0]}
                                                width={300}
                                                height={300}
                                                alt={product.name}
                                                className='w-[100px] aspect-square flex-shrink-0 rounded-lg'
                                            />
                                        </div>
                                        <div className=''>
                                            <div className="name text-button">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="product-price text-title">${product.price}</div>
                                                <div className="product-origin-price text-title text-secondary2"><del>${product.originPrice}</del></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="text-xl bg-white w-10 h-10 rounded-xl border border-black flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAddToCart(product)
                                        }}
                                    >
                                        <Icon.Handbag />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="right cart-block md:w-1/2 w-full py-6 relative overflow-hidden">
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
                        <div className="time px-6">
                            <div className=" flex items-center gap-3 px-5 py-3 bg-green rounded-lg">
                                <p className='text-3xl'>🔥</p>
                                <div className="caption1">Your cart will expire in <span className='text-red caption1 font-semibold'>{timeLeft.minutes}:
                                    {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</span> minutes!<br />
                                    Please checkout now before your items sell out!</div>
                            </div>
                        </div>
                        <div className="heading banner mt-3 px-6">
                            <div className="text">Buy <span className="text-button"> $<span className="more-price">{moneyForFreeship - totalCart > 0 ? (<>{moneyForFreeship - totalCart}</>) : (0)}</span> </span>
                                <span>more to get </span>
                                <span className="text-button">freeship</span></div>
                            <div className="tow-bar-block mt-3">
                                <div
                                    className="progress-line"
                                    style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : `100%` }}
                                ></div>
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
                            <div className="flex items-center justify-center lg:gap-14 gap-8 px-6 py-4 border-b border-line">
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('note')}
                                >
                                    <Icon.NotePencil className='text-xl' />
                                    <div className="caption1">Note</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('shipping')}
                                >
                                    <Icon.Truck className='text-xl' />
                                    <div className="caption1">Shipping</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('coupon')}
                                >
                                    <Icon.Tag className='text-xl' />
                                    <div className="caption1">Coupon</div>
                                </div>
                            </div>
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
                            <div className={`tab-item note-block ${activeTab === 'note' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.NotePencil className='text-xl' />
                                        <div className="caption1">Note</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <textarea name="form-note" id="form-note" rows={4} placeholder='Add special instructions for your order...' className='caption1 py-3 px-4 bg-surface border-line rounded-md w-full'></textarea>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Save</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'shipping' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Truck className='text-xl' />
                                        <div className="caption1">Estimate shipping rates</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-country' className="caption1 text-secondary">Country/region</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-country"
                                                name="select-country"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'Country/region'}
                                            >
                                                <option value="Country/region" disabled>Country/region</option>
                                                <option value="France">France</option>
                                                <option value="Spain">Spain</option>
                                                <option value="UK">UK</option>
                                                <option value="USA">USA</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-state' className="caption1 text-secondary">State</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-state"
                                                name="select-state"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'State'}
                                            >
                                                <option value="State" disabled>State</option>
                                                <option value="Paris">Paris</option>
                                                <option value="Madrid">Madrid</option>
                                                <option value="London">London</option>
                                                <option value="New York">New York</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-code' className="caption1 text-secondary">Postal/Zip Code</label>
                                        <input className="border-line px-5 py-3 w-full rounded-xl mt-3" id="select-code" type="text" placeholder="Postal/Zip Code" />
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Calculator</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'coupon' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Tag className='text-xl' />
                                        <div className="caption1">Add A Coupon Code</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-discount' className="caption1 text-secondary">Enter Code</label>
                                        <input 
                                            className="border-line px-5 py-3 w-full rounded-xl mt-3" 
                                            id="select-discount" 
                                            type="text" 
                                            placeholder="Discount code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        {couponError && <div className="text-red-500 text-sm mt-2">{couponError}</div>}
                                    </div>
                                    <div className="mt-4">
                                        <div className={`item ${freeItemApplied ? 'bg-green' : ''} border border-line rounded-lg py-2 px-4`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="caption1 font-bold">Buy 5 Get 1 Free</div>
                                                    <div className="caption1 text-secondary">Get your cheapest item free when you buy 5 or more items</div>
                                                </div>
                                                <div
                                                    className="button-main py-1 px-2.5 capitalize text-xs"
                                                    onClick={handleApplyFreeItem}
                                                >
                                                    {freeItemApplied ? 'Applied' : 'Apply Offer'}
                                                </div>
                                            </div>
                                        </div>
                                        {userCoupons.length > 0 && (
                                            <div className="mt-4">
                                                <div className="text-button mb-3">Your Coupons</div>
                                                {userCoupons.map((coupon) => (
                                                    <div key={coupon.id} className={`item ${selectedCoupon?.id === coupon.id ? 'bg-green' : ''} border border-line rounded-lg py-2 px-4 mb-3`}>
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="caption1 font-bold">{coupon.name}</div>
                                                                <div className="caption1 text-secondary">{coupon.couponPercentage}% OFF - Valid until {new Date(coupon.validUntil).toLocaleDateString()}</div>
                                                            </div>
                                                            <div
                                                                className="button-main py-1 px-2.5 capitalize text-xs"
                                                                onClick={() => {
                                                                    setCouponCode(coupon.couponCode);
                                                                    handleApplyCoupon();
                                                                }}
                                                            >
                                                                {selectedCoupon?.id === coupon.id ? 'Applied' : 'Apply Code'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4">
                                            <div className="text-button mb-3">Available Coupons</div>
                                            {coupons.map((coupon) => (
                                                <div key={coupon.id} className={`item ${selectedCoupon?.id === coupon.id ? 'bg-green' : ''} border border-line rounded-lg py-2 px-4 mb-3`}>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="caption1 font-bold">{coupon.name}</div>
                                                            <div className="caption1 text-secondary">{coupon.couponPercentage}% OFF - Valid until {new Date(coupon.validUntil).toLocaleDateString()}</div>
                                                        </div>
                                                        <div
                                                            className="button-main py-1 px-2.5 capitalize text-xs"
                                                            onClick={() => {
                                                                setCouponCode(coupon.couponCode);
                                                                handleApplyCoupon();
                                                            }}
                                                        >
                                                            {selectedCoupon?.id === coupon.id ? 'Applied' : 'Apply Code'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={handleApplyCoupon}>Apply</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
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