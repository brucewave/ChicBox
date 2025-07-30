'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import productData from '@/data/Product.json'
import Product from '@/components/Product/Product'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation';

function formatPrice(amount: number) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

const Checkout = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    let discount = searchParams?.get('discount') || '0'
    let ship = searchParams?.get('ship') || '0'

    const { cartState, clearCart } = useCart();
    let [totalCart, setTotalCart] = useState<number>(0)
    const [activePayment, setActivePayment] = useState<string>('credit-card')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [loginForm, setLoginForm] = useState({
        usernameOrEmail: '',
        password: ''
    })
    const [selectedCountry, setSelectedCountry] = useState('Vietnam')
    const [selectedProvince, setSelectedProvince] = useState('default')
    const [selectedDistrict, setSelectedDistrict] = useState('default')
    const [selectedWard, setSelectedWard] = useState('default')
    const [provinces, setProvinces] = useState<any[]>([])
    const [districts, setDistricts] = useState<any[]>([])
    const [wards, setWards] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentError, setPaymentError] = useState('')
    const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    setIsLoggedIn(false)
                    setLoading(false)
                    return
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setUserData(response.data)
                setIsLoggedIn(true)
            } catch (err) {
                setIsLoggedIn(false)
                localStorage.removeItem('token')
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    useEffect(() => {
        // Fetch provinces data on initial load since Vietnam is default
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data))
    }, [])

    useEffect(() => {
        if (selectedCountry === 'Vietnam') {
            // Fetch provinces data
            fetch('https://provinces.open-api.vn/api/p/')
                .then(res => res.json())
                .then(data => setProvinces(data))
        } else {
            setProvinces([])
            setDistricts([])
            setWards([])
        }
    }, [selectedCountry])

    useEffect(() => {
        if (selectedProvince !== 'default') {
            // Fetch districts data
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts))
        } else {
            setDistricts([])
            setWards([])
        }
    }, [selectedProvince])

    useEffect(() => {
        if (selectedDistrict !== 'default') {
            // Fetch wards data
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards))
        } else {
            setWards([])
        }
    }, [selectedDistrict])

    // Check payment status periodically when payment modal is open
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (showPaymentModal && paymentInfo?.paymentLinkId && paymentStatus === 'pending') {
            interval = setInterval(async () => {
                await checkPaymentStatus();
            }, 5000); // Check every 5 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [showPaymentModal, paymentInfo, paymentStatus]);

    const checkPaymentStatus = async () => {
        if (!paymentInfo?.paymentLinkId) return;
        
        try {
            setIsCheckingPayment(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/status/${paymentInfo.paymentLinkId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Payment Status Response:', response.data);

            if (response.data.isSuccess) {
                setPaymentStatus('success');
                setShowPaymentModal(false);
                
                // Clear cart after successful payment
                clearCart();
                
                // Show success message and redirect
                alert('Thanh toán thành công! Đơn hàng của bạn đã được đặt.');
                router.push('/my-account');
            } else if (response.data.status === 'FAILED') {
                setPaymentStatus('failed');
                setPaymentError('Thanh toán thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        } finally {
            setIsCheckingPayment(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
                usernameOrEmail: loginForm.usernameOrEmail,
                password: loginForm.password
            })

            const { accessToken } = response.data
            localStorage.setItem('token', accessToken)
            
            // Refresh user data after login
            const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            
            setUserData(userResponse.data)
            setIsLoggedIn(true)
        } catch (err: any) {
            alert(err.response?.data?.message || 'Đăng nhập thất bại')
        }
    }

    cartState.cartArray.map(item => totalCart += item.price * item.quantity)

    const handlePayment = async () => {
        try {
            setIsProcessing(true)
            setPaymentError('')
            setPaymentStatus('pending')

            // Get selected province, district, ward names
            const selectedProvinceData = provinces.find((p: any) => p.code === selectedProvince)
            const selectedDistrictData = districts.find((d: any) => d.code === selectedDistrict)
            const selectedWardData = wards.find((w: any) => w.code === selectedWard)

            // Get auth token
            const token = localStorage.getItem('token')
            if (!token) {
                setPaymentError('Vui lòng đăng nhập để tiếp tục')
                return
            }

            // Calculate payment amount based on payment type
            const paymentAmount = paymentType === 'full' 
                ? totalCart - Number(discount) + Number(ship)
                : 50000; // Fixed deposit amount

            // Prepare order data
            const orderData = {
                isLoggedInUser: isLoggedIn,
                clientId: userData?.id || "guest",
                amount: paymentAmount, // Add explicit amount
                orderInfoDto: {
                    productIds: cartState.cartArray.map(item => item.id),
                    shippingAddress: (document.getElementById('address') as HTMLInputElement).value,
                    shippingCity: selectedProvinceData?.name || '',
                    shippingWard: selectedWardData?.name || '',
                    shippingDistrict: selectedDistrictData?.name || '',
                    phoneNumber: (document.getElementById('phoneNumber') as HTMLInputElement).value,
                    email: (document.getElementById('email') as HTMLInputElement).value,
                    fullName: `${(document.getElementById('firstName') as HTMLInputElement).value} ${(document.getElementById('lastName') as HTMLInputElement).value}`,
                    orderOption: paymentType === 'full' ? "FULL_PAYMENT" : "PART_DEPOSIT",
                    notes: (document.getElementById('note') as HTMLTextAreaElement).value,
                    couponId: Number(discount) > 0 ? 1 : null
                }
            }

            // Debug logs
            console.log('=== PAYMENT REQUEST DEBUG ===')
            console.log('1. ORDER DATA:')
            console.log(JSON.stringify(orderData, null, 2))
            
            console.log('\n2. CART ITEMS:')
            console.log(JSON.stringify(cartState.cartArray.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })), null, 2))
            
            console.log('\n3. SELECTED ADDRESS:')
            console.log(JSON.stringify({
                province: selectedProvinceData ? {
                    code: selectedProvinceData.code,
                    name: selectedProvinceData.name
                } : null,
                district: selectedDistrictData ? {
                    code: selectedDistrictData.code,
                    name: selectedDistrictData.name
                } : null,
                ward: selectedWardData ? {
                    code: selectedWardData.code,
                    name: selectedWardData.name
                } : null,
                specificAddress: (document.getElementById('address') as HTMLInputElement).value
            }, null, 2))
            
            console.log('\n4. CUSTOMER INFO:')
            console.log(JSON.stringify({
                fullName: `${(document.getElementById('firstName') as HTMLInputElement).value} ${(document.getElementById('lastName') as HTMLInputElement).value}`,
                email: (document.getElementById('email') as HTMLInputElement).value,
                phoneNumber: (document.getElementById('phoneNumber') as HTMLInputElement).value,
                notes: (document.getElementById('note') as HTMLTextAreaElement).value
            }, null, 2))
            
            console.log('\n5. PAYMENT SUMMARY:')
            console.log(JSON.stringify({
                subtotal: totalCart,
                discount: Number(discount) || 0,
                shipping: Number(ship) || 0,
                fullTotal: totalCart - Number(discount) + Number(ship),
                paymentType: paymentType,
                paymentAmount: paymentAmount
            }, null, 2))
            
            console.log('\n6. AUTH INFO:')
            console.log(JSON.stringify({
                isLoggedIn: isLoggedIn,
                userId: userData?.id || 'guest',
                hasToken: !!localStorage.getItem('token')
            }, null, 2))
            
            console.log('=== END DEBUG ===\n')

            // Create payment with auth token
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/create`, 
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            console.log('Payment Create Response:', response.data)
            console.log('Payment Amount Sent:', paymentAmount)
            console.log('Payment Amount Received:', response.data.amount)

            // Show payment modal with QR code
            setPaymentInfo(response.data);
            setShowPaymentModal(true);

        } catch (error: any) {
            console.error('Payment Error:', error.response?.data || error)
            if (error.response?.status === 401) {
                setPaymentError('Vui lòng đăng nhập để tiếp tục')
                router.push('/login')
            } else {
                setPaymentError(error.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.')
            }
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Thanh toán' subHeading='Thanh toán' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex flex-col lg:flex-row justify-between gap-8">
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            {!isLoggedIn && (
                                <>
                                    <div className="login bg-surface py-3 px-4 flex justify-between rounded-lg">
                                        <div className="left flex items-center">
                                            <span className="text-on-surface-variant1 pr-4">Bạn đã có tài khoản?</span>
                                            <span className="text-button text-on-surface hover-underline cursor-pointer">Đăng nhập</span>
                                        </div>
                                        <div className="right"><i className="ph ph-caret-down fs-20 d-block cursor-pointer"></i></div>
                                    </div>
                                    <div className="form-login-block mt-3">
                                        <form className="p-5 border border-line rounded-lg" onSubmit={handleLogin}>
                                            <div className="grid sm:grid-cols-2 gap-5">
                                                <div className="email">
                                                    <input 
                                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                                        type="text" 
                                                        placeholder="Tên đăng nhập hoặc email" 
                                                        value={loginForm.usernameOrEmail}
                                                        onChange={(e) => setLoginForm({...loginForm, usernameOrEmail: e.target.value})}
                                                        required 
                                                    />
                                                </div>
                                                <div className="pass">
                                                    <input 
                                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                                        type="password" 
                                                        placeholder="Mật khẩu" 
                                                        value={loginForm.password}
                                                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="block-button mt-3">
                                                <button type="submit" className="button-main button-blue-hover">Đăng nhập</button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                            <div className="information mt-5">
                                <div className="heading5">Thông tin giao hàng</div>
                                <div className="form-checkout mt-5">
                                    <form>
                                        <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="firstName" 
                                                    type="text" 
                                                    placeholder="Họ *" 
                                                    defaultValue={userData?.firstName || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="lastName" 
                                                    type="text" 
                                                    placeholder="Tên *" 
                                                    defaultValue={userData?.lastName || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="Email *" 
                                                    defaultValue={userData?.email || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="phoneNumber" 
                                                    type="text" 
                                                    placeholder="Số điện thoại *" 
                                                    defaultValue={userData?.phoneNumber || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="col-span-full select-block">
                                                <select 
                                                    className="border border-line px-4 py-3 w-full rounded-lg" 
                                                    id="region" 
                                                    name="region" 
                                                    value={selectedCountry}
                                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                                >
                                                    <option value="default" disabled>Chọn quốc gia/khu vực</option>
                                                    <option value="Afghanistan">Afghanistan</option>
                                                    <option value="Albania">Albania</option>
                                                    <option value="Algeria">Algeria</option>
                                                    <option value="Andorra">Andorra</option>
                                                    <option value="Angola">Angola</option>
                                                    <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                                                    <option value="Argentina">Argentina</option>
                                                    <option value="Armenia">Armenia</option>
                                                    <option value="Australia">Australia</option>
                                                    <option value="Austria">Austria</option>
                                                    <option value="Azerbaijan">Azerbaijan</option>
                                                    <option value="Bahamas">Bahamas</option>
                                                    <option value="Bahrain">Bahrain</option>
                                                    <option value="Bangladesh">Bangladesh</option>
                                                    <option value="Barbados">Barbados</option>
                                                    <option value="Belarus">Belarus</option>
                                                    <option value="Belgium">Belgium</option>
                                                    <option value="Belize">Belize</option>
                                                    <option value="Benin">Benin</option>
                                                    <option value="Bhutan">Bhutan</option>
                                                    <option value="Bolivia">Bolivia</option>
                                                    <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                                    <option value="Botswana">Botswana</option>
                                                    <option value="Brazil">Brazil</option>
                                                    <option value="Brunei">Brunei</option>
                                                    <option value="Bulgaria">Bulgaria</option>
                                                    <option value="Burkina Faso">Burkina Faso</option>
                                                    <option value="Burundi">Burundi</option>
                                                    <option value="Cabo Verde">Cabo Verde</option>
                                                    <option value="Cambodia">Cambodia</option>
                                                    <option value="Cameroon">Cameroon</option>
                                                    <option value="Canada">Canada</option>
                                                    <option value="Central African Republic">Central African Republic</option>
                                                    <option value="Chad">Chad</option>
                                                    <option value="Chile">Chile</option>
                                                    <option value="China">China</option>
                                                    <option value="Colombia">Colombia</option>
                                                    <option value="Comoros">Comoros</option>
                                                    <option value="Congo">Congo</option>
                                                    <option value="Costa Rica">Costa Rica</option>
                                                    <option value="Croatia">Croatia</option>
                                                    <option value="Cuba">Cuba</option>
                                                    <option value="Cyprus">Cyprus</option>
                                                    <option value="Czech Republic">Czech Republic</option>
                                                    <option value="Denmark">Denmark</option>
                                                    <option value="Djibouti">Djibouti</option>
                                                    <option value="Dominica">Dominica</option>
                                                    <option value="Dominican Republic">Dominican Republic</option>
                                                    <option value="Ecuador">Ecuador</option>
                                                    <option value="Egypt">Egypt</option>
                                                    <option value="El Salvador">El Salvador</option>
                                                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                                                    <option value="Eritrea">Eritrea</option>
                                                    <option value="Estonia">Estonia</option>
                                                    <option value="Eswatini">Eswatini</option>
                                                    <option value="Ethiopia">Ethiopia</option>
                                                    <option value="Fiji">Fiji</option>
                                                    <option value="Finland">Finland</option>
                                                    <option value="France">France</option>
                                                    <option value="Gabon">Gabon</option>
                                                    <option value="Gambia">Gambia</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Germany">Germany</option>
                                                    <option value="Ghana">Ghana</option>
                                                    <option value="Greece">Greece</option>
                                                    <option value="Grenada">Grenada</option>
                                                    <option value="Guatemala">Guatemala</option>
                                                    <option value="Guinea">Guinea</option>
                                                    <option value="Guinea-Bissau">Guinea-Bissau</option>
                                                    <option value="Guyana">Guyana</option>
                                                    <option value="Haiti">Haiti</option>
                                                    <option value="Honduras">Honduras</option>
                                                    <option value="Hungary">Hungary</option>
                                                    <option value="Iceland">Iceland</option>
                                                    <option value="India">India</option>
                                                    <option value="Indonesia">Indonesia</option>
                                                    <option value="Iran">Iran</option>
                                                    <option value="Iraq">Iraq</option>
                                                    <option value="Ireland">Ireland</option>
                                                    <option value="Israel">Israel</option>
                                                    <option value="Italy">Italy</option>
                                                    <option value="Jamaica">Jamaica</option>
                                                    <option value="Japan">Japan</option>
                                                    <option value="Jordan">Jordan</option>
                                                    <option value="Kazakhstan">Kazakhstan</option>
                                                    <option value="Kenya">Kenya</option>
                                                    <option value="Kiribati">Kiribati</option>
                                                    <option value="Korea, North">Korea, North</option>
                                                    <option value="Korea, South">Korea, South</option>
                                                    <option value="Kosovo">Kosovo</option>
                                                    <option value="Kuwait">Kuwait</option>
                                                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                                                    <option value="Laos">Laos</option>
                                                    <option value="Latvia">Latvia</option>
                                                    <option value="Lebanon">Lebanon</option>
                                                    <option value="Lesotho">Lesotho</option>
                                                    <option value="Liberia">Liberia</option>
                                                    <option value="Libya">Libya</option>
                                                    <option value="Liechtenstein">Liechtenstein</option>
                                                    <option value="Lithuania">Lithuania</option>
                                                    <option value="Luxembourg">Luxembourg</option>
                                                    <option value="Madagascar">Madagascar</option>
                                                    <option value="Malawi">Malawi</option>
                                                    <option value="Malaysia">Malaysia</option>
                                                    <option value="Maldives">Maldives</option>
                                                    <option value="Mali">Mali</option>
                                                    <option value="Malta">Malta</option>
                                                    <option value="Marshall Islands">Marshall Islands</option>
                                                    <option value="Mauritania">Mauritania</option>
                                                    <option value="Mauritius">Mauritius</option>
                                                    <option value="Mexico">Mexico</option>
                                                    <option value="Micronesia">Micronesia</option>
                                                    <option value="Moldova">Moldova</option>
                                                    <option value="Monaco">Monaco</option>
                                                    <option value="Mongolia">Mongolia</option>
                                                    <option value="Montenegro">Montenegro</option>
                                                    <option value="Morocco">Morocco</option>
                                                    <option value="Mozambique">Mozambique</option>
                                                    <option value="Myanmar">Myanmar</option>
                                                    <option value="Namibia">Namibia</option>
                                                    <option value="Nauru">Nauru</option>
                                                    <option value="Nepal">Nepal</option>
                                                    <option value="Netherlands">Netherlands</option>
                                                    <option value="New Zealand">New Zealand</option>
                                                    <option value="Nicaragua">Nicaragua</option>
                                                    <option value="Niger">Niger</option>
                                                    <option value="Nigeria">Nigeria</option>
                                                    <option value="North Macedonia">North Macedonia</option>
                                                    <option value="Norway">Norway</option>
                                                    <option value="Oman">Oman</option>
                                                    <option value="Pakistan">Pakistan</option>
                                                    <option value="Palau">Palau</option>
                                                    <option value="Palestine">Palestine</option>
                                                    <option value="Panama">Panama</option>
                                                    <option value="Papua New Guinea">Papua New Guinea</option>
                                                    <option value="Paraguay">Paraguay</option>
                                                    <option value="Peru">Peru</option>
                                                    <option value="Philippines">Philippines</option>
                                                    <option value="Poland">Poland</option>
                                                    <option value="Portugal">Portugal</option>
                                                    <option value="Qatar">Qatar</option>
                                                    <option value="Romania">Romania</option>
                                                    <option value="Russia">Russia</option>
                                                    <option value="Rwanda">Rwanda</option>
                                                    <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                                    <option value="Saint Lucia">Saint Lucia</option>
                                                    <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                                    <option value="Samoa">Samoa</option>
                                                    <option value="San Marino">San Marino</option>
                                                    <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                                                    <option value="Saudi Arabia">Saudi Arabia</option>
                                                    <option value="Senegal">Senegal</option>
                                                    <option value="Serbia">Serbia</option>
                                                    <option value="Seychelles">Seychelles</option>
                                                    <option value="Sierra Leone">Sierra Leone</option>
                                                    <option value="Singapore">Singapore</option>
                                                    <option value="Slovakia">Slovakia</option>
                                                    <option value="Slovenia">Slovenia</option>
                                                    <option value="Solomon Islands">Solomon Islands</option>
                                                    <option value="Somalia">Somalia</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="South Sudan">South Sudan</option>
                                                    <option value="Spain">Spain</option>
                                                    <option value="Sri Lanka">Sri Lanka</option>
                                                    <option value="Sudan">Sudan</option>
                                                    <option value="Suriname">Suriname</option>
                                                    <option value="Sweden">Sweden</option>
                                                    <option value="Switzerland">Switzerland</option>
                                                    <option value="Syria">Syria</option>
                                                    <option value="Taiwan">Taiwan</option>
                                                    <option value="Tajikistan">Tajikistan</option>
                                                    <option value="Tanzania">Tanzania</option>
                                                    <option value="Thailand">Thailand</option>
                                                    <option value="Timor-Leste">Timor-Leste</option>
                                                    <option value="Togo">Togo</option>
                                                    <option value="Tonga">Tonga</option>
                                                    <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                                                    <option value="Tunisia">Tunisia</option>
                                                    <option value="Turkey">Turkey</option>
                                                    <option value="Turkmenistan">Turkmenistan</option>
                                                    <option value="Tuvalu">Tuvalu</option>
                                                    <option value="Uganda">Uganda</option>
                                                    <option value="Ukraine">Ukraine</option>
                                                    <option value="United Arab Emirates">United Arab Emirates</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                    <option value="United States">United States</option>
                                                    <option value="Uruguay">Uruguay</option>
                                                    <option value="Uzbekistan">Uzbekistan</option>
                                                    <option value="Vanuatu">Vanuatu</option>
                                                    <option value="Vatican City">Vatican City</option>
                                                    <option value="Venezuela">Venezuela</option>
                                                    <option value="Vietnam">Vietnam</option>
                                                    <option value="Yemen">Yemen</option>
                                                    <option value="Zambia">Zambia</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down' />
                                            </div>
                                            {selectedCountry === 'Vietnam' && (
                                                <>
                                                    <div className="col-span-full select-block">
                                                        <select 
                                                            className="border border-line px-4 py-3 w-full rounded-lg" 
                                                            id="province" 
                                                            name="province"
                                                            value={selectedProvince}
                                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                                        >
                                                            <option value="default" disabled>Chọn Tỉnh/Thành phố</option>
                                                            {provinces.map((province: any) => (
                                                                <option key={province.code} value={province.code}>
                                                                    {province.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <Icon.CaretDown className='arrow-down' />
                                                    </div>

                                                    <div className="col-span-full select-block">
                                                        <select 
                                                            className="border border-line px-4 py-3 w-full rounded-lg" 
                                                            id="district" 
                                                            name="district"
                                                            value={selectedDistrict}
                                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                                            disabled={selectedProvince === 'default'}
                                                        >
                                                            <option value="default" disabled>Chọn Quận/Huyện</option>
                                                            {districts.map((district: any) => (
                                                                <option key={district.code} value={district.code}>
                                                                    {district.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <Icon.CaretDown className='arrow-down' />
                                                    </div>

                                                    <div className="col-span-full select-block">
                                                        <select 
                                                            className="border border-line px-4 py-3 w-full rounded-lg" 
                                                            id="ward" 
                                                            name="ward"
                                                            value={selectedWard}
                                                            onChange={(e) => setSelectedWard(e.target.value)}
                                                            disabled={selectedDistrict === 'default'}
                                                        >
                                                            <option value="default" disabled>Chọn Phường/Xã</option>
                                                            {wards.map((ward: any) => (
                                                                <option key={ward.code} value={ward.code}>
                                                                    {ward.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <Icon.CaretDown className='arrow-down' />
                                                    </div>
                                                </>
                                            )}
                                            <div className="col-span-full">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="address" 
                                                    type="text" 
                                                    placeholder={selectedCountry === 'Vietnam' ? "Số nhà, tên đường *" : "Địa chỉ *"} 
                                                    defaultValue={userData?.address || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="col-span-full">
                                                <textarea 
                                                    className="border border-line px-4 py-3 w-full rounded-lg" 
                                                    id="note" 
                                                    name="note" 
                                                    placeholder="Ghi chú đơn hàng..."
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="payment-block md:mt-10 mt-6">
                                            <div className="heading5">Chọn phương thức thanh toán:</div>
                                            <div className="list-payment mt-5">
                                                <div className={`type bg-surface p-5 border border-line rounded-lg ${paymentType === 'full' ? 'border-primary bg-primary/5' : ''}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <input 
                                                                className="h-5 w-5 text-primary cursor-pointer" 
                                                                type="radio" 
                                                                id="full_payment" 
                                                                name="payment_type" 
                                                                value="full"
                                                                checked={paymentType === 'full'}
                                                                onChange={(e) => setPaymentType('full')}
                                                            />
                                                            <div>
                                                                <label className="text-button cursor-pointer" htmlFor="full_payment">Thanh toán toàn bộ</label>
                                                                <p className="text-sm text-gray-500 mt-1">Thanh toán toàn bộ đơn hàng ngay</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-semibold text-primary">
                                                            {Math.round(totalCart - Number(discount) + Number(ship)).toLocaleString('vi-VN')} VNĐ
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${paymentType === 'deposit' ? 'border-primary bg-primary/5' : ''}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <input 
                                                                className="h-5 w-5 text-primary cursor-pointer" 
                                                                type="radio" 
                                                                id="deposit" 
                                                                name="payment_type" 
                                                                value="deposit"
                                                                checked={paymentType === 'deposit'}
                                                                onChange={(e) => setPaymentType('deposit')}
                                                            />
                                                            <div>
                                                                <label className="text-button cursor-pointer" htmlFor="deposit">Đặt cọc (50.000 VNĐ)</label>
                                                                <p className="text-sm text-gray-500 mt-1">Thanh toán trước 50.000 VNĐ, phần còn lại trả sau</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-semibold text-primary">
                                                            {Math.round(50000).toLocaleString('vi-VN')} VNĐ
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="block-button md:mt-10 mt-6">
                                            <button 
                                                className="button-main w-full" 
                                                onClick={handlePayment}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
                                            </button>
                                            {paymentError && (
                                                <div className="text-red-500 mt-2 text-center">{paymentError}</div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-5/12 order-1 lg:order-2">
                            <div className="checkout-block">
                                <div className="heading5 pb-3">Đơn hàng của bạn</div>
                                <div className="list-product-checkout">
                                    {cartState.cartArray.length < 1 ? (
                                        <p className='text-button pt-3'>Không có sản phẩm nào trong giỏ hàng</p>
                                    ) : (
                                        cartState.cartArray.map((product) => (
                                            <>
                                                <div className="item flex items-center justify-between w-full pb-5 border-b border-line gap-6 mt-5">
                                                    <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={product.thumbImage[0]}
                                                            width={500}
                                                            height={500}
                                                            alt='img'
                                                            className='w-full h-full'
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div>
                                                            <div className="name text-title">{product.name}</div>
                                                            <div className="caption1 text-secondary mt-2">
                                                                <span className='size capitalize'>{product.selectedSize || product.sizes[0]}</span>
                                                                <span>/</span>
                                                                <span className='color capitalize'>{product.selectedColor || product.variation[0].color}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-title">
                                                            <span className='quantity'>{product.quantity}</span>
                                                            <span className='px-1'>x</span>
                                                            <span>
                                                                {Math.round(product.price).toLocaleString('vi-VN')} VNĐ
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ))
                                    )}
                                </div>
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Giảm giá</div>
                                    <div className="text-title">-<span className="discount">{Math.round(Number(discount)).toLocaleString('vi-VN')}</span> VNĐ</div>
                                </div>
                                <div className="ship-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Vận chuyển</div>
                                    <div className="text-title">{Number(ship) === 0 ? 'Miễn phí' : `${Math.round(Number(ship)).toLocaleString('vi-VN')} VNĐ`}</div>
                                </div>
                                <div className="total-cart-block pt-5 flex justify-between">
                                    <div className="heading5">Tổng cộng</div>
                                    <div className="heading5 total-cart">{Math.round(totalCart - Number(discount) + Number(ship)).toLocaleString('vi-VN')} VNĐ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Payment Modal */}
            {showPaymentModal && paymentInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold focus:outline-none transition-colors"
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-2">Chi tiết thanh toán</h3>
                                <p className="text-blue-100">Hoàn tất thanh toán an toàn</p>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Payment Amount Highlight */}
                            <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Số tiền thanh toán</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {Math.round(paymentType === 'deposit' ? 50000 : paymentInfo.amount).toLocaleString('vi-VN')} VNĐ
                                </p>
                                {paymentType === 'deposit' && (
                                    <p className="text-sm text-gray-500 mt-1">Thanh toán đặt cọc</p>
                                )}
                            </div>

                            {/* QR Code */}
                            <div className="text-center">
                                <div className="bg-white p-3 rounded-xl border-2 border-gray-200 inline-block">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentInfo.qrCode)}`}
                                        alt="Payment QR Code"
                                        className="w-36 h-36 rounded-lg"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Quét mã QR để thanh toán</p>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                <h4 className="font-semibold text-gray-800 mb-3">Thông tin chuyển khoản</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Số tài khoản:</span>
                                        <span className="font-mono font-semibold text-gray-800">{paymentInfo.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tên tài khoản:</span>
                                        <span className="font-semibold text-gray-800">{paymentInfo.accountName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Mã đơn hàng:</span>
                                        <span className="font-mono text-sm text-gray-800">{paymentInfo.orderCode}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Nội dung chuyển khoản:</span>
                                        <span className="text-sm text-gray-800 truncate max-w-32">{paymentInfo.description}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className={`p-3 rounded-xl border ${
                                paymentStatus === 'success' ? 'bg-green-50 border-green-200' :
                                paymentStatus === 'failed' ? 'bg-red-50 border-red-200' :
                                'bg-yellow-50 border-yellow-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-800">Trạng thái thanh toán:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        paymentStatus === 'success' ? 'bg-green-100 text-green-800' :
                                        paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {paymentStatus === 'success' ? '✓ Thành công' :
                                         paymentStatus === 'failed' ? '✗ Thất bại' :
                                         isCheckingPayment ? '⏳ Đang kiểm tra...' : '⏳ Đang chờ'}
                                    </span>
                                </div>
                                {paymentStatus === 'pending' && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Vui lòng hoàn tất thanh toán bằng mã QR phía trên. Hệ thống sẽ tự động kiểm tra trạng thái thanh toán mỗi 5 giây.
                                    </p>
                                )}
                            </div>

                            {/* Expiry Info */}
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-2">
                                <div className="flex items-center text-orange-800">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">Hết hạn lúc: {new Date(paymentInfo.expiresAt).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => {
                                        // Copy payment details to clipboard
                                        const paymentDetails = `Số tài khoản: ${paymentInfo.accountNumber}\nTên tài khoản: ${paymentInfo.accountName}\nSố tiền: ${Math.round(paymentType === 'deposit' ? 50000 : paymentInfo.amount).toLocaleString('vi-VN')} VNĐ\nNội dung: ${paymentInfo.description}`;
                                        navigator.clipboard.writeText(paymentDetails);
                                        alert('Đã sao chép thông tin thanh toán!');
                                    }}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Sao chép thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Checkout