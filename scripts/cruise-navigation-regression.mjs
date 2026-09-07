import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

must('components/CruiseCatalog.tsx',"const cardHitStyle={position:'absolute' as const,inset:0,zIndex:1}",'Card du thuyền phải có vùng click phủ toàn bộ');
must('components/CruiseCatalog.tsx','aria-label={`Xem chi tiết ${item.name}`}','Card du thuyền CMS/static phải có link phủ card có nhãn');
must('components/CruiseCatalog.tsx','const href=`/du-thuyen/${encodeURIComponent(item.slug)}`','Du thuyền CMS phải ở cùng module /du-thuyen');
must('components/CruiseCatalog.tsx','style={cardActionsStyle}','Các nút hành động phải nổi trên vùng click phủ card');
must('components/PartnerCategoryCards.tsx',"p.type==='Du thuyền'?`/du-thuyen/${encodeURIComponent(p.slug)}`",'Du thuyền Partner phải đi vào module /du-thuyen');
must('components/PartnerCategoryCards.tsx','aria-label={`Xem chi tiết ${p.name}`}','Card đối tác phải có link phủ card có nhãn');
must('components/HomeCmsSections.tsx','href={`/du-thuyen/${encodeURIComponent(item.slug)}`}','Du thuyền CMS trên trang chủ phải đi vào module /du-thuyen');
must('components/GlobalSearchResults.tsx','href={`/du-thuyen/${encodeURIComponent(item.slug)}`}','Kết quả tìm kiếm Du thuyền CMS phải đi vào module /du-thuyen');

must('app/cruises/[slug]/page.tsx','CmsProductDetail,type PublicProduct','Route du thuyền phải dùng model sản phẩm chung');
must('app/cruises/[slug]/page.tsx','getPublicSiteState','Route du thuyền phải đọc site-state production chung');
must('app/cruises/[slug]/page.tsx','initialRates={initialRates}','Route du thuyền phải truyền lịch giá production vào chi tiết chung');
mustNot('app/cruises/[slug]/page.tsx','CruiseDetailClient','Route du thuyền không được quay lại trang chi tiết standalone legacy');
must('components/CmsProductDetail.tsx','canonicalPartnerProduct','Sản phẩm Partner phải được chuẩn hóa bằng canonical product model');
must('components/CmsProductDetail.tsx','seedPublicCommerceRuntime(product,rates)','Chi tiết sản phẩm phải đưa snapshot production vào commerce runtime chung');
must('components/CmsProductDetail.tsx','<UnifiedCruisePublicDetail product={product} initialRates={rates}/>','Du thuyền phải nhận chung lịch giá từ CmsProductDetail');
must('components/UnifiedCruisePublicDetail.tsx','productId={p.id} productSlug={p.slug}','Booking du thuyền phải giữ product identity tới giỏ/checkout');
must('components/UnifiedCruisePublicDetail.tsx','initialRates={initialRates} kind={ticketMode?\'ticket\':\'cruise\'}','Lịch giá du thuyền phải dùng rate production của hệ thống');
must('components/ProductCommerce.ts','resolvePublicCommerceRuntime','Commerce chung phải ưu tiên snapshot production của trang public');
must('components/BookingCart.tsx','persistRuntimeForCheckout','Giỏ phải mang snapshot production sang checkout');
must('components/BookingCart.tsx',"RATES_KEY='tn_cms_daily_rates_v1'",'Giỏ phải đồng bộ rate production đã chọn cho phiếu tạm tính');
must('components/BookingCart.tsx','Cart snapshot từ lịch giá production','Checkout phải nhận đúng giá production tại ngày cabin/vé đã chọn');
must('app/product/[slug]/page.tsx',"redirect(`/du-thuyen/${encodeURIComponent(slug)}`)",'URL sản phẩm chung phải canonicalize du thuyền về /du-thuyen');
must('app/sitemap.ts',"item.type==='Du thuyền'?'du-thuyen':'san-pham'",'Sitemap phải xuất URL du thuyền theo module /du-thuyen');

if(failures.length){console.error('\nCruise navigation regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Cruise navigation regression checks passed.');
