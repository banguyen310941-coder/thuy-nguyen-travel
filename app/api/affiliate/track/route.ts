import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {ensureVisitor,findTrackableProduct,setAffiliateAttribution} from '@/lib/server/affiliate';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const codePattern=/^[A-Z0-9_-]{4,32}$/;
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const body=await req.json().catch(()=>({}));
  const code=String(body.code||'').trim().toUpperCase(),productId=String(body.productId||body.villaId||'').trim(),slug=String(body.slug||'').trim();
  if(!codePattern.test(code)||!uuid.test(productId)||!slug)return NextResponse.json({error:'Link CTV không hợp lệ.'},{status:400});
  const sql=db();
  const affiliate=(await sql`select a.id from affiliates a join staff s on s.id=a.user_id where a.referral_code=${code} and a.status='active' and s.status='active' and s.role='affiliate' limit 1`)[0];
  if(!affiliate)return NextResponse.json({error:'Mã CTV không tồn tại hoặc chưa hoạt động.'},{status:404});
  const product=await findTrackableProduct(sql,productId);
  if(!product)return NextResponse.json({error:'Sản phẩm không tồn tại hoặc chưa được xuất bản.'},{status:404});
  if(String(product.slug||'').toLowerCase()!==slug.toLowerCase())return NextResponse.json({error:'Sản phẩm và link CTV không khớp.'},{status:409});
  const response=NextResponse.json({ok:true,affiliateId:String(affiliate.id),productId:String(product.id),productType:String(product.type||'')},{headers:{'Cache-Control':'no-store, max-age=0'}});
  const visitor=ensureVisitor(response,req);
  await sql`insert into affiliate_clicks(affiliate_id,villa_id,visitor_key,clicked_on) values(${String(affiliate.id)},${productId},${visitor},current_date) on conflict(affiliate_id,villa_id,visitor_key,clicked_on) do nothing`;
  setAffiliateAttribution(response,String(affiliate.id),productId);
  return response;
 }catch(error){console.error('affiliate_track_failed',error);return NextResponse.json({error:'Không ghi nhận được link CTV.'},{status:500})}
}
