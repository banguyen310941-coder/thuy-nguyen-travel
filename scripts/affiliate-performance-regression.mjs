import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const api=read('app/api/affiliate/performance/route.ts');
const ui=read('components/AffiliatePerformancePanel.tsx');
const page=read('app/affiliate/dashboard/page.tsx');
const css=read('app/affiliate/self-service.css');

check(has(api,'affiliateActor(req)'),'Performance API phải bắt buộc session CTV active.');
check(has(api,"clicked_on>=current_date-29"),'Performance API phải tính click 30 ngày theo clicked_on.');
check(has(api,"created_at>=now()-interval '30 days'"),'Performance API phải giới hạn booking/referral 30 ngày.');
check(has(api,"credited_at>=now()-interval '30 days'"),'Hoa hồng 30 ngày phải dựa trên thời điểm credited_at.');
check(has(api,"status<>'cancelled'"),'Booking hủy không được tính vào chuyển đổi.');
check(has(api,"status in ('approved','paid')"),'Đơn ghi hoa hồng phải chỉ tính trạng thái approved/paid.');
check(has(api,"status='pending'"),'Performance phải hiển thị đơn/rút tiền đang chờ.');
check(has(api,'with click_metrics as ('),'Top sản phẩm phải tổng hợp click riêng để tránh nhân bản join.');
check(has(api,'referral_metrics as ('),'Top sản phẩm phải tổng hợp booking/hoa hồng riêng.');
check(has(api,'limit 6'),'Top sản phẩm phải giới hạn danh sách nhẹ cho dashboard.');
check(has(api,'conversionRate:percent'),'API phải trả tỷ lệ chuyển đổi đã chuẩn hóa.');
check(has(api,"'Cache-Control':'no-store, max-age=0'"),'Dữ liệu hiệu quả bán hàng không được cache.');
check(!has(api,'customer_phone'),'Performance API không được truy vấn số điện thoại khách.');
check(!has(api,'bank_account'),'Performance API không được truy vấn tài khoản ngân hàng CTV.');

check(has(ui,"fetch('/api/affiliate/performance'"),'UI hiệu quả bán hàng phải dùng endpoint riêng.');
check(has(ui,'request.current'),'UI performance phải bỏ response cũ khi refresh chồng nhau.');
check(has(ui,"window.addEventListener('focus',focus)"),'UI performance phải refresh khi quay lại cửa sổ.');
check(has(ui,"document.addEventListener('visibilitychange',visibility)"),'UI performance phải refresh khi tab visible trở lại.');
check(has(ui,'CLICK → BOOKING'),'UI phải hiển thị KPI tỷ lệ click sang booking.');
check(has(ui,'HOA HỒNG · 30 NGÀY'),'UI phải hiển thị hoa hồng 30 ngày.');
check(has(ui,'RÚT TIỀN ĐANG CHỜ'),'UI phải hiển thị dòng tiền đang chờ.');
check(has(ui,'Sản phẩm nổi bật 30 ngày'),'UI phải hiển thị bảng sản phẩm nổi bật.');
check(has(ui,'aria-live="polite"'),'Lỗi performance phải được công bố cho công nghệ hỗ trợ.');
check(has(page,'<AffiliatePerformancePanel/>'),'Dashboard CTV phải gắn module hiệu quả bán hàng.');
check(has(css,'.affiliate-performance-panel'),'Module performance phải có container responsive riêng.');

if(failures.length){
 console.error('\nCTV Performance regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV Performance regression OK: 30-day conversion, commission/payout metrics, privacy-safe top products and refresh guards are protected.');
