import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const safe='components/SafeImage.tsx';
must(safe,'new window.Image()','SafeBackground phải kiểm lỗi ảnh bằng Image probe');
mustNot(safe,'style={{display:\'none\'}}','SafeBackground không được dùng img ẩn để probe');
mustNot(safe,'aria-hidden="true"','SafeBackground không được render img ẩn');
must(safe,'decoding="async"','SafeImage phải decode bất đồng bộ');
must(safe,'@next/next/no-img-element','Ngoại lệ raw image phải được giới hạn tại shared image boundary');

for(const path of ['app/guide/page.tsx','components/GuideArticleReader.tsx','components/GuideArticleEditable.tsx']){
 must(path,"from '@/components/SafeImage'",`${path} phải dùng SafeImage`);
 mustNot(path,'<img ',`${path} không được render img trực tiếp`);
}

if(failures.length){console.error('\nImage boundary regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Image boundary regression checks passed.');
