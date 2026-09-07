export const GUIDE_ARTICLE_STATE_KEY='tn_cms_articles_v3';

export const GUIDE_SEO_TEMPLATE=`<h2>Tổng quan và thông tin người đọc cần biết</h2>
<p>Giới thiệu chủ đề, nhu cầu tìm kiếm chính và giá trị thực tế của bài viết...</p>
<h2>Lịch trình, cách chọn hoặc trải nghiệm thực tế</h2>
<h3>Gợi ý quan trọng đầu tiên</h3>
<p>Phân tích chi tiết, ưu nhược điểm và cách áp dụng...</p>
<h3>Gợi ý quan trọng thứ hai</h3>
<p>Bổ sung ví dụ, tình huống thực tế và lời khuyên...</p>
<h2>Chi phí, giá và điều kiện cần kiểm tra</h2>
<p>Nêu các nhóm chi phí, yếu tố làm giá thay đổi và lưu ý xác nhận theo ngày thực tế...</p>
<h2>Kinh nghiệm và lưu ý quan trọng</h2>
<p>Tổng hợp checklist, lỗi thường gặp và cách chuẩn bị trước chuyến đi...</p>
<h2>Câu hỏi thường gặp</h2>
<h3>Câu hỏi người đọc thường tìm kiếm?</h3>
<p>Trả lời ngắn gọn, trực tiếp và có thông tin hữu ích...</p>
<h3>Cần kiểm tra gì trước khi đặt dịch vụ?</h3>
<p>Trả lời và hướng người đọc đến bước kiểm tra phù hợp...</p>
<p><a href="/tim-kiem">Xem dịch vụ phù hợp tại HappyGo Travel</a></p>`;

type PublishArticle={
 title?:unknown;
 slug?:unknown;
 excerpt?:unknown;
 cover?:unknown;
 content?:unknown;
 seoTitle?:unknown;
 seoDescription?:unknown;
 status?:unknown;
};

export function guideTextOnly(value:unknown){return String(value||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim()}
export function guideWordCount(value:unknown){const text=guideTextOnly(value);return text?text.split(/\s+/).length:0}
export function guideReadTime(value:unknown){const words=guideWordCount(value);return `${Math.max(1,Math.ceil(words/220))} phút đọc`}

export function guidePublishIssues(item:PublishArticle){
 const title=String(item.title||'').trim();
 const seoTitle=String(item.seoTitle||title).trim();
 const description=String(item.seoDescription||'').trim();
 const slug=String(item.slug||'').trim();
 const excerpt=String(item.excerpt||'').trim();
 const cover=String(item.cover||'').trim();
 const content=String(item.content||'');
 const words=guideWordCount(content);
 const issues:string[]=[];
 if(title.length<35||title.length>70)issues.push('Tiêu đề phải từ 35–70 ký tự');
 if(seoTitle.length<40||seoTitle.length>65)issues.push('SEO title phải từ 40–65 ký tự');
 if(description.length<120||description.length>160)issues.push('Meta description phải từ 120–160 ký tự');
 if(!slug||slug.length>75)issues.push('URL phải ngắn, rõ nghĩa và không quá 75 ký tự');
 if(!cover)issues.push('Bắt buộc có ảnh đại diện');
 else if(!/^(?:https?:\/\/|\/)/i.test(cover))issues.push('Ảnh đại diện phải là URL hợp lệ');
 if(excerpt.length<80)issues.push('Sapo/mô tả ngắn phải có ít nhất 80 ký tự');
 if(words<700)issues.push(`Nội dung phải có ít nhất 700 từ (hiện ${words} từ)`);
 if(!/<h2[ >]/i.test(content))issues.push('Nội dung phải có H2');
 if(!/<h3[ >]/i.test(content))issues.push('Nội dung phải có H3');
 if(!/<a\s/i.test(content))issues.push('Nội dung phải có ít nhất một liên kết nội bộ hoặc CTA');
 return issues;
}

export function guideCanPublish(item:PublishArticle){return guidePublishIssues(item).length===0}
