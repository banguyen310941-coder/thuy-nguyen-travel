import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const policy=read('lib/affiliate-commission.ts');
const server=read('lib/server/affiliate.ts');
const dashboardApi=read('app/api/affiliate/dashboard/route.ts');
const dashboardUi=read('components/AffiliateDashboard.tsx');
const settlement=server.slice(server.indexOf('export async function settleAffiliateBooking'));

check(has(policy,"{minOrder:1,maxOrder:10,rate:35"),'Đơn 1–10 phải hưởng 35%.');
check(has(policy,"{minOrder:11,maxOrder:20,rate:40"),'Đơn 11–20 phải hưởng 40%.');
check(has(policy,"{minOrder:21,maxOrder:50,rate:45"),'Đơn 21–50 phải hưởng 45%.');
check(has(policy,"{minOrder:51,maxOrder:null,rate:50"),'Từ đơn 51 phải hưởng 50%.');
check(has(settlement,'b.selling_total_vnd-b.cost_total_vnd'),'Hoa hồng phải tính trên lợi nhuận giá bán trừ giá vốn.');
check(has(settlement,'b.cost_total_vnd is not null'),'Không được ghi hoa hồng khi chưa có giá vốn để xác định lợi nhuận.');
check(has(settlement,'t.order_number<=10 then 35'),'Settlement phải áp 35% cho 10 đơn đầu.');
check(has(settlement,'t.order_number<=20 then 40'),'Settlement phải áp 40% cho đơn 11–20.');
check(has(settlement,'t.order_number<=50 then 45'),'Settlement phải áp 45% cho đơn 21–50.');
check(has(settlement,'else 50'),'Settlement phải áp 50% từ đơn 51.');
check(!has(settlement,'a.commission_rate'),'Settlement không được dùng tỷ lệ commission_rate cố định cũ.');
check(has(dashboardApi,"b.status='completed'"),'Dashboard phải đếm đơn chốt theo booking completed.');
check(has(dashboardApi,'affiliateCommissionPolicy(closedOrders)'),'Dashboard phải trả chính sách hoa hồng theo số đơn chốt.');
check(has(dashboardUi,'policy.nextOrderNumber'),'CTV phải thấy số thứ tự của đơn thành công tiếp theo.');
check(has(dashboardUi,'policy.currentRate'),'CTV phải thấy mức hoa hồng hiện tại.');
check(has(dashboardUi,'setLinkNotice'),'Copy link phải tạo thông báo hoa hồng cho CTV.');
check(has(dashboardUi,'giá bán − giá vốn'),'Thông báo phải nói rõ hoa hồng tính trên lợi nhuận.');
check(!has(dashboardUi,'Dashboard không truy vấn hoặc hiển thị tên/SĐT chủ nhà, địa chỉ cụ thể hay giá net.'),'Phải bỏ dòng cảnh báo khóa khỏi trang CTV.');

if(failures.length){
 console.error('\nCTV commission tier regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV commission tier regression OK: 35/40/45/50% tiers apply to booking profit, link-copy notice is visible, and the removed dashboard warning stays removed.');
