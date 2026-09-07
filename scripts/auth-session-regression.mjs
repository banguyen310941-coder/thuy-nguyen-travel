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
must('lib/server/portal-auth.ts','const MAX_SESSION_TOKEN_LENGTH=2048','Session cookie phải có trần kích thước tổng');
must('lib/server/portal-auth.ts','const MAX_SESSION_BODY_LENGTH=1536','Session body phải có trần trước khi decode');
must('lib/server/portal-auth.ts','const SESSION_SIGNATURE_LENGTH=43','Chữ ký HMAC base64url phải có độ dài cố định');
must('lib/server/portal-auth.ts','if(!token||token.length>MAX_SESSION_TOKEN_LENGTH)return null','Token quá lớn phải bị loại trước xác thực');
must('lib/server/portal-auth.ts','if(parts.length!==2)return null','Session phải đúng cấu trúc body.signature');
must('lib/server/portal-auth.ts','body.length>MAX_SESSION_BODY_LENGTH||sig.length!==SESSION_SIGNATURE_LENGTH','Body/signature sai kích thước phải bị loại');
must('lib/server/portal-auth.ts','if(!BASE64URL.test(body)||!BASE64URL.test(sig))return null','Session phải chỉ chứa base64url hợp lệ');
const portalAuth=read('lib/server/portal-auth.ts');
const envelopeIndex=portalAuth.indexOf('if(!token||token.length>MAX_SESSION_TOKEN_LENGTH)return null');
const hmacIndex=portalAuth.indexOf("const expected=createHmac('sha256',secret()).update(body).digest('base64url')",portalAuth.indexOf('export function readSession'));
if(envelopeIndex<0||hmacIndex<0||envelopeIndex>hmacIndex)failures.push('Session envelope phải được kiểm kích thước trước khi chạy HMAC');

must('app/api/admin/auth/login/route.ts','requestBodyTooLarge(req,8192)','Admin login phải chặn body quá lớn');
must('app/api/admin/auth/login/route.ts',"origin&&origin!==req.nextUrl.origin",'Admin login phải chặn browser cross-origin');
must('app/api/admin/auth/login/route.ts',"publicRateKey(req,'admin-login')",'Admin login phải có limiter burst theo nguồn');
must('app/api/admin/auth/login/route.ts','maxHits:30,windowMinutes:15','Admin login phải có ngưỡng burst');
must('app/api/admin/auth/login/route.ts',"headers:{'Retry-After':'900'}",'Admin login 429 phải hướng dẫn thời gian retry');

must('app/api/admin/auth/bootstrap/route.ts','timingSafeEqual(a,b)','Bootstrap phải so sánh khóa nội bộ constant-time');
must('app/api/admin/auth/bootstrap/route.ts','requestBodyTooLarge(req,8192)','Bootstrap phải chặn body quá lớn');

must('app/api/account/route.ts','Hồ sơ khách hàng với SĐT hoặc email này đã tồn tại','Đăng ký khách mới không được tự claim hồ sơ CRM cũ');
mustNot('app/api/account/route.ts','update customers set name=${name},phone=${phone},email=${email}','Đăng ký public không được sửa thông tin hồ sơ khách cũ');
must('app/api/account/route.ts','new_customer as (','Customer mới phải được tạo trong statement đăng ký atomic');
must('app/api/account/route.ts','new_account as (','Customer account phải được tạo trong cùng statement với customer');
must('app/api/account/route.ts',"throw new Error('CUSTOMER_ACCOUNT_ATOMIC_REGISTER_FAILED')",'Đăng ký phải fail kín nếu account không được tạo cùng customer');
mustNot('app/api/account/route.ts','let provisionalCustomerId','Không được quay lại mô hình tạo customer rồi cleanup thủ công');
must('app/api/account/route.ts',"text.includes('customers_phone_unique')",'Race đăng ký trùng SĐT phải trả conflict thay vì lỗi 500');
must('app/api/account/route.ts',"text.includes('customer_accounts_email_key')",'Race đăng ký trùng email phải trả conflict thay vì lỗi 500');

if(failures.length){console.error('\nAuth/session regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Auth/session regression checks passed.');
