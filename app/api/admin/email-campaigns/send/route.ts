import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function httpUrl(value:unknown){
 const text=String(value??'').trim().slice(0,2000);if(!text)return'';
 try{const url=new URL(text);return url.protocol==='https:'||url.protocol==='http:'?url.toString():''}catch{return''}
}
function htmlBody(input:{name:string;title:string;message:string;ctaLabel?:string;ctaUrl?:string;unsubscribeUrl:string}){
 const message=esc(input.message.replace(/{{\s*name\s*}}/gi,input.name)).replace(/\n/g,'<br/>');
 const cta=input.ctaLabel&&input.ctaUrl?`<p style="margin:24px 0"><a href="${esc(input.ctaUrl)}" style="background:#0d47a1;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">${esc(input.ctaLabel)}</a></p>`:'';
 return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#15324a;line-height:1.6"><div style="max-width:640px;margin:auto;border:1px solid #e4ebf0;border-radius:12px;overflow:hidden"><div style="background:#0d47a1;color:#fff;padding:20px"><b>HAPPYGO TRAVEL</b><div style="font-size:12px;margin-top:4px">HÀNH TRÌNH HẠNH PHÚC · KẾT NỐI YÊU THƯƠNG</div></div><div style="padding:24px"><h2>${esc(input.title)}</h2><p>${message}</p>${cta}<p style="font-size:13px;color:#617386">HappyGo Travel · Hotline 0969 973 949 · info@happygo.vn</p><p style="font-size:12px;color:#7b8794">Không muốn nhận email marketing? <a href="${esc(input.unsubscribeUrl)}">Hủy đăng ký tại đây</a>.</p></div></div></body></html>`;
}
async function sendResend(to:string,subject:string,html:string){
 const key=process.env.RESEND_API_KEY;
 if(!key)throw new Error('RESEND_API_KEY_NOT_CONFIGURED');
 const from=process.env.EMAIL_FROM||'HappyGo Travel <booking@happygo.vn>';
 const replyTo=process.env.EMAIL_REPLY_TO||'info@happygo.vn';
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:replyTo,subject,html})});
 if(!r.ok)throw new Error(`RESEND_${r.status}`);
}
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL chưa được cấu hình.'},{status:503});
 const actor=await adminActor(req,'email');
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 if(!process.env.RESEND_API_KEY)return NextResponse.json({error:'RESEND_API_KEY chưa được cấu hình.'},{status:503});
 if(requestBodyTooLarge(req,131_072))return NextResponse.json({error:'Dữ liệu chiến dịch email quá lớn.'},{status:413});
 const parsed=await readBoundedJson(req,131_072);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu chiến dịch email quá lớn.'},{status:413});
 const body=parsed.body;
 const status=String(body.customerStatus||'').trim().slice(0,50);
 const limit=Math.max(1,Math.min(200,Number(body.limit)||100));
 const subject=String(body.subject||'').trim().slice(0,250),title=String(body.title||subject).trim().slice(0,300),message=String(body.message||'').trim().slice(0,50_000);
 const ctaLabel=String(body.ctaLabel||'').trim().slice(0,120),rawCtaUrl=String(body.ctaUrl||'').trim(),ctaUrl=httpUrl(rawCtaUrl);
 if(!subject||!message)return NextResponse.json({error:'Thiếu tiêu đề hoặc nội dung.'},{status:400});
 if(rawCtaUrl&&!ctaUrl)return NextResponse.json({error:'Liên kết CTA phải là URL http/https hợp lệ.'},{status:400});
 const sql=db();
 const rows=status
  ?await sql`select name,email from customers where email is not null and email<>'' and marketing_consent=true and status=${status} order by updated_at desc limit ${limit}`
  :await sql`with latest_newsletter as (
    select distinct on(entity_id) entity_id as email,action,created_at
    from audit_logs
    where entity_type='newsletter_subscription' and action in ('newsletter.subscribe','newsletter.unsubscribe')
    order by entity_id,created_at desc,id desc
   ), audience as (
    select name,email,updated_at from customers where email is not null and email<>'' and marketing_consent=true
    union all
    select 'Quý khách'::text as name,n.email,n.created_at as updated_at
    from latest_newsletter n
    where n.action='newsletter.subscribe'
      and not exists(select 1 from customers c where c.email is not null and lower(c.email)=lower(n.email))
   ), deduped as (
    select distinct on(lower(email)) name,email,updated_at from audience
    order by lower(email),updated_at desc
   )
   select name,email from deduped order by updated_at desc limit ${limit}`;
 const siteBase=(process.env.NEXT_PUBLIC_SITE_URL||process.env.PUBLIC_SITE_URL||'https://happygo-travel.vercel.app').replace(/\/$/,'');
 let sent=0,failed=0;
 for(const row of rows){const recipient=String(row.email||'').trim();if(!recipient)continue;try{const unsubscribeUrl=`${siteBase}/huy-dang-ky?email=${encodeURIComponent(recipient)}`;await sendResend(recipient,subject,htmlBody({name:String(row.name||'Quý khách'),title,message,ctaLabel,ctaUrl,unsubscribeUrl}));sent++}catch(error){console.error('email_campaign_recipient_failed',{recipient,status:error instanceof Error?error.message:'unknown'});failed++}}
 return NextResponse.json({ok:true,total:rows.length,sent,failed});
}
