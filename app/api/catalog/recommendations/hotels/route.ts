import {NextRequest,NextResponse} from 'next/server';
import {getHotelRecommendations,type HotelRecommendationScope} from '@/lib/server/hotel-recommendations';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const finite=(value:string|null)=>{if(value===null||value.trim()==='')return null;const parsed=Number(value.replace(',','.'));return Number.isFinite(parsed)?parsed:null};
const limitValue=(value:string|null)=>{const parsed=finite(value);return parsed===null?5:Math.max(1,Math.min(10,Math.round(parsed)))};

export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;
 const scope:HotelRecommendationScope=params.get('scope')==='stay'?'stay':'hotel';
 const recommendations=await getHotelRecommendations({
  slug:String(params.get('slug')||'').trim().slice(0,180),
  latitude:finite(params.get('lat')),
  longitude:finite(params.get('lng')),
  place:String(params.get('place')||'').trim().slice(0,180),
  price:finite(params.get('price')),
  serviceStars:finite(params.get('stars')),
  limit:limitValue(params.get('limit')),
  scope
 });
 return NextResponse.json({
  ok:true,
  scope,
  count:recommendations.length,
  recommendations
 },{headers:{'Cache-Control':'private, no-store, max-age=0'}});
}
