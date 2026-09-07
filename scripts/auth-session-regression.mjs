import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

must('lib/server/portal-auth.ts',"if(kind==='admin')return 12*HOUR",'Phiên Admin mới phải giới hạn 12 giờ');
must('lib/server/portal-auth.ts',"if(kind==='partner'||kind==='affiliate')return 7*DAY",'Phiên portal đặc quyền khác phải ngắn hơn tài khoản khách');
must('lib/server/portal-auth.ts','iat:now','Token mới phải ghi thời điểm phát hành');
must('lib/server/portal-auth.ts','payload.exp-payload.iat>maxAge+60','Server phải từ chối token vượt quá tuổi tối đa');
must('lib/server/portal-auth.ts',"kind==='admin'&&payload.exp-now>maxAge+60",'Admin token legacy 30 ngày phải bị xoay vòng sau deploy');
must('lib/server/portal-auth.ts','const maxAge=sessionMaxAge(kind)','Cookie phải dùng TTL theo loại portal');

must('app/api/admin/auth/login/route.ts','requestBodyTooLarge(req,8192)','Admin login phải chặn body quá lớn');
must('app/api/admin/auth/login/route.ts',"origin&&origin!==req.nextUrl.origin",'Admin login phải chặn browser cross-origin');
must('app/api/admin/auth/login/route.ts',"publicRateKey(req,'admin-login')",'Admin login phải có limiter burst theo nguồn');
must('app/api/admin/auth/login/route.ts','maxHits:30,windowMinutes:15','Admin login phải có ngưỡng burst');
must('app/api/admin/auth/login/route.ts',"headers:{'Retry-After':'900'}",'Admin login 429 phải hướng dẫn thời gian retry');

must('app/api/admin/auth/bootstrap/route.ts','timingSafeEqual(a,b)','Bootstrap phải so sánh khóa nội bộ constant-time');
must('app/api/admin/auth/bootstrap/route.ts','requestBodyTooLarge(req,8192)','Bootstrap phải chặn body quá lớn');

must('app/api/account/route.ts','Hồ sơ khách hàng với SĐT hoặc email này đã tồn tại','Đăng ký khách mới không được tự claim hồ sơ CRM cũ');
mustNot('app/api/account/route.ts','update customers set name=${name},phone=${phone},email=${email}','Đăng ký public không được sửa thông tin hồ sơ khách cũ');
must('app/api/account/route.ts',"source='customer_account' and not exists(select 1 from customer_accounts",'Đăng ký lỗi đồng thời phải dọn customer tạm chưa có account');
must('app/api/account/route.ts',"text.includes('customers_phone_unique')",'Race đăng ký trùng SĐT phải trả conflict thay vì lỗi 500');
must('app/api/account/route.ts',"text.includes('customer_accounts_email_key')",'Race đăng ký trùng email phải trả conflict thay vì lỗi 500');

if(failures.length){console.error('\nAuth/session regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Auth/session regression checks passed.');
