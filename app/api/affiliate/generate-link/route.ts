import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor,findTrackableProduct,publicBaseUrl} from '@/lib/server/affiliate';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const productId=String(req.nextUrl.searchParams.get('product_id')||req.nextUrl.searchParams.get('villa_id')||'');
  if(!uuid.test(productId))return NextResponse.json({error:'Sản phẩm không hợp lệ.'},{status:400});
  const product=await findTrackableProduct(db(),productId);
  if(!product)return NextResponse.json({error:'Sản phẩm không tồn tại hoặc chưa được xuất bản.'},{status:404});
  const link=`${publicBaseUrl(req)}/san-pham/${encodeURIComponent(String(product.slug))}?ref=${encodeURIComponent(actor.referralCode)}&product_id=${encodeURIComponent(productId)}`;
  const item={id:String(product.id),name:String(product.name),slug:String(product.slug),type:String(product.type||'')};
  return NextResponse.json({ok:true,product:item,villa:item,link},{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){console.error('affiliate_generate_link_failed',error);return NextResponse.json({error:'Không tạo được link CTV.'},{status:500})}
}
