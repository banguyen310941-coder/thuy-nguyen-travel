import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const reader='components/GuideArticleReader.tsx';
const config='next.config.mjs';

must(reader,'function sanitizeEditorHtml(value:string)','Cẩm nang dynamic phải có sanitizer trước dangerouslySetInnerHTML');
must(reader,'.replace(/<script\\b[\\s\\S]*?<\\/script\\s*>/gi','Sanitizer phải loại script block');
must(reader,'.replace(/<iframe\\b[\\s\\S]*?<\\/iframe\\s*>/gi','Sanitizer phải loại iframe block và srcdoc attack');
must(reader,'.replace(/<object\\b[\\s\\S]*?<\\/object\\s*>/gi','Sanitizer phải loại object block');
must(reader,'.replace(/<\\/?(?:script|iframe|object|embed)\\b[^>]*>/gi','Sanitizer phải loại cả executable tag không đóng/malformed');
must(reader,'(?:on[a-z0-9_-]+|srcdoc)','Sanitizer phải loại mọi inline event attribute và srcdoc, kể cả không có dấu nháy');
must(reader,'(?:javascript|vbscript)','Sanitizer phải vô hiệu hóa script URL scheme');
must(reader,'dangerouslySetInnerHTML={{__html:safeHtml}}','HTML CMS chỉ được render từ biến đã sanitize');
mustNot(reader,'.replace(/\\son\\w+\\s*=\\s*(["\']).*?\\1/gi','Không được quay lại regex event handler chỉ chặn giá trị có dấu nháy');

must(config,'"script-src-attr \'none\'"','CSP phải chặn inline event handler ở lớp browser');
must(config,'"object-src \'none\'"','CSP phải tiếp tục cấm plugin/object');
must(config,'"frame-ancestors \'none\'"','CSP phải chống clickjacking');
must(config,'"script-src \'self\' \'unsafe-inline\'"','Giữ script-src tương thích Next cho đến khi có nonce migration đầy đủ');

if(failures.length){console.error('\nCMS XSS/CSP regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('CMS XSS/CSP regression checks passed.');
