import React from 'react'

interface Props {
    props: string;
}

const Benefit: React.FC<Props> = ({ props }) => {
    return (
        <>
            <div className="container">
                <div className={`benefit-block ${props}`}>
                    <div className="list-benefit grid items-start lg:grid-cols-4 grid-cols-2 gap-[30px]">
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <i className="icon-phone-call lg:text-7xl text-5xl"></i>
                            <div className="heading6 text-center mt-5">Dịch vụ khách hàng 24/7</div>
                            <div className="caption1 text-secondary text-center mt-3">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 với mọi thắc mắc hoặc vấn đề.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <i className="icon-return lg:text-7xl text-5xl"></i>
                            <div className="heading6 text-center mt-5">Hoàn tiền trong 14 ngày</div>
                            <div className="caption1 text-secondary text-center mt-3">Nếu bạn không hài lòng với sản phẩm, hãy trả lại trong vòng 14 ngày để được hoàn tiền.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <i className="icon-guarantee lg:text-7xl text-5xl"></i>
                            <div className="heading6 text-center mt-5">Cam kết của chúng tôi</div>
                            <div className="caption1 text-secondary text-center mt-3">Chúng tôi cam kết về sản phẩm và dịch vụ, đảm bảo sự hài lòng của bạn.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <i className="icon-delivery-truck lg:text-7xl text-5xl"></i>
                            <div className="heading6 text-center mt-5">Giao hàng toàn cầu</div>
                            <div className="caption1 text-secondary text-center mt-3">Chúng tôi giao hàng toàn cầu, giúp khách hàng ở mọi nơi tiếp cận sản phẩm.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Benefit