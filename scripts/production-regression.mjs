import {readFileSync} from 'node:fs';

const failures=[];
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const contains=(path,needle,label)=>{const text=read(path);if(!text.includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const excludes=(path,needle,label)=>{const text=read(path);if(text.includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

for(const path of ['components/AdminCustomerRetention.tsx','components/AdminTodayWork.tsx','components/AdminOperatorMonthlyReport.tsx']){
 excludes(path,'localStorage','Dashboard production không được dùng browser storage làm nguồn dữ liệu');
}

excludes('app/api/affiliate/dashboard/route.ts','net_price_vnd','Affiliate API không được truy vấn giá NET');
contains('app/api/admin/bookings/route.ts','settleAffiliateBooking','Booking completed phải đối soát hoa hồng CTV');
contains('app/api/affiliate/dashboard/route.ts','export async function PATCH','CTV phải tự cập nhật hồ sơ nhận tiền qua server');
contains('app/api/payments/webhook/route.ts','PAYMENT_WEBHOOK_SECRET','Payment webhook phải yêu cầu secret');
contains('app/api/payments/webhook/route.ts','provider_reference','Payment webhook phải có khóa giao dịch nhà cung cấp');
contains('app/api/payments/webhook/route.ts','on conflict(provider,provider_reference)','Payment webhook phải idempotent');
contains('middleware.ts',"'/api/admin/:path*'",'Origin guard phải bảo vệ Admin API');
contains('middleware.ts',"'/api/payments/:path*'",'Origin guard phải bảo vệ Payment API');
contains('next.config.mjs','X-Content-Type-Options','Security headers phải bật nosniff');
contains('next.config.mjs','X-Frame-Options','Security headers phải chống framing');
contains('db/schema.sql',"'affiliate'",'Schema gốc phải hỗ trợ role CTV');

for(const path of ['app/api/admin/auth/login/route.ts','app/api/affiliate/auth/login/route.ts','app/api/partner/auth/login/route.ts','app/api/account/route.ts']){
 contains(path,'loginTemporarilyBlocked','Các cổng đăng nhập phải có khóa tạm khi sai nhiều lần');
 contains(path,'recordLoginAttempt','Các cổng đăng nhập phải ghi nhận lần đăng nhập');
}

if(failures.length){
 console.error('\nProduction regression checks FAILED:\n');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}

console.log('Production regression checks passed.');
