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
 ['app/api/admin/customer-vouchers/route.ts','65_536','req','Voucher khách'],
 ['app/api/admin/customer-feedback/route.ts','65_536','req','Phản hồi khách'],
 ['app/api/admin/customer-receipts/route.ts','65_536','req','Phiếu thu'],
 ['app/api/admin/service-operations/route.ts','131_072','req','Điều hành dịch vụ'],
 ['app/api/admin/partners/route.ts','32_768','req','Quản lý đối tác'],
 ['app/api/admin/partner-support/route.ts','65_536','req','Hỗ trợ đối tác'],
 ['app/api/admin/sales-availability/route.ts','32_768','req','Trạng thái nhận khách Sale'],
 ['app/api/admin/crm/route.ts','131_072','req','CRM'],
 ['app/api/admin/crm-history/route.ts','65_536','req','Lịch sử CRM'],
 ['app/api/admin/crm-opportunity/route.ts','131_072','req','Nhu cầu/Báo giá CRM'],
 ['app/api/admin/crm-workflow/route.ts','65_536','req','CRM Workflow'],
 ['app/api/admin/shared-data/route.ts','MAX_BODY_SIZE','request','Dữ liệu dùng chung'],
];

for(const [path,limit,param,label] of routes){
 must(path,"from '@/lib/server/public-abuse'",`${label} phải dùng bounded parser chung`);
 must(path,`requestBodyTooLarge(${param},${limit})`,`${label} phải chặn Content-Length vượt trần sớm`);
 must(path,`readBoundedJson(${param},${limit})`,`${label} phải chặn body chunked vượt trần`);
 must(path,'status:413',`${label} phải trả 413 khi request quá lớn`);
 mustNot(path,`await ${param}.json()`,`${label} không được buffer JSON không giới hạn`);
}

must('app/api/admin/partner-support/route.ts','readBoundedJson(req,32_768)','Cập nhật trạng thái ticket cũng phải có trần riêng');
must('app/api/admin/partners/route.ts','if(!uuid.test(id))','Đối tác phải từ chối UUID sai trước khi gọi PostgreSQL');
must('app/api/admin/partner-support/route.ts','!uuid.test(ticketId)','Ticket hỗ trợ phải từ chối UUID sai trước khi gọi PostgreSQL');
must('app/api/admin/sales-availability/route.ts','if(!uuid.test(staffId))','Trạng thái Sale phải từ chối UUID sai trước khi gọi PostgreSQL');
must('app/api/admin/crm/route.ts','if(!uuid.test(requested))','CRM tạo lead phải chặn Sale UUID sai trước DB');
must('app/api/admin/crm/route.ts','if(next&&Number.isNaN(+new Date(next)))','CRM activity phải chặn thời gian follow-up sai');
must('app/api/admin/crm-opportunity/route.ts','function validDate(value:string)','CRM báo giá phải xác thực ngày trước DB');
must('app/api/admin/crm-opportunity/route.ts','Ngày sử dụng trong nhu cầu không hợp lệ.','Chuyển báo giá sang booking phải bảo vệ dữ liệu ngày legacy');
must('app/api/admin/crm-workflow/route.ts','if(!uuid.test(customerId))return null','CRM Workflow không được gửi UUID sai xuống PostgreSQL');
mustNot('app/api/admin/shared-data/route.ts','await request.text()','Dữ liệu dùng chung không được buffer raw body trước khi kiểm kích thước');
must('app/api/admin/shared-data/route.ts','const MAX_BODY_SIZE = 3_800_000','Dữ liệu dùng chung phải giữ trần payload production');
must('lib/server/public-abuse.ts','totalBytes>maxBytes','Bounded parser phải đếm byte thực tế khi stream');
must('lib/server/public-abuse.ts','reader.cancel()','Bounded parser phải dừng đọc khi vượt trần');

if(failures.length){console.error('\nAdmin bounded JSON regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin bounded JSON regression checks passed.');
