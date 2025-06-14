'use client'

import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Props {
    props: string;
}

const TopNavOne: React.FC<Props> = ({ props }) => {
    const [isOpenLanguage, setIsOpenLanguage] = useState(false)
    const [isOpenCurrence, setIsOpenCurrence] = useState(false)
    const [language, setLanguage] = useState('English')
    const [currence, setCurrence] = useState('USD')

    return (
        <>
            <div className={`top-nav md:h-[44px] h-[30px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="top-nav-main flex justify-between max-md:justify-center h-full">
                        <div className="left-content flex items-center gap-5 max-md:hidden">
                        </div>
                        <div className="text-center text-button-uppercase text-white flex items-center">
                            CHƯƠNG TRÌNH KHUYỄN MÃI MUA 5 TẶNG 1 🔥
                        </div>
                        <div className="right-content flex items-center gap-5 max-md:hidden">
                            <Link href={'https://www.facebook.com/'} target='_blank'>
                                <i className="icon-facebook text-white"></i>
                            </Link>
                            <Link href={'https://www.instagram.com/'} target='_blank'>
                                <i className="icon-instagram text-white"></i>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default TopNavOne