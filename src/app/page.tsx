import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import HeroBanner from '@/components/Home1/HeroBanner'
import SliderOne from '@/components/Slider/SliderOne'
import WhatNewOne from '@/components/Home1/WhatNewOne'
import CategoryMarquee from '@/components/Home1/CategoryMarquee'
import productData from '@/data/Product.json'
import Collection from '@/components/Home1/Collection'
import TabFeatures from '@/components/Home1/TabFeatures'
import Banner from '@/components/Home1/Banner'
import Benefit from '@/components/Home1/Benefit'
import testimonialData from '@/data/Testimonial.json'
import Testimonial from '@/components/Home1/Testimonial'
import Instagram from '@/components/Home1/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'

export default function Home() {
  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className='relative w-full'>
        <MenuOne props="bg-transparent" />
      </div>
      <div className="mt-[74px] md:mt-[74px] h-0"></div>
      <HeroBanner />
      <SliderOne />
      <WhatNewOne data={productData} start={0} limit={4} />
      <CategoryMarquee />
      <Collection />
      <TabFeatures data={productData} start={0} limit={6} />
      <Banner />
      <Benefit props="md:py-20 py-10" />
      <Testimonial data={testimonialData} limit={6} />
      <Instagram />
      <Brand />
      <Footer />
      <ModalNewsletter />
    </>
  )
}
