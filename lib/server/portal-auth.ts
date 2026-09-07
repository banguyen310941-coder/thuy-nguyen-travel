import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'crypto';
import type {NextRequest,NextResponse} from 'next/server';

export type PortalKind='partner'|'admin'|'customer'|'affiliate';
type SessionPayload={kind:PortalKind;id:string;exp:number;iat?:number};

const HOUR=60*60;
const DAY=24*HOUR;
const MAX_SESSION_TOKEN_LENGTH=2048;
const MAX_SESSION_BODY_LENGTH=1536;
const SESSION_SIGNATURE_LENGTH=43;
const BASE64URL=/^[A-Za-z0-9_-]+$/;

function secret(){
  const value=process.env.AUTH_SECRET?.trim()||process.env.ADMIN_API_KEY?.trim();
  if(!value)throw new Error('AUTH_SECRET_OR_ADMIN_API_KEY_REQUIRED');
  return value;
}

function b64(value:string){return Buffer.from(value).toString('base64url')}
function unb64(value:string){return Buffer.from(value,'base64url').toString('utf8')}

export function sessionMaxAge(kind:PortalKind){
  if(kind==='admin')return 12*HOUR;
  if(kind==='partner'||kind==='affiliate')return 7*DAY;
  return 30*DAY;
}

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

export function createSession(kind:PortalKind,id:string,maxAgeSeconds=sessionMaxAge(kind)){
  const now=Math.floor(Date.now()/1000);
  const payload:SessionPayload={kind,id,iat:now,exp:now+maxAgeSeconds};
  const body=b64(JSON.stringify(payload));
  const sig=createHmac('sha256',secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function readSession(req:NextRequest,cookieName:string,kind:PortalKind){
  const token=req.cookies.get(cookieName)?.value||'';
  if(!token||token.length>MAX_SESSION_TOKEN_LENGTH)return null;
  const parts=token.split('.');
  if(parts.length!==2)return null;
  const [body,sig]=parts;
  if(!body||!sig||body.length>MAX_SESSION_BODY_LENGTH||sig.length!==SESSION_SIGNATURE_LENGTH)return null;
  if(!BASE64URL.test(body)||!BASE64URL.test(sig))return null;
  const expected=createHmac('sha256',secret()).update(body).digest('base64url');
  const a=Buffer.from(sig),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))return null;
  try{
    const payload=JSON.parse(unb64(body)) as SessionPayload;
    const now=Math.floor(Date.now()/1000),maxAge=sessionMaxAge(kind);
    if(payload.kind!==kind||!payload.id||!Number.isFinite(payload.exp)||payload.exp<now)return null;
    if(payload.iat!==undefined){
      if(!Number.isFinite(payload.iat)||payload.iat>now+60)return null;
      if(payload.exp-payload.iat>maxAge+60||now-payload.iat>maxAge+60)return null;
    }else if(kind==='admin'&&payload.exp-now>maxAge+60){
      // Legacy Admin tokens were valid for 30 days. Reject those that still exceed
      // the new 12-hour ceiling so privileged sessions are rotated after deploy.
      return null;
    }
    return payload;
  }catch{return null}
}

export function setSessionCookie(response:NextResponse,cookieName:string,kind:PortalKind,id:string){
  const maxAge=sessionMaxAge(kind);
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
