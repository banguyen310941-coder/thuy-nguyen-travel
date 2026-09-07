import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const email='app/api/admin/email-campaigns/send/route.ts';
must(email,"from '@/lib/server/public-abuse'",'Email campaign phải dùng bounded parser');
must(email,'requestBodyTooLarge(req,131_072)','Email campaign phải chặn Content-Length quá lớn');
must(email,'readBoundedJson(req,131_072)','Email campaign phải chặn body chunked quá lớn');
must(email,'status:413','Email campaign phải trả 413 khi payload vượt trần');
must(email,"url.protocol==='https:'||url.protocol==='http:'",'CTA email chỉ được dùng http/https');
must(email,'.slice(0,50_000)','Nội dung email phải có trần ký tự');
mustNot(email,'await req.json()','Email campaign không được buffer JSON không giới hạn');
mustNot(email,'{recipient,status:','Log gửi email không được ghi địa chỉ người nhận');

const trash='app/api/admin/cms-trash/route.ts';
must(trash,'requestBodyTooLarge(req,32_768)','Xóa CMS phải chặn Content-Length quá lớn');
must(trash,'readBoundedJson(req,32_768)','Xóa CMS phải chặn body chunked quá lớn');
must(trash,"!['relational','shared'].includes(source)",'Nguồn xóa CMS phải là allowlist');
must(trash,"source==='relational'&&(kind!=='products'||!uuid.test(id))",'Xóa sản phẩm relational phải kiểm UUID trước DB');
mustNot(trash,'await req.json()','Xóa CMS không được buffer JSON không giới hạn');

const drive='app/api/admin/drive/file/route.ts';
must(drive,'const DRIVE_ID=','Drive preview phải kiểm định dạng file ID');
must(drive,'fields=id,name,mimeType,webViewLink,parents,trashed','Drive preview phải đọc parent và trạng thái trash');
must(drive,'meta.parents.includes(folderId)','Drive preview phải giới hạn đúng thư mục HappyGo');
must(drive,"error:'Không đọc được file Google Drive.'",'Drive preview không được trả raw upstream error');
must(drive,"'Cache-Control':'no-store, max-age=0'",'Drive preview phải tránh cache nội dung nội bộ');
mustNot(drive,'await r.text()}`','Drive preview không được nhúng raw upstream body vào error');

const integrations='app/api/admin/integrations/status/route.ts';
must(integrations,"from 'node:crypto'",'Integration status phải dùng crypto constant-time');
must(integrations,'timingSafeEqual(a,b)','Integration status phải so khóa constant-time');
must(integrations,'provided.length!==expected.length','Integration status phải kiểm độ dài trước timingSafeEqual');
must(integrations,"'Cache-Control':'no-store, max-age=0'",'Integration status không được cache');
mustNot(integrations,"(req.headers.get('x-admin-key')||'')===expected",'Integration status không được so khóa bằng ===');

if(failures.length){console.error('\nAdmin operational security regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin operational security regression checks passed.');
