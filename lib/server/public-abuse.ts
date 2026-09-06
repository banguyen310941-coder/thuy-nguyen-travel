import {createHash} from 'node:crypto';
import type {NextRequest} from 'next/server';

function clientIp(req:NextRequest){
 return String(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',')[0].trim().slice(0,80);
}

export function publicRateKey(req:NextRequest,scope:string,identity=''){
 const raw=`${scope.trim().toLowerCase()}|${identity.trim().toLowerCase()}|${clientIp(req)}`;
 return createHash('sha256').update(raw).digest('hex');
}

export function requestBodyTooLarge(req:NextRequest,maxBytes=16_384){
 const raw=req.headers.get('content-length');
 if(!raw)return false;
 const size=Number(raw);
 return Number.isFinite(size)&&size>maxBytes;
}

export async function publicRateLimited(sql:any,key:string,action:string,maxHits:number,windowMinutes:number){
 const rows=await sql`
  select count(*)::int hits
  from audit_logs
  where entity_type='public_rate_limit'
   and entity_id=${key}
   and action=${action}
   and created_at>now()-(${windowMinutes}::int*interval '1 minute')`;
 return Number(rows[0]?.hits||0)>=maxHits;
}

export async function recordPublicAction(sql:any,key:string,action:string,scope:string){
 await sql`
  insert into audit_logs(action,entity_type,entity_id,after_data)
  values(${action},'public_rate_limit',${key},${JSON.stringify({scope})}::jsonb)`;
}
