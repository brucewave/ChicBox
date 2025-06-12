'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Default from '@/components/Product/Detail/Default';
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'

const baseUrl = 'https://api.roomily.tech';

const ProductDefault = () => {
    const searchParams = useSearchParams();
    const productId = searchParams.get('id') || '1';
    const [product, setProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${baseUrl}/api/v1/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();

                // Transform incoming JSON data to match ProductType interface
                const transformedProduct: ProductType = {
                    id: data.id.toString(), // Convert ID to string
                    category: data.categoryName || "",
                    type: data.categoryName || "", // Assuming categoryName can be used for type
                    name: data.name || "",
                    gender: "", // Default to empty if not in JSON
                    new: false, // Default to false if not in JSON
                    sale: data.discount > 0, // Set sale based on discount existence
                    rate: data.averageRating || 0,
                    price: data.price || 0,
                    originPrice: data.discount ? data.price + data.discount : data.price || 0, // Calculate originPrice
                    brand: data.brandName || "",
                    sold: 0, // Default to 0 if not in JSON
                    quantity: data.stockQuantity || 0,
                    quantityPurchase: 1, // Default quantity purchase to 1
                    sizes: data.productSize ? [data.productSize] : [], // Convert productSize to an array
                    variation: data.color ? [{
                        color: data.color,
                        colorCode: "#000000", // Placeholder color code
                        colorImage: "", // Placeholder color image
                        image: data.primaryImageUrl ? `${baseUrl}/api/v1/images/${data.primaryImageUrl}` : "" // Using primaryImageUrl for variation image
                    }] : [],
                    thumbImage: data.primaryImageUrl ? [`${baseUrl}/api/v1/images/${data.primaryImageUrl}`] : [], // Convert primaryImageUrl to an array
                    images: (data.imageUrls || []).map((url: string) => `${baseUrl}/api/v1/images/${url}`) || [], // Use imageUrls directly
                    description: data.description || "",
                    action: "add to cart", // Default action
                    slug: "" // Default to empty if not in JSON
                };

                setProduct(transformedProduct);
                setError(null);
            } catch (err) {
                setError('Error fetching product data');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || !product) {
        return <div>{error || 'Product not found'}</div>;
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white" />
                <BreadcrumbProduct data={[product]} productPage='default' productId={productId} />
            </div>
            <Default data={[product]} productId={productId} />
            <Footer />
        </>
    )
}

export default ProductDefault
