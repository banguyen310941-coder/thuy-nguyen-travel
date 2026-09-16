export const GUIDE_ARTICLE_STATE_KEY='tn_cms_articles_v3';

export const GUIDE_EDITORIAL_RULES=[
 'Chỉ viết dữ kiện có thể kiểm chứng từ dữ liệu HappyGo, website chính thức của dự án/đơn vị vận hành hoặc nguồn du lịch có thẩm quyền; không bịa, không suy diễn để kéo dài bài.',
 'Bài nói về dự án, villa, resort, khách sạn, du thuyền hoặc tour nào thì ảnh phải đúng chính dự án/sản phẩm đó. Bài điểm đến phải dùng ảnh đúng điểm đến được nhắc tới.',
 'Ưu tiên ảnh từ gallery sản phẩm HappyGo, thư viện ảnh HappyGo hoặc kênh chính thức của dự án. Không dùng ảnh stock/minh họa chung nếu đã có ảnh thật.',
 'Không dùng Wikimedia Commons, Creative Commons, Unsplash, Pexels, Pixabay, Flickr hoặc ảnh có credit/người chụp không liên quan làm ảnh SEO production.',
 'Không chèn đoạn văn kể về nguồn ảnh, giấy phép ảnh hoặc người chụp vào nội dung bài. Credit kỹ thuật không được biến thành nội dung SEO.',
 'Ảnh phải rõ, sáng, bố cục đẹp và mô tả đúng bằng alt/caption; không dùng ảnh mờ, ảnh cũ xấu, watermark lớn hoặc ảnh sai hạng phòng/căn.',
 'Không để placeholder, câu mẫu, đoạn lặp hoặc thông tin chung chung không giúp người đọc ra quyết định.',
 'Trước khi xuất bản phải xác nhận thủ công hai việc: dữ kiện đã kiểm chứng và toàn bộ ảnh đã đối chiếu đúng dự án/điểm đến.'
] as const;

