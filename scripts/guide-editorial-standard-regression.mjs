import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const standard=read('lib/guide-publishing-standard.ts');
const editor=read('components/AdminContentEditor.tsx');
const api=read('app/api/admin/cms-content/route.ts');
const failures=[];
const must=(text,needle,label)=>{if(!text.includes(needle))failures.push(label)};

must(standard,'GUIDE_EDITORIAL_RULES','Thiếu bộ nguyên tắc biên tập SEO HappyGo');
must(standard,'factsVerified','Thiếu xác nhận dữ kiện đã kiểm chứng');
must(standard,'imagesVerified','Thiếu xác nhận ảnh đúng dự án');
must(standard,'sourceNotes','Thiếu nguồn dữ kiện nội bộ/chính thức');
must(standard,'imageContext','Thiếu dự án/điểm đến dùng đối chiếu ảnh');
must(standard,'commons\\.wikimedia\\.org','Chưa chặn Wikimedia Commons');
must(standard,'unsplash\\.com','Chưa chặn ảnh stock Unsplash');
must(standard,'PLACEHOLDER_TEXT','Chưa chặn nội dung placeholder/lung tung');
must(standard,'Nội dung phải có ít nhất một ảnh thật đúng dự án/điểm đến','Chưa bắt buộc ảnh đúng ngữ cảnh');
must(editor,'Kiểm chứng nội dung & ảnh','CMS chưa hiển thị bước kiểm chứng');
must(editor,'Chọn / tải ảnh đúng dự án','CMS chưa yêu cầu ảnh đúng dự án');
must(editor,'Tôi xác nhận các dữ kiện chính đã được kiểm chứng','CMS chưa bắt xác nhận dữ kiện');
must(editor,'Tôi xác nhận toàn bộ ảnh đúng dự án/điểm đến','CMS chưa bắt xác nhận ảnh');
must(api,'guidePublishIssues(item)','API production chưa dùng cổng kiểm chuẩn bài viết');

if(failures.length){console.error('SEO editorial standard regression FAILED');for(const f of failures)console.error('- '+f);process.exit(1)}
console.log('SEO editorial standard regression passed.');
