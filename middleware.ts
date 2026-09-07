import {NextRequest,NextResponse} from 'next/server';

const SAFE_METHODS=new Set(['GET','HEAD','OPTIONS']);
// SIGNED_WEBHOOKS legacy regression marker: signed routes are no longer trusted
// by pathname alone; the credential-header map below gates origin bypass.
const SIGNED_WEBHOOK_HEADERS:Record<string,string>={
 '/api/payments/webhook':'x-payment-webhook-secret',
 '/api/affiliate/booking-completed':'x-affiliate-webhook-secret',
};
const PRIVATE_API_PREFIXES=['/api/admin','/api/account','/api/partner','/api/affiliate','/api/reviews'];

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

function signedWebhookCandidate(req:NextRequest){
 const header=SIGNED_WEBHOOK_HEADERS[req.nextUrl.pathname];
 return Boolean(header&&req.headers.get(header));
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

function isPrivateApi(pathname:string){
 return PRIVATE_API_PREFIXES.some(prefix=>pathname===prefix||pathname.startsWith(`${prefix}/`));
}

function passThrough(req:NextRequest){
 const response=NextResponse.next();
 if(isPrivateApi(req.nextUrl.pathname)){
  // Authenticated/account payloads can contain personal or operational data.
  // Reviews are included because GET may expose the current account's eligibility,
  // own review and booking code alongside the public review list.
  response.headers.set('Cache-Control','private, no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma','no-cache');
 }
 return response;
}

export function middleware(req:NextRequest){
 const publicRedirect=normalizePublicUrl(req);if(publicRedirect)return publicRedirect;
 // External webhooks may bypass browser origin checks only when the expected
 // credential header is present. Header validity is still verified in the route.
 // Admin-session fallback on the affiliate completion route must remain same-origin.
 if(signedWebhookCandidate(req)||SAFE_METHODS.has(req.method)||sameOrigin(req))return passThrough(req);
 return NextResponse.json({error:'Cross-site request blocked.'},{status:403,headers:{'Cache-Control':'no-store'}});
}

export const config={
 matcher:[
  '/luu-tru',
  '/api/admin/:path*',
  '/api/account/:path*',
  '/api/partner/:path*',
  '/api/affiliate/:path*',
  '/api/reviews/:path*',
  '/api/bookings/:path*',
  '/api/payments/:path*',
 ],
};
