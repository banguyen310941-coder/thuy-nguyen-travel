import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const has=(text,needle)=>text.includes(needle);

const dashboardApi=read('app/api/affiliate/dashboard/route.ts');
const generateApi=read('app/api/affiliate/generate-link/route.ts');
const trackApi=read('app/api/affiliate/track/route.ts');
const historyApi=read('app/api/affiliate/history/route.ts');
const affiliateServer=read('lib/server/affiliate.ts');
const capture=read('components/AffiliateAttributionCapture.tsx');
const dashboardUi=read('components/AffiliateDashboard.tsx');
const historyUi=read('components/AffiliateHistoryBrowser.tsx');
const toolkit=read('components/AffiliateSalesToolkitDrawer.tsx');
const dashboardPage=read('app/affiliate/dashboard/page.tsx');

check(has(dashboardApi,'/san-pham/${encodeURIComponent(String(p.slug))}?ref='),'Dashboard CTV phải sinh link affiliate trực tiếp trên URL public /san-pham/:slug.');
check(!has(dashboardApi,'/product?slug='),'Dashboard CTV không được phát link legacy /product?slug=.');
check(has(generateApi,'/san-pham/${encodeURIComponent(String(villa.slug))}?ref='),'API tạo link CTV phải trả URL public chuẩn tiếng Việt.');
check(!has(generateApi,'/product?slug='),'API tạo link CTV không được trả URL legacy.');

check(has(trackApi,"productId=String(body.productId||body.villaId||'').trim()"),'Tracking CTV phải nhận productId mới và vẫn tương thích villaId cũ.');
check(has(trackApi,'findTrackableProduct(sql,productId)'),'Tracking CTV phải kiểm tra sản phẩm công khai bằng hàm dùng chung.');
check(has(trackApi,"String(product.slug||'').toLowerCase()!==slug.toLowerCase()"),'Tracking phải đối chiếu productId với slug để chặn attribution sang nhầm sản phẩm.');
check(has(trackApi,"Sản phẩm và link CTV không khớp."),'Tracking phải trả lỗi rõ khi slug và productId không khớp.');
check(has(trackApi,"a.status='active' and s.status='active' and s.role='affiliate'"),'Tracking chỉ chấp nhận CTV và staff đang hoạt động.');
check(has(trackApi,'productType:String(product.type||\'\')'),'Tracking phải trả loại sản phẩm đã ghi nhận để hỗ trợ chẩn đoán.');

check(has(affiliateServer,'export async function findTrackableProduct'),'Server affiliate phải có bộ kiểm tra sản phẩm dùng chung cho mọi loại sản phẩm công khai.');
check(!has(affiliateServer,"p.type='Villa & Resort'"),'Tracking sản phẩm không được giới hạn cứng chỉ Villa & Resort.');
check(has(affiliateServer,"exists(select 1 from staff s where s.id=affiliates.user_id and s.status='active' and s.role='affiliate')"),'Ghi referral phải xác nhận staff CTV vẫn active.');
check(has(affiliateServer,'from booking_items bi where bi.booking_id=${bookingId}'),'Referral phải đối chiếu sản phẩm thực tế trong booking.');
check(has(affiliateServer,'lower(trim(bi.product_name_snapshot))=lower(trim(${String(product.name)}))'),'Referral phải khớp tên sản phẩm attribution với booking item trước khi ghi nhận.');
check(has(affiliateServer,"join staff s on s.id=a.user_id join bookings b on b.id=ar.booking_id"),'Đối soát hoa hồng phải join trạng thái staff CTV.');
check(has(affiliateServer,"b.status='completed' and s.status='active' and s.role='affiliate'"),'Chỉ CTV có staff active mới được ghi có hoa hồng booking hoàn tất.');

check(has(capture,'params.get(\'product_id\')||params.get(\'villa_id\')'),'Client attribution phải hỗ trợ product_id mới và villa_id cũ.');
check(has(capture,'JSON.stringify({code,productId,villaId:productId,slug})'),'Client attribution phải gửi productId đồng thời giữ field villaId tương thích.');
check(has(capture,'inFlight.current.has(key)'),'Client attribution phải chặn request trùng đang chạy.');
check(has(capture,'sessionStorage.getItem(`happygo-affiliate-track:${key}`)'),'Client attribution phải tránh track lặp trong cùng phiên trình duyệt.');
check(has(capture,"params.delete('ref');params.delete('product_id');params.delete('villa_id')"),'Sau khi track thành công phải dọn toàn bộ query attribution khỏi URL.');
check(has(capture,'window.history.replaceState'),'Dọn query attribution phải dùng replaceState, không reload trang.');

check(has(dashboardUi,"products?:Product[];villas:Product[]"),'Dashboard CTV phải nhận danh sách products đầy đủ và vẫn tương thích villas.');
check(has(dashboardUi,'data?.products?.length?data.products:data?.villas||[]'),'Dashboard CTV phải ưu tiên toàn bộ sản phẩm công khai thay vì chỉ villa.');
check(has(dashboardUi,'Chọn sản phẩm để copy link'),'Dashboard CTV phải dùng ngôn ngữ sản phẩm chung.');
check(has(dashboardUi,"`${v.name} ${v.place} ${v.type}`"),'Tìm kiếm link CTV phải tìm được theo tên, khu vực và loại sản phẩm.');
check(has(dashboardUi,'<th>Sản phẩm</th>'),'Lịch sử booking CTV phải dùng nhãn Sản phẩm thay cho Villa.');

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
console.log('CTV Portal regression OK: all-product affiliate links, product-safe attribution/referrals, active-staff settlement, paginated history and fresh sales toolkit are guarded.');
