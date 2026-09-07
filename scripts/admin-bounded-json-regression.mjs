import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const routes=[
 ['app/api/admin/payment-requests/route.ts','32_768','Đề xuất chi'],
 ['app/api/admin/products/route.ts','4_194_304','Sản phẩm'],
 ['app/api/admin/cms-content/route.ts','4_194_304','CMS'],
];

for(const [path,limit,label] of routes){
 must(path,"from '@/lib/server/public-abuse'",`${label} phải dùng bounded parser chung`);
 must(path,`requestBodyTooLarge(req,${limit})`,`${label} phải chặn Content-Length vượt trần sớm`);
 must(path,`readBoundedJson(req,${limit})`,`${label} phải chặn body chunked vượt trần`);
 must(path,'status:413',`${label} phải trả 413 khi request quá lớn`);
 mustNot(path,'await req.json()',`${label} không được buffer JSON không giới hạn`);
}

must('lib/server/public-abuse.ts','totalBytes>maxBytes','Bounded parser phải đếm byte thực tế khi stream');
must('lib/server/public-abuse.ts','reader.cancel()','Bounded parser phải dừng đọc khi vượt trần');

if(failures.length){console.error('\nAdmin bounded JSON regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin bounded JSON regression checks passed.');
