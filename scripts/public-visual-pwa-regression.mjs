import {existsSync,readFileSync} from 'node:fs';

const failures=[];
const url=path=>new URL(`../${path}`,import.meta.url);
const read=path=>readFileSync(url(path),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};
const mustMissing=(path,label)=>{if(existsSync(url(path)))failures.push(`${label}: ${path} không được tồn tại`)};

// Next.js file-based metadata at app/manifest.ts is inherited by nested routes and
// takes precedence over the Admin layout manifest. Keep the public manifest as a
// normal route so /admin can own its manifest link from server-rendered metadata.
mustMissing('app/manifest.ts','Root file-based manifest sẽ ghi đè manifest Admin');
must('app/manifest.webmanifest/route.ts',"start_url:'/'",'Manifest public dạng route thường phải giữ start_url trang chủ');
must('app/manifest.webmanifest/route.ts',"scope:'/'",'Manifest public phải giữ scope website');
mustNot('app/layout.tsx',"manifest:'/manifest.webmanifest'",'Root layout không được ép manifest public lên trang Admin');
must('app/admin/layout.tsx',"manifest:'/admin/manifest.webmanifest'",'HTML trang Admin phải khai manifest Admin ngay từ server');
must('app/admin/manifest.webmanifest/route.ts',"id:'/admin/'",'Admin PWA phải có app identity riêng');
must('app/admin/manifest.webmanifest/route.ts',"start_url:'/admin/?source=pwa'",'Admin PWA phải luôn khởi động trong /admin');
must('app/admin/manifest.webmanifest/route.ts',"scope:'/admin/'",'Admin PWA phải giới hạn scope trong /admin');
must('app/admin/manifest.webmanifest/route.ts',"'Cache-Control':'no-store, max-age=0'",'Manifest Admin không được bị cache cũ');
must('public/sw.js',"const CACHE='happygo-shell-v7'",'Service worker phải đổi cache version để xóa shell Admin cũ');
mustNot('public/sw.js',"const SHELL=['/','/admin','/admin/','/admin/manifest.webmanifest'",'Service worker không được pre-cache manifest Admin');
must('public/sw.js',"url.pathname.endsWith('/manifest.webmanifest')",'Service worker phải bypass cache cho mọi manifest');
must('public/sw.js',"event.respondWith(fetch(req))",'Manifest phải được lấy trực tiếp từ network');
must('public/sw.js',"if(url.pathname.startsWith('/admin'))",'Service worker phải có nhánh fallback riêng cho Admin');
must('public/sw.js',"new Response('HappyGo Admin đang ngoại tuyến",'Admin offline phải báo trạng thái thay vì rơi về trang chủ');
mustNot('public/sw.js',"if(url.pathname.startsWith('/admin'))return (await caches.match('/admin'))||(await caches.match('/admin/'))||(await caches.match('/'));",'Admin PWA không được fallback về homepage');
mustNot('components/AdminInstallApp.tsx','querySelectorAll<HTMLLinkElement>(\'link[rel="manifest"]\')','Installer Admin không được sửa manifest bằng DOM sau khi trang đã tải');
mustNot('components/AdminInstallApp.tsx','document.head.appendChild(link)','Installer Admin không được chèn manifest bằng JavaScript');
must('components/AdminInstallApp.tsx','manifest trực tiếp từ HTML','Hướng dẫn cài Admin phải phản ánh cơ chế manifest server');
must('components/AdminInstallApp.tsx',"document.cookie='happygo_admin_pwa=admin",'Admin installer phải đánh dấu mục tiêu app cho iPhone');
must('components/LegacyAdminPwaRedirect.tsx',"fetch('/api/admin/auth/me'",'Icon Admin legacy chỉ được tự chuyển khi có phiên Admin hợp lệ');
must('components/LegacyAdminPwaRedirect.tsx',"window.location.replace('/admin/?source=pwa&legacy=1')",'Icon Admin legacy phải tự hồi phục về /admin');
must('components/LegacyAdminPwaRedirect.tsx',"window.matchMedia('(display-mode: standalone)')",'Migration chỉ chạy trong web app standalone');
must('app/page.tsx','<LegacyAdminPwaRedirect/>','Trang chủ phải gắn migration cho icon Admin legacy');

