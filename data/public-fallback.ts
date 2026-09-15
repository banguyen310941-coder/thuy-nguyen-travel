export type PublicFallbackProduct={
 id:string;slug:string;type:string;name:string;status:'published';place:string;price:string;summary:string;cover:string;gallery:string;category:string;rating:string;address:string;checkin:string;checkout:string;amenities:string;policies:string;childrenPolicy:string;extraCharge:string;duration:string;pickup:string;boarding:string;itinerary:string;content:string;serviceStars?:number;units:unknown[];
};

const product=(slug:string,type:string,name:string,place:string,price:string,summary:string,cover:string,serviceStars?:number):PublicFallbackProduct=>({
 id:`fallback-${slug}`,slug,type,name,status:'published',place,price,summary,cover,gallery:cover,category:type,rating:'',address:'',checkin:'',checkout:'',amenities:'',policies:'',childrenPolicy:'',extraCharge:'',duration:'',pickup:'',boarding:'',itinerary:'',content:'',serviceStars,units:[]
});

// Emergency public snapshot. Keep this file PUBLIC-ONLY: no supplier, net price, source sheet or internal notes.
// Live database data always takes priority; this is used only when Neon is unavailable/quota-blocked.
export const PUBLIC_FALLBACK_PRODUCTS:PublicFallbackProduct[]=[
 product('flc-luxury-resort-samson','Villa & Resort','FLC Luxury Resort Sầm Sơn','Sầm Sơn','2.370.000đ','Khu nghỉ dưỡng biển FLC Luxury Resort Sầm Sơn với các lựa chọn villa và tiện ích nghỉ dưỡng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350177/happygo_flc-luxury-resort-samson_cover_drive_filtered.jpg',5),
 product('flc-luxury-hotel-samson','Khách sạn','FLC Luxury Hotel Sầm Sơn','Sầm Sơn','1.400.000đ','Khách sạn 5 sao trong quần thể FLC Sầm Sơn, phù hợp nghỉ dưỡng biển và gia đình.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350185/happygo_flc-luxury-hotel-samson_cover_drive_filtered.jpg',5),
 product('flc-grand-hotel-samson','Khách sạn','FLC Grand Hotel Sầm Sơn','Sầm Sơn','1.400.000đ','Khách sạn FLC Grand Hotel Sầm Sơn với hệ thống phòng nghỉ và tiện ích trong quần thể.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350194/happygo_flc-grand-hotel-samson_cover_drive_filtered.jpg',5),
 product('flc-grand-hotel-ha-long','Khách sạn','FLC Grand Hotel Hạ Long','Hạ Long','1.400.000đ','Khách sạn 5 sao tại Hạ Long, phù hợp kỳ nghỉ kết hợp tham quan vịnh.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350204/happygo_flc-grand-hotel-ha-long_cover_drive_filtered.jpg',5),
 product('flc-luxury-resort-phu-tho','Villa & Resort','FLC Luxury Resort Phú Thọ','Phú Thọ','1.400.000đ','Khu nghỉ dưỡng FLC Luxury Resort Phú Thọ với không gian lưu trú và tiện ích nghỉ dưỡng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350236/happygo_flc-luxury-resort-phu-tho_cover_drive_filtered.jpg',5),
 product('luviaf-quy-nhon','Khách sạn','Luviaf Quy Nhơn','Quy Nhơn','1.400.000đ','Lựa chọn lưu trú 5 sao tại Quy Nhơn, thuận tiện cho kỳ nghỉ biển và khám phá thành phố.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350247/happygo_luviaf-quy-nhon_cover_drive_filtered.jpg',5),
 product('flc-luxury-resort-quy-nhon','Villa & Resort','FLC Luxury Resort Quy Nhơn','Quy Nhơn','4.130.000đ','Khu nghỉ dưỡng FLC Luxury Resort Quy Nhơn. Hình ảnh đang chờ nguồn Google Drive được xác nhận.','',5),
 product('lasong-hotel-villas-sam-son','Villa & Resort','LaSong Hotel & Villas Sầm Sơn','Sầm Sơn','1.200.000đ','Tổ hợp khách sạn và villa tại Sầm Sơn, phù hợp gia đình và nhóm nghỉ dưỡng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350304/happygo_lasong-hotel-villas-sam-son_cover_drive_filtered.jpg',5),
 product('marron-sam-son-hotel','Khách sạn','Marron Sầm Sơn Hotel','Sầm Sơn','700.000đ','Khách sạn tại Sầm Sơn với nhiều hạng phòng cho khách lẻ, gia đình và nhóm.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350339/happygo_marron-sam-son-hotel_cover_drive_filtered.jpg',3),
 product('anyla-sam-son','Khách sạn','Anyla Sầm Sơn','Sầm Sơn','700.000đ','Khách sạn nghỉ dưỡng tại Sầm Sơn với nhiều hạng phòng và tiện ích phù hợp gia đình.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350365/happygo_anyla-sam-son_cover_drive_filtered.jpg',5),
 product('luna-ha-long-cruise','Du thuyền','Luna Hạ Long Cruise','Hạ Long','1.080.000đ','Du thuyền Luna Hạ Long với lựa chọn ăn tối, đi ngày và nghỉ đêm theo hạng dịch vụ.','',5),
 product('villa-ha-long-bt8-09-5pn','Villa & Resort','Villa Hạ Long BT8-09 5PN','Hạ Long','4.000.000đ','Villa Hạ Long 5 phòng ngủ dành cho gia đình và nhóm riêng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350121/happygo_villa-ha-long-bt8-09-5pn_cover_drive_filtered.jpg'),
 product('villa-ha-long-bt8-10-5pn','Villa & Resort','Villa Hạ Long BT8-10 5PN','Hạ Long','5.000.000đ','Villa Hạ Long 5 phòng ngủ dành cho gia đình và nhóm riêng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350134/happygo_villa-ha-long-bt8-10-5pn_cover_drive_filtered.jpg'),
 product('villa-ha-long-bt9-45-5pn','Villa & Resort','Villa Hạ Long BT9-45 5PN','Hạ Long','4.500.000đ','Villa Hạ Long 5 phòng ngủ với không gian riêng cho nhóm và gia đình.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350107/happygo_villa-ha-long-bt9-45-5pn_cover_drive_filtered.jpg'),
 product('villa-ha-long-bt6b-40-6pn','Villa & Resort','Villa Hạ Long BT6B-40 6PN','Hạ Long','5.000.000đ','Villa Hạ Long 6 phòng ngủ, phù hợp đoàn gia đình và nhóm đông.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350127/happygo_villa-ha-long-bt6b-40-6pn_cover_drive_filtered.jpg'),
 product('villa-ha-long-bt6b-36-5pn','Villa & Resort','Villa Hạ Long BT6B-36 5PN','Hạ Long','5.000.000đ','Villa Hạ Long 5 phòng ngủ, phù hợp nghỉ dưỡng nhóm riêng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350115/happygo_villa-ha-long-bt6b-36-5pn_cover_drive_filtered.jpg'),
 product('villa-ha-long-bt9-39b','Villa & Resort','Villa Hạ Long BT9-39B','Hạ Long','6.500.000đ','Villa Hạ Long dành cho nhóm riêng, có không gian sinh hoạt và nghỉ dưỡng.','https://res.cloudinary.com/ncctxz7z/image/upload/v1789350140/happygo_villa-ha-long-bt9-39b_cover_drive_filtered.jpg')
];


