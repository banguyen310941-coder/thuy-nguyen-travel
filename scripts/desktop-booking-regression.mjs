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

if(failures.length){
 console.error('\nDesktop booking regression FAILED:\n');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}
console.log('Desktop booking regression passed.');
