const FALLBACK_SITE_URL='https://happygo-travel.vercel.app';

function absoluteOrigin(value:unknown){
 const raw=String(value||'').trim();
 if(!raw)return'';
 try{
  const url=new URL(raw);
  if(url.protocol!=='https:'&&url.protocol!=='http:')return'';
  return url.origin;
 }catch{return''}
}

function vercelOrigin(value:unknown){
 const host=String(value||'').trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
 if(!host||/[\s/]/.test(host))return'';
 return `https://${host}`;
}

export function getSiteUrl(){
 const serverConfigured=absoluteOrigin(process.env.PUBLIC_SITE_URL);
 if(serverConfigured)return serverConfigured;
 const publicConfigured=absoluteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
 if(publicConfigured)return publicConfigured;
 const production=vercelOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
 if(production)return production;
 return FALLBACK_SITE_URL;
}
