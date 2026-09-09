import {db,hasDatabase} from '@/lib/db';
import {publicProductData,sanitizePublicValue} from '@/lib/server/public-site-state';

export type HotelRecommendationScope='hotel'|'stay';
export type HotelRecommendationInput={
 slug?:string;
 latitude?:number|null;
 longitude?:number|null;
 place?:string;
 price?:number|null;
 serviceStars?:number|null;
 limit?:number;
 scope?:HotelRecommendationScope;
};

export type HotelRecommendation={
 id:string;
 slug:string;
 name:string;
 type:string;
 place:string;
 address:string;
 price:string;
 priceVnd:number|null;
 cover:string;
 rating:number|null;
 serviceStars:number|null;
 latitude:number|null;
 longitude:number|null;
 distanceKm:number|null;
 matchScore:number;
 reasons:string[];
 source:'admin'|'partner';
};

type Candidate=HotelRecommendation&{normalizedPlace:string};

const PRICE_KEYS=['lowWeekdayPrice','lowWeekendPrice','weekdayPrice','weekendPrice','highWeekdayPrice','highWeekendPrice','holidayPrice'] as const;
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const text=(value:unknown)=>String(value??'').trim();
const normalized=(value:unknown)=>text(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const number=(value:unknown)=>{const parsed=Number(String(value??'').trim().replace(',','.'));return Number.isFinite(parsed)?parsed:null};
const coordinate=(value:unknown,min:number,max:number)=>{const parsed=number(value);return parsed!==null&&parsed>=min&&parsed<=max?parsed:null};
const priceNumber=(value:unknown)=>{if(typeof value==='number')return Number.isFinite(value)&&value>0?Math.round(value):null;const raw=text(value);if(!raw||/liên\s*hệ/i.test(raw))return null;const digits=raw.replace(/[^0-9]/g,'');const parsed=digits?Number(digits):0;return Number.isFinite(parsed)&&parsed>0?parsed:null};
const formattedPrice=(value:number|null)=>value&&value>0?`${new Intl.NumberFormat('vi-VN').format(value)}đ`:'Liên hệ';

function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number){
 const radius=6371;
 const toRad=(degree:number)=>degree*Math.PI/180;
 const dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1);
 const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
 return radius*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function placeSimilarity(a:string,b:string){
 if(!a||!b)return 0;
 if(a===b)return 1;
 if(a.includes(b)||b.includes(a))return .9;
 const left=new Set(a.split(' ').filter(Boolean)),right=new Set(b.split(' ').filter(Boolean));
 const shared=[...left].filter(token=>right.has(token)).length;
 return shared/Math.max(1,Math.min(left.size,right.size));
}

function unitPrice(unit:any){
 const data=unit?.data&&typeof unit.data==='object'?unit.data:{};
 const values=[unit?.retail_price_vnd,...PRICE_KEYS.map(key=>(data as any)?.[key])].map(priceNumber).filter((value):value is number=>Boolean(value));
 return values.length?Math.min(...values):null;
}

function productPrice(row:any,units:any[]){
 const raw=row?.data&&typeof row.data==='object'?row.data:{};
 const values=[row?.promo_price_vnd,row?.retail_price_vnd,(raw as any)?.price,...units.map(unitPrice)].map(value=>typeof value==='number'?value:priceNumber(value)).filter((value):value is number=>Boolean(value));
 return values.length?Math.min(...values):null;
}

function ratingValue(value:unknown){const parsed=number(String(value??'').match(/\d+(?:[.,]\d+)?/)?.[0]);return parsed===null?null:clamp(parsed,0,5)}
function starValue(value:unknown){const parsed=number(value);return parsed===null?null:clamp(Math.round(parsed),0,5)}

function priceSimilarity(candidate:number|null,reference:number|null){
 if(!candidate||!reference)return 0;
 const ratio=Math.abs(candidate-reference)/Math.max(candidate,reference);
 if(ratio<=.1)return 16;
 if(ratio<=.25)return 11;
 if(ratio<=.5)return 6;
 return 0;
}

function distanceScore(distance:number|null){
 if(distance===null)return 0;
 if(distance<=1)return 45;
 if(distance<=3)return 39;
 if(distance<=5)return 33;
 if(distance<=10)return 24;
 if(distance<=20)return 14;
 if(distance<=35)return 7;
 return 0;
}

function buildReasons(candidate:Candidate,context:{place:string;price:number|null;stars:number|null;latitude:number|null;longitude:number|null}){
 const reasons:string[]=[];
 if(candidate.distanceKm!==null){
  if(candidate.distanceKm<1)reasons.push(`Cách khoảng ${Math.max(100,Math.round(candidate.distanceKm*1000/100)*100)} m`);
  else reasons.push(`Cách khoảng ${candidate.distanceKm.toFixed(candidate.distanceKm<10?1:0)} km`);
 }
 const placeMatch=placeSimilarity(candidate.normalizedPlace,normalized(context.place));
 if(placeMatch>=.65&&candidate.place)reasons.push(`Cùng khu vực ${candidate.place}`);
 if(priceSimilarity(candidate.priceVnd,context.price)>=11)reasons.push('Mức giá tương đương');
 if(context.stars&&candidate.serviceStars&&Math.abs(context.stars-candidate.serviceStars)<=1)reasons.push(`Hạng ${candidate.serviceStars} sao phù hợp`);
 if(candidate.rating&&candidate.rating>=4.5)reasons.push('Đánh giá cao');
 return reasons.slice(0,3);
}

