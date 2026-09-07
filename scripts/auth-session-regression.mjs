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
must('lib/server/portal-auth.ts','ver?:string','Session payload phải hỗ trợ security version đã ký');
must('lib/server/portal-auth.ts','payload.ver=version','Security version phải nằm trong phần payload được HMAC');
must('lib/server/portal-auth.ts',"setSessionCookie(response:NextResponse,cookieName:string,kind:PortalKind,id:string,version='')",'Cookie helper phải nhận security version tùy chọn');
must('lib/server/portal-auth.ts',"const SESSION_KEY_CONTEXT='happygo:portal-session:v1'",'Fallback session key phải có context riêng');
must('lib/server/portal-auth.ts',"const authSecret=process.env.AUTH_SECRET?.trim()",'Session phải ưu tiên AUTH_SECRET riêng');
must('lib/server/portal-auth.ts',"createHmac('sha256',adminApiKey).update(SESSION_KEY_CONTEXT).digest()",'Fallback ADMIN_API_KEY phải được derive trước khi ký session');
mustNot('lib/server/portal-auth.ts','process.env.AUTH_SECRET?.trim()||process.env.ADMIN_API_KEY?.trim()','Session không được dùng trực tiếp cùng một khóa cho AUTH và Admin API');
const portalAuth=read('lib/server/portal-auth.ts');
const envelopeIndex=portalAuth.indexOf('if(!token||token.length>MAX_SESSION_TOKEN_LENGTH)return null');
const hmacIndex=portalAuth.indexOf("const expected=createHmac('sha256',secret()).update(body).digest('base64url')",portalAuth.indexOf('export function readSession'));
if(envelopeIndex<0||hmacIndex<0||envelopeIndex>hmacIndex)failures.push('Session envelope phải được kiểm kích thước trước khi chạy HMAC');

must('lib/server/admin-access.ts','floor(extract(epoch from updated_at)*1000)::bigint as session_version','Admin actor phải đọc version từ staff.updated_at');
must('lib/server/admin-access.ts','if(session.ver!==currentVersion)return null','Session Admin mới phải bị thu hồi ngay khi staff version thay đổi');
must('lib/server/admin-access.ts','updatedAtSeconds>session.iat','Session cũ chưa có version vẫn phải bị thu hồi nếu hồ sơ đổi sau lúc phát token');

must('app/api/admin/auth/login/route.ts','requestBodyTooLarge(req,8192)','Admin login phải chặn body quá lớn');
must('app/api/admin/auth/login/route.ts',"origin&&origin!==req.nextUrl.origin",'Admin login phải chặn browser cross-origin');
must('app/api/admin/auth/login/route.ts',"publicRateKey(req,'admin-login')",'Admin login phải có limiter burst theo nguồn');
must('app/api/admin/auth/login/route.ts','maxHits:30,windowMinutes:15','Admin login phải có ngưỡng burst');
must('app/api/admin/auth/login/route.ts',"headers:{'Retry-After':'900'}",'Admin login 429 phải hướng dẫn thời gian retry');
must('app/api/admin/auth/login/route.ts','as session_version from staff','Admin login phải lấy security version cùng bản ghi xác thực');
must('app/api/admin/auth/login/route.ts',"setSessionCookie(response,COOKIE,'admin',String(row.id),String(row.session_version))",'Admin login phải ký security version vào cookie');

must('app/api/admin/auth/bootstrap/route.ts','timingSafeEqual(a,b)','Bootstrap phải so sánh khóa nội bộ constant-time');
must('app/api/admin/auth/bootstrap/route.ts','requestBodyTooLarge(req,8192)','Bootstrap phải chặn body quá lớn');
must('app/api/admin/auth/bootstrap/route.ts','as session_version','Bootstrap phải lấy security version của owner vừa tạo');
must('app/api/admin/auth/bootstrap/route.ts',"setSessionCookie(response,COOKIE,'admin',String(staff.id),String(staff.session_version))",'Bootstrap phải tạo versioned Admin session');

must('app/api/admin/auth/me/route.ts',"import {adminActor} from '@/lib/server/admin-access'",'Admin /me phải đi qua revocation guard dùng chung');
mustNot('app/api/admin/auth/me/route.ts',"readSession(req,'happygo_admin_auth','admin')",'Admin /me không được bypass revocation guard');
must('app/api/admin/staff/route.ts',"import {adminActor} from '@/lib/server/admin-access'",'Quản lý nhân viên phải đi qua revocation guard');
must('app/api/admin/staff/route.ts','updated_at=now()','Thay đổi staff phải bump security version');
must('app/api/admin/staff/route.ts','readBoundedJson(req,16384)','Staff write phải dùng bounded JSON parser');
mustNot('app/api/admin/staff/route.ts','await req.json()','Staff write không được buffer JSON không giới hạn');

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
