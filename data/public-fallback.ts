export type PublicFallbackProduct={
 id:string;slug:string;type:string;name:string;status:'published';place:string;price:string;summary:string;cover:string;gallery:string;category:string;serviceStars?:number;units:unknown[];
};

const product=(slug:string,type:string,name:string,place:string,price:string,summary:string,cover:string,serviceStars?:number):PublicFallbackProduct=>({
 id:`fallback-${slug}`,slug,type,name,status:'published',place,price,summary,cover,gallery:cover,category:type,serviceStars,units:[]
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

export const PUBLIC_FALLBACK_STATE:Record<string,unknown>={
 tn_cms_products_v3_units:PUBLIC_FALLBACK_PRODUCTS,
 tn_cms_daily_rates_v1:[],
 tn_cms_tours_v3:[],
 tn_cms_articles_v3:[]
};
