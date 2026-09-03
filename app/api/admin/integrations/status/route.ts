import {NextRequest,NextResponse} from 'next/server';

function authorized(req:NextRequest){const expected=process.env.ADMIN_API_KEY||'';return Boolean(expected)&&(req.headers.get('x-admin-key')||'')===expected}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 return NextResponse.json({
  ok:true,
  database:Boolean(process.env.DATABASE_URL),
  email:Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),
  drive:Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_DRIVE_REFRESH_TOKEN&&process.env.GOOGLE_DRIVE_FOLDER_ID),
  siteUrl:process.env.NEXT_PUBLIC_SITE_URL||process.env.PUBLIC_SITE_URL||'https://happygo-travel.vercel.app',
  adminApiKey:Boolean(process.env.ADMIN_API_KEY)
 });
}
