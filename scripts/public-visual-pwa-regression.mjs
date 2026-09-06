import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

must('app/admin/manifest.webmanifest/route.ts',"id:'/admin/'",'Admin PWA phải có app identity riêng');
must('app/admin/manifest.webmanifest/route.ts',"start_url:'/admin/?source=pwa'",'Admin PWA phải luôn khởi động trong /admin');
must('app/admin/manifest.webmanifest/route.ts',"scope:'/admin/'",'Admin PWA phải giới hạn scope trong /admin');
must('app/admin/manifest.webmanifest/route.ts',"'Cache-Control':'no-store, max-age=0'",'Manifest Admin không được bị cache cũ');
must('public/sw.js',"if(url.pathname.startsWith('/admin'))",'Service worker phải có nhánh fallback riêng cho Admin');
must('public/sw.js',"new Response('HappyGo Admin đang ngoại tuyến",'Admin offline phải báo trạng thái thay vì rơi về trang chủ');
mustNot('public/sw.js',"if(url.pathname.startsWith('/admin'))return (await caches.match('/admin'))||(await caches.match('/admin/'))||(await caches.match('/'));",'Admin PWA không được fallback về homepage');

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

if(failures.length){console.error('\nPublic visual/PWA regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public visual/PWA regression checks passed.');
