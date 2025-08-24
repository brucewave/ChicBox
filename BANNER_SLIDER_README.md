# Banner Slider Component

## Tổng quan
Component `BannerSliderConfig` là một slider banner có thể tùy chỉnh được, được đặt trước Hero Banner trên trang chính. Component này sử dụng Swiper.js để tạo hiệu ứng slider mượt mà với các tính năng như autoplay, navigation, pagination.

## Vị trí
- **File component**: `src/components/Slider/BannerSliderConfig.tsx`
- **File CSS**: `src/styles/banner-slider.scss`
- **Vị trí trên trang**: Trước `HeroBanner` trong `src/app/page.tsx`

## Cách sử dụng

### 1. Sử dụng với cấu hình mặc định
```tsx
import BannerSliderConfig from '@/components/Slider/BannerSliderConfig'

// Trong component
<BannerSliderConfig />
```

### 2. Sử dụng với cấu hình tùy chỉnh
```tsx
import BannerSliderConfig from '@/components/Slider/BannerSliderConfig'

const customBanners = [
    {
        id: 1,
        title: "Khuyến mãi đặc biệt",
        subtitle: "Giảm giá 70%",
        imageUrl: "/images/banner/custom1.png",
        link: "/shop/sale",
        buttonText: "Mua ngay",
        buttonStyle: 'primary'
    },
    // Thêm banner khác...
];

// Trong component
<BannerSliderConfig 
    banners={customBanners}
    autoPlay={true}
    autoPlayDelay={3000}
    showNavigation={true}
    showPagination={true}
    height="h-[400px] md:h-[500px] lg:h-[600px]"
    className="custom-bg"
/>
```

## Props có thể tùy chỉnh

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `banners` | `BannerType[]` | `[]` | Mảng các banner tùy chỉnh |
| `autoPlay` | `boolean` | `true` | Bật/tắt autoplay |
| `autoPlayDelay` | `number` | `5000` | Thời gian delay giữa các slide (ms) |
| `showNavigation` | `boolean` | `true` | Hiển thị nút prev/next |
| `showPagination` | `boolean` | `true` | Hiển thị dots pagination |
| `height` | `string` | `"h-[300px] md:h-[400px] lg:h-[500px]"` | Chiều cao của slider |
| `className` | `string` | `""` | CSS class tùy chỉnh |

## Cấu trúc Banner

```tsx
interface BannerType {
    id: number;                    // ID duy nhất
    title: string;                 // Tiêu đề chính
    subtitle: string;              // Tiêu đề phụ
    imageUrl: string;              // Đường dẫn hình ảnh
    link: string;                  // Link khi click
    buttonText: string;            // Text của button
    backgroundColor?: string;       // Màu nền (tùy chọn)
    textColor?: string;            // Màu chữ (tùy chọn)
    buttonStyle?: 'primary' | 'secondary' | 'outline'; // Kiểu button
}
```

## Kiểu Button

- **primary**: Nền trắng, chữ đen (mặc định)
- **secondary**: Nền xám đậm, chữ trắng
- **outline**: Nền trong suốt, viền trắng, chữ trắng

## Thay đổi nội dung Banner

### Cách 1: Thay đổi trực tiếp trong component
Chỉnh sửa mảng `defaultBanners` trong file `BannerSliderConfig.tsx`:

```tsx
const defaultBanners: BannerType[] = [
    {
        id: 1,
        title: "Tiêu đề mới",
        subtitle: "Mô tả mới",
        imageUrl: "/images/banner/banner-moi.png",
        link: "/shop/category-moi",
        buttonText: "Khám phá ngay",
        buttonStyle: 'primary'
    },
    // Thêm banner mới...
];
```

### Cách 2: Truyền banners từ component cha
```tsx
const myBanners = [
    // Định nghĩa banners của bạn
];

<BannerSliderConfig banners={myBanners} />
```

## Thay đổi hình ảnh

1. Đặt hình ảnh banner vào thư mục `public/images/banner/`
2. Cập nhật đường dẫn trong `imageUrl`
3. Đảm bảo hình ảnh có kích thước phù hợp (khuyến nghị: 1920x800px)
4. Hỗ trợ các định dạng: JPG, PNG, WebP

**Lưu ý:** Hiện tại slider đang sử dụng 4 ảnh: `banner1.jpg`, `banner2.jpg`, `banner3.jpg`, `banner4.jpg`

## Tùy chỉnh Style

### Thay đổi CSS
Chỉnh sửa file `src/styles/banner-slider.scss`:

```scss
.banner-slider-block {
    .banner-swiper {
        // Tùy chỉnh style cho slider
    }
    
    .banner-slide {
        // Tùy chỉnh style cho từng slide
    }
}
```

### Thay đổi Tailwind classes
Chỉnh sửa trực tiếp trong component `BannerSliderConfig.tsx`:

```tsx
<div className="banner-slider-block w-full bg-gradient-to-r from-red-50 to-pink-50 py-8 md:py-12">
    {/* Thay đổi background gradient */}
</div>
```

## Responsive

Component đã được thiết kế responsive với các breakpoints:
- **Mobile**: `h-[300px]`
- **Tablet**: `h-[400px]`  
- **Desktop**: `h-[500px]`

## Tính năng

- ✅ Autoplay với delay có thể tùy chỉnh
- ✅ Navigation buttons (prev/next)
- ✅ Pagination dots
- ✅ Fade effect giữa các slide
- ✅ Responsive design
- ✅ Hover effects
- ✅ Custom button styles
- ✅ Overlay text để dễ đọc
- ✅ Loop infinite

## Troubleshooting

### Slider không hiển thị
- Kiểm tra import Swiper CSS
- Đảm bảo hình ảnh tồn tại
- Kiểm tra console errors

### Hình ảnh không load
- Kiểm tra đường dẫn hình ảnh
- Đảm bảo file hình ảnh tồn tại trong `public/images/banner/`

### Style không áp dụng
- Kiểm tra import file `banner-slider.scss`
- Đảm bảo file CSS được compile

## Ví dụ sử dụng nâng cao

```tsx
// Tạo banner với API data
const [apiBanners, setApiBanners] = useState([]);

useEffect(() => {
    // Fetch banners từ API
    fetchBanners().then(setApiBanners);
}, []);

return (
    <BannerSliderConfig 
        banners={apiBanners}
        autoPlay={true}
        autoPlayDelay={4000}
        height="h-[350px] md:h-[450px] lg:h-[550px]"
        className="my-custom-banner"
    />
);
```
