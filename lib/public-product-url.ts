export function publicProductPath(type:string,slug:string){
 const encoded=encodeURIComponent(slug);
 if(type==='Du thuyền')return `/du-thuyen/${encoded}`;
 if(type.includes('Tour'))return `/tour-du-lich/${encoded}`;
 if(type==='Villa & Resort')return `/villa/${encoded}`;
 if(type==='Khách sạn')return `/khach-san-resort/${encoded}`;
 return `/san-pham/${encoded}`;
}
