export type Stay={slug:string;name:string;location:string;type:'Villa'|'Khách sạn'|'Resort';image:string;gallery?:string[];rating:number;summary:string;highlights:string[];rooms?:string[];seoTitle?:string;seoDescription?:string};
export type TourDay={title:string;morning?:string;afternoon?:string;evening?:string;meals?:string;image?:string};
export type Tour={slug:string;name:string;category:'Tour Trung Quốc'|'Tour trong nước';duration:string;route:string;image:string;gallery?:string[];summary:string;rating?:number;reviewCount?:number;priceFrom?:string;oldPrice?:string;departureFrom?:string;airline?:string;transport?:string[];departureDates?:string[];promotions?:string[];highlights?:string[];itinerary?:TourDay[];included?:string[];excluded?:string[];policies?:string[];faq?:{q:string;a:string}[];seoTitle?:string;seoDescription?:string};
export type Cruise={slug:string;name:string;bay:string;duration:string;image:string;priceFrom?:string;summary:string};

// Legacy/demo product records were intentionally removed on 05/09/2026.
// New products must come from verified production data supplied by HappyGo Travel.
export const stays:Stay[]=[];
export const cruises:Cruise[]=[];
export const tours:Tour[]=[];

export const destinations=[
 ['Phan Thiết','Villa · Resort · Tour','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85'],
 ['Hạ Long','Du thuyền · Khách sạn','https://images.unsplash.com/photo-1743485753956-c6e4f75d8dc5?auto=format&fit=crop&w=1200&q=85'],
 ['Phú Quốc','Resort · Nghỉ dưỡng biển','https://images.unsplash.com/photo-1732243395944-cb3ff9311091?auto=format&fit=crop&w=1200&q=85'],
 ['Sa Pa','Tour · Khách sạn','https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85'],
 ['Nha Trang','Khách sạn · Resort · Tour','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85'],
 ['Sầm Sơn','Khách sạn · Resort · Biển','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85']
] as const;
