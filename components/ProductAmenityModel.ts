export type StructuredProductType='Villa & Resort'|'Khách sạn'|'Du thuyền';
export type AmenityOption={id:string;label:string;icon:string;detailPlaceholder?:string;detailHint?:string};

export const PRODUCT_AMENITIES:Record<StructuredProductType,AmenityOption[]>={
 'Villa & Resort':[
  {id:'private_pool',label:'Bể bơi riêng',icon:'🏊',detailPlaceholder:'VD: 5×10m · nước ngọt / nước mặn',detailHint:'Kích thước và loại nước giúp Sale tư vấn chính xác.'},
  {id:'billiards',label:'Bàn Bida',icon:'🎱',detailPlaceholder:'VD: 1 bàn · khu sinh hoạt chung'},
  {id:'foosball',label:'Bàn Bi-lắc',icon:'⚽',detailPlaceholder:'VD: 1 bàn · miễn phí sử dụng'},
  {id:'karaoke',label:'Dàn Karaoke',icon:'🎤',detailPlaceholder:'VD: phòng cách âm · sử dụng đến 22:00',detailHint:'Ghi rõ loa kéo/phòng hát và giờ giới hạn.'},
  {id:'bbq',label:'Bếp nướng BBQ',icon:'🔥',detailPlaceholder:'VD: có bếp · than tự túc',detailHint:'Ghi rõ có kèm than/dụng cụ hay khách tự chuẩn bị.'},
  {id:'pet_friendly',label:'Cho phép mang thú cưng (Pet-friendly)',icon:'🐾',detailPlaceholder:'VD: thú cưng dưới 10kg · phụ thu nếu có'},
 ],
 'Khách sạn':[
  {id:'wifi',label:'Wi-Fi miễn phí',icon:'📶'},
  {id:'breakfast',label:'Bao gồm bữa sáng',icon:'🥐',detailPlaceholder:'VD: Buffet 06:30–10:00'},
  {id:'pool',label:'Bể bơi',icon:'🏊',detailPlaceholder:'VD: tầng 5 · 06:00–21:00'},
  {id:'gym',label:'Phòng Gym',icon:'🏋️'},
  {id:'spa',label:'Spa',icon:'💆',detailPlaceholder:'VD: có tính phí · đặt trước'},
  {id:'parking',label:'Bãi đỗ xe',icon:'🅿️',detailPlaceholder:'VD: miễn phí ô tô/xe máy'},
  {id:'restaurant',label:'Nhà hàng',icon:'🍽️'},
  {id:'airport_shuttle',label:'Đưa đón sân bay',icon:'🚐',detailPlaceholder:'VD: có tính phí · đặt trước 24h'},
 ],
 'Du thuyền':[
  {id:'restaurant',label:'Nhà hàng',icon:'🍽️'},
  {id:'bar',label:'Quầy Bar',icon:'🍹'},
  {id:'jacuzzi',label:'Bể bơi / Jacuzzi',icon:'🫧',detailPlaceholder:'VD: boong 3 · 07:00–20:00'},
  {id:'spa',label:'Spa',icon:'💆'},
  {id:'kayak',label:'Kayak',icon:'🛶',detailPlaceholder:'VD: đã bao gồm trong lịch trình'},
  {id:'squid_fishing',label:'Câu mực',icon:'🎣',detailPlaceholder:'VD: hoạt động buổi tối'},
  {id:'sundeck',label:'Sundeck / boong ngắm cảnh',icon:'🌅'},
  {id:'wifi',label:'Wi-Fi',icon:'📶',detailPlaceholder:'VD: tín hiệu phụ thuộc vùng vịnh'},
 ],
};

export function amenityOptions(type:string):AmenityOption[]{return PRODUCT_AMENITIES[type as StructuredProductType]||[]}
export function inferAmenityTags(type:string,legacy:unknown):string[]{const text=String(legacy||'').toLowerCase();return amenityOptions(type).filter(item=>text.includes(item.label.toLowerCase().replace(/\s*\([^)]*\)/g,''))).map(item=>item.id)}
export function amenityLines(type:string,tags:unknown,details:unknown,keep:string[]=[]):string[]{const selected=Array.isArray(tags)?tags.map(String):[];const d=details&&typeof details==='object'?details as Record<string,unknown>:{};const structured=amenityOptions(type).filter(item=>selected.includes(item.id)).map(item=>{const detail=String(d[item.id]||'').trim();return detail?`${item.label}: ${detail}`:item.label});return [...structured,...keep.filter(Boolean)]}
export function unknownLegacyAmenities(type:string,legacy:unknown):string[]{const options=amenityOptions(type);return String(legacy||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).filter(line=>!options.some(item=>line.toLowerCase().startsWith(item.label.toLowerCase().replace(/\s*\([^)]*\)/g,''))))}
export function amenityMeta(type:string,id:string){return amenityOptions(type).find(item=>item.id===id)}
