import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const api=read('app/api/affiliate/dashboard/route.ts');
const ui=read('components/AffiliateDashboard.tsx');
const pkg=read('package.json');

check(has(api,'const profileLockKey=`affiliate-payout:${actor.id}`'),'Cập nhật hồ sơ phải dùng cùng khóa payout theo CTV.');
check(has(api,'const profileResults=await sql.transaction(['),'Cập nhật hồ sơ phải chạy trong transaction có advisory lock.');
check(has(api,'pg_advisory_xact_lock(hashtext(${profileLockKey}))'),'Transaction hồ sơ phải khóa CTV trước khi đọc trạng thái pending.');
check(has(api,"select id from commission_payouts where affiliate_id=${actor.id} and status='pending' limit 1"),'Cập nhật hồ sơ phải kiểm tra payout pending sau khi đã khóa CTV.');
check(has(api,'as bank_changed'),'Server phải xác định thay đổi bộ thông tin ngân hàng.');
check(has(api,'not(e.has_pending and e.bank_changed)'),'Server phải chặn đổi ngân hàng trong lúc payout pending.');
check(has(api,'staff_changed as ('),'SĐT staff phải được đồng bộ trong cùng statement hồ sơ.');
check(has(api,'logged as ('),'Audit hồ sơ phải nằm trong cùng statement với update.');
check(has(api,"'affiliate.profile.update','affiliate',e.id::text"),'Audit hồ sơ phải gắn đúng affiliate vừa cập nhật.');
check(has(api,"'***'||right(e.bank_account,4)"),'Audit trước thay đổi chỉ được lưu 4 số cuối tài khoản.');
check(has(api,'maskedAccount(bankAccount)'),'Audit sau thay đổi phải che số tài khoản mới.');
check(!has(api,'const previous=(await sql`select phone,zalo,bank_name,bank_account,account_holder'),'Không được quay lại mô hình đọc trước rồi audit bằng statement rời.');
check(has(api,"if(result?.has_pending&&result?.bank_changed)return NextResponse.json"),'API phải trả lỗi rõ khi CTV cố đổi ngân hàng lúc payout pending.');

check(has(api,'select id,amount,status,payout_date,receipt_url,created_at,updated_at from commission_payouts'),'Dashboard phải đọc updated_at của payout để hiển thị thời điểm xử lý.');
check(has(api,"order by case when status='pending' then 0 else 1 end,created_at desc"),'Payout pending phải luôn được ưu tiên trên đầu lịch sử CTV.');
check(has(api,"resolvedAt:String(p.status)==='pending'?'':String(p.updated_at||p.payout_date||'')"),'API phải trả thời điểm xử lý cho payout không còn pending.');
check(has(api,"'bankName',p.bank_name"),'Audit yêu cầu rút phải snapshot ngân hàng tại thời điểm gửi.');
check(has(api,"'bankAccount',case when coalesce(p.bank_account,'')='' then '' else '***'||right(p.bank_account,4) end"),'Snapshot payout không được lưu nguyên số tài khoản.');
check(has(api,"'accountHolder',p.account_holder"),'Audit yêu cầu rút phải snapshot chủ tài khoản.');

check(has(ui,'profileLock=useRef(false)'),'UI hồ sơ phải có khóa đồng bộ chống double-submit.');
check(has(ui,'if(profileLock.current)return'),'Lưu hồ sơ phải thoát ngay nếu đang có request trước đó.');
check(has(ui,'const bankLocked=Boolean(pendingPayout)'),'UI phải suy ra trạng thái khóa ngân hàng từ payout pending.');
check(has(ui,'disabled={bankLocked}'),'Các trường ngân hàng phải bị vô hiệu khi payout đang pending.');
check(has(ui,'Bạn vẫn có thể cập nhật SĐT/Zalo.'),'UI phải giải thích vẫn cho phép cập nhật thông tin liên hệ.');
check(has(ui,'Thông tin ngân hàng được khóa cho đến khi yêu cầu này hoàn tất hoặc bị hủy.'),'CTV phải thấy lý do tài khoản nhận tiền bị khóa.');
check(has(ui,'↻ Làm mới trạng thái'),'CTV phải có nút refresh payout chủ động.');
check(has(ui,'p.resolvedAt&&<small>Xử lý'),'Lịch sử payout phải hiển thị thời điểm xử lý.');
check(has(ui,"data.payouts.filter(p=>p.status==='paid').length"),'UI phải tổng hợp số payout đã thanh toán.');
check(has(ui,"data.payouts.filter(p=>p.status==='cancelled').length"),'UI phải tổng hợp số payout đã hủy.');
check(has(pkg,'affiliate-selfservice-finance-regression.mjs'),'Regression self-service finance phải được chạy trong test:affiliate.');

if(failures.length){
 console.error('\nCTV Self-service Finance regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV Self-service Finance regression OK: atomic profile audit, payout-bank locking, contact-only edits during pending payout, payout resolution timestamps and UI refresh are guarded.');
