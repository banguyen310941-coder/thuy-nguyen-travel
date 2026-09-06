import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const api=read('app/api/admin/affiliates/route.ts');
const pkg=read('package.json');

check(has(api,"const payoutLockKey=`affiliate-payout:${id}`"),'Thanh toán trực tiếp phải khóa theo CTV trước khi khóa requestId.');
check(has(api,'select pg_advisory_xact_lock(hashtext(${payoutLockKey}))'),'Luồng payout phải dùng advisory lock theo CTV.');
check(has(api,'select pg_advisory_xact_lock(hashtext(${requestId})) from lock_affiliate'),'Direct payout phải khóa requestId sau khóa CTV để tránh deadlock thứ tự khóa.');
check(has(api,'a.balance+${amount} as balance_before,a.balance as balance_after'),'Direct payout phải ghi nhận số dư trước/sau ngay trong debit.');
check(has(api,"ar.status='approved' and d.balance_after=0"),'Direct payout phải cập nhật referral paid trong cùng statement khi số dư về 0.');
check(has(api,"'affiliate.payout','affiliate',i.affiliate_id::text"),'Direct payout phải ghi audit trong cùng CTE với payout.');
check(has(api,"'balanceAfter',d.balance_after"),'Audit direct payout phải lưu số dư sau giao dịch.');
check(!has(api,'if(remainingBalance===0)await sql`update affiliate_referrals'),'Không được để cập nhật referral paid ngoài statement payout.');

check(has(api,"const affiliateId=String(payoutScope.affiliate_id),payoutLockKey=`affiliate-payout:${affiliateId}`"),'Resolve payout phải khóa cùng key theo CTV.');
check(has(api,"'affiliate.payout.cancel','affiliate',c.affiliate_id::text"),'Hủy payout phải ghi audit từ chính CTE thay đổi trạng thái.');
check(has(api,"jsonb_build_object('payoutId',c.id::text,'amount',c.amount,'status','pending')"),'Audit hủy payout phải lưu trạng thái trước pending.');
check(has(api,"jsonb_build_object('payoutId',c.id::text,'amount',c.amount,'status','cancelled','balanceChanged',false)"),'Audit hủy payout phải lưu trạng thái sau và xác nhận không đổi số dư.');
check(!has(api,"await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'affiliate.payout.cancel'"),'Audit hủy payout không được chạy bằng câu SQL riêng sau update.');

check(has(api,"'affiliate.payout.approve','affiliate',f.affiliate_id::text"),'Duyệt payout phải ghi audit trong cùng statement với debit và finish.');
check(has(api,"'balanceBefore',f.balance_before"),'Audit duyệt payout phải lưu số dư trước giao dịch.');
check(has(api,"'balanceAfter',f.balance_after"),'Audit duyệt payout phải lưu số dư sau giao dịch.');
check(has(api,"ar.status='approved' and f.balance_after=0"),'Resolve paid phải cập nhật referral paid trong cùng statement khi số dư về 0.');
check(!has(api,'const remainingBalance=Number(paid[0].balance'),'Resolve paid không được tách logic remaining balance ra khỏi statement nguyên tử.');
check(!has(api,"await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'affiliate.payout.approve'"),'Audit duyệt payout không được chạy bằng câu SQL riêng sau debit.');

check(has(pkg,'affiliate-payout-atomic-regression.mjs'),'Regression payout atomicity phải được chạy trong test:affiliate.');

if(failures.length){
 console.error('\nCTV Payout Atomicity regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV Payout Atomicity regression OK: affiliate/request locking, atomic status/debit/referral updates and before/after audit are guarded.');
