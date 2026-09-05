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
const affiliateDashboardApi=read('app/api/affiliate/dashboard/route.ts');
const affiliateServer=read('lib/server/affiliate.ts');
const workspace=read('components/AdminNetworkWorkspace.tsx');
const manager=read('components/AdminAffiliateManager.tsx');
const applications=read('components/AdminAffiliateApplications.tsx');
const followupsUi=read('components/AdminAffiliateFollowups.tsx');
const affiliateDashboardUi=read('components/AffiliateDashboard.tsx');
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
check(has(affiliateApi,'const payoutScope=canSeeAll'),'Resolve payout phải tách nhánh scope toàn hệ thống và scope Sale.');
check(has(affiliateApi,'where cp.id=${payoutId} and a.sales_owner_id=${actor.id} limit 1'),'Sale chỉ được resolve payout của CTV đang được giao.');
check(!has(affiliateApi,'(${canSeeAll} or a.sales_owner_id=${actor.id})'),'Resolve payout không được nội suy boolean canSeeAll trực tiếp vào SQL.');

check(has(assignmentApi,"if(!elevated(actor))return NextResponse.json({error:'Chỉ Admin/Owner được chuyển Sale phụ trách CTV.'}"),'Phân công CTV phải chỉ cho Admin/Owner.');
check(has(assignmentApi,"where a.sales_owner_id=${actor.id}"),'Sale chỉ được đọc phân công CTV của chính mình.');
check(has(assignmentApi,"'affiliate.assign_sales'"),'Đổi Sale phụ trách phải ghi audit log.');

check(has(followupApi,"where a.sales_owner_id=${actor.id}"),'Lịch chăm sóc phải giới hạn theo CTV được giao cho Sale.');
check(has(followupApi,"String(affiliate.sales_owner_id||'')!==actor.id"),'Server phải chặn Sale ghi chăm sóc ngoài phạm vi.');
check(has(followupApi,"'affiliate.followup.create'"),'Ghi chú chăm sóc phải ghi audit log.');
check(has(followupApi,"const limit=intParam(req.nextUrl.searchParams.get('limit')"),'API lịch chăm sóc phải hỗ trợ limit có giới hạn an toàn.');
check(has(followupApi,"const offset=intParam(req.nextUrl.searchParams.get('offset')"),'API lịch chăm sóc phải hỗ trợ offset phân trang.');
check(has(followupApi,'const hasMore=rawFollowups.length>limit'),'API lịch chăm sóc phải xác định còn dữ liệu để tải thêm.');
check(has(followupApi,'pagination:{limit,offset,hasMore,nextOffset:hasMore?offset+limit:null}'),'API lịch chăm sóc phải trả metadata phân trang.');
check(has(followupApi,'pg_advisory_xact_lock(hashtext(${requestId}))'),'Ghi chăm sóc phải khóa requestId chống double-submit server-side.');
check(has(followupApi,"after_data->>'requestId'=${requestId}"),'Ghi chăm sóc phải idempotent theo requestId.');
check(has(followupApi,"'requestId',${requestId}"),'Audit log chăm sóc phải lưu requestId.');

check(has(registerApi,"'affiliate','affiliate','inactive'"),'CTV tự đăng ký phải tạo staff ở trạng thái inactive.');
check(has(registerApi,"5,'pending' from new_staff"),'CTV tự đăng ký phải tạo hồ sơ affiliate ở trạng thái pending.');
check(has(registerApi,"status:'pending'"),'API đăng ký phải trả trạng thái Chờ duyệt.');
check(has(loginApi,"row.staff_status!=='active'||row.affiliate_status!=='active'"),'Đăng nhập CTV phải chặn staff hoặc affiliate chưa active.');
check(has(loginApi,'setSessionCookie(response,AFFILIATE_SESSION_COOKIE'), 'Chỉ login hợp lệ mới được cấp session CTV.');
check(has(affiliateServer,"a.status='active' and s.status='active' and s.role='affiliate'"),'Session CTV đang tồn tại phải bị vô hiệu ngay khi hồ sơ hoặc staff không còn active.');
check(has(affiliateServer,"select id from affiliates where id=${attr.affiliateId} and status='active'"),'Attribution chỉ được ghi nhận cho CTV đang active.');
check(has(affiliateServer,"ar.status='pending' and a.status='active' and b.status='completed'"),'Hoa hồng chỉ được ghi có cho CTV active và booking completed.');

