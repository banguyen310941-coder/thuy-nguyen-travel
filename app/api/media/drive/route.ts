import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {getGoogleDriveAccessToken} from '@/lib/server/google-drive';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const DRIVE_ID=/^[A-Za-z0-9_-]{10,200}$/;

async function publicDriveImage(id:string){
 const urls=[
  `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`,
  `https://drive.google.com/uc?export=download&confirm=t&id=${encodeURIComponent(id)}`,
 ];
 for(const url of urls){
  try{
   const res=await fetch(url,{redirect:'follow',cache:'no-store',headers:{'User-Agent':'Mozilla/5.0 HappyGoImageProxy/1.0'}});
   const type=String(res.headers.get('content-type')||'').toLowerCase();
   if(res.ok&&type.startsWith('image/'))return res;
  }catch{}
 }
 return null;
}

async function authenticatedDriveImage(id:string){
 try{
  const token=await getGoogleDriveAccessToken();
  const res=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`,{
   headers:{Authorization:`Bearer ${token}`},
   cache:'no-store',
  });
  const type=String(res.headers.get('content-type')||'').toLowerCase();
  if(res.ok&&type.startsWith('image/'))return res;
 }catch(error){
  console.warn('public_drive_image_auth_fallback_unavailable',error instanceof Error?error.message:error);
 }
 return null;
}

export async function GET(req:NextRequest){
 const id=String(req.nextUrl.searchParams.get('id')||'').trim();
 if(!DRIVE_ID.test(id))return NextResponse.json({error:'Ảnh Google Drive không hợp lệ.'},{status:400});
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const sql=db(),needle=`%${id}%`;
  const rows=await sql`select (exists(select 1 from products where data::text like ${needle}) or exists(select 1 from product_units where data::text like ${needle})) as ok`;
  if(!rows[0]?.ok)return NextResponse.json({error:'Ảnh không thuộc dữ liệu sản phẩm HappyGo.'},{status:404});

  const upstream=await publicDriveImage(id)||await authenticatedDriveImage(id);
  if(!upstream)throw new Error('DRIVE_IMAGE_UNAVAILABLE');

  const contentType=String(upstream.headers.get('content-type')||'').toLowerCase();
  const headers=new Headers();
  headers.set('Content-Type',contentType);
  const length=upstream.headers.get('content-length');if(length)headers.set('Content-Length',length);
  headers.set('Cache-Control','public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  headers.set('X-Content-Type-Options','nosniff');
  return new Response(upstream.body,{status:200,headers});
 }catch(error){
  console.error('public_drive_image_failed',error);
  return NextResponse.json({error:'Không tải được ảnh Google Drive.'},{status:502,headers:{'Cache-Control':'no-store'}});
 }
}
