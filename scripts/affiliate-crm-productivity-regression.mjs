import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const api=read('app/api/admin/affiliate-followups/route.ts');
const ui=read('components/AdminAffiliateFollowups.tsx');
const performance=read('components/AdminAffiliatePerformance.tsx');
const pkg=read('package.json');

check(has(api,'a.phone,a.zalo,a.referral_code'),'CRM API phải đọc Zalo cùng thông tin liên hệ CTV.');
check(has(api,"zalo:String(a.zalo||'')"),'CRM API phải trả Zalo cho UI chăm sóc.');
check(has(api,"adminActor(req,'affiliates')"),'CRM năng suất vẫn phải yêu cầu quyền affiliates.');
check(has(api,'where a.sales_owner_id=${actor.id}'),'Sale vẫn chỉ được đọc CTV thuộc phạm vi phụ trách.');
check(has(api,"'type',${type}::text"),'Audit follow-up phải ép kiểu type sang text để PostgreSQL xác định kiểu tham số.');
check(has(api,"'nextFollowUpAt',${nextIso}::text"),'Audit follow-up phải ép kiểu nextFollowUpAt sang text để PostgreSQL xác định kiểu tham số.');
check(has(api,"'requestId',${requestId}::text"),'Audit follow-up phải ép kiểu requestId sang text để PostgreSQL xác định kiểu tham số.');

check(has(ui,'type Affiliate={id:string;name:string;email:string;phone:string;zalo:string'),'UI CRM phải nhận phone, email và Zalo của CTV.');
check(has(ui,"const templates=["),'CRM phải có bộ mẫu ghi chú nhanh.');
check(has(ui,"'Đã gọi · chưa bắt máy'"),'CRM phải có mẫu xử lý CTV chưa bắt máy.');
check(has(ui,"'Đã tư vấn · hẹn lại'"),'CRM phải có mẫu tư vấn và hẹn lại.');
check(has(ui,"'Nhắc payout'"),'CRM phải có mẫu follow-up payout.');
check(has(ui,'const scheduleHours=(hours:number)'),'CRM phải có helper hẹn follow-up nhanh.');
check(has(ui,'onClick={()=>scheduleHours(2)}'),'CRM phải hỗ trợ hẹn lại sau 2 giờ.');
check(has(ui,'onClick={()=>scheduleHours(24)}'),'CRM phải hỗ trợ hẹn lại sau 1 ngày.');
check(has(ui,'onClick={()=>scheduleHours(72)}'),'CRM phải hỗ trợ hẹn lại sau 3 ngày.');
check(has(ui,'onClick={()=>scheduleHours(168)}'),'CRM phải hỗ trợ hẹn lại sau 7 ngày.');
check(has(ui,"window.location.href=`tel:${phone}`"),'CRM phải có thao tác gọi trực tiếp cho CTV.');
check(has(ui,"window.open(`https://zalo.me/${phone}`"),'CRM phải mở Zalo trực tiếp bằng số CTV.');
check(has(ui,"href={`mailto:${selectedAffiliate.email}`}"),'CRM phải có thao tác email khi CTV có email.');
check(has(ui,"setType('call')"),'Gọi nhanh phải đồng bộ kênh chăm sóc thành call.');
check(has(ui,"setType('zalo')"),'Mở Zalo phải đồng bộ kênh chăm sóc thành zalo.');
check(has(ui,"setType('email')"),'Email nhanh phải đồng bộ kênh chăm sóc thành email.');
check(has(ui,"(e.ctrlKey||e.metaKey)&&e.key==='Enter'"),'Textarea CRM phải hỗ trợ Ctrl/Cmd + Enter để lưu.');
check(has(ui,'const nextAffiliate=()=>'),'CRM phải có thao tác chuyển CTV tiếp theo.');
check(has(ui,'CTV tiếp theo →'),'UI phải hiển thị nút chuyển CTV tiếp theo.');
check(has(ui,'contentValue.current=next.slice(0,4000)'),'Mẫu ghi chú phải tôn trọng giới hạn 4.000 ký tự server.');
check(has(ui,'disabled={!digits(selectedAffiliate?.phone||\'\')}'),'Nút gọi phải vô hiệu khi không có số điện thoại.');
check(has(ui,"disabled={!digits(selectedAffiliate?.zalo||selectedAffiliate?.phone||'')}") ,'Nút Zalo phải vô hiệu khi không có số liên hệ.');
check(has(ui,"window.addEventListener('happygo-affiliate-followup-select',select)"),'Luồng Performance → CRM phải tiếp tục hoạt động sau nâng cấp năng suất.');
check(has(performance,'Chăm sóc ngay ↓'),'Dashboard hiệu suất phải tiếp tục có nút chuyển vào CRM.');
check(has(pkg,'affiliate-crm-productivity-regression.mjs'),'Regression CRM năng suất phải được chạy trong test:affiliate.');

if(failures.length){
 console.error('\nCTV CRM Productivity regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV CRM Productivity regression OK: scoped contact actions, Zalo/call/email shortcuts, note templates, follow-up presets, keyboard save, next-CTV workflow and PostgreSQL audit parameter typing are guarded.');
