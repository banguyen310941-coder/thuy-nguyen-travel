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
 const empty={} as Record<string,unknown>;
 if(requestBodyTooLarge(req,maxBytes))return{tooLarge:true,body:empty};
 if(!req.body)return{tooLarge:false,body:empty};

 const reader=req.body.getReader();
 const chunks:Uint8Array[]=[];
 let totalBytes=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   if(!value)continue;
   totalBytes+=value.byteLength;
   if(totalBytes>maxBytes){
    await reader.cancel().catch(()=>undefined);
    return{tooLarge:true,body:empty};
   }
   chunks.push(value);
  }
 }finally{
  reader.releaseLock();
 }

 if(totalBytes===0)return{tooLarge:false,body:empty};
 const bytes=new Uint8Array(totalBytes);
 let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 const text=new TextDecoder().decode(bytes);
 if(!text.trim())return{tooLarge:false,body:empty};
 try{
  const parsed=JSON.parse(text);
  return{tooLarge:false,body:parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed as Record<string,unknown>:empty};
 }catch{return{tooLarge:false,body:empty}}
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
