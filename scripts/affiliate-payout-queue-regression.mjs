import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const api=read('app/api/admin/affiliate-payout-decisions/route.ts');
const ui=read('components/AdminAffiliatePayoutQueue.tsx');
const workspace=read('components/AdminNetworkWorkspace.tsx');
const pkg=read('package.json');

check(has(api,"adminActor(req,'affiliate_finance')"),'API quyết định payout phải yêu cầu quyền affiliate_finance.');
check(has(api,"const profileActor=await adminActor(req,'affiliates')"),'API payout phải phân biệt finance-only với tài khoản quản lý CTV.');
check(has(api,'canSeeAll=elevated(actor)||financeOnly'),'Scope payout phải giữ quy tắc Admin/Owner hoặc finance-only xem toàn bộ.');
check(has(api,'where cp.id=${payoutId} and a.sales_owner_id=${actor.id} limit 1'),'Sale có quyền tài chính chỉ được xử lý payout CTV được giao.');
check(has(api,"if(!uuid.test(requestId))"),'API quyết định payout phải bắt buộc requestId UUID.');
check(has(api,"const affiliateId=String(payoutScope.affiliate_id),payoutLockKey=`affiliate-payout:${affiliateId}`"),'API quyết định payout phải khóa theo CTV.');
check(has(api,'select pg_advisory_xact_lock(hashtext(${requestId})) from lock_affiliate'),'API payout phải khóa requestId sau khóa CTV.');
check(has(api,"al.after_data->>'requestId'=${requestId}"),'API payout phải phát hiện retry theo requestId đã audit.');
check(has(api,"'decision','cancelled','requestId',${requestId}"),'Audit hủy payout phải lưu decision và requestId.');
check(has(api,"'decision','paid','requestId',${requestId}"),'Audit duyệt payout phải lưu decision và requestId.');
check(has(api,"'balanceChanged',false"),'Hủy payout phải ghi rõ không thay đổi số dư.');
check(has(api,"update affiliates a set balance=a.balance-t.amount"),'Duyệt payout phải trừ số dư có điều kiện.');
check(has(api,"ar.status='approved' and f.balance_after=0"),'Duyệt payout phải cập nhật referral paid trong cùng statement khi balance về 0.');
check(has(api,"if(result?.existing_action)"),'Retry requestId phải được xử lý trước khi báo conflict trạng thái.');
check(has(api,"idempotent:true"),'Retry cùng payout/decision/requestId phải trả thành công idempotent.');
check(has(api,"Mã requestId này đã được dùng cho quyết định payout khác."),'Reuse requestId cho quyết định khác phải bị từ chối.');

check(has(ui,"fetch('/api/admin/affiliates'"),'Hàng chờ payout phải lấy dữ liệu payout production.');
check(has(ui,"filter(p=>p.status==='pending')"),'UI payout chỉ đưa pending vào hàng chờ.');
check(has(ui,'pending.reduce((total,p)=>total+p.amount,0)'),'UI payout phải tổng hợp tổng tiền đang chờ.');
check(has(ui,'payout.bankAccount'),'UI xác nhận payout phải dùng tài khoản nhận tiền.');
check(has(ui,'decisionLocks.current.has(payout.id)'),'UI phải có synchronous lock theo payout chống double-click.');
check(has(ui,'const requestId=crypto.randomUUID()'),'Mỗi quyết định payout phải tạo requestId riêng.');
check(has(ui,"fetch('/api/admin/affiliate-payout-decisions'"),'UI payout phải dùng endpoint quyết định chuyên biệt.');
check(has(ui,"decision==='paid'"),'UI phải hỗ trợ duyệt payout.');
check(has(ui,"resolve(p,'cancelled')"),'UI phải hỗ trợ hủy payout.');
check(has(ui,'window.confirm(text)'),'Duyệt/hủy payout phải có xác nhận người dùng.');
check(has(ui,"document.addEventListener('visibilitychange',visibility)"),'Hàng chờ payout phải refresh khi quay lại tab.');
check(has(ui,'request.current'),'UI payout phải bỏ response cũ khi refresh chồng nhau.');
check(has(ui,'aria-live="polite"'),'Thông báo payout phải hỗ trợ công nghệ trợ năng.');

check(has(workspace,"import {AdminAffiliatePayoutQueue}"),'Workspace phải import hàng chờ payout.');
check(has(workspace,'{access.canAffiliateFinance&&<AdminAffiliatePayoutQueue/>}'),'Hàng chờ payout chỉ hiển thị khi có quyền affiliate_finance.');
check(has(workspace,'access.canAffiliates&&<><AdminAffiliateAssignments/><AdminAffiliatePerformance/><AdminAffiliateFollowups/></>'),'Finance-only vẫn không được thấy CRM/Sale/Performance.');
check(has(pkg,'affiliate-payout-queue-regression.mjs'),'Regression hàng chờ payout phải được chạy trong test:affiliate.');

if(failures.length){
 console.error('\nCTV Payout Queue regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV Payout Queue regression OK: finance scope, idempotent decisions, atomic payout updates, bank visibility, UI locking and workspace permissions are guarded.');
