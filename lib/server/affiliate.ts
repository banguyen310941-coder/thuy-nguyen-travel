import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import type {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

export const AFFILIATE_COOKIE='happygo_affiliate_ref';
export const AFFILIATE_VISITOR_COOKIE='happygo_affiliate_visitor';
export const AFFILIATE_SESSION_COOKIE='happygo_affiliate_auth';

type Attribution={affiliateId:string;villaId:string;exp:number};
export type AffiliateActor={id:string;userId:string;name:string;email:string;referralCode:string;status:string;commissionRate:number};

function secret(){const value=process.env.AUTH_SECRET?.trim()||process.env.ADMIN_API_KEY?.trim();if(!value)throw new Error('AUTH_SECRET_OR_ADMIN_API_KEY_REQUIRED');return value}
function equal(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}
function encode(value:Attribution){const body=Buffer.from(JSON.stringify(value)).toString('base64url');const sig=createHmac('sha256',secret()).update(body).digest('base64url');return `${body}.${sig}`}
function decode(token:string):Attribution|null{const [body,sig]=String(token||'').split('.');if(!body||!sig)return null;const expected=createHmac('sha256',secret()).update(body).digest('base64url');if(!equal(sig,expected))return null;try{const value=JSON.parse(Buffer.from(body,'base64url').toString('utf8')) as Attribution;if(!value.affiliateId||!value.villaId||value.exp<Date.now())return null;return value}catch{return null}}

export function readAffiliateAttribution(req:NextRequest){return decode(req.cookies.get(AFFILIATE_COOKIE)?.value||'')}
export function setAffiliateAttribution(response:NextResponse,affiliateId:string,villaId:string){const maxAge=60*60*24*30;response.cookies.set(AFFILIATE_COOKIE,encode({affiliateId,villaId,exp:Date.now()+maxAge*1000}),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge});return response}
export function ensureVisitor(response:NextResponse,req:NextRequest){const existing=req.cookies.get(AFFILIATE_VISITOR_COOKIE)?.value||'';const visitor=/^[0-9a-f-]{36}$/i.test(existing)?existing:randomUUID();if(!existing)response.cookies.set(AFFILIATE_VISITOR_COOKIE,visitor,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*365});return visitor}
export function publicBaseUrl(req?:NextRequest){const configured=process.env.NEXT_PUBLIC_SITE_URL?.trim();if(configured)return configured.replace(/\/$/,'');return req?.nextUrl.origin||'https://happygo.vn'}
export function maskPhone(value:unknown){const digits=String(value||'').replace(/\D/g,'');if(digits.length<7)return digits;return `${digits.slice(0,3)}***${digits.slice(-3)}`}

export async function affiliateActor(req:NextRequest):Promise<AffiliateActor|null>{const session=readSession(req,AFFILIATE_SESSION_COOKIE,'affiliate');if(!session)return null;const rows=await db()`select a.id,a.user_id,a.referral_code,a.status,a.commission_rate,s.name,s.email from affiliates a join staff s on s.id=a.user_id where a.user_id=${session.id} and a.status='active' and s.status='active' and s.role='affiliate' limit 1`;const row=rows[0];return row?{id:String(row.id),userId:String(row.user_id),name:String(row.name),email:String(row.email),referralCode:String(row.referral_code),status:String(row.status),commissionRate:Number(row.commission_rate||0)}:null}

export async function findTrackableProduct(sql:any,productId:string){const rows=await sql`select p.id,p.slug,p.name,p.type from products p where p.id=${productId} and ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) limit 1`;return rows[0]||null}
export async function findTrackableVilla(sql:any,villaId:string){return findTrackableProduct(sql,villaId)}

export async function captureAffiliateReferral(sql:any,req:NextRequest,bookingId:string,customerPhone:string){try{const attr=readAffiliateAttribution(req);if(!attr)return null;const affiliate=(await sql`select id from affiliates where id=${attr.affiliateId} and status='active' and exists(select 1 from staff s where s.id=affiliates.user_id and s.status='active' and s.role='affiliate') limit 1`)[0];if(!affiliate)return null;const product=await findTrackableProduct(sql,attr.villaId);if(!product)return null;const bookingMatch=(await sql`select 1 from booking_items bi where bi.booking_id=${bookingId} and lower(trim(bi.product_name_snapshot))=lower(trim(${String(product.name)})) limit 1`)[0];if(!bookingMatch)return null;const rows=await sql`insert into affiliate_referrals(affiliate_id,booking_id,villa_id,customer_phone,status) values(${attr.affiliateId},${bookingId},${attr.villaId},${customerPhone||null},'pending') on conflict(booking_id) do nothing returning id`;return rows[0]?String(rows[0].id):null}catch(error){console.error('affiliate_referral_capture_failed',error);return null}}

export async function settleAffiliateBooking(sql:any,bookingId:string){const rows=await sql`
 with target as (
  select ar.id,ar.affiliate_id,greatest(0,round((b.selling_total_vnd::numeric*a.commission_rate)/100)::bigint) as amount
  from affiliate_referrals ar join affiliates a on a.id=ar.affiliate_id join staff s on s.id=a.user_id join bookings b on b.id=ar.booking_id
  where ar.booking_id=${bookingId} and ar.status='pending' and a.status='active' and b.status='completed' and s.status='active' and s.role='affiliate'
  for update of ar
 ), credited as (
  update affiliate_referrals ar set commission_amount=t.amount,status='approved',credited_at=now(),updated_at=now()
  from target t where ar.id=t.id and ar.status='pending'
  returning ar.affiliate_id,ar.commission_amount
 ), wallet as (
  update affiliates a set total_commission=a.total_commission+c.commission_amount,balance=a.balance+c.commission_amount,updated_at=now()
  from credited c where a.id=c.affiliate_id returning a.id
 )
 select coalesce((select commission_amount from credited limit 1),0)::bigint as amount`;
 return Number(rows[0]?.amount||0)}
