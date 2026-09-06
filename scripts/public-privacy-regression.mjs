import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

// Shared recursive sanitizer remains the final text/object guard.
must('lib/server/public-site-state.ts','export function sanitizePublicValue(value:unknown):unknown','Public sanitizer phải được export để mọi public API dùng chung');
must('lib/server/public-site-state.ts','PRIVATE_FIELD_TOKENS','Public sanitizer phải chặn token trường nội bộ');
must('lib/server/public-site-state.ts','if(privateField(key))continue','Public sanitizer phải lọc object lồng nhau');

// Production catalog must be allowlist-first: arbitrary product/unit data must never be spread to public APIs.
must('lib/server/public-site-state.ts','const PUBLIC_PRODUCT_FIELDS=','Product public phải có allowlist rõ ràng');
must('lib/server/public-site-state.ts','const PUBLIC_UNIT_FIELDS=','Unit public phải có allowlist rõ ràng');
must('lib/server/public-site-state.ts','export function publicProductData(value:unknown)','Product public phải đi qua projector allowlist');
must('lib/server/public-site-state.ts','export function publicUnitData(value:unknown)','Unit public phải đi qua projector allowlist');
must('lib/server/public-site-state.ts',"quantity:available?'1':'0'",'Public rate chỉ được lộ trạng thái còn/hết, không lộ số tồn thật');
mustNot('lib/server/public-site-state.ts','quantity:String(row.inventory??0)','Public rate không được xuất số inventory production chính xác');
mustNot('lib/server/public-site-state.ts','select id,product_id,code,name','Không được select mã unit nội bộ chỉ để xuất public');
must('components/PublishedUnits.tsx','Còn chỗ theo lịch ngày đã chọn','UI public chỉ hiển thị trạng thái còn chỗ, không hiển thị tồn chính xác');
mustNot('components/PublishedUnits.tsx','Còn {minQty} đơn vị','UI public không được hiển thị số tồn production chính xác');

// Partner catalog uses defense in depth: recursive sanitizer first, then an explicit product allowlist.
must('app/api/catalog/partner-products/route.ts',"import {sanitizePublicValue} from '@/lib/server/public-site-state'",'Partner catalog phải dùng sanitizer chung');
must('app/api/catalog/partner-products/route.ts',"import {publicProductData} from '@/lib/server/public-site-state'",'Partner catalog phải dùng public projector chung');
must('app/api/catalog/partner-products/route.ts','const sanitized=sanitizePublicValue(raw)','Partner catalog phải lọc data đệ quy trước');
must('app/api/catalog/partner-products/route.ts','const data=publicProductData(sanitized)','Partner catalog phải project dữ liệu đã lọc qua allowlist');
must('app/api/catalog/partner-products/route.ts',"const sanitizedSummary=sanitizePublicValue(row.description||data.summary||'')",'Partner catalog phải lọc mô tả public');
mustNot('app/api/catalog/partner-products/route.ts','retailPriceVnd:','Partner catalog không cần lộ cột giá số dư thừa ngoài giá public chuẩn');
mustNot('app/api/catalog/partner-products/route.ts','promoPriceVnd:','Partner catalog không cần lộ cột promo số dư thừa ngoài giá public chuẩn');

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
must('app/api/reviews/route.ts',"bookingCode:booking?.code||''",'Khách đã đăng nhập vẫn được xác nhận mã booking của chính họ');

// Public booking writes must be same-origin and bounded before data reaches CRM/notifications.
must('app/api/bookings/route.ts',"const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin)",'Booking POST phải chặn cross-site request');
must('app/api/bookings/route.ts','name.length>120||email.length>254||product.length>240||note.length>2000','Booking POST phải giới hạn kích thước dữ liệu đầu vào');
must('app/api/bookings/route.ts',"return NextResponse.json({error:'Email chưa hợp lệ.'},{status:400})",'Booking POST phải kiểm tra email trước khi lưu/gửi mail');
must('app/api/bookings/route.ts',"'\"':'&quot;'",'HTML email booking phải escape dấu ngoặc kép đầy đủ');

// Newsletter consent is isolated from customer-account marketing consent and all writes are same-origin.
must('app/api/newsletter/route.ts',"function sameOrigin(req:NextRequest){const origin=req.headers.get('origin');return !origin||origin===req.nextUrl.origin}",'Newsletter phải có kiểm tra same-origin dùng chung');
must('app/api/newsletter/route.ts',"if(!sameOrigin(req))return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403})",'Subscribe/unsubscribe newsletter phải chặn cross-site request');
mustNot('app/api/newsletter/route.ts','update customers set marketing_consent=true','Public newsletter không được tự bật marketing consent của hồ sơ khách');
mustNot('app/api/newsletter/route.ts','update customers set marketing_consent=false','Public newsletter không được tự tắt marketing consent của hồ sơ khách');
mustNot('app/api/newsletter/route.ts','customer_consent as','Public newsletter không được nối tác dụng phụ sang bảng customers');

if(failures.length){console.error('\nPublic privacy regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public privacy regression checks passed.');
