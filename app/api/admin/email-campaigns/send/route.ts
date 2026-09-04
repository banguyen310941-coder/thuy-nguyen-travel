import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function htmlBody(input:{name:string;title:string;message:string;ctaLabel?:string;ctaUrl?:string}){
 const message=esc(input.message.replace(/{{\s*name\s*}}/gi,input.name)).replace(/\n/g,'<br/>');
 const cta=input.ctaLabel&&input.ctaUrl?`<p style="margin:24px 0"><a href="${esc(input.ctaUrl)}" style="background:#0d47a1;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">${esc(input.ctaLabel)}</a></p>`:'';
 return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#15324a;line-height:1.6"><div style="max-width:640px;margin:auto;border:1px solid #e4ebf0;border-radius:12px;overflow:hidden"><div style="background:#0d47a1;color:#fff;padding:20px"><b>HAPPYGO TRAVEL</b><div style="font-size:12px;margin-top:4px">HÀNH TRÌNH HẠNH PHÚC · KẾT NỐI YÊU THƯƠNG</div></div><div style="padding:24px"><h2>${esc(input.title)}</h2><p>${message}</p>${cta}<p style="font-size:13px;color:#617386">HappyGo Travel · Hotline 0969 973 949 · info@happygo.vn</p></div></div></body></html>`;
}
async function sendResend(to:string,subject:string,html:string){
 const key=process.env.RESEND_API_KEY;
 if(!key)throw new Error('RESEND_API_KEY_NOT_CONFIGURED');
 const from=process.env.EMAIL_FROM||'HappyGo Travel <booking@happygo.vn>';
 const replyTo=process.env.EMAIL_REPLY_TO||'info@happygo.vn';
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:replyTo,subject,html})});
 if(!r.ok)throw new Error(`RESEND_${r.status}_${await r.text()}`);
}
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL chưa được cấu hình.'},{status:503});
 const actor=await adminActor(req,'email');
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 if(!process.env.RESEND_API_KEY)return NextResponse.json({error:'RESEND_API_KEY chưa được cấu hình.'},{status:503});
 const body=await req.json().catch(()=>({}));
 const status=String(body.customerStatus||'');
 const limit=Math.max(1,Math.min(200,Number(body.limit)||100));
 const subject=String(body.subject||'').trim(),title=String(body.title||subject).trim(),message=String(body.message||'').trim();
 if(!subject||!message)return NextResponse.json({error:'Thiếu tiêu đề hoặc nội dung.'},{status:400});
 const sql=db();
 const rows=status?await sql`select name,email from customers where email is not null and email<>'' and marketing_consent=true and status=${status} order by updated_at desc limit ${limit}`:await sql`select name,email from customers where email is not null and email<>'' and marketing_consent=true order by updated_at desc limit ${limit}`;
 let sent=0,failed=0;
 for(const row of rows){try{await sendResend(String(row.email),subject,htmlBody({name:String(row.name||'Quý khách'),title,message,ctaLabel:String(body.ctaLabel||''),ctaUrl:String(body.ctaUrl||'')}));sent++}catch{failed++}}
 return NextResponse.json({ok:true,total:rows.length,sent,failed});
}
