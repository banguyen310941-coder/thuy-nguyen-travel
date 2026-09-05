export type GuideImage={src:string;alt:string;credit?:string};
export type GuideFaq={q:string;a:string};
export type GuidePost={slug:string;title:string;category:string;excerpt:string;image:string;gallery:GuideImage[];date:string;readTime:string;keywords:string[];content:{heading:string;paragraphs:string[]}[];faq:GuideFaq[]};

const u=(id:string)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=86`;
const img=(id:string,alt:string):GuideImage=>({src:u(id),alt,credit:'Unsplash'});

const shared=[
 img('photo-1600607687920-4e2a09cf159d','Không gian villa nghỉ dưỡng hiện đại'),
 img('photo-1600566753086-00f18fb6b3ea','Phòng khách villa rộng rãi cho gia đình'),
 img('photo-1600607688969-a5bfcd646154','Không gian nghỉ dưỡng có hồ bơi và sân vườn'),
 img('photo-1601918774946-25832a4be0d6','Villa riêng tư phù hợp nhóm đông'),
 img('photo-1542314831-068cd1dbfeeb','Khu nghỉ dưỡng cao cấp gần biển')
];

export const guidePosts:GuidePost[]=[
{
 slug:'villa-flc-sam-son-kinh-nghiem-thue-gia-tot',title:'Villa FLC Sầm Sơn: Kinh nghiệm thuê căn đẹp, đúng nhu cầu và giá tốt',category:'FLC Sầm Sơn',
 excerpt:'Hướng dẫn chọn villa FLC Sầm Sơn theo số phòng ngủ, vị trí, tiện ích, ngày ở và ngân sách; kèm checklist tránh phụ thu và cách chốt căn phù hợp gia đình, nhóm bạn.',
 image:u('photo-1600607687920-4e2a09cf159d'),gallery:shared,date:'05/09/2026',readTime:'9 phút đọc',
 keywords:['villa flc sầm sơn','villa flc sam son','thuê villa flc sầm sơn','villa sầm sơn','flc sầm sơn villa'],
 content:[
  {heading:'1. Villa FLC Sầm Sơn phù hợp với nhóm nào?',paragraphs:['Villa FLC Sầm Sơn phù hợp nhất với gia đình nhiều thế hệ, nhóm bạn hoặc đoàn nhỏ muốn ở cùng một không gian thay vì tách thành nhiều phòng khách sạn. Khi chọn căn, nên bắt đầu từ số người thực tế, số phòng ngủ cần dùng và nhu cầu sinh hoạt chung.','Nếu có trẻ em hoặc người lớn tuổi, hãy ưu tiên căn dễ di chuyển, phòng ngủ tầng thấp và khoảng cách hợp lý tới khu vui chơi, bãi biển hoặc khu dịch vụ.']},
  {heading:'2. Chọn vị trí villa trong quần thể FLC Sầm Sơn',paragraphs:['Không phải mọi villa trong quần thể đều có trải nghiệm giống nhau. Một số căn thuận tiện ra biển, một số gần tiện ích, một số lại yên tĩnh hơn. Vì vậy cần xác định ưu tiên trước khi chọn căn.','Nhóm đi nghỉ dưỡng nên ưu tiên không gian riêng tư và sân vườn; nhóm có trẻ nhỏ nên chú ý quãng đường đi bộ; nhóm thích hoạt động chung nên cân nhắc căn có phòng khách rộng và khu sinh hoạt ngoài trời.']},
  {heading:'3. Giá villa FLC Sầm Sơn thay đổi theo ngày',paragraphs:['Giá thường khác giữa ngày thường, cuối tuần, mùa hè, dịp lễ và các giai đoạn cao điểm. Mức giá từ chỉ nên dùng để tham khảo ban đầu; giá chính xác cần dựa trên ngày nhận phòng, số đêm và căn cụ thể.','Khi hỏi giá, nên yêu cầu tổng tiền cuối cùng đã gồm các khoản bắt buộc, đồng thời xác nhận phụ thu khách thêm, dọn dẹp, nhận phòng sớm hoặc trả phòng muộn nếu có.']},
  {heading:'4. Checklist trước khi đặt villa FLC Sầm Sơn',paragraphs:['Trước khi chuyển khoản, cần kiểm tra tên hoặc mã căn, số phòng ngủ, sức chứa, tiện ích, vị trí, ngày ở, tổng giá, tiền cọc và điều kiện hoàn hủy. Ảnh phải là ảnh đúng căn hoặc được ghi rõ là ảnh đại diện.','Với nhóm đông, nên chỉ định một người phụ trách đặt phòng để tránh thông tin bị thay đổi giữa nhiều đầu mối.']}
 ],faq:[{q:'Villa FLC Sầm Sơn nên đặt trước bao lâu?',a:'Cuối tuần và mùa hè nên kiểm tra sớm vì các căn đẹp, đúng số phòng ngủ thường hết nhanh.'},{q:'Giá villa có cố định không?',a:'Không. Giá phụ thuộc ngày ở, mùa, cuối tuần và căn cụ thể.'}]
},
{
 slug:'biet-thu-flc-sam-son-kinh-nghiem-chon-can',title:'Biệt thự FLC Sầm Sơn: Cách chọn căn theo vị trí, số phòng và ngân sách',category:'FLC Sầm Sơn',
 excerpt:'Kinh nghiệm thuê biệt thự FLC Sầm Sơn cho gia đình và nhóm đông: chọn số phòng ngủ, vị trí, hồ bơi, bếp, chính sách và cách so sánh giá đúng.',
 image:u('photo-1600566753086-00f18fb6b3ea'),gallery:[...shared].reverse(),date:'05/09/2026',readTime:'8 phút đọc',
 keywords:['biệt thự flc sầm sơn','biet thu flc sam son','thuê biệt thự flc sầm sơn','biệt thự sầm sơn','flc sầm sơn'],
 content:[
  {heading:'1. Khác biệt giữa việc chọn biệt thự và chọn phòng khách sạn',paragraphs:['Biệt thự phù hợp khi cả nhóm cần không gian riêng, phòng khách chung và nhiều phòng ngủ trong cùng một căn. Việc chọn đúng biệt thự cần quan tâm tới công năng sử dụng chứ không chỉ ảnh đẹp.','Hãy tính số người ngủ thực tế, số cặp đôi, trẻ em và nhu cầu phòng riêng trước khi chốt số phòng ngủ.']},
  {heading:'2. Ưu tiên vị trí hay tiện ích?',paragraphs:['Nếu nhóm thường xuyên ra biển hoặc đi ăn ngoài, vị trí thuận tiện nên được ưu tiên. Nếu chủ yếu nghỉ tại căn, hồ bơi, sân vườn, bếp và khu sinh hoạt chung quan trọng hơn.','Một căn xa hơn nhưng đầy đủ tiện ích có thể phù hợp với nhóm nghỉ dưỡng, trong khi gia đình có trẻ nhỏ thường cần vị trí thuận tiện hơn.']},
  {heading:'3. Cách đọc bảng giá biệt thự FLC Sầm Sơn',paragraphs:['Nên so sánh giá theo đúng ngày ở và số khách. Không nên chỉ so sánh một mức giá từ vì cuối tuần và cao điểm có thể khác đáng kể.','Hỏi rõ tổng giá và các khoản phát sinh giúp tránh việc ngân sách thay đổi sau khi đã chốt căn.']},
  {heading:'4. Những thông tin cần xác nhận bằng văn bản',paragraphs:['Mã căn, số phòng ngủ, số khách, tổng tiền, cọc, giờ check-in, check-out, điều kiện hủy và người hỗ trợ tại chỗ nên được xác nhận rõ ràng.','Đây là bước đơn giản nhưng quan trọng để hạn chế nhầm căn hoặc hiểu khác nhau về quyền lợi.']}
 ],faq:[{q:'Biệt thự FLC Sầm Sơn có phù hợp gia đình lớn không?',a:'Có, nếu chọn đúng số phòng ngủ và sức chứa theo quy định của căn.'},{q:'Có nên chọn căn rẻ nhất?',a:'Nên so sánh cả vị trí, tiện ích, phụ thu và điều kiện hủy thay vì chỉ nhìn giá.'}]
},
{
 slug:'villa-long-hai-kinh-nghiem-thue-gan-bien',title:'Villa Long Hải: Kinh nghiệm thuê villa gần biển cho gia đình và nhóm bạn',category:'Long Hải',
 excerpt:'Cẩm nang thuê villa Long Hải gần biển: khu vực nên chọn, tiện ích cần có, mức giá theo ngày, cách kiểm tra ảnh thực tế và chính sách trước khi đặt.',
 image:u('photo-1601918774946-25832a4be0d6'),gallery:shared,date:'05/09/2026',readTime:'8 phút đọc',
 keywords:['villa long hải','villa long hai','thuê villa long hải','villa long hải gần biển','biệt thự long hải'],
 content:[
  {heading:'1. Vì sao Long Hải phù hợp cho chuyến đi ngắn ngày?',paragraphs:['Long Hải phù hợp với nhóm muốn nghỉ biển ngắn ngày, ưu tiên không gian riêng và lịch trình nhẹ. Villa là lựa chọn tốt khi gia đình hoặc nhóm bạn muốn ở cùng nhau và có khu sinh hoạt chung.','Khi tìm villa Long Hải, hãy xác định rõ nhu cầu gần biển, hồ bơi riêng, bếp hoặc sân BBQ để thu hẹp lựa chọn.']},
  {heading:'2. Chọn villa gần biển hay villa có hồ bơi?',paragraphs:['Nếu nhóm có trẻ nhỏ hoặc người lớn tuổi, khoảng cách tới biển là yếu tố đáng cân nhắc. Nếu nhóm chủ yếu nghỉ tại villa, hồ bơi và sân riêng lại quan trọng hơn.','Nên hỏi khoảng cách thực tế thay vì chỉ dựa vào mô tả “gần biển”.']},
  {heading:'3. Giá villa Long Hải',paragraphs:['Giá thay đổi theo ngày thường, cuối tuần, mùa du lịch và số lượng khách. Với nhóm đông, cần kiểm tra kỹ phụ thu và sức chứa tối đa.','Một báo giá tốt phải cho biết tổng tiền, khoản cọc và các chi phí bắt buộc khác.']},
  {heading:'4. Kiểm tra ảnh và chính sách',paragraphs:['Ảnh nên là ảnh đúng căn hoặc đúng loại căn. Nếu view, hồ bơi hoặc sân vườn là tiêu chí quan trọng, hãy xác nhận trước khi thanh toán.','Cũng cần đọc kỹ giờ nhận trả phòng, quy định tiếng ồn, nấu ăn, thú cưng và điều kiện hoàn hủy.']}
 ],faq:[{q:'Villa Long Hải có phù hợp nhóm đông không?',a:'Có, nhưng cần chọn đúng sức chứa và số phòng ngủ.'},{q:'Cuối tuần có tăng giá không?',a:'Thông thường giá cuối tuần có thể khác ngày thường tùy từng căn và thời điểm.'}]
},
{
 slug:'villa-vung-tau-kinh-nghiem-thue-ho-boi-gan-bien',title:'Villa Vũng Tàu: Kinh nghiệm thuê villa hồ bơi, gần biển và đúng ngân sách',category:'Vũng Tàu',
 excerpt:'Hướng dẫn thuê villa Vũng Tàu cho nhóm đông: chọn vị trí, hồ bơi, số phòng ngủ, tiện ích, giá cuối tuần và các lưu ý trước khi đặt.',
 image:u('photo-1600607688969-a5bfcd646154'),gallery:[shared[1],shared[3],shared[0],shared[4],shared[2]],date:'05/09/2026',readTime:'9 phút đọc',
 keywords:['villa vũng tàu','villa vung tau','thuê villa vũng tàu','villa vũng tàu hồ bơi','villa vũng tàu gần biển'],
 content:[
  {heading:'1. Chọn khu vực villa Vũng Tàu theo lịch trình',paragraphs:['Nếu lịch trình tập trung tắm biển và ăn uống, nên ưu tiên vị trí thuận tiện di chuyển. Nếu mục tiêu là nghỉ riêng tư, căn có hồ bơi, sân rộng và khu sinh hoạt chung sẽ mang lại giá trị tốt hơn.','Nên kiểm tra thời gian di chuyển thực tế tới bãi biển và các điểm dự định ghé.']},
  {heading:'2. Số phòng ngủ và sức chứa phải khớp',paragraphs:['Nhóm đông thường dễ chọn dư hoặc thiếu phòng. Hãy chốt số người lớn, trẻ em, cặp đôi và nhu cầu giường trước khi tìm căn.','Sức chứa tối đa và phụ thu khách thêm cần được xác nhận rõ trước khi đặt.']},
  {heading:'3. Giá cuối tuần và mùa cao điểm',paragraphs:['Villa Vũng Tàu thường có chênh lệch giá giữa ngày thường và cuối tuần. Những dịp lễ hoặc mùa cao điểm có thể có quy định số đêm tối thiểu.','Luôn kiểm tra giá theo đúng ngày ở thay vì chỉ nhìn một mức giá từ trên danh sách.']},
  {heading:'4. Kiểm tra tiện ích và quy định sử dụng',paragraphs:['Hồ bơi, karaoke, BBQ, bếp và chỗ đỗ xe là các tiện ích phổ biến nhưng có thể kèm quy định riêng.','Nếu nhóm tổ chức sinh nhật hoặc tiệc nhỏ, nên hỏi trước về giờ yên tĩnh, phí vệ sinh và giới hạn âm thanh.']}
 ],faq:[{q:'Villa Vũng Tàu cuối tuần có đắt hơn không?',a:'Thường có thể cao hơn ngày thường, tùy căn và thời điểm.'},{q:'Nên ưu tiên gần biển hay hồ bơi?',a:'Tùy mục tiêu chuyến đi; nhóm đi biển nhiều ưu tiên vị trí, nhóm nghỉ tại villa ưu tiên tiện ích.'}]
},
{
 slug:'villa-ha-long-kinh-nghiem-thue-view-bien',title:'Villa Hạ Long: Kinh nghiệm thuê villa view biển, gần trung tâm và phù hợp nhóm đông',category:'Hạ Long',
 excerpt:'Cẩm nang thuê villa Hạ Long: cách chọn khu vực, view biển, số phòng ngủ, tiện ích, lịch giá và các lưu ý để đặt đúng căn cho gia đình hoặc nhóm bạn.',
 image:u('photo-1542314831-068cd1dbfeeb'),gallery:[shared[4],shared[2],shared[0],shared[1],shared[3]],date:'05/09/2026',readTime:'9 phút đọc',
 keywords:['villa hạ long','villa ha long','thuê villa hạ long','villa hạ long view biển','biệt thự hạ long'],
 content:[
  {heading:'1. Chọn villa Hạ Long theo khu vực',paragraphs:['Hạ Long có nhiều khu lưu trú với trải nghiệm khác nhau. Nếu muốn kết hợp tham quan và ăn uống, nên ưu tiên khu vực thuận tiện di chuyển. Nếu muốn nghỉ dưỡng, hãy tập trung vào view, không gian riêng và tiện ích tại căn.','Khoảng cách thực tế tới bến tàu, khu vui chơi hoặc trung tâm nên được kiểm tra trước khi chốt.']},
  {heading:'2. View biển cần được xác nhận rõ',paragraphs:['Một số mô tả “view biển” có thể là nhìn xa hoặc chỉ một phần. Nếu view là yếu tố quyết định, cần xác nhận ảnh đúng căn và góc nhìn thực tế.','Đừng trả thêm tiền chỉ dựa trên tiêu đề; hãy kiểm tra ảnh, tầng, hướng và vị trí căn.']},
  {heading:'3. Giá villa Hạ Long theo ngày',paragraphs:['Giá có thể thay đổi theo ngày trong tuần, cuối tuần, mùa hè và dịp lễ. Nhóm đông nên đặc biệt chú ý phụ thu khách thêm và số đêm tối thiểu nếu có.','Giá hiển thị trên lịch theo ngày giúp so sánh nhanh hơn và hạn chế hiểu nhầm về mức giá thực tế.']},
  {heading:'4. Checklist đặt villa Hạ Long',paragraphs:['Xác nhận mã căn, số phòng ngủ, sức chứa, ảnh, tiện ích, vị trí, ngày ở, tổng tiền, cọc và điều kiện hoàn hủy trước khi thanh toán.','Nếu kết hợp du thuyền Hạ Long, nên sắp xếp giờ check-in villa và giờ ra bến để lịch trình không bị chồng chéo.']}
 ],faq:[{q:'Villa Hạ Long có phù hợp nhóm gia đình không?',a:'Có, đặc biệt khi cần nhiều phòng ngủ và không gian sinh hoạt chung.'},{q:'Có nên trả thêm cho view biển?',a:'Chỉ nên khi đã xác nhận ảnh và góc nhìn đúng căn, đúng nhu cầu của nhóm.'}]
}
];

export const getGuide=(slug:string)=>guidePosts.find(post=>post.slug===slug);
