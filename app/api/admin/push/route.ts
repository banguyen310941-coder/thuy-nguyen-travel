import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';
import {sendPushToStaff} from '@/lib/server/admin-push';
import {webPushPublicKey} from '@/lib/server/web-push';

function text(value:unknown,max:number){return String(value||'').trim().slice(0,max)}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{return NextResponse.json({ok:true,publicKey:webPushPublicKey()},{headers:{'Cache-Control':'no-store'}})}catch(error){console.error('admin_push_key_failed',error);return NextResponse.json({error:'Thông báo nền chưa sẵn sàng.'},{status:503})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 if(requestBodyTooLarge(req,16_384))return NextResponse.json({error:'Dữ liệu thông báo quá lớn.'},{status:413});
 const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const parsed=await readBoundedJson(req,16_384);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu thông báo quá lớn.'},{status:413});const body=parsed.body as any,action=String(body.action||'subscribe'),sql=db();
 try{
  if(action==='test'){
   const result=await sendPushToStaff(sql,[actor.id],{title:'HappyGo đã bật thông báo',body:'Booking và khách CRM mới sẽ hiện ngoài màn hình khi ứng dụng chạy nền.',url:'/admin/',tag:'happygo-push-test'});
   return NextResponse.json({ok:true,...result});
  }
  if(action==='unsubscribe'){
   const endpoint=text(body.endpoint,4096);if(!endpoint)return NextResponse.json({error:'Thiếu endpoint.'},{status:400});
   await sql`update admin_push_subscriptions set enabled=false,updated_at=now() where staff_id=${actor.id} and endpoint=${endpoint}`;return NextResponse.json({ok:true});
  }
  const subscription=body.subscription||{},endpoint=text(subscription.endpoint,4096),p256dh=text(subscription.keys?.p256dh,512),auth=text(subscription.keys?.auth,256);if(!endpoint.startsWith('https://')||!p256dh||!auth)return NextResponse.json({error:'Push subscription không hợp lệ.'},{status:400});
  const userAgent=text(req.headers.get('user-agent'),1000);
  await sql`insert into admin_push_subscriptions(staff_id,endpoint,p256dh,auth,user_agent,enabled,updated_at) values(${actor.id},${endpoint},${p256dh},${auth},${userAgent||null},true,now()) on conflict(endpoint) do update set staff_id=excluded.staff_id,p256dh=excluded.p256dh,auth=excluded.auth,user_agent=excluded.user_agent,enabled=true,last_error=null,updated_at=now()`;
  return NextResponse.json({ok:true});
 }catch(error){console.error('admin_push_save_failed',error);return NextResponse.json({error:'Không thể cấu hình thông báo nền.'},{status:500})}
}
