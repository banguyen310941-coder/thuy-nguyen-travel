import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';
import {syncAmbassadorRates} from '@/lib/server/ambassador-sync';

export const dynamic='force-dynamic';
export const runtime='nodejs';

function today(){return new Date().toISOString().slice(0,10)}
function validDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`))}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 if(requestBodyTooLarge(req,8192))return NextResponse.json({error:'Yêu cầu đồng bộ quá lớn.'},{status:413});
 const actor=await adminActor(req,'rates');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const parsed=await readBoundedJson(req,8192);if(parsed.tooLarge)return NextResponse.json({error:'Yêu cầu đồng bộ quá lớn.'},{status:413});
 const body=parsed.body as Record<string,unknown>,startDate=String(body.startDate||today()),days=Math.min(14,Math.max(1,Number(body.days)||7));
 const configuredFx=Number(process.env.AMBASSADOR_USD_VND||0),requestedFx=Number(body.fxRate||0),fxRate=requestedFx>20_000&&requestedFx<40_000?requestedFx:configuredFx>20_000&&configuredFx<40_000?configuredFx:26_060;
 if(!validDate(startDate))return NextResponse.json({error:'Ngày bắt đầu không hợp lệ.'},{status:400});
 try{
  const result=await syncAmbassadorRates(db(),{startDate,days,fxRate,actorId:actor.id});
  return NextResponse.json(result,{status:result.ok?200:207,headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){console.error('ambassador_sync_failed',error);return NextResponse.json({error:'Không thể đồng bộ Ambassador lúc này. Dữ liệu HappyGo hiện có vẫn được giữ nguyên.'},{status:502})}
}
