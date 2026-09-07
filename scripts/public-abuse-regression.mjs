import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

must('lib/server/public-abuse.ts','publicRateKey','Phải có fingerprint rate-limit dùng chung');
must('lib/server/public-abuse.ts','requestBodyTooLarge','Phải chặn body public quá lớn trước khi parse');
must('lib/server/public-abuse.ts','pg_advisory_xact_lock','Rate limit phải atomic khi nhiều request đồng thời');
must('lib/server/public-abuse.ts',"entity_type='public_rate_limit'",'Rate limit phải lưu bền qua audit_logs thay vì memory serverless');
must('lib/server/public-abuse.ts','created_at>now()-(${windowMinutes}::int*interval \'1 minute\')','Rate limit phải có cửa sổ thời gian server-side');

must('app/api/bookings/route.ts','requestBodyTooLarge(req)','Booking phải giới hạn kích thước request');
must('app/api/bookings/route.ts',"publicRateKey(req,'booking')",'Booking phải giới hạn theo nguồn request');
must('app/api/bookings/route.ts',"publicRateKey(req,'booking-phone',phone)",'Booking phải có limiter riêng theo số điện thoại + nguồn request');
must('app/api/bookings/route.ts','maxHits:8,windowMinutes:15','Booking phải chặn burst theo nguồn');
must('app/api/bookings/route.ts','maxHits:3,windowMinutes:10','Booking phải chặn gửi lặp nhanh cùng số điện thoại');
must('app/api/bookings/route.ts',"status:429,headers:{'Retry-After':'900'}",'Booking bị giới hạn phải trả 429 + Retry-After');
must('app/api/bookings/route.ts',"String(body.website||'').trim()",'Booking phải có honeypot tương thích form public');

for(const path of ['components/BookingInquiry.tsx','components/TourBookingInquiry.tsx']){
 must(path,'name="website"','Form booking phải render honeypot ẩn thật');
 must(path,"website:String(data.get('website')||'')",'Form booking phải gửi honeypot lên server');
 must(path,'const result=await response.json().catch(()=>({}))','Form booking phải đọc lỗi API để hiển thị đúng cho khách');
 must(path,'if(response.status<500)','Lỗi 4xx/429 không được bị hiểu nhầm thành mất mạng');
 must(path,"setMessage(String(result.error||'Không thể gửi yêu cầu lúc này. Vui lòng kiểm tra thông tin và thử lại.'))",'Form booking phải hiển thị thông báo server khi bị giới hạn hoặc dữ liệu sai');
}

must('app/api/newsletter/route.ts','requestBodyTooLarge(req,8192)','Newsletter phải giới hạn kích thước request');
must('app/api/newsletter/route.ts',"publicRateKey(req,'newsletter')",'Newsletter phải giới hạn burst theo nguồn');
must('app/api/newsletter/route.ts',"publicRateKey(req,'newsletter-email',email)",'Newsletter phải giới hạn gửi lặp theo email + nguồn');
must('app/api/newsletter/route.ts','maxHits:20,windowMinutes:15','Newsletter phải có ngưỡng burst hợp lý');
must('app/api/newsletter/route.ts','maxHits:5,windowMinutes:15','Newsletter phải chặn lặp email nhanh');
must('app/api/newsletter/route.ts',"source','public_unsubscribe'",'Luồng unsubscribe phải được giữ nguyên và không phụ thuộc limiter subscribe');

must('app/api/account/route.ts','requestBodyTooLarge(req,8192)','Tài khoản khách phải chặn body quá lớn');
must('app/api/account/route.ts',"publicRateKey(req,'customer-register')",'Đăng ký khách phải giới hạn theo nguồn');
must('app/api/account/route.ts','maxHits:12,windowMinutes:60','Đăng ký khách phải có ngưỡng theo giờ');
must('app/api/account/route.ts',"publicRateKey(req,'customer-register-email',email)",'Đăng ký khách phải giới hạn lặp theo email');
must('app/api/account/route.ts',"publicRateKey(req,'customer-login')",'Đăng nhập khách phải chặn burst');
must('app/api/account/route.ts','maxHits:40,windowMinutes:15','Đăng nhập khách phải có ngưỡng burst đủ rộng cho người thật');

for(const prefix of ['partner','affiliate']){
 const register=`app/api/${prefix}/auth/register/route.ts`,login=`app/api/${prefix}/auth/login/route.ts`;
 must(register,'requestBodyTooLarge(req,8192)',`${prefix} register phải chặn body quá lớn`);
 must(register,`publicRateKey(req,'${prefix}-register')`,`${prefix} register phải giới hạn theo nguồn`);
 must(register,'maxHits:6,windowMinutes:60',`${prefix} register phải có ngưỡng theo giờ`);
 must(register,`publicRateKey(req,'${prefix}-register-email',email)`,`${prefix} register phải giới hạn lặp theo email`);
 must(login,'requestBodyTooLarge(req,8192)',`${prefix} login phải chặn body quá lớn`);
 must(login,`publicRateKey(req,'${prefix}-login')`,`${prefix} login phải chặn burst theo nguồn`);
 must(login,'maxHits:30,windowMinutes:15',`${prefix} login phải có ngưỡng burst`);
 must(login,"headers:{'Retry-After':'900'}",`${prefix} login 429 phải trả Retry-After`);
}

// Partner email is not guaranteed unique in the legacy table, so registration must
// serialize same-email requests and create partner + account in one SQL statement.
must('app/api/partner/auth/register/route.ts','pg_advisory_xact_lock(hashtext(${email}::text))','Đăng ký đối tác phải khóa đồng thời theo email');
must('app/api/partner/auth/register/route.ts','where not exists(select 1 from existing)','Đăng ký đối tác không được tạo bản ghi trùng sau khi giữ lock');
must('app/api/partner/auth/register/route.ts','new_account as (','Partner và partner_accounts phải tạo trong cùng statement');
must('app/api/partner/auth/register/route.ts','PARTNER_REGISTER_ATOMIC_FAILED','Đăng ký đối tác phải fail kín nếu account không tạo cùng partner');

// Private account/admin/partner/affiliate responses must never be cached by browser,
// proxy or CDN even if an individual route forgets to declare its own cache policy.
must('middleware.ts',"const PRIVATE_API_PREFIXES=['/api/admin','/api/account','/api/partner','/api/affiliate']",'Middleware phải nhận diện toàn bộ API private');
must('middleware.ts',"response.headers.set('Cache-Control','private, no-store, max-age=0, must-revalidate')",'API private phải có Cache-Control no-store');
must('middleware.ts',"response.headers.set('Pragma','no-cache')",'API private phải có header tương thích proxy cũ');
must('middleware.ts','return passThrough(req)','Luồng hợp lệ phải đi qua helper gắn cache guard');

if(failures.length){console.error('\nPublic abuse regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public abuse regression checks passed.');
