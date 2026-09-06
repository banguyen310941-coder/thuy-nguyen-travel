import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const contains=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

contains('app/layout.tsx',"import './desktop-booking-cta.css';",'Layout phải nạp lớp tối ưu booking desktop');
contains('app/desktop-booking-cta.css','@media (min-width:768px)','CTA nhanh phải bật từ màn hình tablet ngang/laptop trở lên');
contains('app/desktop-booking-cta.css','a[href="#booking"]','CTA nhanh phải tái sử dụng link booking thật của sản phẩm');
contains('app/desktop-booking-cta.css','position:fixed!important','Nút Đặt ngay phải luôn nhìn thấy khi khách xem sản phẩm trên desktop');
contains('app/desktop-booking-cta.css','content:"ĐẶT NGAY"','CTA desktop phải có nhãn ĐẶT NGAY rõ ràng');
contains('app/desktop-booking-cta.css','scroll-margin-top:72px','Điểm đến booking phải chừa khoảng cho thanh sticky');
contains('app/desktop-booking-cta.css','max-height:calc(100vh - 76px)!important','Form booking desktop phải thao tác trong chiều cao màn hình');
contains('app/desktop-booking-cta.css','overflow-y:auto!important','Form booking desktop dài phải cuộn độc lập thay vì buộc khách cuộn hết sản phẩm');

for(const path of ['components/UnifiedStayPublicDetail.tsx','components/UnifiedCruisePublicDetail.tsx','components/UnifiedTourPublicDetail.tsx']){
 contains(path,'href="#booking"','Trang chi tiết sản phẩm phải có điểm vào booking sớm');
 contains(path,'<aside id="booking">','Trang chi tiết sản phẩm phải có form booking đích');
}

if(failures.length){
 console.error('\nDesktop booking regression FAILED:\n');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}
console.log('Desktop booking regression passed.');
