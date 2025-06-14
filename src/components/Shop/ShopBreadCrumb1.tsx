'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import Product from '../Product/Product';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import HandlePagination from '../Other/HandlePagination';

const baseUrl = 'https://api.roomily.tech';

interface Variation {
    color: string;
    colorCode: string;
    colorImage: string;
    image: string;
}

interface ProductType {
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
    category?: string;
    type?: string;
    gender?: string;
    brand?: string;
    sold?: number;
    quantity?: number;
    sizes?: string[];
    variation?: Variation[];
    thumbImage?: string[];
    images?: string[];
    action?: string;
    new?: boolean;
    sale?: boolean;
    rate?: number;
    quantityPurchase?: number;
    slug?: string;
    originPrice?: number;
}

interface Category {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    productCount: number;
}

interface Props {
    data: Array<ProductType>
    productPerPage: number
    dataType: string | null | undefined
    gender: string | null
    category: string | null
}

const ShopBreadCrumb1: React.FC<Props> = ({ data, productPerPage, dataType, gender, category }) => {
    const [showOnlySale, setShowOnlySale] = useState(false)
    const [sortOption, setSortOption] = useState('');
    const [type, setType] = useState<string | null | undefined>(dataType)
    const [size, setSize] = useState<string | null>()
    const [color, setColor] = useState<string | null>()
    const [brand, setBrand] = useState<string | null>()
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
    const [currentPage, setCurrentPage] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const productsPerPage = productPerPage;

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

    const handleShowOnlySale = () => {
        setShowOnlySale(toggleSelect => !toggleSelect)
    }

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setCurrentPage(0);
    };

    const handleType = (type: string | null) => {
        setType((prevType) => (prevType === type ? null : type))
        setCurrentPage(0);
    }

    const handleSize = (size: string) => {
        setSize((prevSize) => (prevSize === size ? null : size))
        setCurrentPage(0);
    }

    const handlePriceChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            setPriceRange({ min: values[0], max: values[1] });
            setCurrentPage(0);
        }
    };

    const handleColor = (color: string) => {
        setColor((prevColor) => (prevColor === color ? null : color))
        setCurrentPage(0);
    }

    const handleBrand = (brand: string) => {
        setBrand((prevBrand) => (prevBrand === brand ? null : brand));
        setCurrentPage(0);
    }

    const filterProducts = () => {
        let filteredProducts = [...data];

        if (showOnlySale) {
            filteredProducts = filteredProducts.filter(item => item.discount > 0);
        }

        if (gender) {
            filteredProducts = filteredProducts.filter(item => item.categoryName === gender);
        }

        if (category) {
            filteredProducts = filteredProducts.filter(item => item.categoryName === category);
        }

        if (dataType) {
            filteredProducts = filteredProducts.filter(item => item.categoryName === dataType);
        }

        if (type) {
            filteredProducts = filteredProducts.filter(item => item.categoryName === type);
        }

        if (size) {
            filteredProducts = filteredProducts.filter(item => item.productSize === size);
        }

        if (priceRange.min !== 0 || priceRange.max !== 100) {
            filteredProducts = filteredProducts.filter(item => item.price >= priceRange.min && item.price <= priceRange.max);
        }

        if (color) {
            filteredProducts = filteredProducts.filter(item => item.color?.toLowerCase().includes(color.toLowerCase()));
        }

        if (brand) {
            filteredProducts = filteredProducts.filter(item => item.brandName?.toLowerCase() === brand.toLowerCase());
        }

        if (sortOption === 'soldQuantityHighToLow') {
            filteredProducts.sort((a, b) => b.ratingCount - a.ratingCount);
        } else if (sortOption === 'discountHighToLow') {
            filteredProducts.sort((a, b) => b.discount - a.discount);
        } else if (sortOption === 'priceHighToLow') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'priceLowToHigh') {
            filteredProducts.sort((a, b) => a.price - b.price);
        }

        return filteredProducts;
    };

    const filteredData = filterProducts();
    const totalProducts = filteredData.length;
    const selectedType = type;
    const selectedSize = size;
    const selectedColor = color;
    const selectedBrand = brand;

    const brandCounts = data.reduce((acc, item) => {
        const brandName = item.brandName?.toLowerCase() || '';
        if (brandName) {
            acc[brandName] = (acc[brandName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const filteredBrandCounts = filteredData.reduce((acc, item) => {
        const brandName = item.brandName?.toLowerCase() || '';
        if (brandName) {
            acc[brandName] = (acc[brandName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    if (filteredData.length === 0) {
        filteredData.push({
            id: 0,
            name: 'No products found',
            description: '',
            price: 0,
            brandName: '',
            productSize: '',
            color: '',
            conditionPoints: 0,
            status: '',
            stockQuantity: 0,
            discount: 0,
            averageRating: 0,
            ratingCount: 0,
            categoryName: '',
            primaryImageUrl: '',
            imageUrls: [],
            createdAt: null
        });
    }

    const pageCount = Math.ceil(filteredData.length / productsPerPage);

    if (pageCount === 0) {
        setCurrentPage(0);
    }

    let currentProducts: ProductType[];

    if (filteredData.length > 0) {
        currentProducts = filteredData.slice(currentPage * productsPerPage, (currentPage + 1) * productsPerPage);
    } else {
        currentProducts = [];
    }

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);
    };

    const handleClearAll = () => {
        setShowOnlySale(false);
        setSortOption('');
        setType(null);
        setSize(null);
        setColor(null);
        setBrand(null);
        setPriceRange({ min: 0, max: 100 });
        setCurrentPage(0);
        handleType(null);
    };

    return (
        <>
            <div className="breadcrumb-block style-img">
                <div className="breadcrumb-main bg-linear overflow-hidden">
                    <div className="container lg:pt-[134px] pt-24 pb-10 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content">
                                <div className="heading2 text-center">{dataType === null ? 'Shop' : dataType}</div>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                                    <Link href={'/'}>Homepage</Link>
                                    <Icon.CaretRight size={14} className='text-secondary2' />
                                    <div className='text-secondary2 capitalize'>{dataType === null ? 'Shop' : dataType}</div>
                                </div>
                            </div>
                            <div className="list-tab flex flex-wrap items-center justify-center gap-y-5 gap-8 lg:mt-[70px] mt-12 overflow-hidden">
                                {['CHIC BOX'].map((item, index) => (
                                    <div
                                        key={index}
                                        className="tab-item text-button-uppercase"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
                <div className="container">
                    <div className="flex max-md:flex-wrap max-md:flex-col-reverse gap-y-8">
                        <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-12">
                            <div className="filter-type pb-8 border-b border-line">
                                <div className="heading6">Products Type</div>
                                <div className="list-type mt-4">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className={`item flex items-center justify-between cursor-pointer ${type === category.name ? 'active' : ''}`}
                                            onClick={() => handleType(category.name)}
                                        >
                                            <div className='text-secondary has-line-before hover:text-black capitalize'>{category.name}</div>
                                            <div className='text-secondary2'>
                                                ({data.filter(dataItem => dataItem.categoryName === category.name).length})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-size pb-8 border-b border-line mt-8">
                                <div className="heading6">Size</div>
                                <div className="list-size flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                                    {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((item, index) => (
                                        <div
                                            key={index}
                                            className={`size-item text-button w-[44px] h-[44px] flex items-center justify-center rounded-full border border-line ${size === item ? 'active' : ''}`}
                                            onClick={() => handleSize(item)}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                    <div
                                        className={`size-item text-button px-4 py-2 flex items-center justify-center rounded-full border border-line ${size === 'freesize' ? 'active' : ''}`}
                                        onClick={() => handleSize('freesize')}
                                    >
                                        Freesize
                                    </div>
                                </div>
                            </div>
                            <div className="filter-price pb-8 border-b border-line mt-8">
                                <div className="heading6">Price Range</div>
                                <Slider
                                    range
                                    defaultValue={[0, 100]}
                                    min={0}
                                    max={100}
                                    onChange={handlePriceChange}
                                    className='mt-5'
                                />
                                <div className="price-block flex items-center justify-between flex-wrap mt-4">
                                    <div className="min flex items-center gap-1">
                                        <div>Min price:</div>
                                        <div className='price-min'>$
                                            <span>{priceRange.min}</span>
                                        </div>
                                    </div>
                                    <div className="min flex items-center gap-1">
                                        <div>Max price:</div>
                                        <div className='price-max'>$
                                            <span>{priceRange.max}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="filter-color pb-8 border-b border-line mt-8">
                                <div className="heading6">Colors</div>
                                <div className="list-color flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'pink' ? 'active' : ''}`}
                                        onClick={() => handleColor('pink')}
                                    >
                                        <div className="color bg-[#F4C5BF] w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">pink</div>
                                    </div>
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'red' ? 'active' : ''}`}
                                        onClick={() => handleColor('red')}
                                    >
                                        <div className="color bg-red w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">red</div>
                                    </div>
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'green' ? 'active' : ''}`}
                                        onClick={() => handleColor('green')}
                                    >
                                        <div className="color bg-green w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">green</div>
                                    </div>
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'yellow' ? 'active' : ''}`}
                                        onClick={() => handleColor('yellow')}
                                    >
                                        <div className="color bg-yellow w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">yellow</div>
                                    </div>
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'purple' ? 'active' : ''}`}
                                        onClick={() => handleColor('purple')}
                                    >
                                        <div className="color bg-purple w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">purple</div>
                                    </div>
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'black' ? 'active' : ''}`}
                                        onClick={() => handleColor('black')}
                                    >
                                        <div className="color bg-black w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">black</div>
                                    </div>
                                    <div
                                        className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === 'white' ? 'active' : ''}`}
                                        onClick={() => handleColor('white')}
                                    >
                                        <div className="color bg-[#F6EFDD] w-5 h-5 rounded-full"></div>
                                        <div className="caption1 capitalize">white</div>
                                    </div>
                                </div>
                            </div>
                            <div className="filter-brand mt-8">
                                <div className="heading6">Brands</div>
                                <div className="list-brand mt-4">
                                    {Object.entries(brandCounts).map(([brandName, count]) => (
                                        <div key={brandName} className="brand-item flex items-center justify-between">
                                            <div className="left flex items-center cursor-pointer">
                                                <div className="block-input">
                                                    <input
                                                        type="checkbox"
                                                        name={brandName}
                                                        id={brandName}
                                                        checked={brand === brandName}
                                                        onChange={() => handleBrand(brandName)} />
                                                    <Icon.CheckSquare size={20} weight='fill' className='icon-checkbox' />
                                                </div>
                                                <label htmlFor={brandName} className="brand-name capitalize pl-2 cursor-pointer">{brandName}</label>
                                            </div>
                                            <div className='text-secondary2'>
                                                ({filteredBrandCounts[brandName] || 0})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="list-product-block lg:w-3/4 md:w-2/3 w-full md:pl-3">
                            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                                <div className="left flex has-line items-center flex-wrap gap-5">
                                    <div className="choose-layout flex items-center gap-2">
                                        <div className="item three-col w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer active">
                                            <div className='flex items-center gap-0.5'>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            </div>
                                        </div>
                                        <Link href={'/shop/sidebar-list'} className="item row w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer">
                                            <div className='flex flex-col items-center gap-0.5'>
                                                <span className='w-4 h-[3px] bg-secondary2 rounded-sm'></span>
                                                <span className='w-4 h-[3px] bg-secondary2 rounded-sm'></span>
                                                <span className='w-4 h-[3px] bg-secondary2 rounded-sm'></span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="check-sale flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="filterSale"
                                            id="filter-sale"
                                            className='border-line'
                                            onChange={handleShowOnlySale}
                                        />
                                        <label htmlFor="filter-sale" className='cation1 cursor-pointer'>Show only products on sale</label>
                                    </div>
                                </div>
                                <div className="right flex items-center gap-3">
                                    <div className="select-block relative">
                                        <select
                                            id="select-filter"
                                            name="select-filter"
                                            className='caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line'
                                            onChange={(e) => { handleSortChange(e.target.value) }}
                                            defaultValue={'Sorting'}
                                        >
                                            <option value="Sorting" disabled>Sorting</option>
                                            <option value="soldQuantityHighToLow">Best Selling</option>
                                            <option value="discountHighToLow">Best Discount</option>
                                            <option value="priceHighToLow">Price High To Low</option>
                                            <option value="priceLowToHigh">Price Low To High</option>
                                        </select>
                                        <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-4 right-2' />
                                    </div>
                                </div>
                            </div>

                            <div className="list-filtered flex items-center gap-3 mt-4">
                                <div className="total-product">
                                    {totalProducts}
                                    <span className='text-secondary pl-1'>Products Found</span>
                                </div>
                                {(selectedType || selectedSize || selectedColor || selectedBrand) && (
                                    <>
                                        <div className="list flex items-center gap-3">
                                            <div className='w-px h-4 bg-line'></div>
                                            {selectedType && (
                                                <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setType(null) }}>
                                                    <Icon.X className='cursor-pointer' />
                                                    <span>{selectedType}</span>
                                                </div>
                                            )}
                                            {selectedSize && (
                                                <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setSize(null) }}>
                                                    <Icon.X className='cursor-pointer' />
                                                    <span>{selectedSize}</span>
                                                </div>
                                            )}
                                            {selectedColor && (
                                                <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setColor(null) }}>
                                                    <Icon.X className='cursor-pointer' />
                                                    <span>{selectedColor}</span>
                                                </div>
                                            )}
                                            {selectedBrand && (
                                                <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setBrand(null) }}>
                                                    <Icon.X className='cursor-pointer' />
                                                    <span>{selectedBrand}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="clear-btn flex items-center px-2 py-1 gap-1 rounded-full border border-red cursor-pointer"
                                            onClick={handleClearAll}
                                        >
                                            <Icon.X color='rgb(219, 68, 68)' className='cursor-pointer' />
                                            <span className='text-button-uppercase text-red'>Clear All</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="list-product hide-product-sold grid lg:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7">
                                {currentProducts.map((item) => (
                                    item.id === 0 ? (
                                        <div key={item.id} className="no-data-product">No products match the selected criteria.</div>
                                    ) : (
                                        <div key={item.id} className="product-wrapper">
                                            <Product 
                                                data={{
                                                    id: item.id.toString(),
                                                    name: item.name,
                                                    description: item.description,
                                                    price: item.discount > 0 ? Number((item.price * (1 - item.discount/100)).toFixed(2)) : item.price,
                                                    originPrice: item.discount > 0 ? item.price : item.price,
                                                    brand: item.brandName,
                                                    sold: item.ratingCount || 0,
                                                    quantity: item.stockQuantity || 0,
                                                    sizes: [item.productSize],
                                                    variation: item.color?.split('/').map(color => ({
                                                        color: color.trim(),
                                                        colorCode: color.trim().toLowerCase() === 'red' ? '#DB4444' :
                                                                 color.trim().toLowerCase() === 'yellow' ? '#ECB018' :
                                                                 color.trim().toLowerCase() === 'white' ? '#F6EFDD' :
                                                                 color.trim().toLowerCase() === 'purple' ? '#868I4D4' :
                                                                 color.trim().toLowerCase() === 'pink' ? '#F4407D' :
                                                                 color.trim().toLowerCase() === 'black' ? '#1F1F1F' :
                                                                 color.trim().toLowerCase() === 'green' ? '#D2EF9A' :
                                                                 color.trim().toLowerCase() === 'navy' ? '#000080' : '#000000',
                                                        colorImage: `${baseUrl}/api/v1/images/${color.trim().toLowerCase()}.png`,
                                                        image: item.primaryImageUrl ? `${baseUrl}/api/v1/images/${item.primaryImageUrl}` : `${baseUrl}/api/v1/images/back.png`
                                                    })) || [{
                                                        color: item.color || '',
                                                        colorCode: '#000000',
                                                        colorImage: `${baseUrl}/api/v1/images/back.png`,
                                                        image: item.primaryImageUrl ? `${baseUrl}/api/v1/images/${item.primaryImageUrl}` : `${baseUrl}/api/v1/images/back.png`
                                                    }],
                                                    thumbImage: item.primaryImageUrl ? [`${baseUrl}/api/v1/images/${item.primaryImageUrl}`] : [`${baseUrl}/api/v1/images/back.png`],
                                                    images: item.imageUrls?.length > 0 ? item.imageUrls.map(url => `${baseUrl}/api/v1/images/${url}`) : [`${baseUrl}/api/v1/images/back.png`],
                                                    action: 'add to cart',
                                                    type: item.categoryName,
                                                    category: item.categoryName,
                                                    gender: item.categoryName,
                                                    new: false,
                                                    sale: item.discount > 0,
                                                    rate: item.averageRating || 0,
                                                    quantityPurchase: 0,
                                                    slug: item.name.toLowerCase().replace(/\s+/g, '-')
                                                }} 
                                                type='grid' 
                                            />
                                        </div>
                                    )
                                ))}
                            </div>

                            {pageCount > 1 && (
                                <div className="list-pagination flex items-center md:mt-10 mt-7">
                                    <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShopBreadCrumb1
