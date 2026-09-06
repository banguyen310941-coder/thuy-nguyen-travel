import {NextRequest,NextResponse} from 'next/server';

const SAFE_METHODS=new Set(['GET','HEAD','OPTIONS']);
const SIGNED_WEBHOOKS=new Set(['/api/payments/webhook','/api/affiliate/booking-completed']);

function hostSet(req:NextRequest){
 const values=[req.headers.get('x-forwarded-host'),req.headers.get('host'),req.nextUrl.host].filter(Boolean).flatMap(value=>String(value).split(','));
 return new Set(values.map(value=>value.trim().toLowerCase()).filter(Boolean));
}

function sameOrigin(req:NextRequest){
 const fetchSite=String(req.headers.get('sec-fetch-site')||'').toLowerCase();
 if(fetchSite==='cross-site')return false;
 const origin=req.headers.get('origin');
 if(!origin)return true;
 try{return hostSet(req).has(new URL(origin).host.toLowerCase())}catch{return false}
}

function normalizePublicUrl(req:NextRequest){
 if(req.method!=='GET'||req.nextUrl.pathname!=='/luu-tru')return null;
 const type=(req.nextUrl.searchParams.get('type')||'').toLowerCase();
 if(type!=='villa'&&type!=='hotel')return null;
 const url=req.nextUrl.clone();
 url.pathname=type==='villa'?'/villa-resort':'/khach-san';
 url.searchParams.delete('type');
 return NextResponse.redirect(url,308);
}

export function middleware(req:NextRequest){
 const publicRedirect=normalizePublicUrl(req);if(publicRedirect)return publicRedirect;
 if(SIGNED_WEBHOOKS.has(req.nextUrl.pathname)||SAFE_METHODS.has(req.method)||sameOrigin(req))return NextResponse.next();
 return NextResponse.json({error:'Cross-site request blocked.'},{status:403,headers:{'Cache-Control':'no-store'}});
}

export const config={
 matcher:[
  '/luu-tru',
  '/api/admin/:path*',
  '/api/account/:path*',
  '/api/partner/:path*',
  '/api/affiliate/:path*',
  '/api/bookings/:path*',
  '/api/payments/:path*',
 ],
};
