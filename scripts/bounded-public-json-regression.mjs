import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

for(const [path,label] of [
 ['app/api/partner/auth/register/route.ts','Partner register'],
 ['app/api/partner/auth/login/route.ts','Partner login'],
 ['app/api/affiliate/auth/register/route.ts','CTV register'],
 ['app/api/affiliate/auth/login/route.ts','CTV login'],
]){
 must(path,'requestBodyTooLarge(req,8192)',`${label} phải fail sớm theo Content-Length khi có`);
 must(path,'readBoundedJson(req,8192)',`${label} phải đo kích thước JSON thực tế`);
}

must('app/api/newsletter/route.ts','readBoundedJson(req,8192)','Newsletter subscribe phải đo kích thước JSON thực tế');
const newsletter=read('app/api/newsletter/route.ts');
if((newsletter.match(/readBoundedJson\(req,8192\)/g)||[]).length<2)failures.push('Newsletter subscribe và unsubscribe đều phải dùng bounded JSON parser');

if(failures.length){console.error('\nBounded public JSON regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Bounded public JSON regression checks passed.');
