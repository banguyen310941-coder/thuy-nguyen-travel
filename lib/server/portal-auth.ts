import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'crypto';
import type {NextRequest,NextResponse} from 'next/server';

export type PortalKind='partner'|'admin';
type SessionPayload={kind:PortalKind;id:string;exp:number};

function secret(){
  const value=process.env.AUTH_SECRET?.trim()||process.env.ADMIN_API_KEY?.trim();
  if(!value)throw new Error('AUTH_SECRET_OR_ADMIN_API_KEY_REQUIRED');
  return value;
}

function b64(value:string){return Buffer.from(value).toString('base64url')}
function unb64(value:string){return Buffer.from(value,'base64url').toString('utf8')}

export function hashPassword(password:string){
  const salt=randomBytes(16).toString('hex');
  const digest=scryptSync(password,salt,64).toString('hex');
  return `scrypt$${salt}$${digest}`;
}

export function verifyPassword(password:string,stored:string){
  const [kind,salt,digest]=String(stored||'').split('$');
  if(kind!=='scrypt'||!salt||!digest)return false;
  const actual=scryptSync(password,salt,64);
  const expected=Buffer.from(digest,'hex');
  return actual.length===expected.length&&timingSafeEqual(actual,expected);
}

export function createSession(kind:PortalKind,id:string,maxAgeSeconds=60*60*24*30){
  const payload:SessionPayload={kind,id,exp:Math.floor(Date.now()/1000)+maxAgeSeconds};
  const body=b64(JSON.stringify(payload));
  const sig=createHmac('sha256',secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function readSession(req:NextRequest,cookieName:string,kind:PortalKind){
  const token=req.cookies.get(cookieName)?.value||'';
  const [body,sig]=token.split('.');
  if(!body||!sig)return null;
  const expected=createHmac('sha256',secret()).update(body).digest('base64url');
  const a=Buffer.from(sig),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))return null;
  try{
    const payload=JSON.parse(unb64(body)) as SessionPayload;
    if(payload.kind!==kind||!payload.id||payload.exp<Math.floor(Date.now()/1000))return null;
    return payload;
  }catch{return null}
}

export function setSessionCookie(response:NextResponse,cookieName:string,kind:PortalKind,id:string){
  const maxAge=60*60*24*30;
  response.cookies.set(cookieName,createSession(kind,id,maxAge),{
    httpOnly:true,
    sameSite:'lax',
    secure:process.env.NODE_ENV==='production',
    path:'/',
    maxAge,
  });
}

export function clearSessionCookie(response:NextResponse,cookieName:string){
  response.cookies.set(cookieName,'',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0});
}
