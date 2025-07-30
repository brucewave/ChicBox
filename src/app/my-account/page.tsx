'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface UserInfo {
    id: number
    username: string
    firstName: string
    lastName: string
    address: string
    email: string
    phoneNumber: string
    totalPurchasedItems?: number
}

const MyAccount = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/login')
                    return
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setUserInfo(response.data)
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch user information')
                if (err.response?.status === 401) {
                    router.push('/login')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchUserInfo()
    }, [router])

    if (loading) {
        return (
            <>
                <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
                <div id="header" className='relative w-full'>
                    <MenuOne props="bg-transparent" />
                    <Breadcrumb heading='Tài khoản của tôi' subHeading='Tài khoản của tôi' />
                </div>
                <div className="container py-20">
                    <div className="text-center">Đang tải...</div>
                </div>
                <Footer />
            </>
        )
    }

    if (error) {
        return (
            <>
                <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
                <div id="header" className='relative w-full'>
                    <MenuOne props="bg-transparent" />
                    <Breadcrumb heading='Tài khoản của tôi' subHeading='Tài khoản của tôi' />
                </div>
                <div className="container py-20">
                    <div className="text-center text-red-500">{error}</div>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Tài khoản của tôi' subHeading='Tài khoản của tôi' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main lg:px-[60px] md:px-4 flex gap-y-8 max-md:flex-col w-full">
                        <div className="left xl:w-1/3 md:w-5/12 w-full xl:pr-[40px] lg:pr-[28px] md:pr-[16px]">
                            <div className="user-infor bg-surface md:px-8 px-5 md:py-10 py-6 md:rounded-[20px] rounded-xl">
                                <div className="heading flex flex-col items-center justify-center">
                                    <div className="avatar">
                                        <Image
                                            src={'/images/avatar/1.png'}
                                            width={300}
                                            height={300}
                                            alt='avatar'
                                            className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full'
                                        />
                                    </div>
                                    <div className="name heading6 mt-4 text-center">{userInfo?.firstName} {userInfo?.lastName}</div>
                                    <div className="mail heading6 font-normal normal-case text-center mt-1">{userInfo?.email}</div>
                                </div>
                                <div className="menu-tab lg:mt-10 mt-6">
                                    <div className="item px-5 py-4 flex items-center gap-3 cursor-pointer">
                                        <Icon.User size={20} weight='bold' />
                                        <div className="heading6">Chi tiết tài khoản</div>
                                    </div>
                                    <div className="item px-5 py-4 flex items-center gap-3 cursor-pointer mt-2">
                                        <Icon.Bag size={20} weight='bold' />
                                        <div className="heading6">Đơn hàng của bạn</div>
                                    </div>
                                    <div className="item px-5 py-4 flex items-center gap-3 cursor-pointer mt-2">
                                        <Icon.MapPin size={20} weight='bold' />
                                        <div className="heading6">Địa chỉ của tôi</div>
                                    </div>
                                    <div className="item px-5 py-4 flex items-center gap-3 cursor-pointer mt-2">
                                        <Icon.Gift size={20} weight='bold' />
                                        <div className="heading6">Chương trình thưởng</div>
                                        <div className="ml-auto text-sm">
                                            {userInfo?.totalPurchasedItems || 0}/5 sản phẩm
                                        </div>
                                    </div>
                                    <div className="item px-5 py-4 flex items-center gap-3 cursor-pointer mt-2" onClick={() => {
                                        localStorage.removeItem('token')
                                        router.push('/login')
                                    }}>
                                        <Icon.SignOut size={20} weight='bold' />
                                        <div className="heading6">Đăng xuất</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right xl:w-2/3 md:w-7/12 w-full xl:pl-[40px] lg:pl-[28px] md:pl-[16px] flex items-center">
                            <div className="text-content w-full">
                                <form className="">
                                    <div className="heading5 pb-4">Thông tin cá nhân</div>
                                    <div className='grid sm:grid-cols-2 gap-4 gap-y-5'>
                                        <div className="first-name ">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="firstName" type="text" defaultValue={userInfo?.firstName} placeholder='Họ' required />
                                        </div>
                                        <div className="last-name">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="lastName" type="text" defaultValue={userInfo?.lastName} placeholder='Tên' required />
                                        </div>
                                        <div className="email ">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="email" type="email" defaultValue={userInfo?.email} placeholder="Địa chỉ email" required />
                                        </div>
                                        <div className="phone-number">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="phoneNumber" type="text" defaultValue={userInfo?.phoneNumber} placeholder="Số điện thoại" required />
                                        </div>
                                        <div className="col-span-full">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="address" type="text" defaultValue={userInfo?.address} placeholder="Địa chỉ" required />
                                        </div>
                                    </div>
                                    <div className="heading5 pb-4 lg:mt-10 mt-6">Đổi mật khẩu</div>
                                    <div className="pass">
                                        <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="password" type="password" placeholder="Mật khẩu hiện tại *" required />
                                    </div>
                                    <div className="new-pass mt-5">
                                        <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="newPassword" type="password" placeholder="Mật khẩu mới *" required />
                                    </div>
                                    <div className="confirm-pass mt-5">
                                        <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="confirmPassword" type="password" placeholder="Xác nhận mật khẩu *" required />
                                    </div>
                                    <div className="block-button lg:mt-10 mt-6">
                                        <button className="button-main">Cập nhật tài khoản</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default MyAccount