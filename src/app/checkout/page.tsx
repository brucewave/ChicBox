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
    let discount = searchParams.get('discount')
    let ship = searchParams.get('ship')

    const { cartState } = useCart();
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
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentError, setPaymentError] = useState('')
    const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

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
            alert(err.response?.data?.message || 'Login failed')
        }
    }

    cartState.cartArray.map(item => totalCart += item.price * item.quantity)

    const handlePayment = async () => {
        try {
            setIsProcessing(true)
            setPaymentError('')

            // Get selected province, district, ward names
            const selectedProvinceData = provinces.find((p: any) => p.code === selectedProvince)
            const selectedDistrictData = districts.find((d: any) => d.code === selectedDistrict)
            const selectedWardData = wards.find((w: any) => w.code === selectedWard)

            // Get auth token
            const token = localStorage.getItem('token')
            if (!token) {
                setPaymentError('Please login to continue')
                return
            }

            // Prepare order data
            const orderData = {
                isLoggedInUser: isLoggedIn,
                clientId: userData?.id || "guest",
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
                    couponId: discount ? 1 : null
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
                total: totalCart - Number(discount) + Number(ship)
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

            // Show payment modal with QR code
            setPaymentInfo(response.data);
            setShowPaymentModal(true);

        } catch (error: any) {
            console.error('Payment Error:', error.response?.data || error)
            if (error.response?.status === 401) {
                setPaymentError('Please login to continue')
                router.push('/login')
            } else {
                setPaymentError(error.response?.data?.message || 'Payment failed. Please try again.')
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
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Shopping cart' subHeading='Shopping cart' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex flex-col lg:flex-row justify-between gap-8">
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            {!isLoggedIn && (
                                <>
                                    <div className="login bg-surface py-3 px-4 flex justify-between rounded-lg">
                                        <div className="left flex items-center">
                                            <span className="text-on-surface-variant1 pr-4">Already have an account? </span>
                                            <span className="text-button text-on-surface hover-underline cursor-pointer">Login</span>
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
                                                        placeholder="Username or email" 
                                                        value={loginForm.usernameOrEmail}
                                                        onChange={(e) => setLoginForm({...loginForm, usernameOrEmail: e.target.value})}
                                                        required 
                                                    />
                                                </div>
                                                <div className="pass">
                                                    <input 
                                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                                        type="password" 
                                                        placeholder="Password" 
                                                        value={loginForm.password}
                                                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="block-button mt-3">
                                                <button type="submit" className="button-main button-blue-hover">Login</button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                            <div className="information mt-5">
                                <div className="heading5">Information</div>
                                <div className="form-checkout mt-5">
                                    <form>
                                        <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="firstName" 
                                                    type="text" 
                                                    placeholder="First Name *" 
                                                    defaultValue={userData?.firstName || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="lastName" 
                                                    type="text" 
                                                    placeholder="Last Name *" 
                                                    defaultValue={userData?.lastName || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="Email Address *" 
                                                    defaultValue={userData?.email || ''}
                                                    required 
                                                />
                                            </div>
                                            <div className="">
                                                <input 
                                                    className="border-line px-4 py-3 w-full rounded-lg" 
                                                    id="phoneNumber" 
                                                    type="text" 
                                                    placeholder="Phone Numbers *" 
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
                                                    <option value="default" disabled>Choose Country/Region</option>
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
                                                    placeholder={selectedCountry === 'Vietnam' ? "Số nhà, tên đường *" : "Address *"} 
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
                                            <div className="heading5">Choose payment Option:</div>
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
                                                                <label className="text-button cursor-pointer" htmlFor="full_payment">Full Payment</label>
                                                                <p className="text-sm text-gray-500 mt-1">Pay the full amount now</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-semibold text-primary">
                                                            ${totalCart - Number(discount) + Number(ship)}.00
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
                                                                <label className="text-button cursor-pointer" htmlFor="deposit">Deposit (30%)</label>
                                                                <p className="text-sm text-gray-500 mt-1">Pay 30% now, remaining amount later</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-semibold text-primary">
                                                            ${((totalCart - Number(discount) + Number(ship)) * 0.3).toFixed(2)}
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
                                                {isProcessing ? 'Processing...' : 'Payment'}
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
                                <div className="heading5 pb-3">Your Order</div>
                                <div className="list-product-checkout">
                                    {cartState.cartArray.length < 1 ? (
                                        <p className='text-button pt-3'>No product in cart</p>
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
                                                                ${product.price}.00
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ))
                                    )}
                                </div>
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Discounts</div>
                                    <div className="text-title">-$<span className="discount">{discount}</span><span>.00</span></div>
                                </div>
                                <div className="ship-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Shipping</div>
                                    <div className="text-title">{Number(ship) === 0 ? 'Free' : `$${ship}.00`}</div>
                                </div>
                                <div className="total-cart-block pt-5 flex justify-between">
                                    <div className="heading5">Total</div>
                                    <div className="heading5 total-cart">${totalCart - Number(discount) + Number(ship)}.00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Payment Modal */}
            {showPaymentModal && paymentInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
                        {/* Close (X) button */}
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
                        <div className="space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentInfo.qrCode)}`}
                                        alt="Payment QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p><span className="font-medium">Account Number:</span> {paymentInfo.accountNumber}</p>
                                <p><span className="font-medium">Account Name:</span> {paymentInfo.accountName}</p>
                                <p><span className="font-medium">Amount:</span> {formatPrice(paymentInfo.amount)}</p>
                                <p><span className="font-medium">Description:</span> {paymentInfo.description}</p>
                                <p><span className="font-medium">Order Code:</span> {paymentInfo.orderCode}</p>
                                <p><span className="font-medium">Expires At:</span> {new Date(paymentInfo.expiresAt).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Close
                                </button>
                                <a
                                    href={paymentInfo.checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                                >
                                    Pay Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Checkout