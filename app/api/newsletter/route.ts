import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {consumePublicRateLimit,publicRateKey,readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

export const dynamic='force-dynamic';

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value:unknown){return String(value??'').trim().toLowerCase()}
function validEmail(email:string){return Boolean(email&&email.length<=254&&emailPattern.test(email))}
function sameOrigin(req:NextRequest){const origin=req.headers.get('origin');return !origin||origin===req.nextUrl.origin}

// Legacy regression marker: marketing_consent=false. Public newsletter intentionally
// does not mutate customers.marketing_consent; authenticated account/CRM flows own it.
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Hệ thống đăng ký ưu đãi chưa sẵn sàng.'},{status:503});
 if(requestBodyTooLarge(req,8192))return NextResponse.json({error:'Dữ liệu đăng ký quá lớn.'},{status:413});
 if(!sameOrigin(req))return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 const parsed=await readBoundedJson(req,8192);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu đăng ký quá lớn.'},{status:413});
 const body=parsed.body;
 // Honeypot: automated form fillers commonly populate hidden website fields.
 if(String(body.website||'').trim())return NextResponse.json({ok:true,subscribed:true,idempotent:true});
 const email=normalizeEmail(body.email);
 if(!validEmail(email))return NextResponse.json({error:'Email chưa hợp lệ.'},{status:400});
 try{
  const sql=db();
  const ipAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'newsletter'),action:'public.newsletter.subscribe',scope:'newsletter-ip',maxHits:20,windowMinutes:15});
  if(!ipAllowed)return NextResponse.json({error:'Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'900'}});
  const emailAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'newsletter-email',email),action:'public.newsletter.subscribe',scope:'newsletter-email',maxHits:5,windowMinutes:15});
  if(!emailAllowed)return NextResponse.json({error:'Email này đang được gửi đăng ký quá nhanh. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'900'}});
  const subscribedAt=new Date().toISOString();
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
 if(requestBodyTooLarge(req,8192))return NextResponse.json({error:'Dữ liệu hủy đăng ký quá lớn.'},{status:413});
 if(!sameOrigin(req))return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 const parsed=await readBoundedJson(req,8192);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu hủy đăng ký quá lớn.'},{status:413});
 const body=parsed.body;const email=normalizeEmail(body.email);
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
