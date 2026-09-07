import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const fail=(message)=>{console.error(`SEO regression: ${message}`);process.exitCode=1};
const must=(text,needle,label)=>{if(!text.includes(needle))fail(`${label} thiếu: ${needle}`)};

const nextConfig=read('next.config.mjs');
const sitemap=read('app/sitemap.ts');
const robots=read('app/robots.ts');
const siteUrl=read('lib/site-url.ts');
const homePage=read('app/page.tsx');
const safeImage=read('components/SafeImage.tsx');
const guidePage=read('app/guide/page.tsx');
const guideCategory=read('app/guide/category/[slug]/page.tsx');
const guideDetail=read('app/guide/[slug]/page.tsx');
const legacyCmsGuide=read('app/cam-nang/bai-viet/[slug]/page.tsx');
const unifiedGuideGrid=read('components/UnifiedGuideGrid.tsx');
const adminContentEditor=read('components/AdminContentEditor.tsx');
const adminCmsApi=read('app/api/admin/cms-content/route.ts');
const publishingStandard=read('lib/guide-publishing-standard.ts');

const publicRoutes=['/luu-tru','/tour-du-lich','/du-thuyen','/diem-den','/cam-nang','/san-pham','/gioi-thieu','/lien-he'];
for(const route of publicRoutes)must(sitemap,route,'sitemap');
for(const route of ['/stay','/tours','/cruises','/destinations','/guide','/product'])must(nextConfig,`source:'${route}`,'redirect legacy');
for(const route of ['/luu-tru','/tour-du-lich','/du-thuyen','/diem-den','/cam-nang','/san-pham'])must(nextConfig,`source:'${route}`,'rewrite tiếng Việt');
must(robots,'/admin/','robots');
must(robots,'/partner/','robots');
must(robots,'/affiliate/','robots');
must(robots,'/tim-kiem','robots');
must(robots,'sitemap.xml','robots');
must(sitemap,'getSiteUrl','sitemap phải dùng production host runtime');
must(robots,'getSiteUrl','robots phải dùng production host runtime');
must(siteUrl,'process.env.PUBLIC_SITE_URL','Canonical phải ưu tiên biến server-side PUBLIC_SITE_URL');
must(siteUrl,'process.env.NEXT_PUBLIC_SITE_URL','Canonical vẫn hỗ trợ cấu hình public hiện có');
must(siteUrl,'new URL(raw)','Canonical environment phải được validate như URL tuyệt đối');
must(siteUrl,'process.env.VERCEL_PROJECT_PRODUCTION_URL','Canonical phải fallback về production domain ổn định của Vercel');
if(siteUrl.includes('process.env.VERCEL_URL'))fail('Canonical không được tự chuyển sang preview deployment host');
must(homePage,'rel="preload" as="image"','Trang chủ phải preload đúng ảnh hero quan trọng nhất');
must(homePage,'fetchPriority="high"','Hero preload phải có ưu tiên tải cao');
must(safeImage,'decoding="async"','Ảnh dùng chung phải decode bất đồng bộ');
must(safeImage,'new window.Image()','Ảnh nền phải probe lỗi bằng Image API thay vì render ảnh ẩn');
if(safeImage.includes('aria-hidden="true"')||safeImage.includes("style={{display:'none'}}"))fail('SafeBackground không được render ảnh probe ẩn');

