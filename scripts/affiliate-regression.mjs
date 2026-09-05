import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const affiliateApi=read('app/api/admin/affiliates/route.ts');
const assignmentApi=read('app/api/admin/affiliate-assignments/route.ts');
const followupApi=read('app/api/admin/affiliate-followups/route.ts');
const loginApi=read('app/api/affiliate/auth/login/route.ts');
const registerApi=read('app/api/affiliate/auth/register/route.ts');
const affiliateServer=read('lib/server/affiliate.ts');
const workspace=read('components/AdminNetworkWorkspace.tsx');
const manager=read('components/AdminAffiliateManager.tsx');
const applications=read('components/AdminAffiliateApplications.tsx');
const schema=read('db/schema.sql');

check(has(affiliateApi,"adminActor(req,'affiliates')"),'CTV API phải kiểm tra quyền hồ sơ affiliates.');
check(has(affiliateApi,"adminActor(req,'affiliate_finance')"),'CTV API phải tách quyền affiliate_finance.');
check(has(affiliateApi,"financeOnly=canFinance&&!canManage"),'CTV API phải giữ nhánh finance-only độc lập.');
check(has(affiliateApi,'sales_owner_id=${actor.id}'),'CTV API phải giới hạn Sale theo sales_owner_id.');
check(has(affiliateApi,'const canApprove=elevated(actor)'),'CTV API phải tách riêng quyền duyệt trạng thái cho Admin/Owner.');
check(has(affiliateApi,"status=canApprove?requestedStatus:'pending'"),'CTV do Sale tạo phải bị ép về trạng thái Chờ duyệt.');
check(has(affiliateApi,"if(requestedStatus!==String(current.status)&&!canApprove)"),'Server phải chặn Sale tự kích hoạt hoặc khóa CTV.');
check(has(affiliateApi,"Chỉ Admin/Owner được kích hoạt hoặc khóa hồ sơ CTV."),'CTV API phải trả thông báo rõ khi Sale đổi trạng thái trái quyền.');
check(has(affiliateApi,"const staffStatus=status==='active'?'active':status==='blocked'?'locked':'inactive'"),'Trạng thái staff CTV phải được suy ra từ trạng thái hồ sơ affiliate.');
check(has(affiliateApi,"'affiliate','affiliate',${staffStatus},'[\"affiliate\"]'::jsonb"),'CTV tạo từ Admin/Sale phải lưu staff_status đồng bộ ngay khi tạo.');
check(has(affiliateApi,'update staff set phone=${phone||null},status=${staffStatus},updated_at=now()'),'Duyệt/khóa CTV phải đồng bộ staff.status trong cùng câu lệnh cập nhật hồ sơ.');
check(has(affiliateApi,'where id=(select user_id from changed)'),'Đồng bộ staff.status phải đúng staff thuộc hồ sơ CTV vừa thay đổi.');
check(has(affiliateApi,"status==='active'?'affiliate.approve':status==='blocked'?'affiliate.block':'affiliate.pending'"),'Audit trạng thái CTV phải tách duyệt, khóa và trả về chờ duyệt.');
check(has(affiliateApi,'${auditAction}'),'Audit log cập nhật CTV phải dùng action theo thay đổi trạng thái.');
check(has(affiliateApi,'pg_advisory_xact_lock(hashtext(${requestId}))'),'Thanh toán CTV phải giữ advisory lock chống double-submit.');
check(has(affiliateApi,"after_data->>'requestId'=${requestId}"),'Thanh toán CTV phải giữ idempotency bằng requestId.');
check(has(affiliateApi,"status='pending'"),'Luồng payout phải kiểm tra yêu cầu đang chờ trước khi chi.');

check(has(assignmentApi,"if(!elevated(actor))return NextResponse.json({error:'Chỉ Admin/Owner được chuyển Sale phụ trách CTV.'}"),'Phân công CTV phải chỉ cho Admin/Owner.');
check(has(assignmentApi,"where a.sales_owner_id=${actor.id}"),'Sale chỉ được đọc phân công CTV của chính mình.');
check(has(assignmentApi,"'affiliate.assign_sales'"),'Đổi Sale phụ trách phải ghi audit log.');

