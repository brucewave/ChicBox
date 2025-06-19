'use client'

import React, { useState } from 'react'
import Product from '../Product/Product'
import { ProductType } from '@/type/ProductType'
import { motion } from 'framer-motion'

interface Props {
    data: Array<ProductType>;
    start: number;
    limit: number;
}

const WhatNewOne: React.FC<Props> = ({ data, start, limit }) => {
    const [activeTab, setActiveTab] = useState<string>('t-shirt');

    const handleTabClick = (type: string) => {
        setActiveTab(type);
    };

    const filteredProducts = data.filter((product) => product.type === activeTab && (product.category === 'fashion'));

    return null;
}

export default WhatNewOne