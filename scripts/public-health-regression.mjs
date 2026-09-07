import {readFileSync} from 'node:fs';

const failures=[];
const route=readFileSync(new URL('../app/api/health/route.ts',import.meta.url),'utf8');
const must=(needle,label)=>{if(!route.includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)}`)};
const mustNot=(needle,label)=>{if(route.includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)}`)};

must("database:{ok:database.ok}",'Health public chỉ được xuất trạng thái DB tối thiểu');
must("'Cache-Control':'no-store, max-age=0'",'Health phải luôn no-store');
must("'Pragma':'no-cache'",'Health phải chặn cache proxy cũ');
must('status:database.ok?200:503','Health vẫn phải giữ status monitoring');
mustNot('environment:process.env','Health public không được lộ environment production');
mustNot("runtime:'nextjs-server'",'Health public không cần lộ runtime nội bộ');
mustNot('{service:\'HappyGo Travel API\',ok:database.ok,runtime','Không được quay lại payload health cũ');
mustNot('database,timestamp','Không được trả nguyên databaseHealth ra public');

if(failures.length){console.error('\nPublic health regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Public health regression checks passed.');
