export type ProductProvince={
 slug:string;
 name:string;
 menuMeta:string;
 query:string;
 aliases:string[];
 description:string;
};

export const productProvinces:ProductProvince[]=[
 {slug:'quang-ninh',name:'Quảng Ninh',menuMeta:'Hạ Long',query:'Hạ Long',aliases:['quảng ninh','hạ long','vịnh hạ long'],description:'Villa, khách sạn và du thuyền tại Hạ Long - Quảng Ninh.'},
 {slug:'thanh-hoa',name:'Thanh Hóa',menuMeta:'Sầm Sơn',query:'Sầm Sơn',aliases:['thanh hóa','sầm sơn'],description:'Villa và khách sạn nghỉ biển tại Sầm Sơn - Thanh Hóa.'},
 {slug:'da-nang',name:'Đà Nẵng',menuMeta:'Hội An',query:'Hội An',aliases:['đà nẵng','hội an'],description:'Villa và resort khu vực Hội An - Đà Nẵng.'},
 {slug:'gia-lai',name:'Gia Lai',menuMeta:'Quy Nhơn',query:'Quy Nhơn',aliases:['gia lai','quy nhơn'],description:'Khách sạn và dịch vụ nghỉ dưỡng khu vực Quy Nhơn - Gia Lai.'},
 {slug:'vinh-phuc',name:'Vĩnh Phúc',menuMeta:'Tam Đảo & lân cận',query:'Vĩnh Phúc',aliases:['vĩnh phúc'],description:'Khách sạn và nghỉ dưỡng tại Vĩnh Phúc.'},
 {slug:'hai-phong',name:'Hải Phòng',menuMeta:'Vịnh Lan Hạ',query:'Vịnh Lan Hạ',aliases:['hải phòng','vịnh lan hạ','lan hạ','cát bà'],description:'Du thuyền và trải nghiệm Vịnh Lan Hạ - Hải Phòng.'},
];

export function getProductProvince(slug:string){return productProvinces.find(item=>item.slug===String(slug||'').trim().toLowerCase())||null}
export function provinceMatchesText(province:ProductProvince,value:string){const text=String(value||'').toLocaleLowerCase('vi');return province.aliases.some(alias=>text.includes(alias))}
export function provinceProductHref(product:{type?:string;slug?:string}){const slug=encodeURIComponent(String(product.slug||''));const type=String(product.type||'');if(type==='Du thuyền')return `/du-thuyen/${slug}`;if(type==='Tour')return `/tour-du-lich/${slug}`;return `/san-pham/${slug}`}
export function provinceServiceHref(province:ProductProvince,type:string){const q=encodeURIComponent(province.query);if(type==='Villa & Resort')return `/villa-resort?q=${q}`;if(type==='Khách sạn')return `/khach-san?q=${q}`;if(type==='Du thuyền')return `/du-thuyen?q=${q}`;if(type==='Tour')return `/tour-du-lich?q=${q}`;return `/tim-kiem?q=${q}`}
