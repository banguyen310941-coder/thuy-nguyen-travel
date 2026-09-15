import {sendWebPush,type WebPushPayload,type WebPushSubscription} from '@/lib/server/web-push';

type Sql=any;
type PushRow={id:string;staff_id:string;endpoint:string;p256dh:string;auth:string};

export async function sendPushToStaff(sql:Sql,staffIds:string[],payload:WebPushPayload){
 const wanted=new Set(staffIds.filter(Boolean).map(String));if(!wanted.size)return{sent:0,failed:0};
 let rows:PushRow[]=[];
 try{rows=await sql`select id::text,staff_id::text,endpoint,p256dh,auth from admin_push_subscriptions where enabled=true`}catch(error){console.error('admin_push_subscriptions_read_failed',error);return{sent:0,failed:0}}
 const targets=rows.filter(row=>wanted.has(String(row.staff_id)));let sent=0,failed=0;
 for(const row of targets){
  try{
   const result=await sendWebPush({endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth}} as WebPushSubscription,payload);
   if(result.ok){sent++;await sql`update admin_push_subscriptions set last_success_at=now(),last_error=null,updated_at=now() where id=${row.id}`}
   else{failed++;const message=`HTTP ${result.status}${result.text?`: ${result.text.slice(0,300)}`:''}`;await sql`update admin_push_subscriptions set enabled=${!result.expired},last_error=${message},updated_at=now() where id=${row.id}`}
  }catch(error){failed++;const message=error instanceof Error?error.message:String(error);console.error('admin_web_push_send_failed',message);try{await sql`update admin_push_subscriptions set last_error=${message.slice(0,500)},updated_at=now() where id=${row.id}`}catch{}}
 }
 return{sent,failed};
}

export async function notifyNewBooking(sql:Sql,input:{bookingCode:string;customerName:string;product:string;assignedSalesId?:string|null}){
 const assigned=String(input.assignedSalesId||'');
 const rows=assigned?await sql`select id::text from staff where status='active' and (role in ('owner','admin') or id=${assigned})`:await sql`select id::text from staff where status='active' and role in ('owner','admin')`;
 const staffIds=rows.map((row:any)=>String(row.id));
 return sendPushToStaff(sql,staffIds,{title:`Khách mới · ${input.bookingCode}`,body:`${input.customerName} · ${input.product}`,url:'/admin/?module=Đơn%20đặt%20dịch%20vụ',tag:`booking-${input.bookingCode}`});
}

export async function notifyCrmAssignment(sql:Sql,input:{staffId:string;customerName:string;leadKind?:string}){
 const kind=input.leadKind==='tour'?'Tour':input.leadKind==='stay'?'Villa / Khách sạn':'khách mới';
 return sendPushToStaff(sql,[input.staffId],{title:'Khách CRM mới được giao',body:`${input.customerName} · ${kind}`,url:'/admin/?module=Khách%20hàng%20%2F%20CRM',tag:`crm-${input.staffId}-${Date.now()}`});
}
