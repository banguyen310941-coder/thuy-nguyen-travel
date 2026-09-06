import {NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {sanitizePublicValue} from '@/lib/server/public-site-state';
import {publicProductData} from '@/lib/server/public-site-state';

function publicProduct(row:any){
  const raw=row.data&&typeof row.data==='object'?row.data:{};
  const sanitized=sanitizePublicValue(raw);
  const data=publicProductData(sanitized);
  const sanitizedSummary=sanitizePublicValue(row.description||data.summary||'');
  return {
    ...data,
    id:String(row.id),
    partnerId:String(row.partner_id),
    partnerName:String(row.partner_name||''),
    slug:String(row.slug||''),
    type:String(row.type||''),
    name:String(row.name||''),
    status:'approved',
    summary:String(sanitizedSummary||''),
    price:String(data.price||row.promo_price_vnd||row.retail_price_vnd||''),
    updatedAt:String(row.updated_at||''),
    source:'partner'
  };
}

export async function GET(){
  if(!hasDatabase())return NextResponse.json({ok:true,products:[]});
  const sql=db();
  try{
    const rows=await sql`select pr.*,p.name as partner_name from products pr join partners p on p.id=pr.partner_id where pr.status='approved' and p.status='active' order by pr.updated_at desc limit 500`;
    return NextResponse.json({ok:true,products:rows.map(publicProduct)},{headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=300'}});
  }catch(error){console.error('partner_catalog_failed',error);return NextResponse.json({ok:true,products:[]},{status:200})}
}
