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
 'app/cam-nang/bai-viet/[slug]/page.tsx':'/cam-nang/bai-viet/',
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