check(has(affiliateDashboardApi,"const uuid=/^[0-9a-f]{8}"),'CTV self-service phải kiểm tra requestId UUID cho giao dịch rút tiền.');
check(has(affiliateDashboardApi,"const bankFields=[bankName,bankAccount,accountHolder]"),'CTV self-service phải yêu cầu bộ thông tin ngân hàng đầy đủ hoặc để trống toàn bộ.');
check(has(affiliateDashboardApi,"before_data,after_data"),'Cập nhật hồ sơ nhận tiền phải ghi audit trước và sau.');
check(has(affiliateDashboardApi,'maskedAccount(previous.bank_account)'),'Audit hồ sơ CTV không được lưu nguyên số tài khoản cũ.');
check(has(affiliateDashboardApi,'maskedAccount(bankAccount)'),'Audit hồ sơ CTV không được lưu nguyên số tài khoản mới.');
check(has(affiliateDashboardApi,'const lockKey=`affiliate-payout:${actor.id}`'),'Yêu cầu rút tiền CTV phải khóa theo chính tài khoản CTV.');
check(has(affiliateDashboardApi,'await sql.transaction(['),'Yêu cầu rút tiền CTV phải dùng transaction nhiều statement để lock có hiệu lực trước snapshot xử lý.');
check(has(affiliateDashboardApi,'pg_advisory_xact_lock(hashtext(${lockKey}))'),'Yêu cầu rút tiền phải khóa actor trước khi kiểm tra pending.');
check(has(affiliateDashboardApi,'pg_advisory_xact_lock(hashtext(${requestId}))'),'Yêu cầu rút tiền phải khóa requestId chống retry song song.');
check(has(affiliateDashboardApi,"al.after_data->>'requestId'=${requestId}"),'CTV payout request phải idempotent theo requestId đã audit.');
check(has(affiliateDashboardApi,"jsonb_build_object('payoutId',i.id::text,'amount',i.amount,'requestId',${requestId})"),'Audit yêu cầu rút tiền phải lưu payoutId, amount và requestId.');
check(has(affiliateDashboardApi,"not exists(select 1 from waiting)"),'Server phải giữ nguyên tắc mỗi CTV chỉ có một payout pending.');
check(has(affiliateDashboardApi,"if(result?.idempotent)return NextResponse.json({ok:true"),'Retry cùng requestId phải trả lại thành công thay vì tạo payout mới.');

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

check(has(followupsUi,'saveLock.current'),'UI chăm sóc phải khóa đồng bộ chống double-click.');
check(has(followupsUi,'const requestId=crypto.randomUUID()'),'UI chăm sóc phải gửi requestId duy nhất.');
check(has(followupsUi,'loadHistory=useCallback'),'UI chăm sóc phải tải lịch sử riêng theo CTV.');
check(has(followupsUi,'historyHasMore'),'UI chăm sóc phải hỗ trợ tải thêm lịch sử.');
check(has(followupsUi,'historyRequest.current'),'UI chăm sóc phải bỏ response lịch sử đã cũ khi đổi CTV nhanh.');
check(has(followupsUi,'role="button" tabIndex={0}'),'Card CTV phải dùng được bằng bàn phím.');
check(has(followupsUi,"e.key==='Enter'||e.key===' '"),'Card CTV phải hỗ trợ Enter/Space khi chọn.');

check(has(affiliateDashboardUi,'payoutLock.current'),'Dashboard CTV phải có synchronous lock chống double-click rút tiền.');
check(has(affiliateDashboardUi,'const requestId=crypto.randomUUID()'),'Dashboard CTV phải tạo requestId duy nhất cho mỗi yêu cầu rút.');
check(has(affiliateDashboardUi,"action({action:'request_payout',amount,requestId}"),'Dashboard CTV phải gửi requestId xuống server.');
check(has(affiliateDashboardUi,'window.confirm(`Gửi yêu cầu rút ${money(amount)}'),'CTV phải xác nhận số tiền và tài khoản trước khi gửi yêu cầu rút.');
check(has(affiliateDashboardUi,'loadRequest.current'),'Dashboard CTV phải bỏ response cũ khi có nhiều lần refresh chồng nhau.');
check(has(affiliateDashboardUi,"window.addEventListener('focus',refresh)"),'Dashboard CTV phải tự refresh khi người dùng quay lại cửa sổ.');
check(has(affiliateDashboardUi,"document.addEventListener('visibilitychange',visibility)"),'Dashboard CTV phải refresh khi tab trở lại visible.');
check(has(affiliateDashboardUi,"bankFields.some(Boolean)&&!bankFields.every(Boolean)"),'UI hồ sơ CTV phải chặn lưu bộ thông tin ngân hàng thiếu trường.');
check(has(affiliateDashboardUi,'aria-live="polite"'),'Thông báo dashboard CTV phải được công bố cho công nghệ hỗ trợ.');

check(has(schema,'affiliate_followups'),'Schema repo phải chứa bảng affiliate_followups.');
check(has(schema,'sales_owner_id'),'Schema repo phải chứa ownership Sale cho CTV.');

if(failures.length){
 console.error('\nCTV / Affiliate regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV / Affiliate regression OK: ownership, Admin approval audit, staff/login state, payout scope, CTV self-service payout transaction/idempotency, Sale owner visibility, finance permissions and paginated/idempotent follow-up CRM are guarded.');
