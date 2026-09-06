import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

// Shared recursive sanitizer must protect public product/CMS payloads.
must('lib/server/public-site-state.ts','export function sanitizePublicValue(value:unknown):unknown','Public sanitizer phải được export để mọi public API dùng chung');
must('lib/server/public-site-state.ts','PRIVATE_FIELD_TOKENS','Public sanitizer phải chặn token trường nội bộ');
must('lib/server/public-site-state.ts','if(privateField(key))continue','Public sanitizer phải lọc object lồng nhau');

// Partner catalog may expose approved commercial content, but never raw partner data fields.
must('app/api/catalog/partner-products/route.ts',"import {sanitizePublicValue} from '@/lib/server/public-site-state'",'Partner catalog phải dùng sanitizer chung');
must('app/api/catalog/partner-products/route.ts','const sanitized=sanitizePublicValue(raw)','Partner catalog phải lọc data đệ quy');
must('app/api/catalog/partner-products/route.ts',"const sanitizedSummary=sanitizePublicValue(row.description||data.summary||'')",'Partner catalog phải lọc mô tả public');
mustNot('app/api/catalog/partner-products/route.ts','partnerPricing:_partnerPricing','Không được chỉ blacklist một số field partner top-level');
mustNot('app/api/catalog/partner-products/route.ts','netPrice:_netPrice','Không được chỉ blacklist netPrice top-level');
mustNot('app/api/catalog/partner-products/route.ts','apiToken:_apiToken','Không được chỉ blacklist apiToken top-level');

// Site/SEO config endpoint must return a stable public allowlist instead of the raw audit-log object.
must('app/api/site-config/route.ts','function publicSiteConfig(value:unknown)','Site config phải có allowlist public');
must('app/api/site-config/route.ts','function publicSeoConfig(value:unknown)','SEO config phải có allowlist public');
must('app/api/site-config/route.ts','facebookUrl:text(raw.facebookUrl)','Site config chỉ xuất trường public đã chọn');
must('app/api/site-config/route.ts','organizationName:text(raw.organizationName)','SEO config chỉ xuất trường public đã chọn');
mustNot('app/api/site-config/route.ts','result[id]=parseValue','Không được trả nguyên audit-log config ra public');
mustNot('app/api/site-config/route.ts','canonicalBase:text(raw.canonicalBase)','Không xuất canonical override qua public config API');

// Review readers may see review content and verification state, but never another customer's booking code.
mustNot('app/api/reviews/route.ts','b.code as booking_code','Danh sách review public không được select mã booking');
mustNot('app/api/reviews/route.ts','bookingCode:String(r.booking_code','Review public không được serialize mã booking');
mustNot('components/CustomerReviews.tsx','bookingCode?:string};\ntype Mine','Kiểu dữ liệu từng review không được chứa bookingCode');
// The top-level bookingCode remains intentionally available only for the authenticated customer whose own completed booking was verified.
must('app/api/reviews/route.ts',"bookingCode:booking?.code||''",'Khách đã đăng nhập vẫn được xác nhận mã booking của chính họ');

// Public booking writes must be same-origin and bounded before data reaches CRM/notifications.
must('app/api/bookings/route.ts',"const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin)",'Booking POST phải chặn cross-site request');
must('app/api/bookings/route.ts','name.length>120||email.length>254||product.length>240||note.length>2000','Booking POST phải giới hạn kích thước dữ liệu đầu vào');
must('app/api/bookings/route.ts',"return NextResponse.json({error:'Email chưa hợp lệ.'},{status:400})",'Booking POST phải kiểm tra email trước khi lưu/gửi mail');
must('app/api/bookings/route.ts',"'\"':'&quot;'",'HTML email booking phải escape dấu ngoặc kép đầy đủ');

if(failures.length){console.error('\nPublic privacy regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public privacy regression checks passed.');
