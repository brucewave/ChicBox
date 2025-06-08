'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    brandName: string;
    productSize: string;
    color: string;
    conditionPoints: number;
    status: string;
    stockQuantity: number;
    discount: number;
    averageRating: number;
    ratingCount: number;
    categoryName: string;
    primaryImageUrl: string;
    imageUrls: string[];
    createdAt: string | null;
}

export default function DefaultGrid() {
    const searchParams = useSearchParams()
    let type = searchParams.get('type')
    let gender = searchParams.get('gender')
    let category = searchParams.get('category')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?page=0&size=100&sortBy=createdAt&sortDir=desc`)
                const data = await response.json()
                setProducts(data.content)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            <ShopBreadCrumb1 data={products} productPerPage={9} dataType={type} gender={gender} category={category} />
            <Footer />      
        </>
    )
}
