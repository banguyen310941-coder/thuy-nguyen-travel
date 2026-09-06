import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const fail=(message)=>{console.error(`SEO regression: ${message}`);process.exitCode=1};
const must=(text,needle,label)=>{if(!text.includes(needle))fail(`${label} thiếu: ${needle}`)};

const nextConfig=read('next.config.mjs');
const sitemap=read('app/sitemap.ts');
const robots=read('app/robots.ts');

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
 'app/payment-guide/page.tsx':'/huong-dan-thanh-toan'
};
for(const [file,route] of Object.entries(metadataPages)){
 const text=read(file);
 must(text,'getSiteUrl',`${file} canonical runtime`);
 must(text,route,`${file} canonical path`);
 if(text.includes("const canonical='https://happygo.vn"))fail(`${file} vẫn hardcode domain chưa gắn`);
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
  }
 }
}
for(const dir of scanRoots)walk(dir);

if(!process.exitCode)console.log('SEO regression checks passed.');