function scoreCandidate(candidate:Candidate,context:{place:string;price:number|null;stars:number|null;latitude:number|null;longitude:number|null;referenceType:string}){
 let score=10;
 score+=distanceScore(candidate.distanceKm);
 score+=placeSimilarity(candidate.normalizedPlace,normalized(context.place))*22;
 score+=priceSimilarity(candidate.priceVnd,context.price);
 if(context.stars&&candidate.serviceStars)score+=Math.max(0,8-Math.abs(context.stars-candidate.serviceStars)*3);
 if(candidate.rating)score+=candidate.rating*1.6;
 if(context.referenceType&&candidate.type===context.referenceType)score+=4;
 return Math.round(clamp(score,0,100));
}

export async function getHotelRecommendations(input:HotelRecommendationInput={}):Promise<HotelRecommendation[]>{
 if(!hasDatabase())return[];
 const limit=clamp(Math.round(input.limit||5),1,10),scope=input.scope==='stay'?'stay':'hotel';
 const sql=db();
 try{
  const [rows,unitRows]=await Promise.all([
   sql`select pr.id,pr.slug,pr.type,pr.name,pr.status,pr.partner_id,pr.description,pr.retail_price_vnd,pr.promo_price_vnd,pr.data,pr.updated_at
       from products pr
       left join partners pa on pa.id=pr.partner_id
       where pr.type in ('Khách sạn','Villa & Resort')
         and ((pr.partner_id is null and pr.status='published') or (pr.partner_id is not null and pr.status='approved' and pa.status='active'))
       order by pr.updated_at desc`,
   sql`select u.product_id,u.retail_price_vnd,u.data,u.status
       from product_units u
       join products pr on pr.id=u.product_id
       left join partners pa on pa.id=pr.partner_id
       where pr.type in ('Khách sạn','Villa & Resort')
         and u.status<>'hidden'
         and ((pr.partner_id is null and pr.status='published') or (pr.partner_id is not null and pr.status='approved' and pa.status='active'))`
  ]);
  const unitsByProduct=new Map<string,any[]>();
  for(const unit of unitRows as any[]){const key=String(unit.product_id);const list=unitsByProduct.get(key)||[];list.push(unit);unitsByProduct.set(key,list)}
  const candidates:Candidate[]=(rows as any[]).flatMap(row=>{
   if(scope==='hotel'&&String(row.type)!=='Khách sạn')return[];
   const raw=row.data&&typeof row.data==='object'?row.data:{};
   const safe=publicProductData(sanitizePublicValue(raw)) as Record<string,unknown>;
   const latitude=coordinate((raw as any).latitude,-90,90),longitude=coordinate((raw as any).longitude,-180,180);
   const priceVnd=productPrice(row,unitsByProduct.get(String(row.id))||[]);
   const place=text(safe.place),address=text(safe.address),rating=ratingValue(safe.rating),serviceStars=starValue(safe.serviceStars);
   return [{id:String(row.id),slug:text(row.slug),name:text(row.name),type:text(row.type),place,address,price:text(safe.price)||formattedPrice(priceVnd),priceVnd,cover:text(safe.cover),rating,serviceStars,latitude,longitude,distanceKm:null,matchScore:0,reasons:[],source:row.partner_id?'partner':'admin',normalizedPlace:normalized(`${place} ${address}`)} as Candidate];
  });
  const reference=input.slug?candidates.find(item=>item.slug===input.slug):undefined;
  const latitude=coordinate(input.latitude,-90,90)??reference?.latitude??null;
  const longitude=coordinate(input.longitude,-180,180)??reference?.longitude??null;
  const place=text(input.place)||reference?.place||reference?.address||'';
  const price=priceNumber(input.price)??reference?.priceVnd??null;
  const stars=starValue(input.serviceStars)??reference?.serviceStars??null;
  const referenceType=reference?.type||'';
  const ranked=candidates.filter(item=>!reference||item.id!==reference.id).map(item=>{
   const distance=latitude!==null&&longitude!==null&&item.latitude!==null&&item.longitude!==null?haversineKm(latitude,longitude,item.latitude,item.longitude):null;
   const next={...item,distanceKm:distance===null?null:Math.round(distance*10)/10};
   const context={place,price,stars,latitude,longitude,referenceType};
   next.matchScore=scoreCandidate(next,context);
   next.reasons=buildReasons(next,context);
   return next;
  }).filter(item=>{
   if(latitude!==null&&longitude!==null&&item.distanceKm!==null)return item.distanceKm<=50;
   if(place)return placeSimilarity(item.normalizedPlace,normalized(place))>.15;
   return true;
  }).sort((a,b)=>b.matchScore-a.matchScore||(a.distanceKm??9999)-(b.distanceKm??9999)||(b.rating??0)-(a.rating??0)||a.name.localeCompare(b.name,'vi'));
  return ranked.slice(0,limit).map(({normalizedPlace:_,...item})=>item);
 }catch(error){console.error('hotel_recommendations_failed',error);return[]}
}
