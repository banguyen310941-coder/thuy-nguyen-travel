import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const funds=new Set(['cash','bank','wallet']);
function elevated(role:string){return role==='owner'||role==='admin'}
function allowed(role:string){return elevated(role)||role==='accounting'}
function voucher(type:string){const d=new Date(),stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;return`${type==='income'?'PT':'PC'}-${stamp}-${String(Date.now()).slice(-6)}`}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'ledger');if(!actor||!allowed(actor.role))return NextResponse.json({error:'Unauthorized'},{status:401});const sql=db();
 try{
  const entries=await sql`select ae.*,s.name as created_by_name,vs.name as voided_by_name from accounting_entries ae left join staff s on s.id=ae.created_by_staff_id left join staff vs on vs.id=ae.voided_by_staff_id order by ae.entry_date desc,ae.created_at desc limit 3000`;
  const bal=await sql`select * from accounting_balances where id=1`;const b=bal[0]||{};
  const active=entries.filter((x:any)=>!x.voided_at);const totals={income:active.filter((x:any)=>x.entry_type==='income').reduce((s:number,x:any)=>s+Number(x.amount_vnd||0),0),expense:active.filter((x:any)=>x.entry_type==='expense').reduce((s:number,x:any)=>s+Number(x.amount_vnd||0),0)};
  return NextResponse.json({ok:true,entries:entries.map((e:any)=>({id:String(e.id),voucherNo:String(e.voucher_no),type:String(e.entry_type),date:String(e.entry_date).slice(0,10),category:String(e.category),description:String(e.description),counterparty:String(e.counterparty||''),fund:String(e.fund),amount:Number(e.amount_vnd||0),documentRef:String(e.document_ref||''),note:String(e.note||''),source:String(e.source||'manual'),sourceId:String(e.source_id||''),createdBy:String(e.created_by_name||''),createdAt:String(e.created_at),voidedAt:e.voided_at?String(e.voided_at):'',voidedBy:String(e.voided_by_name||''),voidReason:String(e.void_reason||'')})),balances:{cash:Number(b.cash_vnd||0),bank:Number(b.bank_vnd||0),wallet:Number(b.wallet_vnd||0),updatedAt:b.updated_at?String(b.updated_at):''},totals,capabilities:{manageBalances:elevated(actor.role),manual:true,void:elevated(actor.role)||actor.role==='accounting'}})
 }catch(error){console.error('accounting_get_failed',error);return NextResponse.json({error:'Không đọc được sổ kế toán production.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'ledger');if(!actor||!allowed(actor.role))return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json().catch(()=>({}));const action=String(body.action||'');const sql=db();
 try{
  if(action==='manual'){
   const type=String(body.type||''),date=String(body.date||new Date().toISOString().slice(0,10)),category=String(body.category||'').trim(),description=String(body.description||'').trim(),counterparty=String(body.counterparty||'').trim(),fund=String(body.fund||'bank'),amount=Math.round(Number(body.amount)||0),documentRef=String(body.documentRef||'').trim(),note=String(body.note||'').trim();if(!['income','expense'].includes(type)||!funds.has(fund)||!category||!description||amount<=0)return NextResponse.json({error:'Thông tin bút toán chưa hợp lệ.'},{status:400});const no=voucher(type);const rows=await sql`insert into accounting_entries(voucher_no,entry_type,entry_date,category,description,counterparty,fund,amount_vnd,document_ref,note,source,created_by_staff_id) values(${no},${type},${date},${category},${description},${counterparty||null},${fund},${amount},${documentRef||null},${note||null},'manual',${actor.id}) returning *`;await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'accounting.entry.create','accounting_entry',${String(rows[0].id)},${JSON.stringify(rows[0])}::jsonb)`;return NextResponse.json({ok:true,voucherNo:no});
  }
  if(action==='balances'){
   if(!elevated(actor.role))return NextResponse.json({error:'Chỉ Chủ tài khoản/Quản trị được cập nhật số dư đầu kỳ.'},{status:403});const cash=Math.round(Number(body.cash)||0),bank=Math.round(Number(body.bank)||0),wallet=Math.round(Number(body.wallet)||0);await sql`insert into accounting_balances(id,cash_vnd,bank_vnd,wallet_vnd,updated_by_staff_id,updated_at) values(1,${cash},${bank},${wallet},${actor.id},now()) on conflict(id) do update set cash_vnd=excluded.cash_vnd,bank_vnd=excluded.bank_vnd,wallet_vnd=excluded.wallet_vnd,updated_by_staff_id=excluded.updated_by_staff_id,updated_at=now()`;await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'accounting.balances.update','accounting_balances','1',${JSON.stringify({cash,bank,wallet})}::jsonb)`;return NextResponse.json({ok:true});
  }
  if(action==='void'){
   const id=String(body.id||''),reason=String(body.reason||'').trim();if(!uuid.test(id)||!reason)return NextResponse.json({error:'Cần bút toán và lý do hủy.'},{status:400});const before=await sql`select * from accounting_entries where id=${id} limit 1`;if(!before.length)return NextResponse.json({error:'Không tìm thấy bút toán.'},{status:404});if(before[0].voided_at)return NextResponse.json({error:'Bút toán đã được hủy trước đó.'},{status:409});await sql`update accounting_entries set voided_at=now(),voided_by_staff_id=${actor.id},void_reason=${reason} where id=${id}`;await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data) values(${actor.id},'accounting.entry.void','accounting_entry',${id},${JSON.stringify(before[0])}::jsonb)`;return NextResponse.json({ok:true});
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});
 }catch(error){console.error('accounting_post_failed',error);return NextResponse.json({error:'Không thể cập nhật kế toán production.'},{status:500})}
}
