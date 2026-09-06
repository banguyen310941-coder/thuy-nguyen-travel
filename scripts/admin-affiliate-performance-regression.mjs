import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const api=read('app/api/admin/affiliate-performance/route.ts');
const ui=read('components/AdminAffiliatePerformance.tsx');
const followupsUi=read('components/AdminAffiliateFollowups.tsx');
const workspace=read('components/AdminNetworkWorkspace.tsx');
const pkg=read('package.json');

check(has(api,"adminActor(req,'affiliates')"),'API hiệu suất CTV phải yêu cầu quyền affiliates.');
check(has(api,"canSeeAll=elevated(actor)"),'API hiệu suất CTV phải tách scope elevated và Sale.');
check(has(api,'where a.sales_owner_id=${actor.id}'),'Sale chỉ được xem hiệu suất CTV được giao.');
check(has(api,"c.clicked_on>=current_date-29"),'Hiệu suất click phải dùng cửa sổ 30 ngày.');
check(has(api,"ar.created_at>=now()-interval '30 days'"),'Booking hiệu suất phải dùng cửa sổ 30 ngày.');
check(has(api,"ar.credited_at>=now()-interval '30 days'"),'Hoa hồng 30 ngày phải dựa trên thời điểm ghi có.');
check(has(api,"cp.status='pending'"),'Dashboard quản trị phải tổng hợp payout đang chờ.');
check(has(api,"from affiliate_followups af where af.affiliate_id=a.id order by af.created_at desc limit 1"),'Hiệu suất CTV phải dùng follow-up gần nhất để cảnh báo chăm sóc.');
check(has(api,"reasons.push('Quá hạn follow-up')"),'API phải đánh dấu follow-up quá hạn.');
check(has(api,"clicks30>=5&&bookings30===0"),'API phải cảnh báo CTV có traffic nhưng chưa ra booking.');
check(has(api,"scope:canSeeAll?'all':'assigned'"),'API phải trả scope để UI giải thích phạm vi dữ liệu.');
check(has(api,"'Cache-Control':'no-store, max-age=0'"),'Hiệu suất CTV không được cache.');
check(!has(api,'customer_phone'),'API hiệu suất quản trị không được đọc SĐT khách.');
check(!has(api,'bank_account'),'API hiệu suất quản trị không được đọc tài khoản ngân hàng.');
check(!has(api,'account_holder'),'API hiệu suất quản trị không được đọc chủ tài khoản ngân hàng.');

check(has(ui,"fetch('/api/admin/affiliate-performance'"),'UI quản trị phải đọc endpoint hiệu suất riêng.');
check(has(ui,'request.current'),'UI hiệu suất phải bỏ response cũ.');
check(has(ui,"window.addEventListener('happygo-network-updated',refresh)"),'UI hiệu suất phải refresh khi mạng lưới thay đổi.');
check(has(ui,"document.addEventListener('visibilitychange',visibility)"),'UI hiệu suất phải refresh khi tab quay lại.');
check(has(ui,"[filter,setFilter]=useState<Filter>('all')"),'UI hiệu suất phải có bộ lọc CTV có kiểu rõ ràng.');
check(has(ui,"[sort,setSort]=useState<Sort>('attention')"),'UI hiệu suất phải có sắp xếp ưu tiên.');
check(has(ui,"filter==='attention'"),'UI phải lọc riêng CTV cần xử lý.');
check(has(ui,"filter==='overdue'"),'UI phải lọc riêng follow-up quá hạn.');
check(has(ui,"filter==='no-booking'"),'UI phải lọc CTV có click nhưng chưa ra booking.');
check(has(ui,"filter==='payout'"),'UI phải lọc CTV có payout đang chờ.');
check(has(ui,"sort==='bookings'"),'UI phải cho sắp xếp theo booking 30 ngày.');
check(has(ui,"sort==='payout'"),'UI phải cho sắp xếp theo payout đang chờ.');
check(has(ui,'Hiển thị {visible.length}/{data?.items.length||0} CTV'),'UI phải báo số CTV sau lọc.');
check(has(ui,'PAYOUT ĐANG CHỜ'),'UI phải hiển thị payout đang chờ.');
check(has(ui,'CẦN CHĂM SÓC'),'UI phải hiển thị số CTV cần chăm sóc.');
check(has(ui,'data?.generatedAt'),'UI phải hiển thị thời điểm cập nhật số liệu.');
check(has(ui,"new CustomEvent('happygo-affiliate-followup-select'"),'Bảng hiệu suất phải phát sự kiện chuyển CTV sang CRM.');
check(has(ui,'detail:{affiliateId:item.id,suggestion}'),'Sự kiện chuyển CRM phải mang đúng affiliateId và gợi ý chăm sóc.');
check(has(ui,'Theo dõi hiệu suất 30 ngày:'),'Gợi ý chăm sóc phải tóm tắt số liệu 30 ngày.');
check(has(ui,'Chăm sóc ngay ↓'),'Mỗi CTV phải có thao tác chuyển thẳng sang CRM.');
check(has(ui,"document.getElementById('admin-affiliate-followups')?.scrollIntoView"),'Thao tác chăm sóc phải cuộn xuống đúng khu CRM.');
check(has(ui,'aria-live="polite"'),'Lỗi/notice hiệu suất phải được công bố cho công nghệ hỗ trợ.');

check(has(followupsUi,'id="admin-affiliate-followups"'),'CRM phải có anchor ổn định để bảng hiệu suất cuộn tới.');
check(has(followupsUi,"window.addEventListener('happygo-affiliate-followup-select',select)"),'CRM phải lắng nghe sự kiện chọn CTV từ bảng hiệu suất.');
check(has(followupsUi,"setAffiliateId(id)"),'CRM phải tự chọn đúng CTV nhận từ bảng hiệu suất.');
check(has(followupsUi,"if(suggestion&&!contentValue.current.trim())"),'CRM chỉ tự điền gợi ý khi ô nội dung đang trống.');
check(has(followupsUi,'contentInput.current?.focus()'),'CRM phải focus thẳng vào ô ghi chú sau khi chuyển từ hiệu suất.');
check(has(followupsUi,'CTV này không nằm trong phạm vi chăm sóc của tài khoản hiện tại.'),'CRM phải từ chối chọn CTV ngoài phạm vi client hiện tại.');

check(has(workspace,"import {AdminAffiliatePerformance}"),'Workspace phải import dashboard hiệu suất CTV.');
check(has(workspace,'<AdminAffiliateAssignments/><AdminAffiliatePerformance/><AdminAffiliateFollowups/>'),'Dashboard hiệu suất chỉ nằm trong nhánh canAffiliates cùng CRM/Sale.');
check(!has(workspace,'financeOnly&&<AdminAffiliatePerformance'),'Finance-only không được cấp dashboard CRM/hiệu suất Sale.');
check(has(pkg,'admin-affiliate-performance-regression.mjs'),'Bộ regression hiệu suất quản trị phải được chạy trong test:affiliate.');

if(failures.length){
 console.error('\nAdmin CTV Performance regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('Admin CTV Performance regression OK: Admin/Sale scope, 30-day KPIs, attention filters, Performance-to-CRM handoff, privacy and workspace permissions are guarded.');
