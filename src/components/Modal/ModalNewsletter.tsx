'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext';
import Image from 'next/image';
import { ProductType } from '@/type/ProductType';

const baseUrl = 'https://api.roomily.tech';

const ModalNewsletter = () => {
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter()
    const { openQuickview } = useModalQuickviewContext()
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDetailProduct = (productId: string) => {
        // redirect to shop with category selected
        router.push(`/product/default?id=${productId}`);
    };

    useEffect(() => {
        setTimeout(() => {
            setOpen(true)
        }, 3000)
        // Fetch products from API
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
    }, [])

    return (
        <div className="modal-newsletter" onClick={() => setOpen(false)}>
            <div className="container h-full flex items-center justify-center w-full">
                <div
                    className={`modal-newsletter-main ${open ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="main-content flex rounded-[20px] overflow-hidden w-full">
                        <div
                            className="left lg:w-1/2 sm:w-2/5 max-sm:hidden bg-green flex flex-col items-center justify-center gap-5 py-14">
                            <div className="text-xs font-semibold uppercase text-center">Special Offer</div>
                            <div
                                className="lg:text-[70px] text-4xl lg:leading-[78px] leading-[42px] font-bold uppercase text-center">
                                Black<br />Fridays</div>
                            <div className="text-button-uppercase text-center">New customers save <span
                                className="text-red">30%</span>
                                with the code</div>
                            <div className="text-button-uppercase text-red bg-white py-2 px-4 rounded-lg">GET20off</div>
                            <div className="button-main w-fit bg-black text-white hover:bg-white uppercase">Copy coupon code
                            </div>
                        </div>
                        <div className="right lg:w-1/2 sm:w-3/5 w-full bg-white sm:pt-10 sm:pl-10 max-sm:p-6 relative">
                            <div
                                className="close-newsletter-btn w-10 h-10 flex items-center justify-center border border-line rounded-full absolute right-5 top-5 cursor-pointer" onClick={() => setOpen(false)}>
                                <Icon.X weight='bold' className='text-xl' />
                            </div>
                            <div className="heading5 pb-5">You May Also Like</div>
                            <div className="list flex flex-col gap-5 overflow-x-auto sm:pr-6">
                                {loading ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : (
                                    products.slice(0, 5).map((item, index) => (
                                        <div
                                            key={item.id}
                                            className='product-item item pb-5 flex items-center justify-between gap-3 border-b border-line'
                                        >
                                            <div
                                                className="infor flex items-center gap-5 cursor-pointer"
                                                onClick={() => handleDetailProduct(item.id)}
                                            >
                                                <div className="bg-img flex-shrink-0">
                                                    <Image width={5000} height={5000} src={item.thumbImage[0]} alt={item.name}
                                                        className='w-[100px] aspect-square flex-shrink-0 rounded-lg' />
                                                </div>
                                                <div className=''>
                                                    <div className="name text-button">{item.name}</div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="product-price text-title">${item.price}.00</div>
                                                        <div className="product-origin-price text-title text-secondary2">
                                                            <del>${item.originPrice}.00</del>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="quick-view-btn button-main sm:py-3 py-2 sm:px-5 px-4 bg-black hover:bg-green text-white rounded-full whitespace-nowrap"
                                                onClick={() => openQuickview(item)}
                                            >
                                                QUICK VIEW
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalNewsletter
