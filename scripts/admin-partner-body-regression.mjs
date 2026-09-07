import {readFileSync} from 'node:fs';

const failures=[];
const path='app/api/admin/partners/route.ts';
const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(needle,label)=>{if(!source.includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(needle,label)=>{if(source.includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

must("import {readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse'",'Admin Partner API phải dùng bounded parser chung');
must('requestBodyTooLarge(req,16384)','PATCH Partner phải fail sớm khi Content-Length vượt ngưỡng');
must('readBoundedJson(req,16384)','PATCH Partner phải giới hạn byte thực tế khi stream');
must("status:413",'Body quá lớn phải trả HTTP 413');
must("const actor=await adminActor(req,'partners')",'Phải xác thực quyền trước khi parse body');
must('update partners set status=${status},updated_at=now()','Đổi trạng thái Partner phải tiếp tục bump security version');
mustNot('await req.json()','Admin Partner write không được buffer JSON không giới hạn');

if(failures.length){console.error('\nAdmin Partner body regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin Partner body regression checks passed.');