// Cẩm nang phải có đúng một luồng public: bài CMS hòa vào grid chuẩn, có ảnh đại diện và URL /cam-nang/:slug.
must(guidePage,'UnifiedGuideGrid','Trang Cẩm nang phải dùng grid thống nhất');
must(guideCategory,'UnifiedGuideGrid','Chuyên mục Cẩm nang phải dùng grid thống nhất');
if(guidePage.includes('GuideCmsList')||guidePage.includes('BÀI VIẾT TỪ QUẢN TRỊ')||guidePage.includes('Nội dung mới xuất bản'))fail('Trang Cẩm nang không được tách khu bài quản trị');
if(guideCategory.includes('GuideCategoryCmsList')||guideCategory.includes('BÀI MỚI TỪ QUẢN TRỊ'))fail('Chuyên mục Cẩm nang không được tách khu bài quản trị');
must(unifiedGuideGrid,'/cam-nang/${encodeURIComponent(item.slug)}','Bài CMS phải dùng URL Cẩm nang chuẩn');
must(unifiedGuideGrid,'item.cover','Card Cẩm nang phải dùng ảnh đại diện thật');
must(guideDetail,'getPublishedGuideSeo','URL Cẩm nang chuẩn phải đọc được bài CMS');
must(legacyCmsGuide,'permanentRedirect','URL CMS cũ phải redirect vĩnh viễn');
must(legacyCmsGuide,'/cam-nang/${encodeURIComponent(slug)}','URL CMS cũ phải về canonical /cam-nang/:slug');
must(adminContentEditor,'guidePublishIssues','Admin phải chặn bài chưa đạt chuẩn SEO');
must(adminContentEditor,'Ảnh đại diện *','Admin phải đánh dấu ảnh đại diện bắt buộc');
must(adminContentEditor,'GUIDE_SEO_TEMPLATE','Bài mới phải có khung SEO chuẩn');
must(adminCmsApi,'guidePublishIssues','API phải kiểm tra chuẩn SEO phía server');
must(adminCmsApi,'GUIDE_ARTICLE_STATE_KEY','Admin và public phải dùng cùng nguồn bài viết');
must(publishingStandard,"issues.push('Bắt buộc có ảnh đại diện')",'Chuẩn SEO phải bắt buộc ảnh đại diện');
must(publishingStandard,'words<700','Chuẩn SEO phải kiểm tra chiều sâu nội dung');

const metadataPages={
 'app/stay/page.tsx':'/luu-tru',
 'app/tours/page.tsx':'/tour-du-lich',
 'app/cruises/page.tsx':'/du-thuyen',
 'app/destinations/page.tsx':'/diem-den',
 'app/guide/page.tsx':'/cam-nang',
 'app/about/page.tsx':'/gioi-thieu',
 'app/contact/page.tsx':'/lien-he',
 'app/terms/page.tsx':'/dieu-khoan',
 'app/privacy/page.tsx':'/chinh-sach-bao-mat',
 'app/payment-guide/page.tsx':'/huong-dan-thanh-toan',
 'app/stay/[slug]/page.tsx':'/luu-tru/',
 'app/tours/[slug]/page.tsx':'/tour-du-lich/',
 'app/cruises/[slug]/page.tsx':'/du-thuyen/',
 'app/product/[slug]/page.tsx':'/san-pham/',
 'app/guide/[slug]/page.tsx':'/cam-nang/',
 'app/guide/category/[slug]/page.tsx':'/cam-nang/danh-muc/',
 'app/diem-den/[slug]/page.tsx':'/diem-den/',
 'app/diem-den/long-hai/page.tsx':'/diem-den/long-hai',
 'app/diem-den/vung-tau/page.tsx':'/diem-den/vung-tau'
};
for(const [file,route] of Object.entries(metadataPages)){
 const text=read(file);
 must(text,'getSiteUrl',`${file} canonical runtime`);
 must(text,route,`${file} canonical path`);
 if(/https:\/\/happygo\.vn(?:\/|['"`])/.test(text))fail(`${file} vẫn chứa URL domain custom chưa gắn`);
 if(!/description\s*:/.test(text))fail(`${file} thiếu meta description`);
}

const scanRoots=['app','components'];
const legacyLinkPatterns=[
 /href=(?:"|')\/stay(?:[/?"'])/g,
 /href=(?:"|')\/tours(?:[/?"'])/g,
 /href=(?:"|')\/cruises(?:[/?"'])/g,
 /href=(?:"|')\/destinations(?:[/?"'])/g,
 /href=(?:"|')\/guide(?:[/?"'])/g,
 /href=(?:"|')\/product(?:[/?"'])/g,
 /href=(?:"|')\/about(?:[/?"'])/g,
 /href=(?:"|')\/contact(?:[/?"'])/g
];
function walk(dir){
 for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const rel=path.join(dir,entry.name);
  if(entry.isDirectory())walk(rel);
  else if(/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)){
   const text=read(rel);
   for(const pattern of legacyLinkPatterns){pattern.lastIndex=0;if(pattern.test(text))fail(`${rel} còn link public cũ: ${pattern}`)}
   if(rel.startsWith(`app${path.sep}`)&&/https:\/\/happygo\.vn(?:\/|['"`])/.test(text))fail(`${rel} còn URL happygo.vn trước khi gắn domain`);
  }
 }
}
for(const dir of scanRoots)walk(dir);

if(!process.exitCode)console.log('SEO regression checks passed.');
