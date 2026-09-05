import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const dashboardApi=read('app/api/affiliate/dashboard/route.ts');
const generateApi=read('app/api/affiliate/generate-link/route.ts');
const trackApi=read('app/api/affiliate/track/route.ts');
const historyApi=read('app/api/affiliate/history/route.ts');
const capture=read('components/AffiliateAttributionCapture.tsx');
const historyUi=read('components/AffiliateHistoryBrowser.tsx');
const toolkit=read('components/AffiliateSalesToolkitDrawer.tsx');
const dashboardPage=read('app/affiliate/dashboard/page.tsx');

check(has(dashboardApi,'/san-pham/${encodeURIComponent(String(p.slug))}?ref='),'Dashboard CTV phải sinh link affiliate trực tiếp trên URL public /san-pham/:slug.');
check(!has(dashboardApi,'/product?slug='),'Dashboard CTV không được phát link legacy /product?slug=.');
check(has(generateApi,'/san-pham/${encodeURIComponent(String(villa.slug))}?ref='),'API tạo link CTV phải trả URL public chuẩn tiếng Việt.');
check(!has(generateApi,'/product?slug='),'API tạo link CTV không được trả URL legacy.');

check(has(trackApi,"slug=String(body.slug||'').trim()"),'Tracking CTV phải nhận slug của sản phẩm khách đang xem.');
check(has(trackApi,"String(villa.slug||'').toLowerCase()!==slug.toLowerCase()"),'Tracking phải đối chiếu villa_id với slug để chặn attribution sang nhầm sản phẩm.');
check(has(trackApi,"Sản phẩm và link CTV không khớp."),'Tracking phải trả lỗi rõ khi slug và villa_id không khớp.');
check(has(trackApi,"a.status='active' and s.status='active' and s.role='affiliate'"),'Tracking chỉ chấp nhận CTV và staff đang hoạt động.');

check(has(capture,'JSON.stringify({code,villaId,slug})'),'Client attribution phải gửi cả code, villaId và slug.');
check(has(capture,'inFlight.current.has(key)'),'Client attribution phải chặn request trùng đang chạy.');
check(has(capture,'sessionStorage.getItem(`happygo-affiliate-track:${key}`)'),'Client attribution phải tránh track lặp trong cùng phiên trình duyệt.');
check(has(capture,"params.delete('ref');params.delete('villa_id')"),'Sau khi track thành công phải dọn ref và villa_id khỏi URL để tránh chia sẻ nhầm attribution.');
check(has(capture,'window.history.replaceState'),'Dọn query attribution phải dùng replaceState, không reload trang.');

check(has(historyApi,"affiliateActor(req)"),'API lịch sử phải bắt buộc session CTV active.');
check(has(historyApi,"['referrals','payouts'].includes(kind)"),'API lịch sử phải giới hạn loại dữ liệu được phép truy vấn.');
check(has(historyApi,'Math.max(1,intParam(req.nextUrl.searchParams.get(\'limit\'),50,100))'),'API lịch sử phải giới hạn page size tối đa 100.');
check(has(historyApi,'limit ${limit+1} offset ${offset}'),'API lịch sử phải dùng limit+1 để xác định còn trang tiếp theo.');
check(has(historyApi,'customerPhone:maskPhone(r.customer_phone)'),'Lịch sử booking CTV phải tiếp tục che số điện thoại khách.');
check(has(historyApi,'pagination:{limit,offset,total:Number(totalRows[0]?.total||0),hasMore,nextOffset:hasMore?offset+limit:null}'),'API lịch sử phải trả total, hasMore và nextOffset.');
check(has(historyApi,"'Cache-Control':'no-store, max-age=0'"),'Lịch sử tài chính CTV không được cache.');

check(has(historyUi,"fetch(`/api/affiliate/history?kind=${kindValue}&limit=50&offset=${offset}`"),'UI lịch sử phải tải dữ liệu theo trang từ API riêng.');
check(has(historyUi,'request.current'),'UI lịch sử phải bỏ response cũ khi người dùng đổi tab/tải lại nhanh.');
check(has(historyUi,'incoming.filter(row=>!prev.some(old=>old.id===row.id))'),'UI tải thêm phải loại bản ghi trùng.');
check(has(historyUi,"window.addEventListener('focus',refresh)"),'UI lịch sử phải refresh khi quay lại cửa sổ.');
check(has(historyUi,'Tải thêm 50 bản ghi'),'UI lịch sử phải có thao tác tải thêm rõ ràng.');
check(has(historyUi,'Ghi nhận {date(r.creditedAt)}'),'Lịch sử hoa hồng phải hiển thị thời điểm ghi có khi có dữ liệu.');
check(has(historyUi,'aria-live="polite"'),'Lỗi lịch sử phải được công bố cho công nghệ hỗ trợ.');

check(has(toolkit,'const request=useRef(0)'),'Bộ công cụ bán hàng phải có stale-response guard.');
check(has(toolkit,'if(open)void load()'),'Mỗi lần mở bộ công cụ phải refresh dữ liệu production.');
check(has(toolkit,"window.addEventListener('focus',refresh)"),'Bộ công cụ đang mở phải refresh khi quay lại cửa sổ.');
check(has(toolkit,'aria-label="Làm mới bộ công cụ"'),'Bộ công cụ phải có nút refresh có nhãn accessibility.');
check(has(dashboardPage,'<AffiliateHistoryBrowser/>'),'Dashboard CTV phải gắn trình duyệt lịch sử giao dịch đầy đủ.');

if(failures.length){
 console.error('\nCTV Portal regression FAILED:\n- '+failures.join('\n- '));
 process.exit(1);
}
console.log('CTV Portal regression OK: canonical affiliate links, slug-safe attribution, paginated history and fresh sales toolkit are guarded.');