export const GUIDE_SEO_TEMPLATE=`<h2>Tổng quan và thông tin người đọc cần biết</h2>
<p>[VIẾT LẠI] Nêu chủ đề và dữ kiện đã kiểm chứng, không dùng câu chung chung để kéo dài bài.</p>
<h2>Trải nghiệm, cách chọn hoặc lịch trình thực tế</h2>
<h3>Điểm quan trọng thứ nhất</h3>
<p>[VIẾT LẠI] Phân tích dựa trên thông tin có nguồn kiểm chứng...</p>
<h3>Điểm quan trọng thứ hai</h3>
<p>[VIẾT LẠI] Bổ sung tình huống thực tế, không suy diễn...</p>
<h2>Chi phí, giá và điều kiện cần kiểm tra</h2>
<p>[VIẾT LẠI] Chỉ nêu giá/điều kiện khi có dữ liệu và ghi rõ yếu tố có thể thay đổi theo ngày...</p>
<h2>Kinh nghiệm và lưu ý quan trọng</h2>
<p>[VIẾT LẠI] Checklist thực tế cho người đọc...</p>
<h2>Câu hỏi thường gặp</h2>
<h3>Câu hỏi người đọc thường tìm kiếm?</h3>
<p>[VIẾT LẠI] Trả lời ngắn gọn, trực tiếp, có cơ sở...</p>
<h3>Cần kiểm tra gì trước khi đặt dịch vụ?</h3>
<p>[VIẾT LẠI] Trả lời theo dữ liệu HappyGo/dự án...</p>
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
 factsVerified?:unknown;
 imagesVerified?:unknown;
 imageContext?:unknown;
 sourceNotes?:unknown;
};

const BLOCKED_IMAGE_SOURCE=/(?:commons\.wikimedia\.org|upload\.wikimedia\.org|wikimedia\.org|images\.unsplash\.com|unsplash\.com|pexels\.com|pixabay\.com|flickr\.com|staticflickr\.com)/i;
const BLOCKED_SOURCE_TEXT=/(?:wikimedia\s+commons|creative\s+commons|\bcc\s+by(?:-sa)?\b|obakeneko|ảnh\s+minh\s+họa|hình\s+minh\s+họa|unsplash|pexels|pixabay|flickr)/i;
const PLACEHOLDER_TEXT=/(?:\[VIẾT LẠI\]|viết phần giới thiệu|phân tích chi tiết|gợi ý quan trọng thứ|câu hỏi 1\?|câu hỏi 2\?|mô tả ảnh|lorem ipsum)/i;

export function guideTextOnly(value:unknown){return String(value||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim()}
export function guideWordCount(value:unknown){const text=guideTextOnly(value);return text?text.split(/\s+/).length:0}
export function guideReadTime(value:unknown){const words=guideWordCount(value);return `${Math.max(1,Math.ceil(words/220))} phút đọc`}

function imageTags(content:string){return [...content.matchAll(/<img\b[^>]*>/gi)].map(match=>match[0])}
function attr(tag:string,name:string){const match=tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,'i'));return String(match?.[1]||match?.[2]||match?.[3]||'').trim()}
function invalidImageUrl(src:string){if(!src)return true;if(/^data:/i.test(src))return true;if(src.startsWith('/'))return false;try{const url=new URL(src);return url.protocol!=='https:'}catch{return true}}

export function guidePublishIssues(item:PublishArticle){
 const title=String(item.title||'').trim();
 const seoTitle=String(item.seoTitle||title).trim();
 const description=String(item.seoDescription||'').trim();
 const slug=String(item.slug||'').trim();
 const excerpt=String(item.excerpt||'').trim();
 const cover=String(item.cover||'').trim();
 const content=String(item.content||'');
 const sourceNotes=String(item.sourceNotes||'').trim();
 const imageContext=String(item.imageContext||'').trim();
 const words=guideWordCount(content);
 const issues:string[]=[];
 if(title.length<35||title.length>70)issues.push('Tiêu đề phải từ 35–70 ký tự');
 if(seoTitle.length<40||seoTitle.length>65)issues.push('SEO title phải từ 40–65 ký tự');
 if(description.length<120||description.length>160)issues.push('Meta description phải từ 120–160 ký tự');
 if(!slug||slug.length>75)issues.push('URL phải ngắn, rõ nghĩa và không quá 75 ký tự');
 if(!cover)issues.push('Bắt buộc có ảnh đại diện');
 else if(!/^(?:https?:\/\/|\/)/i.test(cover))issues.push('Ảnh đại diện phải là URL hợp lệ');
 else if(BLOCKED_IMAGE_SOURCE.test(cover))issues.push('Ảnh đại diện dùng nguồn ảnh minh họa/stock bị cấm');
 if(excerpt.length<80)issues.push('Sapo/mô tả ngắn phải có ít nhất 80 ký tự');
 if(words<700)issues.push(`Nội dung phải có ít nhất 700 từ (hiện ${words} từ)`);
 if(!/<h2[ >]/i.test(content))issues.push('Nội dung phải có H2');
 if(!/<h3[ >]/i.test(content))issues.push('Nội dung phải có H3');
 if(!/<a\s/i.test(content))issues.push('Nội dung phải có ít nhất một liên kết nội bộ hoặc CTA');
 if(PLACEHOLDER_TEXT.test(content))issues.push('Bài còn placeholder/câu mẫu chưa được viết lại');
 if(BLOCKED_SOURCE_TEXT.test(content))issues.push('Nội dung hoặc caption còn nguồn ảnh minh họa/stock không đạt chuẩn HappyGo');
 if(!Boolean(item.factsVerified))issues.push('Chưa xác nhận dữ kiện đã được kiểm chứng');
 if(sourceNotes.length<20)issues.push('Phải ghi nguồn kiểm chứng nội bộ/chính thức trong ô Nguồn dữ kiện');
 if(!Boolean(item.imagesVerified))issues.push('Chưa xác nhận toàn bộ ảnh đúng dự án/điểm đến');
 if(imageContext.length<3)issues.push('Phải ghi dự án/điểm đến/album dùng để đối chiếu ảnh');
 const tags=imageTags(content);
 if(tags.length<1)issues.push('Nội dung phải có ít nhất một ảnh thật đúng dự án/điểm đến');
 let badUrl=false,blocked=false,badAlt=false;
 for(const tag of tags){const src=attr(tag,'src'),alt=attr(tag,'alt');if(invalidImageUrl(src))badUrl=true;if(BLOCKED_IMAGE_SOURCE.test(src))blocked=true;if(alt.length<8||/mô tả ảnh|ảnh website|image|photo/i.test(alt))badAlt=true}
 if(badUrl)issues.push('Ảnh trong bài phải dùng URL HTTPS/đường dẫn production, không dùng data URI hoặc URL lỗi');
 if(blocked)issues.push('Ảnh trong bài có nguồn Wikimedia/stock bị cấm');
 if(badAlt)issues.push('Mỗi ảnh phải có alt cụ thể nêu đúng dự án/điểm đến/hạng ảnh');
 return [...new Set(issues)];
}

export function guideCanPublish(item:PublishArticle){return guidePublishIssues(item).length===0}
