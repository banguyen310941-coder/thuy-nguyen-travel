export type GuideCategory={slug:string;name:string;terms:string[];description:string};

export const guideCategories:GuideCategory[]=[
 {slug:'villa-resort',name:'Villa & Resort',terms:['villa','resort','oceanami','novaworld','flc'],description:'Kinh nghiệm chọn villa và resort theo khu vực, số khách, hạng phòng, tiện ích và ngân sách.'},
 {slug:'flc-sam-son',name:'FLC Sầm Sơn',terms:['flc sầm sơn','flc sam son'],description:'Kinh nghiệm chọn villa và biệt thự FLC Sầm Sơn theo vị trí, số phòng, hồ bơi và ngân sách.'},
 {slug:'long-hai',name:'Long Hải',terms:['long hải','long hai','oceanami'],description:'Kinh nghiệm thuê villa Long Hải và Oceanami cho gia đình, nhóm bạn và đoàn nghỉ dưỡng.'},
 {slug:'vung-tau',name:'Vũng Tàu',terms:['vũng tàu','vung tau','aria resort'],description:'Kinh nghiệm thuê villa Vũng Tàu, villa Aria Resort và lựa chọn căn gần biển, có hồ bơi.'},
 {slug:'ha-long',name:'Hạ Long',terms:['hạ long','ha long'],description:'Kinh nghiệm thuê villa Hạ Long, chọn vị trí, view vịnh và căn phù hợp nhóm đông.'},
 {slug:'du-thuyen',name:'Du thuyền',terms:['du thuyền','cabin'],description:'Kinh nghiệm chọn du thuyền, cabin, hành trình và lịch trình nghỉ đêm.'},
 {slug:'nha-trang',name:'Nha Trang',terms:['nha trang','vinpearl'],description:'Kinh nghiệm du lịch Nha Trang, khách sạn, resort và lịch trình cho gia đình.'},
 {slug:'phan-thiet',name:'Phan Thiết',terms:['phan thiết','phan thiet','novaworld'],description:'Lịch trình và kinh nghiệm nghỉ dưỡng Phan Thiết, NovaWorld và các khu vực lân cận.'},
 {slug:'quy-nhon',name:'Quy Nhơn',terms:['quy nhơn','quy nhon','flc quy'],description:'Kinh nghiệm đặt phòng, nghỉ dưỡng và khám phá Quy Nhơn.'},
 {slug:'tour-trung-quoc',name:'Tour Trung Quốc',terms:['trung quốc','trung quoc','bắc kinh','thượng hải','hàng châu'],description:'Kinh nghiệm đi tour Trung Quốc, lịch trình, chuẩn bị và lựa chọn chương trình phù hợp.'},
];

export const guideCategoryMap=Object.fromEntries(guideCategories.map(category=>[category.slug,category])) as Record<string,GuideCategory>;
