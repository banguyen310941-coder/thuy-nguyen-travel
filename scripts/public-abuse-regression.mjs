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

if(failures.length){console.error('\nPublic abuse regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public abuse regression checks passed.');
