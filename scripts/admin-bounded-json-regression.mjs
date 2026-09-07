import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const routes=[
 ['app/api/admin/payment-requests/route.ts','32_768','req','Đề xuất chi'],
 ['app/api/admin/products/route.ts','4_194_304','req','Sản phẩm'],
 ['app/api/admin/cms-content/route.ts','4_194_304','req','CMS'],
 ['app/api/admin/site-config/route.ts','65_536','req','Cấu hình website'],
 ['app/api/admin/homepage/route.ts','4_194_304','req','Trang chủ'],
 ['app/api/admin/rates/route.ts','65_536','req','Lịch giá'],
 ['app/api/admin/bookings/route.ts','65_536','req','Booking'],
 ['app/api/admin/accounting/route.ts','65_536','req','Kế toán'],
 ['app/api/admin/marketing-budget/route.ts','131_072','req','Ngân sách Marketing'],
 ['app/api/admin/supplier-orders/route.ts','131_072','req','Đơn nhà cung cấp'],
 ['app/api/admin/shared-data/route.ts','MAX_BODY_SIZE','request','Dữ liệu dùng chung'],
];

for(const [path,limit,param,label] of routes){
 must(path,"from '@/lib/server/public-abuse'",`${label} phải dùng bounded parser chung`);
 must(path,`requestBodyTooLarge(${param},${limit})`,`${label} phải chặn Content-Length vượt trần sớm`);
 must(path,`readBoundedJson(${param},${limit})`,`${label} phải chặn body chunked vượt trần`);
 must(path,'status:413',`${label} phải trả 413 khi request quá lớn`);
 mustNot(path,`await ${param}.json()`,`${label} không được buffer JSON không giới hạn`);
}

mustNot('app/api/admin/shared-data/route.ts','await request.text()','Dữ liệu dùng chung không được buffer raw body trước khi kiểm kích thước');
must('app/api/admin/shared-data/route.ts','const MAX_BODY_SIZE = 3_800_000','Dữ liệu dùng chung phải giữ trần payload production');
must('lib/server/public-abuse.ts','totalBytes>maxBytes','Bounded parser phải đếm byte thực tế khi stream');
must('lib/server/public-abuse.ts','reader.cancel()','Bounded parser phải dừng đọc khi vượt trần');

if(failures.length){console.error('\nAdmin bounded JSON regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin bounded JSON regression checks passed.');
