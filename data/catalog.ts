import {destinationVisualUrl} from './destination-visuals';

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
 ['Phan Thiết','Villa · Resort · Tour',destinationVisualUrl('Phan Thiết')],
 ['Hạ Long','Du thuyền · Khách sạn',destinationVisualUrl('Hạ Long')],
 ['Phú Quốc','Resort · Nghỉ dưỡng biển',destinationVisualUrl('Phú Quốc')],
 ['Sa Pa','Tour · Khách sạn',destinationVisualUrl('Sa Pa')],
 ['Nha Trang','Khách sạn · Resort · Tour',destinationVisualUrl('Nha Trang')],
 ['Sầm Sơn','Khách sạn · Resort · Biển',destinationVisualUrl('Sầm Sơn')]
] as const;
