import React from 'react'

interface Props {
    props: string
}

const Newsletter: React.FC<Props> = ({ props }) => {
    return (
        <>
            <div className="container">
                <div className={`newsletter-block md:py-20 sm:py-14 py-10 sm:px-8 px-6 sm:rounded-[32px] rounded-3xl flex flex-col items-center ${props}`}>
                    <div className="heading3 text-white text-center">Đăng ký và nhận giảm giá 10%</div>
                    <div className='text-white text-center mt-3'>Đăng ký để nhận ưu đãi sớm, sản phẩm mới, khuyến mãi và nhiều hơn nữa</div>
                    <div className="input-block lg:w-1/2 sm:w-3/5 w-full h-[52px] sm:mt-10 mt-7">
                        <form className='w-full h-full relative' action="post">
                            <input type="email" placeholder='Nhập email của bạn' className='caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line' required />
                            <button className='button-main bg-green text-black absolute top-1 bottom-1 right-1 flex items-center justify-center'>Đăng ký
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Newsletter