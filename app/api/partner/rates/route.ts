import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

const COOKIE='happygo_partner_auth';
const money=(v:unknown)=>{const n=Number(String(v??'').replace(/\D/g,''));return Number.isFinite(n)?Math.max(0,n):0};

export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const session=readSession(req,COOKIE,'partner');if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=db();
  try{
    const rows=await sql`select id,data from products where partner_id=${session.id}`;
    const rates=rows.flatMap((row:any)=>Array.isArray(row.data?.partnerPricing)?row.data.partnerPricing:[]);
    return NextResponse.json({ok:true,rates});
  }catch(error){console.error('partner_rates_get_failed',error);return NextResponse.json({error:'Không đọc được bảng giá.'},{status:500})}
}

export async function PUT(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const session=readSession(req,COOKIE,'partner');if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));const rates=Array.isArray(body.rates)?body.rates:[];
  const grouped=new Map<string,any[]>();for(const rate of rates){const id=String(rate?.productId||'');if(!id)continue;grouped.set(id,[...(grouped.get(id)||[]),rate])}
  const sql=db();
  try{
    for(const [productId,list] of grouped){
      const base=list.find((x:any)=>!x.unitId)||list[0]||{};
      const payload=JSON.stringify({partnerPricing:list});
      await sql`update products set data=data||${payload}::jsonb,net_price_vnd=${money(base.agencyPrice)||null},retail_price_vnd=${money(base.retailPrice)},promo_price_vnd=${money(base.promoPrice)||null},updated_at=now() where id=${productId} and partner_id=${session.id}`;
    }
    return NextResponse.json({ok:true,count:grouped.size});
  }catch(error){console.error('partner_rates_put_failed',error);return NextResponse.json({error:'Không thể đồng bộ bảng giá.'},{status:500})}
}
