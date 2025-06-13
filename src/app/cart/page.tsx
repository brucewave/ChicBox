'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'
import { countdownTime } from '@/store/countdownTime'
import { cartService } from '@/services/cartService'
import { couponService, Coupon } from '@/services/couponService'

const Cart = () => {
    const [timeLeft, setTimeLeft] = useState(countdownTime());
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [totalCart, setTotalCart] = useState<number>(0);
    const [discountCart, setDiscountCart] = useState<number>(0);
    const [shipCart, setShipCart] = useState<number>(30);
    const [applyCode, setApplyCode] = useState<number>(0);
    const [freeItemApplied, setFreeItemApplied] = useState<boolean>(false);
    const router = useRouter();

    const { cartState, updateCart, removeFromCart } = useCart();
    const moneyForFreeship = 150;

    // Calculate total cart value
    useEffect(() => {
        const newTotal = cartState.cartArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalCart(newTotal);
    }, [cartState.cartArray]);

    // Update shipping cost based on total
    useEffect(() => {
        if (totalCart < moneyForFreeship) {
            setShipCart(30);
        } else {
            setShipCart(0);
        }
        if (cartState.cartArray.length === 0) {
            setShipCart(0);
        }
    }, [totalCart, cartState.cartArray.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(countdownTime());
        }, 1000);

        const fetchCoupons = async () => {
            setIsLoading(true);
            try {
                console.log('Fetching coupons...');
                const [activeCoupons, userSpecificCoupons] = await Promise.all([
                    couponService.getActiveCoupons(),
                    couponService.getUserCoupons()
                ]);
                console.log('Active coupons:', activeCoupons);
                console.log('User coupons:', userSpecificCoupons);
                setCoupons(activeCoupons || []);
                setUserCoupons(userSpecificCoupons || []);
            } catch (error) {
                console.error('Failed to fetch coupons:', error);
                setCouponError('Failed to load coupons. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCoupons();

        return () => {
            clearInterval(timer);
        };
    }, []);

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const itemToUpdate = cartState.cartArray.find((item) => item.id === productId);

            if (itemToUpdate) {
                if (token) {
                    // If user is logged in, update through API
                    if (newQuantity > itemToUpdate.quantity) {
                        // Add items
                        await cartService.addToCart(productId);
                    } else {
                        // Remove items
                        await cartService.removeFromCart(productId);
                    }
                }
                updateCart(productId, newQuantity, itemToUpdate.selectedSize, itemToUpdate.selectedColor);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveFromCart = async (productId: string) => {
        try {
            await removeFromCart(productId);
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
        }
    };

    const handleApplyCode = (minValue: number, discount: number) => {
        if (totalCart > minValue) {
            setApplyCode(minValue);
            setDiscountCart(discount);
        } else {
            alert(`Minimum order must be ${minValue}$`);
        }
    };

    // Update discount when total changes
    useEffect(() => {
        if (totalCart < applyCode) {
            setApplyCode(0);
            setDiscountCart(0);
        }
    }, [totalCart, applyCode]);

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
    }

    const handleApplyCoupon = async () => {
        try {
            if (!couponCode) {
                setCouponError('Please enter a coupon code');
                return;
            }

            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                setCouponError('Please login to apply coupon');
                return;
            }

            console.log('Applying coupon with:', {
                couponCode,
                totalCart: totalCart.toFixed(2)
            });

            const result = await couponService.applyCoupon(couponCode, totalCart);
            if (!result) {
                setCouponError('Failed to apply coupon. Please check if the code is valid.');
                return;
            }

            setSelectedCoupon({
                id: result.couponCode,
                name: result.couponCode,
                couponCode: result.couponCode,
                couponPercentage: (result.couponAmount / result.originalPrice) * 100,
                validFrom: new Date().toISOString(),
                validUntil: new Date().toISOString(),
                isCurrentlyValid: true,
                remainingUses: 1
            });
            setDiscountCart(Number(result.couponAmount));
            setCouponError('');
        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponError('Failed to apply coupon. Please try again later.');
        }
    };

    const redirectToCheckout = () => {
        router.push(`/checkout?discount=${discountCart}&ship=${shipCart}`)
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Shopping cart' subHeading='Shopping cart' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex justify-between max-xl:flex-col gap-y-8">
                        <div className="xl:w-2/3 xl:pr-3 w-full">
                            <div className="time bg-green py-3 px-5 flex items-center rounded-lg">
                                <div className="heding5">🔥</div>
                                <div className="caption1 pl-2">Your cart will expire in
                                    <span className="min text-red text-button fw-700"> {timeLeft.minutes}:{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</span>
                                    <span> minutes! Please checkout now before your items sell out!</span>
                                </div>
                            </div>
                            <div className="heading banner mt-5">
                                <div className="text">Buy
                                    <span className="text-button"> $<span className="more-price">{moneyForFreeship - totalCart > 0 ? (<>{moneyForFreeship - totalCart}</>) : (0)}</span>.00 </span>
                                    <span>more to get </span>
                                    <span className="text-button">freeship</span>
                                </div>
                                <div className="tow-bar-block mt-4">
                                    <div
                                        className="progress-line"
                                        style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : `100%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="list-product w-full sm:mt-7 mt-5">
                                <div className='w-full'>
                                    <div className="heading bg-surface bora-4 pt-4 pb-4">
                                        <div className="flex">
                                            <div className="w-1/2">
                                                <div className="text-button text-center">Products</div>
                                            </div>
                                            <div className="w-1/12">
                                                <div className="text-button text-center">Price</div>
                                            </div>
                                            <div className="w-1/6">
                                                <div className="text-button text-center">Quantity</div>
                                            </div>
                                            <div className="w-1/6">
                                                <div className="text-button text-center">Total Price</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-product-main w-full mt-3">
                                        {cartState.cartArray.length < 1 ? (
                                            <p className='text-button pt-3'>No product in cart</p>
                                        ) : (
                                            cartState.cartArray.map((product) => (
                                                <div className="item flex md:mt-7 md:pb-7 mt-5 pb-5 border-b border-line w-full" key={product.id}>
                                                    <div className="w-1/2">
                                                        <div className="flex items-center gap-6">
                                                            <div className="bg-img md:w-[100px] w-20 aspect-[3/4]">
                                                                <Image
                                                                    src={product.thumbImage && product.thumbImage.length > 0 ? product.thumbImage[0] : '/assets/images/product_placeholder.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={product.name}
                                                                    className='w-full h-full object-cover rounded-lg'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="text-title">{product.name}</div>
                                                                <div className="list-select mt-3"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-1/12 price flex items-center justify-center">
                                                        <div className="text-title text-center">${product.price}</div>
                                                    </div>
                                                    <div className="w-1/6 flex items-center justify-center">
                                                        <div className="quantity-block bg-surface md:p-3 p-2 flex items-center justify-between rounded-lg border border-line md:w-[100px] flex-shrink-0 w-20">
                                                            <Icon.Minus
                                                                onClick={() => {
                                                                    if (product.quantity > 1) {
                                                                        handleQuantityChange(product.id, product.quantity - 1)
                                                                    }
                                                                }}
                                                                className={`text-base max-md:text-sm ${product.quantity === 1 ? 'disabled' : ''}`}
                                                            />
                                                            <div className="text-button quantity">{product.quantity}</div>
                                                            <Icon.Plus
                                                                onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                                                                className='text-base max-md:text-sm'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-1/6 flex total-price items-center justify-center">
                                                        <div className="text-title text-center">${product.quantity * product.price}</div>
                                                    </div>
                                                    <div className="w-1/12 flex items-center justify-center">
                                                        <Icon.XCircle
                                                            className='text-xl max-md:text-base text-red cursor-pointer hover:text-black duration-500'
                                                            onClick={() => handleRemoveFromCart(product.id)}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="input-block discount-code w-full h-12 sm:mt-7 mt-5">
                                <form 
                                    className='w-full h-full relative' 
                                    onSubmit={(e) => { 
                                        e.preventDefault(); 
                                        handleApplyCoupon(); 
                                    }}
                                >
                                    <input 
                                        type="text" 
                                        placeholder='Add voucher discount' 
                                        className='w-full h-full bg-surface pl-4 pr-14 rounded-lg border border-line' 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className='button-main absolute top-1 bottom-1 right-1 px-5 rounded-lg flex items-center justify-center'
                                    >
                                        Apply Code
                                    </button>
                                </form>
                                {couponError && <div className="text-red-500 text-sm mt-2">{couponError}</div>}
                            </div>
                            <div className="list-voucher flex items-center gap-5 flex-wrap sm:mt-7 mt-5">
                                <div className={`item ${freeItemApplied ? 'bg-green' : ''} border border-line rounded-lg py-2`}>
                                    <div className="top flex gap-10 justify-between px-3 pb-2 border-b border-dashed border-line">
                                        <div className="left">
                                            <div className="caption1">Special Offer</div>
                                            <div className="caption1 font-bold">Buy 5 Get 1 Free</div>
                                        </div>
                                        <div className="right">
                                            <div className="caption1">Get your cheapest item free when you buy 5 or more items</div>
                                        </div>
                                    </div>
                                    <div className="bottom gap-6 items-center flex justify-between px-3 pt-2">
                                        <div className="text-button-uppercase">Auto Applied</div>
                                        <div
                                            className="button-main py-1 px-2.5 capitalize text-xs"
                                            onClick={handleApplyFreeItem}
                                        >
                                            {freeItemApplied ? 'Applied' : 'Apply Offer'}
                                        </div>
                                    </div>
                                </div>
                                {isLoading ? (
                                    <div className="w-full text-center py-4">Loading coupons...</div>
                                ) : (
                                    <>
                                        {userCoupons.length > 0 && (
                                            <div className="w-full mt-4">
                                                <div className="text-button mb-3">Your Coupons</div>
                                                {userCoupons.map((coupon) => (
                                                    <div key={coupon.id} className={`item ${selectedCoupon?.id === coupon.id ? 'bg-green' : ''} border border-line rounded-lg py-2 mb-3`}>
                                                        <div className="top flex gap-10 justify-between px-3 pb-2 border-b border-dashed border-line">
                                                            <div className="left">
                                                                <div className="caption1">{coupon.name}</div>
                                                                <div className="caption1 font-bold">{coupon.couponPercentage}% OFF</div>
                                                            </div>
                                                            <div className="right">
                                                                <div className="caption1">Valid until<br />{new Date(coupon.validUntil).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="bottom gap-6 items-center flex justify-between px-3 pt-2">
                                                            <div className="text-button-uppercase">Code: {coupon.couponCode}</div>
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
                                        <div className="w-full mt-4">
                                            <div className="text-button mb-3">Available Coupons</div>
                                            {coupons.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">No available coupons at the moment</div>
                                            ) : (
                                                coupons.map((coupon) => (
                                                    <div key={coupon.id} className={`item ${selectedCoupon?.id === coupon.id ? 'bg-green' : ''} border border-line rounded-lg py-2 mb-3`}>
                                                        <div className="top flex gap-10 justify-between px-3 pb-2 border-b border-dashed border-line">
                                                            <div className="left">
                                                                <div className="caption1">{coupon.name}</div>
                                                                <div className="caption1 font-bold">{coupon.couponPercentage}% OFF</div>
                                                            </div>
                                                            <div className="right">
                                                                <div className="caption1">Valid until<br />{new Date(coupon.validUntil).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="bottom gap-6 items-center flex justify-between px-3 pt-2">
                                                            <div className="text-button-uppercase">Code: {coupon.couponCode}</div>
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
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="xl:w-1/3 xl:pl-12 w-full">
                            <div className="checkout-block bg-surface p-6 rounded-2xl">
                                <div className="heading5">Order Summary</div>
                                <div className="total-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Subtotal</div>
                                    <div className="text-title">$<span className="total-product">{totalCart}</span><span></span></div>
                                </div>
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Discounts</div>
                                    <div className="text-title"> <span>-$</span><span className="discount">{discountCart}</span><span></span></div>
                                </div>
                                <div className="ship-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Shipping</div>
                                    <div className="choose-type flex gap-12">
                                        <div className="left">
                                            <div className="type">
                                                {moneyForFreeship - totalCart > 0 ?
                                                    (
                                                        <input
                                                            id="shipping"
                                                            type="radio"
                                                            name="ship"
                                                            disabled
                                                        />
                                                    ) : (
                                                        <input
                                                            id="shipping"
                                                            type="radio"
                                                            name="ship"
                                                            checked={shipCart === 0}
                                                            onChange={() => setShipCart(0)}
                                                        />
                                                    )}
                                                < label className="pl-1" htmlFor="shipping">Free Shipping:</label>
                                            </div>
                                            <div className="type mt-1">
                                                <input
                                                    id="local"
                                                    type="radio"
                                                    name="ship"
                                                    value={30}
                                                    checked={shipCart === 30}
                                                    onChange={() => setShipCart(30)}
                                                />
                                                <label className="text-on-surface-variant1 pl-1" htmlFor="local">Local:</label>
                                            </div>
                                            <div className="type mt-1">
                                                <input
                                                    id="flat"
                                                    type="radio"
                                                    name="ship"
                                                    value={40}
                                                    checked={shipCart === 40}
                                                    onChange={() => setShipCart(40)}
                                                />
                                                <label className="text-on-surface-variant1 pl-1" htmlFor="flat">Flat Rate:</label>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div className="ship">$0</div>
                                            <div className="local text-on-surface-variant1 mt-1">$30</div>
                                            <div className="flat text-on-surface-variant1 mt-1">$40</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="total-cart-block pt-4 pb-4 flex justify-between">
                                    <div className="heading5">Total</div>
                                    <div className="heading5">$
                                        <span className="total-cart heading5">
                                            {selectedCoupon ? (totalCart - discountCart + shipCart).toFixed(2) : (totalCart + shipCart).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                                    <div className="checkout-btn button-main text-center w-full" onClick={redirectToCheckout}>Process To Checkout</div>
                                    <Link className="text-button hover-underline" href={"/shop/breadcrumb1"}>Continue shopping</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Cart