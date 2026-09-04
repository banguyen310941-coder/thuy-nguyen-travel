import {NextRequest,NextResponse} from 'next/server';

const SAFE_METHODS=new Set(['GET','HEAD','OPTIONS']);

function hostSet(req:NextRequest){
 const values=[req.headers.get('x-forwarded-host'),req.headers.get('host'),req.nextUrl.host].filter(Boolean).flatMap(value=>String(value).split(','));
 return new Set(values.map(value=>value.trim().toLowerCase()).filter(Boolean));
}

function sameOrigin(req:NextRequest){
 const origin=req.headers.get('origin');
 // Native clients, cron jobs and signed server-to-server webhooks normally do not send Origin.
 if(!origin)return true;
 try{return hostSet(req).has(new URL(origin).host.toLowerCase())}catch{return false}
}

export function middleware(req:NextRequest){
 if(SAFE_METHODS.has(req.method)||sameOrigin(req))return NextResponse.next();
 return NextResponse.json({error:'Cross-site request blocked.'},{status:403,headers:{'Cache-Control':'no-store'}});
}

export const config={
 matcher:[
  '/api/admin/:path*',
  '/api/account/:path*',
  '/api/partner/:path*',
  '/api/affiliate/:path*',
  '/api/bookings/:path*',
  '/api/payments/:path*',
 ],
};
