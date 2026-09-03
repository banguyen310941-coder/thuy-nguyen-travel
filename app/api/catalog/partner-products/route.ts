import {NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

function publicProduct(row:any){
  const raw=row.data&&typeof row.data==='object'?row.data:{};
  const {partnerPricing:_partnerPricing,agencyPrice:_agencyPrice,netPrice:_netPrice,apiToken:_apiToken,...data}=raw;
  return {...data,id:String(row.id),partnerId:String(row.partner_id),partnerName:row.partner_name||'',slug:row.slug,type:row.type,name:row.name,status:'approved',summary:row.description||data.summary||'',price:data.price||String(row.promo_price_vnd||row.retail_price_vnd||''),retailPriceVnd:Number(row.retail_price_vnd||0),promoPriceVnd:row.promo_price_vnd==null?null:Number(row.promo_price_vnd),updatedAt:row.updated_at,source:'partner'};
}

export async function GET(){
  if(!hasDatabase())return NextResponse.json({ok:true,products:[]});
  const sql=db();
  try{
    const rows=await sql`select pr.*,p.name as partner_name from products pr join partners p on p.id=pr.partner_id where pr.status='approved' and p.status='active' order by pr.updated_at desc limit 500`;
    return NextResponse.json({ok:true,products:rows.map(publicProduct)},{headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=300'}});
  }catch(error){console.error('partner_catalog_failed',error);return NextResponse.json({ok:true,products:[]},{status:200})}
}
