import {randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const types=new Set(['note','call','zalo','email','meeting','other']);
const elevated=(actor:{role:string;permissions:string[]})=>actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*');
const intParam=(value:string|null,fallback:number,min:number,max:number)=>{const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,Math.trunc(parsed))):fallback};

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'affiliates');
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const sql=db(),all=elevated(actor),affiliateId=String(req.nextUrl.searchParams.get('affiliateId')||'');
  if(affiliateId&&!uuid.test(affiliateId))return NextResponse.json({error:'CTV không hợp lệ.'},{status:400});
  const limit=intParam(req.nextUrl.searchParams.get('limit'),affiliateId?50:200,1,affiliateId?200:500);
  const offset=intParam(req.nextUrl.searchParams.get('offset'),0,0,50000);
  const affiliates=all
   ?await sql`select a.id,s.name,s.email,a.phone,a.referral_code,a.status,a.sales_owner_id,owner.name as sales_owner_name from affiliates a join staff s on s.id=a.user_id left join staff owner on owner.id=a.sales_owner_id order by s.name`
   :await sql`select a.id,s.name,s.email,a.phone,a.referral_code,a.status,a.sales_owner_id,owner.name as sales_owner_name from affiliates a join staff s on s.id=a.user_id left join staff owner on owner.id=a.sales_owner_id where a.sales_owner_id=${actor.id} order by s.name`;
  const allowedIds=affiliates.map((a:any)=>String(a.id));
  if(affiliateId&&!allowedIds.includes(affiliateId))return NextResponse.json({error:'CTV không thuộc phạm vi phụ trách của bạn.'},{status:403});
  const rawFollowups=affiliateId
   ?await sql`select f.id,f.affiliate_id,f.staff_id,f.type,f.content,f.next_follow_up_at,f.created_at,s.name as staff_name from affiliate_followups f left join staff s on s.id=f.staff_id where f.affiliate_id=${affiliateId} order by f.created_at desc limit ${limit+1} offset ${offset}`
   :all
    ?await sql`select f.id,f.affiliate_id,f.staff_id,f.type,f.content,f.next_follow_up_at,f.created_at,s.name as staff_name from affiliate_followups f left join staff s on s.id=f.staff_id order by f.created_at desc limit ${limit+1} offset ${offset}`
    :await sql`select f.id,f.affiliate_id,f.staff_id,f.type,f.content,f.next_follow_up_at,f.created_at,s.name as staff_name from affiliate_followups f join affiliates a on a.id=f.affiliate_id left join staff s on s.id=f.staff_id where a.sales_owner_id=${actor.id} order by f.created_at desc limit ${limit+1} offset ${offset}`;
  const hasMore=rawFollowups.length>limit;
  const followups=rawFollowups.slice(0,limit);
  const latest=all
   ?await sql`select distinct on (f.affiliate_id) f.affiliate_id,f.type,f.content,f.next_follow_up_at,f.created_at,s.name as staff_name from affiliate_followups f left join staff s on s.id=f.staff_id order by f.affiliate_id,f.created_at desc`
   :await sql`select distinct on (f.affiliate_id) f.affiliate_id,f.type,f.content,f.next_follow_up_at,f.created_at,s.name as staff_name from affiliate_followups f join affiliates a on a.id=f.affiliate_id left join staff s on s.id=f.staff_id where a.sales_owner_id=${actor.id} order by f.affiliate_id,f.created_at desc`;
  return NextResponse.json({ok:true,scope:all?'all':'assigned',currentStaffId:actor.id,affiliates:affiliates.map((a:any)=>({id:String(a.id),name:String(a.name),email:String(a.email),phone:String(a.phone||''),referralCode:String(a.referral_code),status:String(a.status),salesOwnerId:a.sales_owner_id?String(a.sales_owner_id):'',salesOwnerName:String(a.sales_owner_name||'Chưa phân công')})),followups:followups.map((f:any)=>({id:String(f.id),affiliateId:String(f.affiliate_id),staffId:f.staff_id?String(f.staff_id):'',staffName:String(f.staff_name||'Nhân viên'),type:String(f.type),content:String(f.content),nextFollowUpAt:f.next_follow_up_at?String(f.next_follow_up_at):'',createdAt:String(f.created_at)})),latest:latest.map((f:any)=>({affiliateId:String(f.affiliate_id),staffName:String(f.staff_name||'Nhân viên'),type:String(f.type),content:String(f.content),nextFollowUpAt:f.next_follow_up_at?String(f.next_follow_up_at):'',createdAt:String(f.created_at)})),pagination:{limit,offset,hasMore,nextOffset:hasMore?offset+limit:null}});
 }catch(error){console.error('affiliate_followups_get_failed',error);return NextResponse.json({error:'Không đọc được lịch chăm sóc CTV.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'affiliates');
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({})),affiliateId=String(body.affiliateId||''),type=types.has(String(body.type))?String(body.type):'note',content=String(body.content||'').trim(),rawNext=String(body.nextFollowUpAt||'').trim(),requestId=String(body.requestId||'').trim()||randomUUID();
 if(!uuid.test(affiliateId))return NextResponse.json({error:'CTV không hợp lệ.'},{status:400});
 if(!uuid.test(requestId))return NextResponse.json({error:'Mã yêu cầu chăm sóc không hợp lệ.'},{status:400});
 if(content.length<2||content.length>4000)return NextResponse.json({error:'Nội dung chăm sóc cần từ 2 đến 4.000 ký tự.'},{status:400});
 const next=rawNext?new Date(rawNext):null;if(next&&Number.isNaN(next.getTime()))return NextResponse.json({error:'Lịch follow-up không hợp lệ.'},{status:400});
 try{
  const sql=db(),all=elevated(actor);
  const affiliate=(await sql`select id,sales_owner_id from affiliates where id=${affiliateId} limit 1`)[0];
  if(!affiliate)return NextResponse.json({error:'Không tìm thấy CTV.'},{status:404});
  if(!all&&String(affiliate.sales_owner_id||'')!==actor.id)return NextResponse.json({error:'CTV không thuộc phạm vi phụ trách của bạn.'},{status:403});
  const nextIso=next?next.toISOString():'';
  const result=(await sql`with lock_request as (
    select pg_advisory_xact_lock(hashtext(${requestId}))
   ), existing as (
    select al.after_data->>'followupId' as followup_id
    from audit_logs al,lock_request
    where al.action='affiliate.followup.create' and al.after_data->>'requestId'=${requestId}
    order by al.created_at asc limit 1
   ), inserted as (
    insert into affiliate_followups(affiliate_id,staff_id,type,content,next_follow_up_at)
    select ${affiliateId},${actor.id},${type},${content},${next?next.toISOString():null} from lock_request
    where not exists(select 1 from existing)
    returning id,created_at
   ), logged as (
    insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data)
    select ${actor.id},'affiliate.followup.create','affiliate',${affiliateId},jsonb_build_object('followupId',i.id::text,'type',${type},'nextFollowUpAt',${nextIso},'requestId',${requestId})
    from inserted i returning id
   )
   select coalesce((select followup_id from existing),(select id::text from inserted)) as followup_id,
    exists(select 1 from existing) as idempotent,
    (select created_at from inserted limit 1) as created_at`)[0];
  if(!result?.followup_id)throw new Error('AFFILIATE_FOLLOWUP_INSERT_FAILED');
  return NextResponse.json({ok:true,id:String(result.followup_id),createdAt:result.created_at?String(result.created_at):'',idempotent:Boolean(result.idempotent),requestId});
 }catch(error){console.error('affiliate_followups_post_failed',error);return NextResponse.json({error:'Không thể lưu chăm sóc CTV.'},{status:500})}
}