export type PublicFallbackArticle={
 id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content:string;status:'published';date:string;readTime:string;keywords:string;
};

const article=(id:string,title:string,slug:string,category:string,excerpt:string,cover:string,date:string,readTime:string):PublicFallbackArticle=>({
 id,title,slug,category,excerpt,cover,content:'',status:'published',date,readTime,keywords:''
});

// Snapshot from the last known-good production render on 14/09/2026.
// These are CMS-era articles only. Deleted legacy guide posts are intentionally NOT included.
export const PUBLIC_FALLBACK_ARTICLES:PublicFallbackArticle[]=[
 article('fallback-guide-da-lat','Du lịch Đà Lạt 3 ngày 2 đêm: lịch trình tự túc dễ đi','du-lich-da-lat-3-ngay-2-dem-lich-trinh-tu-tuc','Đà Lạt','Gợi ý lịch trình Đà Lạt 3 ngày 2 đêm theo cụm điểm, kết hợp hồ Xuân Hương, Trại Mát, hồ Tuyền Lâm, ẩm thực, lưu trú và cách dự trù chi phí.','https://commons.wikimedia.org/wiki/Special:Redirect/file/Xuan%20Huong%20Lake%20in%20Da%20Lat%20%2828219543381%29.jpg?width=1600','13/09/2026','14 phút đọc'),
 article('fallback-guide-suoi-khoang','Villa resort suối khoáng Việt Nam: 5 điểm nghỉ dưỡng đáng chọn','villa-resort-suoi-khoang-viet-nam-5-diem-nghi-duong','Villa & Resort','Khám phá 5 vùng villa resort suối khoáng tại Việt Nam phù hợp cặp đôi, gia đình và nhóm bạn, cùng tiêu chí chọn phòng, chi phí và lưu ý tắm khoáng.','https://commons.wikimedia.org/wiki/Special:Redirect/file/Serena%20Resort%20Kim%20Boi.jpg?width=1600','13/09/2026','14 phút đọc'),
 article('fallback-guide-quy-nhon','Du lịch Quy Nhơn 3 ngày 2 đêm: lịch trình biển và ẩm thực','du-lich-quy-nhon-3-ngay-2-dem-lich-trinh-tu-tuc','Quy Nhơn','Gợi ý lịch trình Quy Nhơn 3 ngày 2 đêm tự túc với Kỳ Co, Eo Gió, Ghềnh Ráng, Tháp Đôi, món ngon, khu lưu trú, chi phí và các lưu ý cần kiểm tra.','https://commons.wikimedia.org/wiki/Special:Redirect/file/Ky-Co-Beach%2C-Quy-Nhon%2C-Vietnam-1300px.jpg?width=1600','10/09/2026','14 phút đọc'),
 article('fallback-guide-tre-nho','Kinh nghiệm chọn villa cho gia đình có trẻ nhỏ an toàn','kinh-nghiem-chon-villa-cho-gia-dinh-co-tre-nho','Kinh nghiệm chọn villa','Hướng dẫn chọn villa cho gia đình có trẻ nhỏ theo độ tuổi, hồ bơi, phòng ngủ, bếp, vị trí và ngân sách, kèm checklist cần xác nhận trước khi đặt cọc.','https://commons.wikimedia.org/wiki/Special:Redirect/file/DGJ%200721%20-%20Pool%20at%20the%20Resort%2C%20Da%20Nang%2C%20Viet%20Nam%20%283382626443%29.jpg?width=1600','10/09/2026','13 phút đọc'),
 article('fallback-guide-nui','Villa resort núi Việt Nam: 5 điểm đến nghỉ mát đáng chọn','villa-resort-nui-viet-nam-5-diem-den-nghi-duong','Villa & Resort','Khám phá 5 vùng villa resort núi Việt Nam phù hợp cho cặp đôi, gia đình và nhóm bạn, kèm tiêu chí chọn khu nghỉ dưỡng, ngân sách, thời tiết và lưu ý đặt phòng.','https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Da_Lat_-_Viet_Nam.jpg/1280px-Da_Lat_-_Viet_Nam.jpg','09/09/2026','12 phút đọc'),
 article('fallback-guide-hue','Du lịch Huế 3 ngày 2 đêm: lịch trình ăn chơi và lưu trú','du-lich-hue-3-ngay-2-dem-lich-trinh-tu-tuc','Huế','Gợi ý lịch trình Huế 3 ngày 2 đêm dành cho cặp đôi, gia đình và nhóm bạn, gồm Đại Nội, Thiên Mụ, lăng vua, món ngon, lưu trú, chi phí và các lưu ý thực tế.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Meridian_Gate_%28Ng%E1%BB%8D_M%C3%B4n%29%2C_the_southern_entrance_to_the_Imperial_City%2C_as_viewed_from_the_flagpole_monument_side_%28K%E1%BB%B3_%C4%90%C3%A0i%29.jpg/1280px-Meridian_Gate_%28Ng%E1%BB%8D_M%C3%B4n%29%2C_the_southern_entrance_to_the_Imperial_City%2C_as_viewed_from_the_flagpole_monument_side_%28K%E1%BB%B3_%C4%90%C3%A0i%29.jpg','08/09/2026','14 phút đọc'),
 article('fallback-guide-nhom-10-20','Kinh nghiệm chọn villa cho nhóm 10–20 người tránh phát sinh','kinh-nghiem-chon-villa-cho-nhom-10-20-nguoi','Kinh nghiệm chọn villa','Hướng dẫn chọn villa cho nhóm 10–20 người theo số phòng ngủ, cơ cấu đoàn, tiện ích và ngân sách, kèm checklist tránh phụ thu và sai sức chứa khi nhận căn.','https://statics.vinpearl.com/be-boi-villa-vinpearl-nam-hoi-an_1734063481.jpg','08/09/2026','12 phút đọc'),
 article('fallback-guide-bien','Villa resort biển Việt Nam: 6 điểm đến đáng cân nhắc','villa-resort-bien-viet-nam-6-diem-den-nen-chon','Villa & Resort','Khám phá 6 điểm đến villa resort biển Việt Nam phù hợp cho gia đình, cặp đôi và nhóm bạn, cùng tiêu chí chọn khu nghỉ dưỡng, ngân sách và lưu ý đặt phòng.','https://commons.wikimedia.org/wiki/Special:Redirect/file/Phu%20Quoc%20Beach.jpg?width=1600','08/09/2026','14 phút đọc')
];

export const PUBLIC_FALLBACK_STATE:Record<string,unknown>={
 tn_cms_products_v3_units:PUBLIC_FALLBACK_PRODUCTS,
 tn_cms_daily_rates_v1:[],
 tn_cms_tours_v3:[],
 tn_cms_articles_v3:PUBLIC_FALLBACK_ARTICLES
};
