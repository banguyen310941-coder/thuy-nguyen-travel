import {timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {isGoogleDriveConfigured} from '@/lib/server/google-drive';

function authorized(req:NextRequest){
 const expected=process.env.ADMIN_API_KEY||'',provided=req.headers.get('x-admin-key')||'';
 if(!expected||provided.length!==expected.length)return false;
 const a=Buffer.from(provided),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)
}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'no-store, max-age=0'}});
 return NextResponse.json({
  ok:true,
  database:Boolean(process.env.DATABASE_URL),
  email:Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),
  drive:isGoogleDriveConfigured(),
  siteUrl:process.env.NEXT_PUBLIC_SITE_URL||process.env.PUBLIC_SITE_URL||'https://happygo-travel.vercel.app',
  adminApiKey:Boolean(process.env.ADMIN_API_KEY)
 },{headers:{'Cache-Control':'no-store, max-age=0'}});
}
