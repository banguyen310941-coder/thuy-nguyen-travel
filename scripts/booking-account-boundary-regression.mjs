import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const booking='app/api/bookings/route.ts';
const account='app/api/account/route.ts';

must(booking,"let customerId='',accountId='';let accountLinked=false",'Booking phải mặc định chưa liên kết tài khoản');
must(booking,'accountLinked=true;accountId=String(account.account_id)','Chỉ session customer active mới được đánh dấu linked');
must(booking,"const accountAction=accountLinked?'booking.account.linked':'booking.account.unverified'",'Booking phải phân biệt linked và guest unverified');
must(booking,"insert into audit_logs(action,entity_type,entity_id,after_data)", 'Marker account phải được ghi cùng statement tạo booking');
must(booking,"select ${accountAction},'booking_account',id::text",'Marker phải gắn đúng booking vừa tạo');
must(booking,"throw new Error('BOOKING_CREATE_ATOMIC_FAILED')",'Booking phải fail kín nếu statement không trả booking');
must(booking,'accountLinked,affiliateTracked:Boolean(affiliateReferralId)','Response phải phản ánh trạng thái account đã xác minh thật');
mustNot(booking,'accountLinked:Boolean(session)','Không được coi cookie/session chưa resolve là account hợp lệ');

must(account,"al.entity_type='booking_account'",'Lịch sử tài khoản phải đọc marker verification của booking');
must(account,"al.action in ('booking.account.linked','booking.account.unverified')",'Lịch sử phải hiểu cả linked và unverified');
must(account,"order by al.created_at desc,al.id desc",'Lịch sử phải dùng marker mới nhất để hỗ trợ xác minh sau này');
must(account,"'booking.account.legacy')<>'booking.account.unverified'",'Guest booking mới phải bị ẩn nhưng booking legacy vẫn được giữ');
must(account,'with existing_customer as (','Đăng ký account phải kiểm hồ sơ cũ trong cùng statement');
must(account,'new_customer as (','Customer mới phải tạo trong statement atomic');
must(account,'new_account as (','Customer account phải tạo cùng statement với customer');
must(account,"throw new Error('CUSTOMER_ACCOUNT_ATOMIC_REGISTER_FAILED')",'Đăng ký phải fail kín nếu account không tạo atomically');
mustNot(account,'let provisionalCustomerId','Không được quay lại cleanup thủ công giữa hai statement đăng ký');

if(failures.length){console.error('\nBooking/account boundary regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Booking/account boundary regression checks passed.');
