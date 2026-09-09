import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const contains=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const excludes=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

contains('app/layout.tsx',"import './desktop-booking-cta.css';",'Layout phải nạp lớp tối ưu booking desktop');
excludes('app/desktop-booking-cta.css','position:fixed!important','Trang sản phẩm không được có nút booking nổi cố định');
excludes('app/desktop-booking-cta.css','content:"ĐẶT NGAY"','Trang sản phẩm không được chèn nhãn ĐẶT NGAY nổi');
contains('app/desktop-booking-cta.css','scroll-margin-top:72px','Điểm đến booking phải chừa khoảng cho thanh sticky');
contains('app/desktop-booking-cta.css','max-height:calc(100vh - 76px)!important','Form booking desktop phải thao tác trong chiều cao màn hình');
contains('app/desktop-booking-cta.css','overflow-y:auto!important','Form booking desktop dài phải cuộn độc lập thay vì buộc khách cuộn hết sản phẩm');

for(const path of ['components/UnifiedStayPublicDetail.tsx','components/UnifiedCruisePublicDetail.tsx','components/UnifiedTourPublicDetail.tsx']){
 contains(path,'href="#booking"','Trang chi tiết sản phẩm phải có điểm vào booking sớm');
 contains(path,'<aside id="booking">','Trang chi tiết sản phẩm phải có form booking đích');
}

contains('components/BookingInquiry.tsx','unitId:selectedUnit?.id','Phiếu tạm tính phải giữ ID hạng phòng đã chọn');
contains('components/BookingInquiry.tsx','productSlug','Phiếu tạm tính phải giữ slug sản phẩm để tìm đúng khách sạn');
contains('components/BookingInquiry.tsx',"new CustomEvent<PricingDatesDetail>('tn-pricing-dates-updated'",'Ngày booking phải phát giá trị mới trực tiếp thay vì đọc URL cũ');
contains('components/BookingInquiry.tsx','window.history.replaceState','Đổi ngày trong form booking phải cập nhật URL tại chỗ, không điều hướng lại route');
excludes('components/BookingInquiry.tsx','router.replace(','Đổi ngày trong form booking không được gọi router.replace gây tải lại route');
contains('components/ProductRateCalendar.tsx','selectBookingUnit(unit)','Hạng đang xem trên lịch giá phải đồng bộ sang form booking');
contains('components/ProductRateCalendar.tsx',"new CustomEvent<PricingDatesDetail>('tn-pricing-dates-updated'",'Lịch giá phải đồng bộ ngày ngay từ lần bấm đầu tiên');
contains('components/ProductRateCalendar.tsx','window.history.replaceState','Bấm ngày trên lịch giá phải cập nhật URL tại chỗ, không điều hướng lại route');
excludes('components/ProductRateCalendar.tsx','router.replace(','Bấm ngày trên lịch giá không được gọi router.replace gây tải lại route');
contains('components/BookingCart.tsx','findBookingUnit','Giỏ booking phải tìm hạng bằng bộ nhận dạng an toàn');
contains('app/checkout/page.tsx','findBookingUnit','Checkout phải tính theo đúng hạng phòng đã khóa');
excludes('components/BookingCart.tsx',"item.unit.includes(x.code||'')",'Giỏ không được fuzzy-match chuỗi rỗng sang hạng thấp đầu tiên');
excludes('app/checkout/page.tsx',"i.unit?.includes(u.code||'')",'Checkout không được fuzzy-match chuỗi rỗng sang hạng thấp đầu tiên');
contains('lib/booking-unit-selection.ts','if(selection.unitId)return list.find','Khi có unitId phải chỉ chấp nhận đúng ID, không fallback sang hạng khác');

contains('components/HomeCmsSections.tsx',"(x.type==='Khách sạn'||x.type==='Villa & Resort')",'Lưu trú nổi bật chỉ được lấy khách sạn, villa và resort');
excludes('components/HomeCmsSections.tsx',"x.type!=='Du thuyền'&&!staticStaySlugs.has(x.slug)",'Lưu trú nổi bật không được dùng điều kiện loại trừ vì có thể lọt Tour');
contains('components/HomeCmsSections.tsx','>Khách sạn</Link><Link href="/villa-resort">Resort</Link><Link href="/villa-resort">Villa</Link>','Thanh loại hình lưu trú nổi bật chỉ hiển thị Khách sạn, Resort, Villa');

for(const needle of ['Chương trình tour','Ngày khởi hành & số khách','Dùng để xác nhận booking; chưa thu tiền ở bước này','✓ Giá theo lịch thật','Miễn phí gửi yêu cầu · chưa phát sinh thanh toán']){
 contains('components/TourBookingInquiry.tsx',needle,'Form đặt Tour phải đồng nhất cấu trúc và thông điệp với form booking chuẩn');
}
contains('components/TourBookingInquiry.tsx','productSlug:p?.slug','Giỏ Tour phải giữ slug sản phẩm như các luồng booking khác');

if(failures.length){
 console.error('\nDesktop booking regression FAILED:\n');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}
console.log('Desktop booking regression passed.');