check(has(followupApi,"where a.sales_owner_id=${actor.id}"),'Lịch chăm sóc phải giới hạn theo CTV được giao cho Sale.');
check(has(followupApi,"String(affiliate.sales_owner_id||'')!==actor.id"),'Server phải chặn Sale ghi chăm sóc ngoài phạm vi.');
check(has(followupApi,"'affiliate.followup.create'"),'Ghi chú chăm sóc phải ghi audit log.');

check(has(registerApi,"'affiliate','affiliate','inactive'"),'CTV tự đăng ký phải tạo staff ở trạng thái inactive.');
check(has(registerApi,"5,'pending' from new_staff"),'CTV tự đăng ký phải tạo hồ sơ affiliate ở trạng thái pending.');
check(has(registerApi,"status:'pending'"),'API đăng ký phải trả trạng thái Chờ duyệt.');
check(has(loginApi,"row.staff_status!=='active'||row.affiliate_status!=='active'"),'Đăng nhập CTV phải chặn staff hoặc affiliate chưa active.');
check(has(loginApi,'setSessionCookie(response,AFFILIATE_SESSION_COOKIE'), 'Chỉ login hợp lệ mới được cấp session CTV.');
check(has(affiliateServer,"a.status='active' and s.status='active' and s.role='affiliate'"),'Session CTV đang tồn tại phải bị vô hiệu ngay khi hồ sơ hoặc staff không còn active.');
check(has(affiliateServer,"select id from affiliates where id=${attr.affiliateId} and status='active'"),'Attribution chỉ được ghi nhận cho CTV đang active.');
check(has(affiliateServer,"ar.status='pending' and a.status='active' and b.status='completed'"),'Hoa hồng chỉ được ghi có cho CTV active và booking completed.');

check(has(workspace,"access.canAffiliates||access.canAffiliateFinance"),'Finance-only phải vào được tab CTV/Affiliate.');
check(has(workspace,"access.canAffiliates&&<><AdminAffiliateAssignments/><AdminAffiliateFollowups/></>"),'Finance-only không được thấy phân công Sale và lịch chăm sóc.');
check(has(workspace,'<AdminAffiliateManager canManage={access.canAffiliates} canFinance={access.canAffiliateFinance}/>'),'Workspace phải truyền riêng quyền hồ sơ và tài chính.');

check(has(manager,'approvalAllowed=Boolean(data?.approvalAccess)'),'UI CTV phải nhận riêng quyền duyệt trạng thái.');
check(has(manager,"status:'pending'"),'UI Sale tạo CTV phải gửi trạng thái Chờ duyệt.');
check(has(manager,'approvalAllowed&&<button'),'Nút kích hoạt/khóa CTV chỉ được hiển thị cho Admin/Owner.');
check(has(manager,'financeOnly=financeAllowed&&!manageAllowed'),'UI CTV phải nhận diện chế độ finance-only.');
check(has(manager,'payoutLock.current'),'UI thanh toán phải giữ synchronous lock chống double-click.');
check(has(manager,'const requestId=crypto.randomUUID()'),'UI thanh toán phải gửi requestId duy nhất.');

check(has(applications,'if(!canApprove)return null'),'Hàng chờ duyệt CTV phải ẩn hoàn toàn với Sale.');
check(has(applications,'Boolean(d.approvalAccess)'),'Hàng chờ duyệt phải dựa trên quyền duyệt do server trả về.');
check(has(applications,"salesOwnerName?:string"),'Hàng chờ duyệt phải nhận thông tin Sale phụ trách từ API.');
check(has(applications,"Sale phụ trách: <b>{a.salesOwnerName||'Chưa phân công'}</b>"),'Admin phải thấy Sale phụ trách ngay trên hồ sơ CTV chờ duyệt.');

check(has(schema,'affiliate_followups'),'Schema repo phải chứa bảng affiliate_followups.');
check(has(schema,'sales_owner_id'),'Schema repo phải chứa ownership Sale cho CTV.');

if(failures.length){
 console.error('\nCTV / Affiliate regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV / Affiliate regression OK: ownership, Admin approval audit, staff/login state, Sale owner visibility, finance permissions, follow-up scope and payout idempotency are guarded.');
