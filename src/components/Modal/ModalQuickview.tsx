'use client'

// Quickview.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { ProductType } from '@/type/ProductType';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext';
import { useCart } from '@/context/CartContext';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import Rate from '../Other/Rate';
import ModalSizeguide from './ModalSizeguide';

const ModalQuickview = () => {
    const [photoIndex, setPhotoIndex] = useState(0)
    const [openPopupImg, setOpenPopupImg] = useState(false)
    const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false)
    const { selectedProduct, closeQuickview } = useModalQuickviewContext()
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')
    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()
    const { openModalWishlist } = useModalWishlistContext()
    const { addToCompare, removeFromCompare, compareState } = useCompare();
    const { openModalCompare } = useModalCompareContext()
    const percentSale = selectedProduct && Math.floor(100 - ((selectedProduct.price / selectedProduct.originPrice) * 100))

    const handleOpenSizeGuide = () => {
        setOpenSizeGuide(true);
    };

    const handleCloseSizeGuide = () => {
        setOpenSizeGuide(false);
    };

    const handleActiveColor = (item: string) => {
        setActiveColor(item)
    }

    const handleActiveSize = (item: string) => {
        setActiveSize(item)
    }

    const handleIncreaseQuantity = () => {
        if (selectedProduct) {
            selectedProduct.quantityPurchase += 1
            updateCart(selectedProduct.id, selectedProduct.quantityPurchase + 1, activeSize, activeColor);
        }
    };

    const handleDecreaseQuantity = () => {
        if (selectedProduct && selectedProduct.quantityPurchase > 1) {
            selectedProduct.quantityPurchase -= 1
            updateCart(selectedProduct.id, selectedProduct.quantityPurchase - 1, activeSize, activeColor);
        }
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            if (!cartState.cartArray.find(item => item.id === selectedProduct.id)) {
                addToCart({ ...selectedProduct });
                updateCart(selectedProduct.id, selectedProduct.quantityPurchase, activeSize, activeColor)
            } else {
                updateCart(selectedProduct.id, selectedProduct.quantityPurchase, activeSize, activeColor)
            }
            openModalCart()
            closeQuickview()
        }
    };

    const handleAddToWishlist = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (selectedProduct) {
            if (wishlistState.wishlistArray.some(item => item.id === selectedProduct.id)) {
                removeFromWishlist(selectedProduct.id);
            } else {
                // else, add to wishlist and set state to true
                addToWishlist(selectedProduct);
            }
        }
        openModalWishlist();
    };

    const handleAddToCompare = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (selectedProduct) {
            if (compareState.compareArray.length < 3) {
                if (compareState.compareArray.some(item => item.id === selectedProduct.id)) {
                    removeFromCompare(selectedProduct.id);
                } else {
                    // else, add to wishlist and set state to true
                    addToCompare(selectedProduct);
                }
            } else {
                alert('Chỉ so sánh tối đa 3 sản phẩm!')
            }
        }
        openModalCompare();
    };

    return (
        <>
            <div className={`modal-quickview-block`} onClick={closeQuickview}>
                <div
                    className={`modal-quickview-main py-6 ${selectedProduct !== null ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="flex h-full max-md:flex-col-reverse gap-y-6">
                        <div className="left lg:w-[388px] md:w-[300px] flex-shrink-0 px-6">
                            <div className="list-img max-md:flex items-center gap-4">
                                {selectedProduct?.images.map((item, index) => (
                                    <div className="bg-img w-full aspect-[3/4] max-md:w-[150px] max-md:flex-shrink-0 rounded-[20px] overflow-hidden md:mt-6" key={index}>
                                        <Image
                                            src={item}
                                            width={1500}
                                            height={2000}
                                            alt={item}
                                            priority={true}
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="right w-full px-4">
                            <div className="heading pb-6 px-4 flex items-center justify-between relative">
                                <div className="heading5">Xem nhanh</div>
                                <div
                                    className="close-btn absolute right-0 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                    onClick={closeQuickview}
                                >
                                    <Icon.X size={14} />
                                </div>
                            </div>
                            <div className="product-infor px-4">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="caption2 text-secondary font-semibold uppercase">{selectedProduct?.type}</div>
                                        <div className="heading4 mt-1">{selectedProduct?.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center mt-3">
                                    <Rate currentRate={selectedProduct?.rate} size={14} />
                                    {/* <span className='caption1 text-secondary'>({selectedProduct?.sold || 0} đánh giá)</span> */}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap mt-3 pb-6 border-b border-line">
                                    <div className="product-price heading5">{Math.round(selectedProduct?.price || 0).toLocaleString('vi-VN')} VNĐ</div>
                                    {selectedProduct?.originPrice && selectedProduct?.originPrice > selectedProduct?.price && (
                                        <>
                                            <div className='w-px h-4 bg-line'></div>
                                            <div className="product-origin-price font-normal text-secondary2"><del>{Math.round(selectedProduct?.originPrice).toLocaleString('vi-VN')} VNĐ</del></div>
                                            <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                                -{Math.floor(100 - ((selectedProduct?.price / selectedProduct?.originPrice) * 100))}%
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="list-action mt-6">
                                    <div className="choose-color">
                                        <div className="text-title">Màu sắc: <span className='text-title color'>{activeColor}</span></div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {selectedProduct?.variation.map((item, index) => (
                                                <div
                                                    className={`color-item w-10 h-10 rounded-full duration-300 relative ${activeColor === item.color ? 'active' : ''}`}
                                                    key={index}
                                                    onClick={() => {
                                                        handleActiveColor(item.color)
                                                    }}
                                                >
                                                    <div 
                                                        className="w-full h-full rounded-full border border-line"
                                                        style={{ backgroundColor: item.colorCode }}
                                                    />
                                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                        {item.color}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="choose-size mt-5">
                                        <div className="heading flex items-center justify-between">
                                            <div className="text-title">Kích cỡ: <span className='text-title size'>{activeSize}</span></div>
                                            <div
                                                className="caption1 size-guide text-red underline cursor-pointer"
                                                onClick={handleOpenSizeGuide}
                                            >
                                                Hướng dẫn chọn size
                                            </div>
                                            <ModalSizeguide data={selectedProduct} isOpen={openSizeGuide} onClose={handleCloseSizeGuide} />
                                        </div>
                                        <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                            {selectedProduct?.sizes.map((item, index) => (
                                                <div
                                                    className={`size-item ${item === 'freesize' ? 'px-3 py-2' : 'w-12 h-12'} flex items-center justify-center text-button rounded-full bg-white border border-line ${activeSize === item ? 'active' : ''}`}
                                                    key={index}
                                                    onClick={() => handleActiveSize(item)}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-title mt-5">Số lượng:</div>
                                    <div className="choose-quantity flex items-center max-xl:flex-wrap lg:justify-between gap-5 mt-3">
                                        <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                            <Icon.Minus
                                                onClick={handleDecreaseQuantity}
                                                className={`${selectedProduct?.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer body1`}
                                            />
                                            <div className="body1 font-semibold">{selectedProduct?.quantityPurchase}</div>
                                            <Icon.Plus
                                                onClick={handleIncreaseQuantity}
                                                className='cursor-pointer body1'
                                            />
                                        </div>
                                        <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Thêm vào giỏ hàng</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ModalQuickview;
