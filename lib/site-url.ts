const FALLBACK_SITE_URL='https://happygo.vn';

export function getSiteUrl(){
  const configured=String(process.env.NEXT_PUBLIC_SITE_URL||'').trim().replace(/\/$/,'');
  if(configured)return configured;

  const vercelUrl=String(process.env.VERCEL_URL||'').trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
  if(vercelUrl)return `https://${vercelUrl}`;

  return FALLBACK_SITE_URL;
}
