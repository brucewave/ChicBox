'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import TestimonialItem from '../Testimonial/TestimonialItem';
import { TestimonialType } from '@/type/TestimonialType'

interface Props {
    data: Array<TestimonialType>;
    limit: number;
}

const Testimonial = () => {
    return null;
}

export default Testimonial