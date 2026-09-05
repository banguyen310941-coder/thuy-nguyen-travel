export type GuideMedia={src:string;alt?:string;credit?:string};

type Rule={match:string;src:string;alt?:string;credit?:string};
const c=(version:number,name:string)=>`https://res.cloudinary.com/ncctxz7z/image/upload/f_auto,q_auto,c_limit,w_1600/v${version}/${name}`;

const rules:Rule[]=[
 {match:'villa-flc-sam-son-view-bien.jpg',src:c(1788574343,'villa-flc-sam-son-view-bien-toan-canh.jpg')},
 {match:'11755853/ca3b6ea1.jpg',src:c(1788574355,'flc-luxury-resort-sam-son-pool-villa.jpg')},
 {match:'flc-luxury-resort-samson-1.jpeg',src:c(1788574364,'flc-luxury-resort-sam-son-phong-ngu.jpg')},
 {match:'bookingflc.vn/wp-content/uploads/2020/02/flc-luxury-resort',src:c(1788574385,'flc-luxury-resort-sam-son-toan-canh-villa.jpg'),alt:'Toàn cảnh khu villa FLC Luxury Resort Sầm Sơn',credit:'Ảnh lưu trên Cloudinary · nguồn FLC Thanh Hóa'},
 {match:'147713802.jpg',src:c(1788574396,'flc-luxury-resort-sam-son-phong-ngu-ho-boi.jpg')},
 {match:'seaview-villa-flc-sam-son',src:c(1788574407,'flc-sam-son-seaview-villa-phong-ngu.jpg')},

 {match:'1650426866-justfly-sb-55-villa-flc-sam-son.jpg',src:c(1788574417,'villa-sao-bien-sb55-flc-sam-son.jpg')},
 {match:'villa-8pn-moi-van-hanh-4.jpg',src:c(1788574451,'villa-sao-bien-sb57-flc-sam-son.jpg'),alt:'Villa Sao Biển SB57 trong quần thể FLC Sầm Sơn',credit:'Ảnh lưu trên Cloudinary · nguồn BookingFLC.com.vn'},
 {match:'z3837889800232-e62e90d42d881b217a1558bdb4ed0a8f.jpg',src:c(1788574429,'villa-sao-bien-sb111-flc-sam-son.jpg')},
 {match:'565680555.jpg',src:c(1788574733,'villa-ngoc-trai-nt120-flc-sam-son.jpg')},
 {match:'438960312.jpg',src:c(1788574744,'villa-flc-sam-son-phong-ngu-nguyen-can.jpg')},
 {match:'villa-flc-sam-son-bt-3501',src:c(1788574755,'villa-flc-sam-son-bt35-01-phong-ngu.jpg')},

 {match:'id=1DG1tW5-NXHZt6kGiXokByTZHSMwVSpKH',src:c(1788574529,'oceanami-long-hai-toan-canh-resort.webp'),alt:'Toàn cảnh Oceanami Villas & Beach Club Long Hải',credit:'Ảnh lưu trên Cloudinary · nguồn iVIVU'},
 {match:'id=1s7wK2-wrf1VZQHQ3BlWzz_J2_3swju48',src:c(1788574541,'oceanami-long-hai-villa-3-phong-ngu.png'),alt:'Biệt thự 3 phòng ngủ tại Oceanami Villas & Beach Club Long Hải',credit:'Ảnh lưu trên Cloudinary · nguồn Du lịch Bà Rịa Vũng Tàu'},
 {match:'id=1gn1DkGWsXRaaQyweU16uTG7ItP7n82Ux',src:c(1788574553,'oceanami-long-hai-villa-b331-ho-boi.jpg'),alt:'Villa B331 Oceanami Long Hải với hồ bơi riêng',credit:'Ảnh lưu trên Cloudinary · nguồn Justfly'},
 {match:'id=1PtLgYZIbsWgPvYuvzBRBLf9D48eurhOV',src:c(1788574568,'oceanami-long-hai-villa-san-ho-boi.png'),alt:'Khu sân và hồ bơi của villa tại Oceanami Long Hải',credit:'Ảnh lưu trên Cloudinary · nguồn Villa Vũng Tàu'},
 {match:'id=1VTYKs9PRFgKjKSkpDk6lECUa0rlqy_zw',src:c(1788574578,'oceanami-long-hai-villa-phong-khach-bep.webp'),alt:'Không gian phòng khách và bếp villa Oceanami Long Hải',credit:'Ảnh lưu trên Cloudinary · nguồn Hotels in Vung Tau'},
 {match:'id=1HRz3o90PwFSyuPa41-xkDdrlFDM5-MZT',src:c(1788574825,'oceanami-long-hai-villa-phong-khach-ho-boi.jpg'),alt:'Phòng khách villa Oceanami Long Hải mở ra khu hồ bơi',credit:'Ảnh lưu trên Cloudinary · nguồn Hotels.com'},

 {match:'s07-aria-resort-39.jpg',src:c(1788574589,'aria-resort-vung-tau-villa-s07-ngoai-that.jpg')},
 {match:'s07-aria-resort-1.jpg',src:c(1788574601,'aria-resort-vung-tau-villa-s07-01.jpg')},
 {match:'s07-aria-resort-2.jpg',src:c(1788574620,'aria-resort-vung-tau-villa-s07-02.jpg')},
 {match:'s07-aria-resort-3.jpg',src:c(1788574631,'aria-resort-vung-tau-villa-s07-03.jpg')},
 {match:'s07-aria-resort-4.jpg',src:c(1788574644,'aria-resort-vung-tau-villa-s07-04.jpg')},
 {match:'s07-aria-resort-5.jpg',src:c(1788574872,'aria-resort-vung-tau-villa-khu-villa.jpg'),alt:'Villa tại Aria Resort Vũng Tàu',credit:'Ảnh lưu trên Cloudinary · nguồn Booking Du Lịch'},

 {match:'villa-flc-5-pn-view-bien-948-4.jpg',src:c(1788574658,'villa-flc-ha-long-view-bien-948-ngoai-that.jpg')},
 {match:'biet_thu_nghi_duong_ha_long_villa_flc_phoenix_bt6b01',src:c(1788574668,'villa-flc-ha-long-bt6b01-phong-khach.jpg')},
 {match:'villa-flc-5-pn-view-bien-948-13.jpg',src:c(1788574682,'villa-flc-ha-long-view-bien-948-phong-ngu.jpg')},
 {match:'flc_bt925_7.jpg',src:c(1788574691,'phoenix-villa-flc-ha-long-bt925-ho-boi.jpg')},
 {match:'1685691670-justfly-bt12-40-flc-ha-long-36.jpg',src:c(1788574702,'villa-flc-ha-long-bt12-40-ngoai-that.jpg')},
 {match:'cho-thue-villa-flc-ha-long_%2831%29.jpg',src:c(1788574890,'villa-flc-ha-long-bt6a-01-ho-boi.jpg')}
];

export function guideMedia(src:string,alt?:string,credit?:string):GuideMedia{
 const rule=rules.find(item=>src.includes(item.match));
 return rule?{src:rule.src,alt:rule.alt||alt,credit:rule.credit||credit}:{src,alt,credit};
}

export function guideImage(src:string){return guideMedia(src).src;}
