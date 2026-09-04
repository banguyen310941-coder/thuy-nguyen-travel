import {createHash} from 'node:crypto';
import type {NextRequest} from 'next/server';

const MAX_FAILURES=8;

function clientIp(req:NextRequest){return String(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',')[0].trim().slice(0,80)}

export function authAttemptKey(req:NextRequest,scope:string,email:string){
 const raw=`${scope.trim().toLowerCase()}|${email.trim().toLowerCase()}|${clientIp(req)}`;
 return createHash('sha256').update(raw).digest('hex');
}

export async function loginTemporarilyBlocked(sql:any,key:string){
 const rows=await sql`
  select count(*)::int failures
  from audit_logs
  where entity_type='auth_attempt' and entity_id=${key} and action='auth.login.failed'
   and created_at>now()-interval '15 minutes'
   and created_at>coalesce((select max(created_at) from audit_logs where entity_type='auth_attempt' and entity_id=${key} and action='auth.login.success'),to_timestamp(0))`;
 return Number(rows[0]?.failures||0)>=MAX_FAILURES;
}

export async function recordLoginAttempt(sql:any,key:string,scope:string,success:boolean){
 await sql`insert into audit_logs(action,entity_type,entity_id,after_data) values(${success?'auth.login.success':'auth.login.failed'},'auth_attempt',${key},${JSON.stringify({scope})}::jsonb)`;
}
