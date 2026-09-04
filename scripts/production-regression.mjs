import {readFileSync} from 'node:fs';

const failures=[];
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const contains=(path,needle,label)=>{const text=read(path);if(!text.includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const excludes=(path,needle,label)=>{const text=read(path);if(text.includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

for(const path of ['components/AdminCustomerRetention.tsx','components/AdminTodayWork.tsx','components/AdminOperatorMonthlyReport.tsx']){
 excludes(path,'localStorage','Dashboard production không được dùng browser storage làm nguồn dữ liệu');
 contains(path,"fetch('/api/admin/",'Dashboard production phải đọc dữ liệu từ API server');
}

contains('app/api/admin/service-operations/route.ts','handoffAcceptedById','Điều hành phải lưu ID người nhận bàn giao');
contains('app/api/admin/service-operations/route.ts','role:actor.role','Dashboard Điều hành phải nhận đúng vai trò từ server');
contains('next.config.mjs','X-Content-Type-Options','Security headers phải bật nosniff');
contains('next.config.mjs','X-Frame-Options','Security headers phải chống framing');

for(const path of ['app/api/admin/auth/login/route.ts','app/api/affiliate/auth/login/route.ts','app/api/partner/auth/login/route.ts','app/api/account/route.ts']){
 contains(path,'loginTemporarilyBlocked','Các cổng đăng nhập phải có khóa tạm khi sai nhiều lần');
 contains(path,'recordLoginAttempt','Các cổng đăng nhập phải ghi nhận lần đăng nhập');
}

contains('app/api/affiliate/auth/register/route.ts',"'pending'",'CTV tự đăng ký phải vào trạng thái chờ duyệt');
contains('app/api/affiliate/auth/register/route.ts',"'affiliate'",'CTV đăng ký phải dùng role affiliate');
contains('app/api/admin/affiliates/route.ts','resolve_payout','Admin phải duyệt hoặc từ chối yêu cầu rút hoa hồng');
contains('app/api/affiliate/dashboard/route.ts',"action==='update_profile'",'CTV phải tự cập nhật hồ sơ nhận tiền qua server');
contains('app/api/affiliate/dashboard/route.ts',"action==='request_payout'",'CTV phải gửi yêu cầu rút tiền qua server');
excludes('app/api/affiliate/dashboard/route.ts','net_price_vnd','Affiliate API không được truy vấn giá NET');
contains('components/AffiliateSalesToolkit.tsx','Copy caption + link','CTV phải có bộ công cụ bán hàng');
contains('components/AffiliateSalesToolkit.tsx','30 ngày','CTV phải thấy rõ thời hạn attribution');
contains('app/api/admin/system-health/route.ts',"id:'affiliates'",'System Health phải theo dõi module CTV');

if(failures.length){
 console.error('\nProduction regression checks FAILED:\n');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}

console.log('Production regression checks passed.');
