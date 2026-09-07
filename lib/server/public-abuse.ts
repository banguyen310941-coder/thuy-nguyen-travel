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

export async function readBoundedJson(req:NextRequest,maxBytes=16_384){
 if(requestBodyTooLarge(req,maxBytes))return{tooLarge:true,body:{} as Record<string,unknown>};
 const text=await req.text();
 if(Buffer.byteLength(text,'utf8')>maxBytes)return{tooLarge:true,body:{} as Record<string,unknown>};
 if(!text.trim())return{tooLarge:false,body:{} as Record<string,unknown>};
 try{
  const parsed=JSON.parse(text);
  return{tooLarge:false,body:parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed as Record<string,unknown>:{} as Record<string,unknown>};
 }catch{return{tooLarge:false,body:{} as Record<string,unknown>}}
}

export async function consumePublicRateLimit(sql:any,{key,action,scope,maxHits,windowMinutes}:{key:string;action:string;scope:string;maxHits:number;windowMinutes:number}){
 const rows=await sql`
  with locked as (
   select pg_advisory_xact_lock(hashtext(${key}::text))
  ), recent as (
   select count(*)::int hits
   from audit_logs,locked
   where entity_type='public_rate_limit'
    and entity_id=${key}
    and action=${action}
    and created_at>now()-(${windowMinutes}::int*interval '1 minute')
  ), inserted as (
   insert into audit_logs(action,entity_type,entity_id,after_data)
   select ${action},'public_rate_limit',${key},${JSON.stringify({scope})}::jsonb
   from recent
   where hits<${maxHits}::int
   returning id
  )
  select recent.hits,exists(select 1 from inserted) allowed from recent`;
 return Boolean(rows[0]?.allowed);
}