must('data/catalog.ts',"destinationVisualUrl('Phan Thiết')",'Catalog điểm đến phải dùng ảnh dùng chung');
must('data/catalog.ts',"destinationVisualUrl('Hạ Long')",'Hạ Long phải dùng ảnh dùng chung');
must('data/catalog.ts',"destinationVisualUrl('Phú Quốc')",'Phú Quốc phải dùng ảnh dùng chung');
must('data/catalog.ts',"destinationVisualUrl('Sa Pa')",'Sa Pa phải dùng ảnh dùng chung');
must('data/catalog.ts',"destinationVisualUrl('Nha Trang')",'Nha Trang phải dùng ảnh dùng chung');
must('data/catalog.ts',"destinationVisualUrl('Sầm Sơn')",'Sầm Sơn phải dùng ảnh dùng chung');
must('components/ProductVisuals.ts',"from '@/data/destination-visuals'",'Homepage và Điểm đến phải cùng nguồn ảnh');
for(const place of ['Phan Thiết','Hạ Long','Phú Quốc','Sa Pa','Nha Trang','Sầm Sơn'])must('data/destination-visuals.ts',`'${place}'`,'Bảng ảnh điểm đến phải đủ địa danh public');

must('components/HomeCmsSections.tsx','usePublicGuideArticles','Trang chủ phải dùng cùng nguồn bài Cẩm nang');
must('components/HomeCmsSections.tsx','const publicArticles=usePublicGuideArticles(initialArticles)','Trang chủ phải hydrate bài Cẩm nang từ cùng nguồn server');
must('components/HomeCmsSections.tsx','image:guideImage(p.image)','Fallback Cẩm nang trang chủ phải dùng cùng pipeline ảnh với trang Cẩm nang');
mustNot('components/HomeCmsSections.tsx','setCmsArticles','Trang chủ không được giữ cache bài Cẩm nang riêng');
mustNot('components/usePublicGuideArticles.ts','localStorage.getItem','Cẩm nang public không được ưu tiên cache browser');

must('app/page.tsx','className="home-premium"','Trang chủ phải dùng premium storefront shell');
must('components/Header.tsx','happygo-header-v2','Header public phải dùng visual system mới');
must('components/HomeCmsHero.tsx','home-hero-quicklinks','Hero phải có lối vào nhanh các dịch vụ chính');
must('components/HomeCmsSections.tsx','home-cruise-premium','Du thuyền phải có section premium riêng trên trang chủ');
must('components/HomeCmsSections.tsx','home-trust-strip','Trang chủ phải có dải lý do chọn HappyGo');
mustNot('components/HomeCmsSections.tsx','/cam-nang/bai-viet/','Homepage không được quay lại URL Cẩm nang legacy');
must('app/layout.tsx',"import './home-premium.css';",'Layout public phải nạp visual system trang chủ mới');
must('app/home-premium-addon.css',"@import './public-premium.css';",'Visual system mới phải áp dụng cả trang danh mục và chi tiết');

// Mobile screenshot guard: this final layer is intentionally loaded last so
// old public CSS cannot restore the cramped horizontal cards shown on phones.
must('app/layout.tsx',"import './mobile-public-polish.css';",'Layout phải nạp lớp hoàn thiện mobile');
must('app/layout.tsx',"import './mobile-public-audit-fixes.css';",'Layout phải nạp lớp sửa lỗi audit mobile');
const layout=read('app/layout.tsx');
if(layout.indexOf("import './mobile-public-polish.css';")<layout.indexOf("import './public-screenshot-fixes.css';"))failures.push('Mobile polish phải được nạp sau public-screenshot-fixes.css');
if(layout.indexOf("import './mobile-public-audit-fixes.css';")<layout.indexOf("import './mobile-public-polish.css';"))failures.push('Mobile audit fixes phải được nạp sau mobile-public-polish.css');
must('app/mobile-public-polish.css','.home-premium .home-hero-quicklinks{display:none!important}','Mobile hero không được lặp hai hàng dịch vụ');
must('app/mobile-public-polish.css','.home-premium .mock-product-card.property-card','Card lưu trú mobile phải ép về bố cục ảnh trên / nội dung dưới');
must('app/mobile-public-polish.css','.home-premium .home-guide-card','Card Cẩm nang mobile phải dùng cùng nhịp dọc');
must('app/mobile-public-polish.css','.destination-tile:first-child{grid-column:1/-1!important','Danh sách điểm đến mobile phải có tile dẫn đầu rõ ràng');
must('app/mobile-public-polish.css','.floating-actions a{display:grid!important;place-items:center!important;width:46px!important','Nút liên hệ nổi mobile phải thu gọn');
must('app/mobile-public-audit-fixes.css','.destination-tile a{','Audit mobile phải phục hồi điều hướng trong tile điểm đến');
must('app/mobile-public-audit-fixes.css','display:inline-flex!important','Link điểm đến mobile phải hiển thị và bấm được');

if(failures.length){console.error('\nPublic visual/PWA regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public visual/PWA regression checks passed.');
