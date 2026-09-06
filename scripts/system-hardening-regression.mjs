import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

// Canonical host must come from deployment environment until the custom domain is intentionally attached.
must('lib/site-url.ts','VERCEL_PROJECT_PRODUCTION_URL','Site URL phải nhận production host từ Vercel');
must('lib/site-url.ts','NEXT_PUBLIC_SITE_URL','Site URL phải có một biến môi trường duy nhất để đổi domain sau này');
must('app/layout.tsx','const base=getSiteUrl()','Root metadata phải dùng canonical runtime');
must('app/layout.tsx','const siteUrl=getSiteUrl()','Organization schema phải dùng cùng canonical runtime');
for(const path of ['app/stay/page.tsx','app/villa-resort/page.tsx','app/khach-san/page.tsx','app/tours/page.tsx','app/cruises/page.tsx','app/destinations/page.tsx','app/guide/page.tsx']){
 must(path,'getSiteUrl','Trang danh mục phải dùng site URL tập trung');
 mustNot(path,"const canonical='https://happygo.vn",'Trang danh mục chưa được hardcode domain custom');
}

// Public product/tour/guide surfaces must not prefer browser storage over Neon production state.
for(const path of ['components/StayCatalog.tsx','components/TourCatalog.tsx','components/CruiseCatalog.tsx','components/usePublicGuideArticles.ts','components/DailyPriceRange.tsx','components/ProductRateCalendar.tsx','components/PublishedUnits.tsx']){
 mustNot(path,'localStorage.getItem','Public catalog không được đọc localStorage làm nguồn dữ liệu');
}
must('lib/server/public-site-state.ts','tn_cms_products_v3_units:productionProducts','Server state phải xuất sản phẩm production');
must('lib/server/public-site-state.ts','tn_cms_daily_rates_v1:productionRates','Server state phải xuất lịch giá production');
must('app/product/[slug]/page.tsx','initialRates={initialRates}','Trang chi tiết phải hydrate lịch giá từ server');
must('components/CmsProductDetail.tsx','initialRates?:PublicRateRange[]','Product detail phải nhận rate snapshot từ server');
must('components/CmsProductDetail.tsx','<UnifiedStayPublicDetail product={product} initialRates={rates}/>','Product detail phải truyền rate snapshot xuống lưu trú');
must('components/UnifiedStayPublicDetail.tsx','<ProductRateCalendar units={product.units||[]} initialRates={initialRates}','Lịch giá phải nhận rate snapshot');
must('components/UnifiedStayPublicDetail.tsx','providedUnits={product.units||[]} initialRates={initialRates}','Danh sách phòng phải nhận cùng rate snapshot');
mustNot('components/ProductRateCalendar.tsx',"from '@/components/AdminRateCalendar'",'Public calendar không được phụ thuộc helper localStorage của Admin');
mustNot('components/PublishedUnits.tsx',"from '@/components/AdminRateCalendar'",'Public unit list không được phụ thuộc helper localStorage của Admin');

// CTV commission policy is automatic and profit-based; manual fixed rates are rejected.
must('app/api/admin/affiliates/route.ts',"affiliateCommissionPolicy(Number(a.closed_orders||0))",'API CTV phải tính bậc theo số đơn chốt');
must('app/api/admin/affiliates/route.ts','if(body.commissionRate!==undefined)','API phải từ chối chỉnh % hoa hồng thủ công');
must('app/api/admin/affiliates/route.ts',"commissionPolicy:{basis:'profit'",'API phải công bố basis hoa hồng là lợi nhuận');
must('lib/affiliate-commission.ts',"{minOrder:1,maxOrder:10,rate:35",'Bậc 1–10 phải là 35%');
must('lib/affiliate-commission.ts',"{minOrder:11,maxOrder:20,rate:40",'Bậc 11–20 phải là 40%');
must('lib/affiliate-commission.ts',"{minOrder:21,maxOrder:50,rate:45",'Bậc 21–50 phải là 45%');
must('lib/affiliate-commission.ts',"{minOrder:51,maxOrder:null,rate:50",'Bậc 51+ phải là 50%');

// Browser/security baseline.
must('next.config.mjs',"key: 'Content-Security-Policy'",'Ứng dụng phải gửi CSP');
must('next.config.mjs',"key: 'Strict-Transport-Security'",'Ứng dụng phải gửi HSTS');
must('next.config.mjs',"object-src 'none'",'CSP phải chặn object/embed plugin');
must('next.config.mjs',"frame-ancestors 'none'",'CSP phải chống clickjacking');

// Recovery baseline must document the production-only tables already present in Neon.
for(const table of ['customer_accounts','customer_reviews','partner_accounts','partner_support_tickets','partner_support_messages','suppliers','payment_requests','payment_request_events','accounting_entries','accounting_balances']){
 must('db/production-extension.sql',`create table if not exists ${table}`,'DB bootstrap phải chứa đủ bảng production');
}
must('db/README.md','production-extension.sql','Tài liệu DB phải nêu extension production');

if(failures.length){console.error('\nSystem hardening regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('System hardening regression checks passed.');
