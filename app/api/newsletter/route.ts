import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

export const dynamic='force-dynamic';

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value:unknown){return String(value??'').trim().toLowerCase()}
function validEmail(email:string){return Boolean(email&&email.length<=254&&emailPattern.test(email))}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Hệ thống đăng ký ưu đãi chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({}));
 // Honeypot: automated form fillers commonly populate hidden website fields.
 if(String(body.website||'').trim())return NextResponse.json({ok:true,subscribed:true,idempotent:true});
 const email=normalizeEmail(body.email);
 if(!validEmail(email))return NextResponse.json({error:'Email chưa hợp lệ.'},{status:400});
 try{
  const sql=db(),subscribedAt=new Date().toISOString();
  const result=(await sql`with locked as (
    select pg_advisory_xact_lock(hashtext(${email}::text))
   ), latest as (
    select al.id,al.action from audit_logs al,locked
    where al.entity_type='newsletter_subscription' and al.entity_id=${email}
      and al.action in ('newsletter.subscribe','newsletter.unsubscribe')
    order by al.created_at desc,al.id desc limit 1
   ), inserted as (
    insert into audit_logs(action,entity_type,entity_id,after_data)
    select 'newsletter.subscribe','newsletter_subscription',${email},jsonb_build_object(
      'email',${email}::text,
      'source','footer',
      'consent',true,
      'subscribedAt',${subscribedAt}::text
    ) from locked
    where coalesce((select action from latest),'')<>'newsletter.subscribe'
    returning id
   )
   select coalesce((select id from latest where action='newsletter.subscribe' limit 1),(select id from inserted limit 1)) as id,
    coalesce((select action='newsletter.subscribe' from latest limit 1),false) as idempotent`)[0];
  if(!result?.id)throw new Error('NEWSLETTER_SUBSCRIBE_FAILED');
  return NextResponse.json({ok:true,subscribed:true,idempotent:Boolean(result.idempotent)});
 }catch(error){
  console.error('newsletter_subscribe_failed',error);
  return NextResponse.json({error:'Chưa thể ghi nhận email. Vui lòng thử lại.'},{status:500});
 }
}

export async function DELETE(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Hệ thống đăng ký ưu đãi chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({}));const email=normalizeEmail(body.email);
 if(!validEmail(email))return NextResponse.json({error:'Email chưa hợp lệ.'},{status:400});
 try{
  const sql=db(),unsubscribedAt=new Date().toISOString();
  const result=(await sql`with locked as (
    select pg_advisory_xact_lock(hashtext(${email}::text))
   ), latest as (
    select al.id,al.action from audit_logs al,locked
    where al.entity_type='newsletter_subscription' and al.entity_id=${email}
      and al.action in ('newsletter.subscribe','newsletter.unsubscribe')
    order by al.created_at desc,al.id desc limit 1
   ), inserted as (
    insert into audit_logs(action,entity_type,entity_id,after_data)
    select 'newsletter.unsubscribe','newsletter_subscription',${email},jsonb_build_object(
      'email',${email}::text,
      'source','public_unsubscribe',
      'consent',false,
      'unsubscribedAt',${unsubscribedAt}::text
    ) from locked
    where coalesce((select action from latest),'')='newsletter.subscribe'
    returning id
   )
   select exists(select 1 from inserted) as changed,
    coalesce((select action<>'newsletter.subscribe' from latest limit 1),true) as idempotent`)[0];
  return NextResponse.json({ok:true,subscribed:false,changed:Boolean(result?.changed),idempotent:Boolean(result?.idempotent)});
 }catch(error){
  console.error('newsletter_unsubscribe_failed',error);
  return NextResponse.json({error:'Chưa thể hủy đăng ký. Vui lòng thử lại.'},{status:500});
 }
}
